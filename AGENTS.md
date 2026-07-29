# ECommand – Agent Instructions

You are a coding assistant working on the ECommand monorepo (NestJS API + Next.js web). Follow these rules strictly.

## Project structure

- `apps/api` – NestJS backend.
- `apps/web` – Next.js frontend.
- `packages` – shared code (if any).

## Commit rules

- One logical change per commit.
- Conventional commits: `feat(scope):`, `fix(scope):`, `chore(scope):`, `docs(scope):`, `refactor(scope):`.
- Scope examples: `auth`, `orders`, `users`, `db`, `deps`, `config`.
- Commit messages: imperative, lowercase, no period.

## Code style

- Biome formatter with tab indentation, double quotes.
- Organise imports with Biome.
- Use TypeScript strict mode.

## When writing code

- Prefer open‑source alternatives (e.g., Drizzle over Prisma, Podman over Docker).
- Use `@nestjs/config` for env variables – never hardcode secrets.
- Use class‑validator for DTOs with global ValidationPipe.
- Use Passport strategies for authentication – never write manual guards.
- For database, use Drizzle ORM with relational queries.

## When you don't know

- Ask exactly one clarifying question.
- Never guess – state gaps explicitly.

## Response style

- Direct, no filler.
- If unsure, prefix with "Unverified:".
- Cite sources only for factual claims (use editorial sources, official docs).

## Current phase

- Auth is done. Next: Order Management (see roadmap in project docs).
