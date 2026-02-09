#!/bin/bash
# ============================================================
# Zuno App - Dev Server Launcher
# Kills stale processes, clears ports, starts Metro fresh.
# ============================================================

PORT=8081

echo "========================================"
echo "  Zuno Dev Server Launcher"
echo "========================================"
echo ""

# 1. Kill any process listening on port 8081
echo "[1/4] Killing processes on port ${PORT}..."

PIDS=$(netstat -ano | grep ":${PORT}" | grep "LISTENING" | awk '{print $5}' | sort -u)
if [ -n "$PIDS" ]; then
  for PID in $PIDS; do
    echo "  Killing PID ${PID}..."
    taskkill //PID "$PID" //F || true
  done
else
  echo "  Port ${PORT} is already free."
fi

# 2. Kill stale connections on the port
echo ""
echo "[2/4] Cleaning up stale connections..."

STALE_PIDS=$(netstat -ano | grep ":${PORT}" | awk '{print $5}' | sort -u | grep -v "0" || true)
if [ -n "$STALE_PIDS" ]; then
  for PID in $STALE_PIDS; do
    echo "  Killing stale PID ${PID}..."
    taskkill //PID "$PID" //F || true
  done
else
  echo "  No stale connections."
fi

# 3. Reset ADB reverse port forwarding
echo ""
echo "[3/4] Resetting ADB port forwarding..."

adb reverse --remove-all || true
sleep 1
adb reverse tcp:${PORT} tcp:${PORT} || echo "  ADB reverse failed (will use LAN IP fallback)."

# 4. Wait for port to free up
echo ""
echo "[4/4] Waiting for port ${PORT}..."

RETRIES=0
while [ $RETRIES -lt 10 ]; do
  BUSY=$(netstat -ano | grep ":${PORT}" | grep "LISTENING" || true)
  if [ -z "$BUSY" ]; then
    echo "  Port ${PORT} is free!"
    break
  fi
  RETRIES=$((RETRIES + 1))
  echo "  Still busy, waiting... ($RETRIES/10)"
  sleep 1
done

# Start Metro
echo ""
echo "========================================"
echo "  Starting Expo Dev Server"
echo "========================================"
echo ""

exec npx expo start --dev-client --clear
