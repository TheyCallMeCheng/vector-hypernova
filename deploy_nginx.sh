#!/bin/bash
set -e

echo "Deploying Nginx config to /etc/nginx/apps/vector-hypernova.conf..."
cp server/vector-hypernova.conf /etc/nginx/apps/vector-hypernova.conf

echo "Reloading Nginx..."
systemctl reload nginx

echo "Done! App should be accessible at https://proxima.i.vecr.me/play/"
