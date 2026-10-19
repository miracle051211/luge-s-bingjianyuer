"use strict";
const $=id=>document.getElementById(id);
const CONTENT=window.PARENTING_CONTENT;
Object.assign(SOURCES,CONTENT.extraSources||{});
const IMAGE_INFO={"prenatal-planning":{file:"preparation.svg",alt:"待产用品、证件与出行准备的线描示意"},"feeding-care":{file:"meal.svg",alt:"餐碗与准备用品的线描示意"},"reading-play":{file:"reading.svg",alt:"绘本与对话的线描示意"}};
if(CONTENT.stageDetails){for(const s of STAGES){const extra=CONTENT.stageDetails[s.id];if(!extra)continue;s.tasks=s.tasks.map((t,i)=>({...t,steps:extra.existingSteps[i],sources:s.sources})).concat(extra.extraTasks);s.conversation=extra.conversation;}}
let storageAvailable=true,saved;
// 第十版使用任务语义 ID；旧版记录只读迁移，保留旧版网站自己的勾选记录。
const STORE_KEY="parenting-together-v10";
try{saved=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem("parenting-together-v5")||localStorage.getItem("parenting-together-v4")||"null");}catch{storageAvailable=false;}
const validSaved=saved&&["pregnancy","baby"].includes(saved.mode)&&Number.isInteger(saved.age)&&saved.age>=(saved.mode==="pregnancy"?1:0)&&saved.age<=(saved.mode==="pregnancy"?42:36);
function taskProgressKey(stage,task){return `${stage.id}:${task.id}`;}
function migrateTaskProgress(progress){
 const migrated={};
 if(!progress||typeof progress!=="object"||Array.isArray(progress))return migrated;
 for(const stage of STAGES){for(const task of stage.tasks){
  const key=taskProgressKey(stage,task);
  // legacyIndex 指向第九版原位置；删除的任务没有映射，后移任务不会冒领其完成记录。
  const oldKey=Number.isInteger(task.legacyIndex)?`${stage.id}-${task.legacyIndex}`:null;
  if(typeof progress[key]==="boolean")migrated[key]=progress[key];
  else if(oldKey&&typeof progress[oldKey]==="boolean")migrated[key]=progress[oldKey];
 }}
 return migrated;
}
let state={schemaVersion:2,mode:validSaved?saved.mode:"pregnancy",age:validSaved?saved.age:28,progress:migrateTaskProgress(validSaved?saved.progress:null)};
let currentStage;
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function sourceLink(key){const s=SOURCES[key];return s?`<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.name)}</a>`:"";}
function findStage(mode,age){return STAGES.find(s=>s.mode===mode&&age>=s.min&&age<=s.max);}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch{storageAvailable=false;}document.querySelector(".local-note").textContent=storageAvailable?"孕周、月龄和勾选记录仅保存在这个浏览器中。":"这个浏览器无法保存勾选记录，本次仍可使用。";}
function guideSnapshot(){return{mode:state.mode,age:state.age,stage:currentStage.title,tasks:currentStage.tasks.map((t,i)=>({index:i,id:t.id,title:t.title,completed:state.progress[taskProgressKey(currentStage,t)]===true})),sources:currentStage.sources.map(k=>SOURCES[k])};}
function updateProgress(){const done=currentStage.tasks.filter(t=>state.progress[taskProgressKey(currentStage,t)]===true).length;const extraDone=currentStage.tasks.slice(3).filter(t=>state.progress[taskProgressKey(currentStage,t)]===true).length;$("more-tasks-summary").textContent=`还有 ${currentStage.tasks.length-3} 件日常事项${extraDone?` · 已勾选 ${extraDone} 项`:""}`;$("progress-count").textContent=`${done} / ${currentStage.tasks.length} 项`;$("progress-fill").style.width=`${done/currentStage.tasks.length*100}%`;const track=$("progress-fill").parentElement;track.setAttribute("aria-valuemax",currentStage.tasks.length);track.setAttribute("aria-valuenow",done);$("progress-message").textContent=done===currentStage.tasks.length?"已勾选本阶段全部事项，之后需要时可以再看。":done?"做过的事可以勾选，需要时再来查看。":"勾选方便记录，日常照护还需要反复做。";}
function taskHTML(t,i){const checked=state.progress[taskProgressKey(currentStage,t)]===true;return `<article class="task-card${checked?" completed":""}"><div class="task-top"><input class="task-check" type="checkbox" id="task-${i}" data-task-index="${i}" data-task-id="${escapeHTML(t.id)}" aria-describedby="task-description-${i}" ${checked?"checked":""}><label for="task-${i}">${escapeHTML(t.title)}</label></div><p class="task-description" id="task-description-${i}">${escapeHTML(t.description)}</p><details><summary>做法与参考</summary><ol>${t.steps.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}</ol><div class="task-ref">参考：${(t.sources||currentStage.sources).map(sourceLink).join(" ")}</div></details></article>`;}
function render(){
 currentStage=findStage(state.mode,state.age);const pregnant=state.mode==="pregnancy";
 $("pregnancy-mode").classList.toggle("selected",pregnant);$("pregnancy-mode").setAttribute("aria-pressed",pregnant);$("baby-mode").classList.toggle("selected",!pregnant);$("baby-mode").setAttribute("aria-pressed",!pregnant);
 $("age-label").textContent=pregnant?"当前孕周":"宝宝月龄";$("age-unit").textContent=pregnant?"周":"个月";$("age-input").min=pregnant?"1":"0";$("age-input").max=pregnant?"42":"36";$("age-input").value=state.age;$("age-hint").textContent=pregnant?"填整数孕周，按产检记录选择。":"填 0–36 个整月；未满 1 月填 0。";
 $("stage-title").textContent=currentStage.title;$("stage-description").textContent=currentStage.description;$("stage-badge").textContent=pregnant?`孕 ${state.age} 周`:`宝宝 ${state.age} 个月`;$("focus-title").textContent=currentStage.focusTitle;
 const imageKey=pregnant?"prenatal-planning":state.age>=12?"reading-play":state.age>=6?"feeding-care":null;
 $("stage-picture").hidden=!imageKey;if(imageKey){$("stage-image").src=`./assets/${IMAGE_INFO[imageKey].file}`;$("stage-image").alt=IMAGE_INFO[imageKey].alt;}
 $("task-list").innerHTML=currentStage.tasks.slice(0,3).map(taskHTML).join("");
 $("extra-task-list").innerHTML=currentStage.tasks.slice(3).map((t,i)=>taskHTML(t,i+3)).join("");
 $("focus-list").innerHTML=currentStage.focus.map(x=>`<li>${escapeHTML(x)}</li>`).join("");$("stage-sources").innerHTML=currentStage.sources.map(sourceLink).join("");
 $("conversation-prompt").textContent=currentStage.conversation;updateProgress();
}

