# Chroma Paints — Catalogue & Admin

## Original Problem Statement
"i want to build a catalouge for my paint manufacturing buisness"

## User Choices
- Scope: Products + color palette explorer + project gallery + dealer/contact inquiry form
- Admin: login-gated CRUD for products/colors/gallery + inquiries inbox
- Product fields: name, category (interior/exterior/primer/enamel/distemper), finish (matte/satin/gloss/eggshell/textured), coverage, pack sizes, price, description, image, swatches
- Integrations: Request Quote form (stored in DB) + WhatsApp click-to-chat

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`) — UUID string IDs, Motor/MongoDB.
  - Public routes: `/api/products`, `/api/products/{id}`, `/api/colors`, `/api/gallery`, `/api/inquiries`, `/api/site/config`
  - Auth: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` (JWT Bearer + httpOnly cookie supported)
  - Admin (Bearer required): `/api/admin/products`, `/api/admin/colors`, `/api/admin/gallery`, `/api/admin/inquiries` (CRUD)
  - Startup seeds: admin user (idempotent), 5 products, 20 colors across 5 families, 4 gallery items
- **Frontend**: React + Tailwind + shadcn/ui + sonner toasts + lucide-react icons
  - Editorial luxury aesthetic — Playfair Display headings, Manrope body, JetBrains Mono accents
  - Routes: `/`, `/products`, `/products/:id`, `/colors`, `/gallery`, `/contact`, `/admin/login`, `/admin/*`

## What's been implemented (Dec 2025)
- Public catalogue: hero, featured products, color teaser strip, gallery teaser, CTA
- Product list with category + finish filters
- Product detail with specs, pack sizes, swatches, request-quote CTA
- Color library grouped by family with hex/code overlay
- Gallery grid with click-to-expand lightbox
- Contact inquiry form (stores to DB, success state, sonner toast)
- WhatsApp floating button (uses `WHATSAPP_NUMBER` env)
- Admin login (JWT in localStorage)
- Admin overview tiles + sidebar nav
- Admin CRUD for Products, Colors, Gallery
- Admin Inquiries list with status select + delete

## Credentials
- Admin: `admin@chromapaints.com` / `ChromaAdmin@2025`

## Validation
- Backend: 95% pass on iteration 0 (auth, public, admin CRUD verified)
- Frontend: 15/15 functional flows pass on iteration 1 (only 2 LOW data-testid naming drifts — non-blocking)

## Backlog
- **P1**: Image upload (currently URL-based) — fal.ai or local upload for admin
- **P1**: Email notifications on new inquiry (Resend integration)
- **P2**: Public "Find a dealer" map / store locator
- **P2**: Color matching tool / "visualize on wall" upload
- **P2**: Multi-admin roles (sales vs catalogue editor)
- **P2**: SEO meta tags, sitemap, OG images
- **P2**: Bulk product CSV import for admin
