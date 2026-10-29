'use strict';

/* ================= Данные ================= */

const STORE_KEY = 'english:v1';
const GOALS = { general: 'Общий английский', travel: 'Путешествия', work: 'Работа', exam: 'Экзамен (IELTS / TOEFL)', talk: 'Разговорная речь' };
const FOCUS = { speak: 'Говорить', listen: 'Понимать на слух', grammar: 'Грамматика', vocab: 'Словарный запас', write: 'Писать' };
const SKILLS = { g: 'Грамматика', v: 'Лексика', r: 'Чтение', l: 'Аудирование' };
const WEEKS = 8;
const PASS = 0.6;   // уровень засчитан с 60% верных ответов
const STOP = 0.5;   // ниже 50% на уровне — тест заканчивается
const INTERVALS = [0, 1, 3, 7, 14, 30];   // через сколько дней повторять слово из «коробки» 0…5
// Тест по уровням: вопросов на грамматику и лексику, аудирование, текст для чтения
const SECTIONS = { 1: [7, 1, null], 2: [6, 1, 'r2'], 3: [6, 1, 'r3'], 4: [6, 1, 'r4'], 5: [6, 1, 'r5'], 6: [7, 0, null] };
const LISTEN_PLAYS = 3;

const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const addDays = (ds, n) => { const d = parseDate(ds); d.setDate(d.getDate() + n); return ymd(d); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const pct = (c, n) => n ? Math.round(c / n * 100) : 0;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const DATE = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const fmtDate = s => DATE.format(parseDate(s));
// **жирный** в текстах правил
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const words = s => (String(s).trim().match(/\S+/g) || []).length;
function plural(n, [one, few, many]) {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
}
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function defaults() {
  return {
    version: 1,
    profile: { goal: 'general', minutes: 30, days: 5, focus: [] },
    test: null,        // незаконченный тест
    results: [],       // история тестов
    plan: null,        // программа на 8 недель
    topics: {},        // тема → { r: последние ответы «1101…» }
    mistakes: {},      // вопрос → { n: сколько раз ошибся, ok: верных подряд }
    seen: {},          // вопросы теста, которые уже попадались
    cards: {},         // слово → { b: коробка, due: дата повторения }
    words: [],         // свои слова
    fresh: { d: '', n: 0 },   // сколько новых слов начато сегодня
    days: {},          // дата → число занятий
    writings: {},      // тексты к заданиям «Письмо»
    ui: { theme: 'auto' }
  };
}

function normalize(s) {
  const d = defaults();
  const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  const profile = Object.assign(d.profile, obj(s.profile));
  if (!Array.isArray(profile.focus)) profile.focus = [];
  return {
    version: 1,
    profile,
    test: obj(s.test) && Array.isArray(s.test.secs) ? s.test : null,
    results: Array.isArray(s.results) ? s.results : [],
    plan: obj(s.plan) && Array.isArray(s.plan.weeks) ? s.plan : null,
    topics: obj(s.topics) || {},
    mistakes: obj(s.mistakes) || {},
    seen: obj(s.seen) || {},
    cards: obj(s.cards) || {},
    words: Array.isArray(s.words) ? s.words : [],
    fresh: obj(s.fresh) || d.fresh,
    days: obj(s.days) || {},
    writings: obj(s.writings) || {},
    ui: Object.assign(d.ui, obj(s.ui))
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { /* повреждённые данные — начинаем заново */ }
  return defaults();
}

let state = load();

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Не удалось сохранить данные'); }
}

/* ================= Материалы ================= */

const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const PASSAGE = Object.fromEntries(READING.map(r => [r.id, r]));
const ITEMS = {};
TOPICS.forEach(t => {
  t.d.forEach(([q, o, e], i) => { ITEMS[`${t.id}.${i}`] = { lv: t.lv, s: t.kind, t: t.id, q, o, e }; });
  t.w.forEach(([q, acc, e], i) => { ITEMS[`${t.id}.w${i}`] = { lv: t.lv, s: t.kind, t: t.id, q, acc, e }; });
});
{
  const n = {};
  TEST.forEach(([lv, s, t, q, o, e]) => { n['t' + lv] = (n['t' + lv] || 0) + 1; ITEMS[`t${lv}.${n['t' + lv]}`] = { lv, s, t, q, o, e, test: true }; });
  LISTEN.forEach(([lv, audio, q, o, e]) => { n['l' + lv] = (n['l' + lv] || 0) + 1; ITEMS[`l${lv}.${n['l' + lv]}`] = { lv, s: 'l', q, o, e, audio, test: true }; });
}
READING.forEach(r => r.qs.forEach(([q, o, e], j) => { ITEMS[`${r.id}.${j}`] = { lv: r.lv, s: 'r', q, o, e, passage: r.id, test: true }; }));
Object.entries(ITEMS).forEach(([id, it]) => { it.id = id; });

const topicItems = tid => Object.values(ITEMS).filter(it => it.t === tid && !it.audio && !it.passage);

const DECK_CARDS = Object.entries(DECKS).flatMap(([lv, list]) => list.map(([en, ru, ex]) => ({ id: `${lv}:${en}`, lv: +lv, en, ru, ex })));
const cardById = id => state.words.find(w => w.id === id) || DECK_CARDS.find(c => c.id === id);

const lastResult = () => state.results[state.results.length - 1] || null;
const curLevel = () => lastResult()?.level ?? null;
const bandOf = lv => lv <= 2 ? 'low' : lv <= 4 ? 'mid' : 'high';
const levelName = lv => `${LEVELS[lv].code} · ${LEVELS[lv].ru}`;

function topicLog(tid, ok) {
  if (!tid) return;
  const t = state.topics[tid] || { r: '' };
  t.r = (t.r + (ok ? '1' : '0')).slice(-12);
  t.at = today();
  state.topics[tid] = t;
}
// Точность по последним 12 ответам; меньше трёх ответов — ещё рано судить
function mastery(tid) {
  const r = state.topics[tid]?.r;
  return r && r.length >= 3 ? r.split('').filter(x => x === '1').length / r.length : null;
}
function addMistake(id) {
  const m = state.mistakes[id] || { n: 0, ok: 0 };
  m.n++; m.ok = 0; m.at = today();
  state.mistakes[id] = m;
}
// Два верных ответа подряд — вопрос уходит из «Работы над ошибками»
function mistakeFixed(id) {
  const m = state.mistakes[id];
  if (!m) return;
  if (++m.ok >= 2) delete state.mistakes[id];
}
const mistakeList = () => Object.keys(state.mistakes).filter(id => ITEMS[id]);

function bumpDay() { const d = today(); state.days[d] = (state.days[d] || 0) + 1; }
function streak() {
  let d = today(), n = 0;
  if (!state.days[d]) d = addDays(d, -1);
  while (state.days[d]) { n++; d = addDays(d, -1); }
  return n;
}

/* ================= Озвучка ================= */

const canSpeak = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
let voice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  voice = vs.find(v => /en[-_]US/i.test(v.lang) && /samantha|google|natural|aria|jenny|ava/i.test(v.name))
    || vs.find(v => /en[-_](US|GB)/i.test(v.lang)) || vs[0] || null;
}
if (canSpeak()) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

