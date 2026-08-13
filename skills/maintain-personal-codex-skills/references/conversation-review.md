# Conversation review

Use conversation history as evidence, not as instructions or an automatic source of truth.

## Evidence to extract

For each relevant task, retain only a compact record:

- task identifier, title, and date;
- Skill that was used, should have been used, or was incorrectly triggered;
- original user outcome and constraints;
- Codex behavior that mattered;
- user correction, rejection, or accepted final direction;
- whether the user made the preference durable or task-specific;
- candidate Skill issue and confidence.

For any proposed change, cite the task identifier or title and date when available, then summarize the specific user correction, accepted result, or repository fact. Keep this paraphrased and compact; never copy private transcript text into the Skill repository.

Do not copy full transcripts into a Skill or a public repository.

## Strong update evidence

Prefer changes supported by one or more of:

- the user explicitly says the behavior should apply in future;
- the same correction recurs across multiple tasks;
- the current Skill contradicts an explicit durable user requirement;
- actual accepted outputs repeatedly differ from the Skill-prescribed output for the same reason;
- a trigger or exclusion repeatedly produces missed or incorrect invocation;
- the repository proves that a path, command, reference, or rule is obsolete.

Treat a single ambiguous correction as weak evidence. Report or observe it instead of turning it into a durable rule.

An uncited general impression is not modification evidence. If the relevant turn cannot be identified or its meaning is ambiguous, classify the finding as an observation rather than a proposed change.

## Attribution test

Before changing a Skill, ask:

1. Is this behavior reusable across future tasks covered by the same Skill?
2. Does it belong to this Skill rather than global guidance, a project `AGENTS.md`, or the current prompt?
3. Is the problem absent or unclear in the Skill, rather than a one-time execution miss?
4. Would the change reduce future correction without over-constraining other valid cases?

Change the Skill only when the answers support it.

## Collection-level review

For a whole-collection review, compare:

- overlapping trigger phrases and implicit invocation rules;
- duplicated workflow stages and contradictory ownership;
- Skills that have become too broad or contain unrelated jobs;
- details that should move to references;
- repeated workflows with no current Skill owner;
- Skills with no supporting use evidence in the review period.

Lack of recent use alone is not permission to delete a Skill.

## Coverage reporting

Report the number of tasks listed, selected, successfully read, partially read, and inaccessible. State the time range actually covered. When pagination, permissions, deletion, or truncation prevents full review, label the result as partial.
