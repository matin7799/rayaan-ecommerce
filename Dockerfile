FROM node:20-alpine AS base
RUN apk add --no-cache caddy
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm --filter backend build
RUN pnpm --filter frontend build

FROM node:20-alpine AS runner
RUN apk add --no-cache caddy
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /app

ENV NODE_ENV=production

# Copy backend built files and package manifests
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install production dependencies for backend
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter backend... --prod

# Copy Next.js standalone folder output and assets
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

# Copy caddy configuration and startup script
COPY --from=build /app/docker/Caddyfile.combined ./Caddyfile
COPY --from=build /app/docker/start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose Caddy proxy port (usually 80, overridden by Liara's PORT environment variable)
EXPOSE 80

CMD ["./start.sh"]
