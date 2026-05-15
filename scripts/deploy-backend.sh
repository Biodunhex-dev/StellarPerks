#!/usr/bin/env bash
# deploy-backend.sh — Build and start the backend service
set -euo pipefail

echo "==> Building backend..."
cd "$(dirname "$0")/.."
npm run build -w packages/backend

echo "==> Backend built. Start with:"
echo "    PORT=3001 API_KEY=<key> node packages/backend/dist/index.js"
echo ""
echo "    Or with Docker:"
echo "    docker build -f packages/backend/Dockerfile -t stellarperks-backend ."
echo "    docker run -p 3001:3001 -e API_KEY=<key> stellarperks-backend"
