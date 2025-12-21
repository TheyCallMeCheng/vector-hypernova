#!/bin/bash
set -e

echo "Deploying Caddyfile to /etc/caddy/Caddyfile..."
cp server/Caddyfile /etc/caddy/Caddyfile

echo "Reloading Caddy service..."
systemctl reload caddy

echo "Done! HTTPS should be active for https://proxima.i.vecr.me"
