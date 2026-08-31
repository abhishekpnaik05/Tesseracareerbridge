#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ ! -f client/.env ]; then
  cp client/.env.example client/.env
  echo "Created client/.env from client/.env.example"
fi

if [ ! -f database/.env ]; then
  cp .env database/.env
  echo "Created database/.env for Prisma"
fi

pnpm install
docker compose up -d
pnpm db:generate

echo ""
echo "Setup complete. Next:"
echo "  pnpm db:migrate"
echo "  pnpm dev"
