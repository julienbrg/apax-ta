# Happy Path

A manual walkthrough to confirm auth + the holdings API work end to end. Run
against a local server (`npm run start:dev`, default `http://localhost:3001`)
with MongoDB and Maildev up — see the [README](../README.md) setup steps.

Steps can be run via Swagger UI (`http://localhost:3001/docs` — register/login,
then click "Authorize" with the returned token) or via `curl`, as below.

## 1. Sign up

```bash
curl -s -X POST http://localhost:3001/api/v1/auth/email/register \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secretpw123","firstName":"Jane","lastName":"Doe"}'
```

Expect `204 No Content`. (Confirming the email is optional for login — see
[auth.md](auth.md) — but requires Maildev running to fetch the link.)

## 2. Log in

```bash
curl -s -X POST http://localhost:3001/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secretpw123"}'
```

Expect a `token` and `refreshToken` in the response. Decode the `token` (e.g.
at jwt.io, or `echo <payload-segment> | base64 -d`) and confirm the payload
carries both `id` and `email`.

Save the token for the next steps:

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secretpw123"}' | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")
```

## 3. View holdings (empty state)

```bash
curl -s http://localhost:3001/api/v1/holdings -H "Authorization: Bearer $TOKEN"
```

Expect all three buckets present with `amount: 0` and `updatedAt: null`:

```json
{
  "gold": { "amount": 0, "updatedAt": null },
  "silver": { "amount": 0, "updatedAt": null },
  "platinum": { "amount": 0, "updatedAt": null }
}
```

## 4. Acquire assets

```bash
curl -s -X POST http://localhost:3001/api/v1/holdings -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"assetType":"gold","amount":12.5}'

curl -s -X POST http://localhost:3001/api/v1/holdings -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"assetType":"gold","amount":2.5}'

curl -s -X POST http://localhost:3001/api/v1/holdings -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"assetType":"silver","amount":100}'
```

Each returns `201` with the created holding.

## 5. View holdings again

```bash
curl -s http://localhost:3001/api/v1/holdings -H "Authorization: Bearer $TOKEN"
```

Expect `gold.amount` to be the sum of the two entries (`15`), `silver.amount`
to be `100`, and `updatedAt` on each to reflect the latest write.

## 6. Unauthenticated check

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/v1/holdings
```

Expect `401`.

## Edge cases worth probing

- **Invalid asset type** — `POST /api/v1/holdings` with `"assetType":"bronze"`
  → expect `422`.
- **Cross-user isolation** — register a second user, log in, `GET /holdings`
  → expect an empty portfolio, not the first user's data.
- **Ownership on direct access** — as the second user, `GET /holdings/:id` on
  the first user's holding id → expect `404` (not `403`, so the response
  doesn't confirm the record exists).
- **Rate limiting** — hammering any endpoint past 200 requests/minute from the
  same IP → expect `429` (see the note in the [README](../README.md)).
