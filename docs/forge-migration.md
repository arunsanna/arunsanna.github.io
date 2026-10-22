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
scripts/release-forge-private.sh
```

Do not build release images on the local Apple Silicon machine. Forge is x86_64, so build and test release images on the Forge host.

## Forge deployment draft

App manifests live in `deploy/forge/arunsanna-site/`:

```bash
scripts/release-forge-private.sh
```

Do **not** switch public DNS until the Forge edge prerequisites below are satisfied.

## Forge edge prerequisites

`arunsanna.com` is outside the existing `*.arunlabs.com` wildcard certificate. Before internet cutover, Forge needs:

1. A cert-manager issuer/solver that can answer DNS-01 for `arunsanna.com`.
2. A TLS secret in `istio-system`, e.g. `arunsanna-com-tls`, containing a cert for both `arunsanna.com` and `www.arunsanna.com`.
3. `istio-system/arunlabs-public-gateway` configured with SNI hosts for `arunsanna.com` and `www.arunsanna.com` using that TLS secret.
4. `deny-non-vpn-global` AuthorizationPolicy `notHosts` entries for both hosts.
5. Public DNS A/AAAA/CNAME records moved from GitHub Pages to the actual Forge public entrypoint.

The private review VirtualService is bound to `istio-system/arunlabs-private-gateway` for `arunsanna.arunlabs.com`. Add a separate public binding only after the edge prerequisites above are complete.

## Public launch via arunlabs.com (2026-06-03)

The site is now publicly served at **`https://arunsanna.arunlabs.com`** using the existing
`*.arunlabs.com` edge (no `arunsanna.com` cutover yet — that domain stays on GitHub Pages as fallback).
Steps taken (each reversible):

1. **Route53** (`arunlabs.com` zone `ZZ2WAMEXUUA0Q`): `arunsanna.arunlabs.com` A record
   `172.16.0.191` (LAN ingress) → `173.73.243.244` (public ingress).
2. **VirtualService** bound to `istio-system/arunlabs-public-gateway` (+ private), which terminates
   TLS with the `arunlabs-wildcard-tls` (`*.arunlabs.com`) cert.
3. **`deny-non-vpn-global`** AuthorizationPolicy: added `arunsanna.arunlabs.com` to `notHosts`
   (mirrors the `claims-integrity.arunlabs.com` public allow).
4. **Deleted** the `arunsanna-site-lan-only` deny.

To revert to VPN-only: restore the A record to `172.16.0.191`, drop the host from
`deny-non-vpn-global` `notHosts`, and re-add a LAN-only `AuthorizationPolicy`.

> **Deploy gotcha:** `kustomization.yaml` pins the live image digest. `kubectl apply -k` resets the
> deployment to that digest, so after `scripts/release-forge-private.sh` builds a new image, update the
> `images[].digest` in `kustomization.yaml` to match — otherwise the next `apply -k` rolls the site back.

## Stack & backlog

The site is now an **Astro static build served by Fastify** (`server.mjs` serves `dist/` + the thin
API). Next dynamic surfaces:

- `/api/contact` for a real contact form (replace mailto).
- Cached `/api/github` for live repo stars/activity.
- `/api/profile` backed by a versioned content file or AI Memory export.
- GitHub Actions build/push once registry credentials are available as repo secrets.
