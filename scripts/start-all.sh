#!/usr/bin/env bash
# ==============================================================================
# RIVUE ALL-IN-ONE UNIVERSAL LAUNCHER
# Starts Backend Server + Live Cloudflare Public HTTPS Tunnel
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=========================================================="
echo "  🛡️ RIVUE CYBER-FORENSICS: STARTING UNIVERSAL PLATFORM"
echo "=========================================================="

# 1. Start backend server if not already running on port 3001
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
  echo "✓ Backend server is already running on port 3001."
else
  echo "Starting backend API server..."
  node backend/dist/server.js &
  sleep 2
fi

# 2. Start Cloudflare Tunnel if not running
if pgrep -f "cloudflared tunnel" >/dev/null ; then
  echo "✓ Cloudflare Tunnel is already running."
else
  echo "Starting Cloudflare Universal Public Tunnel..."
  ./bin/cloudflared tunnel --url http://localhost:3001 > /tmp/rivue_tunnel.log 2>&1 &
  sleep 4
fi

# 3. Detect and display URLs
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' /tmp/rivue_tunnel.log | tail -n 1 || echo "")

echo ""
echo "🚀 RIVUE PLATFORM IS LIVE & READY:"
echo "----------------------------------------------------------"
echo "  🌐 Universal Cloud URL (Any device, anywhere in world):"
echo "     ${TUNNEL_URL:-https://myth-subaru-following-understood.trycloudflare.com}"
echo ""
echo "  💻 Localhost Web Dashboard:"
echo "     http://localhost:3001"
echo ""
echo "  📱 Local Wi-Fi Device Access:"
echo "     http://${LOCAL_IP}:3001"
echo ""
echo "  📦 Android APK Download:"
echo "     http://localhost:3001/downloads/rivue-latest.apk"
echo "=========================================================="
