# syntax=docker/dockerfile:1
FROM oven/bun:alpine AS builder
RUN apk add --no-cache nodejs npm
ARG VITE_API_HOST=/api
ENV VITE_API_HOST=$VITE_API_HOST
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --linker isolated
RUN cd /app/packages/log && bun run build
RUN cd /app/packages/server-utils && bun run build
RUN set -e; for d in /app/modules/*; do \
      if [ -f "$d/client/vite.config.ts" ]; then \
        echo "Building module client $(basename "$d")"; \
        (cd "$d" && DOCKER_BUILD=true bun run build:client); \
      fi; \
    done
RUN cd /app/apps/web && node ./node_modules/vite/bin/vite.js build

FROM nginx:alpine
RUN apk add --no-cache curl
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