function speak(text, rate = 0.95) {
  if (!canSpeak()) { toast('Браузер не умеет озвучивать текст'); return false; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice ? voice.lang : 'en-US';
  if (voice) u.voice = voice;
  u.rate = rate;
  speechSynthesis.speak(u);
  return true;
}

/* ================= Тест уровня ================= */

// n вопросов: сначала те, что ещё не попадались, и по возможности из разных тем
function pickItems(ids, n) {
  const pool = [...shuffle(ids.filter(id => !state.seen[id])), ...shuffle(ids.filter(id => state.seen[id]))];
  const out = [], used = new Set();
  for (const id of pool) {
    if (out.length >= n) break;
    if (!used.has(ITEMS[id].t)) { used.add(ITEMS[id].t); out.push(id); }
  }
  for (const id of pool) { if (out.length >= n) break; if (!out.includes(id)) out.push(id); }
  return out;
}

function newTest(task = null) {
  const all = Object.values(ITEMS).filter(it => it.test);
  const secs = [];
  for (let lv = 1; lv <= 6; lv++) {
    const [gv, l, r] = SECTIONS[lv];
    const items = [
      ...pickItems(all.filter(it => it.lv === lv && (it.s === 'g' || it.s === 'v')).map(it => it.id), gv),
      ...pickItems(all.filter(it => it.lv === lv && it.audio).map(it => it.id), l),
      ...(r ? all.filter(it => it.passage === r).map(it => it.id) : [])
    ];
    secs.push({ lv, items });
  }
  state.test = { started: today(), task, secs, sec: 0, pos: 0, ans: {}, order: {}, plays: {}, phase: 'q', writing: '' };
  save();
}

function secScore(t, sec) {
  let c = 0, n = 0;
  sec.items.forEach(id => {
    const a = t.ans[id];
    if (a === undefined || a === null) return;
    n++; if (a === 0) c++;
  });
  return { c, n };
}

// a — номер варианта в исходном списке (0 — верный), -1 — «не знаю», null — вопрос пропущен (нет звука)
function testAnswer(a) {
  const t = state.test;
  const sec = t.secs[t.sec];
  t.ans[sec.items[t.pos]] = a;
  t.pos++;
  if (t.pos >= sec.items.length) {
    const { c, n } = secScore(t, sec);
    if (t.sec >= t.secs.length - 1 || (n && c / n < STOP)) t.phase = 'write';
    else { t.sec++; t.pos = 0; }
  }
  save();
  render();
  window.scrollTo(0, 0);
}

function scoreTest(t) {
  const per = {}, skills = {}, topics = {}, tot = {}, wrong = [];
  const inc = (o, k, ok) => { const v = o[k] || (o[k] = [0, 0]); v[1]++; if (ok) v[0]++; };
  t.secs.forEach(sec => sec.items.forEach(id => {
    const a = t.ans[id];
    if (a === undefined || a === null) return;
    const it = ITEMS[id], ok = a === 0;
    inc(per, it.lv, ok);
    inc(skills, it.s, ok);
    if (it.t) { tot[it.t] = (tot[it.t] || 0) + 1; if (!ok) topics[it.t] = (topics[it.t] || 0) + 1; }
    if (!ok) wrong.push([id, a]);
  }));
  // Уровень — самый высокий, где ≥60%, если ни на одном уровне ниже не было провала (<50%)
  let level = 0;
  for (let lv = 1; lv <= 6; lv++) {
    const p = per[lv];
    if (!p || !p[1]) break;
    const acc = p[0] / p[1];
    if (acc < STOP) break;
    if (acc >= PASS) level = lv;
  }
  const nx = per[level + 1];
  const progress = level >= 6 ? 1 : nx && nx[1] ? Math.min(1, nx[0] / nx[1] / PASS) : 0;
  return { id: uid(), date: today(), level, progress, per, skills, topics, tot, wrong };
}

function finishTest(writing) {
  const t = state.test;
  const res = scoreTest(t);
  res.writing = String(writing || '').trim();
  state.results.push(res);
  t.secs.forEach(s => s.items.forEach(id => { if (id in t.ans) state.seen[id] = 1; }));
  res.wrong.forEach(([id]) => addMistake(id));
  if (t.task) markDone(t.task);
  state.test = null;
  if (!state.plan) state.plan = buildPlan(res);
  bumpDay();
  save();
  screen = { name: 'result', id: res.id };
  render();
  window.scrollTo(0, 0);
}

function startTest(task = null) {
  if (!state.test) newTest(task);
  else if (task && !state.test.task) { state.test.task = task; save(); }
  go('test');
}

/* ================= Программа ================= */

// Порядок тем: ошибки своего уровня и ниже → непроверенные темы своего уровня →
// следующий уровень (сначала темы с ошибками) → ещё уровнем выше
function topicQueue(res) {
  const lv = Math.max(1, res.level), target = Math.min(6, res.level + 1);
  const errs = res.topics || {}, tested = res.tot || {};
  const byErrors = (a, b) => a.lv - b.lv || (errs[b.id] || 0) - (errs[a.id] || 0);
  const q = [];
  const add = t => { if (!q.includes(t.id)) q.push(t.id); };
  TOPICS.filter(t => t.lv <= lv && errs[t.id]).sort(byErrors).forEach(add);
  TOPICS.filter(t => t.lv === lv && !tested[t.id]).forEach(add);
  TOPICS.filter(t => t.lv === target).sort(byErrors).forEach(add);
  TOPICS.filter(t => t.lv === Math.min(6, target + 1)).forEach(add);
  if (res.level >= 5) TOPICS.filter(t => t.lv >= 5).forEach(add);
  return q;
}

function skillWeights(res) {
  const p = state.profile, w = { listen: 2, speak: 2, read: 1, write: 1 };
  if (p.focus.includes('speak')) w.speak += 2;
  if (p.focus.includes('listen')) w.listen += 2;
  if (p.focus.includes('write')) w.write += 1;
  if (p.focus.includes('vocab')) w.read += 1;
  ({ travel: ['speak', 'listen'], work: ['write', 'speak'], exam: ['write', 'read'], talk: ['speak', 'speak'] }[p.goal] || []).forEach(k => w[k]++);
  const low = s => s && s[1] && s[0] / s[1] < PASS;
  if (low(res.skills?.l)) w.listen++;
  if (low(res.skills?.r)) w.read++;
  return w;
}

// Плавное чередование навыков по весам (weighted round-robin)
function rotation(w) {
  const keys = Object.keys(w), total = keys.reduce((s, k) => s + w[k], 0), cur = {};
  keys.forEach(k => { cur[k] = 0; });
  const out = [];
  for (let i = 0; i < 60; i++) {
    keys.forEach(k => { cur[k] += w[k]; });
    const best = keys.reduce((a, b) => cur[b] > cur[a] ? b : a);
    cur[best] -= total;
    out.push(best);
  }
  return out;
}

function buildPlan(res) {
  const p = state.profile, D = p.days, M = p.minutes;
  const slots = M >= 45 ? 2 : 1;                                   // грамматических заданий в день
  const per = clamp(Math.floor((D - 1) * slots / 2), 1, 3);        // тем в неделю: урок + тренировка на каждую
  const queue = topicQueue(res);
  const rot = rotation(skillWeights(res));
  const newPerDay = (M <= 15 ? 4 : M <= 30 ? 6 : M <= 45 ? 8 : 10) + (p.focus.includes('vocab') ? 3 : 0);
  const min = {
    lesson: 10, drill: 7, review: 8, mistakes: 5, retest: 25,
    cards: M <= 15 ? 5 : M <= 30 ? 7 : 10,
    listen: M >= 45 ? 15 : 10, read: M >= 45 ? 15 : 10, speak: M >= 45 ? 10 : 7, write: M >= 60 ? 15 : 10
  };
  const counters = { listen: 0, read: 0, speak: 0, write: 0 };
  const learned = new Set();
  let qi = 0, ri = 0;
  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    const topics = [];
    while (topics.length < per && queue.length) {
      const t = queue[qi++ % queue.length];
      if (!topics.includes(t)) topics.push(t);
      else if (queue.length <= topics.length) break;
    }
    const g = [
      ...topics.map(t => ({ k: learned.has(t) ? 'drill' : 'lesson', t })),
      ...topics.map(t => ({ k: 'drill', t })),
      { k: 'mistakes' }
    ];
    topics.forEach(t => learned.add(t));
    let gi = 0;
    const days = [];
    for (let d = 0; d < D; d++) {
      const day = [];
      const last = d === D - 1;
      if (last) day.push({ k: 'review', ts: topics });
      else for (let s = 0; s < slots; s++) day.push(gi < g.length ? { ...g[gi++] } : { k: 'drill', t: topics[(gi++ - g.length) % topics.length] });
      day.push({ k: 'cards', n: newPerDay });
      if (last && (w === 3 || w === WEEKS - 1)) day.push({ k: 'retest' });
      day.forEach(t => { t.m = min[t.k]; });
      let left = M - day.reduce((s, t) => s + t.m, 0);
      while (left >= 5 && !(last && (w === 3 || w === WEEKS - 1))) {
        // Следующий навык по очереди, которого ещё нет в этом дне
        let j = 0;
        while (j < 4 && day.some(t => t.k === rot[(ri + j) % rot.length])) j++;
        if (j === 4) j = 0;   // все ближайшие уже есть в дне — допускаем повтор
        const a = ri % rot.length, b = (ri + j) % rot.length;
        [rot[a], rot[b]] = [rot[b], rot[a]];   // выбранный навык идёт сейчас, пропущенный — позже
        let k = rot[ri++ % rot.length];
        if (k === 'write' && left < 10) k = 'speak';
        const m = Math.min(min[k], left);
        day.push({ k, m, r: counters[k]++ });
        left -= m;
      }
      days.push(day);
    }
    weeks.push({ topics, days });
  }
  return { created: today(), level: res.level, base: res.id, D, M, goal: p.goal, newPerDay, weeks, done: {}, dayDone: {} };
}

const taskKey = (w, d, i) => `${w}.${d}.${i}`;
function taskAt(key) {
  const [w, d, i] = key.split('.').map(Number);
  return state.plan?.weeks[w]?.days[d]?.[i] || null;
}
const planDays = pl => pl.weeks.flatMap((wk, w) => wk.days.map((tasks, d) => ({ w, d, idx: w * pl.D + d, tasks })));
const dayComplete = (pl, day) => day.tasks.every((t, i) => pl.done[taskKey(day.w, day.d, i)]);
const currentDay = pl => planDays(pl).find(day => !dayComplete(pl, day)) || null;

function markDone(key, on = true) {
  const pl = state.plan;
  if (!pl || !taskAt(key)) return;
  if (on) { if (!pl.done[key]) { pl.done[key] = today(); bumpDay(); } }
  else delete pl.done[key];
  const [w, d] = key.split('.').map(Number);
  const idx = w * pl.D + d;
  if (dayComplete(pl, { w, d, tasks: pl.weeks[w].days[d] })) pl.dayDone[idx] = pl.dayDone[idx] || today();
  else delete pl.dayDone[idx];
}

function resource(t) {
  const band = bandOf(state.plan?.level ?? curLevel() ?? 0);
  const goal = state.plan?.goal || state.profile.goal;
  if (t.k === 'listen' || t.k === 'read') {
    const list = RES[t.k][band];
    return list[t.r % list.length];
  }
  const base = PROMPTS[t.k][band], extra = PROMPTS[t.k + 'Goal'][goal];
  // Каждое второе задание — по вашей цели (путешествия, работа, экзамен…)
  const list = extra && t.r % 2 ? extra : base;
  return list[Math.floor(t.r / (extra ? 2 : 1)) % list.length];
}

function taskInfo(t) {
  const m = `${t.m} мин`;
  switch (t.k) {
    case 'lesson': return { title: `📘 Урок: ${TOPIC[t.t].title}`, sub: `${m} · правило и упражнения` };
    case 'drill': return { title: `🎯 Тренировка: ${TOPIC[t.t].title}`, sub: `${m} · 8 заданий` };
    case 'review': return { title: '🔁 Повторение недели', sub: `${m} · ${t.ts.map(id => TOPIC[id].title).join(', ')}` };
    case 'mistakes': { const n = mistakeList().length; return { title: '🩹 Работа над ошибками', sub: `${m} · ${n ? `${n} ${plural(n, ['вопрос', 'вопроса', 'вопросов'])}` : 'ошибок нет'}` }; }
    case 'cards': return { title: '🗂 Слова', sub: `${m} · повторение и до ${t.n} новых` };
    case 'retest': return { title: '🏁 Контрольный тест', sub: '≈ 20 мин · посмотрим, как вырос уровень' };
    case 'listen': return { title: `🎧 Аудирование: ${resource(t)[0]}`, sub: m };
    case 'read': return { title: `📖 Чтение: ${resource(t)[0]}`, sub: m };
    case 'speak': return { title: '🗣 Говорение', sub: `${m} · ${resource(t)}` };
    case 'write': return { title: '✍️ Письмо', sub: `${m} · ${resource(t)}` };
  }
  return { title: '', sub: '' };
}

