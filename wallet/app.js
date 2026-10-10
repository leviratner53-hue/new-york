'use strict';

/* ================= Данные ================= */

const STORE_KEY = 'wallet:v1';
const PALETTE = ['#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4', '#E11D48', '#8B5CF6', '#64748B'];
const ACC_ICONS = ['💵', '💳', '🏦', '💰', '🪙', '👛', '📈', '🎯', '✈️', '🏠', '🚗', '🎁'];
const CAT_ICONS = ['🛒', '🍽️', '☕', '🚌', '⛽', '🚕', '🏠', '💡', '📱', '🔁', '👕', '💻', '❤️', '💊', '🎬', '🎮', '🎁', '✈️', '📚', '🐾', '👶', '💇', '🏋️', '🍷', '🧾', '💼', '💸', '↩️', '📦', '🎓'];
const CURRENCIES = ['₪', '$', '€', '₽', '£', '₴', '₸'];
const PERIODS = { week: 'Каждую неделю', month: 'Каждый месяц', year: 'Каждый год' };
const PERIODS_SHORT = { week: 'в неделю', month: 'в месяц', year: 'в год' };

const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);

function defaults() {
  const c = (name, icon, color, type = 'expense') => ({ id: uid(), name, icon, color, type });
  return {
    version: 1,
    currency: '₪',
    accounts: [
      { id: uid(), name: 'Наличные', icon: '💵', color: '#14B8A6', initial: 0 },
      { id: uid(), name: 'Карта', icon: '💳', color: '#F59E0B', initial: 0 }
    ],
    categories: [
      c('Продукты', '🛒', '#EF4444'),
      c('Кафе и рестораны', '🍽️', '#F97316'),
      c('Транспорт', '🚌', '#3B82F6'),
      c('Жильё', '🏠', '#8B5CF6'),
      c('Коммуналка', '💡', '#F59E0B'),
      c('Связь и интернет', '📱', '#06B6D4'),
      c('Подписки', '🔁', '#A855F7'),
      c('Одежда и обувь', '👕', '#EC4899'),
      c('Электроника', '💻', '#6366F1'),
      c('Здоровье', '❤️', '#E11D48'),
      c('Развлечения', '🎬', '#14B8A6'),
      c('Подарки', '🎁', '#84CC16'),
      c('Путешествия', '✈️', '#0EA5E9'),
      c('Другое', '📦', '#64748B'),
      c('Зарплата', '💼', '#22C55E', 'income'),
      c('Подработка', '💸', '#14B8A6', 'income'),
      c('Подарки', '🎁', '#84CC16', 'income'),
      c('Возврат', '↩️', '#06B6D4', 'income'),
      c('Другое', '📦', '#64748B', 'income')
    ],
    tx: [],
    budgets: {},
    subs: [],
    ui: { theme: 'auto', hide: false }
  };
}

