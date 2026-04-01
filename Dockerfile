# Stage 1: Build
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/web/ packages/web/
COPY packages/api/ packages/api/

RUN pnpm --filter @dev-calendar/shared build
RUN pnpm --filter @dev-calendar/web build
RUN pnpm --filter @dev-calendar/api build

# Stage 2: Runtime
FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/api/dist packages/api/dist
COPY --from=build /app/packages/web/dist web-dist

EXPOSE 3000

CMD ["node", "packages/api/dist/index.js"]
