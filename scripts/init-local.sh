#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required but not installed." >&2
  exit 1
fi

echo "Applying local D1 migrations..."
bun run db:migrate:local

echo "Seeding local D1 database..."
bun run db:seed:local

echo "Local D1 database ready. Run: bun run dev"
