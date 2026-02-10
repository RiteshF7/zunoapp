#!/bin/bash
# ============================================================
# Zuno App — Interactive Dev Console
# Menu-driven launcher for frontend, backend, logs, cleanup.
# ============================================================

METRO_PORT=8081
BACKEND_PORT=8000
BACKEND_DIR="../backend"
FRONTEND_DIR="."

# Log files (stored next to this script)
BACKEND_LOG="/tmp/zuno_backend.log"
FRONTEND_LOG="/tmp/zuno_frontend.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# ============================================================
# Helpers
# ============================================================

get_pids_on_port() {
  netstat -ano 2>/dev/null | grep ":$1" | grep "LISTENING" | awk '{print $5}' | sort -u
}

is_port_in_use() {
  local PIDS
  PIDS=$(get_pids_on_port "$1")
  [ -n "$PIDS" ]
}

kill_port() {
  local PORT=$1
  local NAME=$2
  local PIDS
  PIDS=$(get_pids_on_port "$PORT")
  if [ -n "$PIDS" ]; then
    for PID in $PIDS; do
      taskkill //PID "$PID" //F > /dev/null 2>&1 || true
    done
    echo -e "  ${GREEN}Killed ${NAME} (port ${PORT})${NC}"
  else
    echo -e "  ${DIM}${NAME} not running (port ${PORT} free)${NC}"
  fi
}

status_line() {
  local PORT=$1
  local NAME=$2
  if is_port_in_use "$PORT"; then
    echo -e "  ${GREEN}●${NC} ${NAME}: ${GREEN}RUNNING${NC} (port ${PORT})"
  else
    echo -e "  ${RED}●${NC} ${NAME}: ${DIM}STOPPED${NC}"
  fi
}

print_header() {
  clear
  echo ""
  echo -e "${CYAN}${BOLD}  ╔══════════════════════════════════════╗${NC}"
  echo -e "${CYAN}${BOLD}  ║        Zuno Dev Console  v2.0        ║${NC}"
  echo -e "${CYAN}${BOLD}  ╚══════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BOLD}  Status:${NC}"
  status_line "$BACKEND_PORT" "Backend (FastAPI)"
  status_line "$METRO_PORT" "Frontend (Expo)"
  echo ""
}

print_menu() {
  echo -e "${BOLD}  Commands:${NC}"
  echo ""
  echo -e "  ${CYAN}1${NC}  Start Backend"
  echo -e "  ${CYAN}2${NC}  Start Frontend (Expo)"
  echo -e "  ${CYAN}3${NC}  Start Both"
  echo -e "  ${CYAN}4${NC}  Stop Backend"
  echo -e "  ${CYAN}5${NC}  Stop Frontend"
  echo -e "  ${CYAN}6${NC}  Stop Both (Kill All)"
  echo ""
  echo -e "  ${CYAN}7${NC}  Show Backend Logs"
  echo -e "  ${CYAN}8${NC}  Show Frontend Logs"
  echo ""
  echo -e "  ${CYAN}9${NC}  Clean Metro Cache & Restart Frontend"
  echo -e "  ${CYAN}0${NC}  Nuke Everything (kill + clean cache)"
  echo ""
  echo -e "  ${CYAN}a${NC}  Open Android Emulator"
  echo -e "  ${CYAN}r${NC}  Reload App (send reload to Metro)"
  echo -e "  ${CYAN}f${NC}  Refresh Frontend (full restart)"
  echo ""
  echo -e "  ${CYAN}q${NC}  Quit (keeps servers running)"
  echo -e "  ${CYAN}x${NC}  Quit & Kill All Servers"
  echo ""
}

wait_for_key() {
  echo ""
  echo -e "  ${DIM}Press Enter to return to menu...${NC}"
  read -r
}

# ============================================================
# Actions
# ============================================================

start_backend() {
  if is_port_in_use "$BACKEND_PORT"; then
    echo -e "  ${YELLOW}Backend already running on port ${BACKEND_PORT}${NC}"
    return
  fi

  if [ ! -d "${BACKEND_DIR}/venv" ]; then
    echo -e "  ${RED}ERROR: No venv found at ${BACKEND_DIR}/venv${NC}"
    echo -e "  ${DIM}Run: cd ${BACKEND_DIR} && python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt${NC}"
    return
  fi

  echo -e "  ${CYAN}Starting backend...${NC}"
  (
    cd "${BACKEND_DIR}" && \
    source venv/Scripts/activate 2>/dev/null || source venv/bin/activate 2>/dev/null && \
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port ${BACKEND_PORT} \
      > "${BACKEND_LOG}" 2>&1 &
  )

  # Wait for it to come up
  local attempts=0
  while [ $attempts -lt 10 ]; do
    sleep 1
    if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
      echo -e "  ${GREEN}Backend is UP on port ${BACKEND_PORT}${NC}"
      return
    fi
    attempts=$((attempts + 1))
  done
  echo -e "  ${YELLOW}Backend started but health check pending — check logs${NC}"
}

