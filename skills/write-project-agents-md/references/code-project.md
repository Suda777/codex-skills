# Code project guidance

Use this reference only for code projects or the code portion of a mixed project.

## Inspect before drafting

Confirm the repository's actual behavior from manifests, lockfiles, configuration, scripts, CI, tests, architecture notes, and the relevant source directories. Never infer commands from a familiar framework when the repository can answer directly.

Useful project-specific topics include:

- purpose and explicit non-goals;
- canonical specifications and source-of-truth files;
- runtime, package manager, and verified setup, run, test, build, lint, and format commands;
- directory ownership and the normal path for a change;
- architecture or domain invariants that tests and tooling do not make obvious;
- generated files, migrations, schemas, APIs, data, secrets, deployment, and production safety;
- the minimum validation expected for each class of change.

Do not restate language basics, formatter output, lint rules already enforced by tools, or a full architectural tutorial. Link to the canonical project document instead.

## Compact shape

Use only applicable sections:

```markdown
# Project agent guide

## Purpose and source of truth
## Repository map
## Working commands
## Change boundaries and invariants
## Validation
## Safety and data
```

For a monorepo, keep common commands and invariants at the root. Use nested `AGENTS.md` files only for stable package-specific differences. Verify that nested rules do not silently override a critical root rule.

## Quality test

A new agent should be able to answer these questions without guessing:

1. Where is the authoritative implementation or specification?
2. Which files normally change for this kind of work?
3. Which commands are known to work here?
4. What must never be broken or edited directly?
5. What evidence is required before calling a change complete?
