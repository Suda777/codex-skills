#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_dir="$repo_root/skills"
codex_root="${CODEX_HOME:-$HOME/.codex}"
target_dir="$codex_root/skills"

mkdir -p "$target_dir"

for source_path in "$source_dir"/*; do
  [ -d "$source_path" ] || continue

  skill_name="$(basename "$source_path")"
  target_path="$target_dir/$skill_name"

  if [ -L "$target_path" ] && [ "$(readlink "$target_path")" = "$source_path" ]; then
    printf 'Already linked: %s\n' "$skill_name"
    continue
  fi

  if [ -e "$target_path" ] || [ -L "$target_path" ]; then
    printf 'Refusing to overwrite existing path: %s\n' "$target_path" >&2
    printf 'Move or remove that path manually, then run this script again.\n' >&2
    exit 1
  fi

  ln -s "$source_path" "$target_path"
  printf 'Linked: %s -> %s\n' "$target_path" "$source_path"
done

printf 'Installation complete. Start a new Codex task or restart Codex to reload skills.\n'
