#!/usr/bin/env bash
set -euo pipefail

# 1) Build the project to generate .next
npm run build

# 2) Ensure we have a .env to read
if [[ ! -f .env ]]; then
  echo ".env not found. Skipping leakage check."
  exit 0
fi

# 3) Ensure client bundle directory exists
if [[ ! -d .next/static ]]; then
  echo ".next/static not found. Did the build succeed?"
  exit 1
fi

found_any=0

# 4) Read .env and look for each value in the client bundle
# - Ignore blank lines and comments
# - Only handle simple KEY=VALUE lines
while IFS= read -r line; do
  # trim CR (for Windows-style newlines)
  line="${line%$'\r'}"

  # skip comments/blank lines
  [[ -z "$line" || "$line" =~ ^\s*# ]] && continue

  # match KEY=VALUE
  if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    key="${line%%=*}"
    value="${line#*=}"

    # strip surrounding quotes if present
    if [[ "$value" =~ ^\".*\"$ ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    # skip empty values
    if [[ -z "$value" ]]; then
      continue
    fi

    # search for the exact value in client bundle
    if grep -R -n -F -- "$value" .next/static >/dev/null 2>&1; then
      echo "found leakage for ${key}"
      found_any=1
    fi
  fi
done < .env

if [[ "$found_any" -eq 0 ]]; then
  echo "not found leakage"
  exit 0
else
  exit 1
fi
