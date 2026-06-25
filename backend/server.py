from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# -------------------- Setup --------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ACCESS_TOKEN_MIN = 60 * 24

app = FastAPI(title="SM Paint Industries API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("smpaints")


# -------------------- Helpers --------------------
def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# -------------------- Models --------------------
ProductLine = Literal["vespa", "galleria", "general"]
Finish = Literal["matte", "satin", "gloss", "lustrous", "textured", "transparent"]


class ProductIn(BaseModel):
    name: str
    line: ProductLine = "vespa"
    category: str  # enamel, primer, distemper, varnish, industrial, etc.
    finish: Finish = "gloss"
    short_description: str = ""
    description: str = ""
    features: List[str] = Field(default_factory=list)
    coverage: str = ""
    coverage_detail: str = ""  # e.g. "15-22 m²/lt/coat (20-25 μ DFT)"
    drying_time: str = ""
    recoat_time: str = ""
    application: str = ""  # Brush, Spray, Roller
    pack_sizes: List[str] = Field(default_factory=list)
    thinner: str = ""
    recommended_primer: str = ""
    available_shades: str = ""
    price: Optional[float] = None
    image_url: str = ""
    featured: bool = False
    sort_order: int = 0


class ProductOut(ProductIn):
    id: str
    created_at: str


class ColorIn(BaseModel):
    name: str
    hex: str
    family: str  # whites, beiges, browns, greys, blues, greens, violets, pastels, yellows, peaches, oranges, reds, pinks
    collection: str = "Whites, Beiges, Browns & Greys"
    code: str = ""


class ColorOut(ColorIn):
    id: str
    created_at: str


class GalleryIn(BaseModel):
    title: str
    image_url: str
    space: str = ""
    description: str = ""
    color_ids: List[str] = Field(default_factory=list)


class GalleryOut(GalleryIn):
    id: str
    created_at: str


class InquiryIn(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    city: str = ""
    message: str = ""
    product_interest: str = ""


class InquiryOut(InquiryIn):
    id: str
    status: Literal["new", "in_progress", "closed"] = "new"
    created_at: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


# -------------------- Auth Routes --------------------
@api.post("/auth/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    safe_user = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/logout")
async def logout():
    return {"ok": True}


# -------------------- Public Routes --------------------
@api.get("/")
async def root():
    return {"name": "SM Paint Industries API", "status": "ok"}


@api.get("/products", response_model=List[ProductOut])
async def list_products(
    line: Optional[str] = None,
    category: Optional[str] = None,
    finish: Optional[str] = None,
    featured: Optional[bool] = None,
):
    q = {}
    if line and line != "all": q["line"] = line
    if category: q["category"] = category
    if finish: q["finish"] = finish
    if featured is not None: q["featured"] = featured
    docs = await db.products.find(q, {"_id": 0}).sort([("sort_order", 1), ("name", 1)]).to_list(500)
    return docs


@api.get("/products/{pid}", response_model=ProductOut)
async def get_product(pid: str):
    doc = await db.products.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    return doc


@api.get("/colors", response_model=List[ColorOut])
async def list_colors(family: Optional[str] = None, collection: Optional[str] = None):
    q = {}
    if family: q["family"] = family
    if collection: q["collection"] = collection
    docs = await db.colors.find(q, {"_id": 0}).to_list(2000)
    return docs


@api.get("/gallery", response_model=List[GalleryOut])
async def list_gallery():
    docs = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api.post("/inquiries", response_model=InquiryOut)
async def create_inquiry(body: InquiryIn):
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "status": "new", "created_at": now_utc()})
    await db.inquiries.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/site/config")
async def site_config():
    return {
        "brand": "SM Paint Industries",
        "tagline": "Confidence of Quality & Durability | Since 1982",
        "headline": "Industrial Coatings. Engineered to Endure.",
        "whatsapp_number": os.environ.get("WHATSAPP_NUMBER", ""),
        "logo_url": "https://customer-assets.emergentagent.com/job_color-explorer-6/artifacts/iu3nu4xy_sm%20paints%20final%20logo%20more.png",
        "lines": [
            {
                "key": "vespa",
                "name": "Vespa",
                "tagline": "Reliable. Workhorse coatings.",
                "description": "Vespa delivers reliable, workhorse coatings for everyday industrial and decorative needs — trusted on construction sites, factories, and homes across India.",
            },
            {
                "key": "galleria",
                "name": "Galleria",
                "tagline": "Premium. Engineered for refinement.",
                "description": "Galleria is our premium line — engineered for superior coverage, enhanced performance, and a refined finish. Built with high-grade pigments and binders for specification-grade projects.",
            },
        ],
    }


