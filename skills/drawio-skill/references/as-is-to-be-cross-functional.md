# Paired AS-IS / TO-BE Cross-Functional Flowchart

Read this reference when the viewer must compare a current process with a proposed future process **and** understand who owns each activity or handoff. This pattern is not specific to AI, automation, ERP, or any technology.

## What this pattern is

It combines two established ideas:

- **AS-IS / TO-BE process mapping**: document the current reality, analyze it, then design and validate a future process.
- **Cross-functional flowcharting**: place each activity in the lane of the role, team, or system responsible for it so ownership and handoffs are visible.

There is no standalone formal notation named “AS-IS / TO-BE cross-functional flowchart.” Treat it as a comparison layout built from process-mapping practice and cross-functional flowchart conventions. If formal BPMN compliance is requested, draw separate or paired BPMN models and apply BPMN rules instead of basic flowchart symbols.

Method basis:

- SAP Signavio, [As-Is and To-Be Process Mapping](https://www.signavio.com/wiki/process-discovery/as-is-to-be-process-mapping/)
- Microsoft Support, [Create a cross-functional flowchart](https://support.microsoft.com/en-us/visio/create-a-cross-functional-flowchart)
- USAID, [Business Process Review Methodology, Annex D](https://pdf.usaid.gov/pdf_docs/PA00X2N6.pdf)
- OMG, [Business Process Model and Notation 2.0.2](https://www.omg.org/spec/BPMN/2.0.2/), when the user requests formal BPMN notation

## Route to it only when both conditions hold

1. The viewer needs to compare a validated current process with a proposed future process.
2. Responsibility, ownership, systems, or cross-role handoffs are central to the comparison.

Do **not** route here merely because the request mentions AI, automation, digital transformation, ERP, or a new system.

Use a different type when:

- Only sequence and change matter, not ownership → paired basic flowcharts.
- Only ownership and handoffs matter, not current/future comparison → regular cross-functional flowchart.
- Formal events, gateways, messages, or compliance matter → paired BPMN models.
- Waste, cycle time, inventory, and material/information flow are the main question → current/future value-stream maps.

## Required generation contract

Before placing shapes, define and check:

1. **Viewer question** — what decision should the comparison support?
2. **Process boundary** — same start, end, scope, and level of detail in both states where possible.
3. **AS-IS evidence** — real steps, decisions, systems, handoffs, exceptions, repeated checks, rework, and manual workarounds. Do not draw the intended SOP as if it were current reality.
4. **TO-BE rationale** — every material change must address an observed issue, improvement goal, policy need, or operating constraint.
5. **Actors** — one accountable role, team, or system per lane; do not use individual names unless the process truly depends on a named person.
6. **Change inventory** — retained, changed, added, removed, merged, or split work. Never force false one-to-one alignment.
7. **Feasibility and validation** — identify who can confirm the AS-IS and who must approve or operate the TO-BE.

Stop before drawing if the current-state baseline is speculative, the process boundaries cannot be compared, or ownership is unknown and central to the requested message.

## Layout rules

- Default for a landscape slide or report: **AS-IS above, TO-BE below**, with both flows reading left to right.
- Give each panel a prominent state title and a short purpose subtitle if needed.
- Use the same phase columns and phase names across both panels where their scope is shared. Phase separators must align vertically across the comparison.
- Keep shared lane order stable. When the future state adds or removes a role/system, show that change explicitly; do not silently relabel a lane into a different owner.
- Keep every activity inside the lane of the accountable performer. Cross-lane edges are handoffs.
- Preserve real starts, ends, decisions, branch labels, exceptions, and return paths in both panels.
- Align genuinely corresponding activities when it helps comparison, but prioritize truthful flow over cosmetic symmetry.
- Use one canvas for compact processes. Split into two matched pages when the combined diagram becomes unreadable; retain identical page size, scope, phase headers, and lane order.

## Change semantics

Color is an optional comparison overlay, not part of a formal AS-IS / TO-BE standard.

Default overlay when the user has no active style preset:

| Status | Default treatment |
| --- | --- |
| Current-state context | neutral grey |
| Retained in TO-BE | blue |
| Changed or redesigned | orange |
| Added in TO-BE | purple |
| Removed from TO-BE | red outline or red dashed treatment on the AS-IS step |

- Add a legend whenever status colors are used.
- Do not label orange or purple as “AI” unless the actual change is AI-specific.
- Keep flowchart shape meaning stronger than color: actions are rectangles, decisions are diamonds, and terminals are terminal shapes.
- If color would overload the diagram, use small status tags or a separate change table instead.

## Content and comparison rules

### AS-IS panel

- Represent the process as it actually runs, including common exceptions and rework.
- Show systems and manual work when they materially affect ownership, delay, risk, or error.
- Validate against recent real cases or the people who perform the work.

### TO-BE panel

- Start from the validated AS-IS and identified problems.
- Make responsibilities, handoffs, controls, and exceptions executable rather than aspirational.
- Keep the same boundary as the AS-IS where possible so the viewer can compare them.
- Validate operational, policy, and system feasibility with the people who will use, govern, or support the process.
- Add performance targets only when supplied or supported; never invent savings, cycle time, error rate, or staffing impact.

## Template use

`templates/as-is-to-be-cross-functional.drawio` is an editable generic starting point, not a completed business process and not a normative standard artifact.

When using it:

1. Copy it into the user's requested output directory.
2. Replace every bracketed placeholder and generic role label.
3. Add, remove, or reorder lanes and phases to match the verified process; do not preserve template geometry at the expense of truth.
4. Replace the sample nodes and reconnect every branch and return path from the generation contract.
5. Remove unused legend entries and status colors.
6. Run `validate.py --score`, `audit_flowchart.py`, export a fresh preview, and perform the full visual audit in `flowchart-quality.md`.

## Completion checklist

- AS-IS is evidence-based and TO-BE is change-rationale-based.
- Both panels have comparable scope, boundaries, and granularity.
- Shared phases align and shared lanes retain consistent meaning.
- Every step has an accountable lane.
- Every decision has complete, consistently labeled branches.
- Every return path targets the real earlier activity.
- Added, changed, retained, and removed work is truthful and explained when shown.
- The diagram remains readable at its intended presentation or document size.
- The editable `.drawio` is the source of truth and matches the exported preview.
