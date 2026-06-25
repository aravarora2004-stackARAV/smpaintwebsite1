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

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# -------------------- Setup --------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ACCESS_TOKEN_MIN = 60 * 24  # 24h (admin sessions)

app = FastAPI(title="Chroma Paints API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("chroma")


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
ProductCategory = Literal["interior", "exterior", "primer", "enamel", "distemper"]
Finish = Literal["matte", "satin", "gloss", "eggshell", "textured"]


class ProductIn(BaseModel):
    name: str
    category: ProductCategory
    finish: Finish
    coverage: str = Field(default="", description="e.g. 130-150 sq.ft/litre")
    pack_sizes: List[str] = Field(default_factory=list)
    price: Optional[float] = None
    description: str = ""
    image_url: str = ""
    swatch_color_ids: List[str] = Field(default_factory=list)
    featured: bool = False


class ProductOut(ProductIn):
    id: str
    created_at: str


class ColorIn(BaseModel):
    name: str
    hex: str
    family: str  # reds, blues, neutrals, greens, yellows, etc.
    code: str = ""


class ColorOut(ColorIn):
    id: str
    created_at: str


class GalleryIn(BaseModel):
    title: str
    image_url: str
    space: str = ""  # living room, bedroom, exterior, etc.
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
    return {"name": "Chroma Paints API", "status": "ok"}


@api.get("/products", response_model=List[ProductOut])
async def list_products(category: Optional[str] = None, finish: Optional[str] = None, featured: Optional[bool] = None):
    q = {}
    if category:
        q["category"] = category
    if finish:
        q["finish"] = finish
    if featured is not None:
        q["featured"] = featured
    docs = await db.products.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.get("/products/{pid}", response_model=ProductOut)
async def get_product(pid: str):
    doc = await db.products.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    return doc


@api.get("/colors", response_model=List[ColorOut])
async def list_colors(family: Optional[str] = None):
    q = {}
    if family:
        q["family"] = family
    docs = await db.colors.find(q, {"_id": 0}).sort("family", 1).to_list(1000)
    return docs


@api.get("/gallery", response_model=List[GalleryOut])
async def list_gallery():
    docs = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api.post("/inquiries", response_model=InquiryOut)
async def create_inquiry(body: InquiryIn):
    doc = body.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "status": "new",
        "created_at": now_utc(),
    })
    await db.inquiries.insert_one(doc)
    doc.pop("_id", None)
    return doc


# -------------------- Admin Routes --------------------
admin = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)])


# Products
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
    update = body.model_dump()
    res = await db.products.update_one({"id": pid}, {"$set": update})
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


# Colors
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


# Gallery
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


# Inquiries
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


# Site config
@api.get("/site/config")
async def site_config():
    return {
        "brand": "Chroma Paints",
        "whatsapp_number": os.environ.get("WHATSAPP_NUMBER", ""),
    }


api.include_router(admin)
app.include_router(api)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------- Seed --------------------
SEED_COLORS = [
    # Neutrals
    {"name": "Alabaster", "hex": "#EDE6D6", "family": "Neutrals", "code": "CP-N01"},
    {"name": "Bone White", "hex": "#F4EFE6", "family": "Neutrals", "code": "CP-N02"},
    {"name": "Stone Mist", "hex": "#C9C2B6", "family": "Neutrals", "code": "CP-N03"},
    {"name": "Charcoal", "hex": "#3A3A3A", "family": "Neutrals", "code": "CP-N04"},
    # Earth
    {"name": "Terracotta", "hex": "#B65A4B", "family": "Earth", "code": "CP-E01"},
    {"name": "Burnt Sienna", "hex": "#8C3B2A", "family": "Earth", "code": "CP-E02"},
    {"name": "Clay", "hex": "#C58A6A", "family": "Earth", "code": "CP-E03"},
    {"name": "Saffron", "hex": "#E4A24A", "family": "Earth", "code": "CP-E04"},
    # Greens
    {"name": "Sage", "hex": "#8C9986", "family": "Greens", "code": "CP-G01"},
    {"name": "Forest", "hex": "#3C5A4A", "family": "Greens", "code": "CP-G02"},
    {"name": "Olive Grove", "hex": "#7B7E4C", "family": "Greens", "code": "CP-G03"},
    {"name": "Eucalyptus", "hex": "#A8C0AC", "family": "Greens", "code": "CP-G04"},
    # Blues
    {"name": "Indigo Dusk", "hex": "#2E3A59", "family": "Blues", "code": "CP-B01"},
    {"name": "Slate", "hex": "#5C7184", "family": "Blues", "code": "CP-B02"},
    {"name": "Sky Linen", "hex": "#BCCCDB", "family": "Blues", "code": "CP-B03"},
    {"name": "Midnight", "hex": "#1A2238", "family": "Blues", "code": "CP-B04"},
    # Warm
    {"name": "Peach Veil", "hex": "#F4C7B0", "family": "Warm", "code": "CP-W01"},
    {"name": "Coral Bloom", "hex": "#E97C6E", "family": "Warm", "code": "CP-W02"},
    {"name": "Marigold", "hex": "#E6A33A", "family": "Warm", "code": "CP-W03"},
    {"name": "Rose Quartz", "hex": "#D9A6A3", "family": "Warm", "code": "CP-W04"},
]