function normalize(s) {
  const d = defaults();
  return {
    version: 1,
    currency: typeof s.currency === 'string' ? s.currency : d.currency,
    accounts: Array.isArray(s.accounts) ? s.accounts : d.accounts,
    categories: Array.isArray(s.categories) && s.categories.length ? s.categories : d.categories,
    tx: Array.isArray(s.tx) ? s.tx : [],
    budgets: s.budgets && typeof s.budgets === 'object' ? s.budgets : {},
    subs: Array.isArray(s.subs) ? s.subs : [],
    ui: Object.assign({ theme: 'auto', hide: false }, s.ui)
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

/* ================= Деньги и даты ================= */

// Суммы хранятся в копейках/агоротах (целые числа).
function fmt(c, { sign = false, short = false } = {}) {
  const v = Math.abs(c) / 100;
  const s = short
    ? Math.round(v).toLocaleString('en-US')
    : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const p = c < 0 ? '−' : (sign && c > 0 ? '+' : '');
  return `${p}${s} ${state.currency}`;
}
const money = (c, o) => `<span class="money">${fmt(c, o)}</span>`;

// «12,5» → 1250, «20+15.5» → 3550
function parseAmount(str) {
  const parts = String(str).replace(/\s/g, '').replace(/,/g, '.').split('+');
  let total = 0;
  for (const p of parts) {
    if (p === '') continue;
    const n = Number(p);
    if (!isFinite(n)) return NaN;
    total += n;
  }
  return Math.round(total * 100);
}
const amountInput = c => c ? String(c / 100) : '';
function autoWidth(input) {
  const fit = () => { input.style.width = Math.max(1, (input.value || input.placeholder).length) + 0.6 + 'ch'; };
  input.addEventListener('input', fit);
  fit();
}

const MONTH = new Intl.DateTimeFormat('ru-RU', { month: 'long' });
const MONTH_SHORT = new Intl.DateTimeFormat('ru-RU', { month: 'short' });
const DAY_MONTH = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);

function dayTitle(d) {
  const diff = daysBetween(d, today());
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  const dt = parseDate(d);
  const yr = dt.getFullYear() !== new Date().getFullYear() ? ` ${dt.getFullYear()}` : '';
  return `${DAY_MONTH.format(dt)}${yr}, ${WEEKDAY.format(dt)}`;
}
function shortDate(d) {
  const dt = parseDate(d);
  return DAY_MONTH.format(dt) + (dt.getFullYear() !== new Date().getFullYear() ? ` ${dt.getFullYear()}` : '');
}
function relDays(d) {
  const n = daysBetween(today(), d);
  if (n < 0) return 'просрочено';
  if (n === 0) return 'сегодня';
  if (n === 1) return 'завтра';
  return `через ${n} дн.`;
}

/* ================= Период ================= */

const now = new Date();
let period = { mode: 'month', y: now.getFullYear(), m: now.getMonth() };

function range(p = period) {
  if (p.mode === 'year') return { start: `${p.y}-01-01`, end: `${p.y}-12-31` };
  const last = new Date(p.y, p.m + 1, 0).getDate();
  return { start: `${p.y}-${pad(p.m + 1)}-01`, end: `${p.y}-${pad(p.m + 1)}-${pad(last)}` };
}
function periodLabel() {
  if (period.mode === 'year') return `${period.y} год`;
  const name = cap(MONTH.format(new Date(period.y, period.m, 1)));
  return period.y === new Date().getFullYear() ? name : `${name} ${period.y}`;
}
function shiftPeriod(d) {
  if (period.mode === 'year') period.y += d;
  else {
    const dt = new Date(period.y, period.m + d, 1);
    period.y = dt.getFullYear(); period.m = dt.getMonth();
  }
}
function isCurrentPeriod() { const { start, end } = range(); const t = today(); return t >= start && t <= end; }

/* ================= Расчёты ================= */

const accById = id => state.accounts.find(a => a.id === id);
const catById = id => state.categories.find(c => c.id === id);
const catsOf = type => state.categories.filter(c => c.type === type);
const FALLBACK_CAT = { name: 'Без категории', icon: '❔', color: '#64748B' };

function txIn(start, end) { return state.tx.filter(t => t.date >= start && t.date <= end); }
function totals(list) {
  let inc = 0, exp = 0;
  for (const t of list) {
    if (t.type === 'income') inc += t.amount;
    else if (t.type === 'expense') exp += t.amount;
  }
  return { inc, exp, net: inc - exp };
}
function balance(accId, upTo = today()) {
  const a = accById(accId);
  let b = a ? a.initial : 0;
  for (const t of state.tx) {
    if (t.date > upTo) continue;
    if (t.type === 'income' && t.accountId === accId) b += t.amount;
    else if (t.type === 'expense' && t.accountId === accId) b -= t.amount;
    else if (t.type === 'transfer') {
      if (t.accountId === accId) b -= t.amount;
      if (t.toAccountId === accId) b += t.amount;
    }
  }
  return b;
}
const netWorth = upTo => state.accounts.reduce((s, a) => s + balance(a.id, upTo), 0);

function byCategory(list, type = 'expense') {
  const map = new Map();
  for (const t of list) {
    if (t.type !== type) continue;
    map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
  }
  return [...map.entries()]
    .map(([id, value]) => ({ id, value, cat: catById(id) || FALLBACK_CAT }))
    .sort((a, b) => b.value - a.value);
}
function sortTx(list) {
  return list.slice().sort((a, b) => (b.date.localeCompare(a.date)) || ((b.ts || 0) - (a.ts || 0)));
}

/* Бюджеты: лимит на месяц, для года ×12 */
function budgetMult() { return period.mode === 'year' ? 12 : 1; }
function totalBudget() { return Object.values(state.budgets).reduce((s, v) => s + v, 0) * budgetMult(); }

/* Подписки и регулярные платежи */
function addPeriod(dateStr, per, anchor) {
  const d = parseDate(dateStr);
  if (per === 'week') { d.setDate(d.getDate() + 7); return ymd(d); }
  const y = d.getFullYear(), m = d.getMonth() + (per === 'year' ? 12 : 1);
  const day = Math.min(anchor || d.getDate(), new Date(y, m + 1, 0).getDate());
  return ymd(new Date(y, m, day));
}
function occurrences(sub, start, end) {
  const out = [];
  let d = sub.next, guard = 0;
  while (d <= end && guard++ < 400) {
    if (d >= start) out.push(d);
    d = addPeriod(d, sub.period, sub.day);
  }
  return out;
}
const monthlyEq = s => s.period === 'year' ? s.amount / 12 : s.period === 'week' ? s.amount * 52 / 12 : s.amount;
const activeSubs = () => state.subs.filter(s => s.active !== false);
const pendingSubs = () => activeSubs().filter(s => s.next <= today()).sort((a, b) => a.next.localeCompare(b.next));

/* ================= Иконки ================= */

const sv = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: sv('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  list: sv('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  piggy: sv('<path d="M19 9.5c1 .6 1.7 1.6 2 2.5v2h-1.6a7 7 0 0 1-2.4 2.6V20h-3v-2.2a8 8 0 0 1-3 0V20H8v-3.4A6.5 6.5 0 0 1 5 11c0-3.6 3.4-6 7.5-6 2 0 3.8.5 5.1 1.4L19.5 5v4.5z"/><path d="M16 10.5h.01M2 10a2 2 0 0 0 3 1.7"/>'),
  repeat: sv('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>'),
  chart: sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  eye: sv('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: sv('<path d="M17.9 17.9A10.8 10.8 0 0 1 12 19c-7 0-11-7-11-7a19.8 19.8 0 0 1 5.1-5.9M9.9 4.2A9.6 9.6 0 0 1 12 4c7 0 11 7 11 7a19.6 19.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M1 1l22 22"/>'),
  chevL: sv('<path d="M15 18l-6-6 6-6"/>'),
  chevR: sv('<path d="M9 18l6-6-6-6"/>'),
  search: sv('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>')
};

/* ================= Отрисовка ================= */

let view = 'overview';
let filter = { acc: null, cat: null, q: '' };

const TABS = [
  ['overview', 'Обзор', I.home],
  ['ops', 'Операции', I.list],
  ['budgets', 'Бюджеты', I.piggy],
  ['subs', 'Подписки', I.repeat],
  ['stats', 'Статистика', I.chart]
];

function applyTheme() {
  const t = state.ui.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  document.body.classList.toggle('hide', !!state.ui.hide);
}

function render() {
  applyTheme();
  const pend = pendingSubs().length;
  $('#tabbar').innerHTML = TABS.map(([id, name, icon]) => `
    <button class="tab" data-action="tab" data-v="${id}" ${view === id ? 'aria-current="page"' : ''}>
      ${icon}<span>${name}</span>${id === 'subs' && pend ? `<b class="badge">${pend}</b>` : ''}
    </button>`).join('');
  const title = TABS.find(t => t[0] === view)[1];
  $('#top').innerHTML = `
    <div class="top-row">
      <div></div>
      <div class="top-actions">
        <button class="round-btn" data-action="toggle-hide" aria-label="${state.ui.hide ? 'Показать суммы' : 'Скрыть суммы'}">${state.ui.hide ? I.eyeOff : I.eye}</button>
        <button class="round-btn" data-action="settings" aria-label="Настройки">${I.gear}</button>
      </div>
    </div>
    <h1 class="title">${title}</h1>`;
  $('#fab').hidden = view === 'subs' || view === 'budgets';
  const views = { overview: vOverview, ops: vOps, budgets: vBudgets, subs: vSubs, stats: vStats };
  $('#view').innerHTML = views[view]();
  if (view === 'ops') drawOpsList();
}

function periodBar() {
  return `
    <div class="period">
      <button class="icon-btn" data-action="period" data-d="-1" aria-label="Предыдущий период">${I.chevL}</button>
      <button class="period-label" data-action="period-mode" aria-label="Сменить месяц или год">${periodLabel()}<small>${period.mode === 'month' ? 'месяц ⇅' : 'год ⇅'}</small></button>
      ${isCurrentPeriod() ? '' : '<button class="now" data-action="period-now">Сейчас</button>'}
      <button class="icon-btn" data-action="period" data-d="1" aria-label="Следующий период">${I.chevR}</button>
    </div>`;
}

const catIco = (c, size) => `<span class="cat-ico" style="background:${c.color}26;color:${c.color}${size ? `;width:${size}px;height:${size}px` : ''}">${esc(c.icon)}</span>`;

function txRow(t, { showDate = false } = {}) {
  let c, t1, t2, amt;
  const acc = accById(t.accountId);
  if (t.type === 'transfer') {
    c = { icon: '⇄', color: '#64748B' };
    t1 = 'Перевод';
    t2 = `${esc(acc?.name || '?')} → ${esc(accById(t.toAccountId)?.name || '?')}${t.note ? ' · ' + esc(t.note) : ''}`;
    amt = `<span class="money">${fmt(t.amount)}</span>`;
  } else {
    c = catById(t.categoryId) || FALLBACK_CAT;
    t1 = esc(c.name);
    t2 = [t.note && esc(t.note), esc(acc?.name || '')].filter(Boolean).join(' · ');
    amt = t.type === 'income'
      ? `<span class="money pos">${fmt(t.amount, { sign: true })}</span>`
      : `<span class="money neg">${fmt(-t.amount)}</span>`;
  }
  return `
    <button class="row" data-action="edit-tx" data-id="${t.id}">
      ${catIco(c)}
      <span class="mid"><div class="t1">${t1}</div><div class="t2">${t2 || '&nbsp;'}</div></span>
      <span class="amt">${amt}${showDate ? `<small>${shortDate(t.date)}</small>` : ''}</span>
    </button>`;
}

/* ---------- Обзор ---------- */

function vOverview() {
  const { start, end } = range();
  const list = txIn(start, end);
  const tot = totals(list);
  const nw = netWorth();
  const pend = pendingSubs();

  const accs = state.accounts.map(a => {
    const spent = totals(list.filter(t => t.accountId === a.id)).exp;
    return `
      <button class="acc" data-action="acc-open" data-id="${a.id}">
        <span class="ico" style="background:${a.color}">${esc(a.icon)}</span>
        <span class="name">${esc(a.name)}</span>
        <span class="bal money">${fmt(balance(a.id))}</span>
        <span class="spent">${spent ? `<span class="money">−${fmt(spent)}</span> за период` : 'нет трат за период'}</span>
      </button>`;
  }).join('');

  const pendCard = pend.length ? `
    <section class="card pending">
      <div class="card-head"><h3>Ожидают оплаты</h3><span class="sub">${pend.length}</span></div>
      <div class="rows">${pend.map(s => {
        const c = catById(s.categoryId) || FALLBACK_CAT;
        return `<div class="row">
          ${catIco(c)}
          <span class="mid"><div class="t1">${esc(s.name)}</div><div class="t2">${shortDate(s.next)} · ${esc(accById(s.accountId)?.name || '')}</div></span>
          <span class="amt money">${fmt(s.amount)}</span>
          <div class="acts">
            <button class="btn small" data-action="sub-pay" data-id="${s.id}">Оплачено</button>
            <button class="btn small ghost" data-action="sub-skip" data-id="${s.id}">Пропустить</button>
          </div>
        </div>`;
      }).join('')}</div>
    </section>` : '';

  // Остаток на период и суточный лимит
  const budget = totalBudget();
  let budgetCard;
  if (budget > 0) {
    const left = budget - tot.exp;
    const pct = Math.min(100, Math.max(0, (tot.exp / budget) * 100));
    let daily = '';
    if (isCurrentPeriod()) {
      const daysLeft = daysBetween(today(), end) + 1;
      const spentToday = totals(list.filter(t => t.date === today())).exp;
      const perDay = Math.max(0, Math.floor((left + spentToday) / daysLeft));
      const todayLeft = perDay - spentToday;
      daily = `
        <section class="card">
          <div class="label">Можно потратить сегодня <span class="chip ${todayLeft >= 0 ? 'ok' : 'bad'}">${todayLeft >= 0 ? 'В норме' : 'Перерасход'}</span></div>
          <div class="big ${todayLeft >= 0 ? 'pos' : 'neg'} money">${fmt(todayLeft)}</div>
          <div class="sub">Дневной лимит <span class="money">${fmt(perDay)}</span> · осталось дней: ${daysLeft}</div>
        </section>`;
    }
    budgetCard = `
      <section class="card">
        <div class="label">Остаток на период</div>
        <div class="big ${left >= 0 ? 'pos' : 'neg'} money">${fmt(left)}</div>
        <div class="sub">Потрачено <span class="money">${fmt(tot.exp)}</span> из <span class="money">${fmt(budget)}</span></div>
        <div class="progress"><i style="width:${pct}%;background:${left >= 0 ? 'var(--pos)' : 'var(--neg)'}"></i></div>
      </section>${daily}`;
  } else {
    budgetCard = `
      <section class="card">
        <div class="label">Остаток на период</div>
        <p class="sub" style="margin:8px 0 12px">Задайте месячные бюджеты по категориям — здесь появятся остаток и лимит на день.</p>
        <button class="btn small" data-action="tab" data-v="budgets">Настроить бюджет</button>
      </section>`;
  }

  // Подписки в периоде
  const items = [];
  for (const t of list) if (t.subId) items.push({ date: t.date, name: t.note || 'Платёж', amount: t.amount, paid: true, sub: state.subs.find(s => s.id === t.subId), tx: t });
  for (const s of activeSubs()) for (const d of occurrences(s, start, end)) items.push({ date: d, name: s.name, amount: s.amount, paid: false, sub: s });
  items.sort((a, b) => a.date.localeCompare(b.date));
  const subsTotal = items.reduce((x, i) => x + i.amount, 0);
  const subsCard = `
    <section class="card">
      <div class="card-head"><h3>Подписки и счета</h3><button class="link" data-action="tab" data-v="subs">Все</button></div>
      ${items.length ? `<div class="rows">${items.slice(0, 6).map(i => {
        const c = catById(i.sub?.categoryId) || FALLBACK_CAT;
        return `<button class="row" data-action="${i.paid ? 'edit-tx' : 'edit-sub'}" data-id="${i.paid ? i.tx.id : i.sub.id}">
          ${catIco(c)}
          <span class="mid"><div class="t1">${esc(i.name)}</div><div class="t2">${shortDate(i.date)} · ${i.paid ? '✓ оплачено' : relDays(i.date)}</div></span>
          <span class="amt money">${fmt(i.amount)}</span>
        </button>`;
      }).join('')}</div>
      <div class="sub" style="margin-top:8px">Итого за период: <span class="money">${fmt(subsTotal)}</span>${items.length > 6 ? ` · ещё ${items.length - 6}` : ''}</div>`
      : `<div class="empty">Нет платежей в этом периоде</div><button class="btn ghost" data-action="add-sub">Добавить подписку</button>`}
    </section>`;

  // Наибольшие расходы
  const cats = byCategory(list).slice(0, 5);
  const top = cats[0]?.value || 1;
  const topCard = `
    <section class="card">
      <div class="card-head"><h3>Наибольшие расходы</h3><button class="link" data-action="tab" data-v="stats">Подробнее</button></div>
      ${cats.length ? cats.map(x => `
        <button class="hbar" style="width:100%;text-align:left" data-action="cat-open" data-id="${x.id}">
          <div class="top"><span>${esc(x.cat.icon)} ${esc(x.cat.name)}</span><span class="money">${fmt(x.value)}</span></div>
          <div class="progress thin"><i style="width:${(x.value / top) * 100}%;background:${x.cat.color}"></i></div>
        </button>`).join('') : '<div class="empty">Пока нет расходов за период</div>'}
    </section>`;

  const recent = sortTx(state.tx).slice(0, 5);
  const recentCard = `
    <section class="card">
      <div class="card-head"><h3>Последние записи</h3><button class="link" data-action="tab" data-v="ops">Все</button></div>
      ${recent.length ? `<div class="rows">${recent.map(t => txRow(t, { showDate: true })).join('')}</div>`
      : '<div class="empty">Нажмите «+», чтобы добавить первую трату</div>'}
    </section>`;

  return `
    <section class="card">
      <div class="label">Общий баланс</div>
      <div class="big money">${fmt(nw)}</div>
      <div class="sub">на сегодня · счетов: ${state.accounts.length}</div>
    </section>
    <div class="acc-grid">
      ${accs}
      <button class="acc add" data-action="add-acc"><span class="plus">${I.plus}</span>Добавить счёт</button>
    </div>
    ${pendCard}
    ${periodBar()}
    <section class="card">
      <div class="trio">
        <div><div class="label">Доходы</div><div class="v pos money">${fmt(tot.inc, { short: true })}</div></div>
        <div><div class="label">Расходы</div><div class="v neg money">${fmt(tot.exp, { short: true })}</div></div>
        <div><div class="label">Итог</div><div class="v ${tot.net >= 0 ? 'pos' : 'neg'} money">${fmt(tot.net, { sign: true, short: true })}</div></div>
      </div>
    </section>
    ${budgetCard}
    ${subsCard}
    ${topCard}
    ${recentCard}`;
}

/* ---------- Операции ---------- */

function vOps() {
  const accChips = [`<button class="pill" data-action="f-acc" data-id="" aria-pressed="${!filter.acc}">Все счета</button>`]
    .concat(state.accounts.map(a => `<button class="pill" data-action="f-acc" data-id="${a.id}" aria-pressed="${filter.acc === a.id}">${esc(a.icon)} ${esc(a.name)}</button>`));
  const cat = filter.cat && catById(filter.cat);
  return `
    ${periodBar()}
    <label class="search">${I.search}<input id="q" type="search" placeholder="Поиск по всем записям" value="${esc(filter.q)}" autocomplete="off" enterkeyhint="search"></label>
    <div class="chips">${accChips.join('')}</div>
    ${cat ? `<div class="chips"><button class="pill" data-action="f-cat-clear" aria-pressed="true">${esc(cat.icon)} ${esc(cat.name)} ✕</button></div>` : ''}
    <div id="ops-list"></div>`;
}

function drawOpsList() {
  const box = $('#ops-list');
  if (!box) return;
  const q = filter.q.trim().toLowerCase();
  let list;
  if (q) {
    list = state.tx.filter(t => {
      const c = catById(t.categoryId);
      const hay = [t.note, c?.name, accById(t.accountId)?.name, accById(t.toAccountId)?.name, String(t.amount / 100)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  } else {
    const { start, end } = range();
    list = txIn(start, end);
  }
  if (filter.acc) list = list.filter(t => t.accountId === filter.acc || t.toAccountId === filter.acc);
  if (filter.cat) list = list.filter(t => t.categoryId === filter.cat);
  list = sortTx(list);

  if (!list.length) { box.innerHTML = `<div class="empty">${q ? 'Ничего не найдено' : 'Нет записей за этот период'}</div>`; return; }

  const tot = totals(list);
  let html = `<section class="card"><div class="trio">
      <div><div class="label">Доходы</div><div class="v pos money">${fmt(tot.inc, { short: true })}</div></div>
      <div><div class="label">Расходы</div><div class="v neg money">${fmt(tot.exp, { short: true })}</div></div>
      <div><div class="label">Записей</div><div class="v">${list.length}</div></div>
    </div></section>`;
  let i = 0;
  while (i < list.length) {
    const d = list[i].date;
    const group = [];
    while (i < list.length && list[i].date === d) group.push(list[i++]);
    const g = totals(group);
    html += `<div class="day-head"><span>${dayTitle(d)}</span><span class="money">${fmt(g.net, { sign: true })}</span></div>
      <section class="card day-card"><div class="rows">${group.map(t => txRow(t)).join('')}</div></section>`;
  }
  box.innerHTML = html;
}

/* ---------- Бюджеты ---------- */

function gauge(segs) {
  const d = 'M 22 128 A 108 108 0 0 1 238 128';
  let off = 0;
  const parts = segs.map(s => {
    const len = Math.max(0, Math.min(s.frac * 100, 100 - off));
    const el = len > 0 ? `<path d="${d}" pathLength="100" fill="none" stroke="${s.color}" stroke-width="22" stroke-dasharray="${len} 200" stroke-dashoffset="${-off}"/>` : '';
    off += len;
    return el;
  });
  return `<svg class="gauge" viewBox="0 0 260 140" aria-hidden="true">
    <path d="${d}" fill="none" stroke="var(--track)" stroke-width="22" stroke-linecap="round"/>
    ${parts.join('')}
  </svg>`;
}

function vBudgets() {
  const { start, end } = range();
  const list = txIn(start, end);
  const spentBy = new Map(byCategory(list).map(x => [x.id, x.value]));
  const mult = budgetMult();
  const budget = totalBudget();
  const exp = totals(list).exp;
  const cats = catsOf('expense');
  const withB = cats.filter(c => state.budgets[c.id]);
  const noB = cats.filter(c => !state.budgets[c.id]);

  const segs = budget > 0 ? withB.map(c => ({ color: c.color, frac: (spentBy.get(c.id) || 0) / budget })) : [];
  const unbudgeted = exp - withB.reduce((s, c) => s + (spentBy.get(c.id) || 0), 0);
  if (budget > 0 && unbudgeted > 0) segs.push({ color: '#64748B', frac: unbudgeted / budget });

  const row = c => {
    const b = (state.budgets[c.id] || 0) * mult;
    const s = spentBy.get(c.id) || 0;
    const over = b && s > b;
    return `<button class="brow" data-action="edit-budget" data-id="${c.id}">
      ${catIco(c)}
      <span>
        <div class="nm"><span>${esc(c.name)}</span><span class="money">${b ? `${fmt(s, { short: true })} / ${fmt(b, { short: true })}` : fmt(s, { short: true })}</span></div>
        ${b ? `<div class="progress thin"><i style="width:${Math.min(100, (s / b) * 100)}%;background:${over ? 'var(--neg)' : c.color}"></i></div>` : ''}
      </span>
      <span class="right ${over ? 'neg' : 'muted'}">${b ? (over ? `+${fmt(s - b, { short: true })}` : `${fmt(b - s, { short: true })}`) : 'Задать'}</span>
    </button>`;
  };

  return `
    ${periodBar()}
    <section class="card gauge-wrap">
      ${gauge(segs)}
      <div class="gauge-num">
        ${budget > 0
          ? `<div class="big ${budget - exp >= 0 ? 'pos' : 'neg'} money">${fmt(budget - exp, { short: true })}</div>
             <div class="sub">${budget - exp >= 0 ? 'осталось' : 'перерасход'} · <span class="money">${fmt(exp, { short: true })} / ${fmt(budget, { short: true })}</span></div>`
          : `<div class="big money">${fmt(exp, { short: true })}</div><div class="sub">потрачено · бюджет не задан</div>`}
      </div>
    </section>
    ${withB.length ? `<div class="sect">С бюджетом${mult > 1 ? ' (за год)' : ''}</div><section class="card day-card">${withB.map(row).join('')}</section>` : ''}
    <div class="sect">${withB.length ? 'Без бюджета' : 'Нажмите на категорию, чтобы задать лимит на месяц'}</div>
    <section class="card day-card">${noB.map(row).join('')}</section>`;
}

/* ---------- Подписки ---------- */

function vSubs() {
  const subs = activeSubs().slice().sort((a, b) => a.next.localeCompare(b.next));
  const paused = state.subs.filter(s => s.active === false);
  const month = subs.reduce((s, x) => s + monthlyEq(x), 0);
  const pend = pendingSubs();
  const row = s => {
    const c = catById(s.categoryId) || FALLBACK_CAT;
    return `<button class="row" data-action="edit-sub" data-id="${s.id}">
      ${catIco(c)}
      <span class="mid"><div class="t1">${esc(s.name)}</div><div class="t2 ${s.active !== false && s.next <= today() ? 'neg' : ''}">${s.active === false ? 'на паузе' : `${shortDate(s.next)} · ${relDays(s.next)}`}</div></span>
      <span class="amt"><span class="money">${fmt(s.amount)}</span><small>${PERIODS_SHORT[s.period]}</small></span>
    </button>`;
  };
  return `
    <div class="split">
      <section class="card"><div class="label">В месяц</div><div class="v money" style="font-size:24px;font-weight:800;margin-top:4px">${fmt(Math.round(month))}</div></section>
      <section class="card"><div class="label">В год</div><div class="v money" style="font-size:24px;font-weight:800;margin-top:4px">${fmt(Math.round(month * 12))}</div></section>
    </div>
    ${pend.length ? `<section class="card pending"><div class="card-head"><h3>Ожидают оплаты</h3></div><div class="rows">${pend.map(s => `
      <div class="row">${catIco(catById(s.categoryId) || FALLBACK_CAT)}
        <span class="mid"><div class="t1">${esc(s.name)}</div><div class="t2">${shortDate(s.next)}</div></span>
        <span class="amt money">${fmt(s.amount)}</span>
        <div class="acts"><button class="btn small" data-action="sub-pay" data-id="${s.id}">Оплачено</button><button class="btn small ghost" data-action="sub-skip" data-id="${s.id}">Пропустить</button></div>
      </div>`).join('')}</div></section>` : ''}
    <section class="card">
      <div class="card-head"><h3>Регулярные платежи</h3><span class="sub">${subs.length}</span></div>
      ${subs.length ? `<div class="rows">${subs.map(row).join('')}</div>` : '<div class="empty">Добавьте Netflix, аренду, спортзал, связь — приложение напомнит о платеже и запишет его в расходы</div>'}
    </section>
    ${paused.length ? `<div class="sect">На паузе</div><section class="card day-card">${paused.map(row).join('')}</section>` : ''}
    <button class="btn" data-action="add-sub">Добавить подписку или платёж</button>`;
}

/* ---------- Статистика ---------- */

function donut(segs, total, label) {
  const r = 60, C = 2 * Math.PI * r;
  let off = 0;
  const gap = segs.length > 1 ? 1.5 : 0;
  const parts = segs.map(s => {
    const len = (s.value / total) * C;
    const el = `<circle r="${r}" cx="75" cy="75" fill="none" stroke="${s.color}" stroke-width="20" stroke-dasharray="${Math.max(len - gap, 0.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 75 75)"/>`;
    off += len;
    return el;
  });
  return `<svg class="donut" viewBox="0 0 150 150" role="img" aria-label="Расходы по категориям">
    <circle r="${r}" cx="75" cy="75" fill="none" stroke="var(--track)" stroke-width="20"/>
    ${parts.join('')}
    <text x="75" y="72" text-anchor="middle" font-size="16" font-weight="800" class="money">${esc(label)}</text>
    <text x="75" y="90" text-anchor="middle" font-size="11" style="fill:var(--muted)">расходы</text>
  </svg>`;
}

function barChart(items, keys) {
  const W = 340, H = 180, B = 22, T = 18;
  const max = Math.max(1, ...items.flatMap(it => keys.map(k => it[k.key])));
  const gw = W / items.length;
  const bw = Math.min(16, (gw - 6) / keys.length);
  let bars = '';
  items.forEach((it, i) => {
    const gx = i * gw + (gw - bw * keys.length - (keys.length - 1) * 2) / 2;
    keys.forEach((k, j) => {
      const v = it[k.key];
      const h = v ? Math.max(2, (v / max) * (H - B - T)) : 0;
      const x = gx + j * (bw + 2);
      bars += `<rect x="${x.toFixed(1)}" y="${(H - B - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${it.hl === false ? k.color + '66' : k.color}"><title>${esc(it.title || it.label)}: ${fmt(v)}</title></rect>`;
    });
    if (it.label) bars += `<text x="${(i * gw + gw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(it.label)}</text>`;
  });
  const grid = [0.5, 1].map(f => {
    const y = H - B - f * (H - B - T);
    return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${W}" y="${y - 3}" text-anchor="end">${esc(fmt(max * f, { short: true }))}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="График">${grid}${bars}<line x1="0" x2="${W}" y1="${H - B}" y2="${H - B}" stroke="var(--line)"/></svg>`;
}

function vStats() {
  const { start, end } = range();
  const list = txIn(start, end);
  const tot = totals(list);
  const cats = byCategory(list);
  const days = Math.min(daysBetween(start, end) + 1, Math.max(1, daysBetween(start, today()) + 1));

  // Донат
  const main = cats.slice(0, 6);
  const rest = cats.slice(6).reduce((s, x) => s + x.value, 0);
  const segs = main.map(x => ({ value: x.value, color: x.cat.color, name: x.cat.name, id: x.id, icon: x.cat.icon }));
  if (rest) segs.push({ value: rest, color: '#64748B', name: 'Остальное', icon: '…' });
  const donutCard = `
    <section class="card">
      <div class="card-head"><h3>Куда уходят деньги</h3></div>
      ${tot.exp ? `<div class="donut-wrap">
        ${donut(segs, tot.exp, fmt(tot.exp, { short: true }))}
        <div class="legend">${segs.map(s => `<button ${s.id ? `data-action="cat-open" data-id="${s.id}"` : ''}><i style="background:${s.color}"></i><span class="ln">${esc(s.icon)} ${esc(s.name)}</span><span class="lp">${Math.round((s.value / tot.exp) * 100)}%</span></button>`).join('')}</div>
      </div>
      <div class="rows" style="margin-top:10px">${cats.map(x => `
        <button class="row" data-action="cat-open" data-id="${x.id}">${catIco(x.cat)}
          <span class="mid"><div class="t1">${esc(x.cat.name)}</div><div class="t2">${list.filter(t => t.type === 'expense' && t.categoryId === x.id).length} зап. · ${Math.round((x.value / tot.exp) * 100)}%</div></span>
          <span class="amt money">${fmt(x.value)}</span></button>`).join('')}</div>`
      : '<div class="empty">Нет расходов за период</div>'}
    </section>`;

  // По счетам
  const accRows = state.accounts.map(a => {
    const t = totals(list.filter(x => x.accountId === a.id));
    return { a, ...t };
  }).filter(x => x.exp || x.inc);
  const accMax = Math.max(1, ...accRows.map(x => x.exp));
  const accCard = `
    <section class="card">
      <div class="card-head"><h3>Траты по счетам</h3></div>
      ${accRows.length ? accRows.map(x => `
        <button class="hbar" style="width:100%;text-align:left" data-action="acc-open" data-id="${x.a.id}">
          <div class="top"><span>${esc(x.a.icon)} ${esc(x.a.name)}</span><span><span class="money neg">${fmt(x.exp)}</span>${x.inc ? ` · <span class="money pos">${fmt(x.inc, { sign: true })}</span>` : ''}</span></div>
          <div class="progress thin"><i style="width:${(x.exp / accMax) * 100}%;background:${x.a.color}"></i></div>
        </button>`).join('') : '<div class="empty">Нет движений за период</div>'}
    </section>`;

  // Доход против расхода
  let months = [];
  if (period.mode === 'year') {
    for (let m = 0; m < 12; m++) months.push({ mode: 'month', y: period.y, m });
  } else {
    for (let k = 5; k >= 0; k--) { const d = new Date(period.y, period.m - k, 1); months.push({ mode: 'month', y: d.getFullYear(), m: d.getMonth() }); }
  }
  const ivItems = months.map(p => {
    const r = range(p); const t = totals(txIn(r.start, r.end));
    return { label: MONTH_SHORT.format(new Date(p.y, p.m, 1)).replace('.', ''), title: cap(MONTH.format(new Date(p.y, p.m, 1))) + ' ' + p.y, inc: t.inc, exp: t.exp };
  });
  const ivCard = `
    <section class="card">
      <div class="card-head"><h3>Доход против расхода</h3></div>
      ${barChart(ivItems, [{ key: 'inc', color: '#22C55E' }, { key: 'exp', color: '#EF4444' }])}
      <div class="keys"><span style="--c:#22C55E">Доходы</span><span style="--c:#EF4444">Расходы</span></div>
    </section>`;

  // Динамика расходов
  let dynItems;
  if (period.mode === 'month') {
    const last = parseDate(end).getDate();
    dynItems = [];
    for (let d = 1; d <= last; d++) {
      const ds = `${period.y}-${pad(period.m + 1)}-${pad(d)}`;
      const exp = totals(list.filter(t => t.date === ds)).exp;
      dynItems.push({ label: d === 1 || d % 5 === 0 ? String(d) : '', title: shortDate(ds), exp, hl: ds <= today() });
    }
  } else {
    dynItems = ivItems.map(x => ({ label: x.label, title: x.title, exp: x.exp }));
  }
  const dynCard = `
    <section class="card">
      <div class="card-head"><h3>${period.mode === 'month' ? 'Расходы по дням' : 'Расходы по месяцам'}</h3></div>
      ${barChart(dynItems, [{ key: 'exp', color: '#3B82F6' }])}
    </section>`;

  const biggest = list.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0];
  const summary = `
    <section class="card">
      <div class="trio">
        <div><div class="label">Доходы</div><div class="v pos money">${fmt(tot.inc, { short: true })}</div></div>
        <div><div class="label">Расходы</div><div class="v neg money">${fmt(tot.exp, { short: true })}</div></div>
        <div><div class="label">Поток</div><div class="v ${tot.net >= 0 ? 'pos' : 'neg'} money">${fmt(tot.net, { sign: true, short: true })}</div></div>
      </div>
      <div class="trio" style="margin-top:14px">
        <div><div class="label">В день</div><div class="v money">${fmt(Math.round(tot.exp / days))}</div></div>
        <div><div class="label">Сбережено</div><div class="v">${tot.inc ? Math.round((tot.net / tot.inc) * 100) + '%' : '—'}</div></div>
        <div><div class="label">Макс. трата</div><div class="v money">${biggest ? fmt(biggest.amount) : '—'}</div></div>
      </div>
    </section>`;

  return `${periodBar()}${summary}${donutCard}${accCard}${dynCard}${ivCard}`;
}

/* ================= Шторки и формы ================= */

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
const head = (title, submit = 'Готово') => `
  <div class="sheet-head">
    <button type="button" class="link" data-action="close">Отмена</button>
    <h2>${title}</h2>
    ${submit ? `<button type="submit" class="link strong">${submit}</button>` : '<span></span>'}
  </div>`;

function commit(msg) { save(); closeSheet(); render(); if (msg) toast(msg); }

/* ---------- Запись ---------- */

function openTx(id, preset = {}) {
  if (!state.accounts.length) { toast('Сначала добавьте счёт'); openAccount(); return; }
  const t = id ? state.tx.find(x => x.id === id) : null;
  let type = t?.type || preset.type || 'expense';
  let cat = t?.categoryId || preset.categoryId || null;
  let acc = t?.accountId || preset.accountId || (accById(state.ui.lastAcc) ? state.ui.lastAcc : state.accounts[0].id);
  let to = t?.toAccountId || state.accounts.find(a => a.id !== acc)?.id || null;

  const p = openSheet(`<form id="txf" novalidate>
    ${head(t ? 'Изменить запись' : 'Новая запись')}
    <div class="seg">
      <button type="button" data-type="expense">Расход</button>
      <button type="button" data-type="income">Доход</button>
      <button type="button" data-type="transfer">Перевод</button>
    </div>
    <label class="amount"><input name="amount" inputmode="decimal" placeholder="0" autocomplete="off" value="${amountInput(t?.amount)}" aria-label="Сумма"><span>${esc(state.currency)}</span></label>
    <div id="dyn"></div>
    <div class="group">
      <label class="field"><span>Дата</span><input type="date" name="date" value="${t?.date || today()}" required></label>
      <label class="field"><span>Заметка</span><input name="note" placeholder="Например, ужин" value="${esc(t?.note || '')}" maxlength="80"></label>
    </div>
    ${t ? '<button type="button" class="btn danger" data-del>Удалить запись</button>' : ''}
  </form>`);

  const dyn = $('#dyn', p);
  const accPills = (sel, attr) => state.accounts.map(a => `<button type="button" class="pill" ${attr}="${a.id}" aria-pressed="${sel === a.id}">${esc(a.icon)} ${esc(a.name)}</button>`).join('');

  function draw() {
    p.querySelectorAll('[data-type]').forEach(b => b.setAttribute('aria-pressed', b.dataset.type === type));
    $('.amount', p).className = 'amount ' + type;
    if (type === 'transfer') {
      dyn.innerHTML = `<div class="sect">Откуда</div><div class="pick-row">${accPills(acc, 'data-acc')}</div>
        <div class="sect">Куда</div><div class="pick-row">${accPills(to, 'data-to')}</div>`;
    } else {
      const cs = catsOf(type);
      if (cat && !cs.some(c => c.id === cat)) cat = null;
      dyn.innerHTML = `<div class="sect">Счёт</div><div class="pick-row">${accPills(acc, 'data-acc')}</div>
        <div class="sect">Категория</div>
        <div class="cat-grid">${cs.map(c => `<button type="button" class="cat-btn" data-cat="${c.id}" aria-pressed="${cat === c.id}">${catIco(c)}<span>${esc(c.name)}</span></button>`).join('')}</div>`;
    }
  }
  draw();
  autoWidth($('[name=amount]', p));
  if (!t) setTimeout(() => $('[name=amount]', p).focus(), 280);

  p.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.type) { type = b.dataset.type; draw(); }
    else if (b.dataset.cat) { cat = b.dataset.cat; draw(); }
    else if (b.dataset.acc) { acc = b.dataset.acc; draw(); }
    else if (b.dataset.to) { to = b.dataset.to; draw(); }
    else if (b.hasAttribute('data-del')) {
      if (confirm('Удалить эту запись?')) { state.tx = state.tx.filter(x => x.id !== t.id); commit('Запись удалена'); }
    }
  });

  $('#txf', p).addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const amount = parseAmount(f.amount.value);
    if (!(amount > 0)) { toast('Введите сумму'); f.amount.focus(); return; }
    if (type === 'transfer') {
      if (!to || to === acc) { toast('Выберите два разных счёта'); return; }
    } else if (!cat) { toast('Выберите категорию'); return; }
    const rec = {
      id: t?.id || uid(), ts: t?.ts || Date.now(), type, amount,
      accountId: acc, date: f.date.value || today(), note: f.note.value.trim()
    };
    if (type === 'transfer') rec.toAccountId = to; else rec.categoryId = cat;
    if (t?.subId) rec.subId = t.subId;
    if (t) state.tx[state.tx.findIndex(x => x.id === t.id)] = rec; else state.tx.push(rec);
    state.ui.lastAcc = acc;
    commit(t ? 'Сохранено' : 'Запись добавлена');
  });
}

/* ---------- Счёт ---------- */

function openAccount(id) {
  const a = id ? accById(id) : null;
  let icon = a?.icon || '💳', color = a?.color || PALETTE[state.accounts.length % PALETTE.length];
  const cur = a ? balance(a.id) : 0;
  const count = a ? state.tx.filter(t => t.accountId === a.id || t.toAccountId === a.id).length : 0;
  const p = openSheet(`<form id="accf" novalidate>
    ${head(a ? 'Счёт' : 'Новый счёт')}
    <div class="group">
      <label class="field"><span>Название</span><input name="name" value="${esc(a?.name || '')}" placeholder="Карта Visa" maxlength="30" required></label>
      <label class="field"><span>Баланс сейчас</span><input name="bal" inputmode="decimal" value="${a ? (cur / 100).toFixed(2) : ''}" placeholder="0.00"></label>
    </div>
    <p class="hint">Если баланс в банке не совпадает — просто впишите правильный, приложение подстроит начальный остаток.</p>
    <div class="sect">Значок</div>
    <div class="emoji-grid" id="ei">${ACC_ICONS.map(i => `<button type="button" data-i="${i}" aria-pressed="${i === icon}">${i}</button>`).join('')}</div>
    <div class="sect">Цвет</div>
    <div class="color-row" id="ec">${PALETTE.map(c => `<button type="button" data-c="${c}" style="background:${c}" aria-pressed="${c === color}" aria-label="Цвет ${c}"></button>`).join('')}</div>
    ${a ? `<button type="button" class="btn ghost" data-action="acc-ops" data-id="${a.id}">Операции по счёту (${count})</button>
      <button type="button" class="btn danger" data-del>Удалить счёт</button>` : ''}
  </form>`);
  p.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.i) { icon = b.dataset.i; p.querySelectorAll('[data-i]').forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.dataset.c) { color = b.dataset.c; p.querySelectorAll('[data-c]').forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.hasAttribute('data-del')) {
      const msg = count ? `Удалить счёт «${a.name}» и ${count} связанных записей?` : `Удалить счёт «${a.name}»?`;
      if (!confirm(msg)) return;
      state.tx = state.tx.filter(t => t.accountId !== a.id && t.toAccountId !== a.id);
      state.subs = state.subs.filter(s => s.accountId !== a.id);
      state.accounts = state.accounts.filter(x => x.id !== a.id);
      if (filter.acc === a.id) filter.acc = null;
      commit('Счёт удалён');
    }
  });
  $('#accf', p).addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    if (!name) { toast('Введите название'); f.name.focus(); return; }
    const raw = f.bal.value.trim();
    const neg = /^[−-]/.test(raw);
    const bal = raw ? parseAmount(raw.replace(/^[−-]/, '')) : 0;
    if (isNaN(bal)) { toast('Проверьте баланс'); return; }
    const signed = neg ? -bal : bal;
    if (a) {
      a.name = name; a.icon = icon; a.color = color;
      a.initial += signed - cur;
    } else {
      state.accounts.push({ id: uid(), name, icon, color, initial: signed });
    }
    commit(a ? 'Счёт сохранён' : 'Счёт добавлен');
  });
}

