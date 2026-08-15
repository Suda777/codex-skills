---
name: sync-personal-codex-skills
description: Safely move all of the user's installed non-system Codex Skills, including self-created and third-party Skills, between devices and the fixed GitHub repository Suda777/codex-skills by uploading, pushing, pulling, installing, linking, and verifying them while preventing stale devices from overwriting newer remote work. Default every general upload or push request to all managed non-system Skills unless the user explicitly limits the scope to one named Skill. Use when the user explicitly asks to upload or push Skills, pull or download repository changes, install Skills on another device, or synchronize the Skill repository. Do not use when "更新", "修改", or "优化" means changing a Skill's instructions or workflow content; use maintain-personal-codex-skills for that. Do not use for system Skills, plugin-managed caches, or ordinary source-code repositories.
---

# Sync Personal Codex Skills

Keep one authoritative repository copy of every managed non-system Skill:

```text
<repo-root>/skills/<skill-name>       # real directory and Git source
~/.codex/skills/<skill-name>          # link used by Codex
Suda777/codex-skills                  # only allowed GitHub repository
```

Use optimistic concurrency for every upload: refresh before work, remember the remote base commit, and refresh again immediately before push. If another device changed the remote, inspect the new remote diff before acting. Integrate only changes that are clearly path-disjoint from the current upload, then repeat validation and the final remote check. Stop for the same Skill, shared repository files, semantic uncertainty, Git conflicts, or repeated remote movement instead of guessing how to combine them.

Resolve `<repo-root>` instead of assuming one machine-specific location. Prefer, in order: the current expected repository, the target of an installed personal-Skill link, an existing valid `~/codex-skills`, or a fresh clone to `~/codex-skills`.

Include self-created and third-party Skills installed directly under `~/.codex/skills/`. Treat `~/.codex/skills/.system/` and plugin-managed caches as out of scope. Never upload credentials, private logs, exported user data, or raw conversations.

## Select the operation

- For a general upload or push request that does not explicitly say "only" one named Skill, upload every managed non-system Skill and the directly required repository index changes. Treat full upload as the default, including newly created repository Skills that have not yet been installed locally.
- Limit an upload to one Skill only when the user explicitly says to upload only that named Skill.
- For upload, publish, push, or "把 Skill 放到 GitHub", read and follow [references/upload.md](references/upload.md).
- For pull, download, install, repository update, or use on another device, read and follow [references/pull-and-install.md](references/pull-and-install.md).
- For bidirectional "sync", inspect both sides first. If local and remote have both changed, stop and report the divergence; never guess which side wins.

The user has pre-authorized the normal upload and pull workflows for this fixed repository. Do not ask again before ordinary copy, link, commit, push, fetch, or fast-forward operations. Stop for conflicts, unrelated commits, sensitive data, destructive changes, authentication failure, or branch divergence.

## Non-negotiable safety rules

- Confirm the repository root and require `origin` to resolve to `https://github.com/Suda777/codex-skills.git` or its equivalent SSH URL.
- Before publishing a third-party Skill, identify its upstream source and license, confirm redistribution is allowed, and preserve required copyright, license, and notice files. Stop if the license is missing, unclear, or incompatible with redistribution.
- Inspect `git status`, `git remote -v`, `git branch -vv`, and authentication before changing anything.
- Never delete, move, overwrite, force-push, rebase, reset, auto-stash, or auto-resolve a conflict. A normal merge is allowed only by the upload workflow after proving that the remote changed disjoint Skill paths; abort and stop if the merge is not clean.
- Never push from a stale base. Fetch immediately before each push and require the remote branch to equal either the recorded upload base or the newer remote commit already inspected, integrated, and revalidated by the upload workflow. If a push is rejected because the remote moved again, fetch once, report both sides, and do not retry automatically.
- Never replace an existing real directory or an incorrect link under `~/.codex/skills/`.
- Never treat `git add skills` as proof that only the requested work will be pushed. Inspect both the staged diff and every unpushed commit.
- Prefer ordinary Git commands. Do not expose tokens or credential-manager output. Use another authenticated transport only when it preserves the same commit and non-force update semantics, and verify the remote afterward.
- Preserve unrelated user changes. If they overlap or make the operation ambiguous, stop and explain the exact paths involved.

## Completion criteria

Report success only after verifying all applicable facts:

- every requested non-system Skill has a valid `SKILL.md` in the repository;
- each installed Skill path is a link to the matching repository directory;
- local `HEAD` and the verified remote branch point to the expected commit after upload or pull;
- no concurrent remote update was overwritten, and any detected local/remote divergence was preserved and reported;
- no unexpected working-tree changes remain;
- Codex can discover the linked Skill, or the user is told to start a new task or restart Codex if the current task has not refreshed its Skill list.

Summarize the operation, affected Skills, commit, remote verification, conflicts skipped, and whether a restart may be needed.
