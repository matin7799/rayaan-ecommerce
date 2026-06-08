#!/bin/sh

# Start NestJS backend
echo "Starting NestJS Backend on port 3002..."
PORT=3002 node apps/backend/dist/main.js &
BACKEND_PID=$!

# Start Next.js frontend
echo "Starting Next.js Frontend on port 3001..."
PORT=3001 HOSTNAME=127.0.0.1 node apps/frontend/server.js &
FRONTEND_PID=$!

# Start Caddy in background
echo "Starting Caddy Reverse Proxy..."
caddy start --config Caddyfile --adapter caddyfile

echo "Monitoring background processes (Backend: $BACKEND_PID, Frontend: $FRONTEND_PID)..."

# Monitor processes
while true; do
  if [ ! -d "/proc/$BACKEND_PID" ]; then
    echo "Error: NestJS Backend (PID $BACKEND_PID) exited. Stopping container."
    exit 1
  fi
  if [ ! -d "/proc/$FRONTEND_PID" ]; then
    echo "Error: Next.js Frontend (PID $FRONTEND_PID) exited. Stopping container."
    exit 1
  fi
  sleep 5
done
