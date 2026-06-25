# Auth Testing — Chroma Paints

## Admin Credentials
- Email: `admin@chromapaints.com`
- Password: `ChromaAdmin@2025`

## Quick verifications
```bash
# Login (Bearer flow)
curl -X POST $REACT_APP_BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chromapaints.com","password":"ChromaAdmin@2025"}'

# Use returned access_token as Bearer
curl $REACT_APP_BACKEND_URL/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Expected
- Login returns `{ access_token, user: {...} }` and sets `access_token` cookie.
- `/me` returns the admin user (no password_hash).
- All `/api/admin/**` routes return 401 without token.

## Mongo
- Admin user must exist in `users` collection with `password_hash` starting with `$2b$`.
- Index on `users.email` (unique).
