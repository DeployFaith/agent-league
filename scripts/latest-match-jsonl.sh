#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob

patterns=(
  "/tmp/match-start-*/match.jsonl"
  "/tmp/hashmatch-*/match.jsonl"
  "/tmp/agentleague-*/match.jsonl"
)

candidates=()
for pattern in "${patterns[@]}"; do
  for file in $pattern; do
    [[ -f "$file" ]] && candidates+=("$file")
  done
done

if [[ ${#candidates[@]} -eq 0 ]]; then
  echo "No match JSONL found. Run scripts/match-local.sh first or check /tmp for match-start/hashmatch/agentleague outputs." >&2
  exit 1
fi

latest="$(ls -t -- "${candidates[@]}" | head -n 1)"
echo "$latest"
