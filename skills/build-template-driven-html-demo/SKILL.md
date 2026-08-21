---
name: build-template-driven-html-demo
description: Build a clickable, single-file HTML Demo from a development document or a guided requirements conversation, while applying one selected packaged web template's visual and component system. Use when a non-technical user needs an interactive mock-data webpage for customer discussion. Do not use for production applications, backend integration, or generic websites whose design and implementation are already fully specified.
---

# Build Template-Driven HTML Demo

Create a browser-openable Demo whose business content comes from the requirements and whose presentation comes from the selected template. The template never decides or overrides business behavior.

## Accept the input

Support either input mode:

- **Development-document mode:** use the supplied document as the primary source. Do not reopen settled requirements or ask about ordinary UI choices.
- **Conversation mode:** guide the person in ordinary language, one important question at a time, until the business-critical gaps are closed. Track unanswered items so topic changes do not cause omissions.

The person currently talking to Codex is the confirmer. They may be a product manager relaying a customer visit rather than the end customer. Accept one long description, an uploaded document, or a multi-turn conversation without requiring a fixed opening format or a phrase such as “I am finished.” In conversation mode, keep an internal list of confirmed facts, missing must-have facts, optional facts, assumptions, and conflicts. If the person answers a side topic, record it and return to the highest-impact unresolved item instead of letting the conversation drift.

When converting narrative input into a build contract, read [references/development-document-contract.md](references/development-document-contract.md). Ask only when a missing or conflicting fact would materially change pages, data, actions, permissions, calculations, or state transitions. Use explicit, recorded assumptions for low-risk gaps.

Before creating files, give one compact pre-build brief covering the Demo goal, users, pages, main journeys and interactions, core-object detail, important data relationships and rules, mock scope, selected template, and material assumptions. Ask the person to confirm this brief; do not begin implementation until they affirm it. This is a confirmation gate, not a new design interview. Do not ask again about facts already confirmed.

## Select and load the template

If the person already selected a `template_id`, honor it when that ID exists with `status: ready` in [assets/template-catalog.json](assets/template-catalog.json). Otherwise recommend up to three ready choices from the catalog and let the person view [assets/template-gallery.html](assets/template-gallery.html). Treat `draft` entries as internal work and `retired` entries as unavailable. Never offer or silently substitute an unbuilt template. Visual preference belongs to the person; business fitness is the skill's recommendation.

For the selected template, read its `manifest.json`, `tokens.css`, `components.html`, `interactions.js`, and `starter.html`. Treat `preview.png` as a human-facing visual reference only. Apply the packaged design system; do not improvise from an external screenshot when a maintained template pack exists.

When creating, changing, or reviewing a packaged template itself, follow [references/template-package-contract.md](references/template-package-contract.md).

For reference-only sources, use the independently implemented packaged assets. Never copy third-party logos, branded copy, screenshots, illustrations, or unlicensed source into the output.

## Map requirements to UI

Read [references/component-selection-rules.md](references/component-selection-rules.md) when choosing between pages, drawers, dialogs, tables, forms, tabs, and feedback patterns. Make ordinary UI decisions yourself. Do not ask the person to choose routine components.

Preserve the development document's:

- pages and navigation;
- entities, fields, relationships, and mock-data constraints;
- buttons, destinations, dialogs, and resulting state changes;
- calculations, statuses, permissions, and important wording;
- image purpose and placement.

Treat requirements as end-to-end user journeys, not a collection of isolated screens and clickable controls. A core object must keep the same identity and content as it moves between creation, list or card summary, full detail, editing, source navigation, aggregation, and other downstream views required by the contract. Opening a promised detail must reveal substantive object-specific content, not only metadata or a generic paragraph.

Never add a workflow merely because it exists in the template. Never remove a required workflow because the template lacks an example component.

Treat every visible global or sidebar navigation item as a real page promise. Each item must open its own complete page view; never use a placeholder toast, dead link, or scroll anchor as a substitute. In a single-file Demo, keep inactive page views fully hidden so one page cannot be reached by vertically scrolling through another page.

## Generate the Demo

Read [references/generation-rules.md](references/generation-rules.md) immediately before implementation.

Produce one self-contained `index.html` unless the person explicitly requests another format. It must:

- open directly in a modern browser without installation, a server, or a build step;
- embed CSS, JavaScript, icons, mock data, and any necessary small image assets;
- implement every promised click, navigation, dialog, drawer, filter, and state change;
- ensure every visible enabled control has an observable, truthful result at every preview stage; unfinished capabilities must be omitted or clearly disabled, never left as fake buttons;
- never use a success Toast to disguise an action that did not occur;
- render exactly one top-level page view at a time and switch top-level pages only through navigation or an explicit in-page action;
- use meaningful Chinese copy instead of lorem ipsum or developer placeholders;
- present mock data that is internally consistent with the stated business rules;
- carry created or edited content through the complete demonstrated journey and keep every affected view in sync;
- use action labels and visual severity that accurately describe scope and consequences, reserving destructive treatment for genuinely destructive actions;
- keep product copy purposeful and layouts appropriately dense, without repeated implementation notes, excessive helper text, fixed empty space, or loose sections that weaken the selected template;
- remain a demonstrator, not claim real authentication, persistence, integration, or production readiness.

Use `scripts/inventory_controls.py` to produce the static control inventory before review. After adding or changing a packaged template, run `scripts/validate_template_packs.py` against this skill directory, then use the other scripts for deterministic single-file packaging and structural checks. Static results supplement, but never replace, actual browser interaction.

## Review independently

After generation, delegate review to an independent subagent. Give it the confirmed development document, selected template pack, produced `index.html`, static control inventory, and [references/review-checklist.md](references/review-checklist.md). The implementing agent must not substitute its own inspection for this review.

Match the review contract to the artifact. Review a generated customer Demo against its confirmed development document and later explicit corrections. Review a template pack or template sample against its manifest and stated sample scope; never impose an unrelated example development document on it.

Ask the reviewer to trigger every visible enabled control, verify intentionally disabled controls, complete every main journey, and test representative instances rather than only the first row or default object. It must verify object-specific detail, save/cancel behavior, source and downstream relationships, action semantics, information density, and both wide and narrow web layouts. Fix supported findings, then have the same reviewer recheck them. Do not deliver with an unresolved `BLOCKER` or `MAJOR`. If subagents are unavailable, disclose that the required independent review was not completed rather than claiming success.

## Deliver

Return the self-contained HTML file and a compact summary of:

- selected template;
- implemented pages and key interactions;
- assumptions and deliberately simulated behavior;
- independent review result and remaining limitations.

Deliver only the durable final `index.html`, not a template file, temporary source, localhost URL, or build artifact that will be removed. Immediately before linking or opening it, verify that the exact absolute path exists after cleanup. Prefer a stable workspace location such as `deliverables/html-demos/<project-slug>/index.html` unless the person selected another destination. Open or link that same verified file so the person cannot be sent to a stale preview tab.

Do not expose internal template assets as if they were customer deliverables unless requested.
