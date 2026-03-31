#!/bin/bash
#
# start-dev.sh — Auto-detect USB IP and start TOMI dev environment
#
# Usage:
#   ./start-dev.sh              # detect IP, update files, start Metro
#   ./start-dev.sh --ip-only    # just detect and update IP, don't start Metro
#   ./start-dev.sh --rebuild    # detect IP, update files, clean build, rebuild native app
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ─── Detect USB IP ──────────────────────────────────────────────────────
detect_usb_ip() {
  # Look for a 169.254.x.x (link-local) address on any en* interface
  local ip
  ip=$(ifconfig 2>/dev/null \
    | grep -A5 "^en[0-9]*:" \
    | grep "inet 169\.254\." \
    | head -1 \
    | awk '{print $2}')

  if [[ -z "$ip" ]]; then
    echo "⚠️  No USB link-local IP found. Is your iPhone connected via USB?"
    echo "   Falling back to manual entry..."
    read -rp "Enter your Mac's IP address: " ip
  fi

  echo "$ip"
}

USB_IP=$(detect_usb_ip)
echo "📱 Detected USB IP: $USB_IP"

# ─── Paths ──────────────────────────────────────────────────────────────
APPDELEGATE="ios/TOMI/AppDelegate.swift"
ENV_FILE=".env"
CONFIG_TS="services/config/config.ts"

# ─── Update AppDelegate.swift ──────────────────────────────────────────
if [[ -f "$APPDELEGATE" ]]; then
  # Replace any IP:8081 pattern in the Metro URL
  sed -i '' -E "s|http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:8081/|http://${USB_IP}:8081/|g" "$APPDELEGATE"
  echo "✅ Updated $APPDELEGATE → $USB_IP:8081"
else
  echo "⚠️  $APPDELEGATE not found, skipping"
fi

# ─── Update .env ────────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  sed -i '' -E "s|TOMI_API_BASE_URL=http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:8000|TOMI_API_BASE_URL=http://${USB_IP}:8000|" "$ENV_FILE"
  echo "✅ Updated $ENV_FILE → $USB_IP:8000"
else
  echo "⚠️  $ENV_FILE not found, skipping"
fi

# ─── Update config.ts ──────────────────────────────────────────────────
if [[ -f "$CONFIG_TS" ]]; then
  sed -i '' -E "s|http://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:8000|http://${USB_IP}:8000|g" "$CONFIG_TS"
  echo "✅ Updated $CONFIG_TS → $USB_IP:8000"
else
  echo "⚠️  $CONFIG_TS not found, skipping"
fi

echo ""
echo "🔗 Metro URL:   http://${USB_IP}:8081"
echo "🔗 Backend URL:  http://${USB_IP}:8000"
echo ""

# ─── Handle flags ───────────────────────────────────────────────────────
if [[ "${1:-}" == "--ip-only" ]]; then
  echo "Done. Files updated. Run Metro and rebuild separately."
  exit 0
fi

if [[ "${1:-}" == "--rebuild" ]]; then
  echo "🧹 Cleaning DerivedData..."
  rm -rf ~/Library/Developer/Xcode/DerivedData/TOMI-*
  echo "🔨 Rebuilding native app..."
  npx expo run:ios --device
  exit 0
fi

# ─── Default: start Metro ──────────────────────────────────────────────
echo "🚀 Starting Metro bundler..."
export REACT_NATIVE_PACKAGER_HOSTNAME="$USB_IP"
npx expo start --dev-client --port 8081
