FROM node:22-alpine AS base
RUN npm install -g pnpm@9.15.9
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm --filter @repo/api db:generate
RUN pnpm --filter @repo/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/package.json ./
COPY --from=base /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