SEED_PRODUCTS = [
    {
        "name": "Velvet Touch Interior Emulsion",
        "category": "interior",
        "finish": "matte",
        "coverage": "140-160 sq.ft per litre",
        "pack_sizes": ["1L", "4L", "10L", "20L"],
        "price": 540.0,
        "description": "A luxurious low-sheen interior emulsion with smooth coverage, low VOC, and superior washability. Ideal for living rooms, bedrooms, and feature walls.",
        "image_url": "https://images.pexels.com/photos/1887946/pexels-photo-1887946.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "featured": True,
    },
    {
        "name": "Stone Shield Exterior Emulsion",
        "category": "exterior",
        "finish": "satin",
        "coverage": "120-140 sq.ft per litre",
        "pack_sizes": ["4L", "10L", "20L"],
        "price": 720.0,
        "description": "Weatherproof exterior emulsion engineered for monsoon-grade protection. UV resistant, anti-algal, and crack-bridging for long lasting facades.",
        "image_url": "https://images.unsplash.com/photo-1560184897-ae75f418493e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGV4dGVyaW9yJTIwcGFpbnRpbmclMjBiZWF1dGlmdWwlMjBob21lfGVufDB8fHx8MTc4MjM3NDY1MXww&ixlib=rb-4.1.0&q=85",
        "featured": True,
    },
    {
        "name": "Atelier Premium Enamel",
        "category": "enamel",
        "finish": "gloss",
        "coverage": "160 sq.ft per litre",
        "pack_sizes": ["500ml", "1L", "4L"],
        "price": 480.0,
        "description": "High-gloss solvent-based enamel for woodwork, metal, and trims. Self-leveling formula for a mirror finish.",
        "image_url": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxwYWludCUyMGJydXNoJTIwdGV4dHVyZSUyMHN3YXRjaCUyMGNvbG9yZnVsfGVufDB8fHx8MTc4MjM3NDY1MHww&ixlib=rb-4.1.0&q=85",
        "featured": False,
    },
    {
        "name": "FirstCoat Wall Primer",
        "category": "primer",
        "finish": "matte",
        "coverage": "180 sq.ft per litre",
        "pack_sizes": ["4L", "10L", "20L"],
        "price": 320.0,
        "description": "Water-based universal primer for interior and exterior surfaces. Improves topcoat adhesion and uniform finish.",
        "image_url": "https://images.pexels.com/photos/6563575/pexels-photo-6563575.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "featured": False,
    },
    {
        "name": "Heritage Distemper",
        "category": "distemper",
        "finish": "matte",
        "coverage": "100 sq.ft per litre",
        "pack_sizes": ["1kg", "5kg", "20kg"],
        "price": 180.0,
        "description": "Cost-effective dry distemper for interior walls. Easy to apply, low odour, available in classic pastel shades.",
        "image_url": "https://images.unsplash.com/photo-1759774313632-854207c22ec1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cmlvdXMlMjBsaXZpbmclMjByb29tJTIwcGFpbnRlZCUyMHdhbGwlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwwfHx8fDE3ODIzNzQ2NTB8MA&ixlib=rb-4.1.0&q=85",
        "featured": False,
    },
]


SEED_GALLERY = [
    {
        "title": "Sage Living Room",
        "image_url": "https://images.unsplash.com/photo-1759774313632-854207c22ec1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxsdXh1cmlvdXMlMjBsaXZpbmclMjByb29tJTIwcGFpbnRlZCUyMHdhbGwlMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwwfHx8fDE3ODIzNzQ2NTB8MA&ixlib=rb-4.1.0&q=85",
        "space": "Living Room",
        "description": "Heritage interiors finished in Sage and Bone White, anchored by warm brass accents.",
    },
    {
        "title": "Modern Grey Study",
        "image_url": "https://images.pexels.com/photos/19899076/pexels-photo-19899076.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "space": "Study",
        "description": "Soft slate walls with charcoal trims for a calm, contemporary workspace.",
    },
    {
        "title": "Coastal Porch",
        "image_url": "https://images.unsplash.com/photo-1560184897-ae75f418493e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGV4dGVyaW9yJTIwcGFpbnRpbmclMjBiZWF1dGlmdWwlMjBob21lfGVufDB8fHx8MTc4MjM3NDY1MXww&ixlib=rb-4.1.0&q=85",
        "space": "Exterior",
        "description": "Indigo dusk exterior paired with bone white trims for a timeless coastal facade.",
    },
    {
        "title": "Atelier Color Study",
        "image_url": "https://images.pexels.com/photos/6563575/pexels-photo-6563575.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "space": "Studio",
        "description": "A curated palette exploration from our seasonal collection.",
    },
]


@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.colors.create_index("id", unique=True)
    await db.gallery.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)

    # Admin seed (idempotent)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@chromapaints.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "ChromaAdmin@2025")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Admin",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": now_utc(),
        })
        logger.info("Admin user seeded: %s", admin_email)
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info("Admin password refreshed")

    # Seed colors / products / gallery if collections empty
    if await db.colors.count_documents({}) == 0:
        await db.colors.insert_many([
            {**c, "id": str(uuid.uuid4()), "created_at": now_utc()} for c in SEED_COLORS
        ])
        logger.info("Colors seeded")

    if await db.products.count_documents({}) == 0:
        # Pull some color ids for swatches
        sample_colors = await db.colors.find({}, {"_id": 0, "id": 1}).to_list(20)
        sample_ids = [c["id"] for c in sample_colors]
        for i, p in enumerate(SEED_PRODUCTS):
            p["id"] = str(uuid.uuid4())
            p["created_at"] = now_utc()
            # assign 4 swatches
            p["swatch_color_ids"] = sample_ids[(i * 3) % max(1, len(sample_ids)):(i * 3) % max(1, len(sample_ids)) + 4]
        await db.products.insert_many(SEED_PRODUCTS)
        logger.info("Products seeded")

    if await db.gallery.count_documents({}) == 0:
        await db.gallery.insert_many([
            {**g, "id": str(uuid.uuid4()), "created_at": now_utc(), "color_ids": []} for g in SEED_GALLERY
        ])
        logger.info("Gallery seeded")


@app.on_event("shutdown")
async def shutdown():
    client.close()