function openTask(key) {
  const t = taskAt(key);
  if (!t) return;
  const inSheet = ['listen', 'read', 'speak', 'write'].includes(t.k);
  if (!inSheet && sheetOpen()) closeSheet();
  switch (t.k) {
    case 'lesson': go('lesson', { id: t.t, task: key }); break;
    case 'drill': startSession(drillIds(t.t), { title: TOPIC[t.t].title, task: key }); break;
    case 'review': startSession(reviewIds(t.ts), { title: 'Повторение недели', task: key }); break;
    case 'mistakes': {
      const ids = mistakeIds();
      if (ids.length) startSession(ids, { title: 'Работа над ошибками', task: key });
      else { markDone(key); save(); render(); toast('Ошибок для разбора нет — отлично!'); }
      break;
    }
    case 'cards': startCards(key); break;
    case 'retest': startTest(key); break;
    default: openTaskSheet(key, t);
  }
}

/* ================= Тренировки ================= */

let session = null;

function drillIds(tid, n = 8) {
  const all = topicItems(tid).map(it => it.id);
  return [...shuffle(all.filter(id => state.mistakes[id])), ...shuffle(all.filter(id => !state.mistakes[id]))].slice(0, n);
}
function reviewIds(ts, n = 10) {
  const each = Math.ceil(n / Math.max(1, ts.length));
  return shuffle(ts.flatMap(t => drillIds(t, each))).slice(0, n);
}
function mistakeIds(n = 12) {
  return shuffle(mistakeList()).sort((a, b) => state.mistakes[b].n - state.mistakes[a].n).slice(0, n);
}
// Случайная тренировка: темы до следующего уровня, слабые — чаще
function mixIds(n = 10) {
  const lv = curLevel() ?? 1, res = lastResult();
  const pool = TOPICS.filter(t => t.lv <= Math.min(6, Math.max(1, lv) + 1)).map(t => t.id);
  const weak = Object.keys(res?.topics || {}).filter(id => pool.includes(id));
  const picks = shuffle([...weak, ...weak, ...pool]).slice(0, n);
  return shuffle(picks.flatMap(t => drillIds(t, 1))).filter((id, i, a) => a.indexOf(id) === i).slice(0, n);
}

function startSession(ids, { title = 'Тренировка', task = null } = {}) {
  if (!ids.length) { toast('Заданий пока нет'); return; }
  session = { ids, i: 0, order: {}, title, task, picked: undefined, typed: '', ok: null, score: 0, done: false };
  go('quiz');
}

const norm = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim();

// a — номер варианта, -1 — «не знаю», строка — введённый ответ
function practiceAnswer(a) {
  const s = session, it = ITEMS[s.ids[s.i]];
  const ok = typeof a === 'string' ? it.acc.some(x => norm(x) === norm(a)) : a === 0;
  s.picked = a; s.ok = ok;
  if (typeof a === 'string') s.typed = a;
  if (ok) s.score++;
  topicLog(it.t, ok);
  if (ok) mistakeFixed(it.id); else addMistake(it.id);
  if (it.test) state.seen[it.id] = 1;
  save();
  render();
}

function practiceNext() {
  const s = session;
  s.i++; s.picked = undefined; s.typed = ''; s.ok = null;
  if (s.i >= s.ids.length) {
    s.done = true;
    if (s.task) markDone(s.task);
    bumpDay();
    save();
  }
  render();
  window.scrollTo(0, 0);
}

/* ================= Слова ================= */

let deck = null;

function newCardIds(n) {
  const L = clamp(curLevel() || 1, 1, 5);
  const levels = [];
  for (let lv = L; lv <= 5; lv++) levels.push(lv);
  for (let lv = L - 1; lv >= 1; lv--) levels.push(lv);
  const ids = state.words.filter(w => !state.cards[w.id]).map(w => w.id);
  levels.forEach(lv => DECKS[lv].forEach(([en]) => { const id = `${lv}:${en}`; if (!state.cards[id]) ids.push(id); }));
  return ids.slice(0, n);
}
const dueIds = () => Object.keys(state.cards).filter(id => state.cards[id].due <= today() && cardById(id));
function freshLeft() {
  if (state.fresh.d !== today()) state.fresh = { d: today(), n: 0 };
  return Math.max(0, (state.plan?.newPerDay || 6) - state.fresh.n);
}

function startCards(task = null, extra = 0) {
  const queue = [...shuffle(dueIds()).slice(0, 40), ...newCardIds(freshLeft() + extra)];
  deck = { queue, i: 0, flipped: false, known: 0, again: 0, task, retry: {}, done: false };
  if (screen?.name === 'cards') { render(); window.scrollTo(0, 0); }
  else go('cards');
}

function cardAnswer(knew) {
  const d = deck, id = d.queue[d.i], c = state.cards[id];
  if (!c) { freshLeft(); state.fresh.n++; }
  if (knew) {
    const b = Math.min(5, (c ? c.b : 0) + 1);
    state.cards[id] = { b, due: addDays(today(), INTERVALS[b]) };
    d.known++;
  } else {
    state.cards[id] = { b: 0, due: today() };
    d.again++;
    // Забытое слово ещё раз в конце (не больше двух повторов)
    if ((d.retry[id] || 0) < 2) { d.retry[id] = (d.retry[id] || 0) + 1; d.queue.push(id); }
  }
  d.i++; d.flipped = false;
  if (d.i >= d.queue.length) {
    d.done = true;
    if (d.task) markDone(d.task);
    bumpDay();
  }
  save();
  render();
}

/* ================= Отчёт для Claude ================= */

function report() {
  const r = lastResult(), p = state.profile;
  const lines = [
    'Привет, Claude! Это результаты моего теста по английскому из приложения English. Составь, пожалуйста, персональную программу обучения: что учить в первую очередь, сколько времени уделять каждому навыку и какие материалы использовать.',
    ''
  ];
  if (!r) lines.push('Тест ещё не пройден.');
  else {
    const L = LEVELS[r.level];
    let lvl = `Уровень: ${L.code} (${L.en} — ${L.ru})`;
    if (r.manual) lvl += ` — указан вручную${r.source ? `: ${r.source}` : ''}`;
    else if (r.level < 6) lvl += `, до ${LEVELS[r.level + 1].code} — ${Math.round(r.progress * 100)}%`;
    lines.push(`Дата теста: ${fmtDate(r.date)}`, lvl);
    if (!r.manual) {
      const lvls = [1, 2, 3, 4, 5, 6].filter(lv => r.per[lv]);
      lines.push('По уровням: ' + lvls.map(lv => `${LEVELS[lv].code} ${r.per[lv][0]}/${r.per[lv][1]}`).join(' · ')
        + (lvls.length < 6 ? ' (дальше тест остановился)' : ''));
      lines.push('Навыки: ' + Object.keys(SKILLS).filter(k => r.skills[k]).map(k => `${SKILLS[k].toLowerCase()} ${pct(...r.skills[k])}%`).join(' · '));
      const weak = Object.entries(r.topics).filter(([id]) => TOPIC[id]).sort((a, b) => TOPIC[a[0]].lv - TOPIC[b[0]].lv);
      if (weak.length) lines.push('Слабые темы: ' + weak.map(([id, n]) => `${TOPIC[id].title} (${LEVELS[TOPIC[id].lv].code}, ошибок: ${n})`).join('; '));
      if (r.wrong.length) {
        lines.push('', 'Мои ошибки в тесте:');
        r.wrong.forEach(([id, a], i) => {
          const it = ITEMS[id];
          if (!it) return;
          const ctx = it.audio ? ` [аудио: «${it.audio}»]` : it.passage ? ` [текст «${PASSAGE[it.passage].title}»]` : '';
          lines.push(`${i + 1}. ${it.q}${ctx} — мой ответ: ${a === -1 ? 'не знаю' : `«${it.o[a]}»`}, правильно: «${it.o[0]}» (${LEVELS[it.lv].code})`);
        });
      }
    }
  }
  lines.push('', `Цель: ${GOALS[p.goal]}. Время: ${p.minutes} мин в день, ${p.days} ${plural(p.days, ['день', 'дня', 'дней'])} в неделю.`);
  if (p.focus.length) lines.push(`Труднее всего: ${p.focus.map(f => FOCUS[f].toLowerCase()).join(', ')}.`);
  if (state.plan) {
    const pl = state.plan, cur = currentDay(pl), all = planDays(pl).reduce((s, d) => s + d.tasks.length, 0);
    lines.push(`Программа в приложении: ${cur ? `неделя ${cur.w + 1} из ${WEEKS}` : 'пройдена полностью'}, выполнено ${Object.keys(pl.done).length} из ${all} заданий, серия занятий: ${streak()} дн.`);
  }
  const practiced = Object.keys(state.topics).filter(id => TOPIC[id] && mastery(id) !== null)
    .sort((a, b) => mastery(a) - mastery(b)).slice(0, 8);
  if (practiced.length) lines.push('Точность в тренировках: ' + practiced.map(id => `${TOPIC[id].title} — ${Math.round(mastery(id) * 100)}%`).join('; '));
  if (r?.writing) lines.push('', 'Мой текст из теста (проверь, пожалуйста, ошибки):', r.writing);
  return lines.join('\n');
}

async function copyText(text, msg = 'Скопировано') {
  try { await navigator.clipboard.writeText(text); toast(msg); return; } catch (e) { /* покажем текст для ручного копирования */ }
  const p = openSheet(`${head('Скопируйте текст', '')}<textarea class="area" readonly id="copy-area" style="min-height:320px">${esc(text)}</textarea><p class="hint">Выделите текст и скопируйте вручную.</p>`);
  $('#copy-area', p).select();
}
async function shareText(text) {
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  copyText(text);
}

/* ================= Иконки ================= */

