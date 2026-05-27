# arunsanna.com Forge Migration

Goal: move `arunsanna.com` off GitHub Pages and onto ArunLabs Forge k3s so the site can grow from a static portfolio into a dynamic app.

## Current state

- Repo: `git@github.com:arunsanna/arunsanna.github.io.git`
- Branch for this setup: `feat/forge-dynamic-site-setup`
- DNS currently points `arunsanna.com` and `www.arunsanna.com` at GitHub Pages (`185.199.108/109/110/111.153`).
- Local app now runs as a Fastify service serving the existing static assets plus dynamic API endpoints:
  - `/healthz`
  - `/api/status`
  - `/api/projects`

## Local development

```bash
npm install
npm run dev
npm run smoke
```

Open <http://127.0.0.1:8080>.

## Container

```bash
docker build -t registry.arunlabs.com/arunsanna-site:dev .
docker run --rm -p 8080:8080 registry.arunlabs.com/arunsanna-site:dev
```

## Forge deployment draft

App manifests live in `deploy/forge/arunsanna-site/`:

```bash
kubectl --context forge apply -k deploy/forge/arunsanna-site
kubectl --context forge -n arunsanna-site rollout status deployment/arunsanna-site
```

Do **not** switch public DNS until the Forge edge prerequisites below are satisfied.

## Forge edge prerequisites

`arunsanna.com` is outside the existing `*.arunlabs.com` wildcard certificate. Before internet cutover, Forge needs:

1. A cert-manager issuer/solver that can answer DNS-01 for `arunsanna.com`.
2. A TLS secret in `istio-system`, e.g. `arunsanna-com-tls`, containing a cert for both `arunsanna.com` and `www.arunsanna.com`.
3. `istio-system/arunlabs-public-gateway` configured with SNI hosts for `arunsanna.com` and `www.arunsanna.com` using that TLS secret.
4. `deny-non-vpn-global` AuthorizationPolicy `notHosts` entries for both hosts.
5. Public DNS A/AAAA/CNAME records moved from GitHub Pages to the actual Forge public entrypoint.

The app VirtualService is already bound to `istio-system/arunlabs-public-gateway`.

## First dynamic backlog

- Replace `js/projects.js` static JSON fetch with `/api/projects`.
- Add `/api/profile` backed by a versioned content file or AI Memory export.
- Add admin-only content refresh path once auth is decided.
- Add GitHub Actions build/push once the registry credentials are available as repo secrets.