/* ---------- Подписка ---------- */

function openSub(id) {
  if (!state.accounts.length) { toast('Сначала добавьте счёт'); openAccount(); return; }
  const s = id ? state.subs.find(x => x.id === id) : null;
  const subCat = catsOf('expense').find(c => c.name === 'Подписки')?.id;
  const opt = (list, sel) => list.map(([v, n]) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(n)}</option>`).join('');
  const p = openSheet(`<form id="subf" novalidate>
    ${head(s ? 'Подписка' : 'Новая подписка')}
    <div class="group">
      <label class="field"><span>Название</span><input name="name" value="${esc(s?.name || '')}" placeholder="Netflix, аренда…" maxlength="40" required></label>
      <label class="field"><span>Сумма</span><input name="amount" inputmode="decimal" value="${amountInput(s?.amount)}" placeholder="0.00"></label>
      <label class="field"><span>Повтор</span><select name="period">${opt(Object.entries(PERIODS), s?.period || 'month')}</select></label>
      <label class="field"><span>Следующий платёж</span><input type="date" name="next" value="${s?.next || today()}"></label>
    </div>
    <div class="group">
      <label class="field"><span>Счёт</span><select name="acc">${opt(state.accounts.map(a => [a.id, a.name]), s?.accountId || state.ui.lastAcc)}</select></label>
      <label class="field"><span>Категория</span><select name="cat">${opt(catsOf('expense').map(c => [c.id, `${c.icon} ${c.name}`]), s?.categoryId || subCat)}</select></label>
    </div>
    <p class="hint">В день платежа он появится в «Ожидают оплаты» — подтвердите, и расход запишется на счёт.</p>
    ${s ? `<button type="button" class="btn ghost" data-pause>${s.active === false ? 'Возобновить' : 'Поставить на паузу'}</button>
      <button type="button" class="btn danger" data-del>Удалить подписку</button>` : ''}
  </form>`);
  p.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-del') && confirm(`Удалить «${s.name}»? Уже записанные платежи останутся.`)) {
      state.subs = state.subs.filter(x => x.id !== s.id); commit('Подписка удалена');
    }
    if (b.hasAttribute('data-pause')) { s.active = s.active === false; commit(s.active ? 'Подписка возобновлена' : 'Подписка на паузе'); }
  });
  $('#subf', p).addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const amount = parseAmount(f.amount.value);
    if (!name) { toast('Введите название'); return; }
    if (!(amount > 0)) { toast('Введите сумму'); return; }
    const next = f.next.value || today();
    const rec = {
      id: s?.id || uid(), name, amount, period: f.period.value, next,
      day: parseDate(next).getDate(), accountId: f.acc.value, categoryId: f.cat.value,
      active: s ? s.active : true
    };
    if (s) Object.assign(s, rec); else state.subs.push(rec);
    commit(s ? 'Сохранено' : 'Подписка добавлена');
  });
}

function paySub(id, skip) {
  const s = state.subs.find(x => x.id === id);
  if (!s) return;
  if (!skip) {
    state.tx.push({ id: uid(), ts: Date.now(), type: 'expense', amount: s.amount, accountId: s.accountId, categoryId: s.categoryId, date: s.next, note: s.name, subId: s.id });
  }
  s.next = addPeriod(s.next, s.period, s.day);
  save(); render();
  toast(skip ? 'Платёж пропущен' : `Записано: ${s.name}`);
}

/* ---------- Бюджет ---------- */

function openBudget(catId) {
  const c = catById(catId);
  const b = state.budgets[catId] || 0;
  const p = openSheet(`<form id="bf" novalidate>
    ${head(`${esc(c.icon)} ${esc(c.name)}`, 'Сохранить')}
    <div class="sect" style="text-align:center">Лимит на месяц</div>
    <label class="amount"><input name="amount" inputmode="decimal" placeholder="0" value="${amountInput(b)}" aria-label="Лимит"><span>${esc(state.currency)}</span></label>
    ${b ? '<button type="button" class="btn danger" data-del>Убрать бюджет</button>' : ''}
    <button type="button" class="btn ghost" data-action="cat-open" data-id="${c.id}">Операции по категории</button>
  </form>`);
  autoWidth($('[name=amount]', p));
  setTimeout(() => $('[name=amount]', p).focus(), 280);
  p.addEventListener('click', e => {
    if (e.target.closest('[data-del]')) { delete state.budgets[catId]; commit('Бюджет убран'); }
  });
  $('#bf', p).addEventListener('submit', e => {
    e.preventDefault();
    const v = parseAmount(e.target.amount.value);
    if (isNaN(v) || v < 0) { toast('Проверьте сумму'); return; }
    if (v) state.budgets[catId] = v; else delete state.budgets[catId];
    commit('Бюджет сохранён');
  });
}

/* ---------- Настройки ---------- */

function openSettings() {
  const opt = (list, sel) => list.map(([v, n]) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(n)}</option>`).join('');
  const p = openSheet(`
    <div class="sheet-head"><span></span><h2>Настройки</h2><button type="button" class="link strong" data-action="close">Готово</button></div>
    <div class="sect">Счета</div>
    <div class="group">
      ${state.accounts.map(a => `<button type="button" class="field" data-action="edit-acc" data-id="${a.id}"><span>${esc(a.icon)} ${esc(a.name)}</span><span class="v money">${fmt(balance(a.id))} ›</span></button>`).join('')}
      <button type="button" class="field link" data-action="add-acc">+ Добавить счёт</button>
    </div>
    <div class="group">
      <button type="button" class="field" data-action="cats"><span>Категории</span><span class="v">${state.categories.length} ›</span></button>
      <label class="field"><span>Валюта</span><select id="s-cur">${opt(CURRENCIES.map(c => [c, c]), state.currency)}</select></label>
      <label class="field"><span>Тема</span><select id="s-theme">${opt([['auto', 'Как в системе'], ['dark', 'Тёмная'], ['light', 'Светлая']], state.ui.theme)}</select></label>
    </div>
    <div class="sect">Данные</div>
    <p class="hint" style="margin-top:0">Данные хранятся только на этом устройстве. Регулярно делайте резервную копию.</p>
    <button type="button" class="btn ghost" data-action="export">Сохранить резервную копию (JSON)</button>
    <button type="button" class="btn ghost" data-action="export-csv">Выгрузить операции в CSV</button>
    <label class="btn ghost" style="display:grid;place-items:center">Восстановить из копии<input type="file" id="imp" accept="application/json,.json" hidden></label>
    <button type="button" class="btn ghost" data-action="demo">Заполнить демо-данными</button>
    <button type="button" class="btn danger" data-action="reset">Удалить все данные</button>
    <div class="foot">Кошелёк · записей: ${state.tx.length}</div>
  `);
  $('#s-cur', p).addEventListener('change', e => { state.currency = e.target.value; save(); render(); });
  $('#s-theme', p).addEventListener('change', e => { state.ui.theme = e.target.value; save(); render(); });
  $('#imp', p).addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data.accounts) || !Array.isArray(data.tx)) throw new Error('bad');
        if (!confirm(`Заменить текущие данные копией? (${data.tx.length} записей, ${data.accounts.length} счетов)`)) return;
        state = normalize(data);
        commit('Данные восстановлены');
      } catch (err) { toast('Файл не похож на резервную копию'); }
    };
    r.readAsText(file);
  });
}

