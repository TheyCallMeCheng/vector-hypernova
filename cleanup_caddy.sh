#!/bin/bash
set -e

echo "Stopping Caddy (if running)..."
systemctl stop caddy 2>/dev/null || true
systemctl disable caddy 2>/dev/null || true

echo "Removing Caddy config..."
rm -f /etc/caddy/Caddyfile

echo "Caddy cleanup complete."
