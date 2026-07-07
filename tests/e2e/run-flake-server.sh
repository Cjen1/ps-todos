#!/usr/bin/env bash
set -euo pipefail

port="${PORT:-5173}"
package="${PS_TODOS_PACKAGE:-}"

if [ -z "$package" ]; then
  package="$(nix build --no-link --print-out-paths .#default)"
fi

data_dir="${PS_TODOS_DATA_DIR:-$(mktemp -d)}"
config_file="$(mktemp)"

cat > "$config_file" <<EOF
{
  "database": "$data_dir",
  "port": $port,
  "dashboards": {},
  "application": "$package/share/ps-todos/application"
}
EOF

exec "$package/bin/ps-todos-server" "$config_file" "$data_dir"
