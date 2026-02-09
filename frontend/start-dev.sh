#!/bin/bash
# ============================================================
# Zuno App - Full Dev Launcher
# Kills stale processes, starts Backend + Metro fresh.
# Does NOT touch ADB/emulator if one is already running.
# ============================================================

METRO_PORT=8081
BACKEND_PORT=8000
BACKEND_DIR="../backend"
FALLBACK_AVD="testrunner"

echo "========================================"
echo "  Zuno Dev Launcher"
echo "========================================"
echo ""

# ---------------------------------------------------------
# STEP 1: Kill anything on Metro port (8081)
# ---------------------------------------------------------
echo "[1/4] Killing processes on port ${METRO_PORT}..."

PIDS=$(netstat -ano | grep ":${METRO_PORT}" | grep "LISTENING" | awk '{print $5}' | sort -u)
if [ -n "$PIDS" ]; then
  for PID in $PIDS; do
    echo "  Killing PID ${PID}..."
    taskkill //PID "$PID" //F || true
  done
else
  echo "  Port ${METRO_PORT} is already free."
fi

# ---------------------------------------------------------
# STEP 2: Kill anything on Backend port (8000)
# ---------------------------------------------------------
echo ""
echo "[2/4] Killing processes on port ${BACKEND_PORT}..."

PIDS=$(netstat -ano | grep ":${BACKEND_PORT}" | grep "LISTENING" | awk '{print $5}' | sort -u)
if [ -n "$PIDS" ]; then
  for PID in $PIDS; do
    echo "  Killing PID ${PID}..."
    taskkill //PID "$PID" //F || true
  done
else
  echo "  Port ${BACKEND_PORT} is already free."
fi

# ---------------------------------------------------------
# STEP 3: Start Backend server (background)
# ---------------------------------------------------------
echo ""
echo "========================================"
echo "[3/4] Starting Backend (port ${BACKEND_PORT})"
echo "========================================"
echo ""

if [ -d "${BACKEND_DIR}/venv" ]; then
  (
    cd "${BACKEND_DIR}" && \
    source venv/Scripts/activate || source venv/bin/activate && \
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port ${BACKEND_PORT} &
  )
  echo "  Backend starting in background..."
  sleep 2

  if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
    echo "  Backend is UP."
  else
    echo "  Backend still starting (may take a few seconds)..."
  fi
else
  echo "  WARNING: No venv found at ${BACKEND_DIR}/venv — skipping backend."
  echo "  Run: cd ${BACKEND_DIR} && python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt"
fi

# ---------------------------------------------------------
# STEP 4: Start Expo Dev Server
# ---------------------------------------------------------
echo ""
echo "========================================"
echo "[4/4] Starting Expo Dev Server (port ${METRO_PORT})"
echo "========================================"
echo ""

exec npx expo start --dev-client --clear
