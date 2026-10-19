"use strict";
(() => {
 const motion = matchMedia("(prefers-reduced-motion:reduce)");
 const groups = [...document.querySelectorAll("[data-typewriter]")];
 const timers = new Set();
 const allCharacters = [];
 let finished = false;
 function schedule(callback, delay) {
  const timer = setTimeout(() => {
   timers.delete(timer);
   if (!finished) callback();
  }, delay);
  timers.add(timer);
 }
 function finish() {
  finished = true;
  timers.forEach(clearTimeout);
  timers.clear();
  allCharacters.forEach(char => { char.dataset.revealed = "true"; delete char.dataset.current; });
  groups.forEach(group => { group.classList.remove("typewriter-running"); group.dataset.typing = "complete"; });
 }
 if (motion.matches || document.hidden) { finish(); return; }

 // Prepare all text before scheduling any reveal, keeping every character's space reserved.
 const prepared = groups.map(group => {
  const isTitle = group.dataset.typePriority === "title";
  const sourceLines = [...group.querySelectorAll("[data-type-line]")];
  const lines = sourceLines.length ? sourceLines.map(line => line.textContent) : [group.textContent.trim()];
  const accessible = document.createElement("span");
  accessible.className = "typewriter-accessible";
  accessible.textContent = lines.join(" ");
  const visual = document.createElement("span");
  visual.className = "typewriter-visual";
  visual.setAttribute("aria-hidden", "true");
  const chars = [];
  function characters(text) {
   const fragment = document.createDocumentFragment();
   for (const letter of Array.from(text)) {
    const char = document.createElement("span");
    char.className = "typewriter-char";
    char.textContent = letter;
    char.dataset.revealed = "false";
    chars.push(char); allCharacters.push(char); fragment.append(char);
   }
   return fragment;
  }
  if (isTitle) {
   // Retain both flex items and the small comma so the artwork never shifts while typing.
   while (group.firstChild) visual.append(group.firstChild);
   const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
   const textNodes = [];
   while (walker.nextNode()) textNodes.push(walker.currentNode);
   textNodes.forEach(node => node.replaceWith(characters(node.textContent)));
  } else {
   for (const text of lines) {
    const line = document.createElement("span");
    line.className = "typewriter-line";
    line.append(characters(text)); visual.append(line);
   }
  }
  group.replaceChildren(accessible, visual);
  group.classList.add("typewriter-running");
  group.dataset.typing = "queued";
  return { group, chars, isTitle };
 });

 function start(entry, onComplete) {
  const { group, chars, isTitle } = entry;
  group.dataset.typing = "running";
  const speed = Number(group.dataset.typeSpeed) || 38;
  let index = 0;
  function tick() {
   if (index > 0) delete chars[index - 1].dataset.current;
   if (index >= chars.length) {
    group.classList.remove("typewriter-running");
    group.dataset.typing = "complete";
    if (onComplete) onComplete();
    return;
   }
   const char = chars[index++];
   char.dataset.revealed = "true";
   char.dataset.current = "true";
   schedule(tick, /[,，。！？、]/.test(char.textContent) ? (isTitle ? 220 : 110) : speed);
  }
  tick();
 }
 function startSupportingCopy() {
  prepared.filter(entry => !entry.isTitle).forEach(entry => {
   schedule(() => start(entry), Number(entry.group.dataset.typeDelay) || 200);
  });
 }
 const title = prepared.find(entry => entry.isTitle);
 if (title) schedule(() => start(title, startSupportingCopy), Number(title.group.dataset.typeDelay) || 200);
 else startSupportingCopy();

 motion.addEventListener("change", event => { if (event.matches) finish(); });
 document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); });
 window.addEventListener("pagehide", finish, { once: true });
})();
