#!/bin/sh

echo "Starting server..."

if [ "$NODE_ENV" = "production" ]; then
  exec npm run start:prod
else
  exec npm run start:dev
fi