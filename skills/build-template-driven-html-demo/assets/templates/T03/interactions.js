(() => {
  "use strict";

  const defaults = { landing: "overview", density: "compact", riskAlerts: true, activityAlerts: true };
  const statusFlow = {
    "待受理": { status: "办理中", node: "业务办理" },
    "办理中": { status: "待复核", node: "结果复核" },
    "待复核": { status: "已办结", node: "办结归档" },
    "有风险": { status: "办理中", node: "风险处置" }
  };
  const state = {
    page: "overview",
    period: 30,
    refreshSerial: 0,
    activeCaseId: null,
    filters: { keyword: "", status: "", line: "" },
    activityOnlyWorkflow: false,
    settings: { ...defaults },
    savedSettings: { ...defaults },
    cases: [
      { id: "LC-260821-01", name: "跨部门资料完整性复核", line: "项目受理", node: "结果复核", owner: "林川", status: "待复核", opened: "2026-08-17", updated: "今天 10:24", age: 4, note: "申请材料已通过业务部门初核，等待复核岗确认跨部门补充说明。" },
      { id: "LC-260820-02", name: "服务事项口径统一", line: "规范治理", node: "业务办理", owner: "赵苒", status: "办理中", opened: "2026-08-15", updated: "今天 09:46", age: 6, note: "三类服务事项的统计口径正在合并，当前需补充两个字段定义。" },
      { id: "LC-260819-03", name: "区域联办权限校核", line: "协同联办", node: "风险处置", owner: "周野", status: "有风险", opened: "2026-08-12", updated: "昨天 17:30", age: 9, note: "两个区域的角色权限存在冲突，需督办员协调确认最终授权范围。" },
      { id: "LC-260818-04", name: "批量事项受理测试", line: "项目受理", node: "受理登记", owner: "陆予", status: "待受理", opened: "2026-08-18", updated: "昨天 15:12", age: 3, note: "合成批量数据已完成预检，等待受理岗确认测试批次。" },
      { id: "LC-260815-05", name: "历史数据归档核验", line: "数据归档", node: "办结归档", owner: "林川", status: "已办结", opened: "2026-08-05", updated: "08-20 16:08", age: 10, note: "归档清单与校验摘要已完成，本地演示状态为已办结。" },
      { id: "LC-260814-06", name: "异常节点回溯分析", line: "规范治理", node: "业务办理", owner: "赵苒", status: "办理中", opened: "2026-08-08", updated: "08-20 14:20", age: 12, note: "已定位三处异常节点，正在补充处理原因与改进建议。" },
      { id: "LC-260812-07", name: "联办流程时限复核", line: "协同联办", node: "结果复核", owner: "周野", status: "待复核", opened: "2026-08-01", updated: "08-19 11:32", age: 19, note: "跨区域联办用时已重新计算，等待流程负责人确认。" },
      { id: "LC-260810-08", name: "风险事项处置闭环", line: "风险管理", node: "风险处置", owner: "陆予", status: "有风险", opened: "2026-07-28", updated: "08-18 18:15", age: 24, note: "仍有一项处置材料未归集，超过演示阈值并进入督办队列。" }
    ],
    members: [
      { id: "M-01", name: "林川", role: "流程督办", region: "总部" },
      { id: "M-02", name: "赵苒", role: "流程专员", region: "东区" },
      { id: "M-03", name: "周野", role: "业务复核", region: "南区" },
      { id: "M-04", name: "陆予", role: "风险督办", region: "北区" }
    ],
    activities: [
      { id: "A-01", type: "workflow", title: "事项进入待复核", detail: "跨部门资料完整性复核已提交复核岗。", time: "今天 10:24" },
      { id: "A-02", type: "workflow", title: "风险节点已升级", detail: "区域联办权限校核进入督办队列。", time: "昨天 17:30" },
      { id: "A-03", type: "system", title: "节点负载已计算", detail: "系统基于 8 条 Mock 事项完成本地汇总。", time: "昨天 16:05" },
      { id: "A-04", type: "workflow", title: "事项完成归档", detail: "历史数据归档核验已办结。", time: "08-20 16:08" }
    ],
    notices: [
      { id: "N-01", kind: "risk", title: "2 条事项处于风险处置节点", time: "刚刚", read: false },
      { id: "N-02", kind: "workflow", title: "2 条事项等待结果复核", time: "今天 10:24", read: false },
      { id: "N-03", kind: "system", title: "本地演示数据已重新计算", time: "昨天 16:05", read: true }
    ]
  };

  const $ = (id) => document.getElementById(id);
  const dom = {
    sidebar: $("opsSidebar"), sidebarToggle: $("sidebarToggle"), sidebarBackdrop: $("sidebarBackdrop"),
    nav: [...document.querySelectorAll("[data-page-target]")], pages: [...document.querySelectorAll("[data-page-view]")],
    breadcrumb: $("breadcrumbCurrent"), main: $("mainContent"), sync: $("syncLabel"),
    noticeButton: $("noticeButton"), noticePanel: $("noticePanel"), noticeBadge: $("noticeBadge"), noticeList: $("noticeList"), markNoticesRead: $("markNoticesRead"),
    periodButtons: [...document.querySelectorAll("[data-period]")], periodTag: $("periodTag"), throughputSubtitle: $("throughputSubtitle"), throughputChart: $("throughputChart"),
    metricActive: $("metricActive"), metricActiveMeta: $("metricActiveMeta"), metricReview: $("metricReview"), metricDuration: $("metricDuration"), metricDurationMeta: $("metricDurationMeta"), metricRisk: $("metricRisk"), navRiskCount: $("navRiskCount"),
    riskQueue: $("riskQueue"), activityTimeline: $("activityTimeline"), fullActivityTimeline: $("fullActivityTimeline"), clearActivityFilter: $("clearActivityFilter"),
    filterForm: $("ledgerFilter"), keywordInput: $("keywordInput"), statusSelect: $("statusSelect"), lineSelect: $("lineSelect"), filterHint: $("filterHint"), ledgerBody: $("ledgerBody"), ledgerSummary: $("ledgerSummary"), ledgerCount: $("ledgerCount"), ledgerEmpty: $("ledgerEmpty"),
    nodeBoard: $("nodeBoard"), bottleneckList: $("bottleneckList"), bottleneckUpdated: $("bottleneckUpdated"),
    memberCount: $("memberCount"), teamLoad: $("teamLoad"), overloadCount: $("overloadCount"), teamBody: $("teamBody"),
    detailShell: $("detailShell"), detailDrawer: $("detailDrawer"), drawerCode: $("drawerCode"), drawerName: $("drawerName"), drawerSummary: $("drawerSummary"), drawerLine: $("drawerLine"), drawerNode: $("drawerNode"), drawerOwner: $("drawerOwner"), drawerStatus: $("drawerStatus"), drawerOpened: $("drawerOpened"), drawerUpdated: $("drawerUpdated"), drawerNote: $("drawerNote"), requestProgress: $("requestProgress"),
    progressDialog: $("progressDialog"), progressMessage: $("progressMessage"), confirmProgress: $("confirmProgress"),
    inviteDialog: $("inviteDialog"), inviteForm: $("inviteForm"), inviteName: $("inviteName"), inviteRole: $("inviteRole"), inviteRegion: $("inviteRegion"), nameError: $("nameError"), roleError: $("roleError"), regionError: $("regionError"),
    settingsForm: $("settingsForm"), settingsStatus: $("settingsStatus"), toastRegion: $("toastRegion")
  };
  let drawerReturnFocus = null;
  let noticeReturnFocus = null;
  const dialogReturnFocus = new WeakMap();

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[char]);
  }

  function statusClass(status) {
    return ({ "待受理": "status-wait", "办理中": "status-run", "待复核": "status-review", "已办结": "status-done", "有风险": "status-risk" })[status] || "";
  }

  function toast(title, message) {
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div>`;
    dom.toastRegion.append(item);
    window.setTimeout(() => item.remove(), 3400);
  }

  function focusable(container) {
    return [...container.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex='-1'])")].filter((node) => !node.hidden && node.getClientRects().length > 0);
  }

  function trapFocus(event, container) {
    if (event.key !== "Tab") return;
    const items = focusable(container);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!items.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function activeCases() { return state.cases.filter((item) => item.status !== "已办结"); }
  function filteredCases() {
    const keyword = state.filters.keyword.trim().toLowerCase();
    return state.cases.filter((item) => {
      const text = `${item.id} ${item.name} ${item.owner}`.toLowerCase();
      return (!keyword || text.includes(keyword)) && (!state.filters.status || item.status === state.filters.status) && (!state.filters.line || item.line === state.filters.line);
    });
  }

  function renderMetrics() {
    const active = activeCases();
    const review = state.cases.filter((item) => item.status === "待复核").length;
    const risks = state.cases.filter((item) => item.status === "有风险").length;
    const average = Math.round(state.cases.reduce((sum, item) => sum + item.age, 0) / state.cases.length);
    dom.metricActive.textContent = String(active.length);
    dom.metricActiveMeta.textContent = `${state.cases.length} 条事项中 ${active.length} 条未办结`;
    dom.metricReview.textContent = String(review);
    dom.metricRisk.textContent = String(risks);
    dom.navRiskCount.textContent = String(risks);
    dom.navRiskCount.hidden = risks === 0;
    dom.metricDuration.textContent = `${Math.max(1, average - Math.floor(state.period / 45))} 天`;
    dom.metricDurationMeta.textContent = `近 ${state.period} 天模拟口径`;
  }

  function renderThroughput() {
    const baseByPeriod = { 7: [8, 6, 4, 2, 5], 30: [28, 24, 17, 7, 20], 90: [82, 69, 51, 18, 63] };
    const labels = ["受理登记", "业务办理", "结果复核", "风险处置", "办结归档"];
    const values = baseByPeriod[state.period].map((value, index) => value + ((state.refreshSerial + index) % 2));
    const max = Math.max(...values, 1);
    dom.throughputChart.innerHTML = values.map((value, index) => `<div class="throughput-column"><strong>${value}</strong><span class="throughput-bar" style="height:${Math.max(10,Math.round(value / max * 82))}%"></span><span>${escapeHtml(labels[index])}</span></div>`).join("");
    dom.periodTag.textContent = `${state.period}D`;
    dom.throughputSubtitle.textContent = `近 ${state.period} 天各节点处理量`;
  }

  function renderRiskQueue() {
    const risks = state.cases.filter((item) => item.status === "有风险").sort((a,b) => b.age - a.age);
    dom.riskQueue.innerHTML = risks.length ? risks.map((item) => `<div class="queue-row"><span class="queue-severity" aria-hidden="true"></span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.owner)} · 已持续 ${item.age} 天</small></div><button class="text-btn" type="button" data-open-case="${escapeHtml(item.id)}">查看</button></div>`).join("") : `<div class="empty-state"><strong>当前无风险事项</strong><span>流程推进后会同步更新此队列。</span></div>`;
  }

  function activityMarkup(limit) {
    const list = state.activities.filter((item) => !state.activityOnlyWorkflow || item.type === "workflow").slice(0, limit);
    return list.map((item) => `<div class="activity-entry"><span class="timeline-dot" aria-hidden="true"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></div><small>${escapeHtml(item.time)}</small></div>`).join("") || `<div class="empty-state"><span>当前筛选下没有活动记录。</span></div>`;
  }

  function renderActivities() {
    dom.activityTimeline.innerHTML = activityMarkup(4);
    dom.fullActivityTimeline.innerHTML = activityMarkup(8);
    dom.clearActivityFilter.textContent = state.activityOnlyWorkflow ? "显示全部" : "只看状态变更";
  }

  function renderLedger() {
    const items = filteredCases();
    dom.ledgerSummary.textContent = `共 ${items.length} 条 · 数据为本地 Mock`;
    dom.ledgerCount.textContent = String(items.length);
    dom.ledgerBody.innerHTML = items.map((item) => `<tr><td><span class="record-cell"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.id)}</small></span></td><td>${escapeHtml(item.line)}</td><td>${escapeHtml(item.node)}</td><td>${escapeHtml(item.owner)}</td><td><span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td><td>${escapeHtml(item.updated)}</td><td><button class="text-btn" type="button" data-open-case="${escapeHtml(item.id)}">查看详情</button></td></tr>`).join("");
    dom.ledgerEmpty.hidden = items.length !== 0;
    dom.ledgerBody.closest("table").hidden = items.length === 0;
  }

  function nodeCounts() {
    const nodes = ["受理登记", "业务办理", "结果复核", "风险处置", "办结归档"];
    return nodes.map((name) => ({ name, count: state.cases.filter((item) => item.node === name).length }));
  }

  function renderNodes() {
    const nodes = nodeCounts();
    dom.nodeBoard.innerHTML = nodes.map((node, index) => `<article class="node-card"><span>节点 ${String(index + 1).padStart(2,"0")}</span><strong>${node.count}</strong><small>${escapeHtml(node.name)} · ${node.count ? "有事项停留" : "当前空闲"}</small></article>`).join("");
    const max = Math.max(...nodes.map((node) => node.count), 1);
    dom.bottleneckList.innerHTML = nodes.map((node) => `<div class="load-row"><span>${escapeHtml(node.name)}</span><span class="load-track"><span class="load-value" style="width:${Math.round(node.count / max * 100)}%"></span></span><strong>${node.count}</strong></div>`).join("");
  }

  function renderTeam() {
    const loads = new Map();
    activeCases().forEach((item) => loads.set(item.owner, (loads.get(item.owner) || 0) + 1));
    dom.memberCount.textContent = String(state.members.length);
    dom.teamLoad.textContent = String(activeCases().length);
    dom.overloadCount.textContent = String(state.members.filter((member) => (loads.get(member.name) || 0) >= 3).length);
    dom.teamBody.innerHTML = state.members.map((member) => {
      const load = loads.get(member.name) || 0;
      const label = load >= 3 ? "负载较高" : load ? "处理中" : "可分配";
      const cls = load >= 3 ? "status-risk" : load ? "status-run" : "status-done";
      return `<tr><td><span class="member-cell"><span class="member-avatar" aria-hidden="true">${escapeHtml(member.name.slice(0,1))}</span><span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)}</small></span></span></td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.region)}</td><td>${load} 条</td><td><span class="status ${cls}">${label}</span></td></tr>`;
    }).join("");
  }

  function visibleNotices() { return state.notices.filter((item) => item.kind !== "risk" || state.settings.riskAlerts); }
  function renderNotices() {
    const list = visibleNotices();
    const unread = list.filter((item) => !item.read).length;
    dom.noticeBadge.textContent = String(unread);
    dom.noticeBadge.hidden = unread === 0;
    dom.noticeButton.setAttribute("aria-label", unread ? `查看流程提醒，${unread} 条未读` : "查看流程提醒，当前无未读");
    dom.noticeList.innerHTML = list.length ? list.map((item) => `<div class="notice-item ${item.read ? "read" : ""}"><span class="notice-dot" aria-hidden="true"></span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.time)} · ${item.read ? "已读" : "未读"}</small></div></div>`).join("") : `<div class="empty-state"><span>当前提醒规则下没有消息。</span></div>`;
    dom.markNoticesRead.disabled = unread === 0;
    dom.markNoticesRead.title = unread ? "" : "没有未读提醒";
  }

  function renderDrawer() {
    const item = state.cases.find((entry) => entry.id === state.activeCaseId);
    if (!item) return;
    dom.drawerCode.textContent = item.id; dom.drawerName.textContent = item.name; dom.drawerSummary.textContent = `${item.line} · 当前停留 ${item.age} 天`;
    dom.drawerLine.textContent = item.line; dom.drawerNode.textContent = item.node; dom.drawerOwner.textContent = item.owner; dom.drawerOpened.textContent = item.opened; dom.drawerUpdated.textContent = item.updated; dom.drawerNote.textContent = item.note;
    dom.drawerStatus.textContent = item.status; dom.drawerStatus.className = `status ${statusClass(item.status)}`;
    const next = statusFlow[item.status]; dom.requestProgress.disabled = !next; dom.requestProgress.title = next ? "" : "该事项已办结，无下一节点"; dom.requestProgress.textContent = next ? "推进到下一节点" : "流程已办结";
  }

  function renderAll() { renderMetrics(); renderThroughput(); renderRiskQueue(); renderActivities(); renderLedger(); renderNodes(); renderTeam(); renderNotices(); if (!dom.detailShell.hidden) renderDrawer(); }

  function switchPage(page, { updateHash = true, focus = true } = {}) {
    if (!dom.pages.some((view) => view.dataset.pageView === page)) page = "overview";
    state.page = page;
    dom.pages.forEach((view) => { view.hidden = view.dataset.pageView !== page; });
    dom.nav.forEach((link) => { if (link.dataset.pageTarget === page) link.setAttribute("aria-current","page"); else link.removeAttribute("aria-current"); });
    const active = dom.pages.find((view) => view.dataset.pageView === page);
    dom.breadcrumb.textContent = active.dataset.pageTitle;
    document.title = `${active.dataset.pageTitle} · 流程协同后台`;
    if (updateHash && location.hash !== `#${page}`) history.replaceState(null,"",`#${page}`);
    dom.main.scrollTop = 0; window.scrollTo(0,0); requestAnimationFrame(()=>window.scrollTo(0,0));
    closeSidebar();
    if (focus) (active.querySelector("h1") || dom.main).focus({ preventScroll: true });
  }

  function openSidebar() { dom.sidebar.classList.add("open"); dom.sidebarToggle.setAttribute("aria-expanded","true"); dom.sidebarBackdrop.hidden = false; }
  function closeSidebar(restoreFocus = false) {
    const wasOpen = dom.sidebar.classList.contains("open");
    dom.sidebar.classList.remove("open");
    dom.sidebarToggle.setAttribute("aria-expanded","false");
    dom.sidebarBackdrop.hidden = true;
    if (restoreFocus && wasOpen) dom.sidebarToggle.focus();
  }

  function openNotices() {
    if (!dom.noticePanel.hidden) { closeNotices(); return; }
    noticeReturnFocus = document.activeElement; dom.noticePanel.hidden = false; dom.noticeButton.setAttribute("aria-expanded","true"); dom.noticePanel.focus();
  }
  function closeNotices() { if (dom.noticePanel.hidden) return; dom.noticePanel.hidden = true; dom.noticeButton.setAttribute("aria-expanded","false"); noticeReturnFocus?.focus(); }

  function openDrawer(id, trigger) {
    const item = state.cases.find((entry) => entry.id === id); if (!item) return;
    state.activeCaseId = id; drawerReturnFocus = trigger || document.activeElement; renderDrawer(); dom.detailShell.hidden = false; dom.detailDrawer.focus(); document.body.style.overflow = "hidden";
  }
  function closeDrawer({ restore = true } = {}) { if (dom.detailShell.hidden) return; dom.detailShell.hidden = true; state.activeCaseId = null; document.body.style.overflow = ""; if (restore) drawerReturnFocus?.focus(); }

  function openDialog(dialog, trigger) { dialogReturnFocus.set(dialog, trigger || document.activeElement); dialog.showModal(); window.setTimeout(() => focusable(dialog)[0]?.focus(),0); }
  function closeDialog(dialog) { if (dialog.open) dialog.close(); }

  function exportCsv() {
    const rows = filteredCases();
    const header = ["编号","事项","业务线","当前节点","责任人","状态","受理日期","更新时间"];
    const quote = (value) => `"${String(value).replace(/"/g,'""')}"`;
    const csv = "\ufeff" + [header, ...rows.map((item) => [item.id,item.name,item.line,item.node,item.owner,item.status,item.opened,item.updated])].map((row) => row.map(quote).join(",")).join("\r\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv],{ type:"text/csv;charset=utf-8" })); link.download = `流程事项台账-${new Date().toISOString().slice(0,10)}.csv`; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(link.href),1000);
    toast("已生成 CSV", `导出 ${rows.length} 条当前筛选事项。`);
  }

  function populateFormOptions() {
    [...new Set(state.cases.map((item) => item.line))].sort().forEach((line) => { const option = document.createElement("option"); option.value = line; option.textContent = line; dom.lineSelect.append(option); });
  }

  function syncSettingsForm() {
    dom.settingsForm.elements.landing.value = state.settings.landing;
    dom.settingsForm.elements.density.value = state.settings.density;
    dom.settingsForm.elements.riskAlerts.checked = state.settings.riskAlerts;
    dom.settingsForm.elements.activityAlerts.checked = state.settings.activityAlerts;
    document.body.dataset.density = state.settings.density;
  }

  dom.nav.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); switchPage(link.dataset.pageTarget); }));
  document.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go-page]"); if (go) { switchPage(go.dataset.goPage); if (go.hasAttribute("data-filter-risk")) { state.filters.status = "有风险"; dom.statusSelect.value = "有风险"; dom.filterHint.textContent = "已应用：状态=有风险"; renderLedger(); } }
    const record = event.target.closest("[data-open-case]"); if (record) openDrawer(record.dataset.openCase, record);
  });

  dom.sidebarToggle.addEventListener("click", () => dom.sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
  dom.sidebarBackdrop.addEventListener("click", () => closeSidebar(true));
  dom.noticeButton.addEventListener("click", openNotices); $("closeNotices").addEventListener("click", closeNotices);
  dom.markNoticesRead.addEventListener("click", () => { visibleNotices().forEach((item) => { item.read = true; }); renderNotices(); toast("提醒已处理","所有可见提醒已标为已读。"); });
  $("refreshButton").addEventListener("click", () => { state.refreshSerial += 1; const now = new Date(); dom.sync.textContent = `更新于 ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`; renderThroughput(); toast("数据已刷新","节点吞吐与更新时间已重新计算。"); });
  $("globalExport").addEventListener("click", exportCsv); $("pageExport").addEventListener("click", exportCsv);
  dom.periodButtons.forEach((button) => button.addEventListener("click", () => { state.period = Number(button.dataset.period); dom.periodButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button))); renderMetrics(); renderThroughput(); toast("统计周期已切换",`当前展示近 ${state.period} 天模拟数据。`); }));
  dom.clearActivityFilter.addEventListener("click", () => { state.activityOnlyWorkflow = !state.activityOnlyWorkflow; renderActivities(); });

  dom.filterForm.addEventListener("submit", (event) => { event.preventDefault(); state.filters = { keyword: dom.keywordInput.value, status: dom.statusSelect.value, line: dom.lineSelect.value }; dom.filterHint.textContent = state.filters.keyword || state.filters.status || state.filters.line ? "查询条件已应用" : "当前显示全部事项"; renderLedger(); });
  dom.filterForm.addEventListener("reset", (event) => { event.preventDefault(); dom.keywordInput.value = ""; dom.statusSelect.value = ""; dom.lineSelect.value = ""; state.filters = { keyword:"",status:"",line:"" }; dom.filterHint.textContent = "筛选已重置"; renderLedger(); });

  $("drawerBackdrop").addEventListener("click", closeDrawer); $("closeDrawer").addEventListener("click", closeDrawer); $("drawerCancel").addEventListener("click", closeDrawer);
  dom.requestProgress.addEventListener("click", () => { const item = state.cases.find((entry) => entry.id === state.activeCaseId); const next = item && statusFlow[item.status]; if (!next) return; dom.progressMessage.textContent = `“${item.name}”将从“${item.status}”推进为“${next.status}”，同步更新所有相关视图。`; openDialog(dom.progressDialog, dom.requestProgress); });
  $("closeProgress").addEventListener("click", () => closeDialog(dom.progressDialog)); $("cancelProgress").addEventListener("click", () => closeDialog(dom.progressDialog));
  dom.confirmProgress.addEventListener("click", () => {
    const item = state.cases.find((entry) => entry.id === state.activeCaseId); const next = item && statusFlow[item.status]; if (!next) return;
    const previous = item.status; item.status = next.status; item.node = next.node; item.updated = "刚刚"; item.age = Math.max(1,item.age - 1);
    if (state.settings.activityAlerts) state.activities.unshift({ id:`A-${Date.now()}`, type:"workflow", title:`${item.id} 状态已推进`, detail:`${item.name}：${previous} → ${item.status}。`, time:"刚刚" });
    state.notices.unshift({ id:`N-${Date.now()}`, kind:"workflow", title:`${item.name} 已进入${item.status}`, time:"刚刚", read:false });
    closeDialog(dom.progressDialog); renderAll(); toast("节点推进完成",`${item.id} 已更新为${item.status}。`);
  });

  $("recalculateNodes").addEventListener("click", () => { state.refreshSerial += 1; dom.bottleneckUpdated.textContent = `已于 ${new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})} 重新计算`; renderNodes(); toast("节点负载已更新","已根据当前事项状态重新计算。"); });

  $("openInvite").addEventListener("click", (event) => { dom.inviteForm.reset(); [dom.nameError,dom.roleError,dom.regionError].forEach((node) => node.textContent = ""); openDialog(dom.inviteDialog,event.currentTarget); });
  $("closeInvite").addEventListener("click", () => closeDialog(dom.inviteDialog)); $("cancelInvite").addEventListener("click", () => closeDialog(dom.inviteDialog));
  dom.inviteForm.addEventListener("submit", (event) => {
    event.preventDefault(); const name = dom.inviteName.value.trim(); const role = dom.inviteRole.value; const region = dom.inviteRegion.value;
    dom.nameError.textContent = name.length < 2 ? "请输入至少 2 个字的姓名" : ""; dom.roleError.textContent = role ? "" : "请选择岗位"; dom.regionError.textContent = region ? "" : "请选择区域";
    if (!name || name.length < 2 || !role || !region) return;
    state.members.push({ id:`M-${String(state.members.length + 1).padStart(2,"0")}`, name, role, region }); closeDialog(dom.inviteDialog); renderTeam(); toast("成员已新增",`${name} 已加入当前演示会话。`);
  });

  dom.settingsForm.addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(dom.settingsForm); state.settings = { landing:String(form.get("landing")), density:String(form.get("density")), riskAlerts:form.has("riskAlerts"), activityAlerts:form.has("activityAlerts") }; state.savedSettings = { ...state.settings }; syncSettingsForm(); renderNotices(); dom.settingsStatus.textContent = `设置已保存：默认进入${dom.settingsForm.elements.landing.selectedOptions[0].textContent}，${state.settings.density === "compact" ? "紧凑" : "标准"}密度。`; toast("设置已保存","当前演示偏好已生效。"); });
  $("restoreSettings").addEventListener("click", () => { state.settings = { ...defaults }; state.savedSettings = { ...defaults }; syncSettingsForm(); renderNotices(); dom.settingsStatus.textContent = "已恢复模板默认设置。"; toast("已恢复默认","显示与提醒规则已重置。"); });

  [dom.progressDialog,dom.inviteDialog].forEach((dialog) => { dialog.addEventListener("close", () => dialogReturnFocus.get(dialog)?.focus()); dialog.addEventListener("keydown", (event) => trapFocus(event,dialog)); });
  dom.detailDrawer.addEventListener("keydown", (event) => trapFocus(event,dom.detailDrawer)); dom.noticePanel.addEventListener("keydown", (event) => trapFocus(event,dom.noticePanel));
  document.addEventListener("keydown", (event) => { if (event.key !== "Escape" || dom.progressDialog.open || dom.inviteDialog.open) return; if (!dom.detailShell.hidden) closeDrawer(); else if (!dom.noticePanel.hidden) closeNotices(); else closeSidebar(true); });
  window.addEventListener("hashchange", () => switchPage(location.hash.slice(1),{updateHash:false}));

  populateFormOptions(); syncSettingsForm(); renderAll(); switchPage(location.hash.slice(1) || state.settings.landing,{updateHash:true,focus:false}); requestAnimationFrame(()=>setTimeout(()=>window.scrollTo(0,0),60));
})();
