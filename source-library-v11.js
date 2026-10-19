"use strict";

// The research view now has one bookshelf. This small source index supports
// checking the handbook's citations without bringing back the chart panels.
function renderResearch(){
 const host=document.getElementById("research-content");
 if(!host)return;
 const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const records=Object.entries(SOURCES).map(([id,source])=>({id,...source,category:source.category||"英文 · 官方照护资料"}));
 const categoryFor=record=>record.category.startsWith("中文")?"chinese":record.category.includes("官方")?"official":"research";
 const groups=[{id:"all",label:"全部来源"},{id:"chinese",label:"中文官方资料"},{id:"official",label:"英文官方资料"},{id:"research",label:"研究文献"}];
 const pageSize=5;
 let query="",category="all",page=1,opener=null,previousOverflow="",isOpen=false;
 host.innerHTML=`<dialog class="article-dialog source-library-dialog" id="research-dialog" aria-labelledby="research-dialog-title"><header class="dialog-head"><div><h2 id="research-dialog-title">资料来源</h2><p>手册与书架的 ${records.length} 个原始入口，按需查找。</p></div><button type="button" class="dialog-close" data-research-close aria-label="关闭资料来源">关闭 ×</button></header><div class="dialog-body" id="research-dialog-body"><div class="research-library-tools"><label for="research-library-search">搜索资料<input id="research-library-search" type="search" placeholder="标题、机构、作者或关键词"></label><label for="research-library-category">资料类型<select id="research-library-category">${groups.map(g=>`<option value="${g.id}">${g.label}</option>`).join("")}</select></label></div><div class="research-library-list" id="research-library-results"></div><div class="research-pagination"><button id="research-library-prev" type="button">上一页</button><span class="research-library-status" id="research-library-status" aria-live="polite"></span><button id="research-library-next" type="button">下一页</button></div></div></dialog>`;
 const dialog=document.getElementById("research-dialog");
 const search=document.getElementById("research-library-search");
 const categorySelect=document.getElementById("research-library-category");
 function renderResults(){
  const filtered=records.filter(record=>(category==="all"||categoryFor(record)===category)&&`${record.name} ${record.note||""} ${record.category} ${record.citation||""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  page=Math.min(page,totalPages);
  const visible=filtered.slice((page-1)*pageSize,page*pageSize);
  document.getElementById("research-library-results").innerHTML=visible.length?visible.map(record=>`<article class="research-library-item" data-source-id="${escape(record.id)}"><p class="study-type">${escape(record.category)}</p><h3><a href="${escape(record.url)}" target="_blank" rel="noopener noreferrer">${escape(record.name)} ↗</a></h3><p>${escape(record.note||"")}</p>${record.citation?`<details><summary>引用信息</summary><p>${escape(record.citation)}</p></details>`:""}</article>`).join(""):'<p class="research-empty">没有匹配的资料，试试其他关键词或分类。</p>';
  document.getElementById("research-library-status").textContent=`${filtered.length} 个来源 · ${page} / ${totalPages} 页`;
  document.getElementById("research-library-prev").disabled=page===1;
  document.getElementById("research-library-next").disabled=page===totalPages;
 }
 function finishClose(){
  if(!isOpen)return;
  isOpen=false;
  document.body.style.overflow=previousOverflow;
  dialog.removeAttribute("data-dialog-fallback");
  dialog.removeAttribute("aria-modal");
  if(opener?.isConnected)opener.focus({preventScroll:true});
  opener=null;
 }
 function close(){
  if(typeof dialog.close==="function")dialog.close();
  else dialog.removeAttribute("open");
  finishClose();
 }
 function open(trigger){
  if(isOpen)return;
  opener=trigger||document.activeElement;
  previousOverflow=document.body.style.overflow;
  query="";category="all";page=1;search.value="";categorySelect.value="all";
  renderResults();
  isOpen=true;
  if(typeof dialog.showModal==="function")dialog.showModal();
  else{dialog.setAttribute("open","");dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.dataset.dialogFallback="true";}
  document.body.style.overflow="hidden";
  dialog.querySelector("[data-research-close]").focus({preventScroll:true});
 }
 search.addEventListener("input",event=>{query=event.target.value.trim();page=1;renderResults();});
 categorySelect.addEventListener("change",event=>{category=event.target.value;page=1;renderResults();});
 document.getElementById("research-library-prev").addEventListener("click",()=>{page=Math.max(1,page-1);renderResults();});
 document.getElementById("research-library-next").addEventListener("click",()=>{page+=1;renderResults();});
 dialog.querySelector("[data-research-close]").addEventListener("click",close);
 dialog.addEventListener("close",()=>{if(!dialog.open)finishClose();});
 dialog.addEventListener("cancel",event=>{event.preventDefault();close();});
 dialog.addEventListener("click",event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();});
 dialog.addEventListener("keydown",event=>{
  if(event.key==="Escape"){event.preventDefault();close();return;}
  if(event.key!=="Tab"||!dialog.dataset.dialogFallback)return;
  const nodes=[...dialog.querySelectorAll('button:not([disabled]),a[href],input,select,summary')].filter(node=>node.getClientRects().length);
  const first=nodes[0],last=nodes.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 });
 window.PARENTING_SOURCE_LIBRARY=Object.freeze({count:records.length,open});
}
