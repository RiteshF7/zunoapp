#!/usr/bin/env bash
# Force stop process(es) listening on the given port(s). Use when an old backend/dev server holds the port.
# Usage: ./scripts/kill-port.sh [port ...]
# Example: ./scripts/kill-port.sh 8000 8001 5173
set -e
PORTS="${*:-8000 8001}"

for port in $PORTS; do
  # Windows: find PID listening on port and taskkill
  if command -v netstat >/dev/null 2>&1; then
    # netstat -ano last column is PID; find LISTENING on :port
    pids=$(netstat -ano 2>/dev/null | awk -v p="$port" '$0 ~ ":"p && $0 ~ /LISTENING/ {print $NF}' | sort -u)
    for pid in $pids; do
      [ -z "$pid" ] || [[ ! "$pid" =~ ^[0-9]+$ ]] && continue
      if cmd //c "taskkill /F /PID $pid" 2>/dev/null; then
        echo "Killed PID $pid on port $port"
      fi
    done
  fi
done
echo "Done. Port(s): $PORTS"
