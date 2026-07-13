# syntax=docker/dockerfile:1
FROM ghcr.io/muchobien/pocketbase:latest AS pocketbase

FROM oven/bun:alpine AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --linker isolated
RUN cd /app/packages/log && bun run build
RUN cd /app/packages/server-utils && bun run build
RUN cd /app/tools && bun run build
RUN mkdir -p /schemas && find /app/apps/api/src/lib -name "schema.ts" -exec sh -c 'mkdir -p /schemas/$(dirname ${1#/app/}) && cp "$1" /schemas/$(dirname ${1#/app/})/' _ {} \;

FROM oven/bun:alpine
COPY --from=pocketbase /usr/local/bin/pocketbase /usr/local/bin/pocketbase
WORKDIR /app
COPY --from=builder /app/tools/dist/forge.js ./forge.js
COPY --from=builder /schemas/apps/api/src/lib ./apps/api/src/lib
COPY --from=builder /app/packages/log/dist ./packages/log/dist
COPY --from=builder /app/packages/log/package.json ./packages/log/package.json
COPY --from=builder /app/packages/server-utils/dist ./packages/server-utils/dist
COPY --from=builder /app/packages/server-utils/package.json ./packages/server-utils/package.json
RUN mkdir -p node_modules/@lifeforge && \
    ln -sf /app/packages/log node_modules/@lifeforge/log && \
    ln -sf /app/packages/server-utils node_modules/@lifeforge/server-utils
RUN echo '{"dependencies":{"zod":"^4.0.0"}}' > package.json && bun install
ENV DOCKER_MODE=true
ENV PB_DIR=/pb_data
ENV PB_BINARY_PATH=/usr/local/bin/pocketbase
COPY docker/db-init/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && sed -i 's/\r$//' /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
