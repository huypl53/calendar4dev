#!/bin/bash
# Burn-in test runner: runs changed E2E specs multiple times to detect flakiness
# Usage: ./scripts/burn-in-changed.sh [iterations] [base-branch]

set -e

ITERATIONS=${1:-10}
BASE_BRANCH=${2:-main}

echo "Burn-In Test Runner"
echo "Iterations: $ITERATIONS | Base branch: $BASE_BRANCH"
echo ""

# Detect changed E2E test files
CHANGED_SPECS=$(git diff --name-only "$BASE_BRANCH"...HEAD -- 'playwright/e2e/**' | grep -E '\.(spec|test)\.(ts|js)$' || echo "")

if [ -z "$CHANGED_SPECS" ]; then
  echo "No E2E test files changed. Skipping burn-in."
  exit 0
fi

SPEC_COUNT=$(echo "$CHANGED_SPECS" | wc -l | xargs)
echo "Changed E2E specs ($SPEC_COUNT):"
echo "$CHANGED_SPECS" | sed 's/^/  - /'
echo ""

for i in $(seq 1 "$ITERATIONS"); do
  echo "--- Iteration $i/$ITERATIONS ---"
  if pnpm test:e2e -- $CHANGED_SPECS; then
    echo "Iteration $i passed"
  else
    echo "FAILED on iteration $i"
    exit 1
  fi
done

echo ""
echo "Burn-in passed: $ITERATIONS/$ITERATIONS iterations for $SPEC_COUNT spec(s)"
