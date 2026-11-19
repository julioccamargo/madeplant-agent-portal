#!/bin/sh
set -eu

if [ -z "${API_UPSTREAM:-}" ]; then
  echo "Defina API_UPSTREAM (ex. http://madeplant-agent-api:8080 ou http://172.250.40.238:5080)" >&2
  exit 1
fi

if [ -z "${ADMIN_API_KEY:-}" ]; then
  echo "Defina ADMIN_API_KEY (mesmo valor da agent-api)" >&2
  exit 1
fi

export API_UPSTREAM ADMIN_API_KEY
envsubst '${API_UPSTREAM} ${ADMIN_API_KEY}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'