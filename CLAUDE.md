# CLAUDE.md

Template de backend Node.js + TypeScript con arquitectura hexagonal. Express 5, Prisma 7, jose (JWT), zod, Vitest.

## Comandos

```bash
pnpm install
cp .env.example .env
docker compose up -d        # Postgres local
pnpm db:generate            # genera el cliente Prisma en src/generated (obligatorio antes de typecheck/build)
pnpm db:migrate             # crea/aplica migraciones en desarrollo
pnpm dev                    # tsx watch
pnpm test                   # vitest run  (pnpm test -- tests/unit/auth para filtrar)
pnpm typecheck && pnpm lint && pnpm format:check   # antes de dar una tarea por terminada
pnpm lint:fix && pnpm format                       # autocorregir
pnpm build && pnpm start    # bundle con tsdown en dist/
```

## Entorno

- Node `^22.18` o `>=24.11` y pnpm 11 (fijado en `packageManager`).
- pnpm 11 no lee el campo `pnpm` de `package.json`. Su configuración va en `pnpm-workspace.yaml`. Si una dependencia nueva necesita ejecutar scripts de instalación, añádela a `allowBuilds`.
- TypeScript se queda en 6.x porque typescript-eslint aún no soporta TypeScript 7 (su peer es `<6.1`). No lo actualices hasta que lo soporte.

## Arquitectura

```
src/
├── main.ts          # Arranque: crea adaptadores reales (Prisma, argon2, jose) y llama a buildApp
├── app.ts           # Composition root: instancia casos de uso y rutas a partir de AppDeps
├── shared/          # Errores de dominio, env, servidor HTTP, cliente Prisma
├── generated/       # Cliente Prisma generado — NO editar, está en .gitignore
└── modules/<modulo>/
    ├── domain/          # Entidades, value objects y puertos (interfaces). Sin dependencias externas
    ├── application/     # Casos de uso (una clase con execute()) y DTOs
    └── infrastructure/  # Adaptadores: repositorios Prisma, servicios, rutas HTTP
```

### Reglas de dependencia (no romper)

- `domain` no importa nada de `application`, `infrastructure`, Express, Prisma, zod ni jose.
- `application` solo importa de `domain` (de su módulo o de otro) y de `shared/domain`.
- Solo `infrastructure` conoce las librerías. Los tipos de Prisma no salen del repositorio: se mapean a entidades.
- Las dependencias se inyectan por constructor. No hay contenedor de DI: todo se cablea en `app.ts`.
- Los casos de uso lanzan subclases de `DomainError` (`shared/domain/errors.ts`). El `error-handler` las traduce a HTTP (validation→400, unauthorized→401, not_found→404, conflict→409). `ZodError`→400.
- `auth` depende de `users` (domain/application). Evita dependencias circulares entre módulos.

### Convenciones

- Imports relativos sin extensión (`moduleResolution: Bundler`).
- Ficheros en kebab-case. Rutas en `*.routes.ts`, una función `xxxRoutes(deps)` que devuelve un `Router`.
- La validación de entrada HTTP se hace con zod en la ruta (`schema.parse(req.body)`). Las invariantes de negocio van en la entidad.
- Express 5 propaga los errores de handlers async: no hace falta `try/catch` ni `next(err)`.
- Swagger: `zod-openapi` + `swagger-ui-express` en `/docs` (`shared/infrastructure/http/openapi.ts`). Cada módulo exporta sus paths en `infrastructure/http/*.openapi.ts`. Si cambias una ruta, actualiza su documentación. Las rutas protegidas llevan `security: bearerAuth`.
- Usuario autenticado: protege la ruta con `requireAuth` y lee el id con `getAuthenticatedUserId(res)` (`shared/infrastructure/http/auth-context.ts`).
- Las variables de entorno se leen solo desde `shared/infrastructure/config/env.ts` (validado con zod). Si añades una, actualiza también `.env.example`.
- Lint con ESLint (`eslint.config.js`, typescript-eslint en modo type-checked) y formato con Prettier (`.prettierrc.json`: comillas simples, sin punto y coma, ancho 100). ESLint no comprueba el estilo: de eso se encarga Prettier.
- ESLint aplica las reglas de dependencia: `no-restricted-imports` en `domain/` y `application/`, y prohíbe `process.env` fuera de `env.ts`. No desactives estas reglas con `eslint-disable`: corrige el diseño.

## Añadir un módulo nuevo

1. `src/modules/<x>/domain`: entidad y puerto `XRepository`.
2. `src/modules/<x>/application`: casos de uso y DTO.
3. `src/modules/<x>/infrastructure`: `PrismaXRepository`, `x.routes.ts` y `x.openapi.ts` (paths OpenAPI relativos al prefijo, que reutilizan los schemas zod exportados de la ruta).
4. Modelo en `prisma/schema.prisma` y `pnpm db:migrate`.
5. Cablear en `app.ts`: añadir el repositorio a `AppDeps`, instanciarlo en `main.ts` y registrar la ruta con su `docs`.
6. Tests: unitarios de los casos de uso con un repo en memoria (`tests/support`) y tests HTTP con supertest sobre `buildApp`.

## Tests

- `tests/unit`: casos de uso con dobles en memoria. Sin BD ni red.
- `tests/http`: la app completa vía `buildApp` + supertest, con adaptadores en memoria.
- Los tests de repositorios Prisma contra una BD real aún no existen. Si se añaden, van en `tests/integration`.

## Agentes (`.claude/agents/`)

- `hexagonal-guardian`: revisa que los cambios respeten las reglas de dependencia. Lánzalo después de tocar `src/`.
- `module-scaffolder`: crea un módulo nuevo completo siguiendo los pasos de arriba.
- `test-writer`: escribe y ejecuta tests de Vitest.
- `prisma-migrator`: cambios de schema y migraciones, con revisión del SQL.
- `security-reviewer`: auditoría de auth, validación, datos expuestos y dependencias.

## Base de datos

Por defecto PostgreSQL (`@prisma/adapter-pg`). Para cambiarla: `provider` en `prisma/schema.prisma`, el adapter en `shared/infrastructure/persistence/prisma.ts` y la dependencia correspondiente (`@prisma/adapter-mariadb`, `@prisma/adapter-better-sqlite3`…).
