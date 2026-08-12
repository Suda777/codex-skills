# Pull and install workflow

Use this workflow to update the fixed personal repository and install one or all of its Skills.

## 1. Locate or clone the repository

- If `~/codex-skills` is absent, clone `https://github.com/Suda777/codex-skills.git` there.
- If it exists, require it to be a Git repository with the expected `origin`. Stop if the directory contains another repository or unrelated files.
- Inspect status, remote, current branch, upstream, and authentication.

## 2. Update without overwriting local work

1. Require a clean worktree before pulling. Do not auto-stash.
2. Fetch the remote and inspect ahead/behind state.
3. Use `git pull --ff-only` only when a fast-forward is possible.
4. Stop on local commits, branch divergence, merge requirements, or authentication failure. Do not reset, rebase, or resolve conflicts automatically.

Pulling updates the entire repository even when the user asks for one Skill. Make this explicit in the completion report; installation may still be limited to the named Skill.

## 3. Validate the requested Skills

- Require each repository Skill to be a directory containing a valid `SKILL.md`.
- Exclude repository metadata and any non-Skill directory.
- If one named Skill is absent, report it; do not substitute a similarly named Skill.

## 4. Install by link

For each requested Skill, inspect `~/.codex/skills/<skill-name>`:

- Missing: create a directory link to `~/codex-skills/skills/<skill-name>` using the platform-appropriate mechanism.
- Already linked to the exact repository directory: leave unchanged.
- Real file or directory, broken link, or link to another target: stop for that Skill and report the exact conflict.

Never delete, rename, move, merge, or overwrite the existing target. Do not link `.system` or plugin caches.

## 5. Verify installation

- Resolve each installed link and compare it with the expected repository path.
- Read `SKILL.md` through the installed path.
- Confirm the repository commit and branch state.
- Start a new Codex task to refresh Skill discovery. Recommend restarting Codex only if a new task still does not recognize the Skill.
