# Diagram-Type Routing

Use this reference when the user has not confirmed a diagram type or when their requested type may hide the main message. Select from the communication goal, information structure, audience, and required formality, not from whichever template is easiest to generate.

## Routing workflow

1. Identify the viewer's primary question: sequence, responsibility, interaction, state, structure, hierarchy, schedule, cause, comparison, trend, composition, distribution, correlation, or spatial position.
2. Identify the information structure: actions and decisions, actors and handoffs, messages over time, stable states and events, components and dependencies, parent-child groups, entities and relations, or numeric series.
3. Identify the audience and rigor: general explanation, management communication, technical design, or formal standardized modeling.
4. Consider the user's stated preference. Treat it as the default choice unless it materially hides the core information.
5. Recommend one primary type and explain in one sentence what it makes easiest to understand.
6. Offer at most two alternatives only when they answer a genuinely different viewer question; state what each alternative emphasizes and weakens.
7. Ask the user to choose. Do not start drawing until the user chooses or explicitly delegates the choice.

Use this response pattern:

> 推荐画“分阶段流程图”，因为核心是操作顺序、判断分支和返回闭环。备选“泳道图”会更突出设备与 GitHub 的职责交接，但会弱化主流程的连续性。你希望采用哪一种？

Do not expose implementation details such as layout coordinates, colors, shapes, or connector routing during selection unless the user asks. The goal is to agree on what the diagram should communicate, not to design it prematurely.

## Routing table

| Viewer question | Information pattern | Primary diagram | Use instead when |
| --- | --- | --- | --- |
| 先做什么、如何判断、失败后回到哪里？ | ordered steps, decisions, loops | Flowchart | Use a swimlane when actor ownership is central |
| 谁负责哪一步、工作如何交接？ | roles plus handoffs | Cross-functional swimlane | Use BPMN when formal events, gateways, and messages matter |
| 当前流程与目标流程如何变化，同时谁负责、如何交接？ | matched current/future flows plus roles and handoffs | Paired AS-IS / TO-BE cross-functional flowchart | Use paired basic flowcharts when ownership is secondary; use a regular swimlane when there is no current/future comparison |
| 系统由什么组成、组件如何连接？ | components and dependencies | Architecture diagram | Use C4 when multiple abstraction levels are needed |
| 多个系统按什么时间顺序交互？ | participants and messages over time | Sequence diagram | Use a flowchart when internal decision logic matters more than messages |
| 一个对象如何从一种状态变成另一种状态？ | states, events, transitions | State diagram | Use a flowchart when nodes are actions rather than states |
| 用户可以通过系统完成哪些目标？ | actors and capabilities | Use-case diagram | Use a flowchart for the steps inside one use case |
| 内容如何分类、上下级关系是什么？ | hierarchy or taxonomy | Mind map or tree | Use an organization chart when positions and reporting lines matter |
| 数据表、对象或概念如何关联？ | entities and relationships | ERD or relationship map | Use UML class when methods and inheritance matter |
| 类、属性、方法和继承关系是什么？ | object-oriented static structure | UML class diagram | Use an ERD when the subject is database entities and keys |
| 软件运行在哪里、如何部署？ | runtime nodes, networks, environments | Deployment or network topology diagram | Use architecture when logical components matter more than runtime placement |
| 不同类别谁高谁低？ | categorical numeric comparison | Bar chart | Use a dot plot when categories are numerous and labels are long |
| 指标如何随时间变化？ | ordered time series | Line chart | Use an area chart only when cumulative magnitude matters |
| 各部分占总体多少？ | a few parts summing to 100% | Pie or donut chart | Use a bar chart when there are many categories or close values |
| 数据如何分布、是否有异常值？ | numeric distribution | Histogram or box plot | Use scatter when relating two variables |
| 两个变量是否相关？ | paired numeric observations | Scatter plot | Use line only when the x-axis is ordered time |
| 项目什么时候做什么？ | dates, duration, dependencies | Gantt chart or timeline | Use a roadmap when only high-level milestones matter |
| 问题可能由哪些原因造成？ | categorized causes | Fishbone diagram | Use a tree when causal direction or levels matter |
| 两个维度下如何定位对象？ | two-axis classification | Quadrant or matrix | Use scatter when axes are measured numeric variables |
| 位置在哪里、区域如何分布？ | geographic or spatial relationships | Map | Use network topology for logical rather than physical position |

## Routing safeguards

- If the user explicitly names a diagram type and it is suitable, use it without asking them to choose again.
- If the named type would hide the core information, explain what it emphasizes and weakens, recommend the better type, and ask whether to keep or switch. Respect the user's final choice.
- If the user says “你决定”, “用最合适的”, or otherwise delegates the choice, select the primary recommendation and proceed without another confirmation.
- Offer alternatives only when they create a meaningful communication tradeoff. Never list alternatives merely to appear comprehensive.
- Do not use a swimlane merely because multiple devices or systems are mentioned. Use it only when responsibility or handoff is the point.
- Do not route to a paired AS-IS / TO-BE cross-functional flowchart merely because AI, automation, ERP, or another technology is mentioned. Use it only when the viewer must compare a validated current process with a proposed future process **and** responsibility or handoff is central. Read `references/as-is-to-be-cross-functional.md` before recommending or drawing it.
- Do not use a state diagram when most nodes are actions. Do not mix actions and states in one node vocabulary.
- Do not use a mind map for ordered decisions or return loops.
- Do not fabricate values for bar, line, pie, scatter, histogram, box, or Gantt charts. Ask for the missing data or draw a clearly labeled conceptual structure instead.
- For a mixed request, prefer one primary diagram plus a small supporting chart rather than forcing every idea into one overloaded canvas.
