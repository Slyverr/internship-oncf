#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
repo_root=$(cd -- "$script_dir/.." && pwd -P)
working_dir=$(pwd -P)
node_image=${ECOMMAND_NODE_IMAGE:-docker.io/library/node:24-alpine}

case "$working_dir" in
  "$repo_root") relative_working_dir="" ;;
  "$repo_root"/*) relative_working_dir="${working_dir#"$repo_root"}" ;;
  *)
    echo "Run this helper from inside the ECommand repository." >&2
    exit 2
    ;;
esac

node_args=()
for argument in "$@"; do
  if [[ "$argument" == "$repo_root"/* ]]; then
    node_args+=("/repo${argument#"$repo_root"}")
  else
    node_args+=("$argument")
  fi
done

podman_args=(run --rm --network host)
for variable in \
  AUTH_LOGIN_LOCK_DURATION_SECONDS \
  AUTH_LOGIN_MAX_ATTEMPTS \
  BACKEND_API_URL \
  DATABASE_URL \
  JWT_EXPIRES_IN \
  JWT_SECRET \
  LOCAL_MAILBOX_PATH \
  NESTJS_PORT \
  NEXT_BUILD_DIST_DIR \
  NEXT_PUBLIC_SITE_URL \
  PLAYWRIGHT_CDP_ENDPOINT \
  PORT \
  STORAGE_PATH \
  WEB_APP_URL; do
  if [[ -v "$variable" ]]; then
    podman_args+=(-e "$variable=${!variable}")
  fi
done

exec podman "${podman_args[@]}" \
  -e PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/repo/node_modules/.bin:/repo/apps/api/node_modules/.bin \
  -e NODE_PATH=/repo/node_modules \
  -v "$repo_root:/repo:Z" \
  -w "/repo${relative_working_dir}" \
  "$node_image" node "${node_args[@]}"