function openCategories() {
  const sec = type => `
    <div class="sect">${type === 'expense' ? 'Расходы' : 'Доходы'}</div>
    <div class="group">
      ${catsOf(type).map(c => `<button type="button" class="field" data-action="edit-cat" data-id="${c.id}"><span>${esc(c.icon)} ${esc(c.name)}</span><span class="v"><i style="width:12px;height:12px;border-radius:4px;background:${c.color}"></i>›</span></button>`).join('')}
      <button type="button" class="field link" data-action="add-cat" data-type="${type}">+ Новая категория</button>
    </div>`;
  openSheet(`
    <div class="sheet-head"><button type="button" class="link" data-action="settings">‹ Назад</button><h2>Категории</h2><span></span></div>
    ${sec('expense')}${sec('income')}`);
}

function openCategory(id, type = 'expense') {
  const c = id ? catById(id) : null;
  type = c?.type || type;
  let icon = c?.icon || CAT_ICONS[0], color = c?.color || PALETTE[state.categories.length % PALETTE.length];
  const p = openSheet(`<form id="cf" novalidate>
    ${head(c ? 'Категория' : 'Новая категория')}
    <div class="group"><label class="field"><span>Название</span><input name="name" value="${esc(c?.name || '')}" maxlength="30" required></label></div>
    <div class="sect">Значок</div>
    <div class="emoji-grid">${CAT_ICONS.map(i => `<button type="button" data-i="${i}" aria-pressed="${i === icon}">${i}</button>`).join('')}</div>
    <div class="sect">Цвет</div>
    <div class="color-row">${PALETTE.map(x => `<button type="button" data-c="${x}" style="background:${x}" aria-pressed="${x === color}" aria-label="Цвет ${x}"></button>`).join('')}</div>
    ${c ? '<button type="button" class="btn danger" data-del>Удалить категорию</button>' : ''}
  </form>`);
  p.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.i) { icon = b.dataset.i; p.querySelectorAll('[data-i]').forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.dataset.c) { color = b.dataset.c; p.querySelectorAll('[data-c]').forEach(x => x.setAttribute('aria-pressed', x === b)); }
    if (b.hasAttribute('data-del')) {
      const others = catsOf(type).filter(x => x.id !== c.id);
      if (!others.length) { toast('Нужна хотя бы одна категория'); return; }
      const target = others.find(x => x.name === 'Другое') || others[0];
      const n = state.tx.filter(t => t.categoryId === c.id).length;
      if (!confirm(n ? `Удалить «${c.name}»? ${n} записей перейдут в «${target.name}».` : `Удалить «${c.name}»?`)) return;
      state.tx.forEach(t => { if (t.categoryId === c.id) t.categoryId = target.id; });
      state.subs.forEach(s => { if (s.categoryId === c.id) s.categoryId = target.id; });
      delete state.budgets[c.id];
      state.categories = state.categories.filter(x => x.id !== c.id);
      save(); render(); openCategories(); toast('Категория удалена');
    }
  });
  $('#cf', p).addEventListener('submit', e => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (!name) { toast('Введите название'); return; }
    if (c) Object.assign(c, { name, icon, color });
    else state.categories.push({ id: uid(), name, icon, color, type });
    save(); render(); openCategories();
  });
}

