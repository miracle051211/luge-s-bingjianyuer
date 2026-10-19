"use strict";
/* 交互增强独立于原有数据、保存逻辑及研究脚本；不注册后台服务。 */
(() => {
 const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
 const guide=document.getElementById("guide-view");
 const result=document.getElementById("guide-result");
 if(!guide||!result||typeof guideSnapshot!=="function")return;
 const journey=document.createElement("section");
 journey.className="stage-journey";
 journey.setAttribute("aria-label","从孕期到宝宝36个月的阶段导航");
 journey.innerHTML=`<div class="journey-heading"><h2>从孕期到宝宝 36 个月</h2><div class="journey-controls"><button type="button" id="stage-previous" aria-label="上一个阶段">←</button><button type="button" id="stage-next" aria-label="下一个阶段">→</button></div></div><div class="journey-track">${STAGES.map((s,i)=>`<button type="button" class="journey-stop" data-journey-stage="${escapeHTML(s.id)}" aria-pressed="false"><span class="journey-number" aria-hidden="true">${String(i+1).padStart(2,"0")}</span><span><strong>${escapeHTML(s.short)}</strong><small>${s.mode==="pregnancy"?s.min+" 周起":s.min+"–"+s.max+" 月"} · ${s.tasks.length} 项</small></span></button>`).join("")}</div>`;
 guide.querySelector(".workspace").before(journey);
 const orbit=document.createElement("div");
 orbit.className="progress-orbit";
 orbit.setAttribute("aria-hidden","true");
 orbit.innerHTML='<svg viewBox="0 0 58 58" aria-hidden="true"><circle class="orbit-track" cx="29" cy="29" r="26"/><circle class="orbit-value" cx="29" cy="29" r="26"/></svg>';
 orbit.append(document.getElementById("progress-count"));
 document.querySelector(".task-heading").append(orbit);
 const ring=orbit.querySelector(".orbit-value");
 let lastStage="",lastCount=-1,lastTotal=-1;
 const running=new WeakMap();
 function animateIn(el,delay=0){
  if(!el||reduceMotion.matches||typeof el.animate!=="function")return;
  running.get(el)?.cancel();
  const animation=el.animate([{opacity:.35,transform:"translateY(9px)"},{opacity:1,transform:"translateY(0)"}],{duration:300,delay,easing:"cubic-bezier(.22,1,.36,1)"});
  running.set(el,animation);
 }
 function animateStage(){
  animateIn(document.querySelector(".stage-heading"));
  result.querySelectorAll("#task-list .task-card").forEach((card,i)=>animateIn(card,40*i));
 }
 function syncJourney(){
  const snapshot=guideSnapshot();
  const index=STAGES.findIndex(s=>s.title===snapshot.stage);
  journey.querySelectorAll("[data-journey-stage]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.journeyStage===STAGES[index]?.id)));
  document.getElementById("stage-previous").disabled=index<=0;
  document.getElementById("stage-next").disabled=index>=STAGES.length-1;
  const completed=snapshot.tasks.filter(t=>t.completed).length;
  if(completed!==lastCount||snapshot.tasks.length!==lastTotal){ring.style.strokeDashoffset=String(163.363*(1-completed/snapshot.tasks.length));lastCount=completed;lastTotal=snapshot.tasks.length;}
  if(snapshot.stage!==lastStage){lastStage=snapshot.stage;animateStage();}
 }
 function goToStage(stage){if(stage){updateStage(stage.mode,stage.min);syncJourney();}}
 journey.addEventListener("click",event=>{
  const button=event.target.closest("button");if(!button)return;
  if(button.dataset.journeyStage)goToStage(STAGES.find(s=>s.id===button.dataset.journeyStage));
  else {const index=STAGES.findIndex(s=>s.title===guideSnapshot().stage);goToStage(STAGES[index+(button.id==="stage-previous"?-1:1)]);}
 });
 new MutationObserver(syncJourney).observe(result,{childList:true,subtree:true});
 syncJourney();
 // 观察已渲染的面板，兼容点击、键盘切换与原有 hash 导航。
 for(const id of ["knowledge-topic-panel","research-topic-panel","mental-example"]){
  const panel=document.getElementById(id);
  if(panel)new MutationObserver(()=>animateIn(panel)).observe(panel,{childList:true});
 }
 for(const view of document.querySelectorAll(".page-shell>section")){
  new MutationObserver(()=>{if(!view.hidden)animateIn(view);}).observe(view,{attributes:true,attributeFilter:["hidden"]});
 }
 document.addEventListener("change",event=>{
  if(event.target.matches(".task-check")&&!reduceMotion.matches){
   const card=event.target.closest(".task-card");
   if(event.target.checked&&typeof card.animate==="function")card.animate([{transform:"scale(1)"},{transform:"scale(1.018)"},{transform:"scale(1)"}],{duration:240,easing:"ease-out"});
  }
 });
 // 保持 details 的原生语义；关闭动画结束后才折叠，支持快速反向操作。
 const disclosures=new WeakMap();
 // 原脚本切换阶段时会关闭这两处，及时取消旧动效，避免重新展开。
 for(const id of ["more-tasks","stage-notes"]){
  const details=document.getElementById(id);
  new MutationObserver(()=>{
   const record=disclosures.get(details);
   if(!details.open&&record){
    disclosures.delete(details);
    record.animation.onfinish=null;record.animation.oncancel=null;
    record.animation.cancel();details.style.height="";details.style.overflow="";
   }
  }).observe(details,{attributes:true,attributeFilter:["open"]});
 }
 document.addEventListener("click",event=>{
  const summary=event.target.closest("summary");
  if(!summary||summary.parentElement.tagName!=="DETAILS"||reduceMotion.matches)return;
  const details=summary.parentElement;
  if(typeof details.animate!=="function")return;
  event.preventDefault();
  const previous=disclosures.get(details);
  const wasOpen=previous?previous.targetOpen:details.open;
  const targetOpen=!wasOpen;
  const start=details.getBoundingClientRect().height;
  previous?.animation.cancel();
  details.style.height="";
  details.style.overflow="hidden";
  details.open=true;
  const finish=targetOpen?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+parseFloat(getComputedStyle(details).paddingTop||0)+parseFloat(getComputedStyle(details).paddingBottom||0)+parseFloat(getComputedStyle(details).borderTopWidth||0)+parseFloat(getComputedStyle(details).borderBottomWidth||0);
  const animation=details.animate([{height:start+"px"},{height:finish+"px"}],{duration:220,easing:"cubic-bezier(.22,1,.36,1)"});
  disclosures.set(details,{animation,targetOpen});
  const clean=()=>{if(disclosures.get(details)?.animation===animation){details.style.height="";details.style.overflow="";}};
  animation.onfinish=()=>{if(disclosures.get(details)?.animation!==animation)return;if(details.open)details.open=targetOpen;clean();disclosures.delete(details);};
  animation.oncancel=clean;
 });
 reduceMotion.addEventListener("change",()=>{
  if(reduceMotion.matches)document.getAnimations().forEach(animation=>animation.finish());
 });
})();
