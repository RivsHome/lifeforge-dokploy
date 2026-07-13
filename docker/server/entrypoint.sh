#!/bin/sh
set -e

echo "Waiting for PocketBase to be ready..."
until wget -q --spider http://db:8090/api/health 2>/dev/null; do
  echo "PocketBase not ready, waiting..."
  sleep 2
done

mkdir -p /lifeforge/node_modules/@lifeforge
ln -sf /lifeforge/packages/log /lifeforge/node_modules/@lifeforge/log
ln -sf /lifeforge/packages/server-utils /lifeforge/node_modules/@lifeforge/server-utils

echo "Starting server..."
cd /lifeforge/apps/api
exec bun dist/server.js
