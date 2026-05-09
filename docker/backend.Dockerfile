FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter backend...

FROM deps AS build
COPY . .
RUN pnpm --filter backend build

FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
WORKDIR /app
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
USER nestjs
EXPOSE 3002
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
