# APAX Tech Assessment


## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create your `.env` from the document example

   ```bash
   cp env-example-document .env
   ```

   Then set `DATABASE_URL=mongodb://localhost:27017` (the example points at the `mongo` Docker service name, which only resolves inside Compose).

3. Start MongoDB

   ```bash
   docker compose -f docker-compose.document.yaml up -d mongo mongo-express
   ```

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

## Tests

```bash
npm run test        # unit
npm run test:e2e    # e2e (needs the app's dependencies running, DB seeded)
```

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