# back-template-node

Template de backend con Node.js, TypeScript y arquitectura hexagonal.

**Stack:** pnpm · Express 5 · Prisma 7 · jose (JWT access + refresh) · zod · argon2 · pino · helmet · cors · tsx · tsdown · Vitest · ESLint · Prettier

## Puesta en marcha

```bash
pnpm install
cp .env.example .env        # y cambia los secretos JWT
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Endpoints de ejemplo

| Método | Ruta             | Auth                |
| ------ | ---------------- | ------------------- |
| GET    | `/health`        | —                   |
| POST   | `/auth/register` | —                   |
| POST   | `/auth/login`    | —                   |
| POST   | `/auth/refresh`  | —                   |
| GET    | `/users/me`      | Bearer access token |

## Documentación de la API

Swagger UI en [`/docs`](http://localhost:3000/docs) y el documento OpenAPI 3.1 en `/docs/openapi.json`. Está activo por defecto salvo con `NODE_ENV=production`. Para forzarlo, usa `API_DOCS=true|false`.

La arquitectura, las convenciones y los pasos para añadir un módulo están en [CLAUDE.md](CLAUDE.md).
