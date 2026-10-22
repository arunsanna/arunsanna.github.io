#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-arunsanna-site}"
NAMESPACE="${NAMESPACE:-arunsanna-site}"
PRIVATE_HOST="${PRIVATE_HOST:-arunsanna.arunlabs.com}"
FORGE_HOST="${FORGE_HOST:-forge}"
KUBE_CONTEXT="${KUBE_CONTEXT:-forge}"
IMAGE_REPO="${IMAGE_REPO:-registry.arunlabs.com/${APP_NAME}}"
TAG="${TAG:-$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)}"
REMOTE_DIR="${REMOTE_DIR:-}"
KUSTOMIZE_DIR="${KUSTOMIZE_DIR:-deploy/forge/${APP_NAME}}"

if [[ ! -f Dockerfile || ! -f "${KUSTOMIZE_DIR}/kustomization.yaml" ]]; then
  echo "Run this script from the arunsanna.github.io repo root." >&2
  exit 1
fi

if [[ -z "${REMOTE_DIR}" ]]; then
  REMOTE_HOME="$(ssh "${FORGE_HOST}" 'printf "%s" "$HOME"')"
  REMOTE_DIR="${REMOTE_HOME}/${APP_NAME}-build"
fi

echo "[1/7] Syncing source to ${FORGE_HOST}:${REMOTE_DIR}"
rsync -az --delete \
  --exclude '.git/' \
  --exclude '.DS_Store' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude '.playwright-mcp/' \
  --exclude 'node_modules/' \
  ./ "${FORGE_HOST}:${REMOTE_DIR}/"

echo "[2/7] Building and pushing ${IMAGE_REPO}:${TAG} on ${FORGE_HOST}"
DIGEST="$(
  ssh "${FORGE_HOST}" bash -s -- "${REMOTE_DIR}" "${IMAGE_REPO}" "${TAG}" <<'EOF'
set -euo pipefail
REMOTE_DIR="$1"
IMAGE_REPO="$2"
TAG="$3"
IMAGE="${IMAGE_REPO}:${TAG}"
cd "$REMOTE_DIR"
docker build -t "$IMAGE" .
docker push "$IMAGE" >&2
docker image inspect "$IMAGE" --format '{{index .RepoDigests 0}}'
EOF
)"

if [[ "${DIGEST}" != "${IMAGE_REPO}@sha256:"* ]]; then
  echo "Unexpected digest from remote build: ${DIGEST}" >&2
  exit 1
fi

echo "[3/7] Ensuring ${PRIVATE_HOST} is allowed on the private gateway"
if ! kubectl --context "${KUBE_CONTEXT}" -n istio-system get gateway arunlabs-private-gateway \
  -o jsonpath='{range .spec.servers[*].hosts[*]}{@}{"\n"}{end}' | grep -qx "${PRIVATE_HOST}"; then
  kubectl --context "${KUBE_CONTEXT}" -n istio-system patch gateway arunlabs-private-gateway --type=json \
    -p="[{\"op\":\"add\",\"path\":\"/spec/servers/0/hosts/-\",\"value\":\"${PRIVATE_HOST}\"},{\"op\":\"add\",\"path\":\"/spec/servers/1/hosts/-\",\"value\":\"${PRIVATE_HOST}\"}]"
fi

echo "[4/7] Applying private Forge manifests"
kubectl --context "${KUBE_CONTEXT}" apply -k "${KUSTOMIZE_DIR}"

echo "[5/7] Pinning deployment to ${DIGEST}"
kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" set image "deployment/${APP_NAME}" "web=${DIGEST}"
kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" rollout status "deployment/${APP_NAME}" --timeout=300s

echo "[6/7] Verifying pods"
kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" get pods \
  -l "app.kubernetes.io/name=${APP_NAME}" \
  -o custom-columns=NAME:.metadata.name,READY:.status.containerStatuses[0].ready,IMAGE:.spec.containers[0].image,IMAGEID:.status.containerStatuses[0].imageID --no-headers

echo "[7/7] Private release complete"
echo "Host: https://${PRIVATE_HOST}"
echo "Image: ${DIGEST}"
