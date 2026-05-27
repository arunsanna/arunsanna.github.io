# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production     HOST=0.0.0.0     PORT=8080
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.mjs ./
COPY assets ./assets
COPY components ./components
COPY js ./js
COPY styles ./styles
COPY index.html ./index.html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3   CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
CMD ["node", "server.mjs"]
