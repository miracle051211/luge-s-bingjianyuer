"use strict";

/* 每次只读一个主题，完整指南与延伸内容按需打开。 */
function renderKnowledge() {
  const container = $("knowledge-content");
  const topics = CONTENT.knowledge || [];
  const illustrations = [
    ["reading.svg", "绘本与交流线描"],
    ["meal.svg", "餐碗与用品线描"],
    ["sleep.svg", "独立婴儿床线描"],
    ["preparation.svg", "用品与准备清单线描"]
  ];
  const nurturing = [
    ["健康", "安排儿童保健，留意身体情况，及时寻求专业支持。"],
    ["充足营养", "按家庭的喂养方式做好准备、陪餐和清洁。"],
    ["安全与保护", "检查生活环境，在日常照护中留意风险。"],
    ["回应性照护", "观察表情、声音和动作，回应孩子的需要。"],
    ["早期学习", "把说话、游戏和阅读放进每天的相处中。"]
  ];
  let topicIndex = 0;
  let activeDialog = null;
  let returnFocus = null;
  let previousOverflow = "";

  const dialogHead = (id, title) => `<div class="dialog-head"><h2 id="${id}">${title}</h2><button type="button" class="dialog-close" data-knowledge-close aria-label="关闭${title}">关闭 <span aria-hidden="true">×</span></button></div>`;

  container.innerHTML = `
    <div class="topic-tabs" role="tablist" aria-label="日常照护主题">
      ${topics.map((topic, i) => `<button type="button" role="tab" class="topic-tab${i === 0 ? " active" : ""}" id="knowledge-topic-${i}" data-knowledge-topic="${i}" aria-selected="${i === 0}" aria-controls="knowledge-topic-panel" tabindex="${i === 0 ? "0" : "-1"}">${escapeHTML(topic.category)}</button>`).join("")}
    </div>
    <section class="topic-panel" id="knowledge-topic-panel" role="tabpanel" aria-labelledby="knowledge-topic-0" tabindex="0"></section>
    <section class="knowledge-extension" aria-labelledby="knowledge-extension-title">
      <h2 id="knowledge-extension-title">延伸阅读</h2>
      <div class="extension-options">
        <button type="button" class="extension-button" data-knowledge-dialog="mental" aria-haspopup="dialog">一餐辅食如何分工 <span aria-hidden="true">↗</span></button>
        <button type="button" class="extension-button" data-knowledge-dialog="nurturing" aria-haspopup="dialog">养育照护的五个方面 <span aria-hidden="true">↗</span></button>
        <button type="button" class="extension-button" data-knowledge-dialog="reading" aria-haspopup="dialog">共读时怎样回应孩子 <span aria-hidden="true">↗</span></button>
      </div>
    </section>
    <p class="knowledge-note">课程小组依据公开指南整理。涉及个体健康和特殊喂养时，请听取专业人员建议。</p>
    <dialog class="article-dialog knowledge-dialog" id="knowledge-mental-dialog" aria-labelledby="knowledge-mental-title">
      ${dialogHead("knowledge-mental-title", "以一餐辅食为例")}
      <div class="dialog-body mental-model">
        <div class="mental-intro"><p>喂饭之前要记得买菜，吃完还要清洁和补货。这些准备与安排，也可以一起分工。点选下面的环节，看看各自要留意什么。</p><img src="./assets/meal.svg" width="300" height="200" alt="一餐辅食的用品示意"></div>
        <div class="mental-tabs" aria-label="规划劳动的四个环节">${MENTAL_STEPS.map((step, i) => `<button class="mental-tab${i === 0 ? " active" : ""}" type="button" data-mental="${i}" aria-pressed="${i === 0}"><small>0${i + 1}</small><strong>${escapeHTML(step.name)}</strong></button>`).join("")}</div>
        <div class="mental-example" id="mental-example" aria-live="polite"></div>
        <p class="source-footnote">四个环节参考 Daminger（2019）对家庭认知劳动的分析；辅食流程是课程小组整理的例子。${sourceLink("daminger")}</p>
      </div>
    </dialog>
    <dialog class="article-dialog knowledge-dialog" id="knowledge-nurturing-dialog" aria-labelledby="knowledge-nurturing-title">
      ${dialogHead("knowledge-nurturing-title", "养育照护的五个方面")}
      <div class="dialog-body"><p class="source-footnote">WHO、UNICEF 等机构在 2018 年框架中提出这五个方面。它们需要一起考虑，并不是给孩子打分的指标。${sourceLink("nurturing")}</p><div class="nurturing-grid">${nurturing.map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></div>
    </dialog>
    <dialog class="article-dialog knowledge-dialog" id="knowledge-reading-dialog" aria-labelledby="knowledge-reading-title">
      ${dialogHead("knowledge-reading-title", "读绘本时，给孩子留一点时间")}
      <div class="dialog-body reading-feature"><figure><img src="./assets/reading.svg" width="300" height="200" alt="绘本与对话线描"></figure><div><p>孩子指向一页时，可以停下来，听听他的声音或表达。一起描述画面，或者模仿书里的声音。累了就休息，不必每次都把书读完。</p><p class="source-footnote">延伸阅读：${sourceLink("play")} ${sourceLink("development")}</p></div></div>
    </dialog>`;

  function selectTopic(index, focusTab = false) {
    if (!Number.isInteger(index) || index < 0 || index >= topics.length) return;
    topicIndex = index;
    const topic = topics[index];
    const [file, alt] = illustrations[index] || illustrations[0];
    const panel = $("knowledge-topic-panel");
    panel.setAttribute("aria-labelledby", `knowledge-topic-${index}`);
    panel.dataset.topicIndex = index;
    panel.innerHTML = `<div class="content-split"><div class="topic-main"><p class="section-kicker">日常照护 · ${escapeHTML(topic.category)}</p><h2>${escapeHTML(topic.title)}</h2><p class="topic-principle">${escapeHTML(topic.principle)}</p><ol class="inline-actions">${topic.actions.map(action => `<li>${escapeHTML(action)}</li>`).join("")}</ol><details class="knowledge-sources"><summary>资料依据 <span>${topic.sources.length} 个来源</span></summary><div class="source-links">${topic.sources.map(sourceLink).join(" ")}</div></details></div><figure class="topic-illustration"><img src="./assets/${file}" width="300" height="200" alt="${alt}"></figure></div>`;
    container.querySelectorAll("[data-knowledge-topic]").forEach((tab, i) => {
      const selected = i === index;
      tab.classList.toggle("active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) tab.focus();
    });
  }

  function finishDialog(dialog) {
    dialog.removeAttribute("data-fallback-open");
    if (activeDialog !== dialog) return;
    document.body.style.overflow = previousOverflow;
    activeDialog = null;
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({preventScroll: true});
    returnFocus = null;
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (dialog.open && typeof dialog.close === "function") { dialog.close(); finishDialog(dialog); }
    else { dialog.removeAttribute("open"); finishDialog(dialog); }
  }

  function openDialog(name, trigger) {
    const dialog = $(`knowledge-${name}-dialog`);
    if (!dialog) return;
    if (activeDialog) closeDialog(activeDialog);
    returnFocus = trigger;
    previousOverflow = document.body.style.overflow;
    activeDialog = dialog;
    try {
      if (typeof dialog.showModal !== "function") throw new Error("Dialog fallback");
      dialog.showModal();
    } catch {
      dialog.setAttribute("open", "");
      dialog.setAttribute("data-fallback-open", "");
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
    }
    document.body.style.overflow = "hidden";
    dialog.querySelector("[data-knowledge-close]").focus({preventScroll: true});
  }

  container.querySelectorAll(".knowledge-dialog").forEach(dialog => {
    if (typeof dialog.open !== "boolean") {
      Object.defineProperty(dialog, "open", {get() { return dialog.hasAttribute("open"); }});
    }
    dialog.addEventListener("close", () => finishDialog(dialog));
    dialog.addEventListener("cancel", event => { event.preventDefault(); closeDialog(dialog); });
    // Preserve the same close interface for browsers without native dialog support.
    if (typeof dialog.close !== "function") {
      dialog.close = function () { dialog.removeAttribute("open"); finishDialog(dialog); };
    }
  });

  container.addEventListener("click", event => {
    const topic = event.target.closest("[data-knowledge-topic]");
    if (topic) { selectTopic(Number(topic.dataset.knowledgeTopic)); return; }
    const mental = event.target.closest("[data-mental]");
    if (mental) { renderMentalStep(Number(mental.dataset.mental)); return; }
    const opener = event.target.closest("[data-knowledge-dialog]");
    if (opener) { openDialog(opener.dataset.knowledgeDialog, opener); return; }
    const closer = event.target.closest("[data-knowledge-close]");
    if (closer) closeDialog(closer.closest("dialog"));
  });

  container.addEventListener("keydown", event => {
    const tab = event.target.closest("[data-knowledge-topic]");
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? topics.length - 1 : (topicIndex + (event.key === "ArrowRight" ? 1 : -1) + topics.length) % topics.length;
    selectTopic(next, true);
  });

  document.addEventListener("keydown", event => {
    if (!activeDialog) return;
    if (event.key === "Escape") { event.preventDefault(); closeDialog(activeDialog); return; }
    if (event.key !== "Tab") return;
    const items = Array.from(activeDialog.querySelectorAll("button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex='-1'])")).filter(item => !item.disabled && item.getClientRects().length);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  });

  selectTopic(0);
  renderMentalStep(0);
}
