#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT_DIR/.logs"
LOG_FILE="$LOG_DIR/dev.log"
ENV_FILE="$ROOT_DIR/.env"

# All local app ports used by this monorepo services.
APP_PORTS=(3000 8080 4001 4002 4003 4004 4005)

mkdir -p "$LOG_DIR"

echo "[restart-dev] Stopping existing app processes (if any)..."

for port in "${APP_PORTS[@]}"; do
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "[restart-dev] Port $port in use. Killing PID(s): $pids"
    kill $pids 2>/dev/null || true
  fi
done

sleep 1

# Force kill if any process is still alive after graceful shutdown.
for port in "${APP_PORTS[@]}"; do
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "[restart-dev] Force killing remaining PID(s) on $port: $pids"
    kill -9 $pids 2>/dev/null || true
  fi
done

echo "[restart-dev] Starting app with npm run dev..."

cd "$ROOT_DIR"

if [[ -f "$ENV_FILE" ]]; then
  echo "[restart-dev] Loading environment from .env"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "[restart-dev] WARNING: .env not found at $ENV_FILE"
  echo "[restart-dev] Copy from .env.example: cp .env.example .env"
fi

# Ensure required packages (like concurrently) are installed
# If the project doesn't have the binary, run npm install to populate node_modules
if [[ ! -x "$ROOT_DIR/node_modules/.bin/concurrently" ]]; then
  echo "[restart-dev] 'concurrently' not found. Installing dependencies..."
  npm install --no-audit --no-fund
fi

nohup npm run dev >"$LOG_FILE" 2>&1 &

NEW_PID=$!
echo "$NEW_PID" > "$LOG_DIR/dev.pid"

sleep 2

if ! kill -0 "$NEW_PID" 2>/dev/null; then
  echo "[restart-dev] Failed to start. Check logs: $LOG_FILE"
  exit 1
fi

echo "[restart-dev] Started. PID: $NEW_PID"
echo "[restart-dev] Log file: $LOG_FILE"
echo "[restart-dev] Tail logs: tail -f $LOG_FILE"
