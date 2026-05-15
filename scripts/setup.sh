#!/usr/bin/env bash
# setup.sh — Install all dependencies and build all packages
set -euo pipefail

echo "==> Installing Node dependencies..."
npm install

echo "==> Building SDK..."
npm run build -w packages/sdk

echo "==> Building backend..."
npm run build -w packages/backend

echo "==> Building frontend..."
npm run build -w packages/frontend

echo ""
echo "✅ All packages built successfully!"
echo ""
echo "To start development:"
echo "  Backend:  npm run dev:backend"
echo "  Frontend: npm run dev:frontend"
