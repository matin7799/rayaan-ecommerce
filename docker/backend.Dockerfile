FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter backend... --prod=false

FROM deps AS build
WORKDIR /app
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json

# Only production dependencies for runtime
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter backend... --prod

COPY --from=build /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
USER nestjs
EXPOSE 3002
CMD ["node", "dist/main.js"]
