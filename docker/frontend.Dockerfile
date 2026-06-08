FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json apps/frontend/package.json
# Install all dependencies (including devDependencies) for the build stage
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter frontend... --prod=false

FROM deps AS build
WORKDIR /app
COPY apps/frontend ./apps/frontend
ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN pnpm --filter frontend build

FROM node:20-alpine AS runner
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Copy Next.js standalone folder output
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3001
CMD ["node", "apps/frontend/server.js"]