# -------------------- Admin Routes --------------------
admin = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])


@admin.post("/products", response_model=ProductOut)
async def admin_create_product(body: ProductIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_utc()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@admin.patch("/products/{pid}", response_model=ProductOut)
async def admin_update_product(pid: str, body: ProductIn):
    res = await db.products.update_one({"id": pid}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    doc = await db.products.find_one({"id": pid}, {"_id": 0})
    return doc


@admin.delete("/products/{pid}")
async def admin_delete_product(pid: str):
    res = await db.products.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


@admin.post("/colors", response_model=ColorOut)
async def admin_create_color(body: ColorIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_utc()
    await db.colors.insert_one(doc)
    doc.pop("_id", None)
    return doc


@admin.patch("/colors/{cid}", response_model=ColorOut)
async def admin_update_color(cid: str, body: ColorIn):
    res = await db.colors.update_one({"id": cid}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Color not found")
    return await db.colors.find_one({"id": cid}, {"_id": 0})


@admin.delete("/colors/{cid}")
async def admin_delete_color(cid: str):
    res = await db.colors.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Color not found")
    return {"ok": True}


@admin.post("/gallery", response_model=GalleryOut)
async def admin_create_gallery(body: GalleryIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_utc()
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc


@admin.patch("/gallery/{gid}", response_model=GalleryOut)
async def admin_update_gallery(gid: str, body: GalleryIn):
    res = await db.gallery.update_one({"id": gid}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Gallery item not found")
    return await db.gallery.find_one({"id": gid}, {"_id": 0})


@admin.delete("/gallery/{gid}")
async def admin_delete_gallery(gid: str):
    res = await db.gallery.delete_one({"id": gid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Gallery item not found")
    return {"ok": True}


@admin.get("/inquiries", response_model=List[InquiryOut])
async def admin_list_inquiries():
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


class InquiryPatch(BaseModel):
    status: Literal["new", "in_progress", "closed"]


@admin.patch("/inquiries/{iid}", response_model=InquiryOut)
async def admin_update_inquiry(iid: str, body: InquiryPatch):
    res = await db.inquiries.update_one({"id": iid}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Inquiry not found")
    return await db.inquiries.find_one({"id": iid}, {"_id": 0})


@admin.delete("/inquiries/{iid}")
async def admin_delete_inquiry(iid: str):
    res = await db.inquiries.delete_one({"id": iid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Inquiry not found")
    return {"ok": True}


api.include_router(admin)
app.include_router(api)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------- Seed Data --------------------
SEED_PRODUCTS = [
    # ===== VESPA LINE =====
    {
        "name": "Vespa Super Synthetic Enamel",
        "line": "vespa",
        "category": "enamel",
        "finish": "gloss",
        "short_description": "High-gloss multi-purpose synthetic resin enamel for wood, metal & plaster.",
        "description": "A high-gloss, fast-drying multi-purpose enamel based on synthetic resin. Provides excellent coverage and a long-lasting finish on wood, metal, and other surfaces for interiors and exteriors. Ready-to-brush, thin with MTO as needed.",
        "features": ["High-gloss synthetic resin base", "Multi-surface: wood, metal, plaster", "Interior & exterior use", "Excellent flow and levelling", "Wide colour range"],
        "coverage": "12-15 m²/lt/coat",
        "coverage_detail": "12-15 m²/lt/coat at 20-25 μ DFT  |  6-10 m²/lt/coat at 35-40 μ DFT",
        "drying_time": "Surface dry: 30 min",
        "recoat_time": "6 to 8 hrs",
        "application": "Brush, Spray, Roller",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "Metal: Red Oxide Primer  |  Wood: White or Pink Primer",
        "available_shades": "As per shade card",
        "image_url": "https://images.pexels.com/photos/1887946/pexels-photo-1887946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "featured": True,
        "sort_order": 1,
    },
    {
        "name": "Vespa Primer Surfacer",
        "line": "vespa",
        "category": "primer",
        "finish": "matte",
        "short_description": "Corrosion-resistant undercoat & filler for metal and wood.",
        "description": "Vespa Primer Surfacer is a corrosion-resistant undercoat and filler for ferrous & non-ferrous metals and wood. Available in White (wood) and Red Oxide (metal). Covers minor surface imperfections while providing a robust adhesion base.",
        "features": ["Excellent corrosion resistance", "Dual-purpose: undercoat + filler", "Good adhesion on bare metal & wood", "Suitable for corrosive environments"],
        "coverage": "8-10 m²/lt for 2 coats",
        "coverage_detail": "8-10 m²/lt / 2 coats at 25-30 μ DFT",
        "drying_time": "Recoat: 1 to 1.5 hrs",
        "recoat_time": "Hard dry: 18 hrs",
        "application": "Brush, Spray @ 40-50 psi",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "—",
        "available_shades": "White, Pink, Red Oxide",
        "image_url": "https://images.pexels.com/photos/6563575/pexels-photo-6563575.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "featured": False,
        "sort_order": 2,
    },
    {
        "name": "Vespa Aluminium Paint",
        "line": "vespa",
        "category": "industrial",
        "finish": "lustrous",
        "short_description": "Brilliant metallic lustre with corrosion & heat reflective protection.",
        "description": "A two-pack aluminium paint (paste + medium) offering brilliant lustre, excellent durability, and outstanding corrosion resistance. High reflectivity reduces internal temperatures — ideal for steel structures, wagons, oil tanks, and non-ferrous metals.",
        "features": ["Brilliant metallic lustre", "Excellent corrosion resistance", "High heat reflectivity", "Dual-pack system", "Fast drying", "Steel structures & tanks"],
        "coverage": "13-14 m²/lt/coat",
        "coverage_detail": "13-14 m²/lt/coat at 25-30 μ DFT",
        "drying_time": "Recoat: 2 hrs",
        "recoat_time": "Hard dry: 18 hrs",
        "application": "Brush, Spray @ 40-50 psi",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "Red Oxide Primer",
        "available_shades": "Aluminium",
        "image_url": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxwYWludCUyMGJydXNoJTIwdGV4dHVyZSUyMHN3YXRjaCUyMGNvbG9yZnVsfGVufDB8fHx8MTc4MjM3NDY1MHww&ixlib=rb-4.1.0&q=85",
        "featured": False,
        "sort_order": 3,
    },
    {
        "name": "Vespa Oil Bound Distemper",
        "line": "vespa",
        "category": "distemper",
        "finish": "matte",
        "short_description": "Acrylic-based washable interior distemper in luxurious pastels.",
        "description": "An acrylic-based, washable oil-bound distemper for plastered, concrete, and asbestos interior surfaces. Smooth matt finish, scrub-resistant after curing, available in luxurious pastel shades.",
        "features": ["Washable (after 7 days)", "Scrub-resistant after curing", "Luxurious pastel shade range", "Low odour", "Easy to maintain"],
        "coverage": "12-15 m²/kg/coat",
        "coverage_detail": "12-15 m²/kg/coat",
        "drying_time": "Surface dry: 30 min",
        "recoat_time": "Recoat: 4 hrs",
        "application": "Brush, Spray, Roller",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "Water (400 ml per 1 kg)",
        "recommended_primer": "Solvent-based (new walls)  |  Water-based (old walls)",
        "available_shades": "Luxurious pastel range — see shade card",
        "image_url": "https://images.unsplash.com/photo-1759774313632-854207c22ec1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cmlvdXMlMjBsaXZpbmclMjByb29tJTIwcGFpbnRlZCUyMHdhbGwlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwwfHx8fDE3ODIzNzQ2NTB8MA&ixlib=rb-4.1.0&q=85",
        "featured": False,
        "sort_order": 4,
    },
    # ===== GALLERIA LINE =====
    {
        "name": "Galleria Premium Enamel",
        "line": "galleria",
        "category": "enamel",
        "finish": "gloss",
        "short_description": "Mirror-like premium enamel with high opacity and outstanding durability.",
        "description": "A superior quality quick-drying glossy paint based on high-grade alkyd resin for indoors and outdoors, on wood and metal. Engineered with high-opacity, fade-resistant pigments delivering mirror-like gloss and outstanding durability — a hardwearing protective coating of exceptional merit.",
        "features": ["Mirror-like gloss finish", "Water resistant", "Excellent brushability", "Outstanding flow & levelling", "Withstands sunlight, dust & weather", "Maximum gloss retention", "Resistant to mild corrosive chemicals", "Wide stylish colour range"],
        "coverage": "15-22 m²/lt/coat",
        "coverage_detail": "15-22 m²/lt/coat at 20-25 μ DFT  |  10-12 m²/lt/coat at 35-40 μ DFT",
        "drying_time": "Surface dry: 30 min",
        "recoat_time": "White: 8 hrs  |  Shades: 6 hrs",
        "application": "Brush, Spray, Roller",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "Metal: Red Oxide Primer  |  Wood: White or Pink Primer",
        "available_shades": "As per shade card",
        "image_url": "https://images.unsplash.com/photo-1759774313632-854207c22ec1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cmlvdXMlMjBsaXZpbmclMjByb29tJTIwcGFpbnRlZCUyMHdhbGwlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwwfHx8fDE3ODIzNzQ2NTB8MA&ixlib=rb-4.1.0&q=85",
        "featured": True,
        "sort_order": 5,
    },
    {
        "name": "Galleria Premium Primer Surfacer",
        "line": "galleria",
        "category": "primer",
        "finish": "matte",
        "short_description": "Double coverage premium primer with superior binder system.",
        "description": "Galleria Premium Primer Surfacer delivers everything Vespa's primer offers — corrosion resistance, excellent adhesion, surface filling — with double the coverage. Formulated with high-grade binders for superior holdout and inter-coat adhesion. Ideal for premium specification jobs.",
        "features": ["Double coverage: 16-20 m²/lt", "Superior binder system", "Excellent holdout and adhesion", "Corrosion-resistant formula", "Ideal for premium specification jobs"],
        "coverage": "16-20 m²/lt for 2 coats",
        "coverage_detail": "16-20 m²/lt / 2 coats at 25-30 μ DFT",
        "drying_time": "Recoat: 1 to 1.5 hrs",
        "recoat_time": "Hard dry: 18 hrs",
        "application": "Brush, Spray @ 40-50 psi",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "—",
        "available_shades": "White, Pink, Red Oxide",
        "image_url": "https://images.pexels.com/photos/6563575/pexels-photo-6563575.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "featured": False,
        "sort_order": 6,
    },
    {
        "name": "Galleria Clear Varnish",
        "line": "galleria",
        "category": "varnish",
        "finish": "transparent",
        "short_description": "Crystal-clear premium varnish enhancing natural wood grain.",
        "description": "Premium crystal-clear, high-gloss varnish based on high-quality alkyd resin. Provides a durable, transparent protective film that enhances the natural grain of wood and adds lustre to metal and decorative surfaces. Excellent water resistance and UV stability for interior and exterior use.",
        "features": ["Crystal clear high-gloss film", "Enhances natural wood grain", "Excellent water resistance", "UV stable for exterior use", "Brush, spray or wipe-on application", "Interior & exterior use"],
        "coverage": "14-16 m²/lt/coat",
        "coverage_detail": "14-16 m²/lt/coat at 20-25 μ DFT",
        "drying_time": "Surface dry: 30 min",
        "recoat_time": "6 to 8 hrs",
        "application": "Brush, Spray, Wipe-on (2-3 coats for optimum gloss)",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "—",
        "available_shades": "Clear / Transparent",
        "image_url": "https://images.pexels.com/photos/19899076/pexels-photo-19899076.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "featured": False,
        "sort_order": 7,
    },
    {
        "name": "Galleria Hammertone Paint",
        "line": "galleria",
        "category": "specialty",
        "finish": "textured",
        "short_description": "Decorative hammered-texture finish for metal surfaces.",
        "description": "A distinctive decorative finish paint that creates a beautiful textured hammered effect on metal surfaces. Hides surface imperfections, resists corrosion, and provides a hard-wearing attractive coat. Ideal for fabrications, machinery, garden furniture, railings, gates, and industrial equipment.",
        "features": ["Unique decorative hammer texture", "Hides surface imperfections", "Corrosion resistant", "Hard-wearing durable film", "Available in multiple metallic shades", "Spray for best texture result"],
        "coverage": "8-10 m²/lt/coat",
        "coverage_detail": "8-10 m²/lt/coat at 25-30 μ DFT",
        "drying_time": "Surface dry: 30 min",
        "recoat_time": "6 to 8 hrs",
        "application": "Spray (preferred for texture). Do not thin > 5-10%.",
        "pack_sizes": ["500 ml", "1 lt", "4 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil) — max 5-10%",
        "recommended_primer": "Red Oxide Primer or self-priming on well-prepared surfaces",
        "available_shades": "Silver, Black, Red, Blue, Green, Golden Bronze",
        "image_url": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxwYWludCUyMGJydXNoJTIwdGV4dHVyZSUyMHN3YXRjaCUyMGNvbG9yZnVsfGVufDB8fHx8MTc4MjM3NDY1MHww&ixlib=rb-4.1.0&q=85",
        "featured": True,
        "sort_order": 8,
    },
    {
        "name": "Galleria Aluminium Paint",
        "line": "galleria",
        "category": "industrial",
        "finish": "lustrous",
        "short_description": "Premium metallic aluminium with superior finish & adhesion.",
        "description": "Brilliant lustre, excellent durability, and outstanding corrosion resistance. High reflectivity reduces internal temperatures — formulated under the Galleria premium standard for superior finish and adhesion. Two-pack system (paste + medium), fast drying with excellent hardness, flexibility, and water resistance.",
        "features": ["Premium metallic lustre", "Superior corrosion resistance", "High heat reflectivity", "Dual-pack system", "Fast drying premium formula", "Galleria exclusive product"],
        "coverage": "13-14 m²/lt/coat",
        "coverage_detail": "13-14 m²/lt/coat at 25-30 μ DFT",
        "drying_time": "Recoat: 2 hrs",
        "recoat_time": "Hard dry: 18 hrs",
        "application": "Brush, Spray @ 40-50 psi",
        "pack_sizes": ["500 ml", "1 lt", "4 lt", "20 lt"],
        "thinner": "M.T.O (Mineral Turpentine Oil)",
        "recommended_primer": "Red Oxide Primer",
        "available_shades": "Aluminium",
        "image_url": "https://images.unsplash.com/photo-1560184897-ae75f418493e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGV4dGVyaW9yJTIwcGFpbnRpbmclMjBiZWF1dGlmdWwlMjBob21lfGVufDB8fHx8MTc4MjM3NDY1MXww&ixlib=rb-4.1.0&q=85",
        "featured": False,
        "sort_order": 9,
    },
]


# Full shade card extracted from "SM PAINT SHADE CARD FINAL.pdf"
SEED_COLORS = [
    # Whites, Beiges, Browns & Greys
    {"name": "White Silk", "code": "L171", "hex": "#F7F5F0", "family": "whites", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Chloe Diamond", "code": "8785", "hex": "#F5F0F0", "family": "whites", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Sonnet", "code": "L146", "hex": "#F9F2EA", "family": "whites", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Morning Glory", "code": "0765", "hex": "#FDF3E7", "family": "whites", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Icy Peak", "code": "L109", "hex": "#FDF8F3", "family": "whites", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Bonewhite", "code": "0964", "hex": "#F5EFE9", "family": "whites", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "French Cream", "code": "25YY 83/103", "hex": "#F9EBD7", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Pebble White", "code": "L136", "hex": "#F4E4CB", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Sugared Nut", "code": "L126", "hex": "#F0DBB9", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Enlighten-N", "code": "4148", "hex": "#F2E9DE", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Tusk Tusk", "code": "30YY 79/070", "hex": "#F2E8DC", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Confetti", "code": "8300", "hex": "#F2E9E2", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Winter Morn", "code": "7228", "hex": "#E0E9F2", "family": "pastels", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Ski Adventure", "code": "02BB 81/030", "hex": "#E5EFF5", "family": "pastels", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Romance", "code": "10BB 83/020", "hex": "#E5EBEF", "family": "pastels", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Magnolia", "code": "0387", "hex": "#FBDDC4", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Dawn Dew-N", "code": "L190", "hex": "#F6E8D6", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Meadow Lark", "code": "8499", "hex": "#F1E2CD", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Cashmere-N", "code": "2119", "hex": "#F5E9E0", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Water Chestnut", "code": "30YY 62/127", "hex": "#E6DBCB", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Barley Beige", "code": "30YY 68/024", "hex": "#EBDBC3", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Cane Beige", "code": "9563", "hex": "#F0E1D4", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Baked Biscuit", "code": "8579", "hex": "#F0E2D1", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Light Biscuit-N", "code": "0318", "hex": "#F0E2CD", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Sound of Music", "code": "8756", "hex": "#DCD3CB", "family": "greys", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Apricot-N", "code": "0501", "hex": "#F8DEBC", "family": "beiges", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Tahoe's Stone", "code": "00YY 62/144", "hex": "#D1D1BE", "family": "greys", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Grey Flannel", "code": "8331", "hex": "#D3CBC4", "family": "greys", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Virtual Reality", "code": "30BB 72/040", "hex": "#B5C8D6", "family": "blues", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Aluminium", "code": "8337", "hex": "#C2C6C9", "family": "greys", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Smoke-N", "code": "0616", "hex": "#B4B7B9", "family": "greys", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Brandy", "code": "4115", "hex": "#9E8C7D", "family": "browns", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Brownstone", "code": "4234", "hex": "#7D7065", "family": "browns", "collection": "Whites, Beiges, Browns & Greys"},
    {"name": "Old Brick", "code": "8613", "hex": "#9C6256", "family": "browns", "collection": "Whites, Beiges, Browns & Greys"},
    # Yellows, Peaches, Oranges, Reds & Pinks
    {"name": "Candle Light", "code": "7900", "hex": "#F5F0D6", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Blush", "code": "80YR 75/057", "hex": "#FBE6E2", "family": "pinks", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Mid Cream", "code": "0358", "hex": "#F3DFA6", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Solemn Yellow", "code": "7882", "hex": "#FBDCA3", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Marigold", "code": "7986", "hex": "#FAC48F", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Raffia", "code": "7929", "hex": "#FAD08C", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Hearth", "code": "7930", "hex": "#FBD69F", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Pineapple-N", "code": "0399", "hex": "#FBD695", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Warm Peach", "code": "10YY 77/125", "hex": "#FBD3AF", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Funny Feeling", "code": "50YR 78/064", "hex": "#F8D4D6", "family": "pinks", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Coral Rocks", "code": "8097", "hex": "#FCD5B5", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Essence", "code": "8099", "hex": "#FAD0D0", "family": "pinks", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Mango Duet", "code": "7977", "hex": "#FBC998", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Pink BB", "code": "8034", "hex": "#FCD0C8", "family": "pinks", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Sunshine Peach-N", "code": "9934", "hex": "#FAC3A5", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Romantic Pink", "code": "50RR 75/068", "hex": "#F1D7E3", "family": "pinks", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Hacienda Clay", "code": "7936", "hex": "#F9B77F", "family": "peaches", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Nursery Pink", "code": "8058", "hex": "#FCD4D4", "family": "pinks", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Morning Dream", "code": "7904", "hex": "#F9E47A", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Polka", "code": "7869", "hex": "#F7BD0F", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Mango Shake", "code": "7960", "hex": "#F5A11F", "family": "yellows", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Orange Crush", "code": "7959", "hex": "#F58E1A", "family": "oranges", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Sunrise", "code": "526", "hex": "#FF7F00", "family": "oranges", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Signal Red", "code": "—", "hex": "#F31E21", "family": "reds", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "PO Red", "code": "—", "hex": "#DC1A1D", "family": "reds", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    {"name": "Terracotta-N", "code": "0427", "hex": "#C44933", "family": "reds", "collection": "Yellows, Peaches, Oranges, Reds & Pinks"},
    # Blues, Greens & Violets
    {"name": "Delicate Violet", "code": "7164", "hex": "#EAE5E9", "family": "pastels", "collection": "Blues, Greens & Violets"},
    {"name": "Innocence", "code": "7211", "hex": "#D8DEEE", "family": "pastels", "collection": "Blues, Greens & Violets"},
    {"name": "Lavender Secret", "code": "7163", "hex": "#E1D6EA", "family": "pastels", "collection": "Blues, Greens & Violets"},
    {"name": "Lilac Feather-N", "code": "9630", "hex": "#DCCEEA", "family": "pastels", "collection": "Blues, Greens & Violets"},
    {"name": "Orchid Bloom", "code": "7168", "hex": "#C9C2DE", "family": "pastels", "collection": "Blues, Greens & Violets"},
    {"name": "Snow Princess", "code": "7332", "hex": "#E1F1EF", "family": "pastels", "collection": "Blues, Greens & Violets"},
    {"name": "Star Gaze", "code": "7364", "hex": "#D8EAF3", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Blueberry Mash", "code": "14BB 55/113", "hex": "#BDD1E0", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Summer Sky", "code": "7274", "hex": "#BCE3F5", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Alliance", "code": "1203", "hex": "#C1D1D8", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Pigeon Blue-N", "code": "0122", "hex": "#A4D5E5", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Blue Bay", "code": "7329", "hex": "#8FC9E9", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Electric Blue Plus", "code": "—", "hex": "#28B3E9", "family": "blues", "collection": "Blues, Greens & Violets"},
    {"name": "Menthol", "code": "L116", "hex": "#E6F0E0", "family": "greens", "collection": "Blues, Greens & Violets"},
    {"name": "Green Whisper", "code": "2425", "hex": "#D9EBD0", "family": "greens", "collection": "Blues, Greens & Violets"},
    {"name": "Green Sleeves-N", "code": "2420", "hex": "#C9DDBF", "family": "greens", "collection": "Blues, Greens & Violets"},
    {"name": "Tree Of Life", "code": "7691", "hex": "#D9E3C5", "family": "greens", "collection": "Blues, Greens & Violets"},
    {"name": "Mint Crush", "code": "7547", "hex": "#CBEBD8", "family": "greens", "collection": "Blues, Greens & Violets"},
    {"name": "Poplar Grove", "code": "7584", "hex": "#9AB9A4", "family": "greens", "collection": "Blues, Greens & Violets"},
    {"name": "Mehendi-N", "code": "2361", "hex": "#5A6546", "family": "greens", "collection": "Blues, Greens & Violets"},
    # Interior Combinations
    {"name": "Ancient Pottery", "code": "—", "hex": "#9E8168", "family": "browns", "collection": "Interior Combinations"},
    {"name": "Indian Painting", "code": "—", "hex": "#E3D5C5", "family": "beiges", "collection": "Interior Combinations"},
    {"name": "Toasty Grey", "code": "—", "hex": "#B8A99B", "family": "greys", "collection": "Interior Combinations"},
    {"name": "European White", "code": "—", "hex": "#F2EBE3", "family": "whites", "collection": "Interior Combinations"},
    {"name": "Creamy Toffee", "code": "—", "hex": "#C9915D", "family": "browns", "collection": "Interior Combinations"},
    {"name": "Creme Brulee", "code": "—", "hex": "#9D6A3B", "family": "browns", "collection": "Interior Combinations"},
    {"name": "Shadowbox", "code": "—", "hex": "#A1968C", "family": "greys", "collection": "Interior Combinations"},
    {"name": "Church Street", "code": "—", "hex": "#F3E1CA", "family": "beiges", "collection": "Interior Combinations"},
    {"name": "Warm Gold", "code": "—", "hex": "#E3A63B", "family": "yellows", "collection": "Interior Combinations"},
    {"name": "Rich Brocade", "code": "—", "hex": "#CC9536", "family": "yellows", "collection": "Interior Combinations"},
    {"name": "Maple Fantasy", "code": "—", "hex": "#C48E59", "family": "browns", "collection": "Interior Combinations"},
    {"name": "Dark Safari", "code": "—", "hex": "#765330", "family": "browns", "collection": "Interior Combinations"},
    {"name": "Oriental Coral", "code": "—", "hex": "#E66359", "family": "reds", "collection": "Interior Combinations"},
    {"name": "Matador", "code": "—", "hex": "#A63529", "family": "reds", "collection": "Interior Combinations"},
    {"name": "Moroccan Sands", "code": "—", "hex": "#E87C29", "family": "oranges", "collection": "Interior Combinations"},
    {"name": "Sunset Flame", "code": "—", "hex": "#CC6428", "family": "oranges", "collection": "Interior Combinations"},
    {"name": "Mars Dust", "code": "—", "hex": "#D1865D", "family": "oranges", "collection": "Interior Combinations"},
    {"name": "Spanish Chestnut", "code": "—", "hex": "#704128", "family": "browns", "collection": "Interior Combinations"},
    {"name": "Royal Rose", "code": "—", "hex": "#A8244D", "family": "reds", "collection": "Interior Combinations"},
    {"name": "Sophia", "code": "—", "hex": "#F0B6C0", "family": "pinks", "collection": "Interior Combinations"},
    {"name": "Downing Street", "code": "—", "hex": "#A8412B", "family": "reds", "collection": "Interior Combinations"},
    {"name": "Rich Blush", "code": "—", "hex": "#F2A796", "family": "pinks", "collection": "Interior Combinations"},
    {"name": "Gorgeous Pink", "code": "—", "hex": "#CC2B5A", "family": "pinks", "collection": "Interior Combinations"},
    {"name": "Destiny", "code": "—", "hex": "#F0B3BF", "family": "pinks", "collection": "Interior Combinations"},
    {"name": "Swordplay", "code": "—", "hex": "#8B99AD", "family": "blues", "collection": "Interior Combinations"},
    {"name": "Wisdom Light", "code": "—", "hex": "#33414D", "family": "blues", "collection": "Interior Combinations"},
    {"name": "Pebble Drift", "code": "—", "hex": "#5A7280", "family": "blues", "collection": "Interior Combinations"},
    {"name": "Denim Drift", "code": "—", "hex": "#9EB0BC", "family": "blues", "collection": "Interior Combinations"},
    {"name": "Ceremonial Blue", "code": "—", "hex": "#8B9BB8", "family": "blues", "collection": "Interior Combinations"},
    {"name": "Noble Blue", "code": "—", "hex": "#394A62", "family": "blues", "collection": "Interior Combinations"},
    {"name": "Otters Dam", "code": "—", "hex": "#53593A", "family": "greens", "collection": "Interior Combinations"},
    {"name": "English Apple", "code": "—", "hex": "#B8B530", "family": "yellows", "collection": "Interior Combinations"},
    {"name": "Brazilian Forest", "code": "—", "hex": "#515C3E", "family": "greens", "collection": "Interior Combinations"},
    {"name": "Highland Dash", "code": "—", "hex": "#C7C545", "family": "yellows", "collection": "Interior Combinations"},
    {"name": "Forest Glen", "code": "—", "hex": "#83A9A3", "family": "greens", "collection": "Interior Combinations"},
    {"name": "Serene Moments", "code": "—", "hex": "#4A6E6A", "family": "greens", "collection": "Interior Combinations"},
]


SEED_GALLERY = [
    {
        "title": "Heritage Living Room",
        "image_url": "https://images.unsplash.com/photo-1759774313632-854207c22ec1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cmlvdXMlMjBsaXZpbmclMjByb29tJTIwcGFpbnRlZCUyMHdhbGwlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwwfHx8fDE3ODIzNzQ2NTB8MA&ixlib=rb-4.1.0&q=85",
        "space": "Living Room",
        "description": "Heritage room with warm gold and beige walls finished in Galleria Premium Enamel.",
    },
    {
        "title": "Industrial Workshop",
        "image_url": "https://images.pexels.com/photos/19899076/pexels-photo-19899076.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "space": "Industrial",
        "description": "Workshop interior coated with Vespa Super Synthetic Enamel for daily wear & tear.",
    },
    {
        "title": "Coastal Residence",
        "image_url": "https://images.unsplash.com/photo-1560184897-ae75f418493e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGV4dGVyaW9yJTIwcGFpbnRpbmclMjBiZWF1dGlmdWwlMjBob21lfGVufDB8fHx8MTc4MjM3NDY1MXww&ixlib=rb-4.1.0&q=85",
        "space": "Exterior",
        "description": "Coastal residence façade in deep noble blue Galleria Premium Enamel.",
    },
    {
        "title": "Atelier Color Mixing",
        "image_url": "https://images.pexels.com/photos/6563575/pexels-photo-6563575.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "space": "Studio",
        "description": "Shade tinting in progress at our manufacturing unit — every batch hand-checked.",
    },
    {
        "title": "Garden Furniture",
        "image_url": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxwYWludCUyMGJydXNoJTIwdGV4dHVyZSUyMHN3YXRjaCUyMGNvbG9yZnVsfGVufDB8fHx8MTc4MjM3NDY1MHww&ixlib=rb-4.1.0&q=85",
        "space": "Outdoor",
        "description": "Wrought-iron furniture finished in Galleria Hammertone — Golden Bronze.",
    },
    {
        "title": "Pastel Bedroom",
        "image_url": "https://images.pexels.com/photos/1887946/pexels-photo-1887946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "space": "Bedroom",
        "description": "Soft pastel bedroom with Vespa Oil Bound Distemper in Lavender Secret.",
    },
]


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.colors.create_index("id", unique=True)
    await db.gallery.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@smpaints.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "ChromaAdmin@2025")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": admin_email, "name": "Admin", "role": "admin",
            "password_hash": hash_password(admin_password), "created_at": now_utc(),
        })
        logger.info("Admin seeded: %s", admin_email)
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    if await db.colors.count_documents({}) == 0:
        await db.colors.insert_many([{**c, "id": str(uuid.uuid4()), "created_at": now_utc()} for c in SEED_COLORS])
        logger.info("Colors seeded: %d", len(SEED_COLORS))

    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([{**p, "id": str(uuid.uuid4()), "created_at": now_utc()} for p in SEED_PRODUCTS])
        logger.info("Products seeded: %d", len(SEED_PRODUCTS))

    if await db.gallery.count_documents({}) == 0:
        await db.gallery.insert_many([{**g, "id": str(uuid.uuid4()), "created_at": now_utc(), "color_ids": []} for g in SEED_GALLERY])
        logger.info("Gallery seeded: %d", len(SEED_GALLERY))


@app.on_event("shutdown")
async def shutdown():
    client.close()
