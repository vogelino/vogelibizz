#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if ! command -v docker-compose >/dev/null 2>&1; then
  echo "docker-compose is required but not installed." >&2
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required but not installed." >&2
  exit 1
fi

echo "Starting local Postgres via docker-compose..."
docker-compose up -d

echo "Applying schema with drizzle-kit..."
POSTGRES_MIGRATING=true \
NEXT_PUBLIC_BASE_URL=http://localhost:3000 \
NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY=${NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY:-""} \
AUTH_SECRET=${AUTH_SECRET:-""} \
AUTH_GITHUB_ID=${AUTH_GITHUB_ID:-""} \
AUTH_GITHUB_SECRET=${AUTH_GITHUB_SECRET:-""} \
AUTH_ADMIN_EMAILS=${AUTH_ADMIN_EMAILS:-""} \
POSTGRES_URL=${POSTGRES_URL:-"postgresql://postgres:postgres@localhost:5432/vogelibizz"} \
bunx drizzle-kit push --force

echo "Seeding database..."
POSTGRES_SEEDING=true \
NEXT_PUBLIC_BASE_URL=http://localhost:3000 \
NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY=${NEXT_PUBLIC_OPENEXCHANGERATES_API_KEY:-""} \
AUTH_SECRET=${AUTH_SECRET:-""} \
AUTH_GITHUB_ID=${AUTH_GITHUB_ID:-""} \
AUTH_GITHUB_SECRET=${AUTH_GITHUB_SECRET:-""} \
AUTH_ADMIN_EMAILS=${AUTH_ADMIN_EMAILS:-""} \
POSTGRES_URL=${POSTGRES_URL:-"postgresql://postgres:postgres@localhost:5432/vogelibizz"} \
bun run ./src/db/seed.ts

echo "Local database ready. Run: bun run dev"
