---
name: write-project-agents-md
description: Create or update a concise, verified project AGENTS.md for code, consulting, materials, or mixed projects, then audit the result for truth, scope, duplication, conflicts, privacy, and maintainability. Use when the user asks to create, write, generate, update, refresh, maintain, repair, audit, or reorganize a project AGENTS.md or project agent guide. Do not use for the global ~/.codex/AGENTS.md, ordinary README editing, one-off task plans, handoffs, or generic documentation that is not agent guidance.
---

# Write Project AGENTS.md

Create or maintain the smallest useful project instruction layer. Base it on verified project facts, keep it distinct from global preferences and temporary task state, and audit every changed result before handing it off.

## Establish scope and permission

1. Require an identifiable project root. Do not guess which project the user means.
2. Determine whether the request is to create, update, repair, or audit `AGENTS.md`.
3. Follow the active permission rules before writing. Treat the global `~/.codex/AGENTS.md` as out of scope for this skill.
4. Inspect the applicable instruction chain: inherited/global guidance, the project `AGENTS.md`, and any nested `AGENTS.md` files that govern the target area.
5. Preserve user-authored rules unless they are contradicted by current project evidence or the user authorizes their replacement.

### Gate root scope before drafting

Before creating or substantially rewriting a root `AGENTS.md`:

1. Inventory the project's main top-level directories, durable workstreams, and existing guidance closely enough to understand what the project contains.
2. Distinguish the whole-project purpose from the module or topic currently being discussed. A conversation about one knowledge base, document set, application, or workflow does not make that component the purpose of the entire project.
3. Put a rule in the root only when it applies across the project. Put stable module-specific rules in the nearest relevant nested `AGENTS.md` when that location is justified.
4. If the available evidence cannot establish whether the requested guidance is project-wide or module-specific, stop at a proposed scope and ask the user before writing.

Do not create a root guide from the current conversation alone when the project visibly contains other long-running modules or deliverable types.

## Build the evidence set

Read only the sources needed to establish durable project behavior:

- the existing `AGENTS.md` files;
- the root README and relevant directory guides;
- manifests, configuration, scripts, templates, CI, tests, and canonical source files;
- `git status` before editing, plus focused history or diffs when they clarify a change;
- facts, constraints, and examples supplied or confirmed by the user.

Do not read every Codex task by default. Consult project task history only when the user requests it or a durable decision cannot be recovered from the project. Obtain any permission required for private history, select only relevant tasks, treat them as leads rather than authority, and verify retained claims against current files or the user.

## Classify the project

Choose the dominant type from current evidence:

- **Code:** software, data, infrastructure, automation, or a technical repository. Read [references/code-project.md](references/code-project.md).
- **Consulting:** coaching, expert advice, analysis, decision support, or an ongoing professional dialogue. Read [references/consulting-project.md](references/consulting-project.md).
- **Materials:** documents, presentations, reports, spreadsheets, PDFs, or a long-running content workspace. Read [references/materials-project.md](references/materials-project.md).
- **Mixed:** two or more types are genuinely persistent. Read only the applicable references and place shared rules at the root; use nested guidance only when a subdirectory needs durable local rules.

Do not force a repository into a single type when that would hide a real workflow. Record the dominant type and the secondary type briefly when useful.

## Decide what belongs in AGENTS.md

Include only instructions that are durable, project-specific, non-obvious, and actionable:

- project purpose, boundaries, and canonical sources;
- stable directory responsibilities and safe modification paths;
- verified commands or repeatable workflows;
- domain invariants, evidence standards, and acceptance checks;
- privacy, data, publishing, or operational constraints specific to this project;
- pointers to detailed project references, templates, or skills.

Exclude:

- current task status, roadmaps, TODO lists, handoff notes, or chat summaries;
- generic advice or rules already supplied by the active global instructions;
- complete specialist methods that belong in a skill, template, or reference;
- secrets, tokens, private logs, or copied personal history;
- speculative facts, unverified commands, and machine-specific absolute paths unless the path itself is a durable project requirement.

Prefer a short rule plus a pointer over embedding extensive detail. Do not add sections merely to fill a template.

## Create a new project guide

1. Summarize the evidence and classify the project.
2. Draft only the sections supported by that evidence and the applicable project-type reference.
3. State rules as direct instructions. Attach context only when it prevents a predictable mistake.
4. Put shared rules in the root `AGENTS.md`. Add a nested `AGENTS.md` only when a directory has stable rules that differ from the root.
5. Mark unresolved facts as questions for the user; do not turn guesses into instructions.
6. Write only after authorization, then run the audit below and fix issues in the same pass.

## Update an existing project guide

1. Read the current instruction chain and identify the source and scope of every relevant rule.
2. Determine what changed using current files, user-confirmed decisions, and focused Git evidence when available.
3. Classify each proposed edit as add, revise, move, remove, or leave unchanged.
4. Apply the smallest patch that restores accuracy. Preserve wording and structure where they remain valid.
5. Remove obsolete or duplicated rules when the replacement is authoritative. If safe removal is uncertain, identify the conflict for the user rather than maintaining two competing truths.
6. Audit the complete resulting instruction set, not only the changed lines, and fix all in-scope findings before reporting completion.

## Audit the result

Check every item:

- **Truth:** mentioned paths, commands, source files, and workflows exist or are explicitly marked conditional.
- **Scope:** each rule applies where it is placed; local exceptions do not leak into the whole project.
- **Root coverage:** the root guide reflects all durable project workstreams at the appropriate level and is not centered on only the module discussed most recently.
- **Conflict:** no rule contradicts a higher-priority instruction or another active project rule.
- **Duplication:** global guidance and specialist procedures are not repeated without a project-specific reason.
- **Durability:** the file contains stable operating guidance, not temporary plans or conversation state.
- **Actionability:** critical rules identify the invariant, safe path, or validation method.
- **Evidence:** facts and professional claims have an appropriate source path; assumptions remain visible.
- **Privacy and safety:** no secret, private history, production data, or unsafe operation is exposed or normalized.
- **Maintainability:** the guide is concise, navigable, and uses pointers for detail.
- **Acceptance:** validation and quality criteria match the actual project type.

If a check fails, correct it before completion when authorized. Otherwise report the exact unresolved issue and why it needs the user.

## Report the outcome

State:

- whether the file was created, updated, repaired, or only audited;
- the detected project type and evidence sources used;
- the durable rules added, changed, moved, or removed;
- the audit result and any facts still awaiting confirmation;
- whether a new Codex task or restart is needed for the updated instructions to be loaded.

Do not claim that a professional persona, an internet search, or an audit alone guarantees correctness. Make the evidence path and remaining uncertainty inspectable.
