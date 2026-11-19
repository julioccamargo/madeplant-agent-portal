# Build Vite + React (sem segredos — /admin via proxy nginx em runtime)
# Debian slim: Tailwind/Oxide/Rollup com binários linux-gnu (Alpine musl falha no Dokploy)
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
ARG VITE_API_BASE=
ENV VITE_API_BASE=${VITE_API_BASE}
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build

FROM nginx:1.27-alpine AS final
RUN apk add --no-cache gettext
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]