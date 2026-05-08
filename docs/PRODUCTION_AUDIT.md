# Production Readiness Report

## Score
- **62 / 100** (staging-ready, not production-ready)

## Critical Issues
- `POST /catalog/products` is public (no auth/role guard).
- Duplicate frontend auth/API stacks cause inconsistent behavior:
  - `apps/frontend/src/lib/store/auth-store.ts`
  - `apps/frontend/src/stores/auth.store.ts`
  - `apps/frontend/src/lib/api/client.ts`
  - `apps/frontend/src/services/api-client.ts`
- Frontend calls endpoints that backend does not expose (e.g. payment verify flow mismatch).
- Money columns are now `bigint` but still represented as JS `number` in many places.

## Security Issues
- Hardcoded JWT fallback secrets exist in config (must fail-fast in production).
- Access/refresh tokens are persisted in localStorage via Zustand persist.
- Upload endpoints lack strict MIME/size/extension enforcement in interceptor layer.
- Regex-based sanitize middleware is not a reliable security control and may corrupt input.
- Rate limiting is not consistently enforced on sensitive endpoints.
- CSRF strategy is unclear for cookie-based guest cart/session flows.

## Performance Issues
- N+1 risk in media resolution: `resolveProductMediaMap` loops and re-queries per product.
- Several list endpoints load relations eagerly without strict field projection.
- Query pagination exists in many places but not consistently applied across all list endpoints.

## Code Quality Issues
- Significant TODO/unfinished auth logic in frontend.
- Multiple `any` usages in critical paths.
- Inconsistent API response parsing (`data`, `data.data`, `data.data.data`) across frontend services.
- Inconsistent param validation pipes (`ParseUUIDPipe` missing in some id params).

## Concrete Fixes
1. Protect product write endpoints with `@Auth()` + `@Roles(Role.ADMIN, Role.SUPER_ADMIN)`.
2. Remove fallback secrets; enforce required env vars only.
3. Consolidate to one frontend auth store and one API client.
4. Align frontend endpoint constants with backend controller routes.
5. Introduce bigint-safe serialization/deserialization (string-based money transport).
6. Add strict multer limits + fileFilter + optional AV scan for uploads.
7. Remove/replace regex sanitize middleware; rely on DTO validation + ORM parameterization + output escaping.
8. Add consistent runtime response schema validation on frontend (e.g. zod) before mapping.
9. Fix N+1 media lookups by batching product-media retrieval in one query.
10. Enforce throttling on checkout/payment/admin/write endpoints.

---

# Security Audit

## High Risk
- Public catalog product creation endpoint.
- Token persistence in browser storage.
- Hardcoded JWT secret fallbacks.

## Medium Risk
- Upload validation hardening incomplete.
- CSRF controls not explicit for cookie/session flows.
- Debug logging may expose request data in development.

## Low Risk
- Inconsistent status/validation handling across some controllers.

## Immediate Remediation Priority
- **P0:** Guard catalog write endpoints, remove secret fallbacks, unify auth stack.
- **P1:** Upload hardening, bigint-safe money types, endpoint contract alignment.
- **P2:** N+1 optimization, validation consistency, response-shape normalization.

---

# Backend Problems List

## Validation/Guard Gaps
- `apps/backend/src/domains/catalog/controllers/catalog.controller.ts`
  - `POST /catalog/products` lacks auth/role guard.
- `apps/backend/src/domains/catalog/controllers/brands.controller.ts`
  - `:id` params are plain string (no `ParseUUIDPipe`).
- `apps/backend/src/domains/catalog/tags.controller.ts`
  - `:id` params are plain string (no `ParseUUIDPipe`).
- `apps/backend/src/domains/catalog/controllers/torob.controller.ts`
  - Uses interface DTO (no class-validator runtime validation).

## Error/Status Handling
- `apps/backend/src/health/health.controller.ts`
  - `ready` throws generic `Error` instead of HTTP exception type.

## Type/Data Alignment
- Bigint money columns still mapped to `number` in entities/services (overflow risk).

## Runtime/Performance
- `apps/backend/src/domains/media/media.service.ts`
  - `resolveProductMediaMap` uses per-product lookup loop (N+1).

---

# Frontend Problems List

## API Contract/Usage
- Endpoint mismatch exists for payment verification flow.
- Duplicate API clients use different default base paths (`/api` vs `/api/v1`).

## Auth State Handling
- Two incompatible auth stores in active code.
- TODO-based incomplete profile/token lifecycle.

## Stability/Type Safety
- Inconsistent response envelope parsing increases runtime crash risk.
- `any` usage remains in dashboard/order paths.

## Security
- Token persistence in localStorage (XSS blast radius).

## Frontend Fix Priority
1. Keep one auth store and one API client.
2. Centralize typed endpoint contracts.
3. Add response schema guards before mapping arrays.
4. Move long-lived tokens out of localStorage.
