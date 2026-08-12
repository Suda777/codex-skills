---
name: build-telecom-leadership-ppt
description: Build and iteratively review leadership briefings, work summaries, and telecom business presentations, with separate content and layout decisions and a preview-image-first approval workflow. Use when the user asks to create, revise, continue, or review a PPT/PPTX for leaders, monthly or annual work reporting, or telecom topics such as AI, OPC, FDE, Token, TokenHub, TeleAgent, Seedance, Zhiyun, government-enterprise customers, districts, or business opportunities. Also use when the user asks to follow an earlier reporting deck or review slides as images before receiving the PPTX. Do not use for generic teaching decks, product launches, investor pitches, or casual presentations unless the user explicitly invokes this skill.
---

# Build Telecom Leadership PPT

Create leadership-facing telecom presentations through two distinct decisions: what the slide must communicate and how that message should be arranged visually. Use the installed `Presentations` skill for PPTX implementation, rendering, and technical QA; do not duplicate its file-generation instructions here.

## Establish the Task Contract

Classify the request as one of:

- create a full deck;
- create one or several slides;
- revise an existing deck;
- produce a new reporting period from an earlier deck;
- discuss content only;
- revise wording only;
- revise layout only.

Identify the audience, desired audience takeaway, slide scope, required source material, and current delivery stage. Use `discuss-and-align` when the narrative, scope, or intended decision is materially ambiguous. Do not ask again for facts already available in supplied files.

Follow this precedence order:

1. the user's latest explicit instruction;
2. the supplied source deck or reference example;
3. content and slides already approved in the current task;
4. verified current source material;
5. this skill's defaults;
6. Codex design judgment.

## Separate Content from Layout

Resolve the content job before treating layout as decoration. For every slide, determine:

- the slide's single communication job;
- the conclusion the leader should remember;
- the minimum evidence needed to support it;
- whether it should lead to a decision, action, or request for support.

Classify source material as current fact, historical fact, user judgment, Codex inference, or unresolved placeholder. Never convert background given only for understanding into visible slide copy automatically.

Read [references/content-workflow.md](references/content-workflow.md) when drafting or restructuring slide content. Read [references/layout-baseline.md](references/layout-baseline.md) when proposing or revising visual composition. User-provided layout examples override that baseline; update the skill later rather than inferring a permanent style from one task.

## Use Preview Images Before PPTX Delivery

Treat preview-first as the default approval contract unless the user explicitly overrides it in the current task.

1. Build an editable draft slide in a temporary working location.
2. Render the draft slide to PNG.
3. Show the PNG to the user; do not present the draft PPTX as the deliverable.
4. Separate feedback into content changes and layout changes.
5. Re-render after each meaningful revision.
6. Freeze a slide once the user approves it.
7. Continue page by page or in the batch size the user requests.
8. Export and deliver the final PPTX only after all requested preview images are approved.

Do not use ImageGen to create a non-editable mockup that must later be reconstructed as a slide. The approved preview should be rendered from the editable slide source so the final PPTX can match it.

For a content-only discussion, do not create a slide or preview. For a layout-only request, preserve approved wording unless the user authorizes copy changes.

## Maintain the Revision Ledger

Track these states throughout the task:

- **Frozen:** explicitly approved; do not change without a new conflicting instruction.
- **Change now:** the exact items in the current revision scope.
- **Awaiting approval:** rendered but not yet accepted.
- **Do not change:** explicitly protected by the user.
- **Missing evidence:** data, wording, or assets that remain unresolved.
- **Rejected direction:** an approach the user declined; do not reintroduce it without new evidence.

When the user says "只改这些", change only the listed items. A new instruction replaces only earlier decisions that directly conflict with it. Preserve all other approved decisions.

After each revision, report concisely:

- what changed;
- what was intentionally left unchanged;
- what still needs approval or evidence.

## Apply Telecom Leadership Discipline

- Lead with the conclusion, then show evidence.
- Give each slide one primary job.
- Explain unfamiliar telecom or AI terms enough for the intended leader to understand them.
- Turn work lists into outcomes, value, problems, next actions, and support requests when the evidence allows.
- Avoid long modifiers, repeated summaries, empty slogans, and unsupported claims.
- Make figures self-explanatory; do not leave unexplained numbers and arrows.
- Do not invent project progress, product capability, customer status, financial values, or metrics.
- Treat earlier chats and prior-period decks as leads, not proof of current status.
- Use explicit placeholders when current information is missing.

Use `research-and-apply` only when external research would materially improve current facts, examples, policies, or framing. Keep researched facts traceable and distinguish them from internal business claims.

## Complete the Deck

Before final PPTX delivery, read and apply [references/review-checklist.md](references/review-checklist.md). In addition to the `Presentations` skill's required rendering and technical checks, verify that:

- every user comment is closed or visibly outstanding;
- frozen slides were not altered accidentally;
- the final render matches the approved previews;
- no unapproved placeholder remains;
- the narrative answers why the work matters, what changed, what remains difficult, what happens next, and what support is needed when those questions apply.

Deliver only the final approved deck and a concise change summary. Do not attach scratch decks, internal ledgers, or temporary assets unless requested.
