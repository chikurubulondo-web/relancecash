#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
npm start -- -p "${PORT:-3000}"
