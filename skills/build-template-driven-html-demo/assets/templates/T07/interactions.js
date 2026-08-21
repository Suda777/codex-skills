(() => {
  "use strict";

  const DEFAULT_SETTINGS = Object.freeze({ theme: "light", defaultPeriod: "30", failureAlerts: true, qualityAlerts: true, showMock: true });
  const initialAssets = [
    { id: "DS-101", name: "业务意图样本集", type: "文本分类", rows: 18540, quality: 96, updated: "今天 09:40", description: "用于训练和评估业务意图分类任务。" },
    { id: "DS-102", name: "服务记录抽取集", type: "信息抽取", rows: 12680, quality: 91, updated: "昨天 16:20", description: "匿名服务记录与结构化字段映射样本。" },
    { id: "DS-103", name: "数据质量规则集", type: "规则校验", rows: 4260, quality: 78, updated: "3 天前", description: "字段完整性、格式与关联关系的检测规则。" },
    { id: "DS-104", name: "知识条目加工集", type: "文本加工", rows: 9340, quality: 87, updated: "5 天前", description: "用于知识条目清洗、分段与摘要加工。" },
    { id: "DS-105", name: "异常案例对照集", type: "质量检测", rows: 3280, quality: 72, updated: "8 天前", description: "聚合低质量与异常输出的匿名对照案例。" },
    { id: "DS-106", name: "多轮问答评估集", type: "模型评估", rows: 7580, quality: 93, updated: "12 天前", description: "用于多轮上下文一致性和回答质量评估。" }
  ];
  const initialTasks = [
    { id: "AI-2041", name: "业务意图分类评估", type: "分类评估", model: "分类模型 B", owner: "苏研", quality: 94, status: "运行中", age: 2, assetId: "DS-101", description: "对最新意图样本执行分层评估并汇总混淆类别。" },
    { id: "AI-2042", name: "服务记录字段抽取", type: "文本抽取", model: "抽取模型 C", owner: "林序", quality: 91, status: "待确认", age: 5, assetId: "DS-102", description: "从匿名服务记录中抽取时间、类型和处理结果。" },
    { id: "AI-2043", name: "数据完整性巡检", type: "质量检测", model: "通用文本模型 A", owner: "周澜", quality: 76, status: "失败", age: 7, assetId: "DS-103", description: "检测关键字段缺失和跨表关联异常。" },
    { id: "AI-2044", name: "知识条目批量加工", type: "数据加工", model: "通用文本模型 A", owner: "林序", quality: 88, status: "排队中", age: 9, assetId: "DS-104", description: "清洗并分段知识条目，生成可检索摘要。" },
    { id: "AI-2045", name: "异常输出归因分析", type: "质量检测", model: "通用文本模型 A", owner: "周澜", quality: 73, status: "运行中", age: 16, assetId: "DS-105", description: "对异常输出进行类型聚合并形成修正建议。" },
    { id: "AI-2046", name: "多轮回答一致性评估", type: "分类评估", model: "分类模型 B", owner: "苏研", quality: 95, status: "已完成", age: 22, assetId: "DS-106", description: "评估多轮回答中的事实、指代和结论一致性。" },
    { id: "AI-2047", name: "历史样本格式标准化", type: "数据加工", model: "通用文本模型 A", owner: "林序", quality: 89, status: "已完成", age: 48, assetId: "DS-102", description: "将历史样本统一转换为当前数据规范。" },
    { id: "AI-2048", name: "季度模型表现回测", type: "分类评估", model: "分类模型 B", owner: "苏研", quality: 92, status: "已完成", age: 78, assetId: "DS-101", description: "使用季度样本回测核心模型的稳定性。" }
  ];
  const initialMembers = [
    { id: "MB-01", name: "苏研", role: "数据产品", skill: "任务设计与评估" },
    { id: "MB-02", name: "林序", role: "算法工程", skill: "抽取与文本加工" },
    { id: "MB-03", name: "周澜", role: "数据治理", skill: "质量规则与异常分析" },
    { id: "MB-04", name: "岑青", role: "业务分析", skill: "场景验证与指标分析" }
  ];
  const initialAlerts = [
    { id: "AL-01", title: "数据完整性巡检运行失败", time: "12 分钟前", kind: "failure", read: false },
    { id: "AL-02", title: "异常案例对照集质量分低于 80", time: "45 分钟前", kind: "quality", read: false },
    { id: "AL-03", title: "多轮回答一致性评估已完成", time: "今天 09:05", kind: "general", read: true }
  ];

  const state = {
    tasks: initialTasks.map((item) => ({ ...item })), assets: initialAssets.map((item) => ({ ...item })), members: initialMembers.map((item) => ({ ...item })), alerts: initialAlerts.map((item) => ({ ...item })),
    filters: { keyword: "", type: "", status: "" }, period: 30, assetView: "grid", activePage: "overview", activeTaskId: null,
    settings: { ...DEFAULT_SETTINGS }, savedSettings: { ...DEFAULT_SETTINGS }
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const dom = {
    sidebar: $("#dataSidebar"), overlay: $("#sidebarOverlay"), menu: $("#mobileMenuButton"), main: $("#dataMain"), crumb: $("#breadcrumbCurrent"), pages: $$('[data-page]'), nav: $$('[data-nav]'),
    alertButton: $("#alertButton"), alertMenu: $("#alertMenu"), alertCount: $("#alertCount"), alertList: $("#alertList"), markRead: $("#markAlertsRead"),
    filterForm: $("#taskFilterForm"), keyword: $("#taskKeyword"), type: $("#taskType"), status: $("#taskStatus"), taskBody: $("#taskTableBody"), taskResult: $("#taskResultText"),
    detailDialog: $("#taskDetailDialog"), completeDialog: $("#completeDialog"), newDialog: $("#newTaskDialog"), newForm: $("#newTaskForm"), inviteDialog: $("#inviteDialog"), inviteForm: $("#inviteForm"),
    settingsForm: $("#settingsForm"), settingsStatus: $("#settingsStatus"), toastZone: $("#toastZone")
  };
  const dialogReturn = new WeakMap();
  let alertReturn = null;

  function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])); }
  function focusable(container) { return $$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', container).filter((node) => !node.hidden && node.getClientRects().length > 0); }
  function trap(event, container) { if (event.key !== "Tab") return; const items = focusable(container); if (!items.length) return; const first = items[0]; const last = items.at(-1); if (!items.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); } else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
  function toast(title, message) { const node = document.createElement("div"); node.className = "toast"; node.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`; dom.toastZone.append(node); setTimeout(() => node.remove(), 3300); }
  function statusClass(status) { return { "排队中": "queued", "运行中": "running", "待确认": "review", "已完成": "complete", "失败": "failed" }[status] || "running"; }
  function assetById(id) { return state.assets.find((asset) => asset.id === id); }
  function periodTasks() { return state.tasks.filter((task) => task.age <= state.period); }
  function filteredTasks() { const keyword = state.filters.keyword.toLowerCase(); return state.tasks.filter((task) => (!keyword || [task.id, task.name, task.model, task.owner].some((value) => value.toLowerCase().includes(keyword))) && (!state.filters.type || task.type === state.filters.type) && (!state.filters.status || task.status === state.filters.status)); }
  function memberLoads() { const result = new Map(state.members.map((member) => [member.name, 0])); state.tasks.filter((task) => task.status !== "已完成").forEach((task) => result.set(task.owner, (result.get(task.owner) || 0) + 1)); return result; }
  function visibleAlerts() { return state.alerts.filter((alert) => !(alert.kind === "failure" && !state.settings.failureAlerts) && !(alert.kind === "quality" && !state.settings.qualityAlerts)); }

  function renderOverview() {
    const tasks = periodTasks();
    const completed = tasks.filter((task) => task.status === "已完成").length;
    const risk = tasks.filter((task) => task.status === "失败").length;
    const qualities = tasks.map((task) => task.quality).filter(Number.isFinite);
    const average = qualities.length ? Math.round(qualities.reduce((sum, value) => sum + value, 0) / qualities.length) : 0;
    $("#statTasks").textContent = String(tasks.length);
    $("#statSuccess").textContent = `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`;
    $("#statQuality").textContent = String(average);
    $("#statRisk").textContent = String(risk);
    $("#statTaskTrend").textContent = `近 ${state.period} 天任务`;
    $("#throughputSubtitle").textContent = `近 ${state.period} 天提交与完成数量`;
    const source = state.period === 7 ? [6, 8, 7, 11, 9, 13, 15] : state.period === 30 ? [11, 15, 14, 19, 17, 23, 21, 27] : [18, 21, 20, 28, 26, 31, 35, 33, 39];
    const points = source.map((value, index) => `${Math.round(index * 760 / (source.length - 1))},${Math.round(220 - value * 4 - completed * 2)}`);
    $("#taskLine").setAttribute("points", points.join(" "));
    $("#taskAreaPath").setAttribute("d", `M ${points.join(" L ")} L 760 250 L 0 250 Z`);
    const distributions = [
      { label: "90–100", count: state.assets.filter((asset) => asset.quality >= 90).length, color: "var(--success)" },
      { label: "80–89", count: state.assets.filter((asset) => asset.quality >= 80 && asset.quality < 90).length, color: "var(--primary)" },
      { label: "70–79", count: state.assets.filter((asset) => asset.quality >= 70 && asset.quality < 80).length, color: "var(--warning)" },
      { label: "低于 70", count: state.assets.filter((asset) => asset.quality < 70).length, color: "var(--danger)" }
    ];
    const max = Math.max(1, ...distributions.map((item) => item.count));
    $("#qualityBars").innerHTML = distributions.map((item) => `<div class="quality-row"><span>${item.label} 分</span><span class="quality-track"><i style="width:${Math.round(item.count / max * 100)}%;background:${item.color}"></i></span><strong>${item.count}</strong></div>`).join("");
    $("#recentTaskList").innerHTML = state.tasks.slice(0, 4).map((task) => `<article class="compact-task"><strong>${escapeHtml(task.name)}</strong><small>${escapeHtml(task.owner)} · ${escapeHtml(task.model)}</small><span class="status-tag ${statusClass(task.status)}">${escapeHtml(task.status)}</span></article>`).join("");
    const active = state.tasks.filter((task) => task.status !== "已完成").length;
    $("#activeTaskCount").textContent = String(active);
    $("#quotaText").textContent = `${state.tasks.length} / 30`;
    $("#quotaBar").style.width = `${Math.min(100, state.tasks.length / 30 * 100)}%`;
  }

  function renderTasks() {
    const tasks = filteredTasks();
    dom.taskResult.textContent = `共 ${tasks.length} 项${state.settings.showMock ? " Mock" : ""}任务`;
    dom.taskBody.innerHTML = tasks.length ? tasks.map((task) => `<tr><td><span class="task-name"><strong>${escapeHtml(task.name)}</strong><small>${escapeHtml(task.id)}</small></span></td><td>${escapeHtml(task.type)}</td><td>${escapeHtml(task.model)}</td><td>${escapeHtml(task.owner)}</td><td>${task.quality ?? "待计算"}</td><td><span class="status-tag ${statusClass(task.status)}">${escapeHtml(task.status)}</span></td><td><button class="table-button" type="button" data-task-id="${escapeHtml(task.id)}">查看详情</button></td></tr>`).join("") : `<tr><td class="empty-cell" colspan="7">没有符合当前条件的任务，请修改筛选条件。</td></tr>`;
  }

  function renderAssets() {
    $("#assetCount").textContent = String(state.assets.length);
    $("#assetRows").textContent = state.assets.reduce((sum, asset) => sum + asset.rows, 0).toLocaleString("zh-CN");
    $("#highQualityAssets").textContent = String(state.assets.filter((asset) => asset.quality >= 90).length);
    $("#riskAssets").textContent = String(state.assets.filter((asset) => asset.quality < 80).length);
    $("#assetViewLabel").textContent = `${state.assetView === "grid" ? "网格" : "列表"}视图 · 显示全部资产`;
    const container = $("#assetContainer");
    container.classList.toggle("list-mode", state.assetView === "list");
    container.innerHTML = state.assets.map((asset) => {
      const related = state.tasks.filter((task) => task.assetId === asset.id);
      const verified = related.filter((task) => task.status === "已完成").length;
      return `<article class="asset-card"><div class="asset-card-head"><span class="asset-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg></span><span class="status-tag ${asset.quality >= 90 ? "complete" : asset.quality >= 80 ? "running" : "failed"}">${asset.quality} 分</span></div><div><h2>${escapeHtml(asset.name)}</h2><p>${escapeHtml(asset.description)}</p></div><div class="asset-meta"><span><strong>${asset.rows.toLocaleString("zh-CN")}</strong>记录数</span><span><strong>${related.length}</strong>关联任务</span><span><strong>${verified}</strong>已验证任务</span><span><strong>${escapeHtml(asset.updated)}</strong>最近更新</span></div></article>`;
    }).join("");
    $(".asset-toolbar span:last-child").textContent = state.settings.showMock ? "Mock 数据仅用于模板演示" : "当前会话数据资产";
  }

  function renderTeam() {
    const loads = memberLoads();
    $("#teamMemberTotal").textContent = String(state.members.length);
    $("#teamActiveTasks").textContent = String([...loads.values()].reduce((sum, value) => sum + value, 0));
    $("#teamOverload").textContent = String([...loads.values()].filter((value) => value >= 3).length);
    $("#teamTableBody").innerHTML = state.members.map((member) => {
      const load = loads.get(member.name) || 0;
      const percent = Math.min(100, load / 4 * 100);
      return `<tr><td><span class="member-cell"><span class="member-avatar" aria-hidden="true">${escapeHtml(member.name.slice(0, 1))}</span><span class="member-copy"><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)}</small></span></span></td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.skill)}</td><td>${load} 项</td><td><span class="load-cell"><span class="load-meter"><i class="${load >= 3 ? "high" : ""}" style="width:${percent}%"></i></span><strong>${load >= 3 ? "高" : load ? "中" : "低"}</strong></span></td></tr>`;
    }).join("");
  }

  function renderAlerts() {
    const alerts = visibleAlerts();
    const unread = alerts.filter((alert) => !alert.read).length;
    dom.alertCount.textContent = String(unread);
    dom.alertCount.hidden = unread === 0;
    dom.alertButton.setAttribute("aria-label", unread ? `查看数据通知，${unread} 条未读` : "查看数据通知，无未读");
    dom.alertList.innerHTML = alerts.length ? alerts.map((alert) => `<div class="alert-row ${alert.read ? "read" : ""}"><span class="alert-dot" aria-hidden="true"></span><span><strong>${escapeHtml(alert.title)}</strong><small>${escapeHtml(alert.time)} · ${alert.read ? "已读" : "未读"}</small></span></div>`).join("") : `<div class="alert-row read"><span class="alert-dot" aria-hidden="true"></span><span><strong>当前没有可见通知</strong><small>通知会随任务、资产和已保存偏好联动</small></span></div>`;
    dom.markRead.disabled = unread === 0;
    dom.markRead.title = unread === 0 ? "当前没有未读通知" : "";
  }

  function renderAll() { renderOverview(); renderTasks(); renderAssets(); renderTeam(); renderAlerts(); if (dom.detailDialog.open && state.activeTaskId) renderTaskDetail(); }

  function switchPage(id, options = {}) {
    const target = dom.pages.find((page) => page.id === id) || dom.pages[0];
    state.activePage = target.id;
    dom.pages.forEach((page) => { page.hidden = page !== target; });
    dom.nav.forEach((link) => link.hash === `#${target.id}` ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current"));
    const title = target.dataset.title || "数据概览";
    dom.crumb.textContent = title;
    document.title = `${title} · AI 数据中台`;
    if (options.updateHash !== false && location.hash !== `#${target.id}`) history.pushState({ page: target.id }, "", `#${target.id}`);
    scrollTo({ top: 0, behavior: "auto" }); requestAnimationFrame(() => scrollTo({ top: 0, behavior: "auto" })); dom.main.scrollTop = 0; closeSidebar();
    if (options.focus !== false) { const heading = target.querySelector("h1"); if (heading) heading.focus({ preventScroll: true }); }
  }
  function openSidebar() { document.body.classList.add("sidebar-open"); dom.overlay.hidden = false; dom.menu.setAttribute("aria-expanded", "true"); dom.menu.setAttribute("aria-label", "关闭导航"); dom.sidebar.inert = false; dom.sidebar.removeAttribute("aria-hidden"); }
  function closeSidebar(restore = false) { document.body.classList.remove("sidebar-open"); dom.overlay.hidden = true; dom.menu.setAttribute("aria-expanded", "false"); dom.menu.setAttribute("aria-label", "展开导航"); if (matchMedia("(max-width:900px)").matches) { dom.sidebar.inert = true; dom.sidebar.setAttribute("aria-hidden", "true"); } else { dom.sidebar.inert = false; dom.sidebar.removeAttribute("aria-hidden"); } if (restore) dom.menu.focus(); }

  function openAlerts() { alertReturn = document.activeElement; dom.alertMenu.hidden = false; dom.alertButton.setAttribute("aria-expanded", "true"); dom.alertMenu.focus(); }
  function closeAlerts(restore = true) { if (dom.alertMenu.hidden) return; dom.alertMenu.hidden = true; dom.alertButton.setAttribute("aria-expanded", "false"); if (restore && alertReturn instanceof HTMLElement) alertReturn.focus(); }
  function openDialog(dialog, opener) { dialogReturn.set(dialog, opener || document.activeElement); dialog.showModal(); document.body.classList.add("modal-open"); (focusable(dialog)[0] || dialog).focus(); }
  function closeDialog(dialog, restore = true) { if (!dialog.open) return; dialog.close(); document.body.classList.toggle("modal-open", [dom.detailDialog, dom.completeDialog, dom.newDialog, dom.inviteDialog].some((item) => item.open)); const opener = dialogReturn.get(dialog); if (restore && opener instanceof HTMLElement && opener.isConnected && !opener.disabled) opener.focus(); }

  function renderTaskDetail() {
    const task = state.tasks.find((item) => item.id === state.activeTaskId); if (!task) return;
    const asset = assetById(task.assetId);
    $("#taskDetailTitle").textContent = task.id;
    $("#detailStatus").textContent = task.status; $("#detailStatus").className = `status-tag ${statusClass(task.status)}`;
    $("#detailName").textContent = task.name; $("#detailCode").textContent = `${task.id} · 最近 ${task.age} 天内更新`;
    $("#detailType").textContent = task.type; $("#detailModel").textContent = task.model; $("#detailOwner").textContent = task.owner; $("#detailQuality").textContent = task.quality ?? "待计算"; $("#detailAsset").textContent = asset ? `${asset.name}（${asset.id}）` : "未关联"; $("#detailDescription").textContent = task.description;
    $("#requestCompleteTask").disabled = task.status === "已完成"; $("#requestCompleteTask").title = task.status === "已完成" ? "该任务已经完成" : "";
  }
  function openTaskDetail(id, opener) { if (!state.tasks.some((task) => task.id === id)) return; state.activeTaskId = id; renderTaskDetail(); openDialog(dom.detailDialog, opener); }

  function updateTheme(theme) { state.settings.theme = theme; document.body.classList.toggle("dark-mode", theme === "dark"); dom.settingsForm.elements.theme.value = theme; }
  function syncSettingsForm() { const fields = dom.settingsForm.elements; fields.theme.value = state.settings.theme; fields.defaultPeriod.value = state.settings.defaultPeriod; fields.failureAlerts.checked = state.settings.failureAlerts; fields.qualityAlerts.checked = state.settings.qualityAlerts; fields.showMock.checked = state.settings.showMock; updateTheme(state.settings.theme); }
  function readSettings() { const fields = dom.settingsForm.elements; return { theme: fields.theme.value, defaultPeriod: fields.defaultPeriod.value, failureAlerts: fields.failureAlerts.checked, qualityAlerts: fields.qualityAlerts.checked, showMock: fields.showMock.checked }; }
  function updatePeriod(value) { state.period = Number(value); $$('[data-period]').forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.period) === state.period))); renderOverview(); }

  function exportTasks() {
    const tasks = filteredTasks();
    const rows = [["任务编号", "任务名称", "类型", "模型", "负责人", "质量分", "状态", "关联数据集"], ...tasks.map((task) => [task.id, task.name, task.type, task.model, task.owner, task.quality ?? "", task.status, assetById(task.assetId)?.name || ""])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `ai-tasks-${new Date().toISOString().slice(0,10)}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
    toast("任务已导出", `CSV 已生成，包含 ${tasks.length} 项当前筛选结果。`);
  }

  dom.nav.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); switchPage(link.hash.slice(1)); }));
  $$('[data-go]').forEach((button) => button.addEventListener("click", () => switchPage(button.dataset.go)));
  dom.menu.addEventListener("click", () => document.body.classList.contains("sidebar-open") ? closeSidebar(true) : openSidebar()); dom.overlay.addEventListener("click", () => closeSidebar(true));
  $$('[data-period]').forEach((button) => button.addEventListener("click", () => updatePeriod(button.dataset.period)));
  $$('[data-theme-toggle]').forEach((button) => button.addEventListener("click", () => { const next = document.body.classList.contains("dark-mode") ? "light" : "dark"; updateTheme(next); dom.settingsStatus.textContent = "主题已预览但尚未保存，进入系统设置可保存。"; toast("主题已切换", `当前预览为${next === "dark" ? "深色" : "浅色"}主题。`); }));

  dom.alertButton.addEventListener("click", () => dom.alertMenu.hidden ? openAlerts() : closeAlerts()); $("#closeAlertButton").addEventListener("click", () => closeAlerts());
  dom.markRead.addEventListener("click", () => { const ids = new Set(visibleAlerts().map((alert) => alert.id)); const unread = state.alerts.filter((alert) => ids.has(alert.id) && !alert.read); unread.forEach((alert) => { alert.read = true; }); renderAlerts(); toast("通知已更新", `${unread.length} 条通知已标记为已读。`); });

  dom.filterForm.addEventListener("submit", (event) => { event.preventDefault(); state.filters = { keyword: dom.keyword.value.trim(), type: dom.type.value, status: dom.status.value }; renderTasks(); });
  dom.filterForm.addEventListener("reset", () => setTimeout(() => { state.filters = { keyword: "", type: "", status: "" }; renderTasks(); }, 0));
  [$("#globalExportTasksButton"), $("#exportTasksButton")].forEach((button) => button.addEventListener("click", exportTasks));
  dom.taskBody.addEventListener("click", (event) => { const button = event.target.closest("[data-task-id]"); if (button) openTaskDetail(button.dataset.taskId, button); });
  $("#requestCompleteTask").addEventListener("click", (event) => { const task = state.tasks.find((item) => item.id === state.activeTaskId); if (!task || task.status === "已完成") return; $("#completeDescription").textContent = `确认将 ${task.id}“${task.name}”标记为已完成？任务指标、资产验证数和团队负载会同步更新。`; openDialog(dom.completeDialog, event.currentTarget); });
  $("#confirmCompleteTask").addEventListener("click", () => { const task = state.tasks.find((item) => item.id === state.activeTaskId); if (!task || task.status === "已完成") { closeDialog(dom.completeDialog); return; } task.status = "已完成"; if (!Number.isFinite(task.quality)) task.quality = 88; state.alerts.unshift({ id: `AL-${Date.now()}`, title: `${task.id} 已完成并同步指标`, time: "刚刚", kind: "general", read: false }); closeDialog(dom.completeDialog, false); closeDialog(dom.detailDialog, false); renderAll(); const button = $(`[data-task-id="${task.id}"]`); if (button) button.focus(); toast("任务已完成", `${task.id}、数据资产验证数和团队负载已同步。`); });

  function prepareNewTask(opener) { dom.newForm.reset(); $$(".field-error", dom.newForm).forEach((node) => { node.textContent = ""; }); $("#newTaskAsset").innerHTML = `<option value="">请选择数据集</option>${state.assets.map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(asset.name)}</option>`).join("")}`; openDialog(dom.newDialog, opener); }
  [$("#newTaskButton"), $("#pageNewTaskButton")].forEach((button) => button.addEventListener("click", (event) => prepareNewTask(event.currentTarget)));
  dom.newForm.addEventListener("submit", (event) => { event.preventDefault(); const fields = dom.newForm.elements; const name = fields.name.value.trim(); const type = fields.type.value; const model = fields.model.value; const assetId = fields.asset.value; $("#newTaskNameError").textContent = name.length < 4 ? "请填写至少 4 个字的任务名称。" : ""; $("#newTaskTypeError").textContent = type ? "" : "请选择任务类型。"; $("#newTaskModelError").textContent = model ? "" : "请选择模型。"; $("#newTaskAssetError").textContent = assetId ? "" : "请选择关联数据集。"; if (name.length < 4 || !type || !model || !assetId) return; const id = `AI-${2040 + state.tasks.length + 1}`; const task = { id, name, type, model, owner: "苏研", quality: null, status: "排队中", age: 0, assetId, description: "新建任务已进入本地演示队列，等待运行。" }; state.tasks.unshift(task); state.alerts.unshift({ id: `AL-${Date.now()}`, title: `${id} 已加入任务队列`, time: "刚刚", kind: "general", read: false }); closeDialog(dom.newDialog, false); renderAll(); switchPage("tasks", { focus: false }); const detailButton = $(`[data-task-id="${id}"]`); if (detailButton) detailButton.focus(); toast("任务已创建", `${id} 已加入队列并同步到概览、资产和团队负载。`); });

  $$('[data-asset-view]').forEach((button) => button.addEventListener("click", () => { state.assetView = button.dataset.assetView; $$('[data-asset-view]').forEach((item) => item.setAttribute("aria-pressed", String(item === button))); renderAssets(); }));
  $("#inviteMemberButton").addEventListener("click", (event) => { dom.inviteForm.reset(); $$(".field-error", dom.inviteForm).forEach((node) => { node.textContent = ""; }); openDialog(dom.inviteDialog, event.currentTarget); });
  dom.inviteForm.addEventListener("submit", (event) => { event.preventDefault(); const fields = dom.inviteForm.elements; const name = fields.name.value.trim(); const role = fields.role.value; const skill = fields.skill.value.trim(); $("#inviteNameError").textContent = name.length < 2 ? "请输入至少 2 个字的成员姓名。" : ""; $("#inviteRoleError").textContent = role ? "" : "请选择成员角色。"; $("#inviteSkillError").textContent = skill.length < 3 ? "请填写至少 3 个字的专长说明。" : ""; if (name.length < 2 || !role || skill.length < 3) return; state.members.push({ id: `MB-${String(state.members.length + 1).padStart(2,"0")}`, name, role, skill }); closeDialog(dom.inviteDialog, false); renderTeam(); $("#inviteMemberButton").focus(); toast("成员已添加", `${name}已加入团队成员清单。`); });

  dom.settingsForm.addEventListener("change", (event) => { if (event.target.name === "theme") updateTheme(event.target.value); dom.settingsStatus.textContent = "有未保存的设置，保存后成为当前会话默认值。"; });
  dom.settingsForm.addEventListener("submit", (event) => { event.preventDefault(); state.settings = readSettings(); state.savedSettings = { ...state.settings }; state.period = Number(state.settings.defaultPeriod); updateTheme(state.settings.theme); updatePeriod(state.period); renderAll(); dom.settingsStatus.textContent = `已保存：${state.settings.theme === "dark" ? "深色" : "浅色"}主题，默认 ${state.period} 天。`; toast("设置已保存", "主题、周期、通知和 Mock 边界已同步。       "); });
  $("#restoreSettingsButton").addEventListener("click", () => { state.settings = { ...DEFAULT_SETTINGS }; state.savedSettings = { ...DEFAULT_SETTINGS }; state.period = 30; syncSettingsForm(); updatePeriod(30); renderAll(); dom.settingsStatus.textContent = "已恢复默认：浅色主题、30 天和全部工作通知。"; toast("已恢复默认", "设置表单和相关页面已同步复原。       "); });

  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog"))));
  [dom.detailDialog, dom.completeDialog, dom.newDialog, dom.inviteDialog].forEach((dialog) => { dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(dialog); }); dialog.addEventListener("keydown", (event) => trap(event, dialog)); });
  document.addEventListener("keydown", (event) => { if (event.key !== "Escape") return; if (!dom.alertMenu.hidden && ![dom.detailDialog, dom.completeDialog, dom.newDialog, dom.inviteDialog].some((dialog) => dialog.open)) closeAlerts(); else if (document.body.classList.contains("sidebar-open")) closeSidebar(true); });
  document.addEventListener("pointerdown", (event) => { if (!dom.alertMenu.hidden && !dom.alertMenu.contains(event.target) && !dom.alertButton.contains(event.target)) closeAlerts(false); });
  addEventListener("popstate", () => switchPage(location.hash.slice(1) || "overview", { updateHash: false, focus: false }));
  matchMedia("(max-width:900px)").addEventListener("change", () => closeSidebar(false));

  syncSettingsForm(); renderAll();
  const initial = dom.pages.some((page) => page.id === location.hash.slice(1)) ? location.hash.slice(1) : "overview";
  if (location.hash !== `#${initial}`) history.replaceState({ page: initial }, "", `#${initial}`);
  closeSidebar(false); switchPage(initial, { updateHash: false, focus: false }); requestAnimationFrame(() => setTimeout(() => scrollTo(0, 0), 60));
})();
