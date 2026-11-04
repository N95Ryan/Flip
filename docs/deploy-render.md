# Deploying the backend on Render

## Steps

1. Push `develop` (or your connected branch). It includes the `back/` profile routes and [`render.yaml`](../render.yaml).
2. Render Dashboard → service `flip-back-m624` → **Manual Deploy** (Root Directory: `back`, or sync blueprint).
3. **Environment** (required):
   - `DATABASE_URL`: Neon DB used in production. On each deploy, the server auto-applies [`003_user_profile.sql`](../back/migrations/003_user_profile.sql) and [`004_belt_techniques.sql`](../back/migrations/004_belt_techniques.sql) (idempotent).
   - `JWT_SECRET`, `STRIPE_*`.
4. **Photos**: set the S3-compatible vars (see [`back/.env.example`](../back/.env.example)): `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`. Without `S3_BUCKET`, username Save can work but avatars are unreliable.

## Troubleshooting

**Login returns `could not log in` (HTTP 500):** usually missing `belt_level` / `techniques_studied` on Neon. Redeploy after pulling the latest `back/`, or run the migrations manually:

```bash
cd back
go run ./cmd/migrate 003_user_profile.sql 004_belt_techniques.sql
```

`DATABASE_URL` must be the **production** Neon URL. You can also paste those SQL files in the Neon SQL editor.

## Verify

Login (expect **401** for a wrong password, not 500). Save this JSON as `login-test.json` first (PowerShell quoting is awkward):

```json
{ "email": "test@example.com", "password": "wrongpassword123" }
```

```bash
curl.exe -s -w "\nHTTP %{http_code}\n" -X POST https://flip-back-m624.onrender.com/auth/login -H "Content-Type: application/json" -d "@login-test.json"
```

Deployment:

```bash
curl.exe -s -o NUL -w "%{http_code}" https://flip-back-m624.onrender.com/techniques
# expect 200

curl.exe -s -o NUL -w "%{http_code}" -X PATCH https://flip-back-m624.onrender.com/users/me -H "Content-Type: application/json" -d "{\"username\":\"test\"}"
# expect 401 once profile routes are deployed; 404 means redeploy back/
```

Then in Expo: `npx expo start -c` → Profil → Save a username → check the Neon `username` column.
