#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"

echo "Running baseline smoke checks..."

check_status() {
  local url="$1"
  local name="$2"
  local code
  local attempts=0
  while true; do
    attempts=$((attempts + 1))
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url")"
    if [[ "$code" == "200" ]]; then
      break
    fi
    # Retry transient rate-limit responses a few times.
    if [[ "$code" == "429" && "$attempts" -lt 5 ]]; then
      sleep 1
      continue
    fi
    break
  done
  if [[ "$code" != "200" ]]; then
    echo "FAIL: $name ($url) -> $code"
    exit 1
  fi
  echo "OK: $name"
}

check_status "$BASE_URL/" "web home"
check_status "$BASE_URL/quizzes" "web quizzes"
check_status "$BASE_URL/materials" "web materials"
check_status "$BASE_URL/leaderboard" "web leaderboard"

check_status "$API_BASE_URL/stats/summary" "stats summary"
check_status "$API_BASE_URL/stats/leaderboard?limit=10&period=all" "stats leaderboard all"
check_status "$API_BASE_URL/api/quizzes" "quiz list"
check_status "$API_BASE_URL/materials/subjects?lang=vi" "materials subjects"

echo "Baseline smoke checks completed successfully."
