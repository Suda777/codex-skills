(() => {
  "use strict";

  const packagedSettings = { landing: "home", density: "comfortable", blockedAlerts: true, completionAlerts: true };
  const nextStatus = {
    "待安排": { status: "进行中", progress: 35 },
    "进行中": { status: "待验收", progress: 85 },
    "待验收": { status: "已完成", progress: 100 },
    "已阻塞": { status: "进行中", progress: 48 }
  };
  const state = {
    page: "home", period: 30, refreshSerial: 0, activeTaskId: null,
    filters: { keyword: "", status: "", owner: "" }, settings: { ...packagedSettings }, savedSettings: { ...packagedSettings },
    tasks: [
      { id:"TK-260821-01", title:"完善本周方案评审材料", category:"产品规划", owner:"唐宁", status:"进行中", progress:68, due:"08-23", priority:"高", description:"汇总调研结论、范围假设和两条核心演示路径，形成评审版本。" },
      { id:"TK-260821-02", title:"确认数据字段映射清单", category:"数据准备", owner:"沈禾", status:"待验收", progress:88, due:"08-22", priority:"中", description:"核对指标字段、枚举状态和关联键，等待业务负责人最终验收。" },
      { id:"TK-260820-03", title:"联调客户侧演示路径", category:"交付协同", owner:"周棠", status:"已阻塞", progress:42, due:"08-22", priority:"高", description:"缺少一项流程例外说明，需与产品规划伙伴协同后继续。" },
      { id:"TK-260819-04", title:"整理页面反馈优先级", category:"体验设计", owner:"许澄", status:"进行中", progress:55, due:"08-25", priority:"中", description:"把反馈分为逻辑问题、内容修正和视觉优化三类，确定本周处理顺序。" },
      { id:"TK-260818-05", title:"归档第一轮演示结论", category:"交付协同", owner:"周棠", status:"已完成", progress:100, due:"08-20", priority:"低", description:"第一轮演示结论已归档，文档仅包含匿名合成数据。" },
      { id:"TK-260817-06", title:"补充异常状态空页面", category:"体验设计", owner:"许澄", status:"待安排", progress:0, due:"08-27", priority:"低", description:"为空结果、权限不足和数据更新失败准备一致的说明与恢复动作。" },
      { id:"TK-260816-07", title:"复核统计口径说明", category:"数据准备", owner:"沈禾", status:"已阻塞", progress:35, due:"08-24", priority:"高", description:"完成率口径存在两个合理解释，需要确认后再进入验收。" },
      { id:"TK-260815-08", title:"准备下轮演示检查表", category:"产品规划", owner:"唐宁", status:"已完成", progress:100, due:"08-19", priority:"中", description:"已整理页面、按钮、状态、导出和窄屏检查项。" }
    ],
    people: [
      { id:"P-01", name:"唐宁", role:"产品规划", email:"tangning@example.test", color:"#6f81d7" },
      { id:"P-02", name:"沈禾", role:"数据分析", email:"shenhe@example.test", color:"#52b992" },
      { id:"P-03", name:"周棠", role:"交付协同", email:"zhoutang@example.test", color:"#e59a6a" },
      { id:"P-04", name:"许澄", role:"体验设计", email:"xucheng@example.test", color:"#a47bd1" }
    ],
    notices: [
      { id:"N-01", kind:"blocked", title:"2 项任务当前处于阻塞状态", time:"刚刚", read:false },
      { id:"N-02", kind:"progress", title:"确认数据字段映射清单进入待验收", time:"今天 09:50", read:false },
      { id:"N-03", kind:"done", title:"第一轮演示结论已完成归档", time:"昨天 16:20", read:true }
    ]
  };

  const $ = (id) => document.getElementById(id);
  const ui = {
    sidebar:$("lightSidebar"), overlay:$("sidebarOverlay"), menu:$("mobileMenu"), links:[...document.querySelectorAll("[data-view-link]")], pages:[...document.querySelectorAll("[data-view-page]")], breadcrumb:$("softBreadcrumb"), main:$("mainContent"), refreshTime:$("refreshTime"),
    noticeButton:$("softNoticeButton"), noticePanel:$("softNoticePanel"), noticeBadge:$("softNoticeBadge"), noticeList:$("softNoticeList"), readAll:$("readAllSoftNotices"),
    periodButtons:[...document.querySelectorAll("[data-soft-period]")], taskNavCount:$("taskNavCount"), welcomeActive:$("welcomeActive"), metricTotal:$("softMetricTotal"), metricPeriod:$("softMetricPeriod"), metricRunning:$("softMetricRunning"), metricDone:$("softMetricDone"), metricBlocked:$("softMetricBlocked"), completionText:$("softCompletionText"), softBars:$("softBars"), weeklySubtitle:$("weeklySubtitle"), focusList:$("focusTaskList"),
    filter:$("softTaskFilter"), keyword:$("softKeyword"), status:$("softStatus"), owner:$("softOwner"), filterMessage:$("softFilterMessage"), taskSummary:$("softTaskSummary"), taskList:$("softTaskList"), empty:$("softEmpty"),
    ring:$("softRing"), ringValue:$("ringValue"), ringLegend:$("ringLegend"), completionPeriod:$("completionPeriod"), ownerProgress:$("ownerProgress"), blockedCount:$("blockedCount"), blockedList:$("blockedList"),
    peopleCount:$("softPeopleCount"), teamLoad:$("softTeamLoad"), avatarCloud:$("avatarCloud"), peopleGrid:$("peopleGrid"),
    detail:$("taskDetailDialog"), detailCode:$("detailTaskCode"), detailTitle:$("taskDetailTitle"), detailDescription:$("detailTaskDescription"), detailOwner:$("detailTaskOwner"), detailDue:$("detailTaskDue"), detailStatus:$("detailTaskStatus"), detailProgressText:$("detailProgressText"), detailProgressBar:$("detailProgressBar"), requestUpdate:$("requestTaskUpdate"),
    confirm:$("taskConfirmDialog"), confirmCopy:$("taskConfirmCopy"), confirmUpdate:$("confirmTaskUpdate"),
    invite:$("softInviteDialog"), inviteForm:$("softInviteForm"), inviteName:$("softInviteName"), inviteRole:$("softInviteRole"), inviteEmail:$("softInviteEmail"), nameError:$("softNameError"), roleError:$("softRoleError"), emailError:$("softEmailError"),
    settings:$("softSettingsForm"), settingsStatus:$("softSettingsStatus"), toastRegion:$("softToastRegion")
  };
  let detailInvoker = null;
  let noticeInvoker = null;
  let inviteInvoker = null;
  let confirmMode = "none";

  function safe(value) { return String(value).replace(/[&<>'"]/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"})[char]); }
  function chipClass(status) { return ({"待安排":"chip-ready","进行中":"chip-progress","待验收":"chip-review","已完成":"chip-done","已阻塞":"chip-blocked"})[status] || "chip-ready"; }
  function filteredTasks() {
    const keyword = state.filters.keyword.trim().toLowerCase();
    return state.tasks.filter((task) => (!keyword || `${task.id} ${task.title}`.toLowerCase().includes(keyword)) && (!state.filters.status || task.status === state.filters.status) && (!state.filters.owner || task.owner === state.filters.owner));
  }
  function toast(title,message) { const item=document.createElement("div");item.className="soft-toast";item.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9"/></svg><div><strong>${safe(title)}</strong><span>${safe(message)}</span></div>`;ui.toastRegion.append(item);setTimeout(()=>item.remove(),3500); }
  function focusables(container){return [...container.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href],[tabindex]:not([tabindex='-1'])")].filter((item)=>!item.hidden&&item.getClientRects().length>0);}
  function trap(event,container){if(event.key!=="Tab")return;const list=focusables(container);if(!list.length)return;const first=list[0],last=list[list.length-1];if(!list.includes(document.activeElement)){event.preventDefault();(event.shiftKey?last:first).focus();}else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}

  function renderOverview(){
    const running=state.tasks.filter((task)=>["进行中","待验收","已阻塞"].includes(task.status)).length;
    const done=state.tasks.filter((task)=>task.status==="已完成").length;
    const blocked=state.tasks.filter((task)=>task.status==="已阻塞").length;
    const completion=Math.round(done/state.tasks.length*100);
    ui.welcomeActive.textContent=String(running);ui.metricTotal.textContent=String(state.tasks.length);ui.metricPeriod.textContent=`近 ${state.period} 天视图`;ui.metricRunning.textContent=String(running);ui.metricDone.textContent=String(done);ui.metricBlocked.textContent=String(blocked);ui.completionText.textContent=`完成率 ${completion}%`;ui.taskNavCount.textContent=String(state.tasks.filter((task)=>task.status!=="已完成").length);
    const chartByPeriod={7:[44,66,53,79,68,86,74],30:[35,48,62,54,75,82,91],90:[28,41,39,55,67,78,88]};const labels=state.period===7?["一","二","三","四","五","六","日"]:state.period===30?["1周","2周","3周","4周","本周","昨日","今日"]:["6月","6月中","7月","7月中","8月初","8月中","当前"];
    const values=chartByPeriod[state.period].map((v,i)=>Math.min(100,v+((state.refreshSerial+i)%3)));
    ui.softBars.innerHTML=values.map((value,index)=>`<div class="soft-bar-column"><strong>${value}%</strong><span class="soft-bar" style="height:${value}%"></span><span>${labels[index]}</span></div>`).join("");ui.weeklySubtitle.textContent=`近 ${state.period} 天各阶段完成情况`;
    const focus=[...state.tasks].filter((task)=>task.status!=="已完成").sort((a,b)=>(b.status==="已阻塞")-(a.status==="已阻塞")||a.due.localeCompare(b.due)).slice(0,4);
    ui.focusList.innerHTML=focus.map((task)=>`<article class="focus-task"><i aria-hidden="true" style="background:${task.status==="已阻塞"?"#ff6b7d":"#7184db"}"></i><div><strong>${safe(task.title)}</strong><small>${safe(task.owner)} · 截止 ${safe(task.due)}</small></div><button class="link-button" type="button" data-open-soft-task="${safe(task.id)}">详情</button></article>`).join("");
  }

  function renderTaskList(){
    const tasks=filteredTasks();ui.taskSummary.textContent=`共 ${tasks.length} 项任务`;ui.taskList.innerHTML=tasks.map((task)=>`<article class="task-row"><span class="task-color" aria-hidden="true" style="background:${task.status==="已阻塞"?"#ff6b7d":task.status==="已完成"?"#39da8a":"#7a8bdd"}"></span><div class="task-main"><span>${safe(task.id)}</span><h3>${safe(task.title)}</h3><p>${safe(task.category)} · ${safe(task.owner)} · 截止 ${safe(task.due)}</p></div><div class="task-progress"><span><i style="width:${task.progress}%"></i></span><small>${task.progress}%</small></div><span class="task-chip ${chipClass(task.status)}">${safe(task.status)}</span><button class="task-action" type="button" data-open-soft-task="${safe(task.id)}">查看详情</button></article>`).join("");ui.taskList.hidden=tasks.length===0;ui.empty.hidden=tasks.length!==0;
  }

  function renderInsights(){
    const total=state.tasks.length,done=state.tasks.filter((task)=>task.status==="已完成").length,blocked=state.tasks.filter((task)=>task.status==="已阻塞").length,running=state.tasks.filter((task)=>task.status==="进行中").length,review=state.tasks.filter((task)=>task.status==="待验收").length,ready=total-done-blocked-running-review,rate=Math.round(done/total*100);
    ui.ring.style.setProperty("--value",rate);ui.ringValue.textContent=`${rate}%`;ui.completionPeriod.textContent=`${new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})} 基于当前任务重新计算`;
    const parts=[{label:"已完成",value:done,color:"#39da8a"},{label:"进行中",value:running,color:"#7184db"},{label:"待验收",value:review,color:"#ffb648"},{label:"待安排 / 阻塞",value:ready+blocked,color:"#ff6b7d"}];ui.ringLegend.innerHTML=parts.map((part)=>`<div class="legend-item"><i style="background:${part.color}"></i><span>${part.label}</span><strong>${part.value}</strong></div>`).join("");
    const loads=new Map();state.tasks.forEach((task)=>{const current=loads.get(task.owner)||{all:0,done:0};current.all+=1;if(task.status==="已完成")current.done+=1;loads.set(task.owner,current);});ui.ownerProgress.innerHTML=state.people.map((person)=>{const load=loads.get(person.name)||{all:0,done:0};const value=load.all?Math.round(load.done/load.all*100):0;return `<div class="owner-row"><span><strong>${safe(person.name)}</strong><small>${safe(person.role)}</small></span><span class="owner-track"><i style="width:${value}%"></i></span><strong>${value}%</strong></div>`;}).join("");
    const blockedTasks=state.tasks.filter((task)=>task.status==="已阻塞");ui.blockedCount.textContent=String(blockedTasks.length);ui.blockedList.innerHTML=blockedTasks.length?blockedTasks.map((task)=>`<article class="blocked-item"><strong>${safe(task.title)}</strong><p>${safe(task.description)}</p><button class="link-button" type="button" data-open-soft-task="${safe(task.id)}">查看并处理</button></article>`).join(""):`<div class="friendly-empty"><strong>当前没有阻塞任务</strong><p>任务状态变化会实时同步到这里。</p></div>`;
  }

  function renderPeople(){
    const loads=new Map();state.tasks.filter((task)=>task.status!=="已完成").forEach((task)=>loads.set(task.owner,(loads.get(task.owner)||0)+1));ui.peopleCount.textContent=String(state.people.length);ui.teamLoad.textContent=`当前共承担 ${[...loads.values()].reduce((a,b)=>a+b,0)} 项未完成任务`;
    ui.avatarCloud.innerHTML=state.people.map((person)=>`<span class="cloud-avatar" style="background:${person.color}" title="${safe(person.name)}">${safe(person.name.slice(0,1))}</span>`).join("");ui.peopleGrid.innerHTML=state.people.map((person)=>{const load=loads.get(person.name)||0;return `<article class="person-card"><div class="person-top"><span class="person-avatar" style="background:${person.color}" aria-hidden="true">${safe(person.name.slice(0,1))}</span><div><h3>${safe(person.name)}</h3><p>${safe(person.role)} · ${safe(person.email)}</p></div></div><div class="person-load"><span>当前在办负载</span><strong>${load} 项 · ${load>=3?"需协同":load?"适中":"可分配"}</strong></div></article>`;}).join("");
  }

  function visibleNotices(){return state.notices.filter((item)=>(item.kind!=="blocked"||state.settings.blockedAlerts)&&(item.kind!=="done"||state.settings.completionAlerts));}
  function noticeIcon(kind){
    if(kind==="blocked")return '<svg viewBox="0 0 24 24"><path d="M12 8v5m0 3h.01M12 3 3 20h18L12 3Z"/></svg>';
    if(kind==="done")return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>';
    return '<svg viewBox="0 0 24 24"><path d="M5 17 17 5m-7 0h7v7"/></svg>';
  }
  function renderNotices(){const list=visibleNotices(),unread=list.filter((item)=>!item.read).length;ui.noticeBadge.textContent=String(unread);ui.noticeBadge.hidden=unread===0;ui.noticeButton.setAttribute("aria-label",unread?`查看任务通知，${unread} 条未读`:"查看任务通知，当前无未读");ui.noticeList.innerHTML=list.map((item)=>`<article class="soft-notice-item ${item.read?"read":""}"><span class="notice-symbol" aria-hidden="true">${noticeIcon(item.kind)}</span><div><strong>${safe(item.title)}</strong><small>${safe(item.time)} · ${item.read?"已读":"未读"}</small></div></article>`).join("")||`<div class="friendly-empty"><p>当前提醒规则下没有通知。</p></div>`;ui.readAll.disabled=unread===0;ui.readAll.title=unread?"":"没有未读通知";}
  function renderAll(){renderOverview();renderTaskList();renderInsights();renderPeople();renderNotices();if(ui.detail.open)renderDetail();}

  function showPage(page,{hash=true,focus=true}={}){if(!ui.pages.some((view)=>view.dataset.viewPage===page))page="home";state.page=page;ui.pages.forEach((view)=>view.hidden=view.dataset.viewPage!==page);ui.links.forEach((link)=>link.dataset.viewLink===page?link.setAttribute("aria-current","page"):link.removeAttribute("aria-current"));const view=ui.pages.find((item)=>item.dataset.viewPage===page);ui.breadcrumb.textContent=view.dataset.title;document.title=`${view.dataset.title} · 清爽任务中台`;if(hash&&location.hash!==`#${page}`)history.replaceState(null,"",`#${page}`);window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));closeSidebar();if(focus)(view.querySelector("h1")||ui.main).focus({preventScroll:true});}
  function openSidebar(){ui.sidebar.classList.add("open");ui.menu.setAttribute("aria-expanded","true");ui.overlay.hidden=false;}function closeSidebar(restore=false){const wasOpen=ui.sidebar.classList.contains("open");ui.sidebar.classList.remove("open");ui.menu.setAttribute("aria-expanded","false");ui.overlay.hidden=true;if(restore&&wasOpen)ui.menu.focus();}
  function openNotices(){if(!ui.noticePanel.hidden){closeNotices();return;}noticeInvoker=document.activeElement;ui.noticePanel.hidden=false;ui.noticeButton.setAttribute("aria-expanded","true");ui.noticePanel.focus();}function closeNotices(){if(ui.noticePanel.hidden)return;ui.noticePanel.hidden=true;ui.noticeButton.setAttribute("aria-expanded","false");noticeInvoker?.focus();}

  function renderDetail(){const task=state.tasks.find((item)=>item.id===state.activeTaskId);if(!task)return;ui.detailCode.textContent=task.id;ui.detailTitle.textContent=task.title;ui.detailDescription.textContent=task.description;ui.detailOwner.textContent=task.owner;ui.detailDue.textContent=task.due;ui.detailStatus.textContent=task.status;ui.detailStatus.className=`task-chip ${chipClass(task.status)}`;ui.detailProgressText.textContent=`${task.progress}%`;ui.detailProgressBar.style.width=`${task.progress}%`;const next=nextStatus[task.status];ui.requestUpdate.disabled=!next;ui.requestUpdate.title=next?"":"任务已完成，无下一状态";ui.requestUpdate.textContent=next?"推进任务状态":"任务已完成";}
  function openDetail(id,invoker){const task=state.tasks.find((item)=>item.id===id);if(!task)return;state.activeTaskId=id;if(invoker)detailInvoker=invoker;renderDetail();if(!ui.detail.open)ui.detail.showModal();setTimeout(()=>$("closeTaskDetail").focus(),0);}
  function closeDetail(restore=true){if(ui.detail.open)ui.detail.close();if(restore)detailInvoker?.focus();}
  function openInvite(invoker){inviteInvoker=invoker;ui.inviteForm.reset();[ui.nameError,ui.roleError,ui.emailError].forEach((node)=>node.textContent="");ui.invite.showModal();setTimeout(()=>ui.inviteName.focus(),0);}function closeInvite(restore=true){if(ui.invite.open)ui.invite.close();if(restore)inviteInvoker?.focus();}

  function exportTasks(){const rows=filteredTasks();const quote=(value)=>`"${String(value).replace(/"/g,'""')}"`;const table=[["编号","任务","类别","负责人","状态","进度","截止日期"],...rows.map((task)=>[task.id,task.title,task.category,task.owner,task.status,`${task.progress}%`,task.due])];const csv="\ufeff"+table.map((row)=>row.map(quote).join(",")).join("\r\n");const a=document.createElement("a"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.href=url;a.download=`任务清单-${new Date().toISOString().slice(0,10)}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("任务清单已导出",`CSV 包含 ${rows.length} 项当前筛选任务。`);}
  function syncSettings(){ui.settings.elements.landing.value=state.settings.landing;ui.settings.elements.density.value=state.settings.density;ui.settings.elements.blockedAlerts.checked=state.settings.blockedAlerts;ui.settings.elements.completionAlerts.checked=state.settings.completionAlerts;document.body.dataset.taskDensity=state.settings.density;}

  ui.links.forEach((link)=>link.addEventListener("click",(event)=>{event.preventDefault();showPage(link.dataset.viewLink);}));document.addEventListener("click",(event)=>{const jump=event.target.closest("[data-jump]");if(jump)showPage(jump.dataset.jump);const task=event.target.closest("[data-open-soft-task]");if(task)openDetail(task.dataset.openSoftTask,task);});
  ui.menu.addEventListener("click",()=>ui.sidebar.classList.contains("open")?closeSidebar(true):openSidebar());ui.overlay.addEventListener("click",()=>closeSidebar(true));
  ui.noticeButton.addEventListener("click",openNotices);$("closeSoftNotices").addEventListener("click",closeNotices);ui.readAll.addEventListener("click",()=>{visibleNotices().forEach((item)=>item.read=true);renderNotices();toast("通知已处理","所有可见通知已标为已读。");});
  $("softRefresh").addEventListener("click",()=>{state.refreshSerial+=1;ui.refreshTime.textContent=`今天 ${new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})} 已同步`;renderOverview();toast("进度已刷新","完成节奏和同步时间已更新。");});
  ui.periodButtons.forEach((button)=>button.addEventListener("click",()=>{state.period=Number(button.dataset.softPeriod);ui.periodButtons.forEach((item)=>item.setAttribute("aria-pressed",String(item===button)));renderOverview();toast("统计周期已切换",`当前查看近 ${state.period} 天进度。`);}));
  ui.filter.addEventListener("submit",(event)=>{event.preventDefault();state.filters={keyword:ui.keyword.value,status:ui.status.value,owner:ui.owner.value};ui.filterMessage.textContent=state.filters.keyword||state.filters.status||state.filters.owner?"筛选条件已应用":"当前显示全部任务";renderTaskList();});ui.filter.addEventListener("reset",(event)=>{event.preventDefault();ui.keyword.value="";ui.status.value="";ui.owner.value="";state.filters={keyword:"",status:"",owner:""};ui.filterMessage.textContent="筛选已重置，当前显示全部任务";renderTaskList();});[$("globalSoftExport"),$("exportSoftTasks")].forEach((button)=>button.addEventListener("click",exportTasks));
  $("refreshInsights").addEventListener("click",()=>{state.refreshSerial+=1;renderInsights();toast("分析已更新","已基于当前任务状态重新计算。");});

  $("closeTaskDetail").addEventListener("click",()=>closeDetail());$("backFromDetail").addEventListener("click",()=>closeDetail());
  ui.requestUpdate.addEventListener("click",()=>{const task=state.tasks.find((item)=>item.id===state.activeTaskId),next=task&&nextStatus[task.status];if(!next)return;ui.confirmCopy.textContent=`“${task.title}”将从“${task.status}”推进为“${next.status}”，并同步更新所有相关页面。`;confirmMode="pending";closeDetail(false);ui.confirm.showModal();setTimeout(()=>$("closeTaskConfirm").focus(),0);});
  function cancelConfirm(){confirmMode="cancel";if(ui.confirm.open)ui.confirm.close();setTimeout(()=>openDetail(state.activeTaskId,detailInvoker),0);}$("closeTaskConfirm").addEventListener("click",cancelConfirm);$("cancelTaskConfirm").addEventListener("click",cancelConfirm);
  ui.confirmUpdate.addEventListener("click",()=>{const task=state.tasks.find((item)=>item.id===state.activeTaskId),next=task&&nextStatus[task.status];if(!next)return;const previous=task.status;task.status=next.status;task.progress=Math.max(task.progress,next.progress);state.notices.unshift({id:`N-${Date.now()}`,kind:task.status==="已完成"?"done":"progress",title:`${task.title}：${previous} → ${task.status}`,time:"刚刚",read:false});confirmMode="done";ui.confirm.close();renderAll();const activeHeading=ui.pages.find((page)=>!page.hidden)?.querySelector("h1");if(detailInvoker instanceof HTMLElement&&detailInvoker.isConnected)detailInvoker.focus();else activeHeading?.focus();toast("任务已推进",`${task.id} 当前状态为${task.status}。`);});

  [$("topInvite"),$("pageInvite")].forEach((button)=>button.addEventListener("click",()=>openInvite(button)));$("closeSoftInvite").addEventListener("click",()=>closeInvite());$("cancelSoftInvite").addEventListener("click",()=>closeInvite());
  ui.inviteForm.addEventListener("submit",(event)=>{event.preventDefault();const name=ui.inviteName.value.trim(),role=ui.inviteRole.value,email=ui.inviteEmail.value.trim().toLowerCase();const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),duplicate=state.people.some((person)=>person.email.toLowerCase()===email);ui.nameError.textContent=name.length>=2?"":"请输入至少 2 个字的姓名";ui.roleError.textContent=role?"":"请选择岗位";ui.emailError.textContent=!emailOk?"请输入有效邮箱":duplicate?"该邮箱已在伙伴列表中":"";if(name.length<2||!role||!emailOk||duplicate)return;const colors=["#6f81d7","#52b992","#e59a6a","#a47bd1","#4fa3c7"];state.people.push({id:`P-${String(state.people.length+1).padStart(2,"0")}`,name,role,email,color:colors[state.people.length%colors.length]});closeInvite(false);renderPeople();inviteInvoker?.focus();toast("邀请已加入本地会话",`${name} 已显示在伙伴空间。`);});

  ui.settings.addEventListener("submit",(event)=>{event.preventDefault();const form=new FormData(ui.settings);state.settings={landing:String(form.get("landing")),density:String(form.get("density")),blockedAlerts:form.has("blockedAlerts"),completionAlerts:form.has("completionAlerts")};state.savedSettings={...state.settings};syncSettings();renderNotices();ui.settingsStatus.textContent=`设置已保存：默认进入${ui.settings.elements.landing.selectedOptions[0].textContent}，${state.settings.density==="comfortable"?"舒展":"紧凑"}任务卡。`;toast("偏好已保存","新的显示和提醒规则已生效。");});$("restoreSoftSettings").addEventListener("click",()=>{state.settings={...packagedSettings};state.savedSettings={...packagedSettings};syncSettings();renderNotices();ui.settingsStatus.textContent="已恢复模板默认设置。";toast("已恢复默认","工作台显示与通知规则已重置。");});

  ui.detail.addEventListener("cancel",(event)=>{event.preventDefault();closeDetail();});ui.confirm.addEventListener("cancel",(event)=>{event.preventDefault();cancelConfirm();});ui.invite.addEventListener("cancel",(event)=>{event.preventDefault();closeInvite();});[ui.detail,ui.confirm,ui.invite].forEach((dialog)=>dialog.addEventListener("keydown",(event)=>trap(event,dialog)));ui.noticePanel.addEventListener("keydown",(event)=>trap(event,ui.noticePanel));document.addEventListener("keydown",(event)=>{if(event.key!=="Escape"||ui.detail.open||ui.confirm.open||ui.invite.open)return;if(!ui.noticePanel.hidden)closeNotices();else closeSidebar(true);});window.addEventListener("hashchange",()=>showPage(location.hash.slice(1),{hash:false}));

  [...new Set(state.tasks.map((task)=>task.owner))].forEach((owner)=>{const option=document.createElement("option");option.value=owner;option.textContent=owner;ui.owner.append(option);});syncSettings();renderAll();showPage(location.hash.slice(1)||state.settings.landing,{hash:true,focus:false});requestAnimationFrame(()=>setTimeout(()=>window.scrollTo(0,0),60));
})();
