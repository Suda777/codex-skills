(() => {
  "use strict";

  const STAGES = ["需求澄清", "方案确认", "实施推进", "验收交付", "已交付"];
  const STAGE_PROGRESS = { "需求澄清": 12, "方案确认": 30, "实施推进": 58, "验收交付": 82, "已交付": 100 };
  const DEFAULT_SETTINGS = Object.freeze({ defaultPeriod: "30", amountDisplay: "compact", riskAlerts: true, clientDigest: true, showMock: true });
  const initialProjects = [
    { id: "PJ-2601", name: "服务流程协同优化", client: "远川科技", owner: "岑远", amount: 360000, progress: 62, stage: "实施推进", risk: false, age: 3, description: "统一跨团队服务流转节点与状态口径。", next: "完成两项联调并提交阶段复盘。" },
    { id: "PJ-2602", name: "运营数据驾驶舱", client: "澄海实业", owner: "闻溪", amount: 520000, progress: 34, stage: "方案确认", risk: false, age: 7, description: "整合经营指标、业务台账和异常提示。", next: "确认指标口径与首页信息层级。" },
    { id: "PJ-2603", name: "事项管理流程重构", client: "启明服务", owner: "岑远", amount: 280000, progress: 47, stage: "实施推进", risk: true, age: 11, description: "重新梳理事项分派、跟踪、督办和办结流程。", next: "处理责任边界争议并更新排期。" },
    { id: "PJ-2604", name: "客户协作门户", client: "嘉禾产业", owner: "宋青", amount: 420000, progress: 18, stage: "需求澄清", risk: false, age: 15, description: "建设统一的项目资料与沟通进展展示入口。", next: "完成首轮角色访谈与页面清单确认。" },
    { id: "PJ-2605", name: "交付质量稽核台", client: "远川科技", owner: "周启", amount: 310000, progress: 78, stage: "验收交付", risk: true, age: 24, description: "按规则核查交付记录完整性与异常项。", next: "补齐两项验收证据并确认关闭规则。" },
    { id: "PJ-2606", name: "区域服务运营分析", client: "南峤集团", owner: "闻溪", amount: 260000, progress: 100, stage: "已交付", risk: false, age: 29, description: "对区域服务量、响应时长和风险信号进行分析。", next: "项目已交付，等待进入周期复盘。" },
    { id: "PJ-2607", name: "知识运营工作台", client: "启明服务", owner: "宋青", amount: 450000, progress: 100, stage: "已交付", risk: false, age: 44, description: "完成知识条目采集、加工、审核和发布协同。", next: "项目已交付，按计划跟踪使用反馈。" },
    { id: "PJ-2608", name: "经营机会跟踪系统", client: "嘉禾产业", owner: "周启", amount: 390000, progress: 100, stage: "已交付", risk: false, age: 76, description: "建立经营机会记录、阶段变更和协作提醒。", next: "项目已交付，进入常态运营。" }
  ];
  const initialNotices = [
    { id: "MN-01", title: "事项管理流程重构存在阶段风险", time: "15 分钟前", kind: "risk", read: false },
    { id: "MN-02", title: "远川科技有 2 个开放项目", time: "50 分钟前", kind: "client", read: false },
    { id: "MN-03", title: "区域服务运营分析已完成交付", time: "今天 09:20", kind: "general", read: true }
  ];

  const state = {
    projects: initialProjects.map((item) => ({ ...item })), notices: initialNotices.map((item) => ({ ...item })), filters: { keyword: "", stage: "", risk: "" }, period: 30, boardFilter: "all", activePage: "dashboard", activeProjectId: null,
    settings: { ...DEFAULT_SETTINGS }, savedSettings: { ...DEFAULT_SETTINGS }, updated: "今天 10:18"
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const dom = {
    sidebar: $("#materialSidebar"), backdrop: $("#sidebarBackdrop"), toggle: $("#mobileToggle"), main: $("#materialMain"), crumb: $("#materialCrumb"), pages: $$('[data-page]'), nav: $$('[data-nav]'),
    noticesButton: $("#notificationTrigger"), notices: $("#materialNotices"), noticeCount: $("#notificationCount"), noticeList: $("#materialNoticeList"), readAll: $("#noticeReadAll"),
    filterForm: $("#projectFilterForm"), keyword: $("#projectKeyword"), stage: $("#projectStage"), risk: $("#projectRisk"), projectBody: $("#projectTableBody"), result: $("#projectResultText"),
    sheet: $("#projectSheet"), advanceDialog: $("#advanceDialog"), createDialog: $("#createProjectDialog"), createForm: $("#createProjectForm"), settingsForm: $("#settingsForm"), settingsStatus: $("#settingsStatus"), toastStack: $("#materialToastStack")
  };
  const dialogReturn = new WeakMap();
  let noticeReturn = null;

  function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }
  function focusable(container) { return $$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', container).filter((node) => !node.hidden && node.getClientRects().length > 0); }
  function trap(event, container) { if (event.key !== "Tab") return; const items = focusable(container); if (!items.length) return; const first = items[0]; const last = items.at(-1); if (!items.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); } else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
  function toast(title, message) { const node = document.createElement("div"); node.className = "material-toast"; node.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`; dom.toastStack.append(node); setTimeout(() => node.remove(), 3400); }
  function stageClass(stage) { return { "需求澄清": "stage-discovery", "方案确认": "stage-plan", "实施推进": "stage-build", "验收交付": "stage-accept", "已交付": "stage-delivered" }[stage] || "stage-plan"; }
  function formatAmount(value) { return state.settings.amountDisplay === "full" ? `¥${Number(value).toLocaleString("zh-CN")}` : `¥${(Number(value) / 10000).toFixed(Number(value) % 10000 ? 1 : 0)}万`; }
  function periodProjects() { return state.projects.filter((project) => project.age <= state.period); }
  function filteredProjects() { const keyword = state.filters.keyword.toLowerCase(); return state.projects.filter((project) => (!keyword || [project.id, project.name, project.client, project.owner].some((value) => value.toLowerCase().includes(keyword))) && (!state.filters.stage || project.stage === state.filters.stage) && (!state.filters.risk || (state.filters.risk === "risk") === project.risk)); }
  function visibleNotices() { return state.notices.filter((notice) => !(notice.kind === "risk" && !state.settings.riskAlerts) && !(notice.kind === "client" && !state.settings.clientDigest)); }
  function clientSummaries() {
    const map = new Map();
    state.projects.forEach((project) => { if (!map.has(project.client)) map.set(project.client, []); map.get(project.client).push(project); });
    return [...map.entries()].map(([name, projects]) => ({ name, projects, amount: projects.reduce((sum, project) => sum + project.amount, 0), open: projects.filter((project) => project.stage !== "已交付").length, risk: projects.some((project) => project.risk), delivered: projects.filter((project) => project.stage === "已交付").length })).sort((a, b) => b.amount - a.amount);
  }

  function renderDashboard() {
    const projects = periodProjects();
    const delivered = projects.filter((project) => project.stage === "已交付").length;
    const risk = projects.filter((project) => project.risk).length;
    const value = projects.reduce((sum, project) => sum + project.amount, 0);
    $("#metricProjectCount").textContent = String(projects.length); $("#metricProjectNote").textContent = `近 ${state.period} 天`;
    $("#metricValue").textContent = formatAmount(value); $("#metricDelivered").textContent = String(delivered); $("#metricRisk").textContent = String(risk); $("#stageTrendSub").textContent = `近 ${state.period} 天项目阶段变化`;
    const sources = state.period === 7 ? [18, 24, 31, 39, 47, 55, 62] : state.period === 30 ? [12, 18, 25, 33, 41, 52, 61, 70] : [8, 14, 20, 28, 37, 45, 54, 64, 74];
    const points = sources.map((value, index) => `${Math.round(index * 760 / (sources.length - 1))},${Math.round(230 - value * 2.4 - delivered * 2)}`);
    $("#materialLine").setAttribute("points", points.join(" ")); $("#materialAreaPath").setAttribute("d", `M ${points.join(" L ")} L 760 250 L 0 250 Z`);
    const colors = ["#fb8c00", "#1a73e8", "#8e24aa", "#00acc1", "#4caf50"];
    const stageCounts = STAGES.map((stage, index) => ({ stage, count: state.projects.filter((project) => project.stage === stage).length, color: colors[index] }));
    const max = Math.max(1, ...stageCounts.map((item) => item.count));
    $("#stageBars").innerHTML = stageCounts.map((item) => `<div class="stage-row"><span>${escapeHtml(item.stage)}</span><span class="stage-track"><i style="width:${item.count / max * 100}%;background:${item.color}"></i></span><strong>${item.count}</strong></div>`).join("");
    $("#dashboardActivity").innerHTML = state.projects.slice(0,4).map((project) => `<article class="activity-item"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.client)} · ${escapeHtml(project.owner)}</small><span class="material-status ${stageClass(project.stage)}">${escapeHtml(project.stage)}</span></article>`).join("");
    const deliveryProgress = state.projects.length ? Math.round(state.projects.reduce((sum, project) => sum + project.progress, 0) / state.projects.length) : 0;
    $("#sidebarProgress").textContent = `${deliveryProgress}%`; $("#sidebarProgressBar").style.width = `${deliveryProgress}%`; $("#sidebarProjectCount").textContent = String(state.projects.filter((project) => project.stage !== "已交付").length);
  }

  function renderProjects() {
    const projects = filteredProjects();
    dom.result.textContent = `共 ${projects.length} 个${state.settings.showMock ? " Mock" : ""}项目`;
    dom.projectBody.innerHTML = projects.length ? projects.map((project) => `<tr><td><span class="project-name"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.id)} · ${escapeHtml(project.client)}</small></span></td><td>${escapeHtml(project.owner)}</td><td>${escapeHtml(formatAmount(project.amount))}</td><td><span class="progress-cell"><span class="progress-track"><i style="width:${project.progress}%"></i></span><strong>${project.progress}%</strong></span></td><td><span class="material-status ${stageClass(project.stage)}">${escapeHtml(project.stage)}</span></td><td><span class="risk-label ${project.risk ? "risk-alert" : "risk-normal"}">${project.risk ? "有风险" : "正常"}</span></td><td><button class="table-action" type="button" data-project-id="${escapeHtml(project.id)}">查看详情</button></td></tr>`).join("") : `<tr><td class="empty-project" colspan="7">当前条件下没有项目，请修改筛选条件。</td></tr>`;
  }

  function renderClients() {
    const clients = clientSummaries();
    $("#clientTotal").textContent = String(clients.length); $("#clientOpenProjects").textContent = String(clients.reduce((sum, client) => sum + client.open, 0)); $("#riskClientCount").textContent = String(clients.filter((client) => client.risk).length); $("#deliveredClientCount").textContent = String(clients.filter((client) => client.delivered > 0).length);
    const colors = ["#1a73e8", "#e91e63", "#4caf50", "#fb8c00", "#8e24aa", "#00acc1"];
    $("#clientGrid").innerHTML = clients.map((client, index) => `<article class="client-card" style="--client-color:${colors[index % colors.length]}"><span class="client-avatar" aria-hidden="true">${escapeHtml(client.name.slice(0,1))}</span><div class="client-card-head"><span class="risk-label ${client.risk ? "risk-alert" : "risk-normal"}">${client.risk ? "需要跟进" : "协作正常"}</span></div><h2>${escapeHtml(client.name)}</h2><p>${state.settings.showMock ? "匿名 Mock 客户" : "当前协作客户"}</p><div class="client-stats"><span><strong>${client.projects.length}</strong>项目总数</span><span><strong>${client.open}</strong>开放项目</span><span><strong>${escapeHtml(formatAmount(client.amount))}</strong>项目金额</span></div></article>`).join("");
  }

  function renderBoard() {
    const projects = state.projects.filter((project) => state.boardFilter === "all" || (state.boardFilter === "risk") === project.risk);
    const colors = ["#fb8c00", "#1a73e8", "#8e24aa", "#00acc1", "#4caf50"];
    $("#kanbanBoard").innerHTML = STAGES.map((stage, index) => { const items = projects.filter((project) => project.stage === stage); return `<section class="kanban-column"><div class="kanban-column-head"><h2>${escapeHtml(stage)}</h2><span>${items.length}</span></div><div class="kanban-stack">${items.length ? items.map((project) => `<article class="project-ticket" style="--ticket-color:${project.risk ? "#e53935" : colors[index]}"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.client)} · ${project.progress}%</small><div class="ticket-foot"><span class="risk-label ${project.risk ? "risk-alert" : "risk-normal"}">${project.risk ? "风险" : "正常"}</span><span class="ticket-owner" title="负责人 ${escapeHtml(project.owner)}" aria-label="负责人 ${escapeHtml(project.owner)}">${escapeHtml(project.owner.slice(0,1))}</span></div></article>`).join("") : `<p class="empty-board">当前没有项目</p>`}</div></section>`; }).join("");
  }

  function renderNotices() {
    const notices = visibleNotices(); const unread = notices.filter((notice) => !notice.read).length;
    dom.noticeCount.textContent = String(unread); dom.noticeCount.hidden = unread === 0; dom.noticesButton.setAttribute("aria-label", unread ? `查看项目通知，${unread} 条未读` : "查看项目通知，无未读");
    dom.noticeList.innerHTML = notices.length ? notices.map((notice) => `<div class="notice-entry ${notice.read ? "read" : ""}"><span class="notice-symbol" style="--notice-color:${notice.kind === "risk" ? "#e53935" : notice.kind === "client" ? "#1a73e8" : "#4caf50"}" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${notice.kind === "risk" ? "M12 3 2 21h20L12 3Zm0 6v5m0 3h.01" : notice.kind === "client" ? "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" : "m5 12 4 4L19 6"}"/></svg></span><span><strong>${escapeHtml(notice.title)}</strong><small>${escapeHtml(notice.time)} · ${notice.read ? "已读" : "未读"}</small></span></div>`).join("") : `<div class="notice-entry read"><span class="notice-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span><span><strong>当前没有可见通知</strong><small>通知会随项目状态和已保存偏好联动</small></span></div>`;
    dom.readAll.disabled = unread === 0; dom.readAll.title = unread === 0 ? "当前没有未读通知" : "";
  }

  function renderAll() { renderDashboard(); renderProjects(); renderClients(); renderBoard(); renderNotices(); $("#materialUpdated").textContent = `Mock 数据更新于${state.updated}`; if (dom.sheet.open && state.activeProjectId) renderSheet(); }

  function switchPage(id, options = {}) {
    const target = dom.pages.find((page) => page.id === id) || dom.pages[0]; state.activePage = target.id; dom.pages.forEach((page) => { page.hidden = page !== target; }); dom.nav.forEach((link) => link.hash === `#${target.id}` ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current"));
    const title = target.dataset.title || "运营仪表盘"; dom.crumb.textContent = title; document.title = `${title} · 组件化运营中台`; if (options.updateHash !== false && location.hash !== `#${target.id}`) history.pushState({ page: target.id }, "", `#${target.id}`); scrollTo({ top: 0, behavior: "auto" }); requestAnimationFrame(() => scrollTo({ top: 0, behavior: "auto" })); dom.main.scrollTop = 0; closeSidebar(); if (options.focus !== false) { const heading = target.querySelector("h1"); if (heading) heading.focus({ preventScroll: true }); }
  }
  function openSidebar() { document.body.classList.add("sidebar-open"); dom.backdrop.hidden = false; dom.toggle.setAttribute("aria-expanded", "true"); dom.toggle.setAttribute("aria-label", "关闭导航"); dom.sidebar.inert = false; dom.sidebar.removeAttribute("aria-hidden"); }
  function closeSidebar(restore = false) { document.body.classList.remove("sidebar-open"); dom.backdrop.hidden = true; dom.toggle.setAttribute("aria-expanded", "false"); dom.toggle.setAttribute("aria-label", "展开导航"); if (matchMedia("(max-width:940px)").matches) { dom.sidebar.inert = true; dom.sidebar.setAttribute("aria-hidden", "true"); } else { dom.sidebar.inert = false; dom.sidebar.removeAttribute("aria-hidden"); } if (restore) dom.toggle.focus(); }
  function openNotices() { noticeReturn = document.activeElement; dom.notices.hidden = false; dom.noticesButton.setAttribute("aria-expanded", "true"); dom.notices.focus(); }
  function closeNotices(restore = true) { if (dom.notices.hidden) return; dom.notices.hidden = true; dom.noticesButton.setAttribute("aria-expanded", "false"); if (restore && noticeReturn instanceof HTMLElement) noticeReturn.focus(); }
  function openDialog(dialog, opener) { dialogReturn.set(dialog, opener || document.activeElement); dialog.showModal(); document.body.classList.add("dialog-open"); (focusable(dialog)[0] || dialog).focus(); }
  function closeDialog(dialog, restore = true) { if (!dialog.open) return; dialog.close(); document.body.classList.toggle("dialog-open", [dom.sheet, dom.advanceDialog, dom.createDialog].some((item) => item.open)); const opener = dialogReturn.get(dialog); if (restore && opener instanceof HTMLElement && opener.isConnected && !opener.disabled) opener.focus(); }

  function renderSheet() {
    const project = state.projects.find((item) => item.id === state.activeProjectId); if (!project) return;
    $("#sheetTitle").textContent = project.id; $("#sheetStage").textContent = project.stage; $("#sheetStage").className = `material-status ${stageClass(project.stage)}`; $("#sheetName").textContent = project.name; $("#sheetCode").textContent = `${project.id} · 最近 ${project.age} 天内更新`; $("#sheetRisk").textContent = project.risk ? "有风险" : "风险正常"; $("#sheetRisk").className = `risk-label ${project.risk ? "risk-alert" : "risk-normal"}`; $("#sheetClient").textContent = project.client; $("#sheetOwner").textContent = project.owner; $("#sheetAmount").textContent = formatAmount(project.amount); $("#sheetProgress").textContent = `${project.progress}%`; $("#sheetDescription").textContent = project.description; $("#sheetNext").textContent = project.next;
    const button = $("#requestAdvanceButton"); button.disabled = project.stage === "已交付"; button.title = project.stage === "已交付" ? "项目已经交付，无需继续推进" : "";
  }
  function openSheet(id, opener) { if (!state.projects.some((project) => project.id === id)) return; state.activeProjectId = id; renderSheet(); openDialog(dom.sheet, opener); }
  function syncSettingsForm() { const fields = dom.settingsForm.elements; fields.defaultPeriod.value = state.settings.defaultPeriod; fields.amountDisplay.value = state.settings.amountDisplay; fields.riskAlerts.checked = state.settings.riskAlerts; fields.clientDigest.checked = state.settings.clientDigest; fields.showMock.checked = state.settings.showMock; }
  function readSettings() { const fields = dom.settingsForm.elements; return { defaultPeriod: fields.defaultPeriod.value, amountDisplay: fields.amountDisplay.value, riskAlerts: fields.riskAlerts.checked, clientDigest: fields.clientDigest.checked, showMock: fields.showMock.checked }; }
  function updatePeriod(value) { state.period = Number(value); $$('[data-period]').forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.period) === state.period))); renderDashboard(); }
  function updateTimestamp(prefix = "今天") { const now = new Date(); state.updated = `${prefix} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`; $("#materialUpdated").textContent = `Mock 数据更新于${state.updated}`; }

  function exportProjects() {
    const projects = filteredProjects(); const rows = [["项目编号", "项目名称", "客户", "负责人", "金额（元）", "进度", "阶段", "风险"], ...projects.map((project) => [project.id, project.name, project.client, project.owner, project.amount, `${project.progress}%`, project.stage, project.risk ? "有风险" : "正常"])]; const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n"); const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `projects-${new Date().toISOString().slice(0,10)}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0); toast("项目已导出", `CSV 已生成，包含 ${projects.length} 个当前筛选项目。`);
  }

  dom.nav.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); switchPage(link.hash.slice(1)); })); $$('[data-go]').forEach((button) => button.addEventListener("click", () => switchPage(button.dataset.go)));
  dom.toggle.addEventListener("click", () => document.body.classList.contains("sidebar-open") ? closeSidebar(true) : openSidebar()); dom.backdrop.addEventListener("click", () => closeSidebar(true));
  $$('[data-period]').forEach((button) => button.addEventListener("click", () => updatePeriod(button.dataset.period)));
  $("#refreshWorkspaceButton").addEventListener("click", () => { updateTimestamp(); state.projects.filter((project) => project.stage !== "已交付").forEach((project) => { project.progress = Math.min(99, project.progress + 1); }); renderAll(); toast("项目指标已刷新", "更新时间和开放项目进度已重新计算。       "); });
  $("#refreshClientsButton").addEventListener("click", () => { updateTimestamp("今天"); renderClients(); toast("客户汇总已刷新", "客户项目数、金额和风险状态已重新汇总。       "); });

  dom.noticesButton.addEventListener("click", () => dom.notices.hidden ? openNotices() : closeNotices()); $("#closeNoticesButton").addEventListener("click", () => closeNotices()); dom.readAll.addEventListener("click", () => { const ids = new Set(visibleNotices().map((notice) => notice.id)); const unread = state.notices.filter((notice) => ids.has(notice.id) && !notice.read); unread.forEach((notice) => { notice.read = true; }); renderNotices(); toast("通知已更新", `${unread.length} 条通知已标记为已读。`); });

  dom.filterForm.addEventListener("submit", (event) => { event.preventDefault(); state.filters = { keyword: dom.keyword.value.trim(), stage: dom.stage.value, risk: dom.risk.value }; renderProjects(); }); dom.filterForm.addEventListener("reset", () => setTimeout(() => { state.filters = { keyword: "", stage: "", risk: "" }; renderProjects(); }, 0)); [$("#globalExportProjectsButton"), $("#exportProjectsButton")].forEach((button) => button.addEventListener("click", exportProjects)); dom.projectBody.addEventListener("click", (event) => { const button = event.target.closest("[data-project-id]"); if (button) openSheet(button.dataset.projectId, button); });
  $("#requestAdvanceButton").addEventListener("click", (event) => { const project = state.projects.find((item) => item.id === state.activeProjectId); if (!project || project.stage === "已交付") return; const next = STAGES[STAGES.indexOf(project.stage) + 1]; $("#advanceDescription").textContent = `确认将 ${project.id}“${project.name}”从“${project.stage}”推进到“${next}”？台账、仪表盘、客户和看板将同步更新。`; openDialog(dom.advanceDialog, event.currentTarget); });
  $("#confirmAdvanceButton").addEventListener("click", () => { const project = state.projects.find((item) => item.id === state.activeProjectId); if (!project || project.stage === "已交付") { closeDialog(dom.advanceDialog); return; } const next = STAGES[STAGES.indexOf(project.stage) + 1]; project.stage = next; project.progress = Math.max(project.progress, STAGE_PROGRESS[next]); if (next === "已交付") { project.risk = false; project.next = "项目已交付，进入周期复盘与运营跟踪。"; } else { project.next = `完成“${next}”阶段的必需事项后再次推进。`; } state.notices.unshift({ id: `MN-${Date.now()}`, title: `${project.id} 已推进到${next}`, time: "刚刚", kind: "general", read: false }); closeDialog(dom.advanceDialog, false); renderAll(); (focusable(dom.sheet)[0] || dom.sheet).focus(); toast("项目阶段已更新", `${project.id} 已进入“${next}”，所有关联视图已同步。`); });

  function prepareCreate(opener) { dom.createForm.reset(); $$(".field-error", dom.createForm).forEach((node) => { node.textContent = ""; }); openDialog(dom.createDialog, opener); }
  [$("#newProjectButton"), $("#pageNewProjectButton"), $("#dashboardFab")].forEach((button) => button.addEventListener("click", (event) => prepareCreate(event.currentTarget)));
  dom.createForm.addEventListener("submit", (event) => { event.preventDefault(); const fields = dom.createForm.elements; const name = fields.name.value.trim(); const client = fields.client.value.trim(); const amount = Number(fields.amount.value); const description = fields.description.value.trim(); $("#newProjectNameError").textContent = name.length < 4 ? "请填写至少 4 个字的项目名称。" : ""; $("#newProjectClientError").textContent = client.length < 2 ? "请填写至少 2 个字的客户名称。" : ""; $("#newProjectAmountError").textContent = amount > 0 ? "" : "请输入大于 0 的项目金额。"; $("#newProjectDescriptionError").textContent = description.length < 8 ? "请填写至少 8 个字的项目说明。" : ""; if (name.length < 4 || client.length < 2 || amount <= 0 || description.length < 8) return; const id = `PJ-${2600 + state.projects.length + 1}`; const project = { id, name, client, owner: "岑远", amount, progress: 8, stage: "需求澄清", risk: false, age: 0, description, next: "完成关键角色访谈并确认需求边界。" }; state.projects.unshift(project); state.notices.unshift({ id: `MN-${Date.now()}`, title: `${id} 已创建并进入需求澄清`, time: "刚刚", kind: "client", read: false }); closeDialog(dom.createDialog, false); renderAll(); switchPage("projects", { focus: false }); const detailButton = $(`[data-project-id="${id}"]`); if (detailButton) detailButton.focus(); toast("项目已创建", `${id} 已同步到仪表盘、客户协作和任务看板。`); });

  $$('[data-board-filter]').forEach((button) => button.addEventListener("click", () => { state.boardFilter = button.dataset.boardFilter; $$('[data-board-filter]').forEach((item) => item.setAttribute("aria-pressed", String(item === button))); renderBoard(); }));
  dom.settingsForm.addEventListener("change", () => { dom.settingsStatus.textContent = "有未保存的修改，保存后会同步到相关页面。"; }); dom.settingsForm.addEventListener("submit", (event) => { event.preventDefault(); state.settings = readSettings(); state.savedSettings = { ...state.settings }; state.period = Number(state.settings.defaultPeriod); updatePeriod(state.period); renderAll(); dom.settingsStatus.textContent = `已保存：默认 ${state.period} 天，${state.settings.amountDisplay === "compact" ? "万元简写" : "完整金额"}。`; toast("设置已保存", "周期、金额展示、通知和 Mock 说明已同步。       "); });
  $("#restorePreferencesButton").addEventListener("click", () => { state.settings = { ...DEFAULT_SETTINGS }; state.savedSettings = { ...DEFAULT_SETTINGS }; state.period = 30; syncSettingsForm(); updatePeriod(30); renderAll(); dom.settingsStatus.textContent = "已恢复默认：30 天、万元简写和全部通知。"; toast("已恢复默认", "设置表单和所有关联视图已同步复原。       "); });

  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog")))); [dom.sheet, dom.advanceDialog, dom.createDialog].forEach((dialog) => { dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(dialog); }); dialog.addEventListener("keydown", (event) => trap(event, dialog)); });
  document.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; if (!dom.notices.hidden && ![dom.sheet, dom.advanceDialog, dom.createDialog].some((dialog) => dialog.open)) closeNotices(); else if (document.body.classList.contains("sidebar-open")) closeSidebar(true); }); document.addEventListener("pointerdown", (event) => { if (!dom.notices.hidden && !dom.notices.contains(event.target) && !dom.noticesButton.contains(event.target)) closeNotices(false); });
  addEventListener("popstate", () => switchPage(location.hash.slice(1) || "dashboard", { updateHash: false, focus: false })); matchMedia("(max-width:940px)").addEventListener("change", () => closeSidebar(false));

  syncSettingsForm(); renderAll(); const initial = dom.pages.some((page) => page.id === location.hash.slice(1)) ? location.hash.slice(1) : "dashboard"; if (location.hash !== `#${initial}`) history.replaceState({ page: initial }, "", `#${initial}`); closeSidebar(false); switchPage(initial, { updateHash: false, focus: false }); requestAnimationFrame(() => setTimeout(() => scrollTo(0, 0), 60));
})();
