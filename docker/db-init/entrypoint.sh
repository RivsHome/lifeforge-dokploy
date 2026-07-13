#!/bin/sh
set -e

echo "=== LifeForge DB Init ==="
mkdir -p /pb_data/pb_migrations
cd /app && bun ./forge.js --log-level debug db push
echo "=== DB Init Complete ==="
