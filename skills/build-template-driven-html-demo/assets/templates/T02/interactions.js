(() => {
  "use strict";

  const REFERENCE_DATE = new Date("2026-08-20T12:00:00+08:00");
  const DEFAULT_SETTINGS = Object.freeze({
    riskAlerts: true,
    customerDigest: true,
    loadAlerts: false,
    defaultPeriod: "30",
    currency: "compact",
    mockNotice: true
  });

  const state = {
    activePage: "overview",
    period: 30,
    activeOrderId: null,
    orderFilters: { keyword: "", status: "" },
    customerFilters: { keyword: "", segment: "" },
    settings: { ...DEFAULT_SETTINGS },
    notifications: [
      { id: "N-01", kind: "review", relatedOrderId: "OD-260818-02", title: "1 笔高金额订单等待审核", time: "10 分钟前", read: false },
      { id: "N-02", kind: "risk", relatedOrderId: "OD-260802-04", title: "海桥物流订单交付风险待跟进", time: "1 小时前", read: false },
      { id: "N-03", kind: "customer", title: "今日新客户运营摘要已生成", time: "今日 08:30", read: false }
    ],
    orders: [
      { id: "OD-260819-01", customer: "星河智造", industry: "智能制造", channel: "直销", amount: 328000, owner: "陈屿", status: "已完成", date: "2026-08-19", delivery: "设备数据采集与运营看板已完成交付验收。" },
      { id: "OD-260818-02", customer: "云岭零售", industry: "零售连锁", channel: "生态合作", amount: 186000, owner: "李安", status: "待审核", date: "2026-08-18", delivery: "方案与商务附件已提交，等待区域负责人复核。" },
      { id: "OD-260813-03", customer: "东澜科技", industry: "企业服务", channel: "线上商城", amount: 98000, owner: "周珊", status: "待付款", date: "2026-08-13", delivery: "首期服务资源已预留，收到首款后进入正式实施。" },
      { id: "OD-260802-04", customer: "海桥物流", industry: "交通物流", channel: "直销", amount: 245000, owner: "王宁", status: "有风险", date: "2026-08-02", delivery: "客户两个分支机构的接口清单尚未完整确认。" },
      { id: "OD-260729-05", customer: "北辰医疗", industry: "医疗健康", channel: "行业合作", amount: 156000, owner: "孙晓", status: "履约中", date: "2026-07-29", delivery: "项目已进入用户培训和试运行阶段。" },
      { id: "OD-260710-06", customer: "星河智造", industry: "智能制造", channel: "直销", amount: 120000, owner: "陈屿", status: "已完成", date: "2026-07-10", delivery: "工厂二期数据治理项目已完成验收。" },
      { id: "OD-260615-07", customer: "云岭零售", industry: "零售连锁", channel: "生态合作", amount: 88000, owner: "李安", status: "履约中", date: "2026-06-15", delivery: "门店运营指标模型正在分批上线。" },
      { id: "OD-260525-08", customer: "新程教育", industry: "教育服务", channel: "线上商城", amount: 64000, owner: "周珊", status: "已完成", date: "2026-05-25", delivery: "运营数据简报和管理员培训已完成。" },
      { id: "OD-260501-09", customer: "海桥物流", industry: "交通物流", channel: "直销", amount: 130000, owner: "王宁", status: "已完成", date: "2026-05-01", delivery: "一期调度数据综合看板已交付。" }
    ],
    members: [
      { id: "M-01", name: "陈屿", role: "运营负责人", region: "华东", status: "在线" },
      { id: "M-02", name: "李安", role: "客户运营", region: "华南", status: "在线" },
      { id: "M-03", name: "周珊", role: "订单管理", region: "华北", status: "处理中" },
      { id: "M-04", name: "王宁", role: "交付协同", region: "华东", status: "需关注" },
      { id: "M-05", name: "孙晓", role: "数据分析", region: "全国协同", status: "在线" }
    ]
  };

  const dom = {
    sidebar: document.getElementById("sidebar"),
    navItems: [...document.querySelectorAll("[data-nav-item]")],
    pageViews: [...document.querySelectorAll("[data-page-view]")],
    breadcrumbCurrent: document.getElementById("breadcrumbCurrent"),
    mainContent: document.getElementById("mainContent"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    notificationButton: document.getElementById("notificationButton"),
    notificationPanel: document.getElementById("notificationPanel"),
    notificationBadge: document.getElementById("notificationBadge"),
    notificationList: document.getElementById("notificationList"),
    markAllRead: document.getElementById("markAllRead"),
    periodButtons: [...document.querySelectorAll("[data-period]")],
    metricOrders: document.getElementById("metricOrders"),
    metricOrdersMeta: document.getElementById("metricOrdersMeta"),
    metricRevenue: document.getElementById("metricRevenue"),
    metricRevenueMeta: document.getElementById("metricRevenueMeta"),
    metricPending: document.getElementById("metricPending"),
    metricRisk: document.getElementById("metricRisk"),
    trendSubtitle: document.getElementById("trendSubtitle"),
    trendBadge: document.getElementById("trendBadge"),
    revenueChart: document.getElementById("revenueChart"),
    customerRank: document.getElementById("customerRank"),
    orderFilterForm: document.getElementById("orderFilterForm"),
    orderKeyword: document.getElementById("orderKeyword"),
    orderStatusFilter: document.getElementById("orderStatusFilter"),
    orderTableBody: document.getElementById("orderTableBody"),
    orderResultSummary: document.getElementById("orderResultSummary"),
    orderCountBadge: document.getElementById("orderCountBadge"),
    orderMockNotice: document.getElementById("orderMockNotice"),
    customerFilterForm: document.getElementById("customerFilterForm"),
    customerKeyword: document.getElementById("customerKeyword"),
    customerSegment: document.getElementById("customerSegment"),
    customerTableBody: document.getElementById("customerTableBody"),
    customerResultSummary: document.getElementById("customerResultSummary"),
    highValueCount: document.getElementById("highValueCount"),
    growthCount: document.getElementById("growthCount"),
    attentionCount: document.getElementById("attentionCount"),
    memberTableBody: document.getElementById("memberTableBody"),
    teamMemberCount: document.getElementById("teamMemberCount"),
    teamOrderCount: document.getElementById("teamOrderCount"),
    teamOverloadCount: document.getElementById("teamOverloadCount"),
    orderDrawerShell: document.getElementById("orderDrawerShell"),
    orderDrawer: document.getElementById("orderDrawer"),
    drawerTitle: document.getElementById("drawerTitle"),
    drawerCode: document.getElementById("drawerCode"),
    drawerDescription: document.getElementById("drawerDescription"),
    drawerStatus: document.getElementById("drawerStatus"),
    drawerAmount: document.getElementById("drawerAmount"),
    drawerCustomer: document.getElementById("drawerCustomer"),
    drawerChannel: document.getElementById("drawerChannel"),
    drawerOwner: document.getElementById("drawerOwner"),
    drawerDate: document.getElementById("drawerDate"),
    drawerDelivery: document.getElementById("drawerDelivery"),
    requestStatusUpdate: document.getElementById("requestStatusUpdate"),
    statusDialog: document.getElementById("statusDialog"),
    confirmStatusUpdate: document.getElementById("confirmStatusUpdate"),
    inviteDialog: document.getElementById("inviteDialog"),
    inviteForm: document.getElementById("inviteForm"),
    inviteName: document.getElementById("inviteName"),
    inviteRole: document.getElementById("inviteRole"),
    inviteRegion: document.getElementById("inviteRegion"),
    settingsForm: document.getElementById("settingsForm"),
    settingsStatus: document.getElementById("settingsStatus"),
    restoreSettings: document.getElementById("restoreSettings"),
    toastRegion: document.getElementById("toastRegion")
  };

  const focusState = new WeakMap();
  let drawerReturnFocus = null;
  let notificationReturnFocus = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    })[character]);
  }

  function getFocusable(container) {
    return [...container.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
  }

  function trapFocus(event, container) {
    if (event.key !== "Tab") return;
    const focusable = getFocusable(container);
    if (!focusable.length) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!container.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === container)) {
      event.preventDefault();
      first.focus();
    }
  }

  function toast(title, message) {
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<span aria-hidden="true">●</span><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></span>`;
    dom.toastRegion.append(item);
    window.setTimeout(() => item.remove(), 3600);
  }

  function daysSince(dateString) {
    const date = new Date(`${dateString}T12:00:00+08:00`);
    return Math.floor((REFERENCE_DATE - date) / 86400000);
  }

  function periodOrders() {
    return state.orders.filter((order) => daysSince(order.date) >= 0 && daysSince(order.date) < state.period);
  }

  function badgeClass(status) {
    return ({
      "已完成": "badge-complete",
      "待付款": "badge-pending",
      "待审核": "badge-review",
      "履约中": "badge-review",
      "有风险": "badge-risk"
    })[status] || "badge-neutral";
  }

  function formatCurrency(amount, forceCompact = false) {
    if (forceCompact || state.settings.currency === "compact") {
      return `¥${(amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 1)} 万`;
    }
    return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(amount);
  }

  function getCustomerSummaries() {
    const map = new Map();
    state.orders.forEach((order) => {
      if (!map.has(order.customer)) {
        map.set(order.customer, {
          name: order.customer,
          industry: order.industry,
          orders: [],
          total: 0,
          latestDate: order.date
        });
      }
      const customer = map.get(order.customer);
      customer.orders.push(order);
      customer.total += order.amount;
      if (order.date > customer.latestDate) customer.latestDate = order.date;
    });
    return [...map.values()].map((customer) => {
      const attention = customer.orders.some((order) => ["待审核", "待付款", "有风险"].includes(order.status));
      const high = customer.total >= 200000;
      const growth = customer.orders.some((order) => daysSince(order.date) < 30);
      const label = attention ? "需跟进" : high ? "高价值" : "成长中";
      return { ...customer, attention, high, growth, label };
    }).sort((a, b) => b.total - a.total);
  }

  function filteredOrders() {
    const keyword = state.orderFilters.keyword.toLowerCase();
    return state.orders.filter((order) => {
      const matchesKeyword = !keyword || `${order.id} ${order.customer}`.toLowerCase().includes(keyword);
      const matchesStatus = !state.orderFilters.status || order.status === state.orderFilters.status;
      return matchesKeyword && matchesStatus;
    });
  }

  function filteredCustomers() {
    const keyword = state.customerFilters.keyword.toLowerCase();
    const segment = state.customerFilters.segment;
    return getCustomerSummaries().filter((customer) => {
      const matchesKeyword = !keyword || `${customer.name} ${customer.industry}`.toLowerCase().includes(keyword);
      const matchesSegment = !segment || customer[segment];
      return matchesKeyword && matchesSegment;
    });
  }

  function renderOverview() {
    const orders = periodOrders();
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const pending = orders.filter((order) => ["待审核", "待付款"].includes(order.status)).length;
    const risks = orders.filter((order) => order.status === "有风险").length;
    dom.metricOrders.textContent = String(orders.length);
    dom.metricOrdersMeta.textContent = `${state.period} 天内签约订单`;
    dom.metricRevenue.textContent = formatCurrency(revenue);
    dom.metricRevenueMeta.textContent = `${state.period} 天累计成交`;
    dom.metricPending.textContent = String(pending);
    dom.metricRisk.textContent = String(risks);
    dom.trendSubtitle.textContent = `${state.period} 天订单金额分布`;
    dom.trendBadge.textContent = `${state.period} 天`;

    const ratios = state.period === 7 ? [0.42, 0.68, 0.35, 0.82, 0.58, 1, 0.74] : state.period === 30 ? [0.36, 0.54, 0.48, 0.72, 0.61, 1, 0.83] : [0.28, 0.45, 0.38, 0.68, 0.57, 0.86, 1];
    const labels = state.period === 7 ? ["08-14", "08-15", "08-16", "08-17", "08-18", "08-19", "08-20"] : state.period === 30 ? ["第1周", "第2周", "第3周", "第4周", "08-16", "08-18", "08-20"] : ["6月", "6月中", "7月", "7月中", "8月初", "8月中", "当前"];
    const base = Math.max(revenue / ratios.reduce((sum, value) => sum + value, 0), 1);
    dom.revenueChart.innerHTML = ratios.map((ratio, index) => {
      const value = Math.round(base * ratio);
      return `<div class="bar-column"><strong>${escapeHtml(formatCurrency(value))}</strong><span class="bar-mark" style="height:${Math.max(8, Math.round(ratio * 82))}%"></span><span>${escapeHtml(labels[index])}</span></div>`;
    }).join("");

    const totals = new Map();
    orders.forEach((order) => totals.set(order.customer, (totals.get(order.customer) || 0) + order.amount));
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const highest = ranked[0]?.[1] || 1;
    dom.customerRank.innerHTML = ranked.length
      ? ranked.map(([name, total], index) => `<div class="rank-row"><span class="rank-number">${index + 1}</span><strong>${escapeHtml(name)}</strong><span class="progress-track"><span class="progress-value" style="width:${Math.round(total / highest * 100)}%"></span></span><span>${escapeHtml(formatCurrency(total))}</span></div>`).join("")
      : `<p class="muted">当前周期暂无成交客户。</p>`;
  }

  function renderOrders() {
    const orders = filteredOrders();
    dom.orderResultSummary.textContent = `共 ${orders.length} 笔订单`;
    dom.orderCountBadge.textContent = `${orders.length} 笔`;
    dom.orderTableBody.innerHTML = orders.length ? orders.map((order) => `
      <tr>
        <td><span class="record-title">${escapeHtml(order.id)}</span><span class="record-code">${escapeHtml(order.customer)}</span></td>
        <td>${escapeHtml(order.channel)}</td>
        <td>${escapeHtml(formatCurrency(order.amount))}</td>
        <td>${escapeHtml(order.owner)}</td>
        <td><span class="badge ${badgeClass(order.status)}">${escapeHtml(order.status)}</span></td>
        <td>${escapeHtml(order.date)}</td>
        <td><button class="button button-ghost button-small" type="button" data-order-id="${escapeHtml(order.id)}">查看详情</button></td>
      </tr>`).join("") : `<tr><td class="empty-state" colspan="7">没有找到符合当前条件的订单，请调整筛选条件。</td></tr>`;
    dom.orderMockNotice.hidden = !state.settings.mockNotice;
  }

  function renderCustomers() {
    const all = getCustomerSummaries();
    const customers = filteredCustomers();
    dom.highValueCount.textContent = String(all.filter((customer) => customer.high).length);
    dom.growthCount.textContent = String(all.filter((customer) => customer.growth).length);
    dom.attentionCount.textContent = String(all.filter((customer) => customer.attention).length);
    dom.customerResultSummary.textContent = `共 ${customers.length} 家客户`;
    dom.customerTableBody.innerHTML = customers.length ? customers.map((customer) => `
      <tr>
        <td><span class="record-title">${escapeHtml(customer.name)}</span><span class="record-code">最近业务 ${escapeHtml(customer.latestDate)}</span></td>
        <td>${escapeHtml(customer.industry)}</td>
        <td><span class="badge ${customer.attention ? "badge-risk" : customer.high ? "badge-paid" : "badge-review"}">${escapeHtml(customer.label)}</span></td>
        <td>${customer.orders.length}</td>
        <td>${escapeHtml(formatCurrency(customer.total))}</td>
        <td>${escapeHtml(customer.latestDate)}</td>
      </tr>`).join("") : `<tr><td class="empty-state" colspan="6">当前分群中没有符合条件的客户。</td></tr>`;
  }

  function renderTeam() {
    const ownerCounts = new Map();
    state.orders.filter((order) => order.status !== "已完成").forEach((order) => ownerCounts.set(order.owner, (ownerCounts.get(order.owner) || 0) + 1));
    dom.teamMemberCount.textContent = String(state.members.length);
    dom.teamOrderCount.textContent = String([...ownerCounts.values()].reduce((sum, count) => sum + count, 0));
    dom.teamOverloadCount.textContent = String([...ownerCounts.values()].filter((count) => count > 3).length);
    dom.memberTableBody.innerHTML = state.members.map((member) => {
      const load = ownerCounts.get(member.name) || 0;
      const loadStatus = load > 3 ? "负载较高" : member.status;
      const loadClass = load > 3 || member.status === "需关注" ? "badge-risk" : member.status === "处理中" ? "badge-review" : "badge-paid";
      return `<tr><td><span class="member-cell"><span class="member-avatar" aria-hidden="true">${escapeHtml(member.name.slice(0, 1))}</span><span class="member-copy"><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)}</small></span></span></td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.region)}</td><td>${load} 笔</td><td><span class="badge ${loadClass}">${escapeHtml(loadStatus)}</span></td></tr>`;
    }).join("");
  }

  function visibleNotifications() {
    const base = state.notifications.filter((notification) => {
      if (notification.kind === "risk" && !state.settings.riskAlerts) return false;
      if (notification.kind === "customer" && !state.settings.customerDigest) return false;
      if (notification.relatedOrderId) {
        const order = state.orders.find((item) => item.id === notification.relatedOrderId);
        if (!order || order.status === "已完成") return false;
      }
      return true;
    });
    if (!state.settings.loadAlerts) return base;
    const ownerCounts = new Map();
    state.orders.filter((order) => order.status !== "已完成").forEach((order) => ownerCounts.set(order.owner, (ownerCounts.get(order.owner) || 0) + 1));
    const overloaded = [...ownerCounts.values()].filter((count) => count > 3).length;
    return [...base, {
      id: "N-LOAD",
      kind: "load",
      title: overloaded ? `${overloaded} 名成员当前负载超过 3 笔订单` : "团队负载提醒已启用，当前无超载成员",
      time: "实时计算",
      read: true
    }];
  }

  function renderNotifications() {
    const notifications = visibleNotifications();
    const unread = notifications.filter((notification) => !notification.read).length;
    dom.notificationBadge.textContent = String(unread);
    dom.notificationBadge.hidden = unread === 0;
    dom.notificationButton.setAttribute("aria-label", unread ? `查看通知，当前有 ${unread} 条未读` : "查看通知，当前没有未读");
    dom.notificationList.innerHTML = notifications.length
      ? notifications.map((notification) => `<li class="notification-item"><span class="notification-dot" style="${notification.read ? "background:#c9ced5" : ""}" aria-hidden="true"></span><span><p>${escapeHtml(notification.title)}</p><small>${escapeHtml(notification.time)}·${notification.read ? "已读" : "未读"}</small></span></li>`).join("")
      : `<li class="notification-item"><span class="notification-dot" style="background:#c9ced5" aria-hidden="true"></span><span><p>当前没有需要处理的通知</p><small>通知会随订单状态与已保存偏好联动</small></span></li>`;
    dom.markAllRead.disabled = unread === 0;
    dom.markAllRead.title = unread === 0 ? "没有未读通知" : "";
  }

  function renderAll() {
    renderOverview();
    renderOrders();
    renderCustomers();
    renderTeam();
    renderNotifications();
    if (!dom.orderDrawerShell.hidden && state.activeOrderId) renderDrawer();
  }

  function switchPage(pageId, options = {}) {
    const target = dom.pageViews.find((view) => view.id === pageId) || dom.pageViews[0];
    const resolvedId = target.id;
    state.activePage = resolvedId;
    dom.pageViews.forEach((view) => { view.hidden = view !== target; });
    dom.navItems.forEach((item) => {
      if (item.getAttribute("href") === `#${resolvedId}`) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    const title = target.dataset.pageTitle || "运营总览";
    dom.breadcrumbCurrent.textContent = title;
    document.title = `${title} · 企业运营中台`;
    if (options.updateHash !== false && window.location.hash !== `#${resolvedId}`) history.pushState({ page: resolvedId }, "", `#${resolvedId}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    dom.mainContent.scrollTop = 0;
    closeSidebar();
    if (options.focus !== false) {
      const heading = target.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
    dom.sidebar.inert = false;
    dom.sidebar.removeAttribute("aria-hidden");
    dom.sidebarBackdrop.hidden = false;
    dom.sidebarToggle.setAttribute("aria-expanded", "true");
    dom.sidebarToggle.setAttribute("aria-label", "收起导航");
  }

  function closeSidebar(restoreFocus = false) {
    document.body.classList.remove("sidebar-open");
    dom.sidebarBackdrop.hidden = true;
    dom.sidebarToggle.setAttribute("aria-expanded", "false");
    dom.sidebarToggle.setAttribute("aria-label", "展开导航");
    if (window.matchMedia("(max-width: 900px)").matches) {
      dom.sidebar.inert = true;
      dom.sidebar.setAttribute("aria-hidden", "true");
    } else {
      dom.sidebar.inert = false;
      dom.sidebar.removeAttribute("aria-hidden");
    }
    if (restoreFocus) dom.sidebarToggle.focus();
  }

  function openNotifications() {
    notificationReturnFocus = document.activeElement;
    dom.notificationPanel.hidden = false;
    dom.notificationButton.setAttribute("aria-expanded", "true");
    dom.notificationPanel.focus();
  }

  function closeNotifications(restore = true) {
    if (dom.notificationPanel.hidden) return;
    dom.notificationPanel.hidden = true;
    dom.notificationButton.setAttribute("aria-expanded", "false");
    if (restore && notificationReturnFocus instanceof HTMLElement) notificationReturnFocus.focus();
  }

  function openDrawer(orderId, opener) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) return;
    state.activeOrderId = orderId;
    drawerReturnFocus = opener || document.activeElement;
    dom.orderDrawerShell.hidden = false;
    document.body.style.overflow = "hidden";
    renderDrawer();
    const focusable = getFocusable(dom.orderDrawer);
    (focusable[0] || dom.orderDrawer).focus();
  }

  function renderDrawer() {
    const order = state.orders.find((item) => item.id === state.activeOrderId);
    if (!order) return;
    dom.drawerTitle.textContent = order.customer;
    dom.drawerCode.textContent = order.id;
    dom.drawerDescription.textContent = `${order.industry}客户·${order.channel}订单`;
    dom.drawerStatus.textContent = order.status;
    dom.drawerStatus.className = `badge ${badgeClass(order.status)}`;
    dom.drawerAmount.textContent = formatCurrency(order.amount);
    dom.drawerCustomer.textContent = order.customer;
    dom.drawerChannel.textContent = order.channel;
    dom.drawerOwner.textContent = order.owner;
    dom.drawerDate.textContent = order.date;
    dom.drawerDelivery.textContent = order.delivery;
    const complete = order.status === "已完成";
    dom.requestStatusUpdate.disabled = complete;
    dom.requestStatusUpdate.title = complete ? "该订单已经完成，无需重复更新" : "";
  }

  function closeDrawer(restore = true) {
    if (dom.orderDrawerShell.hidden) return;
    dom.orderDrawerShell.hidden = true;
    document.body.style.overflow = "";
    if (restore) {
      const replacement = state.activeOrderId ? dom.orderTableBody.querySelector(`[data-order-id="${state.activeOrderId}"]`) : null;
      if (drawerReturnFocus instanceof HTMLElement && drawerReturnFocus.isConnected) drawerReturnFocus.focus();
      else if (replacement) replacement.focus();
      else document.getElementById("ordersTitle").focus();
    }
  }

  function openDialog(dialog, opener) {
    focusState.set(dialog, opener || document.activeElement);
    dialog.showModal();
    const focusable = getFocusable(dialog);
    (focusable[0] || dialog).focus();
  }

  function closeDialog(dialog, restore = true) {
    if (!dialog.open) return;
    dialog.close();
    const opener = focusState.get(dialog);
    if (restore && opener instanceof HTMLElement && opener.isConnected && !opener.disabled) opener.focus();
  }

  function updatePeriod(period) {
    state.period = Number(period);
    dom.periodButtons.forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.period) === state.period)));
    renderOverview();
  }

  function downloadOrders() {
    const orders = filteredOrders();
    const rows = [
      ["订单号", "客户名称", "行业", "渠道", "金额（元）", "负责人", "状态", "签约日期"],
      ...orders.map((order) => [order.id, order.customer, order.industry, order.channel, order.amount, order.owner, order.status, order.date])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast("订单已导出", `CSV 已生成，包含 ${orders.length} 笔当前筛选结果。`);
  }

  function syncSettingsForm() {
    Object.entries(state.settings).forEach(([name, value]) => {
      const control = dom.settingsForm.elements.namedItem(name);
      if (!control) return;
      if (control.type === "checkbox") control.checked = Boolean(value);
      else control.value = String(value);
    });
  }

  function readSettingsForm() {
    return {
      riskAlerts: dom.settingsForm.elements.riskAlerts.checked,
      customerDigest: dom.settingsForm.elements.customerDigest.checked,
      loadAlerts: dom.settingsForm.elements.loadAlerts.checked,
      defaultPeriod: dom.settingsForm.elements.defaultPeriod.value,
      currency: dom.settingsForm.elements.currency.value,
      mockNotice: dom.settingsForm.elements.mockNotice.checked
    };
  }

  dom.navItems.forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    switchPage(item.getAttribute("href").slice(1));
  }));

  document.querySelectorAll("[data-go-page]").forEach((button) => button.addEventListener("click", () => switchPage(button.dataset.goPage)));

  dom.sidebarToggle.addEventListener("click", () => {
    if (document.body.classList.contains("sidebar-open")) closeSidebar(true);
    else openSidebar();
  });
  dom.sidebarBackdrop.addEventListener("click", () => closeSidebar(true));

  dom.notificationButton.addEventListener("click", () => {
    if (dom.notificationPanel.hidden) openNotifications();
    else closeNotifications();
  });
  document.querySelector("[data-close-notifications]").addEventListener("click", () => closeNotifications());
  dom.markAllRead.addEventListener("click", () => {
    const visibleIds = new Set(visibleNotifications().filter((notification) => !notification.read).map((notification) => notification.id));
    const updatedCount = visibleIds.size;
    state.notifications.forEach((notification) => {
      if (visibleIds.has(notification.id)) notification.read = true;
    });
    renderNotifications();
    toast("通知已更新", `${updatedCount} 条当前未读通知已全部标记为已读。`);
  });

  dom.periodButtons.forEach((button) => button.addEventListener("click", () => updatePeriod(button.dataset.period)));
  document.querySelectorAll("[data-export-orders]").forEach((button) => button.addEventListener("click", downloadOrders));

  dom.orderFilterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.orderFilters = { keyword: dom.orderKeyword.value.trim(), status: dom.orderStatusFilter.value };
    renderOrders();
  });
  dom.orderFilterForm.addEventListener("reset", () => window.setTimeout(() => {
    state.orderFilters = { keyword: "", status: "" };
    renderOrders();
  }, 0));

  dom.orderTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-order-id]");
    if (button) openDrawer(button.dataset.orderId, button);
  });
  document.querySelectorAll("[data-close-drawer]").forEach((button) => button.addEventListener("click", () => closeDrawer()));
  dom.orderDrawer.addEventListener("keydown", (event) => trapFocus(event, dom.orderDrawer));
  dom.requestStatusUpdate.addEventListener("click", () => openDialog(dom.statusDialog, dom.requestStatusUpdate));
  dom.confirmStatusUpdate.addEventListener("click", () => {
    const order = state.orders.find((item) => item.id === state.activeOrderId);
    if (!order || order.status === "已完成") {
      closeDialog(dom.statusDialog);
      return;
    }
    order.status = "已完成";
    order.delivery = `${order.delivery} 运营负责人已在 Demo 中确认完成。`;
    closeDialog(dom.statusDialog, false);
    renderAll();
    const focusable = getFocusable(dom.orderDrawer);
    (focusable[0] || dom.orderDrawer).focus();
    toast("订单状态已更新", `${order.id} 已变更为“已完成”，相关统计已同步。`);
  });

  dom.customerFilterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.customerFilters = { keyword: dom.customerKeyword.value.trim(), segment: dom.customerSegment.value };
    renderCustomers();
  });
  dom.customerFilterForm.addEventListener("reset", () => window.setTimeout(() => {
    state.customerFilters = { keyword: "", segment: "" };
    renderCustomers();
  }, 0));

  document.querySelector("[data-open-invite]").addEventListener("click", (event) => {
    dom.inviteForm.reset();
    ["inviteNameError", "inviteRoleError", "inviteRegionError"].forEach((id) => { document.getElementById(id).textContent = ""; });
    openDialog(dom.inviteDialog, event.currentTarget);
  });
  dom.inviteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = dom.inviteName.value.trim();
    const role = dom.inviteRole.value;
    const region = dom.inviteRegion.value;
    document.getElementById("inviteNameError").textContent = name.length < 2 ? "请输入至少 2 个字的成员姓名。" : "";
    document.getElementById("inviteRoleError").textContent = role ? "" : "请选择团队角色。";
    document.getElementById("inviteRegionError").textContent = region ? "" : "请选择负责区域。";
    if (name.length < 2 || !role || !region) return;
    const member = { id: `M-${String(state.members.length + 1).padStart(2, "0")}`, name, role, region, status: "待加入" };
    state.members.push(member);
    closeDialog(dom.inviteDialog, false);
    renderTeam();
    const inviteButton = document.querySelector("[data-open-invite]");
    inviteButton.focus();
    toast("成员已加入 Demo", `${name}已作为“${role}”添加到团队清单。`);
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog"))));
  [dom.statusDialog, dom.inviteDialog].forEach((dialog) => {
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener("keydown", (event) => trapFocus(event, dialog));
  });

  dom.settingsForm.addEventListener("change", () => {
    dom.settingsStatus.textContent = "有未保存的修改，点击“保存设置”后生效。";
  });
  dom.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = readSettingsForm();
    state.period = Number(state.settings.defaultPeriod);
    updatePeriod(state.period);
    renderAll();
    dom.settingsStatus.textContent = `已保存：默认 ${state.period} 天统计，${state.settings.currency === "compact" ? "万元简写" : "完整金额"}。`;
    toast("偏好已保存", "总览周期、金额格式和 Mock 数据提示已同步到当前 Demo。");
  });
  dom.restoreSettings.addEventListener("click", () => {
    state.settings = { ...DEFAULT_SETTINGS };
    state.period = Number(DEFAULT_SETTINGS.defaultPeriod);
    syncSettingsForm();
    updatePeriod(state.period);
    renderAll();
    dom.settingsStatus.textContent = "已恢复 Demo 默认设置：30 天、万元简写、显示 Mock 提示。";
    toast("已恢复默认", "偏好表单和网页展示已同步复原。");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!dom.orderDrawerShell.hidden && !dom.statusDialog.open && !dom.inviteDialog.open) closeDrawer();
    else if (!dom.notificationPanel.hidden) closeNotifications();
    else if (document.body.classList.contains("sidebar-open")) {
      closeSidebar(true);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!dom.notificationPanel.hidden && !dom.notificationPanel.contains(event.target) && !dom.notificationButton.contains(event.target)) closeNotifications(false);
  });
  window.addEventListener("popstate", () => switchPage(window.location.hash.slice(1) || "overview", { updateHash: false, focus: false }));

  const narrowLayout = window.matchMedia("(max-width: 900px)");
  narrowLayout.addEventListener("change", (event) => closeSidebar(Boolean(event.matches && dom.sidebar.contains(document.activeElement))));

  syncSettingsForm();
  renderAll();
  const initialPage = dom.pageViews.some((view) => view.id === window.location.hash.slice(1)) ? window.location.hash.slice(1) : "overview";
  if (window.location.hash !== `#${initialPage}`) history.replaceState({ page: initialPage }, "", `#${initialPage}`);
  closeSidebar(false);
  switchPage(initialPage, { updateHash: false, focus: false });
})();
