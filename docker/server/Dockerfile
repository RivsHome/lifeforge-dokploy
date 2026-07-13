# syntax=docker/dockerfile:1
FROM oven/bun:alpine AS builder
RUN apk update && apk add git
WORKDIR /lifeforge
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --linker isolated
RUN cd /lifeforge/packages/log && bun run build
RUN cd /lifeforge/packages/server-utils && bun run build
RUN cd /lifeforge/apps/api && bun run build
RUN bun -e "const pkg = require('./apps/api/package.json'); delete pkg.dependencies['@lifeforge/log']; delete pkg.dependencies['@lifeforge/server-utils']; delete pkg.devDependencies; require('fs').writeFileSync('./apps/api/package.docker.json', JSON.stringify(pkg, null, 2))"

FROM oven/bun:alpine AS production
RUN apk add --no-cache curl wget
WORKDIR /lifeforge
COPY --from=builder /lifeforge/apps/api/dist ./apps/api/dist
COPY --from=builder /lifeforge/packages/log/dist ./packages/log/dist
COPY --from=builder /lifeforge/packages/log/package.json ./packages/log/package.json
COPY --from=builder /lifeforge/packages/server-utils/dist ./packages/server-utils/dist
COPY --from=builder /lifeforge/packages/server-utils/package.json ./packages/server-utils/package.json
COPY --from=builder /lifeforge/apps/api/package.docker.json ./package.json
RUN bun install --production
RUN mkdir -p /lifeforge/modules
COPY docker/server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && sed -i 's/\r$//' /entrypoint.sh
EXPOSE 3636
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost:3636/ || exit 1
ENTRYPOINT ["/entrypoint.sh"]
