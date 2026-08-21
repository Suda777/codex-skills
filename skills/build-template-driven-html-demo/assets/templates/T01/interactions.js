(() => {
  "use strict";

  const records = {
    "PX-2026-018": {
      title: "城市运行数据协同平台一期",
      code: "PX-2026-018",
      description: "整合城市运行重点领域数据，形成跨部门协同处置与运行监测能力。",
      status: "推进中",
      progress: "72%",
      department: "市数据局",
      owner: "周明",
      start: "2026-03-15",
      deadline: "2026-09-30",
      timeline: [
        ["完成三类核心数据接入联调", "2026-08-18 16:20"],
        ["召开阶段成果评审会", "2026-08-12 10:00"],
        ["提交一期实施方案", "2026-07-29 09:45"]
      ]
    },
    "PX-2026-024": {
      title: "产业项目全周期服务优化",
      code: "PX-2026-024",
      description: "优化项目申报、协调、跟踪和评价流程，提升跨单位协同办理效率。",
      status: "待审核",
      progress: "86%",
      department: "市发展改革委",
      owner: "顾宁",
      start: "2026-02-10",
      deadline: "2026-08-28",
      timeline: [
        ["提交终期验收材料", "2026-08-19 15:10"],
        ["完成流程优化试运行", "2026-08-05 11:30"],
        ["确认跨部门办理清单", "2026-07-21 14:00"]
      ]
    },
    "PX-2026-031": {
      title: "交通枢纽综合治理提升",
      code: "PX-2026-031",
      description: "针对重点交通枢纽优化秩序管理、应急响应和客流疏导协同机制。",
      status: "有风险",
      progress: "48%",
      department: "市交通局",
      owner: "郑峰",
      start: "2026-04-01",
      deadline: "2026-09-10",
      timeline: [
        ["上报设备交付延期风险", "2026-08-20 08:40"],
        ["完成现场实施条件复核", "2026-08-13 13:25"],
        ["形成联合治理任务清单", "2026-07-30 17:10"]
      ]
    },
    "PX-2026-036": {
      title: "老旧小区公共空间改造",
      code: "PX-2026-036",
      description: "围绕居民高频需求推进公共空间、适老设施和社区服务点更新。",
      status: "推进中",
      progress: "63%",
      department: "市住建局",
      owner: "陈羽",
      start: "2026-03-28",
      deadline: "2026-10-15",
      timeline: [
        ["完成第二批点位现场核验", "2026-08-17 16:35"],
        ["发布施工协调安排", "2026-08-08 09:20"],
        ["居民意见采纳结果公示", "2026-07-24 12:00"]
      ]
    },
    "PX-2026-041": {
      title: "重点企业诉求闭环办理",
      code: "PX-2026-041",
      description: "建立重点企业诉求受理、分办、反馈和评价的全流程闭环管理机制。",
      status: "已完成",
      progress: "100%",
      department: "市发展改革委",
      owner: "林晓",
      start: "2026-01-12",
      deadline: "2026-08-18",
      timeline: [
        ["通过项目验收", "2026-08-18 15:40"],
        ["完成业务人员操作培训", "2026-08-11 10:15"],
        ["上线闭环评价功能", "2026-07-27 18:00"]
      ]
    },
    "PX-2026-052": {
      title: "公共数据授权运营试点",
      code: "PX-2026-052",
      description: "探索公共数据合规授权与场景化运营机制，形成试点管理和评估流程。",
      status: "待审核",
      progress: "80%",
      department: "市数据局",
      owner: "孟清",
      start: "2026-04-18",
      deadline: "2026-08-31",
      timeline: [
        ["提交试点评估报告", "2026-08-19 17:25"],
        ["完成首批场景运行复盘", "2026-08-09 15:50"],
        ["确认授权运营边界清单", "2026-07-22 10:30"]
      ]
    }
  };

  const statusClasses = {
    "推进中": "status-progress",
    "待审核": "status-review",
    "待确认": "status-review",
    "已完成": "status-done",
    "有风险": "status-risk",
    "待处理": "status-pending"
  };

  const analysisSnapshots = {
    month: {
      completion: "74.8%",
      completionMeta: "由当前 6 项事项实时计算",
      onTime: "91.4%",
      onTimeMeta: "高于目标值 1.4 个百分点",
      duration: "2.6 天",
      durationMeta: "较上期缩短 0.4 天",
      risk: "66.7%",
      riskMeta: "4 条预警待处置",
      bars: [42, 60, 52, 76, 88],
      labels: ["第1周", "第2周", "第3周", "第4周", "本周"],
      insight: "本月整体推进节奏稳定，市交通局事项平均进度低于全市均值 18.7 个百分点，建议优先协调设备交付与现场施工窗口。",
      positive: "按期办结率连续三周提升",
      concern: "2 项跨部门事项等待前置材料",
      action: "本周内组织一次专项协调会"
    },
    quarter: {
      completion: "68.5%",
      completionMeta: "较上季度提升 5.6 个百分点",
      onTime: "89.8%",
      onTimeMeta: "距季度目标值还有 0.2 个百分点",
      duration: "2.9 天",
      durationMeta: "较上季度缩短 0.7 天",
      risk: "12.5%",
      riskMeta: "5 项集中在 9 月交付",
      bars: [48, 63, 58, 72, 82],
      labels: ["4月", "5月", "6月", "7月", "8月"],
      insight: "本季度办结效率逐月提升，跨部门协同用时下降明显；交通与住建领域仍有 5 项关键节点集中在 9 月，需提前统筹资源。",
      positive: "月均办结数量较上季度增长 16%",
      concern: "交通与住建领域交付节点集中",
      action: "提前锁定 9 月联合验收窗口"
    },
    year: {
      completion: "64.2%",
      completionMeta: "年度目标完成进度符合预期",
      onTime: "87.6%",
      onTimeMeta: "距年度目标值还有 2.4 个百分点",
      duration: "3.2 天",
      durationMeta: "较年初缩短 1.1 天",
      risk: "14.1%",
      riskMeta: "年度累计 18 项进入重点跟踪",
      bars: [36, 48, 61, 70, 84],
      labels: ["一季度", "二季度", "7月", "8月", "预测"],
      insight: "年度总体进度符合计划，三季度进入集中交付阶段。若当前高风险事项按期解除，年度按期办结率预计可达到 90%。",
      positive: "重点事项平均协同用时持续下降",
      concern: "三季度验收任务量占全年 41%",
      action: "按周跟踪高风险事项解除情况"
    }
  };

  const organizationProfiles = {
    data: {
      title: "市数据局",
      meta: "数字政府建设与公共数据统筹责任单位",
      owner: "周明",
      contact: "综合协同岗",
      memberCount: 32,
      projects: "27 项",
      progress: "76%",
      permissions: ["事项创建与编辑", "进度填报", "数据查询", "风险处置"],
      members: [["周明", "组织负责人"], ["孟清", "事项管理员"], ["韩悦", "进度填报员"]]
    },
    development: {
      title: "市发展改革委",
      meta: "重点项目统筹与跨部门协调牵头单位",
      owner: "顾宁",
      contact: "项目统筹岗",
      memberCount: 28,
      projects: "36 项",
      progress: "88%",
      permissions: ["事项创建与编辑", "审核确认", "数据查询", "报告导出"],
      members: [["顾宁", "组织负责人"], ["赵可", "事项管理员"], ["罗申", "审核员"]]
    },
    transport: {
      title: "市交通局",
      meta: "综合交通治理与枢纽项目责任单位",
      owner: "郑峰",
      contact: "交通治理岗",
      memberCount: 24,
      projects: "31 项",
      progress: "54%",
      permissions: ["进度填报", "现场反馈", "数据查询", "风险处置"],
      members: [["郑峰", "组织负责人"], ["夏然", "风险处置员"], ["许川", "进度填报员"]]
    },
    housing: {
      title: "市住建局",
      meta: "城市更新与住房建设项目责任单位",
      owner: "陈羽",
      contact: "城市更新岗",
      memberCount: 29,
      projects: "34 项",
      progress: "69%",
      permissions: ["事项创建与编辑", "进度填报", "居民反馈", "数据查询"],
      members: [["陈羽", "组织负责人"], ["宋洁", "事项管理员"], ["苏航", "进度填报员"]]
    }
  };

  const overviewMetrics = { total: 6, onTrack: 3, review: 2, risk: 4 };

  const appShell = document.querySelector("#appShell");
  const sidebarToggle = document.querySelector("#sidebarToggle");
  const sidebarBackdrop = document.querySelector("#sidebarBackdrop");
  const filterForm = document.querySelector("#filterForm");
  const rows = Array.from(document.querySelectorAll("[data-record-row]"));
  const emptyRow = document.querySelector("#emptyRow");
  const resultSummary = document.querySelector("#resultSummary");
  const drawerShell = document.querySelector("#detailDrawerShell");
  const drawer = document.querySelector("#detailDrawer");
  const confirmDialog = document.querySelector("#confirmDialog");
  const completeAction = document.querySelector("#completeAction");
  const updateProgressAction = document.querySelector("#updateProgressAction");
  const confirmComplete = document.querySelector("#confirmComplete");
  const toastRegion = document.querySelector("#toastRegion");
  const mainContent = document.querySelector("#mainContent");
  const pageViews = Array.from(document.querySelectorAll("[data-page-view]"));
  const navItems = Array.from(document.querySelectorAll("[data-nav-item]"));
  const breadcrumbGroup = document.querySelector(".breadcrumb span:first-child");
  const breadcrumbCurrent = document.querySelector(".breadcrumb strong");
  const settingsForm = document.querySelector("#settingsForm");
  const alertRows = Array.from(document.querySelectorAll("[data-alert-row]"));
  const newRecordDialog = document.querySelector("#newRecordDialog");
  const newRecordForm = document.querySelector("#newRecordForm");
  const progressDialog = document.querySelector("#progressDialog");
  const progressForm = document.querySelector("#progressForm");
  const inviteDialog = document.querySelector("#inviteDialog");
  const inviteForm = document.querySelector("#inviteForm");
  const organizationEditorDialog = document.querySelector("#organizationEditorDialog");
  const organizationEditorForm = document.querySelector("#organizationEditorForm");
  const dialogs = Array.from(document.querySelectorAll("dialog"));
  let activeRecordId = null;
  let drawerReturnFocus = null;
  let drawerCloseTimer = null;
  let activeAlertFilter = "all";
  let activeOrganizationId = "data";
  let activeAnalysisPeriod = "month";
  let resolvedAlertCount = 0;

  function setSidebar(open) {
    if (!appShell || !sidebarToggle || !sidebarBackdrop) return;
    appShell.classList.toggle("sidebar-open", open);
    sidebarToggle.setAttribute("aria-expanded", String(open));
    sidebarToggle.setAttribute("aria-label", open ? "收起导航" : "展开导航");
    sidebarBackdrop.hidden = !open;
  }

  function showToast(title, message) {
    if (!toastRegion) return;
    const toast = document.createElement("div");
    toast.className = "toast";

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✓";

    const copy = document.createElement("span");
    const heading = document.createElement("strong");
    const detail = document.createElement("span");
    heading.textContent = title;
    detail.textContent = message;
    copy.append(heading, detail);
    toast.append(icon, copy);
    toastRegion.append(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 180);
    }, 3200);
  }

  function formatDateTime(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDateForFile(date = new Date()) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  }

  function renderOverviewMetrics() {
    const progressValues = Object.values(records).map((record) => Number.parseInt(record.progress, 10) || 0);
    const averageProgress = progressValues.length ? progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length : 0;
    const values = {
      overviewTotal: overviewMetrics.total,
      overviewOnTrack: overviewMetrics.onTrack,
      overviewReview: overviewMetrics.review,
      overviewRisk: overviewMetrics.risk,
      overviewCompletionRate: `${averageProgress.toFixed(1)}%`
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    });
  }

  function statusBucket(status) {
    if (status === "待审核" || status === "待确认") return "review";
    if (status === "推进中" || status === "已完成") return "onTrack";
    return null;
  }

  function updateOverviewForStatusChange(previousStatus, nextStatus) {
    const previousBucket = statusBucket(previousStatus);
    const nextBucket = statusBucket(nextStatus);
    if (previousBucket !== nextBucket) {
      if (previousBucket) overviewMetrics[previousBucket] = Math.max(0, overviewMetrics[previousBucket] - 1);
      if (nextBucket) overviewMetrics[nextBucket] += 1;
    }
    renderOverviewMetrics();
  }

  function clearFormErrors(form) {
    if (!form) return;
    form.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
    form.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
  }

  function setFormError(form, fieldName, message) {
    if (!form) return;
    const field = form.elements.namedItem(fieldName);
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (field instanceof HTMLElement) field.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  function validateRequiredFields(form, fieldNames) {
    clearFormErrors(form);
    let valid = true;
    fieldNames.forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName);
      if (!field || !String(field.value || "").trim()) {
        setFormError(form, fieldName, "请填写此项。");
        valid = false;
      }
    });
    if (!valid) {
      const firstInvalid = form.querySelector("[aria-invalid='true']");
      if (firstInvalid) firstInvalid.focus();
    }
    return valid;
  }

  function openDialog(dialog, focusSelector) {
    if (!dialog || typeof dialog.showModal !== "function") return;
    dialogs.forEach((item) => {
      if (item !== dialog && item.open) item.close();
    });
    dialog.showModal();
    syncPageLock();
    const focusTarget = focusSelector ? dialog.querySelector(focusSelector) : null;
    if (focusTarget) window.requestAnimationFrame(() => focusTarget.focus());
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }

  function csvCell(value) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function downloadCsv(filename, headings, dataRows) {
    const csv = [headings, ...dataRows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function pageIdFromLink(link) {
    const href = link && link.getAttribute("href");
    return href && href.startsWith("#") ? href.slice(1) : "";
  }

  function switchPage(pageId, { updateHistory = false, focusHeading = false } = {}) {
    const target = pageViews.find((view) => view.id === pageId) || pageViews[0];
    if (!target) return;

    pageViews.forEach((view) => {
      view.hidden = view !== target;
    });
    navItems.forEach((item) => {
      if (pageIdFromLink(item) === target.id) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });

    const pageTitle = target.dataset.pageTitle || "业务管理";
    if (breadcrumbGroup) breadcrumbGroup.textContent = target.dataset.pageGroup || "业务管理";
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = pageTitle;
    document.title = `${pageTitle} · 重点事项管理平台`;
    setSidebar(false);
    if (drawerShell && !drawerShell.hidden) closeDrawer({ restoreFocus: false });
    dialogs.forEach((dialog) => closeDialog(dialog));

    if (updateHistory && window.location.hash !== `#${target.id}`) {
      try {
        const url = new URL(window.location.href);
        url.hash = target.id;
        window.history.pushState({ pageId: target.id }, "", url);
      } catch (_error) {
        // The view still switches if a local browser blocks history updates.
      }
    }

    if (mainContent) mainContent.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (focusHeading) {
      const heading = target.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        window.requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    }
  }

  function renderAnalysis(period) {
    const baseSnapshot = analysisSnapshots[period];
    if (!baseSnapshot) return;
    activeAnalysisPeriod = period;
    const snapshot = { ...baseSnapshot };
    if (period === "month") {
      const recordList = Object.values(records);
      const progressTotal = recordList.reduce((sum, record) => sum + (Number.parseInt(record.progress, 10) || 0), 0);
      const averageProgress = recordList.length ? progressTotal / recordList.length : 0;
      const transportRecords = recordList.filter((record) => record.department === "市交通局");
      const transportProgress = transportRecords.length ? transportRecords.reduce((sum, record) => sum + (Number.parseInt(record.progress, 10) || 0), 0) / transportRecords.length : 0;
      const unresolvedAlerts = alertRows.filter((row) => !row.classList.contains("is-resolved")).length;
      snapshot.completion = `${averageProgress.toFixed(1)}%`;
      snapshot.completionMeta = `由当前 ${recordList.length} 项事项实时计算`;
      snapshot.risk = `${(recordList.length ? unresolvedAlerts / recordList.length * 100 : 0).toFixed(1)}%`;
      snapshot.riskMeta = `${unresolvedAlerts} 条预警待处置`;
      snapshot.insight = `当前台账平均进度为 ${averageProgress.toFixed(1)}%，市交通局事项平均进度为 ${transportProgress.toFixed(1)}%，建议优先协调设备交付与现场施工窗口。`;
    }

    document.querySelectorAll("[data-analysis-period]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.analysisPeriod === period));
    });
    const values = {
      analysisCompletion: snapshot.completion,
      analysisCompletionMeta: snapshot.completionMeta,
      analysisOnTime: snapshot.onTime,
      analysisOnTimeMeta: snapshot.onTimeMeta,
      analysisDuration: snapshot.duration,
      analysisDurationMeta: snapshot.durationMeta,
      analysisRisk: snapshot.risk,
      analysisRiskMeta: snapshot.riskMeta,
      analysisInsight: snapshot.insight
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    document.querySelectorAll("#analysisBars .bar-column").forEach((column, index) => {
      const bar = column.querySelector(".bar");
      const label = column.querySelector("small");
      if (bar) bar.style.setProperty("--bar-height", `${snapshot.bars[index]}%`);
      if (label) label.textContent = snapshot.labels[index];
    });
    const insights = {
      analysisPositive: ["积极信号：", snapshot.positive],
      analysisConcern: ["主要风险：", snapshot.concern],
      analysisAction: ["建议动作：", snapshot.action]
    };
    Object.entries(insights).forEach(([id, [label, detail]]) => {
      const element = document.getElementById(id);
      if (!element) return;
      const strong = document.createElement("strong");
      strong.textContent = label;
      element.replaceChildren(strong, detail);
    });
  }

  function applyAlertFilter(filter = activeAlertFilter) {
    activeAlertFilter = filter;
    let visible = 0;
    let unresolved = 0;
    alertRows.forEach((row) => {
      const matches = filter === "all" || row.dataset.alertLevel === filter;
      row.hidden = !matches;
      if (matches) {
        visible += 1;
        if (!row.classList.contains("is-resolved")) unresolved += 1;
      }
    });
    document.querySelectorAll("[data-alert-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.alertFilter === filter));
    });
    const summary = document.querySelector("#alertSummary");
    if (summary) summary.textContent = `当前显示 ${visible} 条预警，其中 ${unresolved} 条待处置`;
  }

  function syncAlertMetrics() {
    const unresolvedRows = alertRows.filter((row) => !row.classList.contains("is-resolved"));
    const high = unresolvedRows.filter((row) => row.dataset.alertLevel === "high").length;
    const medium = unresolvedRows.filter((row) => row.dataset.alertLevel === "medium").length;
    const total = high + medium;
    overviewMetrics.risk = total;
    const values = {
      highRiskCount: high,
      mediumRiskCount: medium,
      resolvedAlertCount: 3 + resolvedAlertCount,
      notificationBadge: total
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    });
    const badge = document.querySelector("#notificationBadge");
    if (badge) badge.hidden = total === 0;
    const notificationButton = document.querySelector("#notificationButton");
    if (notificationButton) notificationButton.setAttribute("aria-label", total ? `查看通知，当前有 ${total} 条未处置预警` : "查看通知，当前没有未处置预警");
    renderOverviewMetrics();
    if (activeAnalysisPeriod === "month") renderAnalysis("month");
    return { high, medium, total };
  }

  function rescanAlerts() {
    const counts = syncAlertMetrics();
    applyAlertFilter();
    const scanTime = document.querySelector("#alertScanTime");
    if (scanTime) scanTime.textContent = formatDateTime();
    showToast("预警规则已重新计算", `当前识别 ${counts.total} 条未处置预警：高风险 ${counts.high} 条，中风险 ${counts.medium} 条`);
  }

  function resolveAlert(button) {
    const row = button.closest("[data-alert-row]");
    if (!row || row.classList.contains("is-resolved")) return;
    row.classList.add("is-resolved");
    const state = row.querySelector("[data-alert-state]");
    if (state) {
      state.className = "status-badge status-done";
      state.textContent = "已处置";
    }
    button.disabled = true;
    button.textContent = "已完成处置";

    const linkedRecord = records[row.dataset.alertRecordId];
    if (linkedRecord && linkedRecord.status === "有风险") {
      const previousStatus = linkedRecord.status;
      linkedRecord.status = "推进中";
      linkedRecord.timeline.unshift(["风险预警已处置，恢复正常推进", formatDateTime()]);
      updateOverviewForStatusChange(previousStatus, linkedRecord.status);
      syncRecordRow(linkedRecord);
      applyFilters();
      if (activeRecordId === linkedRecord.code) populateDrawer(linkedRecord);
    }
    resolvedAlertCount += 1;
    syncAlertMetrics();
    applyAlertFilter();
    showToast("预警已完成处置", "该风险已进入闭环记录，页面状态已同步更新");
  }

  function renderOrganization(profileId) {
    const profile = organizationProfiles[profileId];
    if (!profile) return;
    activeOrganizationId = profileId;
    document.querySelectorAll("[data-org-select]").forEach((button) => {
      const selected = button.dataset.orgSelect === profileId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", String(selected));
      const buttonProfile = organizationProfiles[button.dataset.orgSelect];
      if (buttonProfile) {
        const title = button.querySelector("strong");
        const meta = button.querySelector("[data-org-meta]");
        const mark = button.querySelector(".organization-mark");
        if (title) title.textContent = buttonProfile.title;
        if (meta) meta.textContent = `${buttonProfile.memberCount} 名成员 · ${buttonProfile.projects}`;
        if (mark) mark.textContent = buttonProfile.title.replace(/^市/, "").slice(0, 1) || "组";
      }
    });

    const values = {
      organizationDetailTitle: profile.title,
      organizationDetailMeta: profile.meta,
      organizationOwner: profile.owner,
      organizationContact: profile.contact,
      organizationProjects: profile.projects,
      organizationProgress: profile.progress
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    const permissionList = document.querySelector("#organizationPermissions");
    if (permissionList) {
      permissionList.replaceChildren(...profile.permissions.map((permission) => {
        const item = document.createElement("span");
        item.textContent = permission;
        return item;
      }));
    }
  }

  function exportReport() {
    const dataRows = Object.values(records).map((record) => [
      record.code,
      record.title,
      record.department,
      record.owner,
      record.progress,
      record.status,
      record.start,
      record.deadline
    ]);
    const filename = `重点事项报告-${formatDateForFile()}.csv`;
    downloadCsv(filename, ["事项编号", "事项名称", "责任单位", "负责人", "当前进度", "办理状态", "开始日期", "截止日期"], dataRows);
    showToast("报告文件已下载", `${filename} 已生成，共 ${dataRows.length} 条事项记录`);
  }

  function exportMembers() {
    const profile = organizationProfiles[activeOrganizationId];
    if (!profile) return;
    const members = Array.from({ length: profile.memberCount }, (_, index) => profile.members[index] || [`演示成员${String(index + 1).padStart(2, "0")}`, "只读成员"]);
    const dataRows = members.map(([name, role], index) => [String(index + 1), name, role, profile.title]);
    const safeTitle = profile.title.replace(/[\\/:*?"<>|]/g, "-");
    const filename = `${safeTitle}-成员清单-${formatDateForFile()}.csv`;
    downloadCsv(filename, ["序号", "成员姓名", "业务角色", "所属组织"], dataRows);
    showToast("成员清单已下载", `${filename} 已生成，包含 ${dataRows.length} 条演示成员记录`);
  }

  function openInviteDialog() {
    const profile = organizationProfiles[activeOrganizationId];
    if (!profile || !inviteDialog || !inviteForm) return;
    inviteForm.reset();
    clearFormErrors(inviteForm);
    const organizationName = document.querySelector("#inviteOrganizationName");
    if (organizationName) organizationName.textContent = profile.title;
    openDialog(inviteDialog, "#inviteMemberName");
  }

  function saveInvitation(event) {
    event.preventDefault();
    if (!inviteForm || !validateRequiredFields(inviteForm, ["name", "role"])) return;
    const profile = organizationProfiles[activeOrganizationId];
    if (!profile) return;
    const data = new FormData(inviteForm);
    const name = String(data.get("name")).trim();
    const role = String(data.get("role"));
    profile.members.push([name, role]);
    profile.memberCount += 1;
    renderOrganization(activeOrganizationId);
    closeDialog(inviteDialog);
    showToast("成员已加入演示组织", `${name} 已作为“${role}”加入 ${profile.title}`);
  }

  function openOrganizationEditor() {
    const profile = organizationProfiles[activeOrganizationId];
    if (!profile || !organizationEditorDialog || !organizationEditorForm) return;
    clearFormErrors(organizationEditorForm);
    organizationEditorForm.elements.namedItem("title").value = profile.title;
    organizationEditorForm.elements.namedItem("owner").value = profile.owner;
    organizationEditorForm.elements.namedItem("contact").value = profile.contact;
    organizationEditorForm.elements.namedItem("meta").value = profile.meta;
    openDialog(organizationEditorDialog, "#organizationNameInput");
  }

  function saveOrganization(event) {
    event.preventDefault();
    if (!organizationEditorForm || !validateRequiredFields(organizationEditorForm, ["title", "owner", "contact", "meta"])) return;
    const profile = organizationProfiles[activeOrganizationId];
    if (!profile) return;
    const data = new FormData(organizationEditorForm);
    profile.title = String(data.get("title")).trim();
    profile.owner = String(data.get("owner")).trim();
    profile.contact = String(data.get("contact")).trim();
    profile.meta = String(data.get("meta")).trim();
    renderOrganization(activeOrganizationId);
    closeDialog(organizationEditorDialog);
    showToast("组织信息已更新", `${profile.title} 的当前演示配置已保存`);
  }

  function refreshData() {
    const updateTime = document.querySelector("#dataUpdateTime");
    const now = formatDateTime();
    if (updateTime) updateTime.textContent = now;
    renderOverviewMetrics();
    showToast("数据已刷新", `页面展示时间已更新为 ${now}`);
  }

  function showNotifications() {
    const counts = syncAlertMetrics();
    switchPage("alerts", { updateHistory: true, focusHeading: true });
    showToast("预警通知", counts.total ? `当前有 ${counts.high} 条高风险、${counts.medium} 条中风险待处置` : "当前没有未处置预警");
  }

  function focusAlert(recordId) {
    applyAlertFilter("all");
    alertRows.forEach((row) => row.classList.remove("is-focused"));
    const row = alertRows.find((item) => item.dataset.alertRecordId === recordId);
    if (!row) return;
    row.classList.add("is-focused");
    window.requestAnimationFrame(() => {
      row.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      row.focus({ preventScroll: true });
    });
    window.setTimeout(() => row.classList.remove("is-focused"), 4200);
  }

  function applyFilters() {
    if (!filterForm) return;
    const keyword = String(new FormData(filterForm).get("keyword") || "").trim().toLowerCase();
    const status = String(new FormData(filterForm).get("status") || "");
    const department = String(new FormData(filterForm).get("department") || "");
    let visible = 0;

    rows.forEach((row) => {
      const matchesKeyword = !keyword || (row.dataset.search || "").toLowerCase().includes(keyword);
      const matchesStatus = !status || row.dataset.status === status;
      const matchesDepartment = !department || row.dataset.department === department;
      const matches = matchesKeyword && matchesStatus && matchesDepartment;
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    if (emptyRow) emptyRow.hidden = visible !== 0;
    if (resultSummary) resultSummary.textContent = `共 ${visible} 条记录`;
  }

  function syncRecordRow(record) {
    const row = document.querySelector(`[data-record-row][data-record-id="${record.code}"]`);
    if (!row) return;
    row.dataset.search = `${record.title} ${record.code}`;
    row.dataset.status = record.status;
    row.dataset.department = record.department;
    const progressBar = row.querySelector(".progress-value");
    const progressCopy = row.querySelector(".progress-copy");
    if (progressBar) progressBar.style.width = record.progress;
    if (progressCopy) progressCopy.textContent = record.progress;
    setStatusBadge(row.querySelector("[data-row-status]"), record.status);
  }

  function buildRecordRow(record) {
    const row = document.createElement("tr");
    row.dataset.recordRow = "";
    row.dataset.recordId = record.code;
    row.dataset.search = `${record.title} ${record.code}`;
    row.dataset.status = record.status;
    row.dataset.department = record.department;

    const titleCell = document.createElement("td");
    const title = document.createElement("span");
    const code = document.createElement("span");
    title.className = "record-title";
    code.className = "record-code";
    title.textContent = record.title;
    code.textContent = record.code;
    titleCell.append(title, code);

    const departmentCell = document.createElement("td");
    departmentCell.textContent = record.department;
    const ownerCell = document.createElement("td");
    ownerCell.textContent = record.owner;

    const progressCell = document.createElement("td");
    const track = document.createElement("span");
    const value = document.createElement("span");
    const progressCopy = document.createElement("span");
    track.className = "progress-track";
    value.className = "progress-value";
    value.style.width = record.progress;
    progressCopy.className = "progress-copy";
    progressCopy.textContent = record.progress;
    track.append(value);
    progressCell.append(track, progressCopy);

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.dataset.rowStatus = "";
    setStatusBadge(status, record.status);
    statusCell.append(status);

    const deadlineCell = document.createElement("td");
    deadlineCell.textContent = record.deadline;
    const actionCell = document.createElement("td");
    const detailButton = document.createElement("button");
    detailButton.className = "button button-ghost button-small";
    detailButton.type = "button";
    detailButton.dataset.openDrawer = "";
    detailButton.dataset.recordId = record.code;
    detailButton.textContent = "查看详情";
    actionCell.append(detailButton);

    row.append(titleCell, departmentCell, ownerCell, progressCell, statusCell, deadlineCell, actionCell);
    return row;
  }

  function nextRecordCode() {
    const numbers = Object.keys(records).map((code) => Number(code.match(/(\d+)$/)?.[1] || 0));
    return `PX-2026-${String(Math.max(...numbers) + 1).padStart(3, "0")}`;
  }

  function openNewRecordDialog() {
    if (!newRecordForm || !newRecordDialog) return;
    newRecordForm.reset();
    clearFormErrors(newRecordForm);
    openDialog(newRecordDialog, "#newRecordName");
  }

  function saveNewRecord(event) {
    event.preventDefault();
    if (!newRecordForm || !validateRequiredFields(newRecordForm, ["title", "department", "owner", "deadline", "description"])) return;
    const data = new FormData(newRecordForm);
    const now = new Date();
    const record = {
      title: String(data.get("title")).trim(),
      code: nextRecordCode(),
      description: String(data.get("description")).trim(),
      status: "推进中",
      progress: "0%",
      department: String(data.get("department")),
      owner: String(data.get("owner")).trim(),
      start: formatDateTime(now).slice(0, 10),
      deadline: String(data.get("deadline")),
      timeline: [["事项已创建并进入办理", formatDateTime(now)]]
    };
    records[record.code] = record;
    const row = buildRecordRow(record);
    const body = document.querySelector("#recordBody");
    if (body) body.insertBefore(row, emptyRow || null);
    rows.push(row);

    overviewMetrics.total += 1;
    overviewMetrics.onTrack += 1;
    renderOverviewMetrics();
    if (activeAnalysisPeriod === "month") renderAnalysis("month");
    const profileId = Object.keys(organizationProfiles).find((id) => organizationProfiles[id].title === record.department);
    if (profileId) {
      const profile = organizationProfiles[profileId];
      profile.projects = `${Number.parseInt(profile.projects, 10) + 1} 项`;
      renderOrganization(activeOrganizationId);
    }
    closeDialog(newRecordDialog);
    applyFilters();
    showToast("事项已创建", `${record.code} 已加入当前演示台账`);
  }

  function setStatusBadge(element, status) {
    if (!element) return;
    element.className = `status-badge ${statusClasses[status] || "status-pending"}`;
    element.textContent = status;
  }

  function renderTimeline(items) {
    const timeline = document.querySelector("#drawerTimeline");
    if (!timeline) return;
    timeline.replaceChildren();
    items.forEach(([event, date]) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const time = document.createElement("time");
      title.textContent = event;
      time.textContent = date;
      item.append(title, time);
      timeline.append(item);
    });
  }

  function populateDrawer(record) {
    const values = {
      drawerTitle: record.title,
      drawerCode: record.code,
      drawerDescription: record.description,
      drawerProgress: record.progress,
      drawerDepartment: record.department,
      drawerOwner: record.owner,
      drawerStart: record.start,
      drawerDeadline: record.deadline
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    setStatusBadge(document.querySelector("#drawerStatus"), record.status);
    renderTimeline(record.timeline);
    if (completeAction) {
      const isDone = record.status === "已完成";
      const canComplete = record.status === "待确认" && Number.parseInt(record.progress, 10) === 100;
      completeAction.disabled = !canComplete;
      completeAction.textContent = isDone ? "事项已完成" : "提交完成";
    }
    if (updateProgressAction) {
      const isDone = record.status === "已完成";
      updateProgressAction.disabled = isDone;
      updateProgressAction.textContent = isDone ? "进度已锁定" : "更新进度";
    }
  }

  function openProgressDialog() {
    if (!activeRecordId || !progressForm || !progressDialog) return;
    const record = records[activeRecordId];
    if (!record || record.status === "已完成") return;
    const currentProgress = Number.parseInt(record.progress, 10);
    progressForm.reset();
    clearFormErrors(progressForm);
    const progressInput = progressForm.elements.namedItem("progress");
    const currentCopy = document.querySelector("#currentProgressCopy");
    if (progressInput) {
      progressInput.min = String(currentProgress);
      progressInput.value = String(currentProgress);
    }
    if (currentCopy) currentCopy.textContent = `${currentProgress}%`;
    openDialog(progressDialog, "#progressInput");
  }

  function saveProgress(event) {
    event.preventDefault();
    if (!activeRecordId || !progressForm) return;
    const record = records[activeRecordId];
    if (!record || record.status === "已完成") return;
    clearFormErrors(progressForm);
    const data = new FormData(progressForm);
    const currentProgress = Number.parseInt(record.progress, 10);
    const nextProgress = Number(data.get("progress"));
    const note = String(data.get("note") || "").trim();
    let valid = true;
    if (!Number.isInteger(nextProgress) || nextProgress < currentProgress || nextProgress > 100) {
      setFormError(progressForm, "progress", `请输入 ${currentProgress} 至 100 之间的整数。`);
      valid = false;
    }
    const chineseCharacters = note.match(/[\u3400-\u9fff]/g) || [];
    if (chineseCharacters.length < 6) {
      setFormError(progressForm, "note", "进度说明至少需要 6 个中文字符。");
      valid = false;
    }
    if (!valid) {
      const firstInvalid = progressForm.querySelector("[aria-invalid='true']");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const previousStatus = record.status;
    record.progress = `${nextProgress}%`;
    if (nextProgress === 100) record.status = "待确认";
    record.timeline.unshift([`进度更新至 ${nextProgress}%：${note}`, formatDateTime()]);
    updateOverviewForStatusChange(previousStatus, record.status);
    syncRecordRow(record);
    populateDrawer(record);
    if (activeAnalysisPeriod === "month") renderAnalysis("month");
    applyFilters();
    closeDialog(progressDialog);
    showToast("进度已更新", nextProgress === 100 ? "事项已进入待确认状态，可以提交完成" : `当前进度已更新为 ${nextProgress}%`);
  }

  function syncPageLock() {
    const drawerOpen = drawerShell && !drawerShell.hidden;
    const modalOpen = dialogs.some((dialog) => dialog.open);
    document.body.style.overflow = drawerOpen || modalOpen ? "hidden" : "";
  }

  function openDrawer(recordId, trigger) {
    const record = records[recordId];
    if (!record || !drawerShell || !drawer) return;
    if (drawerCloseTimer) {
      window.clearTimeout(drawerCloseTimer);
      drawerCloseTimer = null;
    }
    activeRecordId = recordId;
    drawerReturnFocus = trigger || document.activeElement;
    populateDrawer(record);
    drawerShell.hidden = false;
    syncPageLock();
    window.requestAnimationFrame(() => {
      drawerShell.classList.add("is-open");
      const closeButton = drawer.querySelector("[data-close-drawer]");
      if (closeButton) closeButton.focus();
      else drawer.focus();
    });
  }

  function closeDrawer({ restoreFocus = true } = {}) {
    if (!drawerShell || drawerShell.hidden) return;
    if (drawerCloseTimer) window.clearTimeout(drawerCloseTimer);
    drawerShell.classList.remove("is-open");
    drawerCloseTimer = window.setTimeout(() => {
      drawerShell.hidden = true;
      activeRecordId = null;
      syncPageLock();
      if (restoreFocus && drawerReturnFocus instanceof HTMLElement) drawerReturnFocus.focus();
      drawerReturnFocus = null;
      drawerCloseTimer = null;
    }, 220);
  }

  function openConfirmDialog() {
    if (!confirmDialog || !activeRecordId) return;
    const record = records[activeRecordId];
    if (!record || record.status !== "待确认" || Number.parseInt(record.progress, 10) !== 100) return;
    const description = document.querySelector("#confirmDescription");
    if (description) description.textContent = `确认将“${record.title}”标记为“已完成”吗？状态变更将在台账中即时呈现。`;
    openDialog(confirmDialog, "#confirmComplete");
  }

  function closeConfirmDialog() {
    if (confirmDialog && confirmDialog.open) confirmDialog.close();
  }

  function completeRecord() {
    if (!activeRecordId || !records[activeRecordId]) return;
    const record = records[activeRecordId];
    if (record.status !== "待确认" || Number.parseInt(record.progress, 10) !== 100) return;
    const previousStatus = record.status;
    record.status = "已完成";
    record.progress = "100%";
    record.timeline.unshift(["事项已确认完成", formatDateTime()]);

    updateOverviewForStatusChange(previousStatus, record.status);
    syncRecordRow(record);
    populateDrawer(record);
    closeConfirmDialog();
    applyFilters();
    showToast("状态更新成功", `“${record.title}”已标记为完成`);
  }

  function trapDrawerFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== "Tab" || !drawer || dialogs.some((dialog) => dialog.open)) return;
    const focusable = Array.from(drawer.querySelectorAll("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (sidebarToggle) sidebarToggle.addEventListener("click", () => setSidebar(!appShell.classList.contains("sidebar-open")));
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", () => setSidebar(false));

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      switchPage(pageIdFromLink(item), { updateHistory: true, focusHeading: true });
    });
  });

  if (filterForm) {
    filterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
    });
    filterForm.addEventListener("reset", () => window.setTimeout(applyFilters, 0));
  }

  document.addEventListener("click", (event) => {
    const drawerTrigger = event.target.closest("[data-open-drawer]");
    const closeDrawerTrigger = event.target.closest("[data-close-drawer]");
    const closeModalTrigger = event.target.closest("[data-close-modal]");
    const closeDialogTrigger = event.target.closest("[data-close-dialog]");
    const toastTrigger = event.target.closest("[data-toast-title]");
    const pageTrigger = event.target.closest("[data-go-page]");
    const analysisPeriodTrigger = event.target.closest("[data-analysis-period]");
    const alertFilterTrigger = event.target.closest("[data-alert-filter]");
    const alertResolveTrigger = event.target.closest("[data-resolve-alert]");
    const organizationTrigger = event.target.closest("[data-org-select]");
    const newRecordTrigger = event.target.closest("[data-open-new-record]");
    const exportReportTrigger = event.target.closest("[data-export-report]");
    const exportMembersTrigger = event.target.closest("[data-export-members]");
    const inviteTrigger = event.target.closest("[data-open-invite]");
    const organizationEditorTrigger = event.target.closest("[data-open-org-editor]");
    const refreshTrigger = event.target.closest("[data-refresh-data]");
    const rescanTrigger = event.target.closest("[data-rescan-alerts]");
    const notificationsTrigger = event.target.closest("[data-view-notifications]");

    if (drawerTrigger) openDrawer(drawerTrigger.dataset.recordId, drawerTrigger);
    if (closeDrawerTrigger) closeDrawer();
    if (closeModalTrigger) closeDialog(closeModalTrigger.closest("dialog"));
    if (closeDialogTrigger) closeDialog(closeDialogTrigger.closest("dialog"));
    if (toastTrigger) showToast(toastTrigger.dataset.toastTitle, toastTrigger.dataset.toastMessage || "操作已完成");
    if (pageTrigger) {
      switchPage(pageTrigger.dataset.goPage, { updateHistory: true, focusHeading: true });
      if (pageTrigger.dataset.openRecordAfterNav) {
        window.requestAnimationFrame(() => openDrawer(pageTrigger.dataset.openRecordAfterNav, pageTrigger));
      }
      if (pageTrigger.dataset.focusAlert) {
        window.requestAnimationFrame(() => focusAlert(pageTrigger.dataset.focusAlert));
      }
    }
    if (analysisPeriodTrigger) renderAnalysis(analysisPeriodTrigger.dataset.analysisPeriod);
    if (alertFilterTrigger) applyAlertFilter(alertFilterTrigger.dataset.alertFilter);
    if (alertResolveTrigger) resolveAlert(alertResolveTrigger);
    if (organizationTrigger) renderOrganization(organizationTrigger.dataset.orgSelect);
    if (newRecordTrigger) openNewRecordDialog();
    if (exportReportTrigger) exportReport();
    if (exportMembersTrigger) exportMembers();
    if (inviteTrigger) openInviteDialog();
    if (organizationEditorTrigger) openOrganizationEditor();
    if (refreshTrigger) refreshData();
    if (rescanTrigger) rescanAlerts();
    if (notificationsTrigger) showNotifications();
  });

  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const state = document.querySelector("#settingsSaveState");
      if (state) state.textContent = `已于 ${formatDateTime()} 保存到当前演示内存；刷新页面后恢复默认。`;
      showToast("当前演示设置已保存", "仅保存在本次页面内存中，不会影响其他业务页面或真实系统");
    });
    settingsForm.addEventListener("reset", () => {
      window.setTimeout(() => {
        const state = document.querySelector("#settingsSaveState");
        if (state) state.textContent = "已恢复当前演示的默认选项；刷新页面后同样恢复默认。";
        showToast("已恢复默认设置", "所有选项已恢复为当前演示初始值");
      }, 0);
    });
  }

  if (drawer) drawer.addEventListener("keydown", trapDrawerFocus);
  if (updateProgressAction) updateProgressAction.addEventListener("click", openProgressDialog);
  if (completeAction) completeAction.addEventListener("click", openConfirmDialog);
  if (confirmComplete) confirmComplete.addEventListener("click", completeRecord);
  if (newRecordForm) newRecordForm.addEventListener("submit", saveNewRecord);
  if (progressForm) progressForm.addEventListener("submit", saveProgress);
  if (inviteForm) inviteForm.addEventListener("submit", saveInvitation);
  if (organizationEditorForm) organizationEditorForm.addEventListener("submit", saveOrganization);
  dialogs.forEach((dialog) => {
    dialog.addEventListener("close", syncPageLock);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) closeDialog(dialog);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) setSidebar(false);
  });

  window.addEventListener("popstate", () => {
    const requestedPage = window.location.hash.slice(1);
    switchPage(requestedPage || "overview");
  });

  const requestedPage = window.location.hash.slice(1);
  const initialPage = pageViews.some((view) => view.id === requestedPage) ? requestedPage : "overview";
  switchPage(initialPage);
  renderAnalysis("month");
  renderOverviewMetrics();
  syncAlertMetrics();
  applyAlertFilter("all");
  renderOrganization("data");
})();
