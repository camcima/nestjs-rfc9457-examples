#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running basic example demo..."
"$SCRIPT_DIR/demo-basic.sh"

echo ""
echo "Running advanced example demo..."
"$SCRIPT_DIR/demo-advanced.sh"
