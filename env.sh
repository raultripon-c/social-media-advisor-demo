#!/bin/bash

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >> ./env-config.js

# Read each line in .env file
while IFS= read -r line || [[ -n "$line" ]]; do
  line="$(trim "$line")"
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^# ]] && continue
  [[ "$line" != *"="* ]] && continue

  varname="${line%%=*}"
  varvalue="${line#*=}"
  varname="$(trim "$varname")"
  varvalue="$(trim "$varvalue")"

  # Prefer Kubernetes / shell env over file
  value="${!varname}"
  [[ -z "$value" ]] && value="${varvalue}"

  echo "  $varname: \"$value\"," >> ./env-config.js
done < .env

echo "}" >> ./env-config.js