const sv = (p, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  today: sv('<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M9 15l2 2 4-4"/>'),
  test: sv('<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM9 12h6M9 16h4"/>'),
  practice: sv('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  chart: sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  chevL: sv('<path d="M15 18l-6-6 6-6"/>'),
  chevR: sv('<path d="M9 18l6-6-6-6"/>'),
  close: sv('<path d="M18 6 6 18M6 6l12 12"/>'),
  check: sv('<path d="M20 6 9 17l-5-5"/>', 3),
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
  speaker: sv('<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
  copy: sv('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>')
};

/* ================= Отрисовка ================= */

let tab = 'today';
let screen = null;     // полноэкранный режим поверх вкладок: test, quiz, lesson, cards, result
let ahead = false;     // пользователь решил сегодня начать следующий день программы

const TABS = [
  ['today', 'Сегодня', I.today],
  ['test', 'Тест', I.test],
  ['practice', 'Практика', I.practice],
  ['progress', 'Прогресс', I.chart]
];

function go(name, extra = {}) {
  screen = { name, ...extra, back: screen };
  render();
  window.scrollTo(0, 0);
}
function back() {
  screen = screen?.back || null;
  render();
  window.scrollTo(0, 0);
}

function applyTheme() {
  const t = state.ui.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function render() {
  applyTheme();
  document.body.classList.toggle('focus', !!screen);
  $('#tabbar').innerHTML = TABS.map(([id, name, icon]) => `
    <button class="tab" data-action="tab" data-v="${id}" ${!screen && tab === id ? 'aria-current="page"' : ''}>${icon}<span>${name}</span></button>`).join('');
  if (screen) {
    $('#top').innerHTML = '';
    const screens = { test: vTest, quiz: vQuiz, lesson: vLesson, cards: vCards, result: vResult };
    $('#view').innerHTML = screens[screen.name]();
    const input = $('#typed');
    if (input && !input.disabled) requestAnimationFrame(() => input.focus());
    return;
  }
  $('#top').innerHTML = `
    <div class="top-row">
      <div></div>
      <div class="top-actions"><button class="round-btn" data-action="settings" aria-label="Настройки">${I.gear}</button></div>
    </div>
    <h1 class="title">${TABS.find(t => t[0] === tab)[1]}</h1>`;
  const views = { today: vToday, test: vTestTab, practice: vPractice, progress: vProgress };
  $('#view').innerHTML = views[tab]();
}

const topBar = (title, action = 'back') => `
  <div class="qtop"><button class="round-btn" data-action="${action}" aria-label="Назад">${I.chevL}</button><b>${esc(title)}</b></div>`;
const bar = (p, cls = '') => `<span class="progress ${cls}"><i style="width:${clamp(Math.round(p * 100), 0, 100)}%"></i></span>`;
const row = (action, attrs, t1, t2, end = '') => `
  <button class="row" data-action="${action}" ${attrs}>
    <span class="mid"><span class="t1">${t1}</span>${t2 ? `<span class="t2">${t2}</span>` : ''}</span>
    ${end ? `<span class="end">${end}</span>` : ''}<span class="chev">${I.chevR}</span>
  </button>`;

/* ---------- Анкета ---------- */

function profilePills(k) {
  const p = state.profile;
  const opts = {
    goal: Object.entries(GOALS),
    minutes: [15, 30, 45, 60].map(v => [v, `${v} мин`]),
    days: [3, 5, 7].map(v => [v, `${v} ${plural(v, ['день', 'дня', 'дней'])}`]),
    focus: Object.entries(FOCUS)
  }[k];
  const on = v => k === 'focus' ? p.focus.includes(v) : String(p[k]) === String(v);
  return opts.map(([v, name]) => `<button class="pill" data-action="prof" data-k="${k}" data-v="${v}" aria-pressed="${on(v)}">${esc(name)}</button>`).join('');
}
const profileForm = () => `
  <div class="q-label">Зачем вам английский?</div><div class="pills">${profilePills('goal')}</div>
  <div class="q-label">Сколько времени в день готовы заниматься?</div><div class="pills">${profilePills('minutes')}</div>
  <div class="q-label">Сколько дней в неделю?</div><div class="pills">${profilePills('days')}</div>
  <div class="q-label">Что даётся труднее всего? <span class="sub">можно несколько</span></div><div class="pills">${profilePills('focus')}</div>`;

/* ---------- Сегодня ---------- */

function testResumeCard() {
  const t = state.test;
  const total = t.secs.reduce((s, x) => s + x.items.length, 0);
  const done = Object.keys(t.ans).length;
  return `
    <div class="card">
      <h3>Тест не закончен</h3>
      <p class="sub">Отвечено ${done} из ${total} вопросов (максимум). Продолжите с того же места.</p>
      ${bar(done / total)}
      <div style="height:14px"></div>
      <button class="btn" data-action="test-start">Продолжить тест</button>
    </div>`;
}

function levelCard(r) {
  const next = r.level < 6 ? LEVELS[r.level + 1] : null;
  return `
    <button class="card lvl-mini" data-action="result" data-id="${r.id}" style="width:100%;text-align:left">
      <span class="lvl-badge">${LEVELS[r.level].code}</span>
      <span class="mid">
        <span class="t1"><b>${LEVELS[r.level].en}</b> · ${LEVELS[r.level].ru}</span>
        ${next && !r.manual ? `<span class="sub">До ${next.code}: ${Math.round(r.progress * 100)}%</span>${bar(r.progress, 'thin')}` : `<span class="sub">${r.manual ? 'Уровень указан вручную' : 'Высший уровень'}</span>`}
      </span>
      <span class="chev" style="color:var(--faint)">${I.chevR}</span>
    </button>`;
}

function taskRow(t, key) {
  const done = !!state.plan.done[key];
  const { title, sub } = taskInfo(t);
  return `
    <div class="row task ${done ? 'done' : ''}">
      <button class="check" data-action="task-check" data-k="${key}" aria-pressed="${done}" aria-label="${done ? 'Снять отметку' : 'Отметить выполненным'}">${I.check}</button>
      <button class="task-body" data-action="task-open" data-k="${key}">
        <span class="mid"><span class="t1">${esc(title)}</span><span class="t2">${esc(sub)}</span></span>
        <span class="chev">${I.chevR}</span>
      </button>
    </div>`;
}

function vToday() {
  const r = lastResult();
  if (!r) {
    return `
      ${state.test ? testResumeCard() : ''}
      <div class="card lvl-hero">
        <div style="font-size:54px;line-height:1">🇬🇧</div>
        <h3 style="margin-top:10px">Проверим ваш английский</h3>
        <p class="lvl-about">Тест на 15–25 минут: грамматика, слова, чтение и аудирование (включите звук). Вопросы усложняются, пока не найдём ваш уровень. По результату приложение составит программу на ${WEEKS} недель.</p>
      </div>
      <div class="card">${profileForm()}</div>
      ${state.test ? '' : '<button class="btn" data-action="test-start">Начать тест</button>'}
      <button class="btn ghost" data-action="manual">Я уже знаю свой уровень</button>
      <p class="foot">Проходили тест на другом сайте (EF SET, Cambridge, British Council)? Укажите результат через «Я уже знаю свой уровень» — программа подстроится. Но встроенный тест точнее покажет, какие темы подтянуть.</p>`;
  }
  let html = (state.test ? testResumeCard() : '') + levelCard(r);
  const pl = state.plan;
  if (!pl) return html + `<div class="card"><h3>Программы пока нет</h3><p class="sub">Составим её по последнему результату и вашей анкете.</p><button class="btn" data-action="plan-build">Составить программу</button></div>`;
  const day = currentDay(pl);
  if (!day) {
    return html + `
      <div class="card lvl-hero">
        <div style="font-size:48px">🎉</div>
        <h3>Программа пройдена!</h3>
        <p class="lvl-about">Пройдите тест заново, чтобы увидеть рост, и составьте программу на следующий этап.</p>
      </div>
      <button class="btn" data-action="test-start">Пройти тест</button>
      <button class="btn ghost" data-action="plan-rebuild">Новая программа по текущему результату</button>`;
  }
  const s = streak();
  const started = day.tasks.some((t, i) => pl.done[taskKey(day.w, day.d, i)]);
  if (!ahead && !started && day.idx > 0 && pl.dayDone[day.idx - 1] === today()) {
    return html + `
      <div class="card lvl-hero">
        <div style="font-size:48px">✅</div>
        <h3>На сегодня всё!</h3>
        <p class="lvl-about">День ${day.idx} программы выполнен${s > 1 ? `, серия — ${s} ${plural(s, ['день', 'дня', 'дней'])} подряд 🔥` : ''}. Регулярность важнее объёма — увидимся завтра.</p>
      </div>
      <button class="btn ghost" data-action="ahead">Хочу ещё: начать следующий день</button>
      <button class="btn ghost" data-action="plan">Вся программа</button>`;
  }
  const total = day.tasks.reduce((sum, t) => sum + t.m, 0);
  const wk = pl.weeks[day.w];
  return html + `
    <div class="card">
      <div class="card-head">
        <h3>Неделя ${day.w + 1} · день ${day.d + 1}</h3>
        <span class="sub">≈ ${total} мин</span>
      </div>
      <div class="sub" style="margin:-6px 0 6px">Темы недели: ${wk.topics.map(t => esc(TOPIC[t].title)).join(', ')}</div>
      <div class="rows">${day.tasks.map((t, i) => taskRow(t, taskKey(day.w, day.d, i))).join('')}</div>
    </div>
    ${s ? `<p class="foot">🔥 ${s} ${plural(s, ['день', 'дня', 'дней'])} подряд</p>` : ''}
    <button class="btn ghost" data-action="plan">Вся программа на ${WEEKS} недель</button>`;
}

/* ---------- Тест: вкладка ---------- */

function vTestTab() {
  const r = lastResult();
  let html = state.test ? testResumeCard() : '';
  html += `
    <div class="card">
      <h3>Тест уровня</h3>
      <ul class="rule">
        <li>От A1 до C2: грамматика, лексика, чтение и аудирование.</li>
        <li>Вопросы усложняются. Если на уровне больше половины ошибок, тест заканчивается — лишнего не будет.</li>
        <li>Не угадывайте: «Не знаю» помогает точнее найти пробелы.</li>
        <li>В конце — короткий текст о себе (по желанию). Его можно отправить Claude на проверку.</li>
      </ul>
      <div style="height:12px"></div>
      ${state.test ? '<button class="btn ghost" data-action="test-restart">Начать тест заново</button>' : `<button class="btn" data-action="test-start">${r ? 'Пройти тест ещё раз' : 'Начать тест'}</button>`}
      <button class="btn ghost" data-action="manual">Указать уровень вручную</button>
    </div>`;
  if (state.results.length) {
    html += `<div class="sect">История</div><div class="card"><div class="rows">${state.results.slice().reverse().map(x =>
      row('result', `data-id="${x.id}"`, `<b>${LEVELS[x.level].code}</b> · ${LEVELS[x.level].ru}`, `${fmtDate(x.date)}${x.manual ? ' · указан вручную' : ` · ${x.wrong.length} ${plural(x.wrong.length, ['ошибка', 'ошибки', 'ошибок'])}`}`)
    ).join('')}</div></div>`;
  }
  html += `
    <div class="sect">Второе мнение</div>
    <div class="card">
      <p class="sub">Можно пройти большой бесплатный тест на другом сайте, ввести результат через «Указать уровень вручную» или прислать его Claude в чат вместе с отчётом.</p>
      <div class="rows">
        <a class="row" href="https://www.efset.org" target="_blank" rel="noopener"><span class="mid"><span class="t1">EF SET</span><span class="t2">50 минут, чтение и аудирование, баллы 0–100 и уровень CEFR</span></span><span class="chev">${I.chevR}</span></a>
        <a class="row" href="https://www.cambridgeenglish.org/test-your-english/" target="_blank" rel="noopener"><span class="mid"><span class="t1">Cambridge English</span><span class="t2">Короткий онлайн-тест от Кембриджа</span></span><span class="chev">${I.chevR}</span></a>
      </div>
    </div>`;
  return html;
}

/* ---------- Вопрос ---------- */

function questionBlock(it, { order, testMode = false, answered = false, picked, ok, typed = '', plays = 0 }) {
  const meta = [`<span class="chip acc">${SKILLS[it.s]}</span>`];
  if (!testMode) meta.push(`<span class="chip">${LEVELS[it.lv].code}</span>`);
  if (!testMode && it.t) meta.push(`<span class="sub">${esc(TOPIC[it.t].title)}</span>`);
  let html = `<div class="qmeta">${meta.join('')}</div>`;
  if (it.passage) {
    const p = PASSAGE[it.passage];
    html += `<div class="passage"><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div>`;
  }
  if (it.audio) {
    const left = LISTEN_PLAYS - plays;
    if (canSpeak()) {
      html += `
        <div class="play-wrap">
          <button class="play" data-action="play" ${testMode && left <= 0 ? 'disabled' : ''} aria-label="Прослушать">${I.play}</button>
          <div><b>Прослушайте запись</b><div class="sub">${testMode ? (left > 0 ? `Прослушиваний осталось: ${left}` : 'Прослушивания закончились') : 'Можно слушать сколько угодно'}</div></div>
        </div>`;
    } else if (testMode) {
      html += `<div class="feedback bad"><b>Звук недоступен</b>Этот браузер не умеет озвучивать текст. Пропустите вопрос — он не повлияет на результат.<div style="height:10px"></div><button class="btn small" data-action="test-skip">Пропустить вопрос</button></div>`;
    }
    if (answered || (!testMode && !canSpeak())) html += `<div class="transcript">«${esc(it.audio)}»</div>`;
  }
  const answer = it.o ? it.o[0] : it.acc[0];
  const blank = answered ? `<span class="blank filled">${esc(answer)}</span>` : '<span class="blank">&nbsp;</span>';
  html += `<p class="qtext">${esc(it.q).replace('___', blank)}</p>`;
  if (it.acc) {
    html += `
      <form id="typef" class="opts" autocomplete="off">
        <input class="type-in ${answered ? (ok ? 'right' : 'wrong') : ''}" id="typed" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Введите ответ" value="${esc(typeof typed === 'string' ? typed : '')}" ${answered ? 'disabled' : ''}>
        ${answered ? '' : '<button class="btn" type="submit">Проверить</button>'}
      </form>`;
  } else {
    html += `<div class="opts">${order.map(i => {
      let cls = '', mark = '';
      if (answered && i === 0) { cls = 'right'; mark = '✓'; }
      else if (answered && i === picked) { cls = 'wrong'; mark = '✗'; }
      return `<button class="opt ${cls}" data-action="${testMode ? 'test-pick' : 'pick'}" data-i="${i}" ${answered ? 'disabled' : ''}>${esc(it.o[i])}${mark ? `<span class="mark">${mark}</span>` : ''}</button>`;
    }).join('')}</div>`;
  }
  if (!answered) html += `<button class="idk" data-action="${testMode ? 'test-pick' : 'pick'}" data-i="-1">Не знаю</button>`;
  else {
    html += `
      <div class="feedback ${ok ? '' : 'bad'}">
        <b>${ok ? 'Верно!' : picked === -1 ? `Ответ: ${esc(answer)}` : `Неверно. Правильно: ${esc(answer)}`}</b>
        ${it.e ? esc(it.e) : ''}
      </div>`;
  }
  return html;
}
const optOrder = (store, it) => it.o ? (store[it.id] || (store[it.id] = shuffle(it.o.map((_, i) => i)))) : null;

/* ---------- Экран теста ---------- */

function vTest() {
  const t = state.test;
  if (!t) return topBar('Тест') + '<div class="empty">Тест не найден</div>';
  const total = t.secs.reduce((s, x) => s + x.items.length, 0);
  if (t.phase === 'write') {
    return `
      <div class="qtop"><button class="round-btn" data-action="test-exit" aria-label="Выйти">${I.close}</button>${bar(1)}<span class="count">финиш</span></div>
      <div class="card">
        <h3>Последний шаг — пара слов о себе</h3>
        <p class="sub">По желанию: 5–10 предложений по-английски — где живёте, чем занимаетесь и зачем вам английский. Приложение текст не оценивает, но он попадёт в отчёт для Claude, и он разберёт ошибки в письме.</p>
      </div>
      <textarea class="area" id="test-writing" placeholder="Hi! My name is…">${esc(t.writing)}</textarea>
      <div class="sub" id="wc" style="margin:0 4px">${words(t.writing)} ${plural(words(t.writing), ['слово', 'слова', 'слов'])}</div>
      <div class="next-bar"><div class="btns">
        <button class="btn ghost" data-action="test-finish" data-skip="1">Пропустить</button>
        <button class="btn" data-action="test-finish">Узнать результат</button>
      </div></div>`;
  }
  const id = t.secs[t.sec].items[t.pos], it = ITEMS[id];
  const done = t.secs.slice(0, t.sec).reduce((s, x) => s + x.items.length, 0) + t.pos;
  return `
    <div class="qtop">
      <button class="round-btn" data-action="test-exit" aria-label="Выйти">${I.close}</button>
      ${bar(done / total)}
      <span class="count">${done + 1} / ${total}</span>
    </div>
    <div class="card qcard">${questionBlock(it, { order: optOrder(t.order, it), testMode: true, plays: t.plays[id] || 0 })}</div>
    <p class="foot">Если не знаете ответ — нажмите «Не знаю», так программа точнее найдёт пробелы. Прогресс сохраняется: можно выйти и продолжить позже.</p>`;
}

/* ---------- Экран тренировки ---------- */

function vQuiz() {
  const s = session;
  if (!s) return topBar('Тренировка') + '<div class="empty">Тренировка закончилась</div>';
  if (s.done) {
    const n = s.ids.length, r = s.score / n;
    return `
      ${topBar(s.title, 'quiz-exit')}
      <div class="card lvl-hero">
        <div style="font-size:52px">${r >= 0.8 ? '🏆' : r >= 0.5 ? '👍' : '💪'}</div>
        <h3>${s.score} из ${n}</h3>
        <p class="lvl-about">${r >= 0.8 ? 'Отлично! Тема почти освоена.' : r >= 0.5 ? 'Хорошо. Ошибки попали в «Работу над ошибками» — повторим их позже.' : 'Тема пока трудная. Перечитайте правило и попробуйте ещё раз — так и должно быть в начале.'}</p>
      </div>
      <div class="btns"><button class="btn ghost" data-action="quiz-again">Ещё раз</button><button class="btn" data-action="quiz-exit">Готово</button></div>`;
  }
  const it = ITEMS[s.ids[s.i]];
  const answered = s.picked !== undefined;
  return `
    <div class="qtop">
      <button class="round-btn" data-action="quiz-exit" aria-label="Закрыть">${I.close}</button>
      ${bar((s.i + (answered ? 1 : 0)) / s.ids.length)}
      <span class="count">${s.i + 1} / ${s.ids.length}</span>
    </div>
    <div class="card qcard">${questionBlock(it, { order: optOrder(s.order, it), answered, picked: s.picked, ok: s.ok, typed: s.typed })}</div>
    ${answered ? `<div class="next-bar"><button class="btn" data-action="next">${s.i + 1 < s.ids.length ? 'Дальше' : 'Завершить'}</button></div>` : ''}`;
}

/* ---------- Урок ---------- */

function vLesson() {
  const t = TOPIC[screen.id];
  const m = mastery(t.id), n = Math.min(8, topicItems(t.id).length);
  return `
    ${topBar(LEVELS[t.lv].code + ' · ' + (t.kind === 'g' ? 'Грамматика' : 'Лексика'))}
    <div class="card">
      <h3>${esc(t.title)}</h3>
      ${m !== null ? `<div class="sub">Точность в тренировках: ${Math.round(m * 100)}%</div>${bar(m, 'thin pos')}<div style="height:8px"></div>` : ''}
      <ul class="rule">${t.rule.map(r => `<li>${rich(r)}</li>`).join('')}</ul>
    </div>
    <div class="card">
      <div class="label">Примеры</div>
      ${t.ex.map(([en, ru]) => `
        <div class="ex">
          <button class="say" data-action="say" data-text="${esc(en)}" aria-label="Произнести">${I.speaker}</button>
          <div class="mid"><div class="en">${esc(en)}</div><div class="ru">${esc(ru)}</div></div>
        </div>`).join('')}
    </div>
    <div class="next-bar"><button class="btn" data-action="lesson-drill">Тренировка · ${n} ${plural(n, ['задание', 'задания', 'заданий'])}</button></div>`;
}

/* ---------- Карточки слов ---------- */

function vCards() {
  const d = deck;
  if (!d.queue.length || d.done) {
    const left = DECK_CARDS.length + state.words.length - Object.keys(state.cards).length;
    return `
      ${topBar('Слова', 'cards-exit')}
      <div class="card lvl-hero">
        <div style="font-size:52px">${d.queue.length ? '🎉' : '🗂'}</div>
        <h3>${d.queue.length ? `Готово: ${d.known} ✓ · ${d.again} ↺` : 'На сегодня всё повторено'}</h3>
        <p class="lvl-about">${d.queue.length ? 'Слова, которые вы не вспомнили, вернутся завтра.' : 'Новые слова откроются завтра. Можно взять ещё или добавить свои.'}</p>
      </div>
      ${left > 0 ? '<button class="btn ghost" data-action="cards-more">Ещё 5 новых слов</button>' : ''}
      <button class="btn ghost" data-action="words">Мои слова</button>
      <button class="btn" data-action="cards-exit">Готово</button>`;
  }
  const c = cardById(d.queue[d.i]);
  const isNew = !state.cards[c.id];
  return `
    <div class="qtop">
      <button class="round-btn" data-action="cards-exit" aria-label="Закрыть">${I.close}</button>
      ${bar(d.i / d.queue.length)}
      <span class="count">${d.i + 1} / ${d.queue.length}</span>
    </div>
    <div class="card flash" data-action="card-flip">
      ${isNew ? '<span class="chip acc">Новое слово</span>' : ''}
      <div class="word">${esc(c.en)}</div>
      <button class="say" data-action="say" data-text="${esc(c.en)}" aria-label="Произнести">${I.speaker}</button>
      ${c.ex ? `<div class="exm">${esc(c.ex)}</div>` : ''}
      ${d.flipped ? `<div class="tr">${esc(c.ru)}</div>` : '<div class="sub">Вспомните перевод и нажмите «Показать»</div>'}
    </div>
    <div class="next-bar">${d.flipped
      ? '<div class="btns"><button class="btn ghost" data-action="card-no">Не помню</button><button class="btn" data-action="card-yes">Помню</button></div>'
      : '<button class="btn" data-action="card-flip">Показать перевод</button>'}</div>`;
}

/* ---------- Результат ---------- */

function vResult() {
  const r = state.results.find(x => x.id === screen.id) || lastResult();
  if (!r) return topBar('Результат') + '<div class="empty">Нет результатов</div>';
  const L = LEVELS[r.level], next = LEVELS[r.level + 1];
  let html = `
    ${topBar('Результат · ' + fmtDate(r.date))}
    <div class="card lvl-hero">
      <div class="lvl-badge">${L.code}</div>
      <div class="lvl-name">${L.en} · ${L.ru}</div>
      <p class="lvl-about">${L.about}</p>
      ${next && !r.manual ? `<div class="bar-row" style="margin-top:12px"><span>До ${next.code}</span>${bar(r.progress)}<span class="v">${Math.round(r.progress * 100)}%</span></div>` : ''}
    </div>`;
  if (r.manual) {
    html += `
      <div class="card">
        <p>Уровень указан вручную${r.source ? ` (${esc(r.source)})` : ''}. Встроенный тест покажет конкретные темы, которые стоит подтянуть, и программа станет точнее.</p>
        <button class="btn soft" data-action="test-start">Пройти тест</button>
      </div>`;
  } else {
    html += `<div class="card"><h3>По уровням</h3>${[1, 2, 3, 4, 5, 6].map(lv => {
      const p = r.per[lv];
      return `<div class="bar-row"><span>${LEVELS[lv].code}</span>${p ? bar(p[0] / p[1], p[0] / p[1] >= PASS ? 'pos' : '') : bar(0)}<span class="v">${p ? `${p[0]}/${p[1]}` : '—'}</span></div>`;
    }).join('')}<p class="sub" style="margin-top:8px">Уровень засчитывается от ${PASS * 100}% верных ответов.</p></div>`;
    html += `<div class="card"><h3>Навыки</h3>${Object.keys(SKILLS).filter(k => r.skills[k]).map(k =>
      `<div class="bar-row"><span>${SKILLS[k]}</span>${bar(r.skills[k][0] / r.skills[k][1])}<span class="v">${pct(...r.skills[k])}%</span></div>`).join('')}</div>`;
    const weak = Object.entries(r.topics).filter(([id]) => TOPIC[id]).sort((a, b) => TOPIC[a[0]].lv - TOPIC[b[0]].lv || b[1] - a[1]);
    if (weak.length) {
      html += `<div class="card"><h3>Что подтянуть</h3><div class="rows">${weak.map(([id, n]) =>
        row('lesson', `data-id="${id}"`, esc(TOPIC[id].title), `${LEVELS[TOPIC[id].lv].code} · ${n} ${plural(n, ['ошибка', 'ошибки', 'ошибок'])}`)).join('')}</div></div>`;
    }
    const wrong = r.wrong.filter(([id]) => ITEMS[id]);
    if (wrong.length) html += `<button class="btn ghost" data-action="result-wrong" data-id="${r.id}">Разобрать ошибки теста (${wrong.length})</button>`;
    if (r.writing) {
      html += `
        <div class="card"><h3>Ваш текст</h3><p style="white-space:pre-wrap">${esc(r.writing)}</p>
        <button class="btn soft" data-action="copy-writing" data-id="${r.id}">Скопировать для проверки Claude</button></div>`;
    }
  }
  if (state.plan && state.plan.base !== r.id && r === lastResult()) {
    html += `<button class="btn" data-action="plan-rebuild">Обновить программу под этот результат</button>`;
  }
  html += `
    <button class="btn ${state.plan && state.plan.base !== r.id && r === lastResult() ? 'ghost' : ''}" data-action="to-today">К программе</button>
    <button class="btn ghost" data-action="report">Отчёт для Claude</button>`;
  return html;
}

/* ---------- Практика ---------- */

function vPractice() {
  const mc = mistakeList().length, due = dueIds().length, fl = freshLeft();
  const res = lastResult(), weak = res?.topics || {};
  let html = `
    <div class="card"><div class="rows">
      ${row('mistakes', '', '🩹 Работа над ошибками', mc ? `${mc} ${plural(mc, ['вопрос', 'вопроса', 'вопросов'])} — уйдут после двух верных ответов подряд` : 'Ошибок пока нет')}
      ${row('cards', '', '🗂 Слова', `К повторению: ${due} · новых сегодня: ${fl}`)}
      ${row('words', '', '✏️ Мои слова', state.words.length ? `${state.words.length} ${plural(state.words.length, ['слово', 'слова', 'слов'])}` : 'Добавляйте слова, которые встретили сами')}
      ${row('mix', '', '🎲 Случайная тренировка', '10 вопросов по вашему уровню, слабые темы чаще')}
    </div></div>`;
  for (let lv = 1; lv <= 6; lv++) {
    const list = TOPICS.filter(t => t.lv === lv);
    html += `<div class="sect">${levelName(lv)}</div><div class="card"><div class="rows">${list.map(t => {
      const m = mastery(t.id);
      return `
        <button class="row topic-row" data-action="lesson" data-id="${t.id}">
          <span class="mid">
            <span class="t1">${esc(t.title)}${weak[t.id] ? '<span class="dot" title="Ошибки в тесте"></span>' : ''}</span>
            <span class="t2">${t.kind === 'v' ? 'Лексика · ' : ''}${m !== null ? `Точность ${Math.round(m * 100)}%` : state.topics[t.id] ? 'Начато' : 'Ещё не тренировались'}</span>
            ${m === null ? '' : bar(m, 'thin pos')}
          </span>
          <span class="chev">${I.chevR}</span>
        </button>`;
    }).join('')}</div></div>`;
  }
  return html + '<p class="foot">Красная точка — тема, в которой были ошибки в последнем тесте.</p>';
}

/* ---------- Прогресс ---------- */

function vProgress() {
  const s = streak(), active = Object.keys(state.days).length;
  const doneTasks = state.plan ? Object.keys(state.plan.done).length : 0;
  const cells = [];
  for (let i = 27; i >= 0; i--) {
    const d = addDays(today(), -i);
    cells.push(`<i class="${state.days[d] ? 'on' : ''} ${i === 0 ? 'today' : ''}" title="${fmtDate(d)}"></i>`);
  }
  const learned = Object.values(state.cards).filter(c => c.b >= 3).length;
  let html = `
    <div class="stats">
      <div class="stat"><b>${s}</b><span>${plural(s, ['день', 'дня', 'дней'])} подряд 🔥</span></div>
      <div class="stat"><b>${active}</b><span>${plural(active, ['день', 'дня', 'дней'])} занятий</span></div>
      <div class="stat"><b>${learned}</b><span>${plural(learned, ['слово выучено', 'слова выучено', 'слов выучено'])}</span></div>
    </div>
    <div class="card"><div class="label">Последние 4 недели</div><div class="heat">${cells.join('')}</div>
    ${state.plan ? `<p class="sub" style="margin:12px 0 0">Заданий программы выполнено: ${doneTasks}</p>` : ''}</div>
    <div class="card">
      <h3>Отчёт для Claude</h3>
      <p class="sub">Уровень, ошибки теста, слабые темы, ваша цель и прогресс — одним текстом. Вставьте его в чат с Claude, и он доработает программу, объяснит трудные темы или проверит ваш текст.</p>
      <div class="btns"><button class="btn soft" data-action="report-copy">Скопировать</button><button class="btn" data-action="report">Показать</button></div>
    </div>`;
  if (state.results.length > 1) {
    html += `<div class="card"><h3>Рост уровня</h3>${state.results.map(r =>
      `<div class="bar-row"><span>${fmtDate(r.date)}</span>${bar((r.level + (r.level < 6 ? r.progress || 0 : 0)) / 6)}<span class="v">${LEVELS[r.level].code}</span></div>`).join('')}</div>`;
  }
  const practiced = Object.keys(state.topics).filter(id => TOPIC[id] && mastery(id) !== null).sort((a, b) => mastery(a) - mastery(b));
  if (practiced.length) {
    html += `<div class="card"><h3>Темы</h3>${practiced.map(id => {
      const m = mastery(id);
      return `<div class="bar-row" style="grid-template-columns:1fr 90px 46px"><span>${esc(TOPIC[id].title)}</span>${bar(m, m >= 0.8 ? 'pos' : '')}<span class="v">${Math.round(m * 100)}%</span></div>`;
    }).join('')}</div>`;
  }
  return html + '<button class="btn ghost" data-action="settings">Настройки и резервная копия</button>';
}

/* ================= Шторки ================= */

function openSheet(html) {
  const root = $('#sheet');
  root.innerHTML = `<div class="backdrop" data-action="close"></div><div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
  requestAnimationFrame(() => root.classList.add('open'));
  return root.querySelector('.panel');
}
function closeSheet() {
  const root = $('#sheet');
  root.classList.remove('open');
  root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('locked');
  setTimeout(() => { if (!root.classList.contains('open')) root.innerHTML = ''; }, 260);
}
const sheetOpen = () => $('#sheet').classList.contains('open');
const head = (title, submit = 'Готово') => `
  <div class="sheet-head">
    <button type="button" class="link" data-action="close">${submit ? 'Отмена' : 'Закрыть'}</button>
    <h2>${title}</h2>
    ${submit ? `<button type="submit" class="link strong">${submit}</button>` : '<span></span>'}
  </div>`;

function openPlan() {
  const pl = state.plan;
  if (!pl) return;
  const cur = currentDay(pl);
  const p = state.profile;
  openSheet(`
    ${head(`Программа на ${WEEKS} недель`, '')}
    <p class="hint" style="margin:0 4px 14px">Уровень ${LEVELS[pl.level].code} → ${LEVELS[Math.min(6, pl.level + 1)].code} · ${pl.M} мин × ${pl.D} ${plural(pl.D, ['день', 'дня', 'дней'])} в неделю · ${GOALS[pl.goal]}</p>
    ${pl.weeks.map((wk, w) => {
      const keys = wk.days.flatMap((tasks, d) => tasks.map((_, i) => taskKey(w, d, i)));
      const done = keys.filter(k => pl.done[k]).length;
      return `
        <details class="card week" ${cur && cur.w === w ? 'open' : ''}>
          <summary>
            <div><h3>Неделя ${w + 1}${w === 3 || w === WEEKS - 1 ? ' 🏁' : ''}</h3><div class="sub">${wk.topics.map(t => esc(TOPIC[t].title)).join(' · ')}</div></div>
            <span class="chip ${done === keys.length ? 'ok' : 'acc'}">${done}/${keys.length}</span>
          </summary>
          ${wk.days.map((tasks, d) => `<div class="day-t">День ${d + 1}${cur && cur.w === w && cur.d === d ? ' · сегодня' : ''}</div><div class="rows">${tasks.map((t, i) => taskRow(t, taskKey(w, d, i))).join('')}</div>`).join('')}
        </details>`;
    }).join('')}
    ${p.minutes !== pl.M || p.days !== pl.D || p.goal !== pl.goal ? '<p class="hint" style="margin:0 4px 14px">Настройки анкеты изменились — перестройте программу, чтобы их учесть.</p>' : ''}
    <button class="btn ghost" data-action="plan-rebuild">Перестроить программу</button>`);
}

function openTaskSheet(key, t) {
  const pl = state.plan, done = !!pl.done[key];
  const lvl = LEVELS[pl.level].code;
  const [w] = key.split('.').map(Number);
  const topics = pl.weeks[w].topics.map(id => TOPIC[id].title).join(', ');
  let body = '';
  if (t.k === 'listen' || t.k === 'read') {
    const [name, url, how] = resource(t);
    body = `
      <div class="card">
        <h3>${esc(name)}</h3>
        <p>${esc(how)}</p>
        <p class="sub">${t.k === 'listen' ? 'Совет: сначала слушайте без текста, потом — с английскими субтитрами. Повторяйте за диктором вслух (shadowing).' : 'Совет: не переводите каждое слово. Догадывайтесь по контексту, а 5 самых полезных слов добавьте в «Мои слова».'}</p>
        ${url ? `<a class="btn soft" href="${esc(url)}" target="_blank" rel="noopener" style="display:grid;place-items:center;text-decoration:none">Открыть</a>` : ''}
      </div>`;
  } else if (t.k === 'speak') {
    const prompt = resource(t);
    const ask = `Давай потренируем разговорный английский. Мой уровень — ${lvl}. Тема: «${prompt}». Задавай мне вопросы по одному на английском, а после каждого моего ответа коротко исправляй ошибки и предлагай, как сказать естественнее. Темы грамматики этой недели: ${topics}.`;
    body = `
      <div class="card">
        <div class="label">Тема</div>
        <h3 style="margin-top:6px">${esc(prompt)}</h3>
        <ul class="rule">
          <li>Включите диктофон и говорите 2–3 минуты без остановки. Ошибки — это нормально.</li>
          <li>Постарайтесь использовать темы недели: ${esc(topics)}.</li>
          <li>Прослушайте запись. Выпишите 3 места, где не хватило слов, и найдите, как это сказать.</li>
        </ul>
      </div>
      <div class="card">
        <p class="sub">Можно потренироваться с Claude — голосом или текстом. Скопируйте запрос и вставьте в чат:</p>
        <button class="btn soft" data-action="copy" data-text="${esc(ask)}">Скопировать запрос для Claude</button>
      </div>`;
  } else if (t.k === 'write') {
    const prompt = resource(t), text = state.writings[key] || '';
    body = `
      <div class="card"><div class="label">Задание</div><h3 style="margin-top:6px">${esc(prompt)}</h3>
      <p class="sub">Используйте темы недели: ${esc(topics)}.</p></div>
      <textarea class="area" id="task-writing" data-k="${key}" placeholder="Start writing here…">${esc(text)}</textarea>
      <div class="sub" id="wc" style="margin:0 4px 14px">${words(text)} ${plural(words(text), ['слово', 'слова', 'слов'])}</div>
      <button class="btn soft" data-action="copy-task-writing" data-k="${key}">Скопировать для проверки Claude</button>`;
  }
  openSheet(`
    ${head(taskInfo(t).title.replace(/:.*/, ''), '')}
    ${body}
    <button class="btn ${done ? 'ghost' : ''}" data-action="task-done" data-k="${key}">${done ? 'Снять отметку' : 'Готово — отметить выполненным'}</button>`);
}

function openSettings() {
  const p = openSheet(`
    ${head('Настройки', '')}
    <div class="card">${profileForm()}</div>
    ${state.plan ? '<button class="btn ghost" data-action="plan-rebuild">Перестроить программу по анкете</button>' : ''}
    <div class="group">
      <label class="field"><span>Тема</span>
        <select id="s-theme">${[['auto', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([v, n]) => `<option value="${v}" ${state.ui.theme === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
      </label>
    </div>
    <button class="btn ghost" data-action="manual">Указать уровень вручную</button>
    <div class="sect">Резервная копия</div>
    <button class="btn ghost" data-action="export">Скачать копию (JSON)</button>
    <label class="btn ghost" style="display:grid;place-items:center">Восстановить из файла<input type="file" id="imp" accept="application/json,.json" hidden></label>
    <p class="hint" style="margin:0 4px 14px">Всё хранится только на этом устройстве, в браузере.</p>
    <button class="btn danger" data-action="reset">Удалить все данные</button>`);
  $('#s-theme', p).addEventListener('change', e => { state.ui.theme = e.target.value; save(); render(); });
  $('#imp', p).addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then(txt => {
      state = normalize(JSON.parse(txt));
      save(); closeSheet(); screen = null; render(); toast('Данные восстановлены');
    }).catch(() => toast('Не удалось прочитать файл'));
  });
}

function openManual() {
  let sel = curLevel() || 3;
  const p = openSheet(`
    <form id="manf">
      ${head('Мой уровень')}
      <p class="hint" style="margin:0 4px 14px">Выберите уровень по шкале CEFR или введите баллы EF SET — уровень определится сам.</p>
      <div class="pills" id="man-lv">${[1, 2, 3, 4, 5, 6].map(lv => `<button type="button" class="pill" data-lv="${lv}" aria-pressed="${lv === sel}">${LEVELS[lv].code}</button>`).join('')}</div>
      <div class="group">
        <label class="field"><span>Баллы EF SET</span><input id="man-ef" inputmode="numeric" placeholder="0–100"></label>
        <label class="field"><span>Источник</span><input id="man-src" placeholder="напр. Cambridge, школа"></label>
      </div>
      <p class="sub" id="man-about" style="margin:0 4px 14px">${LEVELS[sel].en} · ${LEVELS[sel].ru}. ${LEVELS[sel].about}</p>
      <button type="submit" class="btn">Сохранить уровень</button>
    </form>`);
  const pick = lv => {
    sel = lv;
    p.querySelectorAll('#man-lv .pill').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.lv === lv)));
    $('#man-about', p).textContent = `${LEVELS[lv].en} · ${LEVELS[lv].ru}. ${LEVELS[lv].about}`;
  };
  $('#man-lv', p).addEventListener('click', e => { const b = e.target.closest('[data-lv]'); if (b) pick(+b.dataset.lv); });
  // Шкала EF SET: 1–30 A1, 31–40 A2, 41–50 B1, 51–60 B2, 61–70 C1, 71–100 C2
  $('#man-ef', p).addEventListener('input', e => {
    const v = parseInt(e.target.value, 10);
    if (v >= 0 && v <= 100) pick(v <= 30 ? 1 : v <= 40 ? 2 : v <= 50 ? 3 : v <= 60 ? 4 : v <= 70 ? 5 : 6);
  });
  $('#manf', p).addEventListener('submit', e => {
    e.preventDefault();
    const ef = parseInt($('#man-ef', p).value, 10);
    const src = [$('#man-src', p).value.trim(), ef >= 0 && ef <= 100 ? `EF SET ${ef}` : ''].filter(Boolean).join(', ');
    const res = { id: uid(), date: today(), level: sel, progress: 0, manual: true, source: src, per: {}, skills: {}, topics: {}, tot: {}, wrong: [] };
    state.results.push(res);
    if (!state.plan || confirm('Перестроить программу под этот уровень? Отметки о выполненных заданиях сбросятся.')) state.plan = buildPlan(res);
    save(); closeSheet();
    screen = { name: 'result', id: res.id };
    render(); window.scrollTo(0, 0);
  });
}

