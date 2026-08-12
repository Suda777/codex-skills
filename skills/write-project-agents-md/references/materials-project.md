# Materials project guidance

Use this reference for long-running workspaces that produce documents, presentations, reports, spreadsheets, PDFs, or other written and visual materials.

## Inspect before drafting

Identify the stable production system:

- target audiences, decisions, and intended outcomes;
- canonical source materials and their priority when sources disagree;
- approved templates, brand assets, terminology, and reusable components;
- input, working, final, archive, and export locations;
- required formats, filenames, version conventions, and approval state;
- confidentiality, attribution, citation, and external-fact requirements;
- format-specific quality checks, including rendering and visual inspection where layout matters.

Do not place the content of a single report or slide deck into the root guide. Keep one-off briefs, outlines, facts, and delivery status with that workstream.

## Separate shared rules from topic rules

When one project holds many kinds of materials, keep only shared production rules in the root `AGENTS.md`. Store topic-specific context in a brief or source folder. Add a nested `AGENTS.md` only when a subtree has durable operating rules that genuinely differ.

A possible structure is:

```text
sources/
templates/
workstreams/<topic>/brief.md
workstreams/<topic>/sources/
workstreams/<topic>/outputs/
```

Treat this as a pattern, not a mandatory layout. Follow the project's existing structure when it is coherent. Place reusable workflow assets directly in their agreed final directories rather than scattering drafts for later cleanup.

## Evidence and content integrity

Require materials to distinguish:

- supplied source facts;
- current external facts with citations;
- Codex-generated synthesis or recommendation;
- assumptions, estimates, placeholders, and items awaiting confirmation.

Define what happens when sources conflict. Prefer a named canonical source or stop for confirmation rather than silently choosing the most convenient version.

## Compact shape

Use only applicable sections:

```markdown
# Project agent guide

## Purpose, audience, and outputs
## Sources and evidence
## Workspace and file placement
## Templates, style, and terminology
## Versioning and replacement
## Format-specific validation
## Confidentiality and publishing
```

## Quality test

A new agent should know which sources to trust, where each artifact belongs, how facts differ from inference, which template to reuse, and how to verify the final format. The guide should not duplicate complete writing, slide, spreadsheet, document, or PDF procedures already provided by specialist skills.
