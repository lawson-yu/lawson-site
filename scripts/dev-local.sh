#!/usr/bin/env bash
# Bring the Lawson Site local development stack up in tmux.
#
# Usage: scripts/dev-local.sh {up|down|status|logs|restart|attach}
set -euo pipefail

SESSION="lawson-site-dev"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_PORT=3000

die() { printf 'Error: %s\n' "$*" >&2; exit 1; }
port_up() { lsof -ti :"$1" -sTCP:LISTEN >/dev/null 2>&1; }

preflight() {
  command -v tmux >/dev/null 2>&1 || die "tmux not found. Install it with: brew install tmux"
  command -v pnpm >/dev/null 2>&1 || die "pnpm not found. Enable it with: corepack enable"
  [ -d "$ROOT/node_modules" ] || die "Dependencies are not installed. Run: pnpm install"
}

start_web() {
  if tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx web; then
    printf "web window already exists; leaving it running\n"
    return
  fi
  tmux new-window -t "$SESSION" -n web -c "$ROOT"
  tmux send-keys -t "$SESSION:web" 'pnpm dev' C-m
}

cmd_up() {
  preflight
  tmux has-session -t "$SESSION" 2>/dev/null || tmux new-session -d -s "$SESSION" -n _bootstrap -c "$ROOT"
  start_web
  tmux kill-window -t "$SESSION:_bootstrap" 2>/dev/null || true
  printf "Development server is starting in tmux session %s.\n" "$SESSION"
  printf "URL: http://localhost:%s\n" "$WEB_PORT"
}

cmd_status() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    tmux list-windows -t "$SESSION" -F '  #{window_index}: #{window_name}'
  else
    printf "tmux session %s is not running\n" "$SESSION"
  fi
  if port_up "$WEB_PORT"; then printf "  web: listening on :%s\n" "$WEB_PORT"; else printf "  web: not listening on :%s\n" "$WEB_PORT"; fi
}

cmd_logs() { tmux has-session -t "$SESSION" 2>/dev/null || die "session not running"; tmux capture-pane -p -S -400 -t "$SESSION:${1:?usage: logs web}"; }
cmd_restart() {
  [ "${1:-}" = web ] || die "unknown service: ${1:-}. Expected: web"
  tmux has-session -t "$SESSION" 2>/dev/null || die "session not running"
  tmux kill-window -t "$SESSION:web" 2>/dev/null || true
  start_web
}
cmd_attach() { tmux has-session -t "$SESSION" 2>/dev/null || die "not running; use: scripts/dev-local.sh up"; tmux attach -t "$SESSION"; }
cmd_down() { tmux kill-session -t "$SESSION" 2>/dev/null && printf "Development server stopped\n" || printf "No running session\n"; }

case "${1:-up}" in
  up) cmd_up ;;
  down) cmd_down ;;
  status) cmd_status ;;
  logs) cmd_logs "${2:-}" ;;
  restart) cmd_restart "${2:-}" ;;
  attach) cmd_attach ;;
  *) die "usage: $0 {up|down|status|logs web|restart web|attach}" ;;
esac