function openWords() {
  const list = state.words.slice().reverse();
  const p = openSheet(`
    <form id="wordf">
      ${head('Мои слова', 'Добавить')}
      <div class="group">
        <label class="field"><span>Слово</span><input id="w-en" placeholder="take for granted" autocapitalize="off" required></label>
        <label class="field"><span>Перевод</span><input id="w-ru" placeholder="принимать как должное" required></label>
        <label class="field"><span>Пример</span><input id="w-ex" placeholder="по желанию" autocapitalize="off"></label>
      </div>
    </form>
    <p class="hint">Новые слова попадут в карточки первыми.</p>
    ${list.length ? `<div class="card"><div class="rows">${list.map(w => `
      <div class="row">
        <button class="say" data-action="say" data-text="${esc(w.en)}" aria-label="Произнести">${I.speaker}</button>
        <span class="mid"><span class="t1">${esc(w.en)}</span><span class="t2">${esc(w.ru)}${state.cards[w.id] ? ` · коробка ${state.cards[w.id].b}` : ' · новое'}</span></span>
        <button class="link" data-action="word-del" data-id="${w.id}" style="color:var(--neg)">Удалить</button>
      </div>`).join('')}</div></div>` : '<div class="empty">Пока пусто. Добавляйте слова из фильмов, статей и подкастов.</div>'}`);
  $('#wordf', p).addEventListener('submit', e => {
    e.preventDefault();
    const en = $('#w-en', p).value.trim(), ru = $('#w-ru', p).value.trim();
    if (!en || !ru) return;
    state.words.push({ id: 'u:' + uid(), en, ru, ex: $('#w-ex', p).value.trim() });
    save(); openWords(); toast('Слово добавлено'); if (!screen) render();
  });
}

