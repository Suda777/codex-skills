(() => {
  "use strict";

  const DEFAULT_SETTINGS = Object.freeze({ defaultPeriod: "30", focusRegion: "华东", riskNotices: true, regionDigest: true, showMock: true });
  const REGIONS = ["华东", "华北", "华南", "西部"];
  const SERVICES = [
    { name: "远程诊断", description: "面向常见运行异常的在线排查与建议。", level: "快速响应", target: "2 小时", color: "#3569f4", soft: "#eaf0ff" },
    { name: "现场支持", description: "需要到场协同时的排期、处置与闭环。", level: "计划响应", target: "8 小时", color: "#7c4dff", soft: "#eee8ff" },
    { name: "配置优化", description: "围绕稳定性与使用体验进行参数优化。", level: "专家服务", target: "4 小时", color: "#16a5b9", soft: "#e1f8fb" },
    { name: "运营辅导", description: "通过复盘与建议帮助团队优化服务节奏。", level: "持续服务", target: "1 工作日", color: "#d48114", soft: "#fff3dd" },
    { name: "数据核查", description: "检查服务记录口径并定位异常数据。", level: "标准响应", target: "6 小时", color: "#d74c67", soft: "#ffe7ec" },
    { name: "联合保障", description: "跨区域协作处理重要节点的保障任务。", level: "重点保障", target: "1 小时", color: "#218b6b", soft: "#e2f7f0" }
  ];
  const initialOrders = [
    { id: "SV-26041", subject: "服务节点响应波动", region: "华东", service: "远程诊断", owner: "宁川", response: 1.6, status: "处理中", age: 3, description: "午间高峰出现响应波动，需要核查服务节点与访问链路。", progress: "已完成初步定位，正在对比两组运行记录。" },
    { id: "SV-26042", subject: "月度服务配置复核", region: "华北", service: "配置优化", owner: "顾禾", response: 3.2, status: "待验收", age: 8, description: "月度配置调整完成后需要业务侧确认展示效果。", progress: "优化建议已执行，等待服务负责人验收。" },
    { id: "SV-26043", subject: "区域协同排期冲突", region: "华南", service: "现场支持", owner: "季遥", response: 7.5, status: "有风险", age: 12, description: "两项现场支持时间重叠，存在人员排期冲突。", progress: "已发起跨区域协同，等待替补人员确认。" },
    { id: "SV-26044", subject: "历史记录口径校验", region: "华东", service: "数据核查", owner: "宁川", response: 4.8, status: "已解决", age: 18, description: "历史服务记录存在两种统计口径，需要统一展示。", progress: "口径已经统一，相关统计已重新计算。" },
    { id: "SV-26045", subject: "重点时段联合保障", region: "西部", service: "联合保障", owner: "叶砚", response: 0.8, status: "处理中", age: 2, description: "重点时段需要建立跨团队快速响应机制。", progress: "保障群组已建立，演练任务正在推进。" },
    { id: "SV-26046", subject: "服务复盘材料整理", region: "华北", service: "运营辅导", owner: "顾禾", response: 5.1, status: "待响应", age: 5, description: "需要形成上阶段服务问题与优化动作的复盘材料。", progress: "已收到需求，等待明确复盘范围。" },
    { id: "SV-26047", subject: "现场终端连通排查", region: "华南", service: "现场支持", owner: "季遥", response: 9.4, status: "有风险", age: 33, description: "现场终端间歇无法连接，影响服务记录回传。", progress: "远程排查未复现，已安排下一时段现场检查。" },
    { id: "SV-26048", subject: "运行参数例行检查", region: "西部", service: "配置优化", owner: "叶砚", response: 2.7, status: "已解决", age: 65, description: "按季度计划检查关键参数与告警阈值。", progress: "检查完成，未发现需要升级的问题。" },
    { id: "SV-26049", subject: "服务数据异常回补", region: "华东", service: "数据核查", owner: "宁川", response: 4.1, status: "已解决", age: 82, description: "部分服务记录缺少完成时间，需要核查并回补。", progress: "缺失记录已补齐，统计结果已恢复。" }
  ];
  const initialNotices = [
    { id: "NT-01", title: "华南有 2 条风险工单需要跟进", time: "10 分钟前", kind: "risk", read: false },
    { id: "NT-02", title: "华东本周期服务达成率保持稳定", time: "42 分钟前", kind: "region", region: "华东", read: false },
    { id: "NT-03", title: "服务目录本周新增联合保障记录", time: "今天 09:10", kind: "general", read: true }
  ];

  const state = {
    orders: initialOrders.map((item) => ({ ...item })),
    notices: initialNotices.map((item) => ({ ...item })),
    filters: { keyword: "", region: "", status: "" },
    period: 30,
    catalogView: "all",
    activePage: "overview",
    activeOrderId: null,
    settings: { ...DEFAULT_SETTINGS },
    savedSettings: { ...DEFAULT_SETTINGS },
    lastSync: "10:24",
    regionUpdated: "刚刚更新"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const dom = {
    sidebar: $("#serviceSidebar"), mask: $("#sidebarMask"), menu: $("#menuButton"), main: $("#mainContent"), crumb: $("#currentCrumb"),
    pages: $$('[data-page]'), nav: $$('[data-nav]'), noticeButton: $("#noticeButton"), noticePanel: $("#noticePanel"), noticeBadge: $("#noticeBadge"), noticeList: $("#noticeList"), readAll: $("#readAllButton"),
    orderForm: $("#orderFilterForm"), keyword: $("#orderKeyword"), region: $("#orderRegion"), status: $("#orderStatus"), orderBody: $("#orderTableBody"), orderResult: $("#orderResultText"),
    drawerShell: $("#orderDrawerShell"), drawer: $("#orderDrawer"), resolveDialog: $("#resolveDialog"), createDialog: $("#createOrderDialog"), createForm: $("#createOrderForm"),
    settingsForm: $("#settingsForm"), settingsStatus: $("#settingsStatus"), toastStack: $("#toastStack")
  };
  let drawerReturnFocus = null;
  let noticeReturnFocus = null;
  const dialogReturnFocus = new WeakMap();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  }

  function focusable(container) {
    return $$('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container).filter((node) => !node.hidden && node.getClientRects().length > 0);
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

  function toast(title, message) {
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`;
    dom.toastStack.append(item);
    window.setTimeout(() => item.remove(), 3400);
  }

  function statusClass(status) {
    return { "待响应": "status-wait", "处理中": "status-active", "待验收": "status-review", "已解决": "status-done", "有风险": "status-risk" }[status] || "status-active";
  }

  function periodOrders() {
    return state.orders.filter((order) => order.age <= state.period);
  }

  function filteredOrders() {
    const keyword = state.filters.keyword.toLowerCase();
    return state.orders.filter((order) => {
      const matchesKeyword = !keyword || [order.id, order.subject, order.region, order.service, order.owner].some((value) => value.toLowerCase().includes(keyword));
      return matchesKeyword && (!state.filters.region || order.region === state.filters.region) && (!state.filters.status || order.status === state.filters.status);
    });
  }

  function regionStats() {
    return REGIONS.map((name) => {
      const orders = state.orders.filter((order) => order.region === name);
      const resolved = orders.filter((order) => order.status === "已解决").length;
      const risk = orders.filter((order) => order.status === "有风险").length;
      const open = orders.length - resolved;
      const rate = orders.length ? Math.round((resolved / orders.length) * 100) : 100;
      const score = Math.max(48, Math.round(96 - open * 5 - risk * 12 + resolved * 2));
      return { name, orders, resolved, risk, open, rate, score };
    }).sort((a, b) => b.score - a.score);
  }

  function visibleNotices() {
    return state.notices.filter((notice) => {
      if (notice.kind === "risk" && !state.settings.riskNotices) return false;
      if (notice.kind === "region" && !state.settings.regionDigest) return false;
      if (notice.region && notice.region !== state.settings.focusRegion && notice.kind === "region") return false;
      return true;
    });
  }

  function renderOverview() {
    const orders = periodOrders();
    const resolved = orders.filter((order) => order.status === "已解决").length;
    const risk = orders.filter((order) => order.status === "有风险").length;
    const response = orders.length ? orders.reduce((sum, order) => sum + order.response, 0) / orders.length : 0;
    const rate = orders.length ? Math.round((resolved / orders.length) * 100) : 0;
    $("#metricOrders").textContent = String(orders.length);
    $("#metricResolved").textContent = String(resolved);
    $("#metricResponse").textContent = `${response.toFixed(1)}h`;
    $("#metricRisk").textContent = String(risk);
    $("#metricOrdersNote").textContent = `${REGIONS.length} 个服务区域`;
    $("#heroRate").textContent = `${rate}%`;
    $("#heroProgress").style.strokeDashoffset = String(408.4 * (1 - rate / 100));
    $("#heroSummary").textContent = risk ? `${risk} 条风险工单等待优先跟进` : "当前统计期无风险工单";
    $("#heroPeriodLabel").textContent = `近 ${state.period} 天`;
    $("#trendChip").textContent = `${state.period} 天`;
    const baseSeries = state.period === 7 ? [42, 38, 32, 29, 24, 20, 18] : state.period === 30 ? [50, 42, 45, 34, 29, 25, 21, 17] : [58, 54, 48, 43, 39, 34, 27, 23, 19];
    const points = baseSeries.map((value, index) => `${Math.round(index * (680 / (baseSeries.length - 1)))},${Math.round(30 + value * 2.5 - resolved * 2)}`);
    $("#waveLine").setAttribute("points", points.join(" "));
    $("#waveArea").setAttribute("d", `M ${points.join(" L ")} L 680 220 L 0 220 Z`);
    const focus = state.orders.filter((order) => order.status === "有风险" || order.status === "待响应").sort((a, b) => (a.status === "有风险" ? -1 : 1)).slice(0, 4);
    $("#focusList").innerHTML = focus.length ? focus.map((order, index) => `<div class="focus-item"><span class="focus-index">${String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(order.subject)}</strong><small>${escapeHtml(order.region)} · ${escapeHtml(order.owner)}</small></span><span class="status-pill ${statusClass(order.status)}">${escapeHtml(order.status)}</span></div>`).join("") : `<div class="focus-item"><span class="focus-index">OK</span><span><strong>暂无待优先跟进工单</strong><small>所有工单已进入稳定状态</small></span></div>`;
    $("#sidebarOpenCount").textContent = String(state.orders.filter((order) => order.status !== "已解决").length);
  }

  function renderRegions() {
    const stats = regionStats();
    const average = Math.round(stats.reduce((sum, region) => sum + region.score, 0) / stats.length);
    $("#networkScore").textContent = String(average);
    const riskTotal = stats.reduce((sum, region) => sum + region.risk, 0);
    $("#regionBannerText").textContent = riskTotal ? `当前共有 ${riskTotal} 条风险工单，建议优先查看低健康分区域。` : "当前服务网络运行稳定，暂无风险工单。";
    $("#regionUpdatedAt").textContent = state.regionUpdated;
    $("#regionRank").innerHTML = stats.map((region) => `<div class="region-row"><span class="region-name">${escapeHtml(region.name)}</span><span class="health-track" aria-label="${escapeHtml(region.name)}健康分 ${region.score}"><i style="width:${region.score}%"></i></span><strong>${region.score} 分</strong><small>${region.open} 条开放</small></div>`).join("");
    $("#regionCards").innerHTML = stats.map((region) => `<article class="region-mini-card"><div><h3>${escapeHtml(region.name)}</h3><span class="status-pill ${region.risk ? "status-risk" : region.open ? "status-active" : "status-done"}">${region.risk ? `${region.risk} 条风险` : region.open ? "持续服务" : "全部闭环"}</span></div><p>${region.rate}%</p><small>已解决 ${region.resolved} / ${region.orders.length} 条</small></article>`).join("");
  }

  function renderOrders() {
    const orders = filteredOrders();
    dom.orderResult.textContent = `共 ${orders.length} 条${state.settings.showMock ? " Mock" : ""}工单`;
    dom.orderBody.innerHTML = orders.length ? orders.map((order) => `<tr><td><span class="record-title"><strong>${escapeHtml(order.subject)}</strong><small>${escapeHtml(order.id)}</small></span></td><td>${escapeHtml(order.region)}</td><td>${escapeHtml(order.service)}</td><td>${escapeHtml(order.owner)}</td><td>${order.response.toFixed(1)} 小时</td><td><span class="status-pill ${statusClass(order.status)}">${escapeHtml(order.status)}</span></td><td><button class="row-action" type="button" data-order-id="${escapeHtml(order.id)}">查看详情</button></td></tr>`).join("") : `<tr><td class="empty-row" colspan="7">没有符合当前条件的工单，请调整筛选条件。</td></tr>`;
  }

  function renderCatalog() {
    const ordersFor = (name) => state.orders.filter((order) => order.service === name);
    const services = SERVICES.filter((service) => {
      const orders = ordersFor(service.name);
      if (state.catalogView === "active") return orders.some((order) => order.status !== "已解决");
      if (state.catalogView === "risk") return orders.some((order) => order.status === "有风险");
      return true;
    });
    $("#catalogGrid").innerHTML = services.length ? services.map((service) => {
      const orders = ordersFor(service.name);
      const active = orders.filter((order) => order.status !== "已解决").length;
      const risk = orders.filter((order) => order.status === "有风险").length;
      return `<article class="catalog-card" style="--catalog-color:${service.color};--catalog-soft:${service.soft};--catalog-glow:${service.soft}"><span class="catalog-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Zm-3 9 2 2 4-5"/></svg></span><span class="service-chip">${escapeHtml(service.level)}</span><h2>${escapeHtml(service.name)}</h2><p>${escapeHtml(service.description)}</p><div class="catalog-stats"><span><strong>${active}</strong>开放工单</span><span><strong>${risk}</strong>风险工单</span><span><strong>${escapeHtml(service.target)}</strong>目标响应</span></div></article>`;
    }).join("") : `<article class="catalog-card"><h2>当前没有符合条件的服务</h2><p>切换“全部服务”可恢复完整服务目录。</p></article>`;
    const note = $(".catalog-note");
    if (note) note.hidden = !state.settings.showMock;
  }

  function renderNotices() {
    const notices = visibleNotices();
    const unread = notices.filter((notice) => !notice.read).length;
    dom.noticeBadge.textContent = String(unread);
    dom.noticeBadge.hidden = unread === 0;
    dom.noticeButton.setAttribute("aria-label", unread ? `查看服务通知，${unread} 条未读` : "查看服务通知，无未读");
    dom.noticeList.innerHTML = notices.length ? notices.map((notice) => `<li class="notice-item ${notice.read ? "read" : ""}"><i aria-hidden="true"></i><span><strong>${escapeHtml(notice.title)}</strong><small>${escapeHtml(notice.time)} · ${notice.read ? "已读" : "未读"}</small></span></li>`).join("") : `<li class="notice-item read"><i aria-hidden="true"></i><span><strong>当前没有需要展示的通知</strong><small>通知会随工单状态和已保存偏好联动</small></span></li>`;
    dom.readAll.disabled = unread === 0;
    dom.readAll.title = unread === 0 ? "当前没有未读通知" : "";
  }

  function renderAll() {
    renderOverview();
    renderRegions();
    renderOrders();
    renderCatalog();
    renderNotices();
    $("#sidebarSyncTime").textContent = `最近同步 ${state.lastSync}`;
    if (!dom.drawerShell.hidden && state.activeOrderId) renderDrawer();
  }

  function switchPage(pageId, options = {}) {
    const target = dom.pages.find((page) => page.id === pageId) || dom.pages[0];
    state.activePage = target.id;
    dom.pages.forEach((page) => { page.hidden = page !== target; });
    dom.nav.forEach((link) => link.getAttribute("href") === `#${target.id}` ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current"));
    const title = target.dataset.title || "服务总览";
    dom.crumb.textContent = title;
    document.title = `${title} · 数智服务运营台`;
    if (options.updateHash !== false && location.hash !== `#${target.id}`) history.pushState({ page: target.id }, "", `#${target.id}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    dom.main.scrollTop = 0;
    closeSidebar();
    if (options.focus !== false) { const heading = target.querySelector("h1"); if (heading) heading.focus({ preventScroll: true }); }
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
    dom.mask.hidden = false;
    dom.menu.setAttribute("aria-expanded", "true");
    dom.menu.setAttribute("aria-label", "关闭导航");
    dom.sidebar.inert = false;
    dom.sidebar.removeAttribute("aria-hidden");
  }

  function closeSidebar(restore = false) {
    document.body.classList.remove("sidebar-open");
    dom.mask.hidden = true;
    dom.menu.setAttribute("aria-expanded", "false");
    dom.menu.setAttribute("aria-label", "展开导航");
    if (matchMedia("(max-width: 920px)").matches) { dom.sidebar.inert = true; dom.sidebar.setAttribute("aria-hidden", "true"); }
    else { dom.sidebar.inert = false; dom.sidebar.removeAttribute("aria-hidden"); }
    if (restore) dom.menu.focus();
  }

  function openNotices() {
    noticeReturnFocus = document.activeElement;
    dom.noticePanel.hidden = false;
    dom.noticeButton.setAttribute("aria-expanded", "true");
    dom.noticePanel.focus();
  }

  function closeNotices(restore = true) {
    if (dom.noticePanel.hidden) return;
    dom.noticePanel.hidden = true;
    dom.noticeButton.setAttribute("aria-expanded", "false");
    if (restore && noticeReturnFocus instanceof HTMLElement) noticeReturnFocus.focus();
  }

  function renderDrawer() {
    const order = state.orders.find((item) => item.id === state.activeOrderId);
    if (!order) return;
    $("#drawerTitle").textContent = order.id;
    $("#drawerStatus").textContent = order.status;
    $("#drawerStatus").className = `status-pill ${statusClass(order.status)}`;
    $("#drawerSubject").textContent = order.subject;
    $("#drawerCode").textContent = `${order.id} · 更新于 ${order.age} 天内`;
    $("#drawerRegion").textContent = order.region;
    $("#drawerService").textContent = order.service;
    $("#drawerOwner").textContent = order.owner;
    $("#drawerResponse").textContent = `${order.response.toFixed(1)} 小时`;
    $("#drawerDescription").textContent = order.description;
    $("#drawerProgress").textContent = order.progress;
    const button = $("#requestResolveButton");
    button.disabled = order.status === "已解决";
    button.title = order.status === "已解决" ? "该工单已经解决，无需重复操作" : "";
  }

  function openDrawer(orderId, opener) {
    if (!state.orders.some((order) => order.id === orderId)) return;
    state.activeOrderId = orderId;
    drawerReturnFocus = opener || document.activeElement;
    dom.drawerShell.hidden = false;
    document.body.classList.add("overlay-open");
    renderDrawer();
    (focusable(dom.drawer)[0] || dom.drawer).focus();
  }

  function closeDrawer(restore = true) {
    if (dom.drawerShell.hidden) return;
    dom.drawerShell.hidden = true;
    document.body.classList.toggle("overlay-open", dom.resolveDialog.open || dom.createDialog.open);
    if (restore) {
      const replacement = state.activeOrderId ? $(`[data-order-id="${state.activeOrderId}"]`) : null;
      if (drawerReturnFocus instanceof HTMLElement && drawerReturnFocus.isConnected) drawerReturnFocus.focus();
      else if (replacement) replacement.focus();
      else $("#ordersTitle").focus();
    }
  }

  function openDialog(dialog, opener) {
    dialogReturnFocus.set(dialog, opener || document.activeElement);
    dialog.showModal();
    document.body.classList.add("overlay-open");
    (focusable(dialog)[0] || dialog).focus();
  }

  function closeDialog(dialog, restore = true) {
    if (!dialog.open) return;
    dialog.close();
    document.body.classList.toggle("overlay-open", !dom.drawerShell.hidden);
    const opener = dialogReturnFocus.get(dialog);
    if (restore && opener instanceof HTMLElement && opener.isConnected && !opener.disabled) opener.focus();
  }

  function syncSettingsForm() {
    const fields = dom.settingsForm.elements;
    fields.defaultPeriod.value = state.settings.defaultPeriod;
    fields.focusRegion.value = state.settings.focusRegion;
    fields.riskNotices.checked = state.settings.riskNotices;
    fields.regionDigest.checked = state.settings.regionDigest;
    fields.showMock.checked = state.settings.showMock;
  }

  function readSettingsForm() {
    const fields = dom.settingsForm.elements;
    return { defaultPeriod: fields.defaultPeriod.value, focusRegion: fields.focusRegion.value, riskNotices: fields.riskNotices.checked, regionDigest: fields.regionDigest.checked, showMock: fields.showMock.checked };
  }

  function updatePeriod(value) {
    state.period = Number(value);
    $$('[data-period]').forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.period) === state.period)));
    renderOverview();
  }

  function exportOrders() {
    const orders = filteredOrders();
    const rows = [["工单号", "主题", "区域", "服务类型", "负责人", "响应时长（小时）", "状态"], ...orders.map((order) => [order.id, order.subject, order.region, order.service, order.owner, order.response, order.status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `service-orders-${new Date().toISOString().slice(0, 10)}.csv`; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast("工单已导出", `CSV 已生成，包含 ${orders.length} 条当前筛选结果。`);
  }

  dom.nav.forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); switchPage(link.hash.slice(1)); }));
  $$('[data-go]').forEach((button) => button.addEventListener("click", () => switchPage(button.dataset.go)));
  dom.menu.addEventListener("click", () => document.body.classList.contains("sidebar-open") ? closeSidebar(true) : openSidebar());
  dom.mask.addEventListener("click", () => closeSidebar(true));

  $("#syncButton").addEventListener("click", () => {
    const now = new Date();
    state.lastSync = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    state.regionUpdated = `同步于 ${state.lastSync}`;
    state.orders.filter((order) => order.status === "处理中").forEach((order) => { order.response = Math.max(.5, Number((order.response - .1).toFixed(1))); });
    renderAll();
    toast("演示数据已同步", `同步时间更新为 ${state.lastSync}，处理中工单响应值已刷新。`);
  });
  $("#regionRefreshButton").addEventListener("click", () => {
    state.regionUpdated = `刷新于 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    renderRegions();
    toast("区域数据已刷新", "健康分、开放工单和风险数量已从当前工单重新计算。       ");
  });

  dom.noticeButton.addEventListener("click", () => dom.noticePanel.hidden ? openNotices() : closeNotices());
  $("#closeNoticeButton").addEventListener("click", () => closeNotices());
  dom.readAll.addEventListener("click", () => {
    const visibleIds = new Set(visibleNotices().map((notice) => notice.id));
    const unread = state.notices.filter((notice) => visibleIds.has(notice.id) && !notice.read);
    unread.forEach((notice) => { notice.read = true; });
    renderNotices();
    toast("通知已更新", `${unread.length} 条通知已标记为已读。`);
  });

  $$('[data-period]').forEach((button) => button.addEventListener("click", () => updatePeriod(button.dataset.period)));
  dom.orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.filters = { keyword: dom.keyword.value.trim(), region: dom.region.value, status: dom.status.value };
    renderOrders();
  });
  dom.orderForm.addEventListener("reset", () => window.setTimeout(() => { state.filters = { keyword: "", region: "", status: "" }; renderOrders(); }, 0));
  [$("#globalExportOrdersButton"), $("#exportOrdersButton")].forEach((button) => button.addEventListener("click", exportOrders));
  dom.orderBody.addEventListener("click", (event) => { const button = event.target.closest("[data-order-id]"); if (button) openDrawer(button.dataset.orderId, button); });
  $$('[data-close-drawer]').forEach((button) => button.addEventListener("click", () => closeDrawer()));
  dom.drawer.addEventListener("keydown", (event) => trapFocus(event, dom.drawer));

  $("#requestResolveButton").addEventListener("click", (event) => {
    const order = state.orders.find((item) => item.id === state.activeOrderId);
    if (!order || order.status === "已解决") return;
    $("#resolveDescription").textContent = `确认将 ${order.id}“${order.subject}”标记为已解决？总览、区域和工单数据将同步更新。`;
    openDialog(dom.resolveDialog, event.currentTarget);
  });
  $("#confirmResolveButton").addEventListener("click", () => {
    const order = state.orders.find((item) => item.id === state.activeOrderId);
    if (!order || order.status === "已解决") { closeDialog(dom.resolveDialog); return; }
    order.status = "已解决";
    order.progress = "已在演示工作台中确认解决，相关服务指标已同步更新。";
    state.notices.push({ id: `NT-${Date.now()}`, title: `${order.id} 已完成服务闭环`, time: "刚刚", kind: "general", read: false });
    closeDialog(dom.resolveDialog, false);
    renderAll();
    (focusable(dom.drawer)[0] || dom.drawer).focus();
    toast("工单已解决", `${order.id} 已更新，区域健康分和服务达成率已同步。`);
  });

  function prepareCreateDialog(opener) {
    dom.createForm.reset();
    $$(".field-error", dom.createForm).forEach((node) => { node.textContent = ""; });
    openDialog(dom.createDialog, opener);
  }
  [$("#createOrderButton"), $("#ordersCreateButton")].forEach((button) => button.addEventListener("click", (event) => prepareCreateDialog(event.currentTarget)));
  dom.createForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = dom.createForm.elements;
    const subject = fields.subject.value.trim();
    const region = fields.region.value;
    const service = fields.service.value;
    const description = fields.description.value.trim();
    $("#newSubjectError").textContent = subject.length < 4 ? "请填写至少 4 个字的工单主题。" : "";
    $("#newRegionError").textContent = region ? "" : "请选择服务区域。";
    $("#newServiceError").textContent = service ? "" : "请选择服务类型。";
    $("#newDescriptionError").textContent = description.length < 8 ? "请填写至少 8 个字的问题说明。" : "";
    if (subject.length < 4 || !region || !service || description.length < 8) return;
    const ownerByRegion = { "华东": "宁川", "华北": "顾禾", "华南": "季遥", "西部": "叶砚" };
    const order = { id: `SV-${26040 + state.orders.length + 1}`, subject, region, service, owner: ownerByRegion[region], response: 0, status: "待响应", age: 0, description, progress: "工单已创建，等待区域负责人首次响应。" };
    state.orders.unshift(order);
    state.notices.unshift({ id: `NT-${Date.now()}`, title: `${region}新增工单 ${order.id}`, time: "刚刚", kind: "general", read: false });
    closeDialog(dom.createDialog, false);
    renderAll();
    switchPage("orders", { focus: false });
    const openButton = $(`[data-order-id="${order.id}"]`);
    if (openButton) openButton.focus();
    toast("工单已创建", `${order.id} 已加入工单协同，并同步到区域与总览指标。`);
  });

  $$('[data-catalog-view]').forEach((button) => button.addEventListener("click", () => {
    state.catalogView = button.dataset.catalogView;
    $$('[data-catalog-view]').forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderCatalog();
  }));

  dom.settingsForm.addEventListener("change", () => { dom.settingsStatus.textContent = "有未保存的修改，保存后会同步到相关页面。"; });
  dom.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = readSettingsForm();
    state.savedSettings = { ...state.settings };
    state.period = Number(state.settings.defaultPeriod);
    updatePeriod(state.period);
    renderAll();
    dom.settingsStatus.textContent = `已保存：默认 ${state.period} 天，重点区域 ${state.settings.focusRegion}。`;
    toast("偏好已保存", "总览周期、重点区域、通知和 Mock 说明已同步。       ");
  });
  $("#restoreSettingsButton").addEventListener("click", () => {
    state.settings = { ...DEFAULT_SETTINGS };
    state.savedSettings = { ...DEFAULT_SETTINGS };
    state.period = Number(DEFAULT_SETTINGS.defaultPeriod);
    syncSettingsForm();
    updatePeriod(state.period);
    renderAll();
    dom.settingsStatus.textContent = "已恢复演示默认：30 天、华东、显示全部通知与 Mock 说明。";
    toast("已恢复默认", "设置表单和所有受影响页面已同步复原。       ");
  });

  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog"))));
  [dom.resolveDialog, dom.createDialog].forEach((dialog) => {
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener("keydown", (event) => trapFocus(event, dialog));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!dom.drawerShell.hidden && !dom.resolveDialog.open && !dom.createDialog.open) closeDrawer();
    else if (!dom.noticePanel.hidden) closeNotices();
    else if (document.body.classList.contains("sidebar-open")) closeSidebar(true);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!dom.noticePanel.hidden && !dom.noticePanel.contains(event.target) && !dom.noticeButton.contains(event.target)) closeNotices(false);
  });
  addEventListener("popstate", () => switchPage(location.hash.slice(1) || "overview", { updateHash: false, focus: false }));
  matchMedia("(max-width: 920px)").addEventListener("change", () => closeSidebar(false));

  syncSettingsForm();
  renderAll();
  const initial = dom.pages.some((page) => page.id === location.hash.slice(1)) ? location.hash.slice(1) : "overview";
  if (location.hash !== `#${initial}`) history.replaceState({ page: initial }, "", `#${initial}`);
  closeSidebar(false);
  switchPage(initial, { updateHash: false, focus: false });
  requestAnimationFrame(() => setTimeout(() => window.scrollTo(0, 0), 60));
})();