function updateStage(mode,age){if(!["pregnancy","baby"].includes(mode)||!Number.isInteger(age)||age<(mode==="pregnancy"?1:0)||age>(mode==="pregnancy"?42:36))throw new Error("请提供有效阶段与整数孕周或月龄。");state.mode=mode;state.age=age;$("more-tasks").open=false;$("stage-notes").open=false;$("input-error").hidden=true;$("age-input").removeAttribute("aria-invalid");render();persist();return guideSnapshot();}
function setMode(mode){updateStage(mode,mode==="pregnancy"?28:0);}
function switchView(view){if(!["guide","knowledge","research"].includes(view))return;for(const name of ["guide","knowledge","research"]){const selected=name===view;$(name+"-view").hidden=!selected;$(name+"-tab").classList.toggle("active",selected);$(name+"-tab").setAttribute("aria-pressed",selected);}for(const dialog of document.querySelectorAll("dialog[open]")){if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");}window.scrollTo({top:0,behavior:"instant"});if(location.protocol!=="file:")history.replaceState(null,"",view==="guide"?location.pathname+location.search:"#"+view);}
$("pregnancy-mode").addEventListener("click",()=>setMode("pregnancy"));$("baby-mode").addEventListener("click",()=>setMode("baby"));
$("stage-form").addEventListener("submit",e=>{e.preventDefault();const raw=$("age-input").value.trim();try{if(!raw)throw new Error("请输入数值。");updateStage(state.mode,Number(raw));}catch{$("input-error").textContent=state.mode==="pregnancy"?"请输入 1–42 之间的整数孕周。":"请输入 0–36 之间的整数月龄。";$("input-error").hidden=false;$("age-input").setAttribute("aria-invalid","true");$("age-input").focus();}});
document.querySelector(".task-section").addEventListener("change",e=>{if(!e.target.matches("[data-task-index]"))return;const task=currentStage.tasks[Number(e.target.dataset.taskIndex)];if(!task)return;state.progress[taskProgressKey(currentStage,task)]=e.target.checked;e.target.closest(".task-card").classList.toggle("completed",e.target.checked);updateProgress();persist();});
$("reset-progress").addEventListener("click",()=>{currentStage.tasks.forEach(t=>delete state.progress[taskProgressKey(currentStage,t)]);render();persist();$("reset-progress").focus();});
for(const view of ["guide","knowledge","research"]){$(view+"-tab").addEventListener("click",()=>switchView(view));}
document.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b){switchView(b.dataset.view);$(b.dataset.view+"-tab").focus();window.scrollTo({top:0,behavior:"instant"});}});
const MENTAL_STEPS=[
 {name:"发现需要",title:"下一餐还缺什么",text:"看看现有的食材和餐具，留意宝宝现在的进食情况，也考虑谁有时间准备。",bottom:"可以先做：查看余量，记下要补的用品。"},
 {name:"找到方案",title:"把可用的选择找出来",text:"查阅可靠的辅食资料，结合家里已有的食材和孩子的情况整理选择。特殊喂养问题需要向专业人员咨询。",bottom:"可以先做：查资料，列采购单，了解安全要求。"},
 {name:"共同决定",title:"说清楚这餐怎么分工",text:"和伴侣商量谁买菜、谁准备、谁陪餐、谁收拾。把自己的安排说出来，也听听她有什么需要调整。",bottom:"可以先做：确认时间和分工，留出调整的余地。"},
 {name:"检查调整",title:"吃完以后再检查一下",text:"收拾餐具和环境，看看需要补什么。根据宝宝的进食信号和双方的精力，调整下一次的安排。",bottom:"可以先做：清洁、补货，记下需要改变的地方。"}
];
function renderMentalStep(index){
 const s=MENTAL_STEPS[index];
 $("mental-example").innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><p class="example-bottom">${s.bottom}</p>`;
 document.querySelectorAll(".mental-tab").forEach((b,i)=>{b.classList.toggle("active",i===index);b.setAttribute("aria-pressed",i===index);});
}
renderKnowledge();renderResearch();render();persist();if(["knowledge","research"].includes(location.hash.slice(1)))switchView(location.hash.slice(1));
window.addEventListener("hashchange",()=>{if(location.protocol!=="file:")switchView(location.hash.slice(1)||"guide");});
const context=document.modelContext;
if(context?.registerTool){const lifecycle=new AbortController();const tools=[
 {name:"read_parenting_guide",title:"读取当前育儿指南",description:"读取当前阶段、任务、完成进度与来源。",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>guideSnapshot()},
 {name:"set_parenting_stage",title:"选择育儿阶段",description:"选择整数孕周1–42或宝宝月龄0–36，更新页面并保存在本机。",inputSchema:{type:"object",properties:{mode:{type:"string",enum:["pregnancy","baby"]},age:{type:"integer",minimum:0,maximum:42}},required:["mode","age"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||Object.keys(input).some(k=>!["mode","age"].includes(k)))throw new Error("参数无效。");const result=updateStage(input.mode,input.age);switchView("guide");return result;}},
 {name:"set_parenting_task_completed",title:"记录任务完成状态",description:"修改当前阶段一项任务的完成状态，只保存在本机。",inputSchema:{type:"object",properties:{index:{type:"integer",minimum:0,maximum:Math.max(...STAGES.map(s=>s.tasks.length))-1},completed:{type:"boolean"}},required:["index","completed"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||Object.keys(input).some(k=>!["index","completed"].includes(k))||!Number.isInteger(input.index)||input.index<0||input.index>=currentStage.tasks.length||typeof input.completed!=="boolean")throw new Error("参数无效。");state.progress[taskProgressKey(currentStage,currentStage.tasks[input.index])]=input.completed;render();persist();switchView("guide");return guideSnapshot();}}
 ];for(const tool of tools){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}window.addEventListener("pagehide",()=>lifecycle.abort(),{once:true});}

const aboutDialog=$("about-dialog");$("about-button").addEventListener("click",()=>{if(typeof aboutDialog.showModal==="function")aboutDialog.showModal();else aboutDialog.setAttribute("open","");document.body.classList.add("dialog-open");});$("about-close").addEventListener("click",()=>{if(typeof aboutDialog.close==="function")aboutDialog.close();else {aboutDialog.removeAttribute("open");document.body.classList.remove("dialog-open");}});aboutDialog.addEventListener("close",()=>document.body.classList.remove("dialog-open"));
