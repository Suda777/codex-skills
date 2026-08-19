---
name: discuss-and-align
description: Conduct a collaborative discussion that clarifies the real problem, challenges assumptions when useful, and converges on a reusable alignment result before execution. Use when the user explicitly says "讨论一下", "聊一下", "先分析", "先别动手", "不要直接改", "先复述目标", or asks for a plan or shared understanding before action. Also use when a complex or high-impact request contains material ambiguity that must be resolved with the user. Do not use for simple questions, trivial edits, read-only acknowledgements, or fully specified tasks the user has already authorized.
---

# Discuss and Align

## Objective

Run a useful discussion, not an interview. Help the user understand the problem, test the reasoning, make decisions, and leave the conversation with a clear result that another workflow can use.

Do not create files, modify systems, or begin implementation while the user is still asking to discuss. Keep discussion separate from execution.

## Choose the Lightest Mode

Select the least ceremonial mode that fits the request.

### Acknowledge-only

Use when the user only asks to read or understand material before discussing it later. Read the permitted source, confirm what was understood, and stop. Do not manufacture an alignment brief before a real question exists.

### Quick alignment

Use when the result is mostly clear but scope or completion needs confirmation. Briefly state:

- the intended result;
- the current scope;
- the completion condition;
- the next decision or action.

Keep this compact.

### Collaborative discussion

Use for ambiguous, strategic, cross-file, cross-system, or high-impact work. Explore the problem over multiple turns and converge gradually.

### Grill mode

Use a stronger challenge style only when the user explicitly asks to be challenged, grilled, stress-tested, or to find flaws, or when a critical proposal clearly depends on weak assumptions. Probe contradictions, missing evidence, failure cases, and tradeoffs. Do not act adversarially by default.

## Run the Discussion

### 1. Identify the real question

Restate the outcome the user appears to want, not merely the requested implementation. Distinguish the desired input, observable output, and successful end state.

If the user corrects the restatement, adopt the correction immediately.

If the user says Codex misunderstood, restate the corrected model in one to three sentences, identify only the remaining uncertainty, and do not repeat the full earlier proposal.

### 2. Separate information by status

Maintain a clear distinction between:

- confirmed facts from the user or trusted sources;
- the user's current judgment or preference;
- Codex inferences;
- working assumptions;
- unresolved questions.

Never present an inference as an agreed fact.

### 3. Track multi-part scope

When the discussion contains multiple questions, tasks, or deliverables, maintain a compact scope ledger with:

- the numbered item;
- what that item must answer;
- its expected output;
- its current status and the item being discussed now.

Treat new user details as additions to the current scope unless the user explicitly replaces, removes, or deprioritizes an earlier item. Do not silently drop, merge, split, or reorder items.

After a correction, annotation, or follow-up materially changes the scope, restate the full current item list before continuing—not only the newest correction. Keep the ledger implicit when scope is stable; show it when the scope changes or an item could otherwise be lost.

### 4. Contribute before asking

Give a current judgment, explanation, or useful framing before asking the next question. Do not turn the conversation into a questionnaire.

Ask one material question per turn by default. Ask up to three only when they are independent and every answer is necessary to avoid a materially different result.

Do not ask the user for information that can be obtained safely from already supplied material or permitted read-only project sources. Follow the active permission rules before reading private history, user directories, external sources, or other sensitive material.

### 5. Challenge selectively

Point out flawed premises, hidden assumptions, internal contradictions, unsupported claims, and scope inflation when they materially affect the result. Explain the evidence or reasoning behind the challenge.

Do not challenge settled decisions merely to prolong discussion. Reopen a decision only when new evidence or a real contradiction appears.

### 6. Recommend instead of dumping options

Give one primary recommendation when the evidence supports one. State:

- why it is preferred;
- the conditions under which it is valid;
- the circumstances that would make it wrong.

Mention alternatives only when the tradeoff is genuinely decision-relevant. Do not give the user a large menu and return the decision without guidance.

### 7. Converge deliberately

Recognize convergence signals such as "差不多了", "就按这个", "总结一下", "按照刚才讨论的结果", or an explicit decision. Stop opening new branches and synthesize the result.

If consensus has not been reached, say so. Do not fabricate agreement to complete a template.

## Respond During the Discussion

During an active discussion, normally respond with:

1. the current judgment;
2. the reasoning or evidence;
3. one next question or decision point.

Default to the shortest explanation that preserves the decision. When explaining how a workflow or Skill works, start with a one-line flow and only the essential distinctions; expand only when the user asks for more detail.

Do not print the full final template on every turn. Use headings only when they materially improve clarity.

## Produce the Final Discussion Result

When the discussion converges, output a concise Markdown result in the conversation. Do not create a file by default.

Use this structure, omitting empty sections:

```markdown
## 讨论对齐结果

### 真正要解决的问题

### 已形成的共识

### 关键决定

- 决定：
- 原因：
- 成立前提：

### 必须遵守的边界

- 必须保留：
- 明确禁止：
- 本轮不处理：

### 仍未确定的内容

### 下一步建议
```

Describe completion from the user's observable result, not only technical checks such as a successful build or an HTTP status.

## Produce a Discussion Checkpoint

When the user pauses or the discussion cannot yet converge, output a checkpoint instead of a false conclusion:

```markdown
## 当前讨论检查点

### 已经确定

### 主要分歧或未知项

### 当前更倾向的判断

### 下一轮最需要讨论的问题
```

## Hand Off to Execution

Treat the final discussion result as the input contract for the next relevant workflow, such as research, planning, implementation, document creation, presentation creation, review, or handoff writing.

Do not automatically invoke every downstream skill. Select only what the confirmed next step requires.

If the next step would modify files, create artifacts, start services, install dependencies, change configuration, call external systems, or perform another side effect, follow the active permission rules and ask `现在是否可以动手？` when authorization is still required.

If the user explicitly requests a persistent document, agree on its purpose and destination, obtain the required write authorization, and then create it. Do not generate discussion files automatically.

## Avoid These Failures

- Do not ask a long list of questions before contributing useful thinking.
- Do not repeat questions the user has already answered.
- Do not let a new detail erase an earlier task or deliverable.
- Do not discuss several deliverables as one undifferentiated result.
- Do not over-format a simple discussion.
- Do not answer a request for a simple workflow explanation with a long framework.
- Do not confuse Codex's preferred implementation with the user's desired outcome.
- Do not turn every discussion into a project plan.
- Do not prolong grill mode after the central assumptions have been tested.
- Do not announce consensus while material disagreements remain.
- Do not begin execution merely because the discussion has become detailed.
