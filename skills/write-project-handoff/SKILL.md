---
name: write-project-handoff
description: Create or resume project-scoped handoff files that let a new Codex task continue from verified project state. Use only when the user explicitly asks to "写交接", "准备 handoff", "保存项目进度", "换任务继续", "给下一个任务准备上下文", or to continue from a named project handoff. Require an identifiable project root and store handoffs locally under `codex/handoffs/`. Do not use for ordinary chats, generic conversation summaries, tasks without a project directory, or automatically because a conversation is long.
---

# Write Project Handoff

## Objective

Transfer the minimum useful project state to a new Codex task without exporting the conversation transcript. Preserve goals, decisions, evidence, project artifacts, unresolved work, and one concrete next action.

Keep every handoff inside the project and outside Git. Treat the live project as the source of truth and the handoff as a dated snapshot that must be checked before reuse.

## Choose the Workflow

- Create a handoff when the user explicitly asks to pause, switch tasks, or preserve project progress.
- Resume a handoff when the user names a handoff file or explicitly asks to continue from one.
- Do nothing for ordinary chats or work without an identifiable project directory.
- Never create a handoff automatically because the context is long or the task appears to be ending.

## Confirm the Project Root

Use the user-provided project path when available. Otherwise, for a Git project, use the repository root returned by `git rev-parse --show-toplevel`. Respect nearer project instructions such as `AGENTS.md`.

If the project root is ambiguous, ask the user before reading or writing. Never choose a broad directory such as the home directory, Desktop, Documents, or a workspace containing several unrelated projects.

Use project-relative paths inside the handoff whenever possible so the project remains portable.

## Keep Handoffs Local and Outside Git

Store all handoff artifacts under:

```text
<project-root>/codex/handoffs/
```

For a Git repository, verify the directory is ignored before creating the first handoff:

1. Check whether `codex/handoffs/` is already ignored.
2. If it is not ignored, resolve the repository-local exclude file with `git rev-parse --git-path info/exclude`.
3. Follow the active permission rules before changing Git metadata.
4. Add the exact pattern `/codex/handoffs/` to the local exclude file without duplicating an existing entry.
5. Do not edit the tracked `.gitignore` unless the user explicitly requests that different policy.

If any handoff file is already tracked, stop and report it. Do not untrack, delete, stage, commit, push, or otherwise alter Git history automatically.

For a non-Git project, create the local folder after write authorization and clearly state that no Git exclusion applies.

## Create Immutable Snapshots

Create each handoff directly in its final location using:

```text
YYYY-MM-DD-HHmm-<short-topic>.md
```

Use local project time. Keep the topic concise and filesystem-safe. Never overwrite an older handoff. If a correction or continuation is needed, create a new snapshot and mark the older related snapshot as superseded in `INDEX.md`.

Maintain:

```text
codex/handoffs/INDEX.md
```

Keep the newest entry first. Use columns for creation time, topic, status, file, and the snapshot it supersedes. Mark an older entry as superseded only when the new handoff continues the same workstream; do not assume that one project can have only one active task.

Never delete old handoffs unless the user explicitly requests a clearly scoped cleanup.

## Gather Checkable Project State

Before drafting, inspect only the project sources needed to establish the current state. Depending on the task, this can include:

- applicable `AGENTS.md`, README, plans, specifications, and source-of-truth documents;
- current Git branch, HEAD, working-tree status, and relevant changed filenames;
- current task list and the exact point where work stopped;
- produced code, documents, slides, spreadsheets, diagrams, research, or review artifacts;
- commands or checks actually run and their observed outcomes;
- decisions, constraints, blockers, open questions, and failed approaches from the current task.

Separate:

- observed facts verified in this task;
- user-reported or prior-task claims;
- Codex inferences;
- unverified or stale information.

Do not read unrelated private history or logs merely to make the handoff look complete. Do not include secrets, tokens, credentials, environment values, customer data, full transcripts, full diffs, or large copied source excerpts.

## Write the Core Handoff

Use this structure and omit empty optional sections:

```markdown
# Project Handoff: <topic>

- Created: <local timestamp>
- Project root: <absolute path for local recovery>
- Snapshot: <branch and HEAD when applicable>

## Goal and Completion Condition

## Current State

- Completed:
- In progress:
- Pending:
- Explicitly out of scope:

## Decisions and Boundaries

| Decision or constraint | Reason | Status |
|---|---|---|

## Sources and Artifacts

- `<project-relative path>` — <why it matters>

## Verification

- Observed:
- Reported but not independently checked:
- Not verified:

## Blockers, Open Questions, and Dead Ends

## Next Action

- First action:
- Expected result:
- After that:
```

For code tasks, add relevant branch, commit, changed-file, version, build, test, exact error, and restart information. Reference code by path and symbol rather than copying large blocks.

For documents, presentations, research, and other material tasks, add the audience, approved message, source materials, current draft or page state, accepted and rejected directions, missing evidence or assets, and user-unconfirmed placeholders.

Keep the handoff dense and task-specific. Do not duplicate content already available in referenced artifacts.

## Produce the Resume Prompt

After writing the handoff and updating `INDEX.md`, give the user a short prompt that names the exact handoff file. Do not duplicate the handoff contents in the prompt.

Use this pattern:

```text
请先读取：<exact-project-relative-handoff-path>

核对其中记录的项目文件、Git状态、产物和验证结果是否仍与现场一致。先告诉我：
1. 你理解的当前目标；
2. Handoff与现场存在的差异；
3. 你准备执行的第一步。

遵守当前项目权限规则，在获得所需授权前不要修改文件。
```

Report the created handoff path, the `INDEX.md` update, Git-ignore status, and any facts that remain unverified.

## Resume from a Handoff

When receiving a handoff:

1. Confirm that the named handoff belongs to the intended project.
2. Inspect the live project before relying on volatile details.
3. Compare branch, HEAD, working-tree state, referenced artifacts, and verification claims when applicable.
4. Classify the snapshot as `compatible`, `stale`, `mismatched`, or `unverifiable`.
5. Present the goal, important differences, and proposed first action before continuing.
6. Follow the active permission rules before making changes or running side-effecting commands.

Do not silently choose the newest file when several workstreams exist. Use the exact path supplied by the user or the resume prompt; if none is supplied and `INDEX.md` is ambiguous, ask which task to resume.

## Avoid These Failures

- Do not create project handoffs for ordinary conversations.
- Do not treat a handoff as long-term memory or as a transcript archive.
- Do not state that work is complete when only a prior claim supports it.
- Do not hide failed approaches that the next task could repeat.
- Do not write vague next steps such as "continue the work".
- Do not overwrite historical snapshots.
- Do not allow handoff files to enter Git.
