# syntax=docker/dockerfile:1

# --- Stage 1: install ALL deps (incl. Astro) and build the static site ---
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
# --include=dev guarantees Astro is installed even if the base image sets NODE_ENV.
RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi
# Source needed for the Astro build (src/, public/, assets/, config).
COPY astro.config.mjs tsconfig.json ./
COPY src ./src
COPY public ./public
COPY assets ./assets
RUN npm run build

# --- Stage 2: install prod-only deps for the runtime server ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# --- Stage 3: minimal runtime (Fastify serves dist/ + thin API) ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080
# Drop bundled package managers to shrink the attack surface.
RUN rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack \
    /opt/yarn-* \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json server.mjs ./
# Only projects.json is needed at runtime (the /api/projects source).
COPY --chown=node:node assets/projects.json ./assets/projects.json
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
CMD ["node", "server.mjs"]