start_frontend() {
  if is_port_in_use "$METRO_PORT"; then
    echo -e "  ${YELLOW}Frontend already running on port ${METRO_PORT}${NC}"
    return
  fi

  echo -e "  ${CYAN}Starting Expo dev server...${NC}"
  echo -e "  ${DIM}Logs: ${FRONTEND_LOG}${NC}"
  echo ""

  # Start in background, streaming to log file
  npx expo start --dev-client > "${FRONTEND_LOG}" 2>&1 &
  local EXPO_PID=$!

  # Wait for Metro to bind to port
  local attempts=0
  while [ $attempts -lt 15 ]; do
    sleep 1
    if is_port_in_use "$METRO_PORT"; then
      echo -e "  ${GREEN}Expo dev server is UP on port ${METRO_PORT}${NC}"
      echo -e "  ${DIM}PID: ${EXPO_PID}${NC}"
      return
    fi
    attempts=$((attempts + 1))
  done
  echo -e "  ${YELLOW}Expo started (PID ${EXPO_PID}) but port not yet bound — check logs${NC}"
}

start_frontend_clean() {
  echo -e "  ${CYAN}Cleaning Metro cache...${NC}"

  # Remove cache directories
  rm -rf node_modules/.cache 2>/dev/null
  rm -rf /tmp/metro-* 2>/dev/null
  rm -rf "$LOCALAPPDATA/Temp/metro-*" 2>/dev/null
  rm -rf .expo/web/cache 2>/dev/null

  echo -e "  ${GREEN}Cache cleared${NC}"

  # Kill existing frontend if running
  kill_port "$METRO_PORT" "Frontend"
  sleep 1

  echo -e "  ${CYAN}Starting Expo with --clear flag...${NC}"
  echo ""

  npx expo start --dev-client --clear > "${FRONTEND_LOG}" 2>&1 &
  local EXPO_PID=$!

  local attempts=0
  while [ $attempts -lt 20 ]; do
    sleep 1
    if is_port_in_use "$METRO_PORT"; then
      echo -e "  ${GREEN}Expo dev server is UP (clean) on port ${METRO_PORT}${NC}"
      echo -e "  ${DIM}PID: ${EXPO_PID}${NC}"
      return
    fi
    attempts=$((attempts + 1))
  done
  echo -e "  ${YELLOW}Expo started (PID ${EXPO_PID}) — may still be loading, check logs${NC}"
}

stop_backend() {
  kill_port "$BACKEND_PORT" "Backend"
}

stop_frontend() {
  kill_port "$METRO_PORT" "Frontend"
}

stop_all() {
  echo -e "  ${CYAN}Stopping all servers...${NC}"
  kill_port "$BACKEND_PORT" "Backend"
  kill_port "$METRO_PORT" "Frontend"
  echo -e "  ${GREEN}All servers stopped${NC}"
}

show_backend_logs() {
  if [ ! -f "$BACKEND_LOG" ]; then
    echo -e "  ${DIM}No backend logs found. Start the backend first.${NC}"
    return
  fi
  echo -e "  ${BOLD}=== Backend Logs (last 50 lines) ===${NC}"
  echo -e "  ${DIM}Full log: ${BACKEND_LOG}${NC}"
  echo ""
  tail -50 "$BACKEND_LOG"
}

show_frontend_logs() {
  if [ ! -f "$FRONTEND_LOG" ]; then
    echo -e "  ${DIM}No frontend logs found. Start the frontend first.${NC}"
    return
  fi
  echo -e "  ${BOLD}=== Frontend Logs (last 50 lines) ===${NC}"
  echo -e "  ${DIM}Full log: ${FRONTEND_LOG}${NC}"
  echo ""
  tail -50 "$FRONTEND_LOG"
}

