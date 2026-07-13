# syntax=docker/dockerfile:1
FROM oven/bun:alpine AS builder
ARG VITE_API_HOST=/api
ENV VITE_API_HOST=$VITE_API_HOST
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --linker isolated
RUN cd /app/packages/log && bun run build
RUN cd /app/packages/server-utils && bun run build
RUN cd /app/apps/web && bunx vite build

FROM nginx:alpine
RUN apk add --no-cache curl
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
