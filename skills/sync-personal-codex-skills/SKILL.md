---
name: sync-personal-codex-skills
description: Safely upload, pull, install, and verify the user's personal Codex Skills in the fixed GitHub repository Suda777/codex-skills. Use when the user asks to upload, publish, push, pull, download, install, update, or synchronize one or all of their personal Skills, including requests such as "上传这个 skill", "拉取我的 skill", "同步全部 skills", or "换设备安装 skills". Do not use for third-party Skill repositories, system Skills, plugins, or ordinary source-code repositories.
---

# Sync Personal Codex Skills

Keep one authoritative local copy of every personal Skill:

```text
~/codex-skills/skills/<skill-name>    # real directory and Git source
~/.codex/skills/<skill-name>          # link used by Codex
Suda777/codex-skills                  # only allowed GitHub repository
```

Treat `~/.codex/skills/.system/` and plugin caches as out of scope. Never upload credentials, private logs, exported user data, or raw conversations.

## Select the operation

- For upload, publish, push, or "把 Skill 放到 GitHub", read and follow [references/upload.md](references/upload.md).
- For pull, download, install, update, or use on another device, read and follow [references/pull-and-install.md](references/pull-and-install.md).
- For bidirectional "sync", inspect both sides first. If local and remote have both changed, stop and report the divergence; never guess which side wins.

The user has pre-authorized the normal upload and pull workflows for this fixed repository. Do not ask again before ordinary copy, link, commit, push, fetch, or fast-forward operations. Stop for conflicts, unrelated commits, sensitive data, destructive changes, authentication failure, or branch divergence.

## Non-negotiable safety rules

- Confirm the repository root and require `origin` to resolve to `https://github.com/Suda777/codex-skills.git` or its equivalent SSH URL.
- Inspect `git status`, `git remote -v`, `git branch -vv`, and authentication before changing anything.
- Never delete, move, overwrite, force-push, rebase, reset, auto-stash, or auto-resolve a conflict.
- Never replace an existing real directory or an incorrect link under `~/.codex/skills/`.
- Never treat `git add skills` as proof that only the requested work will be pushed. Inspect both the staged diff and every unpushed commit.
- Prefer ordinary Git commands. Do not expose tokens or credential-manager output. Use another authenticated transport only when it preserves the same commit and non-force update semantics, and verify the remote afterward.
- Preserve unrelated user changes. If they overlap or make the operation ambiguous, stop and explain the exact paths involved.

## Completion criteria

Report success only after verifying all applicable facts:

- every requested personal Skill has a valid `SKILL.md` in the repository;
- each installed Skill path is a link to the matching repository directory;
- local `HEAD` and the verified remote branch point to the expected commit after upload or pull;
- no unexpected working-tree changes remain;
- Codex can discover the linked Skill, or the user is told to start a new task or restart Codex if the current task has not refreshed its Skill list.

Summarize the operation, affected Skills, commit, remote verification, conflicts skipped, and whether a restart may be needed.
