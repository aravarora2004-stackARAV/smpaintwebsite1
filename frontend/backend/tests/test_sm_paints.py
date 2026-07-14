"""Backend regression tests for SM Paint Industries — 17-product catalogue."""
import os
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@chromapaints.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "ChromaAdmin@2025")


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
def test_site_config_branding(s):
    r = s.get(f"{BASE_URL}/api/site/config")
    assert r.status_code == 200
    d = r.json()
    assert d["brand"] == "SM Paint Industries"
    assert "1983" in d["tagline"]
    assert d["established"] == "1983"
    assert "Chandni Chowk" in d["location"]
    assert d["email"] == "smpaints2001@gmail.com"
    assert d["phone"] == "+91 76691 53715"
    assert d["whatsapp_number"] == "917669153715"
    assert d["vespa_logo_url"]
    assert d["galleria_logo_url"]
    assert d["vespa_logo_url"].startswith("http")
    assert d["galleria_logo_url"].startswith("http")


# ---------- Products ----------
def test_products_total_count(s):
    r = s.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 17, f"expected 17, got {len(items)}"


def test_products_line_vespa(s):
    r = s.get(f"{BASE_URL}/api/products", params={"line": "vespa"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 10, f"expected 10 vespa, got {len(items)}"
    assert all(p["line"] == "vespa" for p in items)
    names = {p["name"] for p in items}
    assert "Vespa Interior Emulsion" in names
    assert "Vespa Black Japan" in names
    assert "Vespa Black Rubber Seal" in names


def test_products_line_galleria(s):
    r = s.get(f"{BASE_URL}/api/products", params={"line": "galleria"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 7, f"expected 7 galleria, got {len(items)}"
    assert all(p["line"] == "galleria" for p in items)
    names = {p["name"] for p in items}
    for n in ["Galleria White Primer", "Galleria Red Oxide Primer",
              "Galleria Hammertone Paint", "Galleria Aluminium Paint"]:
        assert n in names, f"missing {n}"


def test_products_line_general(s):
    r = s.get(f"{BASE_URL}/api/products", params={"line": "general"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 0, f"expected 0 general, got {len(items)}"


def test_products_removed_legacy(s):
    items = s.get(f"{BASE_URL}/api/products").json()
    names = {p["name"] for p in items}
    for removed in ["Bawa Aluminium Paint", "Gold Coin Gold Paint",
                    "Bawa Water Base Silver Paint", "Bawa Water Base Gold Paint",
                    "Batra Synthetic Iron Oxide"]:
        assert removed not in names, f"{removed} should have been removed"


def test_products_category_emulsion(s):
    r = s.get(f"{BASE_URL}/api/products", params={"category": "emulsion"})
    assert r.status_code == 200
    items = r.json()
    names = {p["name"] for p in items}
    assert "Vespa Interior Emulsion" in names
    assert "Vespa Weatherproof Exterior Emulsion" in names


def test_products_featured(s):
    r = s.get(f"{BASE_URL}/api/products", params={"featured": "true"})
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1, f"expected >=1 featured, got {len(items)}"
    assert all(p["featured"] for p in items)


def test_product_detail_tech_fields(s):
    items = s.get(f"{BASE_URL}/api/products", params={"line": "vespa"}).json()
    pid = items[0]["id"]
    r = s.get(f"{BASE_URL}/api/products/{pid}")
    assert r.status_code == 200
    d = r.json()
    for key in ["coverage_detail", "drying_time", "recoat_time", "application",
                "thinner", "recommended_primer", "available_shades", "features", "line"]:
        assert key in d, f"missing {key}"
    assert isinstance(d["features"], list) and len(d["features"]) > 0
    assert d["line"] in ("vespa", "galleria", "general")


# ---------- Colors regression ----------
def test_colors_count_116(s):
    r = s.get(f"{BASE_URL}/api/colors")
    assert r.status_code == 200
    colors = r.json()
    assert len(colors) == 116, f"expected 116, got {len(colors)}"


def test_colors_4_collections(s):
    colors = s.get(f"{BASE_URL}/api/colors").json()
    collections = {c["collection"] for c in colors}
    expected = {
        "Whites, Beiges, Browns & Greys",
        "Yellows, Peaches, Oranges, Reds & Pinks",
        "Blues, Greens & Violets",
        "Interior Combinations",
    }
    assert expected.issubset(collections), f"missing: {expected - collections}"


# ---------- Inquiries ----------
def test_inquiry_create_minimal(s):
    payload = {"name": "TEST_User", "phone": "9999999999"}
    r = s.post(f"{BASE_URL}/api/inquiries", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == "TEST_User"
    assert d["status"] == "new"


# ---------- Admin ----------
def test_admin_login_me(s, token):
    r = s.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


def test_admin_create_general_product(admin):
    payload = {
        "name": "TEST_General_X", "line": "general", "category": "industrial",
        "finish": "matte", "short_description": "t", "description": "t",
        "features": ["A", "B"], "coverage": "10", "coverage_detail": "10 m²",
        "drying_time": "30 min", "recoat_time": "6 hrs", "application": "Brush",
        "pack_sizes": ["1 lt"], "thinner": "MTO", "recommended_primer": "None",
        "available_shades": "All", "image_url": "https://e.com/x.jpg",
        "featured": False, "sort_order": 99,
    }
    r = admin.post(f"{BASE_URL}/api/admin/products", json=payload)
    assert r.status_code == 200, r.text
    pid = r.json()["id"]
    g = admin.get(f"{BASE_URL}/api/products/{pid}")
    assert g.status_code == 200 and g.json()["line"] == "general"
    dr = admin.delete(f"{BASE_URL}/api/admin/products/{pid}")
    assert dr.status_code == 200


def test_admin_inquiries_list(admin):
    r = admin.get(f"{BASE_URL}/api/admin/inquiries")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
