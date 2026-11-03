(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => calm ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
const A = window.AGENT;

/* ---------- top bar ---------- */
const top = $('.top');
addEventListener('scroll', () => top.classList.toggle('scrolled', scrollY > 8), {passive: true});

/* ---------- dithered photo (8x8 Bayer) ---------- */
const BAYER = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
function dither(img, canvas, n, ink, paper, gain = 1.15, bias = 0){
  const s = document.createElement('canvas'); s.width = s.height = n;
  const sx = s.getContext('2d'); sx.drawImage(img, 0, 0, n, n);
  const d = sx.getImageData(0, 0, n, n).data;
  canvas.width = canvas.height = n;
  const x = canvas.getContext('2d'), out = x.createImageData(n, n);
  for (let i = 0; i < n*n; i++){
    const l = Math.min(1, ((d[i*4]*.3 + d[i*4+1]*.59 + d[i*4+2]*.11) / 255 - .5) * gain + .5 + bias);
    const c = l > (BAYER[(Math.floor(i/n)%8)*8 + (i%n)%8] + .5) / 64 ? paper : ink;
    out.data.set([c[0], c[1], c[2], 255], i*4);
  }
  x.putImageData(out, 0, 0);
}
const photo = new Image();
photo.onload = () => {
  dither(photo, $('#avatar'), 64, [21,21,21], [233,230,223]);
  dither(photo, $('#dither'), 220, [21,21,21], [243,241,236], 1.25, .12);
};
photo.src = 'photo.jpg';

/* ---------- agent graph ---------- */
const graph = $('#graph'), svg = $('#edges');
const nodes = Object.fromEntries($$('.node').map(n => [n.dataset.n, n]));
const EDGES = [['plan','retrieve'], ['retrieve','verify'], ['verify','reason'], ['reason','answer']];
function drawEdges(){
  const W = graph.clientWidth, H = graph.clientHeight;
  const pos = n => { const cs = getComputedStyle(nodes[n]); return [parseFloat(cs.getPropertyValue('--x'))/100*W, parseFloat(cs.getPropertyValue('--y'))/100*H]; };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = EDGES.map(([a, b]) => {
    const [x1, y1] = pos(a), [x2, y2] = pos(b), my = (y1 + y2) / 2;
    return `<path data-e="${a}-${b}" d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}"/>`;
  }).join('');
}
drawEdges();
new ResizeObserver(drawEdges).observe(graph);

/* ---------- run a question ---------- */
const trace = $('#trace'), answer = $('#answer'), input = $('#q');
const HEAD = trace.innerHTML;
let runId = 0;
async function run(item, typed){
  const id = ++runId, alive = () => id === runId;
  $$('.chips button').forEach(b => b.classList.toggle('on', b.dataset.id === item.id));
  Object.values(nodes).forEach(n => n.className = 'node');
  svg.querySelectorAll('path').forEach(p => p.classList.remove('on'));
  trace.innerHTML = HEAD;
  answer.className = 'answer';
  if (!typed){
    input.value = '';
    for (const ch of item.q){ if (!alive()) return; input.value += ch; await sleep(18); }
  }
  let prev = null, total = 0;
  for (const [step, fn, ms] of item.trace){
    if (!alive()) return;
    if (prev){ nodes[prev].className = 'node done'; svg.querySelector(`[data-e="${prev}-${step}"]`)?.classList.add('on'); }
    nodes[step].className = 'node on';
    trace.insertAdjacentHTML('beforeend', `<div class="row"><span>${step}</span><span class="fn">${fn}</span><span class="bar" style="width:${Math.max(8, ms/4)}%"></span><span class="ms">${ms}</span></div>`);
    await sleep(ms * 1.3); total += ms; prev = step;
  }
  if (!alive()) return;
  nodes[prev].className = 'node done';
  const cites = (item.cite || []).map(c => `<span class="cite">${c}</span>`).join('');
  answer.innerHTML = `<span class="q">› ${escapeHtml(typed || item.q)}</span>${item.a}` +
    `<span class="meta">${cites}<span>${total} ms</span>${item.go ? `<a href="${item.go}">Go to section ↓</a>` : ''}</span>`;
  answer.className = 'answer show';
}
function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// keyword match for typed questions; no match falls back to a fixed reply
function match(text){
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  let best = null, score = 0;
  for (const q of A.questions){
    const s = words.filter(w => q.keys.includes(w)).length;
    if (s > score){ score = s; best = q; }
  }
  return best || {id: 'none', a: A.fallback, cite: [], trace: [['plan','intent.classify("?")',120],['retrieve','search(k=3) → 0',220],['verify','skip()',60],['reason','fallback()',90],['answer','compose()',140]]};
}

const chips = $('#chips');
A.questions.forEach(q => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = q.q; b.dataset.id = q.id;
  b.onclick = () => run(q);
  chips.append(b);
});
$('#ask').addEventListener('submit', e => {
  e.preventDefault();
  const t = input.value.trim();
  if (t) run(match(t), t);
});
addEventListener('keydown', e => {
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)){ e.preventDefault(); input.focus(); }
});

// run the intro once, so first-time visitors see the agent move
setTimeout(() => { if (scrollY < innerHeight / 2) run(A.intro); }, calm ? 0 : 700);

/* ---------- reveal, nav state, counters, run log ---------- */
const secs = $$('.sec'), seen = new Set();
const log = $('#runlog'), t0 = Date.now();
secs.forEach(s => s.classList.add('reveal'));
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  seen.add(e.target.id);
  $$('.top nav a').forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
  e.target.querySelectorAll('[data-count]').forEach(countUp);
}), {threshold: .15});
secs.forEach(s => io.observe(s));
function countUp(el){
  if (el.dataset.done || calm) return;
  el.dataset.done = 1;
  const to = +el.dataset.count, start = performance.now();
  (function f(t){ const p = Math.min(1, (t - start) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(f); })(start);
}
setInterval(() => {
  const s = Math.floor((Date.now() - t0) / 1000);
  log.textContent = `session ${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')} · sections read ${seen.size}/${secs.length}`;
}, 1000);

/* ---------- book recommendation (mailto, nothing stored) ---------- */
$('#book').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target), title = f.get('title').trim(), author = f.get('author').trim(), why = f.get('why').trim();
  const subject = `A book for you: ${title}`;
  const body = `Title: ${title}\nAuthor: ${author || '-'}\n\nWhy: ${why || '-'}\n`;
  location.href = `mailto:sachchidananda13@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
})();
