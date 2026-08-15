---
name: maintain-personal-codex-skills
description: Audit one or all of the user's personally maintained Codex Skills, including fully self-created Skills and third-party Skills customized with the user's own rules, using evidence from accessible Codex conversations and the latest verified Suda777/codex-skills repository state. Propose concrete changes and apply only changes the user explicitly approves. Use when the user asks to update, maintain, revise, optimize, consolidate, or review their personal Skills, or when an automation invokes a whole-collection Skill governance review. Do not use for system Skills, plugin-provided Skills, unchanged third-party Skills, ordinary installation or Git synchronization, or creating an unrelated new Skill from scratch.
---

# Maintain Personal Codex Skills

Maintain the user's personally maintained Skills from real usage evidence and the latest verified repository state. This includes Skills created from scratch and third-party Skills that now contain user-specific behavior. Always work in two phases: first audit and propose changes, then wait for approval before editing. Support a named-Skill review, a whole-collection review, and an audit-only automation run. Keep scheduling outside this Skill.

## Establish the operation

Interpret the request as follows:

- **Named review:** The user asks to update one named Skill. Review that Skill and conversations relevant to its trigger and output, then propose changes.
- **Collection review:** The user asks to update their personal Skills without naming one. Review every fully self-created and customized third-party Skill in the personal repository and their relationships, then propose changes.
- **Audit only:** The user says to review, analyze, or report without changing files, or an automation invokes the Skill without explicit write authorization. Report findings only.

Treat the initial request, including words such as "更新", "修改", or "调整", as authorization to begin the review only. Never edit a Skill during the first phase.

Before editing, report each proposed change with:

- target Skill;
- problem;
- modification basis: identify the relevant task or date, the user's correction or accepted preference, or the exact repository fact;
- proposed behavior change;
- likely effect or risk.

Distinguish the basis as conversation evidence, repository evidence, or inference. Do not cite a general impression such as "the conversations suggest". If the available basis is insufficient or ambiguous, label the item as an observation and do not recommend or apply a change.

Ask the user to approve the complete proposal or selected items. Only an explicit approval after seeing the proposal authorizes edits. Require separate explicit approval for merging, splitting, deleting, renaming, or changing the identity of a Skill.

## Fix the scope

Use `Suda777/codex-skills` as the authoritative personal repository. Confirm the local repository root and expected remote before editing.

Before reading Skills for a review, refresh the repository state:

1. Inspect the current branch, upstream, worktree, and local commits, then fetch the expected remote using the safety rules in `$sync-personal-codex-skills`.
2. If local `HEAD` is behind and the worktree is clean, update with `git pull --ff-only`. If it is behind with a dirty worktree, or the branch is ahead, diverged, or cannot fast-forward, stop and report the exact state instead of reviewing or editing a stale copy.
3. If local `HEAD` already matches the fetched remote, unrelated working-tree changes may remain, but do not touch or stage them. Stop if a requested Skill already has uncommitted changes whose ownership is unclear.
4. Record the fetched remote commit as the maintenance base and include it in the review or completion report. A later upload must verify that the remote still points to this base before pushing.

This refresh is part of maintenance preparation. It does not authorize uploading or pushing changes.

Build the personally maintained Skill list from repository directories containing `SKILL.md`. Classify each Skill by current ownership, not only its original source:

- **Fully self-created:** created for the user and maintained as personal behavior.
- **Customized third-party:** originally external, but now contains user-specific instructions, references, scripts, routing, validation, or output rules. Treat the customized layer as personal behavior while preserving upstream attribution and license requirements.
- **Unchanged third-party:** installed or mirrored without user-specific behavior. Keep it outside maintenance review unless the user explicitly asks to customize it.

Exclude:

- `.system` Skills;
- plugin-provided Skills and caches;
- unchanged third-party Skills;
- the current Skill from conclusions based only on its own maintenance run.

For a customized third-party Skill, record its upstream source, available upstream version or commit, license, and the personal behavior that differs from upstream. Never replace the customized copy with a newer upstream copy. When upstream changes are in scope, compare upstream changes with the personal layer, identify behavioral conflicts, and propose the merge before editing.

For a named update, require an exact Skill name. Do not substitute a similar name.

## Gather conversation evidence

Read [references/conversation-review.md](references/conversation-review.md) before reviewing conversations.

For a named update:

1. Read the target `SKILL.md` and its relevant references.
2. List all accessible Codex tasks as a discovery pass.
3. Select tasks connected to the Skill's explicit or implicit triggers, expected outputs, missed triggers, user corrections, or final accepted result.
4. Read the relevant turns, including older pages when needed to understand the correction.

For a collection update:

1. Read every personally maintained Skill and map its purpose, triggers, exclusions, upstream status where applicable, and overlap with other Skills.
2. Use the task-listing capability to its documented maximum. If it supports pagination, exhaust the available pages; if it does not, treat the returned task set as partial discovery and report that limit.
3. Extract compact evidence, then compare it across Skills and conversations.
4. Record the actual coverage and any inaccessible, deleted, truncated, or unread tasks.

When an automation supplies a time window or "since last run" boundary, use that boundary for conversation evidence while still reviewing the full current Skill collection. Do not encode weekly or monthly schedules in this Skill.

## Diagnose before editing

Classify each finding as one of:

- missing, unclear, obsolete, or conflicting Skill guidance;
- trigger too broad, too narrow, missing, or overlapping another Skill;
- repeated user preference that belongs in the Skill;
- one-off task instruction or project rule that must not enter the Skill;
- execution miss where the Skill already contains the correct rule;
- tool, permission, environment, or source limitation rather than a Skill defect.

Require conversation evidence for preference and workflow changes. Use repository facts for broken paths, invalid references, duplicate rules, and structural defects. Do not invent improvements merely to make a Skill look more polished.

For every recommended change, preserve a compact evidence trail in the approval proposal. The user must be able to judge both whether the problem is real and whether it belongs in the target Skill.

## Apply approved updates

After the user has reviewed the proposal and explicitly approved changes:

1. Edit only the approved findings with sufficient evidence and clear ownership.
2. Preserve valid user-authored behavior and keep the smallest effective change.
3. Update the description when trigger or exclusion behavior changes.
4. Keep `SKILL.md` concise; move conditional detail to a directly linked reference when it materially reduces context.
5. Keep `agents/openai.yaml` aligned with the updated Skill.
6. For customized third-party Skills, preserve the upstream source, license, notices, and unrelated upstream capabilities while changing only the approved personal layer.
7. Do not change unrelated Skills merely because they are nearby.
8. Do not silently include an unapproved improvement merely because it is related to an approved item.

Do not push automatically. If the user also requests upload or synchronization, finish edits and validation first, then hand off to `sync-personal-codex-skills`.

## Validate and report

Validate every changed Skill with the available skill validator and check:

- valid frontmatter and exact folder/name match;
- linked references exist;
- no TODO placeholders, secrets, private transcripts, or machine-only evidence were added;
- trigger descriptions do not conflict or expand unintentionally;
- Git diff contains only authorized maintenance changes.

Report:

- operation and Skill scope;
- repository refresh result and maintenance base commit;
- conversation coverage and limitations;
- problems found and evidence pattern;
- proposed changes awaiting approval, or files and behaviors changed after approval;
- findings classified as execution misses or non-Skill issues;
- structural proposals awaiting approval;
- validation outcome and whether Git synchronization was requested.

Never claim to have read every conversation unless enumeration and pagination actually covered every accessible task.
