# Flowchart Authoring and Quality Rules

Read this reference for every flowchart, decision tree, phased process, synchronization workflow, or diagram with return loops.

## Define the semantic grammar first

- Use process rectangles only for actions.
- Use diamonds only for questions or decisions.
- Use terminal or rounded outcome shapes only for end, stop, success, or handoff states.
- Keep actions and states separate. Do not put an operation in one peer node and a status description in another peer node.
- Put operation order in the reading flow and connectors. If steps are numbered, use one badge style everywhere; never mix circled and plain numbers.
- Remove secondary status pills that merely repeat the process node and do not change interpretation.

## Route branches deliberately

- Prefer a straight connector whenever source and target can be aligned.
- For a downward branch, center the target below the decision and pin bottom-center to top-center.
- For a rightward branch, align vertical centers and pin right-center to left-center.
- Use orthogonal square-corner connectors. Do not use curved or rounded connectors when straight or right-angle routing works.
- Keep branch direction consistent inside a diagram. Label every decision branch with the same vocabulary, normally `是` and `否` or `Yes` and `No`, never a mixture.
- Use a bend only to avoid an obstacle or enter an intentional routing corridor. Do not compensate for misaligned nodes with an unnecessary elbow.
- Route feedback and return paths through an outer corridor. Use one dashed style and one semantic color for all return paths.
- A label such as `返回步骤 10` must be attached to an actual edge that targets step 10. A disconnected return-result box is not a loop.

## Layout phases and repeated structures

- Make the main reading direction obvious before adding return paths.
- Use phase containers only when phases materially help comprehension. Keep phase transitions visually stronger than ordinary edges and aligned on one axis.
- Align repeated process nodes, decisions, badges, branch labels, and terminal outcomes to a shared grid.
- Keep independent modules separate; overlap is allowed only for real containment.
- Keep text inside its shape with visible padding on every side.

## Enforce one source of truth

- Treat the `.drawio` file as the only geometry and content source.
- Export PNG, SVG, PDF, or JPG from that `.drawio` source after every edit.
- Never repair the preview by independently editing SVG or PNG while leaving `.drawio` different. If the export is wrong, fix the `.drawio` source and export again.

## Full-diagram audit after every edit

The user's marked area identifies a symptom, not the review boundary. After every correction:

1. Fix the exact issue the user reported.
2. Search every page for all other instances of the same defect class.
3. Recheck every defect class corrected in earlier rounds so the new edit does not cause a regression.
4. Rerun both deterministic checks.
5. Export a fresh preview from the `.drawio` source.
6. Inspect the complete preview in the fixed scan order below.

Use this scan order so no region is silently skipped:

1. Canvas, title, subtitle, legend, footer, and cropping.
2. Phase containers, grouping, main reading direction, and transitions between phases.
3. Every node from the first to the last: semantic role, shape, number, typography, color, padding, and alignment.
4. Every decision: diamond shape, question wording, all outgoing branches, branch labels, and branch-label style.
5. Every normal connector: attachment, arrow direction, straightness, bends, crossings, and obstacle avoidance.
6. Every feedback or return path: real target, label, dashed style, semantic color, and outer routing corridor.
7. Whole-canvas consistency: repeated elements match and no later edit reintroduced an earlier defect.

At readable zoom, verify:

1. Node semantics are uniform.
2. Number badges, fonts, colors, borders, and padding are consistent.
3. Every decision uses a diamond and every branch is labeled consistently.
4. Straight vertical and horizontal connections are truly aligned.
5. No connector has an unnecessary bend, curve, or inconsistent corner style.
6. Return paths are complete, connected, labeled, and styled consistently.
7. No text touches a border, overlaps a shape, or is clipped.
8. No independent shapes overlap and no line crosses an unrelated shape.
9. Phase transitions and main reading order remain obvious after loops are added.
10. The complete exported image is visible, uncropped, and matches the editable `.drawio` source.

Run both checks for a flowchart:

```bash
python3 scripts/validate.py diagram.drawio --score
python3 scripts/audit_flowchart.py diagram.drawio
```

Structural validators cannot prove visual or semantic correctness. A zero-warning result never replaces the exported-image review.

## Regression and reference artifacts

- When an approved `.drawio` from an earlier round is available, use it as the baseline instead of redrawing from memory.
- Preserve approved content and geometry except for the requested change and any same-class or rule-required corrections.
- Compare the new preview against the approved preview across the complete canvas, not only the changed area.
- If the user requires exact reproduction of the same case, reuse the approved `.drawio` source or compare against it directly. Do not claim pixel-identical reproduction from prose instructions alone.
- A reference artifact may guide evaluation, but do not hard-code one test case into the general workflow merely to pass a regression test.

## Completion rule

Do not call the diagram final while a critical issue remains: overlap, clipping, missing connection, false return label, inconsistent node semantics, mixed numbering, inconsistent branch styling, or an avoidable crooked connector. After two unsuccessful automatic repair rounds, show it explicitly as a draft with the remaining defects instead of presenting it as complete.