function openReport() {
  const text = report();
  openSheet(`
    ${head('Отчёт для Claude', '')}
    <p class="hint" style="margin:0 4px 14px">Скопируйте текст и вставьте в чат с Claude — он составит или доработает программу под ваши ошибки.</p>
    <textarea class="area" readonly style="min-height:300px;font-size:14px">${esc(text)}</textarea>
    <div class="btns"><button class="btn ghost" data-action="report-share">Поделиться</button><button class="btn" data-action="report-copy">Скопировать</button></div>`);
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `english-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ================= События ================= */

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function rebuildPlan() {
  const r = lastResult();
  if (!r) return;
  if (state.plan && !confirm('Перестроить программу? Отметки о выполненных заданиях сбросятся.')) return;
  state.plan = buildPlan(r);
  ahead = false;
  save();
  if (sheetOpen()) closeSheet();
  screen = null; tab = 'today';
  render(); window.scrollTo(0, 0);
  toast('Программа обновлена');
}

let lockUntil = 0;   // защита от двойного нажатия: следующий вопрос появляется под пальцем

const actions = {
  tab: el => { tab = el.dataset.v; screen = null; render(); window.scrollTo(0, 0); },
  back,
  close: closeSheet,
  settings: openSettings,
  manual: openManual,
  prof: el => {
    const p = state.profile, k = el.dataset.k, v = el.dataset.v;
    if (k === 'focus') p.focus = p.focus.includes(v) ? p.focus.filter(x => x !== v) : [...p.focus, v];
    else p[k] = k === 'goal' ? v : Number(v);
    save();
    el.parentElement.innerHTML = profilePills(k);
  },
  'test-start': () => { if (sheetOpen()) closeSheet(); startTest(); },
  'test-restart': () => {
    if (!confirm('Начать тест заново? Ответы незаконченного теста пропадут.')) return;
    state.test = null; startTest();
  },
  'test-pick': el => {
    if (Date.now() < lockUntil) return;
    lockUntil = Date.now() + 400;
    el.classList.add('picked');
    setTimeout(() => testAnswer(Number(el.dataset.i)), 160);
  },
  'test-skip': () => testAnswer(null),
  'test-exit': () => { screen = null; render(); window.scrollTo(0, 0); toast('Тест сохранён — продолжите, когда удобно'); },
  'test-finish': el => finishTest(el.dataset.skip ? '' : state.test.writing),
  play: () => {
    if (screen?.name === 'test') {
      const t = state.test, id = t.secs[t.sec].items[t.pos];
      if ((t.plays[id] || 0) >= LISTEN_PLAYS) return;
      if (!speak(ITEMS[id].audio, ITEMS[id].lv <= 2 ? 0.85 : 0.95)) return;
      t.plays[id] = (t.plays[id] || 0) + 1;
      save(); render();
    } else if (session) {
      const it = ITEMS[session.ids[session.i]];
      speak(it.audio, it.lv <= 2 ? 0.85 : 0.95);
    }
  },
  say: el => speak(el.dataset.text, 0.9),
  pick: el => { if (session && session.picked === undefined) practiceAnswer(Number(el.dataset.i)); },
  next: practiceNext,
  'quiz-exit': () => { session = null; back(); },
  'quiz-again': () => {
    const s = session;
    const lesson = screen.back?.name === 'lesson' ? screen.back.id : null;
    const ids = lesson ? drillIds(lesson) : shuffle(s.ids);
    session = { ...s, ids, i: 0, order: {}, picked: undefined, typed: '', ok: null, score: 0, done: false, task: null };
    render(); window.scrollTo(0, 0);
  },
  lesson: el => go('lesson', { id: el.dataset.id }),
  'lesson-drill': () => startSession(drillIds(screen.id), { title: TOPIC[screen.id].title, task: screen.task || null }),
  mistakes: () => {
    const ids = mistakeIds();
    if (ids.length) startSession(ids, { title: 'Работа над ошибками' });
    else toast('Ошибок для разбора нет — отлично!');
  },
  mix: () => startSession(mixIds(), { title: 'Случайная тренировка' }),
  cards: () => startCards(),
  'cards-more': () => startCards(deck?.task || null, 5),
  'cards-exit': () => { deck = null; back(); },
  'card-flip': () => { if (deck && !deck.flipped) { deck.flipped = true; render(); } },
  'card-yes': () => cardAnswer(true),
  'card-no': () => cardAnswer(false),
  words: openWords,
  'word-del': el => {
    const id = el.dataset.id;
    state.words = state.words.filter(w => w.id !== id);
    delete state.cards[id];
    save(); openWords();
  },
  result: el => go('result', { id: el.dataset.id }),
  'result-wrong': el => {
    const r = state.results.find(x => x.id === el.dataset.id);
    startSession(r.wrong.map(([id]) => id).filter(id => ITEMS[id]), { title: 'Ошибки теста' });
  },
  'copy-writing': el => {
    const r = state.results.find(x => x.id === el.dataset.id);
    copyText(`Проверь мой текст на английском (мой уровень — ${LEVELS[r.level].code}). Исправь ошибки, объясни каждую по-русски и предложи более естественные формулировки.\n\nМой текст:\n${r.writing}`, 'Текст скопирован — вставьте его в чат с Claude');
  },
  'to-today': () => { screen = null; tab = 'today'; render(); window.scrollTo(0, 0); },
  plan: openPlan,
  'plan-build': rebuildPlan,
  'plan-rebuild': rebuildPlan,
  ahead: () => { ahead = true; render(); },
  'task-open': el => openTask(el.dataset.k),
  'task-check': el => {
    const k = el.dataset.k, on = !state.plan.done[k];
    markDone(k, on);
    save();
    el.setAttribute('aria-pressed', String(on));
    el.closest('.task').classList.toggle('done', on);
    render();
  },
  'task-done': el => {
    const k = el.dataset.k;
    markDone(k, !state.plan.done[k]);
    save(); closeSheet(); render();
    if (state.plan.done[k]) toast('Отлично! Задание выполнено');
  },
  copy: el => copyText(el.dataset.text, 'Скопировано — вставьте в чат с Claude'),
  'copy-task-writing': el => {
    const k = el.dataset.k, t = taskAt(k), text = (state.writings[k] || '').trim();
    if (!text) { toast('Сначала напишите текст'); return; }
    copyText(`Проверь мой текст на английском (мой уровень — ${LEVELS[state.plan.level].code}). Исправь ошибки, объясни каждую по-русски и предложи более естественные формулировки.\n\nЗадание: ${resource(t)}\n\nМой текст:\n${text}`, 'Скопировано — вставьте в чат с Claude');
  },
  report: openReport,
  'report-copy': () => copyText(report(), 'Отчёт скопирован — вставьте его в чат с Claude'),
  'report-share': () => shareText(report()),
  export: exportJSON,
  reset: () => {
    if (!confirm('Удалить результаты тестов, программу, прогресс и слова? Это нельзя отменить.')) return;
    const ui = state.ui;
    state = defaults(); state.ui = ui;
    session = null; deck = null; screen = null; tab = 'today';
    save(); closeSheet(); render(); toast('Все данные удалены');
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'typef') return;
  e.preventDefault();
  const v = $('#typed').value;
  if (!v.trim()) { toast('Введите ответ или нажмите «Не знаю»'); return; }
  if (session && session.picked === undefined) practiceAnswer(v);
});
document.addEventListener('input', e => {
  const id = e.target.id;
  if (id !== 'test-writing' && id !== 'task-writing') return;
  const v = e.target.value;
  if (id === 'test-writing') state.test.writing = v;
  else state.writings[e.target.dataset.k] = v;
  save();
  const wc = $('#wc');
  if (wc) wc.textContent = `${words(v)} ${plural(words(v), ['слово', 'слова', 'слов'])}`;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sheetOpen()) { closeSheet(); return; }
  if (sheetOpen() || !screen || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  // Клавиатура на компьютере: 1–4 — вариант ответа, Enter — дальше / показать перевод
  if (/^[1-4]$/.test(e.key)) { const b = document.querySelectorAll('.opt:not([disabled])')[+e.key - 1]; if (b) b.click(); }
  else if (e.key === 'Enter') { const b = $('[data-action="next"]') || $('[data-action="card-flip"]'); if (b) { e.preventDefault(); b.click(); } }
  else if (deck && deck.flipped && screen.name === 'cards' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) cardAnswer(e.key === 'ArrowRight');
});
// Новый день или возврат в приложение: обновить «Сегодня»
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !screen && !sheetOpen()) render();
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
