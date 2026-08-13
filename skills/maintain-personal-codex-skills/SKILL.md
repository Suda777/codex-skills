---
name: maintain-personal-codex-skills
description: Audit one or all of the user's self-created Codex Skills using evidence from accessible Codex conversations and the current Suda777/codex-skills repository, propose concrete changes, and apply only the changes the user explicitly approves. Use when the user says "请更新一下我的自建 skill", "更新我的全部 skill", "更新一个 xxx skill", asks to maintain, revise, optimize, consolidate, or review their personal Skills, or when an automation invokes a whole-collection Skill governance review. Do not use for system Skills, plugin-provided Skills, third-party Skills, ordinary skill installation or Git synchronization, or creating an unrelated new Skill from scratch.
---

# Maintain Personal Codex Skills

Maintain the user's self-created Skills from real usage evidence. Always work in two phases: first audit and propose changes, then wait for approval before editing. Support a named-Skill review, a whole-collection review, and an audit-only automation run. Keep scheduling outside this Skill.

## Establish the operation

Interpret the request as follows:

- **Named review:** The user asks to update one named Skill. Review that Skill and conversations relevant to its trigger and output, then propose changes.
- **Collection review:** The user asks to update their self-created Skills without naming one. Review every Skill in the personal repository and their relationships, then propose changes.
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

Build the self-created Skill list from repository directories containing `SKILL.md`. Exclude:

- `.system` Skills;
- plugin-provided Skills and caches;
- third-party Skills not maintained in the personal repository;
- the current Skill from conclusions based only on its own maintenance run.

For a named update, require an exact Skill name. Do not substitute a similar name.

## Gather conversation evidence

Read [references/conversation-review.md](references/conversation-review.md) before reviewing conversations.

For a named update:

1. Read the target `SKILL.md` and its relevant references.
2. List all accessible Codex tasks as a discovery pass.
3. Select tasks connected to the Skill's explicit or implicit triggers, expected outputs, missed triggers, user corrections, or final accepted result.
4. Read the relevant turns, including older pages when needed to understand the correction.

For a collection update:

1. Read every self-created Skill and map its purpose, triggers, exclusions, and overlap with other Skills.
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
6. Do not change unrelated Skills merely because they are nearby.
7. Do not silently include an unapproved improvement merely because it is related to an approved item.

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
- conversation coverage and limitations;
- problems found and evidence pattern;
- proposed changes awaiting approval, or files and behaviors changed after approval;
- findings classified as execution misses or non-Skill issues;
- structural proposals awaiting approval;
- validation outcome and whether Git synchronization was requested.

Never claim to have read every conversation unless enumeration and pagination actually covered every accessible task.
