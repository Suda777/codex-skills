# Template package contract

Use this contract when creating, changing, or reviewing a packaged visual template. A template pack is a maintained web design system plus a complete interaction sample; it is not a screenshot, a color preset, or third-party source code.

## Required layout

Each `assets/templates/Txx/` directory contains:

- `manifest.json` — machine-readable positioning, design tokens, components, interaction contracts, adaptation rules, and source boundaries;
- `tokens.css` — the independently implemented visual and responsive component system;
- `starter.html` — the complete multi-page web sample;
- `interactions.js` — mock state and all sample interactions;
- `components.html` — a static style catalog with no fake enabled controls;
- `preview.png` — a real 1280×720 PNG captured from the packaged sample;
- `source.md` — authoritative sources, license boundary, independent implementation statement, and mock-data notice.

Register the pack in `assets/template-catalog.json`. Only entries with `status: ready` may be shown as selectable in `assets/template-gallery.html`. Allowed statuses are `draft`, `ready`, and `retired`.

## What a ready sample proves

A ready sample must make the template's decisions observable. Normally include at least five complete top-level pages that collectively demonstrate:

- global and sidebar navigation;
- overview metrics and a data visualization;
- a filterable business list with a truthful empty state;
- a contextual detail layer such as a drawer or dialog;
- one confirmed state transition that updates related views;
- a real nonempty CSV export when export is shown;
- one create or invite form with validation;
- settings with saved and restored demo state;
- notifications or comparable transient feedback.

The exact page names and business story should fit the template positioning. Do not mechanically force the same content into every visual system, but keep enough shared component coverage that a person can compare templates meaningfully.

Every sidebar item opens one complete, mutually exclusive page. Inactive pages are fully hidden and cannot be reached by scrolling. Every visible enabled control works at all reachable states; unfinished controls are omitted or truly disabled with a visible reason.

## Visual independence

Changing only colors is not a new template. A distinct pack should make material choices in at least four of these areas:

- navigation structure and emphasis;
- page density and whitespace;
- card construction, radii, borders, and shadows;
- typography scale and hierarchy;
- metric and chart treatment;
- table or list composition;
- form and feedback styling;
- drawer, dialog, or secondary-panel behavior.

Keep all packs browser-native and responsive. Do not use operating-system window chrome or imply a native desktop application. Wide and narrow layouts are both web layouts.

## Source and license boundary

Prefer official product pages, official documentation, and official repositories as provenance. Record whether a source is:

- open source and which exact license applies;
- a free edition with a separate commercial edition;
- reference-only with no code or asset reuse.

Independently implement the packaged HTML, CSS, JavaScript, SVG icons, Chinese copy, and mock data. Do not copy third-party logos, brand names in the sample UI, screenshots, illustrations, fonts, source code, product copy, or commercial-only components. A permissive upstream license does not remove the requirement to keep this pack dependency-free and independently maintainable.

## Validation and review

Before marking a pack ready:

1. run `scripts/validate_template_packs.py` against the skill directory;
2. run `node --check` on its `interactions.js`;
3. compile `starter.html` with `scripts/inline_local_assets.py` and run `scripts/validate_single_file.py` on the result;
4. have an independent subagent use a real browser to trigger every reachable enabled control on wide and narrow web layouts;
5. fix supported findings and have the same reviewer recheck them;
6. capture `preview.png` from the reviewed implementation, not from an upstream website.

Do not mark a pack ready with an unresolved `BLOCKER` or `MAJOR`.
