#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../advanced-example"
PORT=3459
BASE="http://localhost:$PORT"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

header() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${GREEN}$1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
subheader() { echo -e "\n${YELLOW}▸ $1${NC}\n"; }

# Install and build
echo "Installing dependencies..."
cd "$APP_DIR"
npm install --silent 2>/dev/null
npm run build --silent 2>/dev/null

# Start the app in background
PORT=$PORT node dist/main.js &
APP_PID=$!
trap "kill $APP_PID 2>/dev/null; exit" EXIT INT TERM

# Wait for app to be ready
for i in $(seq 1 30); do
  if curl -s "$BASE" >/dev/null 2>&1 || curl -s "$BASE/orders/1" >/dev/null 2>&1; then
    break
  fi
  sleep 0.3
done
sleep 0.5

echo -e "${GREEN}Advanced example running on port $PORT${NC}"

# ─────────────────────────────────────────────────────
header "FEATURE: typeBaseUri (Custom Type URIs)"
# ─────────────────────────────────────────────────────

subheader "GET /orders/999 — NotFoundException with typeBaseUri"
echo "Notice: type is 'https://api.example.com/problems/not-found' instead of 'about:blank'"
echo "Notice: instance contains a urn:uuid for correlation"
curl -s "$BASE/orders/999" | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: exceptionMapper with Extension Members"
# ─────────────────────────────────────────────────────

subheader "POST /orders — OrderConflictException mapped with extra fields"
echo "Notice: conflictingOrderId and existingOrderUrl are extension members"
curl -s -X POST "$BASE/orders" \
  -H "Content-Type: application/json" \
  -d '{"productId": "PROD-1", "quantity": 2, "shippingAddress": {"street": "123 Main St", "city": "Springfield", "zip": "62704"}}' | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: catchAllExceptions + exceptionMapper"
# ─────────────────────────────────────────────────────

subheader "GET /health/db — DatabaseConnectionException (non-HttpException, mapped by exceptionMapper)"
echo "Notice: This is a plain Error (not HttpException), handled by the mapper"
echo "Notice: retryAfter is an extension member"
curl -s "$BASE/health/db" | jq .

subheader "GET /health/crash — Unhandled Error (caught by catchAllExceptions)"
echo "Notice: Generic 500, no detail leaked, no stack trace"
curl -s "$BASE/health/crash" | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: Tier 2 Validation (Structured Errors)"
# ─────────────────────────────────────────────────────

subheader "POST /orders/validate — Nested DTO validation with structured output"
echo "Notice: errors have property + constraints (not flat strings)"
echo "Notice: nested address errors appear under children"
curl -s -X POST "$BASE/orders/validate" \
  -H "Content-Type: application/json" \
  -d '{"productId": "", "quantity": 0, "shippingAddress": {"street": "", "city": "", "zip": "invalid"}}' | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: ProblemDetailsFactory Direct Usage"
# ─────────────────────────────────────────────────────

subheader "GET /manual/build — Factory injected and called directly"
echo "Notice: Returns the raw { status, body } factory result"
curl -s "$BASE/manual/build" | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: instanceStrategy uuid (All Responses)"
# ─────────────────────────────────────────────────────

subheader "Every error response above included instance: urn:uuid:..."
echo "This provides unique correlation IDs for log lookups."
echo "Run any request again to see a different UUID each time:"
curl -s "$BASE/orders/999" | jq '.instance'

echo -e "\n${GREEN}Demo complete!${NC}"
