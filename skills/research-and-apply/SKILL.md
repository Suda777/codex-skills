---
name: research-and-apply
description: Research strong external examples, existing implementations, and reliable current sources, extract the useful patterns, and apply them directly to the user's original task. Use when the user says "联网查一下", "去网上看看", "找一些好的例子", "看看别人怎么实现", "找现成代码", "参考同类材料", "搜搜别人怎么写", or asks Codex to research before proposing code, materials, slides, a plan, or a solution. Also use implicitly when the user lacks a direction for a substantive code, writing, presentation, or solution task and external examples would materially improve the result. Do not use for simple fact lookups, routine edits with a clear solution, codebase-only searches, tasks already supported by sufficient supplied sources, or when the user says not to browse.
---

# Research and Apply

## Objective

Use web research as a supporting step, not as the deliverable. Find credible examples and established approaches, identify why they work, adapt the useful patterns to the user's constraints, and answer the user's original question directly.

Do not turn the response into a standalone research report unless the user asks for one.

## Follow the Original Task

Identify the requested end product before researching: an implementation idea, code change, material outline, draft, slide narrative, comparison, or recommendation.

Keep the final response shaped around that product. Research should improve the answer without replacing it.

If the goal and constraints are already clear, proceed without asking ceremonial questions. If one missing choice would materially change the research direction, ask only that question.

## Research Workflow

### 1. Establish the working context

- Extract the user's goal, constraints, technology or audience, desired depth, and completion condition.
- Inspect relevant supplied material or project sources first when the task depends on them.
- Separate what is already known from what external research must supply.
- Follow the active permission rules before accessing the web, private sources, or external systems.

### 2. Search with a purpose

Break the task into a small number of evidence needs instead of searching the user's sentence verbatim.

For code and technical work, normally prioritize:

1. the current codebase and its versions;
2. official documentation and official examples;
3. maintained reference implementations or reputable open-source projects;
4. relevant issues and discussions;
5. high-quality technical articles and community experience.

For materials, presentations, and solution work, normally prioritize:

1. authoritative facts, policies, data, and definitions;
2. strong examples of comparable work;
3. real cases and established content structures;
4. industry analysis;
5. community practice when lived experience or common pitfalls matter.

Use current sources for facts that may have changed. Search beyond official material when the task asks how people implement, write, present, or experience something in practice.

### 3. Evaluate examples before using them

- Check the source date, version, context, maintenance status, and relevance.
- Distinguish a production pattern from a demonstration snippet.
- Distinguish documented facts from author opinion, community experience, and Codex inference.
- Resolve apparent conflicts by checking versions, dates, environments, and different meanings of "supported" or "works".
- Do not treat popularity, search rank, or stars as proof of quality.
- Do not copy large passages or source code blindly; extract and adapt the pattern, respecting licenses and attribution requirements.

### 4. Extract the reusable pattern

For each useful example, determine:

- what problem it solves;
- why the approach works;
- which constraints make it appropriate;
- which parts transfer to the user's task;
- which parts must change for the user's context;
- what failure cases or tradeoffs remain.

Prefer a small number of strong examples over a long undigested list.

### 5. Apply the research

Translate the findings into the user's actual deliverable.

For code tasks:

- recommend an approach compatible with the current stack and versions;
- explain only the research findings that affect the implementation;
- provide the requested code, pseudocode, architecture, or edit plan;
- call out compatibility, security, performance, and maintenance boundaries that matter.

For materials and presentations:

- identify a useful angle, narrative, structure, examples, and supporting facts;
- adapt them to the user's audience and purpose;
- provide the requested outline, page structure, draft, titles, or key language;
- label unsupported assumptions and placeholders that still need user confirmation.

For plans and solutions:

- synthesize the common patterns;
- recommend one primary direction when evidence supports it;
- state the conditions that make it suitable and the conditions that would make it wrong.

## Shape the Response Around the Answer

Lead with the result the user asked for. Put research evidence next to the claim, design choice, code pattern, or content direction it supports.

Include only the useful research trace, usually:

- what established pattern was found;
- how it was adapted here;
- a few key source links or citations.

Do not default to a fixed "research brief," a source-by-source diary, a long methodology section, or a generic survey of every option.

Match the output format to the original task. Examples include:

- implementation recommendation followed by code;
- material direction followed by an outline or draft;
- slide narrative followed by page-level content;
- recommendation followed by the evidence and constraints that justify it.

## Stop Researching Deliberately

Stop when credible sources establish the important facts, useful examples reveal a stable pattern, and further searching is unlikely to change the answer.

If evidence remains insufficient or conflicting, say so and give the best bounded interpretation. Never fabricate browsing, sources, consensus, or certainty.

## Coordinate with Other Skills

Use `discuss-and-align` first when the real problem is materially ambiguous. Return from research to the discussion instead of pretending a decision has been made.

Hand the researched direction to the relevant code, document, presentation, spreadsheet, diagram, or other production workflow when execution is authorized. Do not automatically invoke unrelated downstream skills or perform side effects merely because the research is complete.

## Avoid These Failures

- Do not answer with research notes instead of the requested artifact.
- Do not list examples without explaining what transfers to the user's situation.
- Do not force an external pattern onto an incompatible project or audience.
- Do not rely only on official marketing when practical implementation or experience matters.
- Do not rely only on community opinion for factual or current product claims.
- Do not browse merely to decorate an answer that is already clear and well-supported.
