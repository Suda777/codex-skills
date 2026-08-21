(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const byId = (id) => document.getElementById(id);

  const records = [
    { id: "RUN-1048", title: "高价值机会识别", dataset: "经营机会池", owner: "林予安", score: 92, status: "待复核", updated: "08-21 10:28", note: "验证机会评分与客户阶段是否一致。", trace: "完成 4 个步骤；命中 12 条高优先级线索。" },
    { id: "RUN-1047", title: "服务波动归因", dataset: "服务质量明细", owner: "周序", score: 78, status: "有风险", updated: "08-21 09:42", note: "观察区域级服务波动并核对异常来源。", trace: "2 个字段缺失；需要负责人确认采集口径。" },
    { id: "RUN-1046", title: "渠道触点聚类", dataset: "渠道触点日志", owner: "许澄", score: 86, status: "运行中", updated: "08-20 18:16", note: "将碎片触点合并为可解释的客户旅程。", trace: "已处理 68%；预计剩余 4 个模拟步骤。" },
    { id: "RUN-1045", title: "重点事项排序", dataset: "经营机会池", owner: "林予安", score: 95, status: "已完成", updated: "08-20 16:35", note: "按影响、紧迫度和数据完整性排序。", trace: "已生成 8 条排序解释并完成本地归档。" },
    { id: "RUN-1044", title: "异常工单筛查", dataset: "服务质量明细", owner: "周序", score: 81, status: "待运行", updated: "08-20 14:20", note: "识别重复、超时和责任字段冲突的工单。", trace: "运行条件已满足，等待手动启动。" },
    { id: "RUN-1043", title: "存量客户分层", dataset: "经营机会池", owner: "顾念", score: 89, status: "已完成", updated: "08-19 17:50", note: "形成可供业务复核的客户分层建议。", trace: "完成 5 个分层并输出 24 条解释。" },
    { id: "RUN-1042", title: "触点缺口检测", dataset: "渠道触点日志", owner: "许澄", score: 74, status: "有风险", updated: "08-19 15:05", note: "查找旅程节点中缺失或顺序异常的触点。", trace: "发现 7 个空白节点，等待数据协作者补充。" },
    { id: "RUN-1041", title: "区域质量对比", dataset: "服务质量明细", owner: "顾念", score: 88, status: "待复核", updated: "08-18 11:32", note: "比较区域差异并排除样本量干扰。", trace: "已完成计算；3 个结论需要业务复核。" },
    { id: "RUN-1040", title: "客户意向校准", dataset: "渠道触点日志", owner: "林予安", score: 91, status: "已完成", updated: "08-17 09:18", note: "校准不同渠道的意向信号权重。", trace: "已应用新权重并完成对照检查。" }
  ];

  const state = {
    records,
    filters: { keyword: "", status: "", owner: "" },
    members: [
      { name: "林予安", role: "分析负责人", load: 72, state: "处理中" },
      { name: "周序", role: "数据协作者", load: 64, state: "需关注" },
      { name: "许澄", role: "数据协作者", load: 48, state: "处理中" },
      { name: "顾念", role: "业务观察员", load: 26, state: "可协作" },
      { name: "陈屿", role: "业务观察员", load: 18, state: "可协作" }
    ],
    notifications: [
      { title: "RUN-1047 需要复核字段口径", time: "10 分钟前", read: false },
      { title: "重点事项排序已完成", time: "昨天 16:35", read: false },
      { title: "工作区 Mock 数据已更新", time: "昨天 09:10", read: true }
    ],
    activePage: "overview",
    activeRecordId: null,
    period: 30,
    workspace: "华东经营分析",
    insightSort: "risk",
    role: "",
    settings: { compactRows: false, showMockLabels: true, landingPage: "overview", defaultPeriod: 30 }
  };
  const SETTINGS_KEY = "t09-analysis-demo-settings-v1";
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (saved && typeof saved === "object") {
      state.settings = { ...state.settings, ...saved };
      state.period = Number(state.settings.defaultPeriod) || 30;
    }
  } catch {}

  const pageNames = Object.fromEntries($$("[data-page-view]").map((page) => [page.id, page.dataset.pageTitle]));
  let restoreFocus = null;
  let drawerRestoreFocus = null;

  window.__demoDebug = { exports: [], createdRuns: [], invitedMembers: [], statusChanges: [], savedSettings: [], visitedPages: ["overview"], queryRuns: [] };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function toast(title, detail) {
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span>`;
    byId("toastRegion").append(item);
    window.setTimeout(() => item.remove(), 3200);
  }

  function statusClass(status) {
    return {
      "待运行": "status-wait",
      "运行中": "status-running",
      "待复核": "status-review",
      "已完成": "status-done",
      "有风险": "status-risk"
    }[status] || "status-wait";
  }

  function nextStatus(status) {
    return { "待运行": "运行中", "运行中": "待复核", "待复核": "已完成", "有风险": "运行中", "已完成": "已完成" }[status] || status;
  }

  function visibleRecords() {
    const keyword = state.filters.keyword.trim().toLowerCase();
    return state.records.filter((record) => {
      const text = `${record.id} ${record.title} ${record.dataset}`.toLowerCase();
      return (!keyword || text.includes(keyword)) &&
        (!state.filters.status || record.status === state.filters.status) &&
        (!state.filters.owner || record.owner === state.filters.owner);
    });
  }

  function renderPeriod() {
    $$("[data-period]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.period) === state.period)));
    byId("periodCaption").textContent = `近 ${state.period} 天`;
    byId("metricTotalMeta").textContent = `近 ${state.period} 天`;
    const series = {
      7: [26, 48, 41, 70, 53, 82, 66],
      30: [22, 35, 29, 48, 42, 61, 52, 69, 58, 78, 71, 88],
      90: [18, 28, 24, 36, 32, 44, 39, 55, 49, 62, 57, 69, 64, 77, 71, 84]
    }[state.period];
    byId("velocityChart").innerHTML = series.map((value) => `<i class="velocity-bar" style="--height:${value}%" data-value="${value}" aria-label="${value} 次"></i>`).join("");
  }

  function renderMetrics() {
    const completed = state.records.filter((record) => record.status === "已完成").length;
    const risk = state.records.filter((record) => ["有风险", "待复核"].includes(record.status)).length;
    const average = Math.round(state.records.reduce((sum, record) => sum + record.score, 0) / state.records.length);
    byId("metricTotal").textContent = String(state.records.length);
    byId("metricRate").textContent = `${Math.round(completed / state.records.length * 100)}%`;
    byId("metricScore").textContent = String(average);
    byId("metricRisk").textContent = String(risk);
  }

  function renderRecentRuns() {
    byId("recentRuns").innerHTML = state.records.slice(0, 4).map((record) => `
      <article class="minimal-row">
        <div><strong>${escapeHtml(record.title)}</strong><small>${escapeHtml(record.id)}</small></div>
        <span>${escapeHtml(record.dataset)}</span>
        <span>${record.score}</span>
        <span class="status ${statusClass(record.status)}">${escapeHtml(record.status)}</span>
        <button class="row-button" type="button" data-open-run="${escapeHtml(record.id)}">详情</button>
      </article>`).join("");
  }

  function populateFilters() {
    const ownerFilter = byId("ownerFilter");
    const roleFilter = byId("roleFilter");
    const owners = [...new Set(state.records.map((record) => record.owner))].sort();
    ownerFilter.innerHTML = '<option value="">全部负责人</option>' + owners.map((owner) => `<option>${escapeHtml(owner)}</option>`).join("");
    ownerFilter.value = state.filters.owner;
    const roles = [...new Set(state.members.map((member) => member.role))].sort();
    roleFilter.innerHTML = '<option value="">全部角色</option>' + roles.map((role) => `<option>${escapeHtml(role)}</option>`).join("");
    roleFilter.value = state.role;
  }

  function renderRuns() {
    const rows = visibleRecords();
    byId("resultSummary").textContent = `共 ${rows.length} 条，来自 ${state.workspace}`;
    byId("runTableBody").innerHTML = rows.map((record) => `
      <tr>
        <td><strong>${escapeHtml(record.title)}</strong><small>${escapeHtml(record.id)}</small></td>
        <td>${escapeHtml(record.dataset)}</td><td>${escapeHtml(record.owner)}</td><td>${record.score}</td>
        <td><span class="status ${statusClass(record.status)}">${escapeHtml(record.status)}</span></td>
        <td><small>${escapeHtml(record.updated)}</small></td>
        <td><button class="row-button" type="button" data-open-run="${escapeHtml(record.id)}">查看</button></td>
      </tr>`).join("");
    byId("emptyState").hidden = rows.length > 0;
  }

  function sortedSignals() {
    const riskOrder = { "有风险": 0, "待复核": 1, "待运行": 2, "运行中": 3, "已完成": 4 };
    return [...state.records].sort((a, b) => {
      if (state.insightSort === "score") return b.score - a.score;
      if (state.insightSort === "fresh") return b.id.localeCompare(a.id);
      return riskOrder[a.status] - riskOrder[b.status] || b.score - a.score;
    });
  }

  function renderInsights() {
    const counts = state.records.reduce((map, record) => map.set(record.dataset, (map.get(record.dataset) || 0) + 1), new Map());
    const max = Math.max(...counts.values());
    byId("datasetDistribution").innerHTML = [...counts.entries()].map(([name, count]) => `
      <div class="distribution-item"><span>${escapeHtml(name)}</span><div class="distribution-track"><i style="--width:${Math.round(count / max * 100)}%"></i></div><strong>${count}</strong></div>`).join("");
    const signals = sortedSignals().slice(0, 6);
    byId("signalCount").textContent = String(signals.length).padStart(2, "0");
    byId("signalList").innerHTML = signals.map((record, index) => `
      <article class="signal-item"><span class="signal-index">${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(record.title)}</strong><p>${escapeHtml(record.note)}</p></div><span class="status ${statusClass(record.status)}">${escapeHtml(record.status)}</span></article>`).join("");
  }

  function renderTeam() {
    const members = state.members.filter((member) => !state.role || member.role === state.role);
    byId("memberCount").textContent = String(state.members.length);
    byId("busyCount").textContent = String(state.members.filter((member) => member.state !== "可协作").length);
    byId("memberGrid").innerHTML = members.map((member) => `
      <article class="member-card"><div class="member-card-head"><span class="member-avatar">${escapeHtml(member.name.slice(0, 1))}</span><span class="status ${member.state === "需关注" ? "status-risk" : member.state === "处理中" ? "status-running" : "status-done"}">${escapeHtml(member.state)}</span></div><div><strong>${escapeHtml(member.name)}</strong><p>${escapeHtml(member.role)}</p></div><div><div class="load-track"><i style="--load:${member.load}%"></i></div><p>当前负载 ${member.load}%</p></div></article>`).join("");
    byId("memberEmpty").hidden = members.length > 0;
  }

  function renderNotifications() {
    const unread = state.notifications.filter((item) => !item.read).length;
    byId("notificationBadge").textContent = String(unread);
    byId("notificationBadge").hidden = unread === 0;
    byId("notificationList").innerHTML = state.notifications.map((item) => `<article class="notification-item" data-unread="${String(!item.read)}"><div><strong>${escapeHtml(item.title)}</strong><span>${item.read ? "已读" : "未读"}</span></div><span>${escapeHtml(item.time)}</span></article>`).join("");
    byId("markAllReadButton").disabled = unread === 0;
  }

  function renderAll() {
    populateFilters();
    renderMetrics();
    renderPeriod();
    renderRecentRuns();
    renderRuns();
    renderInsights();
    renderTeam();
    renderNotifications();
  }

  function applySidebarState(open) {
    const narrow = window.innerWidth <= 840;
    byId("appShell").classList.toggle("sidebar-open", open);
    byId("menuButton").setAttribute("aria-expanded", String(open));
    byId("sidebarScrim").hidden = !open;
    byId("sidebar").inert = narrow && !open;
    byId("sidebar").setAttribute("aria-hidden", String(narrow && !open));
  }
  function closeSidebar(restore = false) {
    const wasOpen = byId("appShell").classList.contains("sidebar-open");
    applySidebarState(false);
    if (restore && wasOpen) byId("menuButton").focus();
  }
  function openSidebar() {
    applySidebarState(true);
    byId("sidebar").querySelector("[data-nav-item]")?.focus();
  }

  function setPage(pageId, focusHeading = false) {
    if (!pageNames[pageId]) return;
    state.activePage = pageId;
    $$("[data-page-view]").forEach((page) => { page.hidden = page.id !== pageId; });
    $$("[data-nav-item]").forEach((link) => {
      if (link.getAttribute("href") === `#${pageId}`) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    byId("pageLabel").textContent = pageNames[pageId];
    document.title = `极简分析台 · ${pageNames[pageId]}`;
    history.replaceState(null, "", `#${pageId}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    if (window.innerWidth <= 840) closeSidebar();
    window.__demoDebug.visitedPages.push(pageId);
    if (focusHeading) byId(`${pageId}Title`)?.focus();
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function exportCsv(rows, scope) {
    const content = [["编号", "标题", "数据集", "负责人", "置信度", "状态", "更新时间"], ...rows.map((record) => [record.id, record.title, record.dataset, record.owner, record.score, record.status, record.updated])]
      .map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-runs-${scope}-2026-08-21.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    window.__demoDebug.exports.push({ scope, rows: rows.length });
    toast("导出已生成", `CSV 包含 ${rows.length} 条运行记录`);
  }

  function openNotifications() {
    restoreFocus = document.activeElement;
    byId("notificationPanel").hidden = false;
    byId("notificationButton").setAttribute("aria-expanded", "true");
    byId("notificationPanel").focus();
  }
  function closeNotifications(restore = true) {
    byId("notificationPanel").hidden = true;
    byId("notificationButton").setAttribute("aria-expanded", "false");
    if (restore) restoreFocus?.focus?.();
  }

  function openDrawer(recordId, trigger) {
    const record = state.records.find((item) => item.id === recordId);
    if (!record) return;
    state.activeRecordId = recordId;
    if (byId("runDrawer").hidden) drawerRestoreFocus = trigger || document.activeElement;
    byId("drawerId").textContent = record.id;
    byId("drawerName").textContent = record.title;
    byId("drawerNote").textContent = record.note;
    byId("drawerDataset").textContent = record.dataset;
    byId("drawerOwner").textContent = record.owner;
    byId("drawerScore").textContent = String(record.score);
    byId("drawerStatus").innerHTML = `<span class="status ${statusClass(record.status)}">${escapeHtml(record.status)}</span>`;
    byId("drawerTrace").textContent = record.trace;
    const done = record.status === "已完成";
    byId("requestStatusButton").disabled = done;
    byId("requestStatusButton").textContent = done ? "运行已完成" : `推进为${nextStatus(record.status)}`;
    byId("runDrawer").hidden = false;
    document.body.style.overflow = "hidden";
    byId("closeDrawerButton").focus();
  }
  function closeDrawer() {
    byId("runDrawer").hidden = true;
    document.body.style.overflow = "";
    const fallback = $$(`[data-open-run="${state.activeRecordId}"]`).find((item) => item.offsetParent !== null);
    const target = drawerRestoreFocus?.isConnected ? drawerRestoreFocus : fallback;
    drawerRestoreFocus = null;
    target?.focus?.();
  }

  function openDialog(dialog, trigger) {
    restoreFocus = trigger || document.activeElement;
    dialog.showModal();
  }
  function closeDialog(dialog, restore = true) {
    if (dialog.open) dialog.close();
    if (restore) {
      const target = restoreFocus;
      restoreFocus = null;
      target?.focus?.();
    }
  }
  function trapTab(event, root) {
    if (event.key !== "Tab") return;
    const focusable = $$("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)", root).filter((item) => !item.hidden && item.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function clearFieldError(input, error) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }
  function setFieldError(input, error, message) {
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
  }

  $$("[data-nav-item]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    setPage(link.getAttribute("href").slice(1), true);
  }));
  $$("[data-go-page]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.goPage, true)));

  byId("workspaceSelect").addEventListener("change", () => {
    state.workspace = byId("workspaceSelect").value;
    byId("workspaceLabel").textContent = state.workspace;
    renderRuns();
    toast("工作区已切换", `当前查看：${state.workspace}`);
  });
  byId("menuButton").addEventListener("click", () => {
    const open = !byId("appShell").classList.contains("sidebar-open");
    if (open) openSidebar();
    else closeSidebar(true);
  });
  byId("sidebarScrim").addEventListener("click", () => closeSidebar(true));

  byId("globalExportButton").addEventListener("click", () => exportCsv(state.records, "all"));
  byId("pageExportButton").addEventListener("click", () => exportCsv(visibleRecords(), "filtered"));
  byId("notificationButton").addEventListener("click", () => byId("notificationPanel").hidden ? openNotifications() : closeNotifications());
  byId("closeNotifications").addEventListener("click", () => closeNotifications());
  byId("markAllReadButton").addEventListener("click", () => {
    state.notifications.forEach((item) => { item.read = true; });
    renderNotifications();
    toast("通知已处理", "全部通知已标为已读");
  });

  $$("[data-period]").forEach((button) => button.addEventListener("click", () => {
    state.period = Number(button.dataset.period);
    renderPeriod();
    toast("周期已更新", `概览已切换为近 ${state.period} 天`);
  }));
  byId("runQueryButton").addEventListener("click", () => {
    const question = byId("queryInput").value.trim();
    if (question.length < 6) {
      byId("queryStatus").textContent = "请至少输入 6 个字符";
      byId("queryInput").focus();
      return;
    }
    const priority = sortedSignals().filter((record) => ["有风险", "待复核"].includes(record.status)).slice(0, 2);
    byId("queryResult").hidden = false;
    byId("queryResult").innerHTML = `建议优先复核 <strong>${priority.map((item) => escapeHtml(item.title)).join("、")}</strong>。判断依据为当前状态与置信度；结果仅用于 Mock 演示。`;
    byId("queryStatus").textContent = "分析已完成 · 本地 Mock";
    window.__demoDebug.queryRuns.push(question);
    state.notifications.unshift({ title: "快速分析已生成一条本地结果", time: "刚刚", read: false });
    renderNotifications();
  });

  byId("filterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.filters = { keyword: byId("keywordInput").value, status: byId("statusFilter").value, owner: byId("ownerFilter").value };
    renderRuns();
  });
  byId("filterForm").addEventListener("reset", () => window.setTimeout(() => {
    state.filters = { keyword: "", status: "", owner: "" };
    renderRuns();
    toast("筛选已重置", "已恢复全部运行记录");
  }));
  byId("runTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-run]");
    if (button) openDrawer(button.dataset.openRun, button);
  });
  byId("recentRuns").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-run]");
    if (button) openDrawer(button.dataset.openRun, button);
  });

  byId("insightSort").addEventListener("change", () => {
    state.insightSort = byId("insightSort").value;
    renderInsights();
  });
  byId("recalculateInsights").addEventListener("click", () => {
    renderInsights();
    toast("信号已重算", "洞察与运行台账保持同一数据口径");
  });
  byId("roleFilter").addEventListener("change", () => {
    state.role = byId("roleFilter").value;
    renderTeam();
  });

  ["compactRows", "showMockLabels", "landingPage", "defaultPeriod"].forEach((id) => byId(id).addEventListener("change", () => {
    byId("settingsStatus").textContent = "有尚未保存的更改";
  }));
  byId("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = {
      compactRows: byId("compactRows").checked,
      showMockLabels: byId("showMockLabels").checked,
      landingPage: byId("landingPage").value,
      defaultPeriod: Number(byId("defaultPeriod").value)
    };
    document.body.classList.toggle("compact", state.settings.compactRows);
    document.body.classList.toggle("mock-hidden", !state.settings.showMockLabels);
    state.period = state.settings.defaultPeriod;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch {}
    renderPeriod();
    byId("settingsStatus").textContent = "已保存到当前演示会话";
    window.__demoDebug.savedSettings.push({ ...state.settings });
    toast("设置已保存", "展示偏好已立即生效");
  });
  byId("resetSettingsButton").addEventListener("click", () => {
    byId("settingsForm").reset();
    byId("compactRows").checked = false;
    byId("showMockLabels").checked = true;
    byId("landingPage").value = "overview";
    byId("defaultPeriod").value = "30";
    state.settings = { compactRows: false, showMockLabels: true, landingPage: "overview", defaultPeriod: 30 };
    state.period = 30;
    try { localStorage.removeItem(SETTINGS_KEY); } catch {}
    document.body.classList.remove("compact", "mock-hidden");
    renderPeriod();
    byId("settingsStatus").textContent = "已恢复默认设置";
    toast("已恢复默认", "周期、密度与 Mock 标识均已复原");
  });

  byId("openCreateButton").addEventListener("click", (event) => openDialog(byId("createDialog"), event.currentTarget));
  byId("closeCreateDialog").addEventListener("click", () => closeDialog(byId("createDialog")));
  byId("cancelCreate").addEventListener("click", () => closeDialog(byId("createDialog")));
  byId("createDialog").addEventListener("cancel", () => window.setTimeout(() => { restoreFocus?.focus?.(); restoreFocus = null; }));
  byId("createForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = byId("createTitle").value.trim();
    const dataset = byId("createDataset").value;
    clearFieldError(byId("createTitle"), byId("createTitleError"));
    clearFieldError(byId("createDataset"), byId("createDatasetError"));
    let valid = true;
    if (title.length < 4) { setFieldError(byId("createTitle"), byId("createTitleError"), "请输入至少 4 个字符"); valid = false; }
    if (!dataset) { setFieldError(byId("createDataset"), byId("createDatasetError"), "请选择数据集"); valid = false; }
    if (!valid) return;
    const id = `RUN-${1049 + window.__demoDebug.createdRuns.length}`;
    const record = { id, title, dataset, owner: "周序", score: 76, status: "运行中", updated: "08-21 刚刚", note: "由当前演示会话新建的本地分析。", trace: "已创建并进入模拟运行；未连接真实数据源。" };
    state.records.unshift(record);
    window.__demoDebug.createdRuns.push(id);
    state.notifications.unshift({ title: `${id} 已创建并开始运行`, time: "刚刚", read: false });
    byId("createForm").reset();
    closeDialog(byId("createDialog"));
    renderAll();
    setPage("runs", true);
    toast("分析已创建", `${id} 已加入运行列表`);
  });

  byId("openInviteButton").addEventListener("click", (event) => openDialog(byId("inviteDialog"), event.currentTarget));
  byId("closeInviteDialog").addEventListener("click", () => closeDialog(byId("inviteDialog")));
  byId("cancelInvite").addEventListener("click", () => closeDialog(byId("inviteDialog")));
  byId("inviteDialog").addEventListener("cancel", () => window.setTimeout(() => { restoreFocus?.focus?.(); restoreFocus = null; }));
  byId("inviteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("inviteName").value.trim();
    const role = byId("inviteRole").value;
    clearFieldError(byId("inviteName"), byId("inviteNameError"));
    clearFieldError(byId("inviteRole"), byId("inviteRoleError"));
    let valid = true;
    if (name.length < 2) { setFieldError(byId("inviteName"), byId("inviteNameError"), "请输入至少 2 个字符"); valid = false; }
    if (!role) { setFieldError(byId("inviteRole"), byId("inviteRoleError"), "请选择角色"); valid = false; }
    if (!valid) return;
    state.members.push({ name, role, load: 0, state: "可协作" });
    window.__demoDebug.invitedMembers.push(name);
    byId("inviteForm").reset();
    state.role = "";
    closeDialog(byId("inviteDialog"));
    populateFilters();
    renderTeam();
    toast("成员已邀请", `${name} 已加入本地协作清单`);
  });

  byId("closeDrawerButton").addEventListener("click", closeDrawer);
  byId("drawerBackdrop").addEventListener("click", closeDrawer);
  byId("drawerBackButton").addEventListener("click", closeDrawer);
  byId("requestStatusButton").addEventListener("click", (event) => {
    const record = state.records.find((item) => item.id === state.activeRecordId);
    if (!record || record.status === "已完成") return;
    restoreFocus = event.currentTarget;
    byId("statusDescription").textContent = `“${record.title}”将从“${record.status}”推进为“${nextStatus(record.status)}”。确认后概览、运行和洞察会同步更新。`;
    byId("statusDialog").showModal();
  });
  byId("closeStatusDialog").addEventListener("click", () => closeDialog(byId("statusDialog")));
  byId("cancelStatusButton").addEventListener("click", () => closeDialog(byId("statusDialog")));
  byId("statusDialog").addEventListener("cancel", () => window.setTimeout(() => { restoreFocus?.focus?.(); restoreFocus = null; }));
  [byId("createDialog"), byId("inviteDialog"), byId("statusDialog")].forEach((dialog) => dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeDialog(dialog); return; }
    trapTab(event, dialog);
  }));
  byId("confirmStatusButton").addEventListener("click", () => {
    const record = state.records.find((item) => item.id === state.activeRecordId);
    if (!record) return;
    const before = record.status;
    record.status = nextStatus(record.status);
    record.updated = "08-21 刚刚";
    record.trace = `状态已从“${before}”推进为“${record.status}”；该变更仅存在于当前演示会话。`;
    window.__demoDebug.statusChanges.push({ id: record.id, before, after: record.status });
    state.notifications.unshift({ title: `${record.id} 已推进为${record.status}`, time: "刚刚", read: false });
    closeDialog(byId("statusDialog"), false);
    renderAll();
    openDrawer(record.id);
    restoreFocus = null;
    toast("状态已推进", `概览与洞察已同步更新`);
  });

  byId("drawerPanel").addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeDrawer(); return; }
    if (event.key !== "Tab") return;
    const focusable = $$("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)", byId("drawerPanel")).filter((item) => !item.hidden && item.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.querySelector("dialog[open]")) {
      if (!byId("notificationPanel").hidden) closeNotifications();
      else if (byId("appShell").classList.contains("sidebar-open")) closeSidebar(true);
    }
    if (/^[1-5]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      const target = ["overview", "runs", "insights", "team", "settings"][Number(event.key) - 1];
      setPage(target, true);
    }
  });

  window.addEventListener("hashchange", () => {
    const target = location.hash.slice(1);
    if (pageNames[target] && target !== state.activePage) setPage(target);
  });
  window.matchMedia("(max-width: 840px)").addEventListener("change", () => closeSidebar(false));

  byId("compactRows").checked = state.settings.compactRows;
  byId("showMockLabels").checked = state.settings.showMockLabels;
  byId("landingPage").value = state.settings.landingPage;
  byId("defaultPeriod").value = String(state.settings.defaultPeriod);
  document.body.classList.toggle("compact", state.settings.compactRows);
  document.body.classList.toggle("mock-hidden", !state.settings.showMockLabels);
  populateFilters();
  renderAll();
  closeSidebar(false);
  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  const requestedPage = pageNames[location.hash.slice(1)] ? location.hash.slice(1) : null;
  const initial = navigationType === "reload" ? state.settings.landingPage : (requestedPage || state.settings.landingPage);
  setPage(initial);
})();
