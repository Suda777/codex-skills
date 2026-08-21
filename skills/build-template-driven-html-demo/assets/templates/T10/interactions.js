(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const state = {
    project: "热线体验优化",
    activePage: "studio",
    duration: 120,
    selectedVoiceId: "VOICE-01",
    activeSessionId: null,
    filters: { keyword: "", status: "", emotion: "" },
    voiceScene: "",
    sessions: [
      { id: "SES-0821-08", topic: "进度查询与安抚", voice: "稳健引导", emotion: "挫败", intensity: 78, status: "待复核", updated: "今天 10:32", summary: "访客反复询问处理节点，回应后紧迫感下降。" },
      { id: "SES-0821-07", topic: "事项材料补充", voice: "清晰说明", emotion: "紧迫", intensity: 71, status: "分析中", updated: "今天 09:18", summary: "对材料要求存在不确定，需进一步明确责任人与时限。" },
      { id: "SES-0820-06", topic: "回访关怀试验", voice: "温暖关怀", emotion: "信任", intensity: 86, status: "已完成", updated: "昨天 17:42", summary: "简短确认与复述提升了对话中的接受程度。" },
      { id: "SES-0820-05", topic: "异议处理陪练", voice: "稳健引导", emotion: "平静", intensity: 82, status: "已完成", updated: "昨天 16:03", summary: "表达节奏稳定，关键解释出现得较早。" },
      { id: "SES-0820-04", topic: "故障说明实验", voice: "清晰说明", emotion: "挫败", intensity: 69, status: "待分析", updated: "昨天 14:25", summary: "等待运行本地情绪模拟。" },
      { id: "SES-0819-03", topic: "服务承诺校准", voice: "专业简洁", emotion: "信任", intensity: 75, status: "待复核", updated: "08-19 18:10", summary: "承诺表达清晰，但下一步说明仍可更具体。" },
      { id: "SES-0819-02", topic: "复杂流程解释", voice: "专业简洁", emotion: "平静", intensity: 73, status: "已完成", updated: "08-19 11:48", summary: "分段解释降低了信息密度。" },
      { id: "SES-0818-01", topic: "紧急事项分流", voice: "稳健引导", emotion: "紧迫", intensity: 88, status: "已完成", updated: "08-18 15:22", summary: "快速给出责任人和时限后，紧迫表达明显减少。" }
    ],
    voices: [
      { id: "VOICE-01", name: "稳健引导", scene: "服务引导", pace: "中速", warmth: "温和", pause: "清晰", tone: "#eee8ff" },
      { id: "VOICE-02", name: "清晰说明", scene: "服务引导", pace: "偏慢", warmth: "克制", pause: "明确", tone: "#ddeeff" },
      { id: "VOICE-03", name: "温暖关怀", scene: "关怀回访", pace: "舒缓", warmth: "较高", pause: "自然", tone: "#ffe9dc" },
      { id: "VOICE-04", name: "专业简洁", scene: "内部陪练", pace: "中快", warmth: "中性", pause: "紧凑", tone: "#def5ec" }
    ],
    team: [
      { name: "周序", role: "体验设计", online: true, tone: "#eee8ff" },
      { name: "许澄", role: "脚本编辑", online: true, tone: "#ffe9dc" },
      { name: "林予安", role: "数据复核", online: false, tone: "#def5ec" },
      { name: "顾念", role: "体验设计", online: true, tone: "#ddeeff" }
    ],
    notifications: [
      { title: "进度查询与安抚进入待复核", time: "12 分钟前", kind: "review", read: false },
      { title: "回访关怀试验已完成", time: "昨天 17:42", kind: "complete", read: false },
      { title: "本地 Mock 数据已重新载入", time: "昨天 09:00", kind: "system", read: true }
    ],
    settings: { animateWave: true, showMock: true, defaultPage: "studio", defaultDuration: 120, notificationScope: "all" }
  };
  const SETTINGS_KEY = "t10-ai-interaction-demo-settings-v1";
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (saved && typeof saved === "object") {
      state.settings = { ...state.settings, ...saved };
      state.duration = Number(state.settings.defaultDuration) || 120;
    }
  } catch {}

  const pageNames = Object.fromEntries($$("[data-page-view]").map((page) => [page.id, page.dataset.pageTitle]));
  let restoreFocus = null;
  let drawerRestoreFocus = null;
  window.__demoDebug = { analysisRuns: [], exports: [], createdSessions: [], createdVoices: [], invitedMembers: [], statusChanges: [], settings: [], visitedPages: ["studio"] };

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
    return { "待分析": "status-wait", "分析中": "status-running", "待复核": "status-review", "已完成": "status-done" }[status] || "status-wait";
  }
  function nextStatus(status) {
    return { "待分析": "分析中", "分析中": "待复核", "待复核": "已完成", "已完成": "已完成" }[status] || status;
  }
  function createWave(seed = 1, count = 38) {
    return Array.from({ length: count }, (_, index) => 12 + ((index * 17 + seed * 23) % 74));
  }
  function renderWave(target, seed, count = 38) {
    target.innerHTML = createWave(seed, count).map((height) => `<i style="--height:${height}%"></i>`).join("");
  }

  function applySidebarState(open) {
    const narrow = window.innerWidth <= 860;
    byId("appShell").classList.toggle("sidebar-open", open);
    byId("menuToggle").setAttribute("aria-expanded", String(open));
    byId("sidebarOverlay").hidden = !open;
    byId("sidebar").inert = narrow && !open;
    byId("sidebar").setAttribute("aria-hidden", String(narrow && !open));
  }
  function closeSidebar(restore = false) {
    const wasOpen = byId("appShell").classList.contains("sidebar-open");
    applySidebarState(false);
    if (restore && wasOpen) byId("menuToggle").focus();
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
    byId("breadcrumbPage").textContent = pageNames[pageId];
    document.title = `AI 交互工作台 · ${pageNames[pageId]}`;
    history.replaceState(null, "", `#${pageId}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    if (window.innerWidth <= 860) closeSidebar();
    window.__demoDebug.visitedPages.push(pageId);
    if (focusHeading) byId(`${pageId}Title`)?.focus?.();
  }

  function populateVoiceSelects() {
    const options = state.voices.map((voice) => `<option value="${escapeHtml(voice.id)}">${escapeHtml(voice.name)}</option>`).join("");
    byId("voiceSelect").innerHTML = options;
    byId("voiceSelect").value = state.selectedVoiceId;
    byId("sessionVoice").innerHTML = '<option value="">请选择</option>' + options;
  }

  function renderStudioWave(seed = 2) {
    renderWave(byId("waveBars"), seed, state.duration === 30 ? 28 : state.duration === 120 ? 42 : 54);
    byId("waveBars").classList.toggle("is-animated", state.settings.animateWave);
  }
  function renderDuration() {
    $$("[data-duration]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.duration) === state.duration)));
    const label = state.duration === 30 ? "00:30" : state.duration === 120 ? "02:00" : "05:00";
    byId("waveCaption").textContent = `样本 ${label} · 未分析`;
    renderStudioWave(state.duration / 30);
  }
  function updateConfigSummary() {
    const voice = state.voices.find((item) => item.id === byId("voiceSelect").value);
    byId("analysisSummary").textContent = `${byId("modelSelect").value} · ${voice?.name || "未选声音"} · 关注${byId("focusSelect").value}`;
  }
  function applyEmotionResult(values) {
    const mapping = [
      ["Calm", values.calm],
      ["Frustration", values.frustration],
      ["Trust", values.trust],
      ["Urgency", values.urgency]
    ];
    mapping.forEach(([key, value]) => {
      byId(`emotion${key}`).textContent = `${value}%`;
      byId(`bar${key}`).style.setProperty("--width", `${value}%`);
    });
  }
  function resetAnalysis(showToast = true) {
    state.duration = state.settings.defaultDuration;
    byId("modelSelect").selectedIndex = 0;
    byId("focusSelect").selectedIndex = 0;
    byId("voiceSelect").value = state.selectedVoiceId;
    ["Calm", "Frustration", "Trust", "Urgency"].forEach((key) => {
      byId(`emotion${key}`).textContent = "--";
      byId(`bar${key}`).style.setProperty("--width", "0%");
    });
    byId("analysisStatus").textContent = "等待运行";
    renderDuration();
    updateConfigSummary();
    if (showToast) toast("分析已重置", "已恢复默认样本与配置");
  }

  function filteredSessions() {
    const keyword = state.filters.keyword.trim().toLowerCase();
    return state.sessions.filter((session) => {
      const text = `${session.id} ${session.topic} ${session.voice}`.toLowerCase();
      return (!keyword || text.includes(keyword)) &&
        (!state.filters.status || session.status === state.filters.status) &&
        (!state.filters.emotion || session.emotion === state.filters.emotion);
    });
  }
  function renderSessions() {
    const sessions = filteredSessions();
    byId("sessionNavCount").textContent = String(state.sessions.length);
    byId("sessionResultText").textContent = `共 ${sessions.length} 条 · ${state.project}`;
    byId("sessionList").innerHTML = sessions.map((session) => `
      <article class="session-row">
        <div><strong>${escapeHtml(session.topic)}</strong><small>${escapeHtml(session.id)}</small></div>
        <span>${escapeHtml(session.voice)}</span><span>${escapeHtml(session.emotion)} ${session.intensity}%</span>
        <span class="status-pill ${statusClass(session.status)}">${escapeHtml(session.status)}</span>
        <small>${escapeHtml(session.updated)}</small>
        <button class="mini-button" type="button" data-open-session="${escapeHtml(session.id)}">查看详情</button>
      </article>`).join("");
    byId("sessionEmpty").hidden = sessions.length > 0;
  }

  function renderVoices() {
    const voices = state.voices.filter((voice) => !state.voiceScene || voice.scene === state.voiceScene);
    const selected = state.voices.find((voice) => voice.id === state.selectedVoiceId);
    byId("selectedVoiceName").textContent = selected?.name || "未选择";
    byId("voiceGrid").innerHTML = voices.map((voice) => `
      <article class="voice-card" style="--tone:${voice.tone}" data-selected="${String(voice.id === state.selectedVoiceId)}">
        <div><span class="voice-avatar"><svg><use href="#v-voice"/></svg></span><h2>${escapeHtml(voice.name)}</h2><p>${escapeHtml(voice.scene)} · 不对应真人声音</p><div class="voice-tags"><span>语速 ${escapeHtml(voice.pace)}</span><span>温度 ${escapeHtml(voice.warmth)}</span><span>停顿 ${escapeHtml(voice.pause)}</span></div></div>
        <button class="${voice.id === state.selectedVoiceId ? "soft-button" : "gradient-button"}" type="button" data-select-voice="${escapeHtml(voice.id)}" ${voice.id === state.selectedVoiceId ? "disabled" : ""}>${voice.id === state.selectedVoiceId ? "当前声音角色" : "选为当前角色"}</button>
      </article>`).join("");
    byId("voiceEmpty").hidden = voices.length > 0;
  }

  function renderTeam() {
    byId("teamCount").textContent = String(state.team.length);
    byId("teamReviewCount").textContent = String(state.sessions.filter((session) => session.status === "待复核").length);
    byId("teamOnlineCount").textContent = String(state.team.filter((member) => member.online).length);
    byId("teamGrid").innerHTML = state.team.map((member) => `
      <article class="team-card"><span class="team-avatar" style="--tone:${member.tone}">${escapeHtml(member.name.slice(0,1))}</span><div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)}</small></div><span class="presence ${member.online ? "" : "offline"}" aria-label="${member.online ? "在线" : "离线"}"></span></article>`).join("");
  }

  function visibleNotifications() {
    if (state.settings.notificationScope === "review") return state.notifications.filter((item) => item.kind === "review");
    return state.notifications;
  }
  function renderNotifications() {
    const items = visibleNotifications();
    const unread = items.filter((item) => !item.read).length;
    const notificationButton = byId("notificationButton");
    const notificationPanel = byId("notificationPanel");
    const notificationsDisabled = state.settings.notificationScope === "none";
    if (notificationsDisabled) {
      const focusWasHidden = document.activeElement === notificationButton || notificationPanel.contains(document.activeElement);
      notificationPanel.hidden = true;
      notificationButton.setAttribute("aria-expanded", "false");
      if (focusWasHidden) byId("settingsTitle")?.focus?.();
    }
    notificationButton.hidden = notificationsDisabled;
    byId("notificationBadge").textContent = String(unread);
    byId("notificationBadge").hidden = unread === 0;
    byId("notificationList").innerHTML = items.map((item) => `<article class="notification-item" data-unread="${String(!item.read)}"><div><strong>${escapeHtml(item.title)}</strong><span>${item.read ? "已读" : "未读"}</span></div><span>${escapeHtml(item.time)}</span></article>`).join("") || '<div class="empty-card"><strong>暂无通知</strong><p>当前通知范围没有匹配内容。</p></div>';
    byId("markReadButton").disabled = unread === 0;
  }
  function renderAll() {
    populateVoiceSelects();
    renderSessions();
    renderVoices();
    renderTeam();
    renderNotifications();
    updateConfigSummary();
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }
  function exportCsv(rows, scope) {
    const csv = [["编号","主题","声音角色","主导情绪","强度","状态","更新时间"], ...rows.map((session) => [session.id, session.topic, session.voice, session.emotion, session.intensity, session.status, session.updated])]
      .map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mock-sessions-${scope}-2026-08-21.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    window.__demoDebug.exports.push({ scope, rows: rows.length });
    toast("导出已生成", `CSV 包含 ${rows.length} 条 Mock 会话`);
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
    const focusable = $$("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)", root).filter((item) => !item.hidden && item.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function bindDialogCancel(dialog) {
    dialog.addEventListener("cancel", () => window.setTimeout(() => {
      const target = restoreFocus;
      restoreFocus = null;
      target?.focus?.();
    }));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); closeDialog(dialog); return; }
      trapTab(event, dialog);
    });
  }

  function openDrawer(sessionId, trigger) {
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return;
    state.activeSessionId = sessionId;
    if (byId("sessionDrawer").hidden) drawerRestoreFocus = trigger || document.activeElement;
    byId("drawerId").textContent = session.id;
    byId("drawerTopic").textContent = session.topic;
    byId("drawerSummary").textContent = session.summary;
    byId("drawerVoice").textContent = session.voice;
    byId("drawerEmotion").textContent = session.emotion;
    byId("drawerIntensity").textContent = `${session.intensity}%`;
    byId("drawerStatus").innerHTML = `<span class="status-pill ${statusClass(session.status)}">${escapeHtml(session.status)}</span>`;
    renderWave(byId("drawerWave"), session.intensity, 34);
    byId("requestAdvanceButton").disabled = session.status === "已完成";
    byId("requestAdvanceButton").textContent = session.status === "已完成" ? "会话已完成" : `推进为${nextStatus(session.status)}`;
    byId("sessionDrawer").hidden = false;
    document.body.style.overflow = "hidden";
    byId("closeDrawerButton").focus();
  }
  function closeDrawer() {
    byId("sessionDrawer").hidden = true;
    document.body.style.overflow = "";
    const fallback = $$(`[data-open-session="${state.activeSessionId}"]`).find((item) => item.offsetParent !== null);
    const target = drawerRestoreFocus?.isConnected ? drawerRestoreFocus : fallback;
    drawerRestoreFocus = null;
    target?.focus?.();
  }
  function clearError(input, error) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }
  function showError(input, error, message) {
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
  }

  $$("[data-nav-item]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    setPage(link.getAttribute("href").slice(1), true);
  }));
  byId("menuToggle").addEventListener("click", () => {
    const open = !byId("appShell").classList.contains("sidebar-open");
    if (open) openSidebar();
    else closeSidebar(true);
  });
  byId("sidebarOverlay").addEventListener("click", () => closeSidebar(true));

  byId("projectButton").addEventListener("click", () => {
    const open = byId("projectMenu").hidden;
    byId("projectMenu").hidden = !open;
    byId("projectButton").setAttribute("aria-expanded", String(open));
  });
  byId("projectMenu").addEventListener("click", (event) => {
    const button = event.target.closest("[data-project]");
    if (!button) return;
    state.project = button.dataset.project;
    byId("projectName").textContent = state.project;
    byId("breadcrumbProject").textContent = state.project;
    byId("projectMenu").hidden = true;
    byId("projectButton").setAttribute("aria-expanded", "false");
    renderSessions();
    toast("项目已切换", `当前项目：${state.project}`);
  });

  byId("exportAllButton").addEventListener("click", () => exportCsv(state.sessions, "all"));
  byId("exportFilteredButton").addEventListener("click", () => exportCsv(filteredSessions(), "filtered"));
  byId("notificationButton").addEventListener("click", () => byId("notificationPanel").hidden ? openNotifications() : closeNotifications());
  byId("closeNotifications").addEventListener("click", () => closeNotifications());
  byId("markReadButton").addEventListener("click", () => {
    visibleNotifications().forEach((item) => { item.read = true; });
    renderNotifications();
    toast("动态已处理", "当前范围内的通知已标为已读");
  });

  $$("[data-duration]").forEach((button) => button.addEventListener("click", () => {
    state.duration = Number(button.dataset.duration);
    renderDuration();
    toast("样本长度已切换", byId("waveCaption").textContent);
  }));
  ["modelSelect", "voiceSelect", "focusSelect"].forEach((id) => byId(id).addEventListener("change", () => {
    if (id === "voiceSelect") state.selectedVoiceId = byId(id).value;
    updateConfigSummary();
    renderVoices();
  }));
  byId("analyzeButton").addEventListener("click", () => {
    const seed = state.duration / 30 + byId("modelSelect").selectedIndex * 3 + byId("focusSelect").selectedIndex * 5;
    const result = {
      calm: 48 + (seed * 7 % 29),
      frustration: 32 + (seed * 11 % 37),
      trust: 43 + (seed * 13 % 40),
      urgency: 38 + (seed * 17 % 42)
    };
    applyEmotionResult(result);
    renderStudioWave(seed + result.trust);
    byId("analysisStatus").textContent = "Mock 分析已完成";
    const emotionLabels = { calm: "平静", frustration: "挫败", trust: "信任", urgency: "紧迫" };
    const dominantEmotion = Object.entries(result).sort((a,b) => b[1]-a[1])[0][0];
    byId("waveCaption").textContent = `本地结果 · 主导情绪 ${emotionLabels[dominantEmotion]}`;
    byId("analysisSummary").textContent = `观察到挫败 ${result.frustration}% 与信任 ${result.trust}%；仅用于界面演示。`;
    window.__demoDebug.analysisRuns.push({ duration: state.duration, model: byId("modelSelect").value, ...result });
    state.notifications.unshift({ title: "一条本地 Mock 情绪分析已完成", time: "刚刚", kind: "complete", read: false });
    renderNotifications();
    toast("分析完成", "波形与四项情绪指标已更新");
  });
  byId("resetAnalysisButton").addEventListener("click", () => resetAnalysis());

  byId("sessionFilterForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.filters = { keyword: byId("sessionKeyword").value, status: byId("sessionStatus").value, emotion: byId("sessionEmotion").value };
    renderSessions();
  });
  byId("sessionFilterForm").addEventListener("reset", () => window.setTimeout(() => {
    state.filters = { keyword: "", status: "", emotion: "" };
    renderSessions();
    toast("筛选已重置", "已显示全部 Mock 会话");
  }));
  byId("sessionList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-session]");
    if (button) openDrawer(button.dataset.openSession, button);
  });

  byId("voiceSceneFilter").addEventListener("change", () => {
    state.voiceScene = byId("voiceSceneFilter").value;
    renderVoices();
  });
  byId("voiceGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-voice]");
    if (!button) return;
    state.selectedVoiceId = button.dataset.selectVoice;
    byId("voiceSelect").value = state.selectedVoiceId;
    renderVoices();
    updateConfigSummary();
    toast("声音角色已切换", `当前角色：${state.voices.find((voice) => voice.id === state.selectedVoiceId)?.name}`);
  });

  byId("openSessionButton").addEventListener("click", (event) => openDialog(byId("sessionDialog"), event.currentTarget));
  byId("closeSessionDialog").addEventListener("click", () => closeDialog(byId("sessionDialog")));
  byId("cancelSession").addEventListener("click", () => closeDialog(byId("sessionDialog")));
  bindDialogCancel(byId("sessionDialog"));
  byId("sessionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const topic = byId("sessionTopic").value.trim();
    const voiceId = byId("sessionVoice").value;
    clearError(byId("sessionTopic"), byId("sessionTopicError"));
    clearError(byId("sessionVoice"), byId("sessionVoiceError"));
    let valid = true;
    if (topic.length < 4) { showError(byId("sessionTopic"), byId("sessionTopicError"), "请输入至少 4 个字符"); valid = false; }
    if (!voiceId) { showError(byId("sessionVoice"), byId("sessionVoiceError"), "请选择声音角色"); valid = false; }
    if (!valid) return;
    const voice = state.voices.find((item) => item.id === voiceId);
    const id = `SES-0821-${String(state.sessions.length + 1).padStart(2, "0")}`;
    state.sessions.unshift({ id, topic, voice: voice.name, emotion: "平静", intensity: 50, status: "待分析", updated: "刚刚", summary: "由当前页面新建的本地 Mock 会话，尚未运行分析。" });
    window.__demoDebug.createdSessions.push(id);
    state.notifications.unshift({ title: `${topic} 已加入待分析队列`, time: "刚刚", kind: "system", read: false });
    byId("sessionForm").reset();
    closeDialog(byId("sessionDialog"));
    renderAll();
    setPage("sessions", true);
    toast("会话已创建", `${id} 已加入本地记录`);
  });

  byId("openVoiceButton").addEventListener("click", (event) => openDialog(byId("voiceDialog"), event.currentTarget));
  byId("closeVoiceDialog").addEventListener("click", () => closeDialog(byId("voiceDialog")));
  byId("cancelVoice").addEventListener("click", () => closeDialog(byId("voiceDialog")));
  bindDialogCancel(byId("voiceDialog"));
  byId("voiceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("voiceName").value.trim();
    const scene = byId("voiceScene").value;
    clearError(byId("voiceName"), byId("voiceNameError"));
    clearError(byId("voiceScene"), byId("voiceSceneError"));
    let valid = true;
    if (name.length < 2) { showError(byId("voiceName"), byId("voiceNameError"), "请输入至少 2 个字符"); valid = false; }
    if (!scene) { showError(byId("voiceScene"), byId("voiceSceneError"), "请选择应用场景"); valid = false; }
    if (!valid) return;
    const id = `VOICE-${String(state.voices.length + 1).padStart(2, "0")}`;
    state.voices.push({ id, name, scene, pace: "中速", warmth: "中性", pause: "自然", tone: ["#eee8ff","#ffe9dc","#def5ec","#ddeeff"][state.voices.length % 4] });
    state.selectedVoiceId = id;
    window.__demoDebug.createdVoices.push(id);
    byId("voiceForm").reset();
    state.voiceScene = "";
    byId("voiceSceneFilter").value = "";
    closeDialog(byId("voiceDialog"));
    renderAll();
    toast("声音角色已创建", `${name} 已选为当前角色`);
  });

  byId("openInviteButton").addEventListener("click", (event) => openDialog(byId("inviteDialog"), event.currentTarget));
  byId("closeInviteDialog").addEventListener("click", () => closeDialog(byId("inviteDialog")));
  byId("cancelInvite").addEventListener("click", () => closeDialog(byId("inviteDialog")));
  bindDialogCancel(byId("inviteDialog"));
  byId("inviteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("inviteName").value.trim();
    const role = byId("inviteRole").value;
    clearError(byId("inviteName"), byId("inviteNameError"));
    clearError(byId("inviteRole"), byId("inviteRoleError"));
    let valid = true;
    if (name.length < 2) { showError(byId("inviteName"), byId("inviteNameError"), "请输入至少 2 个字符"); valid = false; }
    if (!role) { showError(byId("inviteRole"), byId("inviteRoleError"), "请选择协作角色"); valid = false; }
    if (!valid) return;
    state.team.push({ name, role, online: false, tone: "#ffe4eb" });
    window.__demoDebug.invitedMembers.push(name);
    byId("inviteForm").reset();
    closeDialog(byId("inviteDialog"));
    renderTeam();
    toast("成员已邀请", `${name} 已加入当前演示项目`);
  });

  byId("closeDrawerButton").addEventListener("click", closeDrawer);
  byId("drawerBackdrop").addEventListener("click", closeDrawer);
  byId("drawerReturnButton").addEventListener("click", closeDrawer);
  byId("requestAdvanceButton").addEventListener("click", (event) => {
    const session = state.sessions.find((item) => item.id === state.activeSessionId);
    if (!session || session.status === "已完成") return;
    restoreFocus = event.currentTarget;
    byId("advanceDescription").textContent = `“${session.topic}”将从“${session.status}”推进为“${nextStatus(session.status)}”。会话列表、导航数量和协作空间会同步更新。`;
    byId("advanceDialog").showModal();
  });
  byId("closeAdvanceDialog").addEventListener("click", () => closeDialog(byId("advanceDialog")));
  byId("cancelAdvance").addEventListener("click", () => closeDialog(byId("advanceDialog")));
  bindDialogCancel(byId("advanceDialog"));
  byId("confirmAdvance").addEventListener("click", () => {
    const session = state.sessions.find((item) => item.id === state.activeSessionId);
    if (!session) return;
    const before = session.status;
    session.status = nextStatus(session.status);
    session.updated = "刚刚";
    window.__demoDebug.statusChanges.push({ id: session.id, before, after: session.status });
    state.notifications.unshift({ title: `${session.topic} 已推进为${session.status}`, time: "刚刚", kind: session.status === "待复核" ? "review" : "system", read: false });
    closeDialog(byId("advanceDialog"), false);
    renderAll();
    openDrawer(session.id, byId("requestAdvanceButton"));
    restoreFocus = null;
    toast("状态已推进", "会话记录与协作统计已同步");
  });

  ["animateWave","showMock","defaultPage","defaultDuration","notificationScope"].forEach((id) => byId(id).addEventListener("change", () => {
    byId("settingsStatus").textContent = "有尚未保存的更改";
  }));
  byId("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = {
      animateWave: byId("animateWave").checked,
      showMock: byId("showMock").checked,
      defaultPage: byId("defaultPage").value,
      defaultDuration: Number(byId("defaultDuration").value),
      notificationScope: byId("notificationScope").value
    };
    document.body.classList.toggle("wave-static", !state.settings.animateWave);
    document.body.classList.toggle("mock-hidden", !state.settings.showMock);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); } catch {}
    renderStudioWave(state.duration / 30);
    renderNotifications();
    byId("settingsStatus").textContent = "已保存到当前演示会话";
    window.__demoDebug.settings.push({ ...state.settings });
    toast("设置已保存", "分析呈现与通知范围已立即生效");
  });
  byId("resetSettingsButton").addEventListener("click", () => {
    byId("animateWave").checked = true;
    byId("showMock").checked = true;
    byId("defaultPage").value = "studio";
    byId("defaultDuration").value = "120";
    byId("notificationScope").value = "all";
    state.settings = { animateWave: true, showMock: true, defaultPage: "studio", defaultDuration: 120, notificationScope: "all" };
    try { localStorage.removeItem(SETTINGS_KEY); } catch {}
    document.body.classList.remove("wave-static", "mock-hidden");
    resetAnalysis(false);
    renderNotifications();
    byId("settingsStatus").textContent = "已恢复默认设置";
    toast("已恢复默认", "波形、Mock 标签、页面与通知均已复原");
  });

  byId("drawerPanel").addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeDrawer(); return; }
    if (event.key !== "Tab") return;
    const focusable = $$("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)", byId("drawerPanel")).filter((item) => !item.hidden && item.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.querySelector("dialog[open]")) return;
    if (!byId("notificationPanel").hidden) closeNotifications();
    if (!byId("projectMenu").hidden) {
      byId("projectMenu").hidden = true;
      byId("projectButton").setAttribute("aria-expanded", "false");
      byId("projectButton").focus();
    }
    else if (byId("appShell").classList.contains("sidebar-open")) closeSidebar(true);
  });
  window.addEventListener("hashchange", () => {
    const page = location.hash.slice(1);
    if (pageNames[page] && page !== state.activePage) setPage(page);
  });
  window.matchMedia("(max-width: 860px)").addEventListener("change", () => closeSidebar(false));

  byId("animateWave").checked = state.settings.animateWave;
  byId("showMock").checked = state.settings.showMock;
  byId("defaultPage").value = state.settings.defaultPage;
  byId("defaultDuration").value = String(state.settings.defaultDuration);
  byId("notificationScope").value = state.settings.notificationScope;
  document.body.classList.toggle("wave-static", !state.settings.animateWave);
  document.body.classList.toggle("mock-hidden", !state.settings.showMock);
  populateVoiceSelects();
  renderAll();
  resetAnalysis(false);
  closeSidebar(false);
  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  const requestedPage = pageNames[location.hash.slice(1)] ? location.hash.slice(1) : null;
  const initial = navigationType === "reload" ? state.settings.defaultPage : (requestedPage || state.settings.defaultPage);
  setPage(initial);
})();
