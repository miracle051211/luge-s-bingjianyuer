"use strict";
(() => {
 const catalog=window.PARENTING_LIBRARY;
 const host=document.getElementById("research-content");
 if(!catalog?.books?.length||!host)return;
 const books=catalog.books;
 const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const groups=[{id:"all",name:"全部"},{id:"leave",name:"育儿假"},{id:"planning",name:"家庭分工"},{id:"care",name:"照护指南"},{id:"development",name:"儿童发展"},{id:"framework",name:"理论框架"}];
 const tones={leave:"#2D4F81",planning:"#826855",care:"#427684",development:"#5E7566",framework:"#655F7B"};
 const smallScreen=matchMedia("(max-width:760px)");
 const reduced=matchMedia("(prefers-reduced-motion:reduce)");
 let group="all",query="",rowCleanups=[];
 const shelfFamilies=[{id:"research",title:"研究文献 · 方法与证据",empty:"这个主题暂无匹配的研究文献。"},{id:"official",title:"公开指南 · 日常照护",empty:"这个主题暂无匹配的公开指南。"}];
 const familyOf=book=>["research","official"].includes(book.editionFamily)?book.editionFamily:(book.type||"").includes("指南")?"official":"research";
 const isChinese=book=>book.languageCode==="zh"||(!book.languageCode&&(book.language||"").includes("中文"));
 const languageLabel=book=>book.languageCode==="zh"?"中文原文":book.languageCode==="en"?"英文原文":(book.language?book.language+"原文":"原文");
 const libraryHeader=document.createElement("div");
 libraryHeader.className="library-header";
 libraryHeader.innerHTML='<span>研究与指南 · 本地阅读</span><button type="button" class="library-source-entry" id="library-source-entry">资料来源 ↗</button>';
 const sourceCount=window.PARENTING_SOURCE_LIBRARY?.count;
 if(Number.isInteger(sourceCount))libraryHeader.querySelector("button").textContent=sourceCount+" 个资料来源 ↗";
 const shelf=document.createElement("section");
 shelf.id="library-shelf";
 shelf.setAttribute("aria-label","可翻页的文献书架");
 shelf.innerHTML=`<div class="library-tools"><div class="library-filters" role="group" aria-label="按主题选文献">${groups.map(g=>`<button type="button" class="library-filter" data-library-group="${g.id}" aria-pressed="${g.id==="all"}">${g.name}</button>`).join("")}</div><div class="library-search"><label for="library-book-search">搜索文献标题、作者或主题</label><input type="search" id="library-book-search" placeholder="搜索标题、作者或主题"></div></div><div class="library-result-line"><p id="library-results-status" aria-live="polite"></p><span class="library-result-hint">左右滑动选书 · 点封面翻看原文</span></div><div class="library-shelves" id="library-shelves"></div><div class="library-bottom"><p>封面是小组导读设计；翻页内含真实原文选页。每份资料保留完整 PDF、原始出处与版本说明。</p></div>`;
 host.before(libraryHeader,shelf);
 function bookButton(book){
  return `<button type="button" class="shelf-book" data-open-book="${escape(book.id)}" aria-label="翻阅${escape(book.shortTitle)}，${escape(book.author)}，${escape(book.year)}，${escape(languageLabel(book))}"><span class="book-jacket" style="--book-color:${tones[book.group]||tones.care}"><span class="book-jacket-top"><span>${escape(book.type)}<span class="book-language">${escape(languageLabel(book))}</span></span><span>${escape(book.year)}</span></span><span class="book-jacket-title">${escape(book.shortTitle)}</span><span class="book-page-thumb"><img src="${escape(book.cover)}" alt="${escape(book.shortTitle)}原文首页缩略图" width="900" height="1270" loading="lazy" draggable="false"></span><span class="book-jacket-author">${escape(book.author)}</span><span class="book-open-hint" aria-hidden="true">打开 ↗</span></span></button>`;
 }
 function bindShelfRow(row){
  const track=row.querySelector(".shelf-books");
  const previous=row.querySelector('[data-shelf-scroll="previous"]'),next=row.querySelector('[data-shelf-scroll="next"]');
  const range=row.querySelector(".shelf-row-range"),items=[...track.querySelectorAll(".shelf-book")];
  let frame=0,drag=null,suppressClick=false,clickTimer=0;
  const maxScroll=()=>Math.max(0,track.scrollWidth-track.clientWidth);
  function sync(){
   const max=maxScroll(),left=Math.max(0,Math.min(max,track.scrollLeft));
   const canLeft=left>2,canRight=left<max-2;
   row.dataset.canScrollLeft=String(canLeft);row.dataset.canScrollRight=String(canRight);
   previous.disabled=!canLeft;next.disabled=!canRight;
   if(!items.length){range.textContent="0 本";return;}
   if(!track.clientWidth){range.textContent=items.length+" 本";return;}
   const viewport=track.getBoundingClientRect();
   const visible=items.map((item,index)=>({index,rect:item.getBoundingClientRect()})).filter(item=>item.rect.width>0&&item.rect.right>viewport.left+3&&item.rect.left<viewport.right-3);
   range.textContent=visible.length?`${visible[0].index+1}–${visible.at(-1).index+1} / ${items.length}`:items.length+" 本";
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(sync);}
  function scrollTo(left,instant=false){
   const target=Math.max(0,Math.min(maxScroll(),left));
   if(typeof track.scrollTo==="function")track.scrollTo({left:target,behavior:instant||reduced.matches?"auto":"smooth"});
   else track.scrollLeft=target;
   schedule();
  }
  function nudge(direction){scrollTo(track.scrollLeft+direction*Math.max(170,track.clientWidth*.78));}
  function reveal(item){
   if(!item||!track.clientWidth)return;
   const viewport=track.getBoundingClientRect(),rect=item.getBoundingClientRect();
   if(rect.left<viewport.left+9)scrollTo(track.scrollLeft+rect.left-viewport.left-9,true);
   else if(rect.right>viewport.right-9)scrollTo(track.scrollLeft+rect.right-viewport.right+9,true);
  }
  previous.addEventListener("click",()=>nudge(-1));next.addEventListener("click",()=>nudge(1));
  track.addEventListener("scroll",schedule,{passive:true});
  track.addEventListener("focusin",event=>reveal(event.target.closest(".shelf-book")));
  track.addEventListener("keydown",event=>{
   if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
   if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
   const index=items.indexOf(event.target.closest(".shelf-book"));
   if(index>=0){
    const target=event.key==="Home"?0:event.key==="End"?items.length-1:Math.max(0,Math.min(items.length-1,index+(event.key==="ArrowLeft"?-1:1)));
    event.preventDefault();items[target].focus({preventScroll:true});reveal(items[target]);
   }else if(event.target===track){event.preventDefault();if(event.key==="Home"||event.key==="End")scrollTo(event.key==="Home"?0:maxScroll());else nudge(event.key==="ArrowLeft"?-1:1);}
  });
  track.addEventListener("pointerdown",event=>{
   if(event.pointerType!=="mouse"||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||maxScroll()<=2)return;
   drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft,active:false};
  });
  track.addEventListener("pointermove",event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const dx=event.clientX-drag.x;
   if(!drag.active&&Math.abs(dx)<7)return;
   if(!drag.active){drag.active=true;track.classList.add("is-dragging");try{track.setPointerCapture?.(event.pointerId);}catch{}}
   event.preventDefault();track.scrollLeft=Math.max(0,Math.min(maxScroll(),drag.left-dx));schedule();
  });
  function finishDrag(blockClick){
   if(!drag)return;
   const ending=drag;drag=null;track.classList.remove("is-dragging");
   if(ending.active&&blockClick){suppressClick=true;clearTimeout(clickTimer);clickTimer=setTimeout(()=>{suppressClick=false;},0);}
   try{if(track.hasPointerCapture?.(ending.id))track.releasePointerCapture(ending.id);}catch{}
   schedule();
  }
  track.addEventListener("pointerup",()=>finishDrag(true));
  track.addEventListener("pointercancel",()=>finishDrag(false));
  track.addEventListener("lostpointercapture",()=>finishDrag(false));
  track.addEventListener("dragstart",event=>event.preventDefault());
  track.addEventListener("click",event=>{if(suppressClick){suppressClick=false;event.preventDefault();event.stopPropagation();}},true);
  const observer=typeof ResizeObserver==="function"?new ResizeObserver(schedule):null;
  observer?.observe(track);
  sync();schedule();
  return {sync:schedule,destroy:()=>{finishDrag(false);observer?.disconnect();cancelAnimationFrame(frame);clearTimeout(clickTimer);}};
 }
 function renderShelf(){
  rowCleanups.forEach(row=>row.destroy());rowCleanups=[];
  const filtered=books.filter(b=>(group==="all"||b.group===group)&&`${b.title} ${b.shortTitle} ${b.author} ${b.summary} ${b.language}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const counts={research:0,official:0};
  const rows=shelfFamilies.map(family=>{
   const row=filtered.filter(book=>familyOf(book)===family.id);
   if(family.id==="official")row.sort((a,b)=>Number(isChinese(b))-Number(isChinese(a)));
   counts[family.id]=row.length;
   return `<section class="shelf-row" data-shelf-family="${family.id}" data-can-scroll-left="false" data-can-scroll-right="false" aria-labelledby="shelf-title-${family.id}"><div class="shelf-row-heading"><h2 class="shelf-row-title" id="shelf-title-${family.id}">${family.title}<span class="shelf-row-count">${row.length} 本</span></h2><div class="shelf-row-controls" role="group" aria-label="${family.title}滚动"><button type="button" class="shelf-scroll-button" data-shelf-scroll="previous" aria-label="向左查看${family.id==="research"?"研究文献":"公开指南"}" aria-controls="shelf-track-${family.id}" disabled>←</button><span class="shelf-row-range" aria-label="当前可见文献范围">${row.length} 本</span><button type="button" class="shelf-scroll-button" data-shelf-scroll="next" aria-label="向右查看${family.id==="research"?"研究文献":"公开指南"}" aria-controls="shelf-track-${family.id}" disabled>→</button></div></div><div class="shelf-scroll-window"><div class="shelf-books" id="shelf-track-${family.id}" ${row.length?'tabindex="0"':""} role="group" aria-label="${family.title}，可左右滚动">${row.map(bookButton).join("")}</div>${row.length?"":`<p class="shelf-row-empty">${family.empty}</p>`}</div></section>`;
  });
  document.getElementById("library-shelves").innerHTML=rows.join("");
  document.getElementById("library-results-status").textContent=`${filtered.length} 份文献 · 研究 ${counts.research} 本 / 指南 ${counts.official} 本 · 完整 PDF 已存本地`;
  shelf.querySelectorAll("[data-library-group]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.libraryGroup===group)));
  rowCleanups=[...shelf.querySelectorAll(".shelf-row")].map(bindShelfRow);
 }
 libraryHeader.querySelector("button").addEventListener("click",event=>{
  window.PARENTING_SOURCE_LIBRARY?.open(event.currentTarget);
 });
 shelf.addEventListener("click",event=>{
  const filter=event.target.closest("[data-library-group]");
  if(filter){group=filter.dataset.libraryGroup;renderShelf();return;}
  const book=event.target.closest("[data-open-book]");
  if(book){openBook(books.find(b=>b.id===book.dataset.openBook),book);return;}
 });
 document.getElementById("library-book-search").addEventListener("input",event=>{query=event.target.value.trim();renderShelf();});
 smallScreen.addEventListener("change",()=>{rowCleanups.forEach(row=>row.sync());if(reader.open)resizeCurrent();});
 window.addEventListener("resize",()=>rowCleanups.forEach(row=>row.sync()));
 new MutationObserver(()=>rowCleanups.forEach(row=>row.sync())).observe(document.getElementById("research-view"),{attributes:true,attributeFilter:["hidden"]});
 renderShelf();
 const reader=document.createElement("dialog");
 reader.className="book-reader";
 reader.id="book-reader";
 reader.setAttribute("aria-labelledby","reader-title");
 reader.innerHTML='<header class="reader-heading"><div><h2 id="reader-title"></h2><p class="reader-metadata" id="reader-metadata"></p></div><button type="button" id="reader-close" class="dialog-close" aria-label="关闭文献阅读">关闭 ×</button></header><p class="reader-selection-note" id="reader-selection-note"></p><div class="reader-stage" id="reader-stage"></div><div class="reader-controls"><button id="reader-previous" type="button" aria-label="上一页文献">← 上一页</button><span class="reader-page-status" id="reader-page-status" aria-live="polite"></span><button id="reader-next" type="button" aria-label="下一页文献">下一页 →</button><label class="reader-page-input" for="reader-page-jump"><span>跳到</span><input id="reader-page-jump" type="range" min="1" max="10" step="1" value="2" aria-label="翻到阅读册第几页"></label></div><footer class="reader-actions"><div class="reader-actions-links"><a id="reader-pdf" href="#" download>下载完整 PDF</a><a id="reader-source" href="#" target="_blank" rel="noopener noreferrer">原始出处 ↗</a><a id="reader-zoom" href="#" target="_blank" rel="noopener noreferrer">放大当前原文页 ↗</a></div><span class="reader-touch-hint">可点页角翻页，也可使用左右方向键</span><div class="reader-display-toggle" role="group" aria-label="阅读排版"><button id="reader-single" type="button" aria-pressed="false">单页</button><button id="reader-double" type="button" aria-pressed="true">双页</button></div></footer>';
 document.getElementById("research-view").append(reader);
 const stage=document.getElementById("reader-stage");
 const cache=new Map();
 let current=null,returnFocus=null,previousOverflow="",open=false,preferredDisplay="double",resizeFrame=0;
 function pageHTML(book){
  const cover=`<article class="flip-page reader-cover-page" style="--book-color:${tones[book.group]||tones.care}"><p class="reader-cover-type">${escape(book.type)} · ${escape(book.year)}</p><h3>${escape(book.shortTitle)}</h3><p class="reader-cover-author">${escape(book.author)}</p><img src="${escape(book.cover)}" alt="原文首页缩略图"><p class="guide-page-footer">并肩育儿 · 文献阅读册<br>导读封面由课程小组整理；完整原文另附。</p></article>`;
  const guide=`<article class="flip-page reader-guide-page"><p class="book-page-kicker">小组导读 / 非原文译页</p><h3>${escape(book.shortTitle)}</h3><p>${escape(book.summary)}</p><h4>带着这个重点读</h4><p>${escape(book.readingFocus)}</p>${book.versionNote?`<p class="version-note">${escape(book.versionNote)}</p>`:""}<p class="guide-page-footer">${escape(book.title)}<br>${escape(book.author)} · ${escape(book.year)}<br>本册展示 ${book.previewPages.length} 个原文选页，完整 PDF 共 ${book.pageCount} 页。</p></article>`;
  const pages=book.previewPages.map((src,index)=>`<figure class="flip-page paper-page"><img src="${escape(src)}" alt="${escape(book.shortTitle)}原文PDF第${book.previewPageNumbers?.[index]??index+1}页" loading="lazy" decoding="async"><figcaption>原文 PDF 第 ${book.previewPageNumbers?.[index]??index+1} 页 · ${escape(book.language)} · 原样选页</figcaption></figure>`).join("");
  const back=`<article class="flip-page reader-guide-page"><p class="book-page-kicker">继续阅读</p><h3>回到完整原文</h3><p>这份阅读册展示了导读和原文选页。完整 PDF 与原始出处在阅读窗口下方，章节、脚注和参考文献请以原文为准。</p><h4>版本与使用</h4><p>${escape(book.licenseNote)}</p>${book.versionNote?`<p class="version-note">${escape(book.versionNote)}</p>`:""}<p class="guide-page-footer">${escape(book.author)} · ${escape(book.year)}<br>课程小组于 2026.10.10 核对并保存。</p></article>`;
  return cover+guide+pages+back;
 }
 function entryFor(book){
  if(cache.has(book.id))return cache.get(book.id);
  const entry={book,page:2,total:book.previewPages.length+3,turn:null,plain:null,engine:null,display:"double"};
  cache.set(book.id,entry);return entry;
 }
 function displayMode(){return smallScreen.matches?"single":preferredDisplay;}
 function dimensions(display){
  const rect=stage.getBoundingClientRect();
  const maxWidth=Math.max(1,rect.width-32),maxHeight=Math.max(1,rect.height-20);
  const ratio=display==="single"?.707:1.414;
  const height=Math.floor(Math.min(maxHeight,maxWidth/ratio));
  return {width:Math.floor(height*ratio),height};
 }
 function currentViews(){
  if(current.engine==="turn")return window.jQuery(current.turn).turn("view").filter(n=>n>0&&n<=current.total);
  if(current.display==="single")return [current.page];
  const left=current.page%2===0?current.page:current.page-1;
  return [left,left+1].filter(n=>n>0&&n<=current.total);
 }
 function syncReader(){
  if(!current)return;
  const views=currentViews();
  const label=views.length>1?views.join("–"):String(views[0]||current.page);
  document.getElementById("reader-page-status").textContent=`阅读册 ${label} / ${current.total} 页`;
  document.getElementById("reader-page-jump").value=current.page;
  document.getElementById("reader-previous").disabled=Math.min(...views)<=1;
  document.getElementById("reader-next").disabled=Math.max(...views)>=current.total;
  const original=views.find(page=>page>=3&&page<current.total);
  const zoom=document.getElementById("reader-zoom");
  zoom.hidden=!original;
  if(original)zoom.href=current.book.previewPages[original-3];
  document.getElementById("reader-single").setAttribute("aria-pressed",String(current.display==="single"));
  document.getElementById("reader-double").setAttribute("aria-pressed",String(current.display==="double"));
 }
 function showPlain(){
  if(!current.plain){
   current.plain=document.createElement("div");current.plain.className="book-instance plain-instance";
   current.plain.innerHTML=pageHTML(current.book);stage.append(current.plain);
  }
  const views=currentViews();
  current.plain.dataset.display=current.display;
  [...current.plain.children].forEach((page,index)=>page.classList.toggle("plain-visible",views.includes(index+1)));
 }
 function configureCurrent(){
  if(!current||!open)return;
  if(current.engine==="turn"&&current.turn){
   const activeBook=window.jQuery(current.turn);
   activeBook.turn("stop");current.page=activeBook.turn("page");
  }
  const targetPage=current.page;
  current.display=displayMode();
  const useTurn=!reduced.matches&&typeof window.jQuery?.fn?.turn==="function";
  const size=dimensions(current.display);
  if(useTurn){
   if(!current.turn){
    const entry=current;
    entry.turn=document.createElement("div");entry.turn.className="book-instance turn-instance";
    entry.turn.innerHTML=pageHTML(entry.book);stage.append(entry.turn);
    try{window.jQuery(entry.turn).turn({width:size.width,height:size.height,display:entry.display,page:entry.page,gradients:true,acceleration:true,duration:650,when:{turned:(event,page)=>{entry.page=page;if(current===entry)syncReader();}}});}
    catch(error){entry.turn.remove();entry.turn=null;entry.engine="plain";}
   }
   if(current.turn){
    current.engine="turn";current.turn.hidden=false;
    const book=window.jQuery(current.turn);
    book.turn("stop");book.turn("disable",false);book.turn("display",current.display);book.turn("size",size.width,size.height);book.turn("page",targetPage);
   }
  }
  if(!useTurn||!current.turn){current.engine="plain";showPlain();current.plain.hidden=false;current.plain.style.width=size.width+"px";current.plain.style.height=size.height+"px";}
  if(current.engine==="turn"&&current.plain)current.plain.hidden=true;
  if(current.engine==="plain"&&current.turn){window.jQuery(current.turn).turn("stop");window.jQuery(current.turn).turn("disable",true);current.turn.hidden=true;}
  reader.dataset.engine=current.engine;
  document.querySelector(".reader-touch-hint").hidden=current.engine!=="turn";
  syncReader();
 }
 function resizeCurrent(){
  cancelAnimationFrame(resizeFrame);
  resizeFrame=requestAnimationFrame(configureCurrent);
 }
 function openBook(book,trigger){
  if(!book)return;
  returnFocus=trigger;previousOverflow=document.body.style.overflow;
  current=entryFor(book);
  stage.querySelectorAll(".book-instance").forEach(instance=>instance.hidden=true);
  document.getElementById("reader-title").textContent=book.shortTitle;
  document.getElementById("reader-metadata").textContent=`${book.author} · ${book.year} · ${book.type} · ${book.language}`;
  document.getElementById("reader-selection-note").textContent=`${book.previewNote} · ${book.previewPages.length} 个选页 · 完整 PDF ${book.pageCount} 页。前两页为课程小组封面与导读。`;
  document.getElementById("reader-pdf").href=book.localPDF;
  document.getElementById("reader-pdf").download=book.id+".pdf";
  document.getElementById("reader-source").href=book.sourceURL;
  document.getElementById("reader-page-jump").max=current.total;
  open=true;
  if(typeof reader.showModal==="function")reader.showModal();
  else {reader.setAttribute("open","");reader.setAttribute("role","dialog");reader.setAttribute("aria-modal","true");reader.dataset.fallbackOpen="true";}
  document.body.style.overflow="hidden";
  configureCurrent();
  document.getElementById("reader-close").focus({preventScroll:true});
 }
 function finishClose(){
  if(!open)return;
  open=false;cancelAnimationFrame(resizeFrame);
  if(current?.turn){
   const activeBook=window.jQuery(current.turn);
   activeBook.turn("stop");
   if(current.engine==="turn")current.page=activeBook.turn("page");
   activeBook.turn("disable",true);
  }
  document.body.style.overflow=previousOverflow;
  reader.removeAttribute("data-fallback-open");reader.removeAttribute("aria-modal");
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  returnFocus=null;
 }
 function closeReader(){
  if(typeof reader.close==="function")reader.close();else reader.removeAttribute("open");
  finishClose();
 }
 function goToPage(page){
  if(!current)return;
  const target=Math.min(current.total,Math.max(1,Number(page)));
  if(current.engine==="turn"){window.jQuery(current.turn).turn("stop");window.jQuery(current.turn).turn("page",target);}
  else {current.page=target;showPlain();syncReader();}
 }
 function turnPage(direction){
  if(!current)return;
  if(current.engine==="turn"){window.jQuery(current.turn).turn("stop");window.jQuery(current.turn).turn(direction<0?"previous":"next");}
  else {const views=currentViews();goToPage(direction<0?Math.min(...views)-1:Math.max(...views)+1);}
 }
 document.getElementById("reader-close").addEventListener("click",closeReader);
 document.getElementById("reader-previous").addEventListener("click",()=>turnPage(-1));
 document.getElementById("reader-next").addEventListener("click",()=>turnPage(1));
 document.getElementById("reader-page-jump").addEventListener("change",event=>goToPage(event.target.value));
 for(const display of ["single","double"])document.getElementById("reader-"+display).addEventListener("click",()=>{preferredDisplay=display;configureCurrent();});
 reader.addEventListener("close",finishClose);
 reader.addEventListener("cancel",event=>{event.preventDefault();closeReader();});
 reader.addEventListener("click",event=>{if(event.target===reader){const rect=reader.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeReader();}});
 reader.addEventListener("keydown",event=>{
  if(event.key==="Escape"){event.preventDefault();closeReader();return;}
  if(!event.target.matches("input,select,textarea")&&["ArrowLeft","ArrowRight"].includes(event.key)){event.preventDefault();turnPage(event.key==="ArrowLeft"?-1:1);return;}
  if(event.key==="Tab"&&reader.dataset.fallbackOpen){
   const nodes=[...reader.querySelectorAll('button:not([disabled]),a[href]:not([hidden]),input')].filter(el=>el.getClientRects().length);
   const first=nodes[0],last=nodes.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 window.addEventListener("resize",()=>{if(open)resizeCurrent();});
 reduced.addEventListener("change",()=>{if(open)configureCurrent();});
})();
