# APAX Tech Assessment

## Structure

This repo covers all three assessment sections, each self-contained with its own dependencies:

- **[src/](src/)** — Backend. NestJS + MongoDB API (auth, JWT, holdings). Runs at the repo root — see Setup/Run below.
- **[ui/](ui/)** — Frontend. Next.js app consuming the API above.
- **[contracts/](contracts/)** — Blockchain. Solidity contracts, Foundry.

Each of `ui/` and `contracts/` has its own README with setup/run instructions.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create your `.env` from the document example

   ```bash
   cp env-example-document .env
   ```

   The example file points several services at their Docker Compose network names, which only resolve inside Compose. Running the API itself with `npm run start:dev` (outside Compose), set:
   - `DATABASE_URL=mongodb://localhost:27017` (example points at the `mongo` service name)
   - `MAIL_HOST=localhost` (example points at the `maildev` service name)

3. Start MongoDB and Maildev

   ```bash
   docker compose -f docker-compose.document.yaml up -d mongo mongo-express maildev
   ```

   Maildev is required for email flows (registration confirmation, forgot password) and for `npm run test:e2e`, not just Mongo.

4. Seed the database

   ```bash
   npm run seed:run:document
   ```

## Run

```bash
npm run start:dev
```

- API: http://localhost:3001
- Swagger docs: http://localhost:3001/docs
- Mongo Express: http://localhost:8081
- Maildev (captured outgoing emails): http://localhost:1080

The API applies a global rate limit (200 requests/minute per IP by default, see `ThrottlerModule` in [src/app.module.ts](src/app.module.ts)). If manual testing trips a `429 Too Many Requests`, that's why.

## Tests

```bash
npm run test        # unit
npm run test:e2e    # e2e (needs the app's dependencies running — Mongo *and* Maildev — DB seeded)
```

For a manual end-to-end check (signup → login → view holdings → acquire an
asset → view holdings again), see [docs/HAPPY_PATH.md](docs/HAPPY_PATH.md).

## Adding entities/schemas

Use the CLI generators — see [.claude/skills/generate/SKILL.md](.claude/skills/generate/SKILL.md). Do not hand-write entity files.

## License

MIT

## Credits

Forked from [nestjs-boilerplate](https://github.com/brocoders/nestjs-boilerplate) by [Brocoders](https://github.com/brocoders).

## Contact

**Julien Béranger** ([GitHub](https://github.com/julienbrg))

- Element: [@julienbrg:matrix.org](https://matrix.to/#/@julienbrg:matrix.org)
- Farcaster: [julien-](https://warpcast.com/julien-)
- Telegram: [@julienbrg](https://t.me/julienbrg)