/* ---------- Экспорт ---------- */

async function shareOrDownload(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const file = new File([blob], name, { type: mime });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportJSON() {
  shareOrDownload(`wallet-backup-${today()}.json`, JSON.stringify(state, null, 1), 'application/json');
}
function exportCSV() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const types = { expense: 'Расход', income: 'Доход', transfer: 'Перевод' };
  const lines = [['Дата', 'Тип', 'Сумма', 'Валюта', 'Счёт', 'На счёт', 'Категория', 'Заметка'].map(q).join(',')];
  for (const t of sortTx(state.tx)) {
    const amt = (t.type === 'expense' ? -t.amount : t.amount) / 100;
    lines.push([t.date, types[t.type], amt.toFixed(2), state.currency, accById(t.accountId)?.name, accById(t.toAccountId)?.name, catById(t.categoryId)?.name, t.note].map(q).join(','));
  }
  shareOrDownload(`wallet-${today()}.csv`, '﻿' + lines.join('\n'), 'text/csv');
}

function loadDemo() {
  if (state.tx.length && !confirm('Демо-данные заменят текущие. Продолжить?')) return;
  const s = defaults();
  const [cash, card] = s.accounts;
  card.name = 'Моя карта'; cash.initial = 300000; card.initial = 820000;
  const savings = { id: uid(), name: 'Накопления', icon: '🏦', color: '#22C55E', initial: 1500000 };
  s.accounts.push(savings);
  const cat = n => s.categories.find(c => c.name === n && c.type === 'expense').id;
  const inc = n => s.categories.find(c => c.name === n && c.type === 'income').id;
  const base = new Date();
  const day = k => { const d = new Date(base); d.setDate(d.getDate() - k); return ymd(d); };
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const add = (k, type, amount, accountId, categoryId, note = '') => s.tx.push({ id: uid(), ts: Date.now() - k * 1000, type, amount, accountId, categoryId, date: day(k), note });
  for (let k = 0; k < 150; k++) {
    if (rnd() < 0.75) add(k, 'expense', Math.round(40 + rnd() * 260) * 100, rnd() < 0.8 ? card.id : cash.id, cat('Продукты'), rnd() < 0.5 ? 'Супермаркет' : '');
    if (rnd() < 0.35) add(k, 'expense', Math.round(30 + rnd() * 120) * 100, card.id, cat('Кафе и рестораны'), rnd() < 0.5 ? 'Кофе' : 'Ужин');
    if (rnd() < 0.3) add(k, 'expense', Math.round(6 + rnd() * 40) * 100, rnd() < 0.5 ? cash.id : card.id, cat('Транспорт'), 'Рав-кав');
    if (rnd() < 0.08) add(k, 'expense', Math.round(80 + rnd() * 400) * 100, card.id, cat('Одежда и обувь'));
    if (rnd() < 0.08) add(k, 'expense', Math.round(50 + rnd() * 200) * 100, card.id, cat('Развлечения'), 'Кино');
    if (rnd() < 0.05) add(k, 'expense', Math.round(60 + rnd() * 300) * 100, card.id, cat('Здоровье'), 'Аптека');
    const d = parseDate(day(k));
    if (d.getDate() === 10) add(k, 'income', 1450000, card.id, inc('Зарплата'), 'Зарплата');
    if (d.getDate() === 1) add(k, 'expense', 450000, card.id, cat('Жильё'), 'Аренда');
    if (d.getDate() === 15) add(k, 'expense', Math.round(300 + rnd() * 200) * 100, card.id, cat('Коммуналка'), 'Электричество');
    if (d.getDate() === 12) s.tx.push({ id: uid(), ts: Date.now(), type: 'transfer', amount: 200000, accountId: card.id, toAccountId: savings.id, date: day(k), note: 'В копилку' });
  }
  const next = (dd) => { const d = new Date(base.getFullYear(), base.getMonth(), dd); if (ymd(d) < today()) d.setMonth(d.getMonth() + 1); return ymd(d); };
  s.subs = [
    { id: uid(), name: 'Netflix', amount: 4990, period: 'month', next: next(11), day: 11, accountId: card.id, categoryId: cat('Подписки'), active: true },
    { id: uid(), name: 'Spotify', amount: 2190, period: 'month', next: next(20), day: 20, accountId: card.id, categoryId: cat('Подписки'), active: true },
    { id: uid(), name: 'Мобильная связь', amount: 5900, period: 'month', next: next(5), day: 5, accountId: card.id, categoryId: cat('Связь и интернет'), active: true },
    { id: uid(), name: 'Спортзал', amount: 199000, period: 'year', next: ymd(new Date(base.getFullYear() + 1, 0, 15)), day: 15, accountId: card.id, categoryId: cat('Здоровье'), active: true }
  ];
  s.budgets = { [cat('Продукты')]: 300000, [cat('Кафе и рестораны')]: 100000, [cat('Транспорт')]: 40000, [cat('Развлечения')]: 50000, [cat('Одежда и обувь')]: 50000, [cat('Жильё')]: 450000, [cat('Коммуналка')]: 60000 };
  s.ui = state.ui;
  state = s;
  commit('Демо-данные загружены');
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

const actions = {
  tab: el => { view = el.dataset.v; if (view !== 'ops') { filter.cat = null; } render(); window.scrollTo(0, 0); },
  period: el => { shiftPeriod(Number(el.dataset.d)); render(); },
  'period-mode': () => {
    if (period.mode === 'month') period.mode = 'year';
    else { period.mode = 'month'; if (period.y === new Date().getFullYear()) period.m = new Date().getMonth(); else period.m = 0; }
    render();
  },
  'period-now': () => { const d = new Date(); period.y = d.getFullYear(); period.m = d.getMonth(); render(); },
  'toggle-hide': () => { state.ui.hide = !state.ui.hide; save(); render(); },
  settings: openSettings,
  close: closeSheet,
  'add-tx': () => openTx(null, view === 'ops' && filter.acc ? { accountId: filter.acc } : {}),
  'edit-tx': el => openTx(el.dataset.id),
  'add-acc': () => openAccount(),
  'edit-acc': el => openAccount(el.dataset.id),
  'acc-open': el => openAccount(el.dataset.id),
  'acc-ops': el => { filter = { acc: el.dataset.id, cat: null, q: '' }; view = 'ops'; closeSheet(); render(); window.scrollTo(0, 0); },
  'cat-open': el => { filter = { acc: null, cat: el.dataset.id, q: '' }; view = 'ops'; closeSheet(); render(); window.scrollTo(0, 0); },
  'f-acc': el => { filter.acc = el.dataset.id || null; render(); },
  'f-cat-clear': () => { filter.cat = null; render(); },
  'add-sub': () => openSub(),
  'edit-sub': el => openSub(el.dataset.id),
  'sub-pay': el => paySub(el.dataset.id, false),
  'sub-skip': el => paySub(el.dataset.id, true),
  'edit-budget': el => openBudget(el.dataset.id),
  cats: openCategories,
  'add-cat': el => openCategory(null, el.dataset.type),
  'edit-cat': el => openCategory(el.dataset.id),
  export: exportJSON,
  'export-csv': exportCSV,
  demo: loadDemo,
  reset: () => {
    if (!confirm('Удалить все счета, записи, бюджеты и подписки? Это нельзя отменить.')) return;
    const ui = state.ui; state = defaults(); state.ui = ui; filter = { acc: null, cat: null, q: '' };
    commit('Все данные удалены');
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') { filter.q = e.target.value; drawOpsList(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#sheet').classList.contains('open')) closeSheet();
});
// Новый день или возврат в приложение: пересчитать «сегодня» и подписки
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#sheet').classList.contains('open')) render(); });

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
