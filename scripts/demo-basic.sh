#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../basic-example"
PORT=3457
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
  if curl -s "$BASE" >/dev/null 2>&1 || curl -s "$BASE/items/1" >/dev/null 2>&1; then
    break
  fi
  sleep 0.3
done
sleep 0.5

echo -e "${GREEN}Basic example running on port $PORT${NC}"

# ─────────────────────────────────────────────────────
header "FEATURE: Default Behavior (about:blank)"
# ─────────────────────────────────────────────────────

subheader "GET /items/42 — NotFoundException with custom message"
curl -s "$BASE/items/42" | jq .

subheader "GET /items — ForbiddenException with no message (boilerplate omitted)"
curl -s "$BASE/items" | jq .

subheader "POST /items — BadRequestException with string detail"
curl -s -X POST "$BASE/items" | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: @ProblemType() Decorator"
# ─────────────────────────────────────────────────────

subheader "POST /payments — InsufficientFundsException (custom type URI)"
curl -s -X POST "$BASE/payments" | jq .

subheader "GET /rate-limited — RateLimitExceededException (custom type URI)"
curl -s "$BASE/rate-limited" | jq .

# ─────────────────────────────────────────────────────
header "FEATURE: Tier 1 Validation (Flat Error Strings)"
# ─────────────────────────────────────────────────────

subheader "POST /users — Invalid body (missing fields, bad email, out-of-range age)"
curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "", "email": "not-an-email", "age": 200}' | jq .

subheader "POST /users — Valid body (success, no error)"
curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "age": 30}' | jq .

echo -e "\n${GREEN}Demo complete!${NC}"