nuke_everything() {
  echo -e "  ${RED}${BOLD}NUKE: Killing all servers + cleaning all caches${NC}"
  echo ""

  # Kill servers
  kill_port "$BACKEND_PORT" "Backend"
  kill_port "$METRO_PORT" "Frontend"

  # Clean Metro cache
  echo -e "  ${CYAN}Cleaning Metro cache...${NC}"
  rm -rf node_modules/.cache 2>/dev/null
  rm -rf /tmp/metro-* 2>/dev/null
  rm -rf "$LOCALAPPDATA/Temp/metro-*" 2>/dev/null
  rm -rf .expo/web/cache 2>/dev/null

  # Clean React Query cache
  echo -e "  ${CYAN}Cleaning async storage cache...${NC}"

  # Clean log files
  rm -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null

  echo ""
  echo -e "  ${GREEN}Everything nuked. Fresh start ready.${NC}"
}

open_android() {
  echo -e "  ${CYAN}Sending open-android command to Expo...${NC}"
  if is_port_in_use "$METRO_PORT"; then
    # Send 'a' keystroke to Expo dev server via the dev tools URL
    curl -s "http://localhost:${METRO_PORT}/open?platform=android" > /dev/null 2>&1 || true
    echo -e "  ${GREEN}Sent open request to Expo${NC}"
  else
    echo -e "  ${RED}Frontend not running — start it first${NC}"
  fi
}

reload_app() {
  echo -e "  ${CYAN}Sending reload command to Metro...${NC}"
  if is_port_in_use "$METRO_PORT"; then
    curl -s "http://localhost:${METRO_PORT}/reload" > /dev/null 2>&1 || true
    echo -e "  ${GREEN}Reload signal sent${NC}"
  else
    echo -e "  ${RED}Frontend not running — start it first${NC}"
  fi
}

refresh_frontend() {
  echo -e "  ${CYAN}Refreshing frontend (stop → start)...${NC}"
  kill_port "$METRO_PORT" "Frontend"
  sleep 2
  echo -e "  ${CYAN}Restarting Expo dev server...${NC}"
  npx expo start --dev-client > "${FRONTEND_LOG}" 2>&1 &
  local EXPO_PID=$!
  local attempts=0
  while [ $attempts -lt 15 ]; do
    sleep 1
    if is_port_in_use "$METRO_PORT"; then
      echo -e "  ${GREEN}Frontend refreshed and UP on port ${METRO_PORT}${NC}"
      echo -e "  ${DIM}PID: ${EXPO_PID}${NC}"
      return
    fi
    attempts=$((attempts + 1))
  done
  echo -e "  ${YELLOW}Expo restarting (PID ${EXPO_PID}) — check logs${NC}"
}

# ============================================================
# Handle direct CLI args (e.g. `bash start-dev.sh start`)
# ============================================================

if [ -n "$1" ]; then
  case "$1" in
    start)       start_backend; start_frontend ;;
    stop)        stop_all ;;
    backend)     start_backend ;;
    frontend)    start_frontend ;;
    clean)       start_frontend_clean ;;
    refresh)     refresh_frontend ;;
    nuke)        nuke_everything ;;
    logs-be)     show_backend_logs ;;
    logs-fe)     show_frontend_logs ;;
    *)           echo "Usage: $0 [start|stop|backend|frontend|clean|refresh|nuke|logs-be|logs-fe]" ;;
  esac
  exit 0
fi

# ============================================================
# Interactive Menu Loop
# ============================================================

while true; do
  print_header
  print_menu

  echo -ne "  ${BOLD}> ${NC}"
  read -r choice

  echo ""

  case "$choice" in
    1)  start_backend;        wait_for_key ;;
    2)  start_frontend;       wait_for_key ;;
    3)  start_backend; echo ""; start_frontend; wait_for_key ;;
    4)  stop_backend;         wait_for_key ;;
    5)  stop_frontend;        wait_for_key ;;
    6)  stop_all;             wait_for_key ;;
    7)  show_backend_logs;    wait_for_key ;;
    8)  show_frontend_logs;   wait_for_key ;;
    9)  start_frontend_clean; wait_for_key ;;
    0)  nuke_everything;      wait_for_key ;;
    a|A) open_android;        wait_for_key ;;
    r|R) reload_app;          wait_for_key ;;
    f|F) refresh_frontend;    wait_for_key ;;
    q|Q)
      echo -e "  ${DIM}Exiting (servers keep running)...${NC}"
      exit 0
      ;;
    x|X)
      stop_all
      echo -e "  ${DIM}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "  ${RED}Invalid choice. Try again.${NC}"
      sleep 1
      ;;
  esac
done
