#!/bin/sh
# Regenerate the app's runtime configuration from container environment variables.
#
# nginx's official image runs every executable in /docker-entrypoint.d/ before starting,
# so this lands the current VITE_* values in config.js on each container start. That is
# what makes `docker run -e VITE_EVENT_SLUG=...` (and Dokploy's Environment tab) work on
# an already-built image — Vite otherwise inlines these at build time only.
set -eu

target="${NGINX_ROOT:-/usr/share/nginx/html}/config.js"

{
    printf 'window.__EVENT_CONFIG__ = {\n'
    # ponytail: values are escaped for backslash, double quote and CR only. Event config
    # is single-line text; a value containing a newline would need JSON encoding instead.
    for name in $(env | sed -n 's/^\(VITE_[A-Za-z0-9_]*\)=.*/\1/p' | sort); do
        value="$(printenv "$name" | tr -d '\r' | sed 's/\\/\\\\/g; s/"/\\"/g')"
        printf '  "%s": "%s",\n' "$name" "$value"
    done
    printf '}\n'
} > "$target"

echo "runtime config: $(grep -c '": "' "$target") VITE_* value(s) written to $target"
