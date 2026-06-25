"""Backend regression tests for SM Paint Industries rebrand."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://color-explorer-6.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@chromapaints.com"
ADMIN_PASSWORD = "ChromaAdmin@2025"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="module")
def token(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin(s, token):
    s2 = requests.Session()
    s2.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s2


# ---------- Site config ----------
def test_site_config(s):
    r = s.get(f"{BASE_URL}/api/site/config")
    assert r.status_code == 200
    d = r.json()
    assert d["brand"] == "SM Paint Industries"
    assert "1982" in d["tagline"]
    assert d["logo_url"]
    keys = [l["key"] for l in d["lines"]]
    assert "vespa" in keys and "galleria" in keys


# ---------- Products ----------
def test_products_count(s):
    r = s.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    assert len(r.json()) == 9


def test_products_vespa(s):
    r = s.get(f"{BASE_URL}/api/products", params={"line": "vespa"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 4
    assert all(p["line"] == "vespa" for p in items)


def test_products_galleria(s):
    r = s.get(f"{BASE_URL}/api/products", params={"line": "galleria"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 5
    assert all(p["line"] == "galleria" for p in items)


def test_product_detail_has_tech_fields(s):
    items = s.get(f"{BASE_URL}/api/products", params={"line": "vespa"}).json()
    pid = items[0]["id"]
    r = s.get(f"{BASE_URL}/api/products/{pid}")
    assert r.status_code == 200
    d = r.json()
    for key in ["coverage_detail", "drying_time", "recoat_time", "application",
                "thinner", "recommended_primer", "available_shades", "features", "line"]:
        assert key in d, f"missing {key}"
    assert isinstance(d["features"], list) and len(d["features"]) > 0


# ---------- Colors ----------
def test_colors_count(s):
    r = s.get(f"{BASE_URL}/api/colors")
    assert r.status_code == 200
    colors = r.json()
    assert len(colors) == 116, f"expected 116, got {len(colors)}"


def test_colors_collections(s):
    colors = s.get(f"{BASE_URL}/api/colors").json()
    collections = {c["collection"] for c in colors}
    expected = {
        "Whites, Beiges, Browns & Greys",
        "Yellows, Peaches, Oranges, Reds & Pinks",
        "Blues, Greens & Violets",
        "Interior Combinations",
    }
    assert expected.issubset(collections), f"missing collections: {expected - collections}"


def test_colors_filter_collection(s):
    r = s.get(f"{BASE_URL}/api/colors", params={"collection": "Interior Combinations"})
    assert r.status_code == 200
    assert all(c["collection"] == "Interior Combinations" for c in r.json())
    assert len(r.json()) > 0


def test_colors_filter_family(s):
    r = s.get(f"{BASE_URL}/api/colors", params={"family": "blues"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert all(c["family"] == "blues" for c in items)


# ---------- Gallery ----------
def test_gallery_count(s):
    r = s.get(f"{BASE_URL}/api/gallery")
    assert r.status_code == 200
    assert len(r.json()) == 6


# ---------- Inquiries ----------
def test_inquiry_create(s):
    payload = {"name": "TEST_User", "phone": "9999999999", "email": "test@example.com",
               "city": "Mumbai", "message": "hello", "product_interest": "Vespa"}
    r = s.post(f"{BASE_URL}/api/inquiries", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == "TEST_User"
    assert d["status"] == "new"
    assert "id" in d


# ---------- Admin auth & CRUD ----------
def test_admin_login_and_me(s, token):
    r = s.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


def test_admin_login_wrong_password(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_admin_create_product_with_new_schema(admin):
    payload = {
        "name": "TEST_Product_X",
        "line": "galleria",
        "category": "enamel",
        "finish": "gloss",
        "short_description": "test",
        "description": "test desc",
        "features": ["Feature 1", "Feature 2"],
        "coverage": "10-12 m²/lt",
        "coverage_detail": "10-12 m²/lt at 20μ DFT",
        "drying_time": "30 min",
        "recoat_time": "6 hrs",
        "application": "Brush, Spray",
        "pack_sizes": ["1 lt", "4 lt"],
        "thinner": "MTO",
        "recommended_primer": "Red Oxide",
        "available_shades": "All",
        "image_url": "https://example.com/img.jpg",
        "featured": False,
        "sort_order": 99,
    }
    r = admin.post(f"{BASE_URL}/api/admin/products", json=payload)
    assert r.status_code == 200, r.text
    pid = r.json()["id"]
    # Verify GET
    g = admin.get(f"{BASE_URL}/api/products/{pid}")
    assert g.status_code == 200
    d = g.json()
    assert d["line"] == "galleria"
    assert d["features"] == ["Feature 1", "Feature 2"]
    assert d["coverage_detail"].startswith("10-12")
    # Cleanup
    dr = admin.delete(f"{BASE_URL}/api/admin/products/{pid}")
    assert dr.status_code == 200


def test_admin_inquiries_list(admin):
    r = admin.get(f"{BASE_URL}/api/admin/inquiries")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_admin_create_color(admin):
    payload = {"name": "TEST_Color", "hex": "#123456", "family": "blues",
               "collection": "Blues, Greens & Violets", "code": "T-001"}
    r = admin.post(f"{BASE_URL}/api/admin/colors", json=payload)
    assert r.status_code == 200, r.text
    cid = r.json()["id"]
    admin.delete(f"{BASE_URL}/api/admin/colors/{cid}")
