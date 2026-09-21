/* ============ 双休购 · SPA 核心逻辑（v3 电商完整版） ============ */
'use strict';

/* ---------- 工具 ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const HERO_IMG = 'img/hero.jpg';
const fmtMoney = n => '¥' + (Number(n) || 0).toLocaleString('zh-CN');
const fmtTime = iso => { const d = new Date(iso); return (d.getMonth()+1)+'-'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };
const starsHTML = r => {
  const v = parseFloat(r) || 5;
  const full = Math.round(v);
  return '<span class="stars" aria-label="评分'+v+'">★★★★★</span><span class="stars-v">'+v.toFixed(1)+'</span>';
};

/* ---------- 数据合并 ---------- */
const getCustom = () => { try { return JSON.parse(localStorage.getItem('sxg_custom') || '[]'); } catch (e) { return []; } };
const saveCustom = list => { try { localStorage.setItem('sxg_custom', JSON.stringify(list)); } catch (e) { toast('保存失败：浏览器存储不可用'); } };
const ALL_GOOD = () => [...COMPANIES, ...EXTRA_COMPANIES, ...(typeof EXTRA_COMPANIES_V2 !== 'undefined' ? EXTRA_COMPANIES_V2 : []), ...getCustom()];
const ALL_BAD = () => [...BLACKLIST, ...(typeof BLACKLIST_EXTRA !== 'undefined' ? BLACKLIST_EXTRA : []), ...(typeof BLACKLIST_EXTRA2 !== 'undefined' ? BLACKLIST_EXTRA2 : [])];
const byId = id => ALL_GOOD().find(c => c.id === id);
const badById = id => ALL_BAD().find(b => b.id === id);

/* 商品富化：拼上企业与价格/销量/评分/图 */
function enrichP(c, p, i) {
  const en = enrichProduct(p);
  return { ...p, cid: c.id, cname: c.short, color: c.color, initial: c.initial, policy: c.policy, pid: c.id + '-' + i, ...en, company: c };
}
const getAllProducts = () => ALL_GOOD().flatMap(c => c.products.map((p, i) => enrichP(c, p, i)));
const getProductByPid = pid => {
  const idx = String(pid).lastIndexOf('-');
  if (idx < 0) return null;
  const cid = pid.slice(0, idx);
  const i = parseInt(pid.slice(idx + 1), 10);
  const c = byId(cid);
  if (!c || !c.products[i] || isNaN(i)) return null;
  return enrichP(c, c.products[i], i);
};

/* ---------- 收藏 ---------- */
const store = {
  get favs() { try { return JSON.parse(localStorage.getItem('sxg_favs') || '[]'); } catch (e) { return []; } },
  set favs(v) { try { localStorage.setItem('sxg_favs', JSON.stringify(v)); } catch (e) {} }
};
const isFav = id => store.favs.includes(id);
function toggleFav(id, name) {
  const favs = store.favs;
  const i = favs.indexOf(id);
  if (i >= 0) { favs.splice(i, 1); toast('已取消收藏 ' + name); }
  else { favs.push(id); toast('已收藏 ' + name); }
  store.favs = favs;
  updateFavUI();
}

/* ---------- 收藏 ---------- */
const getCart = () => { try { return JSON.parse(localStorage.getItem('sxg_cart') || '[]'); } catch (e) { return []; }};
const saveCart = c => { try { localStorage.setItem('sxg_cart', JSON.stringify(c)); } catch (e) {} };
const cartCount = () => getCart().reduce((s, x) => s + (x.qty || 0), 0);
const cartDetail = () => getCart().map(it => ({ prod: getProductByPid(it.pid), qty: it.qty })).filter(x => x.prod);

/* ---------- 最近浏览 / 商品收藏 / 积分 ---------- */
const getRecent = () => { try { return JSON.parse(localStorage.getItem('sxg_recent') || '[]'); } catch (e) { return []; } };
function pushRecent(pid) { try { const r = getRecent().filter(x => x !== pid); r.unshift(pid); localStorage.setItem('sxg_recent', JSON.stringify(r.slice(0, 10))); } catch (e) {} }
const getFavProducts = () => { try { return JSON.parse(localStorage.getItem('sxg_favp') || '[]'); } catch (e) { return []; } };
const isFavProduct = pid => getFavProducts().includes(pid);
function toggleFavProduct(pid) { try { const f = getFavProducts(); const i = f.indexOf(pid); if (i >= 0) f.splice(i, 1); else f.unshift(pid); localStorage.setItem('sxg_favp', JSON.stringify(f)); } catch (e) {} }
const getPoints = () => { try { return parseInt(localStorage.getItem('sxg_points') || '0', 10); } catch (e) { return 0; } };
const addPoints = n => { try { localStorage.setItem('sxg_points', String(getPoints() + n)); } catch (e) {} };
/* ---------- 商品对比 ---------- */
const getCompareList = () => { try { return JSON.parse(localStorage.getItem('sxg_compare') || '[]'); } catch (e) { return []; } };
const isInCompare = pid => getCompareList().includes(pid);
function toggleCompare(pid) { try { const c = getCompareList(); const i = c.indexOf(pid); if (i >= 0) c.splice(i, 1); else { if (c.length >= 4) c.shift(); c.push(pid); } localStorage.setItem('sxg_compare', JSON.stringify(c)); } catch (e) {} }
/* ---------- 签到 / 搜索历史 / 用户评价 ---------- */
const getCheckinDate = () => { try { return localStorage.getItem('sxg_checkin') || ''; } catch (e) { return ''; } };
const canCheckin = () => getCheckinDate() !== new Date().toDateString();
function doCheckin() { try { localStorage.setItem('sxg_checkin', new Date().toDateString()); addPoints(10); } catch (e) {} }
const getSearchHistory = () => { try { return JSON.parse(localStorage.getItem('sxg_searchhist') || '[]'); } catch (e) { return []; } };
function pushSearchHistory(q) { try { const h = getSearchHistory().filter(x => x !== q); h.unshift(q); localStorage.setItem('sxg_searchhist', JSON.stringify(h.slice(0, 8))); } catch (e) {} }
const getUserReviews = () => { try { return JSON.parse(localStorage.getItem('sxg_ureviews') || '[]'); } catch (e) { return []; } };
function addUserReview(pid, rating, text) { try { const r = getUserReviews(); r.unshift({ pid, rating, text, daysAgo: 0, name: '我', color: '#2E7D5B', initial: '我', helpful: 0 }); localStorage.setItem('sxg_ureviews', JSON.stringify(r)); } catch (e) {} }
function addToCart(pid, qty = 1) {
  const cart = getCart();
  const hit = cart.find(x => x.pid === pid);
  if (hit) hit.qty += qty; else cart.push({ pid, qty });
  saveCart(cart);
  syncCartUI();
}
function setCartQty(pid, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter(x => x.pid !== pid);
  else { const h = cart.find(x => x.pid === pid); if (h) h.qty = qty; }
  saveCart(cart); syncCartUI();
}
const cartTotal = () => cartDetail().reduce((s, x) => s + x.prod.price * x.qty, 0);

/* ---------- 订单 ---------- */
const ORDER_STATUS = {
  pending_pay: '待付款', pending_ship: '待发货', shipped: '待收货',
  received: '待评价', done: '已完成', aftersale: '售后中', cancelled: '已取消'
};
const getOrders = () => { try { return JSON.parse(localStorage.getItem('sxg_orders') || '[]'); } catch (e) { return []; } };
const saveOrders = o => { try { localStorage.setItem('sxg_orders', JSON.stringify(o)); } catch (e) {} };
const getOrder = id => getOrders().find(o => o.id === id);
function updateOrder(id, patch) {
  const os = getOrders();
  const o = os.find(x => x.id === id);
  if (!o) return;
  Object.assign(o, patch);
  saveOrders(os);
}
const nowISO = () => new Date().toISOString();
function pushTimeline(o, text) {
  o.timeline = o.timeline || [];
  o.timeline.unshift({ text, time: nowISO() });
}

/* ---------- 常量 ---------- */
const WEEK_LABEL = { work: '班', rest: '休', half: '半', wfh: '家', flex: '弹' };
const STATUS_LABEL = { verified: '已核实', reported: '媒体报道', partial: '部分岗位', community: '社区口碑', pending: '自荐待核实' };
const REST_BY_POLICY = { four_three: 3, four_half: 2.5, double_rest: 2, flexible: 2 };
const PATTERN_BY_POLICY = { four_three: ['work','work','work','work','rest','rest','rest'], four_half: ['work','work','work','work','half','rest','rest'], double_rest: ['work','work','work','work','work','rest','rest'], flexible: ['flex','flex','flex','flex','flex','rest','rest'] };
const zhipinUrl = kw => 'https://www.zhipin.com/web/geek/job?query=' + encodeURIComponent(kw);
const LEGEND_HTML = `<div class="legend">
  <span><i style="background:var(--work)"></i>工作日</span>
  <span><i style="background:var(--rest)"></i>休息</span>
  <span><i style="background:linear-gradient(to bottom,var(--work) 50%,var(--half) 50%)"></i>休半天</span>
  <span><i style="background:var(--wfh)"></i>居家办公</span>
  <span><i style="background:var(--amber-soft);border:1px dashed var(--amber)"></i>弹性通勤</span>
</div>`;

/* ---------- 组件 ---------- */
function weekbarHTML(pattern, lg = false) {
  return `<div class="weekbar${lg ? ' lg' : ''}">` + pattern.map((st, i) =>
    `<div class="d"><div class="bar ${st}">${WEEK_LABEL[st]}</div><div class="lbl">周${WEEK_DAYS[i]}</div></div>`
  ).join('') + `</div>`;
}
function avatarHTML(c, cls = 'avatar') {
  return `<div class="${cls}" style="background:${c.color};position:relative;overflow:hidden;flex-shrink:0">${esc(c.initial)}${c.domain ? `<img src="https://logo.clearbit.com/${c.domain}?size=128" alt="" loading="lazy" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;padding:5px;border-radius:inherit">` : ''}</div>`;
}
function badgeHTML(c) { return `<span class="badge ${c.policy}">${esc(c.policyLabel)}</span>`; }
function statusPillHTML(c) {
  const cls = c.status === 'pending' ? 'status-pill pend' : 'status-pill';
  return `<span class="${cls}">${STATUS_LABEL[c.status] || c.status}</span>`;
}

function coCardHTML(c) {
  const hot = c.products[0] ? enrichProduct(c.products[0]) : null;
  return `
  <article class="co-card" data-goto="#/company/${c.id}">
    <div class="co-head">
      ${avatarHTML(c)}
      <div style="min-width:0">
        <div class="co-name">${esc(c.short)}</div>
        <div class="co-meta">${esc(c.city)} · ${esc(c.industry)}</div>
      </div>
      <div style="margin-left:auto">${badgeHTML(c)}</div>
    </div>
    ${weekbarHTML(c.pattern)}
    <p class="co-summary">${esc(c.summary)}</p>
    <div class="co-foot">
      <span class="rest-pill">每周休 ${c.restDays} 天${c.salaryKept ? ' · 薪资不变' : ''}</span>
      ${statusPillHTML(c)}
      <button class="fav-btn ${isFav(c.id) ? 'on' : ''}" data-fav="${c.id}" data-name="${esc(c.short)}" aria-label="收藏" title="收藏">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>
  </article>`;
}

/* 商品卡片（带价格、销量、加购） */
function pdCardHTML(p, showCo = true) {
  const h = hashStr(p.name + '|' + (p.cid || ''));
  const stock = (h % 50) + 1;
  const offPct = Math.round((1 - p.price / p.origPrice) * 100);
  return `
  <article class="pd-card" data-goto="#/product/${p.pid}">
    <div class="pd-img">
      <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" onerror="this.src='img/products/shopping.jpg'">
      ${p.hot ? '<span class="hot-tag">热门</span>' : ''}
      ${offPct >= 25 ? `<span class="off-tag">${offPct}%OFF</span>` : ''}
      ${stock <= 8 ? `<span class="stock-tag">仅剩${stock}件</span>` : ''}
    </div>
    <div class="pd-body">
      <div class="pd-name">${esc(p.name)}</div>
      <div class="pd-desc">${esc(p.desc)}</div>
      <div class="pd-rate">${starsHTML(p.rating)}<span class="tiny">演示销量 ${p.sales}</span></div>
      <div class="pd-foot">
        <div class="pd-price"><b>${fmtMoney(p.price)}</b><s>${fmtMoney(p.origPrice)}</s></div>
        <button class="cart-add-btn" data-addcart="${p.pid}" aria-label="收藏">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </button>
      </div>
      ${showCo ? `<div class="pd-co-line"><span class="mini-av" style="background:${p.color}">${esc(p.initial)}</span>${esc(p.cname)}<span class="pd-cat">${esc(p.cat)}${p.sub ? ' · ' + esc(p.sub) : ''}</span></div>` : `<div class="pd-cat">${esc(p.cat)}${p.sub ? ' · ' + esc(p.sub) : ''}</div>`}
    </div>
  </article>`;
}

function rankItemHTML(c, i) {
  return `
  <div class="rank-item" data-goto="#/company/${c.id}">
    <div class="rank-no">${i + 1}</div>
    ${avatarHTML(c)}
    <div style="min-width:0">
      <div class="rank-name">${esc(c.short)}</div>
      <div class="rank-meta">${esc(c.policyLabel)} · ${esc(c.city)}</div>
    </div>
    <div class="rank-rest"><b>${c.restDays}</b><span>天/周</span></div>
  </div>`;
}

function badCardHTML(b) {
  const sev = b.severity === 'high' ? '<span class="sev high">已生效法律文书</span>' : '<span class="sev mid">行政监管记录</span>';
  return `
  <article class="bad-card" data-goto="#/badcase/${b.id}">
    <div class="bad-main">
      <div class="bad-top">
        <span class="bad-issue">${esc(b.issue)}</span>
        ${sev}
        <span class="bad-status ${b.status}">${BAD_STATUS[b.status]}</span>
        <span class="bad-year">${esc(b.year)}</span>
      </div>
      <div class="bad-name">${esc(b.short)} <span class="tiny">${esc(b.industry)} · ${esc(b.city)}</span></div>
      <p class="bad-summary">${esc(b.summary)}</p>
    </div>
    <div class="bad-cta">查看案例与参考清单 →</div>
  </article>`;
}

/* ---------- 页面：首页 ---------- */
function pageHome() {
  const all = ALL_GOOD();
  const prods = getAllProducts();
  const ranked = [...all].sort((a, b) => b.restDays - a.restDays || a.short.localeCompare(b.short, 'zh'));
  const f43 = all.filter(c => c.policy === 'four_three');
  const hot = prods.filter(p => p.hot).slice(0, 10);
  const rest3 = all.filter(c => c.restDays >= 2.5).length;
  const topBad = ALL_BAD().filter(b => b.severity === 'high').slice(0, 3);

  return `
  <section class="hero">
    <div class="hero-inner">
      <span class="hero-tag">📋 劳动权益信息参考（演示 Demo）</span>
      <h1>了解企业用工环境，<br>参考<em>劳动争议公开记录</em></h1>
      <p>收录双休/上四休三企业信息与商品展示（演示）；同时整理已生效法律文书的劳动争议记录，供求职者与消费者参考。本应用不引导特定购买决策。</p>
      <div class="hero-actions">
        <a class="btn btn-orange" href="#/products">浏览商品 · 演示</a>
        <a class="btn btn-ghost" href="#/blacklist">劳动争议记录 · 供参考</a>
        <button class="btn btn-ghost" id="btnCheckin">${canCheckin() ? '📅 每日签到 +10积分' : '✅ 今日已签到'}</button>
        <a class="btn btn-ghost" href="#/coupons">🎫 优惠券中心</a>
      </div>
      <div class="hero-points">我的积分：<b id="userPoints">${getPoints()}</b> · ${getMember(getPoints()).cur.name}</div>
      <div class="install-banner" id="installBanner">
        <span>📲 把「双休购」装到手机桌面，像 App 一样使用</span>
        <button id="installBtn">安装</button>
        <button class="close" id="installClose" aria-label="关闭">✕</button>
      </div>
    </div>
    <div class="hero-img"><img src="${HERO_IMG}" alt="周末公园治愈插画" onerror="this.parentElement.style.display='none'"></div>
  </section>

  <section class="stats anim">
    <div class="stat-card"><b><span class="count-up" data-count="${all.length}">0</span><span class="u">家</span></b><span>收录双休企业</span></div>
    <div class="stat-card"><b><span class="count-up" data-count="${rest3}">0</span><span class="u">家</span></b><span>每周休 ≥ 2.5 天</span></div>
    <div class="stat-card"><b><span class="count-up" data-count="${prods.length}">0</span><span class="u">个</span></b><span>商品/服务展示</span></div>
    <div class="stat-card"><b style="color:#C0392B"><span class="count-up" data-count="${ALL_BAD().length}">0</span><span class="u">家</span></b><span>劳动争议记录（劳动权益）</span></div>
  </section>

  <h2 class="sec-title">每周休息天数榜<a class="more" href="#/rank">完整榜单 →</a></h2>
  <div class="rank-list anim">${ranked.slice(0, 5).map(rankItemHTML).join('')}</div>

  <h2 class="sec-title">上四休三 · 每周休3天的企业<a class="more" href="#/companies?p=four_three">查看全部 →</a></h2>
  <div class="co-grid anim">${f43.map(coCardHTML).join('')}</div>

  <h2 class="sec-title">热门商品展示<a class="more" href="#/products">全部商品 →</a></h2>
  <div class="pd-grid anim">${hot.map(p => pdCardHTML(p)).join('')}</div>

  ${(() => {
    const recent = getRecent().map(pid => getProductByPid(pid)).filter(Boolean).slice(0, 4);
    if (!recent.length) return '';
    return `<h2 class="sec-title">👀 最近浏览</h2><div class="pd-grid anim">${recent.map(p => pdCardHTML(p)).join('')}</div>`;
  })()}

  <h2 class="sec-title" style="--x:1">⚠️ 劳动争议记录 · 这些企业的用工争议记录供参考<a class="more" href="#/blacklist">进入劳动权益 →</a></h2>
  <div class="bad-list anim">${topBad.map(badCardHTML).join('')}</div>

  <h2 class="sec-title">打工人行动指南</h2>
  <div class="guide-grid anim">
    ${ACTION_GUIDES.map(g => `
      <div class="guide-card">
        <div class="guide-ico">${guideIcon(g.icon)}</div>
        <h4>${esc(g.title)}</h4>
        <p>${esc(g.text)}</p>
      </div>`).join('')}
  </div>

  <section class="join-cta">
    <div>
      <b>你的公司也实行双休/上四休三？</b>
      <p>提交企业信息与商品，符合「休息增加、薪资不变」规定的即可上架展示。</p>
    </div>
    <a class="btn btn-orange" href="#/join">企业入驻上架 →</a>
  </section>`;
}

function guideIcon(name) {
  const icons = {
    cart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    megaphone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    scale: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 21h18M5 7l3 8a3.5 3.5 0 0 1-6 0l3-8zm14 0 3 8a3.5 3.5 0 0 1-6 0l3-8zM7 7h10"/></svg>',
    users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  };
  return icons[name] || icons.cart;
}

/* ---------- 页面：企业榜 ---------- */
function pageCompanies(params) {
  const p = params.get('p') || 'all';
  const q = (params.get('q') || '').trim().toLowerCase();
  const s = params.get('s') || 'rest';
  const all = ALL_GOOD();

  let list = all.filter(c => p === 'all' || c.policy === p);
  if (q) { const qs = q.toLowerCase().split(/\s+/).filter(Boolean); list = list.filter(c => { const s = (c.name + c.short + c.city + c.industry + c.summary + c.products.map(x => x.name).join('')).toLowerCase(); return qs.every(k => s.includes(k)); }); }
  if (s === 'rest') list.sort((a, b) => b.restDays - a.restDays || a.short.localeCompare(b.short, 'zh'));
  else if (s === 'since') list.sort((a, b) => String(b.since).localeCompare(String(a.since)));
  else if (s === 'name') list.sort((a, b) => a.short.localeCompare(b.short, 'zh'));

  const chips = [['all', '全部'], ...Object.entries(POLICY_META).map(([k, v]) => [k, v.label])];
  const countOf = k => k === 'all' ? all.length : all.filter(c => c.policy === k).length;
  const badHits = q ? ALL_BAD().filter(b => (b.name + b.short).toLowerCase().includes(q)) : [];

  return `
  <h2 class="sec-title">双休企业榜 <span class="tiny" style="font-weight:400">每家均附政策来源、实施时间与薪资待遇</span></h2>
  <div class="join-banner">
    <span>🏢 你的公司也双休？符合规定即可上架商品</span>
    <a class="btn btn-green btn-sm" href="#/join">企业入驻</a>
  </div>
  <div class="filter-row" style="margin-bottom:18px">
    ${chips.map(([k, label]) => `<button class="chip ${p === k ? 'active' : ''}" data-chip="${k}">${label}<span class="n">${countOf(k)}</span></button>`).join('')}
    <select class="sort-sel" id="sortSel" aria-label="排序">
      <option value="rest" ${s === 'rest' ? 'selected' : ''}>按每周休息天数</option>
      <option value="since" ${s === 'since' ? 'selected' : ''}>按实施时间</option>
      <option value="name" ${s === 'name' ? 'selected' : ''}>按名称</option>
    </select>
  </div>
  ${badHits.map(b => `<div class="warn-box" data-goto="#/badcase/${b.id}">⚠️ <b>${esc(b.short)}</b> 在劳动权益名单中（${esc(b.issue)}），点击查看案例与参考建议 →</div>`).join('')}
  ${q ? `<p class="muted" style="margin-bottom:14px;font-size:13.5px">「${esc(q)}」的搜索结果：${list.length} 家企业</p>` : ''}
  ${list.length ? `<div class="co-grid anim">${list.map(coCardHTML).join('')}</div>`
    : `<div class="empty"><div class="emo">🔍</div>没有找到匹配的企业，换个关键词试试</div>`}`;
}

/* ---------- 页面：企业详情 ---------- */
function pageCompanyDetail(id) {
  const c = byId(id);
  if (!c) return `<div class="empty"><div class="emo">😶</div>未找到该企业 <div style="margin-top:14px"><a class="btn btn-green" href="#/companies">返回企业榜</a></div></div>`;
  const m = POLICY_META[c.policy];
  const careersUrl = c.careers || zhipinUrl(c.short);
  const careersIsOfficial = !!c.careers;
  const jobs = getJobs(c.id);
  return `
  <a class="back-link" href="#/companies">← 返回企业榜</a>
  ${c.status === 'pending' ? `<div class="note-box" style="margin-bottom:14px"><b>🟡 自荐信息待核实：</b>该企业由用户自主提交，双休购尚未完成独立核实。<button class="btn btn-danger btn-sm" id="delCustom" style="float:right">删除该自荐</button></div>` : ''}
  <section class="detail-hero">
    <div class="detail-head">
      ${avatarHTML(c, 'avatar detail-av')}
      <div style="flex:1;min-width:220px">
        <h1 class="detail-title">${esc(c.short)}</h1>
        <div class="detail-sub">${esc(c.name)}</div>
        <div class="detail-badges">
          ${badgeHTML(c)}
          ${statusPillHTML(c)}
          ${c.salaryKept ? '<span class="rest-pill">薪资不打折</span>' : ''}
        </div>
      </div>
      <button class="btn ${isFav(c.id) ? 'btn-green' : 'btn-orange'}" data-fav="${c.id}" data-name="${esc(c.short)}">
        ${isFav(c.id) ? '✓ 已收藏' : '♡ 收藏支持'}
      </button>
    </div>
    <div class="fact-grid">
      <div class="fact"><div class="k">工时政策</div><div class="v" style="color:${m.color}">${esc(c.policyLabel)}</div></div>
      <div class="fact"><div class="k">每周休息</div><div class="v ok">${c.restDays} 天</div></div>
      <div class="fact"><div class="k">薪资水平</div><div class="v ok">${esc(c.salary.level)}</div></div>
      <div class="fact"><div class="k">实施时间</div><div class="v">${esc(c.since)}</div></div>
      <div class="fact"><div class="k">所在城市</div><div class="v">${esc(c.city)}</div></div>
      <div class="fact"><div class="k">所属行业</div><div class="v">${esc(c.industry)}</div></div>
    </div>
  </section>

  <section class="panel">
    <h3><span class="q">📅</span>一周作息表</h3>
    ${weekbarHTML(c.pattern, true)}
    <p class="muted" style="margin:14px 0 12px;font-size:13.5px">${esc(c.patternNote)}</p>
    ${LEGEND_HTML}
  </section>

  <section class="panel">
    <h3><span class="q">💰</span>薪资与待遇</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px">
      <span class="salary-level">${esc(c.salary.level)}</span>
      ${(c.salary.benefits || []).map(b => `<span class="benefit-chip">${esc(b)}</span>`).join('')}
    </div>
    ${(() => {
      // 薪资区间条
      const ranges = {'低':20,'中低':35,'中':50,'中高':70,'高':85};
      const pct = ranges[c.salary.level] || 50;
      return `<div class="salary-bar">
        <div class="sb-track"><div class="sb-fill" style="width:${pct}%"></div></div>
        <div class="sb-labels"><span>¥10k</span><span>¥20k</span><span>¥35k</span><span>¥50k+</span></div>
      </div>`;
    })()}
    <p class="muted" style="font-size:13.5px;margin-top:10px">${esc(c.salary.note)}</p>
  </section>

  <section class="panel">
    <h3><span class="q">💼</span>去这家企业应聘</h3>
    <p class="muted" style="font-size:13.5px;margin-bottom:14px">想去真正把双休落到实处的公司上班？看看在招岗位，或从官方渠道投递简历。</p>
    ${jobs.length ? `<div class="job-list">${jobs.map(j => `
      <div class="job-item">
        <div class="job-top"><b>${esc(j.title)}</b><span class="job-salary">${esc(j.salary)}</span></div>
        <div class="job-meta">📍${esc(j.loc)} · ${j.tags.map(t => `<span class="job-tag">${esc(t)}</span>`).join('')}</div>
      </div>`).join('')}</div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
      <a class="btn btn-green" href="${esc(careersUrl)}" target="_blank" rel="noopener noreferrer">${careersIsOfficial ? '官方招聘网站 →' : 'BOSS直聘搜索该企业 →'}</a>
      <a class="btn btn-outline" href="${zhipinUrl(c.short)}" target="_blank" rel="noopener noreferrer">在招职位搜索 →</a>
    </div>
    <p class="tiny" style="margin-top:12px">💡 面试时主动问清「是否双休、加班频率与加班费/调休制度」。岗位信息为示例，以官方实时为准。</p>
    <div style="margin-top:18px;padding:16px;background:var(--bg);border-radius:12px">
      <b style="font-size:14px">📝 快速投递简历到「${esc(c.short)}」</b>
      <form id="applyForm" style="margin-top:12px;display:grid;gap:10px;grid-template-columns:1fr 1fr">
        <input name="aname" placeholder="你的姓名" required style="padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;font-size:13.5px">
        <input name="aphone" placeholder="手机号" required pattern="1[0-9]{10}" style="padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;font-size:13.5px">
        <select name="ajob" style="grid-column:1/-1;padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;font-size:13.5px">
          ${jobs.length ? jobs.map(j => `<option>${esc(j.title)}</option>`).join('') : '<option>通用岗位</option>'}
        </select>
        <textarea name="amsg" placeholder="自我介绍（选填）" rows="2" style="grid-column:1/-1;padding:9px 12px;border:1.5px solid var(--line);border-radius:8px;font-size:13.5px"></textarea>
        <button type="submit" class="btn btn-green" style="grid-column:1/-1">提交简历（仅演示）</button>
      </form>
      <div id="applyMsg" style="margin-top:8px"></div>
    </div>
  </section>

  <section class="panel">
    <h3><span class="q">📖</span>政策详情</h3>
    <p style="font-size:14.5px;line-height:1.9">${esc(c.summary)}</p>
    <div class="evidence" style="margin-top:14px"><b>📰 信息来源：</b>${esc(c.evidence)}</div>
    ${c.note ? `<div class="note-box"><b>⚠️ 备注：</b>${esc(c.note)}</div>` : ''}
  </section>

  <section class="panel">
    <h3><span class="q">🛒</span>可以支持的商品（${c.products.length}）</h3>
    <div class="pd-grid">${c.products.map((p, i) => pdCardHTML(enrichP(c, p, i), false)).join('')}</div>
    <p class="tiny" style="margin-top:14px">💡 每一笔对双休企业的消费，都是在鼓励更多企业跟进。</p>
  </section>`;
}

/* ---------- 页面：商品详情 ---------- */
function pageProductDetail(pid) {
  if (pid) pushRecent(pid);
  const p = getProductByPid(pid);
  if (!p) return `<div class="empty"><div class="emo">😶</div>未找到该商品 <div style="margin-top:14px"><a class="btn btn-green" href="#/products">返回商品库</a></div></div>`;
  const c = p.company;
  const related = getAllProducts().filter(x => x.cid === p.cid && x.pid !== p.pid).slice(0, 4);
  const reviews = getReviews(pid);
  const faved = isFavProduct(pid);
  const couponInfo = COUPONS.filter(cp => (cp.cat === '全部' || cp.cat === p.cat));
  const inCmp = isInCompare(pid);
  const h = hashStr(pid);
  // 生成30天价格走势（确定性）
  const pricePoints = [];
  for (let i = 29; i >= 0; i--) {
    const fluct = Math.sin((h + i * 7) / 5) * 0.06 + Math.cos((h + i * 3) / 11) * 0.04;
    pricePoints.push(p.price * (1 + fluct - i * 0.003));
  }
  const minP = Math.min(...pricePoints), maxP = Math.max(...pricePoints);
  const sparkPath = pricePoints.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / 29 * 260).toFixed(1)},${(30 - (v - minP) / (maxP - minP || 1) * 28).toFixed(1)}`).join(' ');
  return `
  <a class="back-link" href="#/products">← 返回商品库</a>
  <section class="pd-detail">
    <div class="pd-detail-media">
      <div class="gallery-main"><img id="galleryMain" src="${p.img}" alt="${esc(p.name)}" onerror="this.src='img/products/shopping.jpg'"></div>
      <div class="gallery-thumbs">
        <img class="gthumb active" src="${p.img}" data-filter="" alt="主图">
        <img class="gthumb" src="${p.img}" data-filter="brightness(1.1) saturate(1.2)" alt="细节">
        <img class="gthumb" src="${p.img}" data-filter="contrast(1.15)" alt="场景">
      </div>
      <span class="hot-tag" style="position:absolute;top:14px;left:14px">${esc(c.policyLabel)}</span>
      <button class="pd-fav-btn ${faved ? 'on' : ''}" id="btnFavProduct" data-pid="${p.pid}" aria-label="收藏商品">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${faved ? '#E8792B' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>
    <div class="pd-detail-info">
      <a class="pd-shop" href="#/company/${c.id}">
        <span class="mini-av lg" style="background:${c.color}">${esc(c.initial)}</span>
        <div><b>${esc(c.short)}</b><div class="tiny">${esc(c.city)} · ${esc(c.industry)} · 每周休${c.restDays}天</div></div>
        <span class="go">进店 →</span>
      </a>
      <h1 class="pd-detail-title">${esc(p.name)}</h1>
      <p class="pd-detail-desc">${esc(p.desc)}</p>
      <div class="pd-rate big">${starsHTML(p.rating)}<span class="tiny">${reviews.length}条评价 · 演示销量${p.sales}</span></div>
      <div class="pd-detail-price">
        <div><span class="cur">¥</span><b class="num">${p.price}</b><s>${fmtMoney(p.origPrice)}</s></div>
        <span class="promo">✅ 双休企业直营 · 支持七天无理由退换</span>
      </div>
      ${couponInfo.length ? `<div class="coupon-strip">${couponInfo.slice(0,2).map(cp => `<span class="coupon-tag">${esc(cp.title)}</span>`).join('')}</div>` : ''}

      <div class="price-chart">
        <div class="pc-head"><span>近30天价格走势</span><span class="pc-note">${maxP > minP ? `最低 ¥${minP.toFixed(0)} · 最高 ¥${maxP.toFixed(0)}` : '价格稳定'}</span></div>
        <svg viewBox="0 0 260 34" preserveAspectRatio="none" style="width:100%;height:38px">
          <path d="${sparkPath}" fill="none" stroke="#2E7D5B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <circle cx="260" cy="${(30 - (pricePoints[29] - minP) / (maxP - minP || 1) * 28).toFixed(1)}" r="3" fill="#E8792B"/>
        </svg>
      </div>

      <div class="buy-row">
        <div class="qty">
          <button data-qty="-1">−</button>
          <input id="qtyInput" type="number" value="1" min="1" max="99">
          <button data-qty="1">＋</button>
        </div>
        <button class="btn btn-line-cart" id="btnAddCart">❤ 收藏</button>
        <a class="btn btn-orange" id="btnBuyNow" href="#" target="_blank" rel="noopener" style="text-decoration:none">🛒 去京东购买</a>
      </div>
      <div class="extra-actions">
        <button class="mini-btn" id="btnCompare" data-pid="${pid}">${inCmp ? '✓ 已加入对比' : '⚖️ 加入对比'}</button>
        <button class="mini-btn" id="btnShare">🔗 分享商品</button>
      </div>
      <div class="service-tags">
        <span>ℹ️ 价格仅供参考</span><span>🔗 点击购买跳转京东</span><span>📦 实际库存与售后以京东为准</span>
      </div>
    </div>
  </section>

  <section class="panel">
    <h3><span class="q">📦</span>商品详情</h3>
    <div class="spec-grid">
      <div class="spec"><span>所属企业</span><b>${esc(c.short)}</b></div>
      <div class="spec"><span>主分类</span><b>${esc(p.cat)}</b></div>
      <div class="spec"><span>细分类</span><b>${esc(p.sub || '—')}</b></div>
      <div class="spec"><span>工时政策</span><b style="color:${POLICY_META[c.policy].color}">${esc(c.policyLabel)}</b></div>
      <div class="spec"><span>薪资水平</span><b>${esc(c.salary.level)}</b></div>
      <div class="spec"><span>每周休息</span><b>${c.restDays} 天</b></div>
    </div>
    <p class="muted" style="margin-top:12px;font-size:13.5px">本商品由「${esc(c.short)}」提供，${esc(c.summary)}</p>
  </section>

  <section class="panel">
    <h3><span class="q">💬</span>买家评价（${reviews.length}）</h3>
    <div class="review-form-wrap" style="margin-bottom:16px;padding:14px;background:#F5F9F6;border-radius:12px">
      <b style="font-size:14px">✍️ 写下你的评价</b>
      <div class="rf-stars" id="rfStarsP" style="margin:8px 0">
        <span data-r="1">★</span><span data-r="2">★</span><span data-r="3">★</span><span data-r="4">★</span><span data-r="5">★</span>
      </div>
      <textarea id="rfTextP" rows="2" placeholder="分享你对这个商品的看法…" style="width:100%;padding:10px;border:1.5px solid var(--line);border-radius:10px;font-size:14px;box-sizing:border-box"></textarea>
      <button class="btn btn-orange" id="btnSubmitReviewP" style="margin-top:8px">发表评价</button>
    </div>
    ${reviews.length ? `<div class="review-list">${reviews.map(r => `
        <div class="review-item">
          <div class="review-head">
            <span class="review-av" style="background:${r.color || '#2E7D5B'}">${r.initial || '我'}</span>
            <div class="review-user"><b>${esc(r.name || '匿名用户')}</b><span class="stars" style="font-size:11px">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div>
            <span class="review-date">${r.daysAgo === 0 ? '刚刚' : r.daysAgo + '天前'}</span>
          </div>
          <p class="review-text">${esc(r.text)}</p>
        </div>`).join('')}</div>` : '<div class="empty" style="padding:24px;text-align:center;color:#999">还没有评价，来写第一条吧</div>'}
  </section>

  ${related.length ? `<section class="panel"><h3><span class="q">🔗</span>同款店铺商品</h3><div class="pd-grid">${related.map(x => pdCardHTML(x, false)).join('')}</div></section>` : ''}
  `;
}

/* ---------- 页面：收藏 ---------- */
function pageCart() {
  const items = cartDetail();
  if (!items.length) {
    return `<h2 class="sec-title">我的收藏</h2>
    <div class="empty"><div class="emo">⭐</div>还没有收藏商品<br><span class="tiny">点击商品卡片上的爱心收藏</span>
    <div style="margin-top:18px"><a class="btn btn-orange" href="#/products">去逛商品</a></div></div>`;
  }
  const total = items.reduce((s, x) => s + x.prod.price * x.qty, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);
  // 满减进度：满199减30
  const progress = Math.min(total / 199, 1) * 100;
  const remain = Math.max(0, 199 - total);
  return `
  <h2 class="sec-title">我的收藏 <span class="tiny" style="font-weight:400">${count} 件商品</span></h2>
  <div class="note-box" style="background:#FFF0E0;border:1px solid #E8792B;color:#B35A1A;margin-bottom:14px"><b>ℹ️ 说明：</b>本平台仅展示商品信息与价格参考，点击购买将跳转至京东等外部平台，不在本站交易。</div>
  <div class="discount-progress">
    <div class="dp-info">${total >= 199 ? '🎉 已满足「满199减30」优惠！' : `再买 <b>¥${remain.toFixed(0)}</b> 即可减 ¥30`}</div>
    <div class="dp-bar"><div class="dp-fill" style="width:${progress}%"></div></div>
  </div>
  <div class="cart-list">
    ${items.map(x => `
      <div class="cart-item" data-pid="${x.prod.pid}">
        <img src="${x.prod.img}" alt="${esc(x.prod.name)}" loading="lazy" onclick="location.hash='#/product/${x.prod.pid}'">
        <div class="ci-info">
          <div class="ci-name">${esc(x.prod.name)}</div>
          <div class="tiny">${esc(x.prod.cname)} · ${esc(x.prod.cat)}${x.prod.sub ? ' · ' + esc(x.prod.sub) : ''}</div>
          <div class="ci-price"><b>${fmtMoney(x.prod.price)}</b><s>${fmtMoney(x.prod.origPrice)}</s></div>
        </div>
        <div class="ci-right">
          <div class="qty sm">
            <button data-cart-qty="-1" data-pid="${x.prod.pid}">−</button>
            <span>${x.qty}</span>
            <button data-cart-qty="1" data-pid="${x.prod.pid}">＋</button>
          </div>
          <button class="ci-del" data-cart-del="${x.prod.pid}">删除</button>
        </div>
      </div>`).join('')}
  </div>
  <div class="cart-bar">
    <div class="cart-total">合计：<b>${fmtMoney(total)}</b></div>
    <button class="btn btn-orange" id="btnCheckout">🛒 去京东购买全部 (${count})</button>
  </div>`;
}

/* ---------- 页面：结算 ---------- */
function pageCheckout() {
  const items = cartDetail();
  if (!items.length) return `<div class="empty"><div class="emo">🛒</div>收藏为空<div style="margin-top:14px"><a class="btn btn-green" href="#/products">去逛商品</a></div></div>`;
  const addr = (() => { try { return JSON.parse(localStorage.getItem('sxg_addr') || '{}'); } catch (e) { return {}; } })();
  const total = items.reduce((s, x) => s + x.prod.price * x.qty, 0);
  return `
  <a class="back-link" href="#/cart">← 返回收藏</a>
  <h2 class="sec-title">确认订单</h2>
  <div class="note-box" style="background:#FFF0E0;border:1px solid #E8792B;color:#B35A1A;margin-bottom:14px"><b>⚠️ 演示 Demo：</b>本页面仅为产品原型演示，不产生真实交易，不扣除任何费用。</div>
  <form id="checkoutForm" novalidate>
    <section class="panel">
      <h3><span class="q">📍</span>收货信息</h3>
      <div class="form-grid">
        <label class="field"><span>收货人 *</span><input name="name" required value="${esc(addr.name || '')}" placeholder="姓名"></label>
        <label class="field"><span>手机号 *</span><input name="phone" required value="${esc(addr.phone || '')}" placeholder="11位手机号" pattern="1[0-9]{10}"></label>
        <label class="field full"><span>所在地区 *</span><input name="region" required value="${esc(addr.region || '')}" placeholder="如：广东省 广州市 天河区"></label>
        <label class="field full"><span>详细地址 *</span><input name="detail" required value="${esc(addr.detail || '')}" placeholder="街道、门牌号、楼栋"></label>
      </div>
    </section>
    <section class="panel">
      <h3><span class="q">💳</span>支付方式</h3>
      <div class="pay-row">
        <label class="pay-opt"><input type="radio" name="pay" value="微信支付" checked><span>💚 微信支付</span></label>
        <label class="pay-opt"><input type="radio" name="pay" value="支付宝"><span>💙 支付宝</span></label>
        <label class="pay-opt"><input type="radio" name="pay" value="银行卡"><span>💳 银行卡</span></label>
      </div>
    </section>
    <section class="panel">
      <h3><span class="q">📦</span>商品清单</h3>
      <div class="checkout-items">
        ${items.map(x => `<div class="ci-line">
          <img src="${x.prod.img}" alt="">
          <div class="ci-info"><div class="ci-name">${esc(x.prod.name)}</div><div class="tiny">${esc(x.prod.cname)}</div></div>
          <div class="ci-right"><span>×${x.qty}</span><b>${fmtMoney(x.prod.price * x.qty)}</b></div>
        </div>`).join('')}
      </div>
    </section>
    <div class="cart-bar">
      <div class="cart-total">应付：<b>${fmtMoney(total)}</b></div>
      <button type="submit" class="btn btn-orange">提交订单</button>
    </div>
  </form>`;
}

/* ---------- 页面：我的订单 ---------- */
function pageOrders(params) {
  const tab = params.get('tab') || 'all';
  let os = getOrders();
  if (tab !== 'all') os = os.filter(o => o.status === tab);
  os.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const tabs = [['all','全部'],['pending_pay','待付款'],['pending_ship','待发货'],['shipped','待收货'],['received','待评价'],['done','已完成']];
  return `
  <h2 class="sec-title">我的订单 <span class="tiny" style="font-weight:400">支付 · 发货 · 收货 · 售后全流程</span></h2>
  <div class="filter-row" style="margin-bottom:16px">
    ${tabs.map(([k, l]) => `<button class="chip ${tab === k ? 'active' : ''}" data-ordertab="${k}">${l}</button>`).join('')}
  </div>
  ${os.length ? `<div class="order-list anim">${os.map(orderCardHTML).join('')}</div>`
    : `<div class="empty"><div class="emo">📦</div>暂无相关订单<div style="margin-top:18px"><a class="btn btn-orange" href="#/products">去逛商品</a></div></div>`}`;
}
function orderCardHTML(o) {
  const st = ORDER_STATUS[o.status] || o.status;
  const item = o.items[0] || {};
  return `
  <div class="order-card" data-goto="#/order/${o.id}">
    <div class="oc-head">
      <span class="tiny">订单号 ${o.id}</span>
      <span class="oc-status s-${o.status}">${st}</span>
    </div>
    <div class="oc-body">
      <img src="${item.img || 'img/products/shopping.jpg'}" alt="">
      <div class="oc-info">
        <div class="oc-name">${esc(item.name || '')}${o.items.length > 1 ? ` 等 ${o.items.length} 件` : ''}</div>
        <div class="tiny">${fmtTime(o.createdAt)}</div>
      </div>
      <div class="oc-amt"><b>${fmtMoney(o.total)}</b></div>
    </div>
  </div>`;
}

/* ---------- 页面：订单详情 ---------- */
function pageOrderDetail(id) {
  const o = getOrder(id);
  if (!o) return `<div class="empty"><div class="emo">😶</div>未找到订单 <div style="margin-top:14px"><a class="btn btn-green" href="#/orders">返回我的订单</a></div></div>`;
  const st = ORDER_STATUS[o.status] || o.status;
  const addr = o.address || {};
  let actions = '';
  if (o.status === 'pending_pay') actions = `<button class="btn btn-orange" id="btnPay">立即支付 ${fmtMoney(o.total)}</button>`;
  if (o.status === 'pending_ship') actions = `<button class="btn btn-green" id="btnShip">模拟发货（演示）</button><button class="btn btn-outline" data-orderaction="cancel">取消订单</button>`;
  if (o.status === 'shipped') actions = `<button class="btn btn-green" id="btnReceive">确认收货</button>`;
  if (o.status === 'received') actions = `
    <div class="review-form-wrap">
      <h4 style="margin-bottom:10px">✍️ 评价此订单</h4>
      <div class="rf-stars" id="rfStars">
        <span data-r="1">★</span><span data-r="2">★</span><span data-r="3">★</span><span data-r="4">★</span><span data-r="5">★</span>
      </div>
      <textarea id="rfText" rows="3" placeholder="分享你的购物体验…" style="width:100%;margin:10px 0;padding:10px;border:1.5px solid var(--line);border-radius:10px;font-size:14px"></textarea>
      <button class="btn btn-orange" id="btnSubmitReview">提交评价</button>
      <a class="btn btn-outline" href="#/aftersale/${o.id}">申请售后</a>
    </div>`;
  if (o.status === 'done') actions = `<a class="btn btn-outline" href="#/aftersale/${o.id}">申请售后</a>`;
  if (o.status === 'aftersale') actions = `<div class="note-box"><b>售后处理中：</b>${esc(o.aftersale.reply || '客服正在处理您的申请…')}</div>`;

  return `
  <a class="back-link" href="#/orders">← 返回我的订单</a>
  <section class="order-status-banner s-${o.status}">
    <div class="osb-st">${st}</div>
    <div class="tiny">${o.status === 'pending_pay' ? '请在 30 分钟内完成支付，订单将为您保留' : o.status === 'pending_ship' ? '仓库正在打包，预计 24 小时内发出' : o.status === 'shipped' ? '包裹已发出，请注意查收' : o.status === 'received' ? '期待您的评价，也可申请售后' : '感谢您的支持'}</div>
  </section>

  <section class="panel">
    <h3><span class="q">🚚</span>物流与进度</h3>
    ${o.status === 'shipped' || o.status === 'received' ? `
    <div class="logistics-map">
      <svg viewBox="0 0 400 120" style="width:100%;height:110px">
        <line x1="30" y1="80" x2="370" y2="80" stroke="#D8E6DD" stroke-width="3" stroke-dasharray="6,4"/>
        <circle cx="30" cy="80" r="7" fill="#2E7D5B"/>
        <text x="30" y="105" text-anchor="middle" font-size="11" fill="#555">广州仓</text>
        <circle cx="150" cy="80" r="7" fill="#2E7D5B"/>
        <text x="150" y="105" text-anchor="middle" font-size="11" fill="#555">转运中心</text>
        <circle cx="270" cy="80" r="7" fill="#E8792B"/>
        <text x="270" y="105" text-anchor="middle" font-size="11" fill="#555">运输中</text>
        <circle cx="370" cy="80" r="7" fill="#CCC"/>
        <text x="370" y="105" text-anchor="middle" font-size="11" fill="#555">目的地</text>
        <circle cx="${o.status === 'received' ? 370 : 270}" cy="80" r="10" fill="#E8792B" opacity="0.2">
          <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>` : ''}
    <div class="timeline">
      ${(o.timeline || []).map(t => `<div class="tl-item"><div class="tl-dot"></div><div class="tl-body"><div>${esc(t.text)}</div><div class="tl-time">${fmtTime(t.time)}</div></div></div>`).join('')}
    </div>
  </section>

  <section class="panel">
    <h3><span class="q">📍</span>收货信息</h3>
    <div class="addr-box"><b>${esc(addr.name)}</b> <span class="tiny">${esc(addr.phone)}</span><div class="tiny">${esc(addr.region)} ${esc(addr.detail)}</div></div>
  </section>

  <section class="panel">
    <h3><span class="q">📦</span>商品清单</h3>
    <div class="checkout-items">
      ${o.items.map(it => `<div class="ci-line" data-goto="#/product/${it.pid}">
        <img src="${it.img}" alt="">
        <div class="ci-info"><div class="ci-name">${esc(it.name)}</div><div class="tiny">${esc(it.cname)}</div></div>
        <div class="ci-right"><span>×${it.qty}</span><b>${fmtMoney(it.price * it.qty)}</b></div>
      </div>`).join('')}
    </div>
    <div class="oc-sum">
      <span>支付方式</span><b>${esc(o.payment)}</b>
      <span>商品总额</span><b>${fmtMoney(o.subtotal || o.total)}</b>
      ${o.coupon && o.off ? `<span>优惠券（${esc(o.coupon.title)}）</span><b style="color:var(--red)">-${fmtMoney(o.off)}</b>` : ''}
      <span>运费</span><b style="color:var(--green)">包邮</b>
      <span>实付金额</span><b style="color:var(--red)">${fmtMoney(o.total)}</b>
    </div>
  </section>

  ${actions ? `<div class="order-actions">${actions}</div>` : ''}
  <div class="form-msg" id="payMsg"></div>`;
}

/* ---------- 页面：售后申请 ---------- */
function pageAftersale(id) {
  const o = getOrder(id);
  if (!o) return `<div class="empty"><div class="emo">😶</div>未找到订单</div>`;
  if (o.aftersale) return `<a class="back-link" href="#/order/${o.id}">← 返回订单</a>
    <section class="panel"><h3>售后申请</h3>
    <div class="note-box"><b>原因：</b>${esc(o.aftersale.reason)}<br><b>说明：</b>${esc(o.aftersale.note || '—')}<br><b>处理结果：</b>${esc(o.aftersale.reply || '客服处理中…')}</div>
    <a class="btn btn-green" href="#/order/${o.id}">返回订单</a></section>`;
  return `
  <a class="back-link" href="#/order/${o.id}">← 返回订单</a>
  <h2 class="sec-title">申请售后</h2>
  <section class="panel">
    <form id="aftersaleForm" novalidate>
      <p class="muted" style="margin-bottom:12px">订单 ${o.id} · ${o.items.length} 件商品 · 双休购支持七天无理由退换。</p>
      <label class="field full"><span>售后类型 *</span>
        <select name="type" required>
          <option value="退货退款">退货退款</option>
          <option value="换货">换货</option>
          <option value="仅退款">仅退款</option>
          <option value="维修">维修</option>
        </select>
      </label>
      <label class="field full"><span>申请原因 *</span>
        <select name="reason" required>
          <option>商品质量问题</option><option>尺寸/规格不符</option><option>七天无理由退货</option>
          <option>商品破损/错发</option><option>不想要了</option><option>其他</option>
        </select>
      </label>
      <label class="field full"><span>问题描述</span><textarea name="note" rows="3" maxlength="200" placeholder="请描述遇到的问题（选填）"></textarea></label>
      <div class="form-msg" id="asMsg"></div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button type="submit" class="btn btn-orange">提交申请</button>
        <a class="btn btn-outline" href="#/order/${o.id}">取消</a>
      </div>
    </form>
  </section>`;
}

/* ---------- 页面：产品库 ---------- */
function pageProducts(params) {
  const cat = params.get('cat') || '全部';
  const sub = params.get('sub') || '全部';
  const q = (params.get('q') || '').trim().toLowerCase();
  const sort = params.get('sort') || 'default';
  let list = getAllProducts();

  if (cat !== '全部') list = list.filter(p => p.cat === cat);
  if (sub !== '全部') list = list.filter(p => p.sub === sub);
  if (q) { const qs = q.toLowerCase().split(/\s+/).filter(Boolean); list = list.filter(p => { const s = (p.name + ' ' + p.desc + ' ' + p.cname + ' ' + p.cat + ' ' + (p.sub || '')).toLowerCase(); return qs.every(k => s.includes(k)); }); }
  if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'sales') list.sort((a, b) => b.sales - a.sales);

  const usedCats = PRODUCT_CATS.filter(c2 => c2 === '全部' || list.some(p => p.cat === c2) || getAllProducts().some(p => p.cat === c2));
  const subList = cat !== '全部' && SUBCATS[cat] ? ['全部', ...SUBCATS[cat]] : [];

  return `
  <h2 class="sec-title">商品库 <span class="tiny" style="font-weight:400">双休企业商品展示 · 价格参考 · 点击购买跳转外部平台</span></h2>
  <div class="hot-search">
    <span class="hs-label">🔥 热搜：</span>
    ${HOT_SEARCH.map(h => `<a href="#/products?q=${encodeURIComponent(h)}">${h}</a>`).join('')}
  </div>
  <div class="filter-row">
    ${usedCats.map(c2 => `<button class="chip ${cat === c2 ? 'active' : ''}" data-catchip="${c2}">${c2}</button>`).join('')}
  </div>
  ${subList.length ? `<div class="filter-row sub-row">${subList.map(s2 => `<button class="chip sm ${sub === s2 ? 'active' : ''}" data-subchip="${s2}">${s2}</button>`).join('')}</div>` : ''}
  <div class="filter-row" style="justify-content:flex-end">
    <select class="sort-sel" id="prodSort">
      <option value="default" ${sort==='default'?'selected':''}>综合推荐</option>
      <option value="sales" ${sort==='sales'?'selected':''}>销量优先</option>
      <option value="priceAsc" ${sort==='priceAsc'?'selected':''}>价格从低到高</option>
      <option value="priceDesc" ${sort==='priceDesc'?'selected':''}>价格从高到低</option>
    </select>
  </div>
  <div style="height:8px"></div>
  ${q ? `<p class="muted" style="margin-bottom:14px;font-size:13.5px">「${esc(q)}」的结果：${list.length} 个商品</p>` : ''}
  ${list.length ? `<div class="pd-grid anim">${list.map(p => pdCardHTML(p)).join('')}</div>`
    : `<div class="empty"><div class="emo">🛒</div>没有找到匹配的商品</div>`}`;
}

/* ---------- 页面：榜单 ---------- */
function pageRank() {
  const ranked = [...ALL_GOOD()].sort((a, b) => b.restDays - a.restDays || a.short.localeCompare(b.short, 'zh'));
  return `
  <h2 class="sec-title">每周休息天数总榜 <span class="tiny" style="font-weight:400">休息越多排越前</span></h2>
  <div class="rank-list anim">${ranked.map(rankItemHTML).join('')}</div>
  <div class="panel" style="margin-top:22px">
    <h3><span class="q">🌍</span>海外四天工作制试验</h3>
    ${GLOBAL_FACTS.map(g => `<div class="law-item"><h4>${esc(g.title)}</h4><p>${esc(g.text)}</p></div>`).join('')}
  </div>`;
}

/* ---------- 页面：劳动权益 ---------- */
function pageBlacklist(params) {
  const f = params.get('sev') || 'all';
  let list = [...ALL_BAD()];
  if (f !== 'all') list = list.filter(b => b.severity === f);
  return `
  <h2 class="sec-title bad-title">劳动权益 · 劳动争议记录 <span class="tiny" style="font-weight:400">仅收录已生效司法判决或行政处罚决定</span></h2>
  <div class="bad-hero">
    <b>以下企业的劳动争议记录均有已生效法律文书或行政监管决定。</b>
    <p>数据来源包括劳动仲裁裁决书、法院判决、国家赔偿决定、公安机关通报、国务院安委会督办、人社部约谈等公开法律文书。所列信息仅供求职者了解企业用工环境时参考，不构成对任何企业的商业评价。</p>
  </div>
  <div class="filter-row" style="margin-bottom:16px">
    <button class="chip ${f === 'all' ? 'active' : ''}" data-sevchip="all">全部（${ALL_BAD().length}）</button>
    <button class="chip ${f === 'high' ? 'active' : ''}" data-sevchip="high">已生效法律文书（${ALL_BAD().filter(b => b.severity === 'high').length}）</button>
    <button class="chip ${f === 'mid' ? 'active' : ''}" data-sevchip="mid">行政监管记录（${ALL_BAD().filter(b => b.severity === 'mid').length}）</button>
  </div>
  <div class="bad-list anim">${list.map(badCardHTML).join('')}</div>`;
}

/* ---------- 页面：反面案例详情 ---------- */
function pageBadDetail(id) {
  const b = badById(id);
  if (!b) return `<div class="empty"><div class="emo">😶</div>未找到案例 <div style="margin-top:14px"><a class="btn btn-green" href="#/blacklist">返回劳动权益</a></div></div>`;
  return `
  <a class="back-link" href="#/blacklist">← 返回劳动权益</a>
  <section class="detail-hero bad-detail">
    <div class="bad-top" style="margin-bottom:12px">
      <span class="bad-issue">${esc(b.issue)}</span>
      ${b.severity === 'high' ? '<span class="sev high">已生效法律文书</span>' : '<span class="sev mid">行政监管记录</span>'}
      <span class="bad-status ${b.status}">${BAD_STATUS[b.status]}</span>
      <span class="bad-year">${esc(b.year)}</span>
    </div>
    <h1 class="detail-title">${esc(b.short)}</h1>
    <div class="detail-sub">${esc(b.name)} · ${esc(b.industry)} · ${esc(b.city)}</div>
  </section>

  <section class="panel">
    <h3><span class="q">📋</span>事件经过</h3>
    <p style="font-size:14.5px;line-height:1.9">${esc(b.summary)}</p>
    <div class="evidence" style="margin-top:14px"><b>📰 信息来源：</b>${esc(b.evidence)}</div>
  </section>

  <section class="panel">
    <h3><span class="q">💰</span>薪资与待遇问题</h3>
    <p style="font-size:14px;line-height:1.8;color:#7A2E1D">${esc(b.salaryNote)}</p>
  </section>

  <section class="panel">
    <h3><span class="q">🚫</span>相关商品（${b.products.length}）</h3>
    <div class="ref-list">
      ${b.products.map(bp2 => `
        <div class="ref-item">
          <div class="by-main">
            <div class="by-name">🚫 ${esc(bp2.name)}</div>
            <div class="by-desc">${esc(bp2.desc)} · <span class="tiny">${esc(bp2.cat)}${bp2.sub ? ' / ' + esc(bp2.sub) : ''}</span></div>
            ${bp2.alt ? `<div class="by-alt">✅ 替代建议：${esc(bp2.alt)}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>
    <div class="note-box" style="margin-top:14px"><b>💡 说明：</b>以上信息基于公开法律文书整理，如企业已整改或文书内容有更新，欢迎反馈。</div>
    <div style="margin-top:16px"><a class="btn btn-green" href="#/companies">去看看值得支持的双休企业 →</a></div>
  </section>`;
}

/* ---------- 页面：收藏 ---------- */
function pageFavorites() {
  const favs = store.favs.map(byId).filter(Boolean);
  return `
  <h2 class="sec-title">我的收藏 <span class="tiny" style="font-weight:400">保存在本机浏览器</span></h2>
  ${favs.length ? `<div class="co-grid anim">${favs.map(coCardHTML).join('')}</div>
    <p class="tiny" style="margin-top:16px">共收藏 ${favs.length} 家「良心工时」企业。</p>`
  : `<div class="empty"><div class="emo">💚</div>还没有收藏任何企业<br><span class="tiny">点击卡片上的小心心即可收藏</span><div style="margin-top:18px"><a class="btn btn-green" href="#/companies">去逛企业榜</a></div></div>`}`;
}

/* ---------- 页面：企业入驻 ---------- */
function pageJoin() {
  const catOptions = PRODUCT_CATS.filter(c => c !== '全部').map(c => `<option value="${c}">${c}</option>`).join('');
  const policyOptions = Object.entries(POLICY_META).map(([k, v]) => `<option value="${k}">${v.label} — ${v.desc}</option>`).join('');
  return `
  <a class="back-link" href="#/companies">← 返回企业榜</a>
  <h2 class="sec-title">企业入驻上架 <span class="tiny" style="font-weight:400">符合规定即可展示企业与商品</span></h2>
  <section class="panel">
    <h3><span class="q">📜</span>上架规定</h3>
    <div class="law-item"><h4>① 工时政策必须真实</h4><p>须实行「上四休三 / 四天半 / 标准双休 / 双休+灵活办公」之一，并提供可查证来源。</p></div>
    <div class="law-item"><h4>② 薪资不得因休息增加而降低</h4><p>「休息多了、工资少了」的成本转嫁型制度不予上架。</p></div>
    <div class="law-item"><h4>③ 商品须完成细分类</h4><p>至少 1 个商品（任何品类），并选择主分类与细分类。</p></div>
    <div class="law-item"><h4>④ 提交后标记「自荐待核实」</h4><p>信息保存本机并公开展示待核实标识，经独立核实后转正。</p></div>
  </section>
  <section class="panel">
    <h3><span class="q">📝</span>填写企业信息</h3>
    <form id="joinForm" novalidate>
      <div class="form-grid">
        <label class="field"><span>企业全称 *</span><input name="name" required maxlength="50" placeholder="如：杭州某某科技有限公司"></label>
        <label class="field"><span>企业简称 *</span><input name="short" required maxlength="12" placeholder="如：某某科技"></label>
        <label class="field"><span>所在城市 *</span><input name="city" required maxlength="20" placeholder="如：杭州"></label>
        <label class="field"><span>所属行业 *</span><input name="industry" required maxlength="20" placeholder="如：文化创意"></label>
        <label class="field"><span>工时政策类型 *</span><select name="policy" required><option value="">请选择…</option>${policyOptions}</select></label>
        <label class="field"><span>政策实施时间 *</span><input name="since" required maxlength="12" placeholder="如：2025-03"></label>
        <label class="field full"><span>政策说明 *（一周作息）</span><textarea name="patternNote" required rows="2" maxlength="120" placeholder="如：周一至周四上班，周五至周日休息"></textarea></label>
        <label class="field full"><span>企业简介 *</span><textarea name="summary" required rows="2" maxlength="160" placeholder="一句话说清公司与工时亮点"></textarea></label>
        <label class="field full"><span>可查证的信息来源 *</span><textarea name="evidence" required rows="2" minlength="10" maxlength="200" placeholder="公告/媒体/招聘页，含名称与日期"></textarea></label>
        <label class="field"><span>薪资水平</span><select name="salaryLevel"><option>行业平均</option><option>行业中上</option><option>领先水平</option><option>未公开</option></select></label>
        <label class="field"><span>薪资说明（选填）</span><input name="salaryNote" maxlength="60" placeholder="如：薪资不变，另有年终奖"></label>
        <label class="field"><span>官网域名（选填）</span><input name="domain" maxlength="40" placeholder="如：example.com"></label>
        <label class="field"><span>官方招聘页（选填）</span><input name="careers" maxlength="120" placeholder="https://…"></label>
        <label class="field full check-field">
          <input type="checkbox" name="salaryKept" id="salaryKeptChk">
          <span>我承诺：本企业实行上述休息制度后<b>薪资不打折</b>（硬性规定）</span>
        </label>
      </div>
      <h4 style="margin:20px 0 10px;font-size:15px">上架商品（至少 1 个，最多 5 个）*</h4>
      <div id="prodRows"></div>
      <button type="button" class="btn btn-outline btn-sm" id="addProdBtn" style="margin-top:6px">+ 添加一个商品</button>
      <div class="form-msg" id="formMsg"></div>
      <div style="margin-top:18px;display:flex;gap:10px">
        <button type="submit" class="btn btn-orange">提交上架</button>
        <a class="btn btn-outline" href="#/companies">取消</a>
      </div>
    </form>
  </section>`;
}

function prodRowHTML(i, catOptions) {
  return `
  <div class="prod-row" data-row="${i}">
    <div class="prod-row-head"><b>商品 ${i + 1}</b><button type="button" class="prod-del" data-delrow="${i}" title="删除">✕</button></div>
    <div class="form-grid">
      <label class="field"><span>商品名称 *</span><input name="p_name_${i}" required maxlength="30" placeholder="如：手工挂耳咖啡"></label>
      <label class="field"><span>主分类 *</span><select name="p_cat_${i}" required data-catsel="${i}"><option value="">请选择…</option>${catOptions}</select></label>
      <label class="field"><span>细分类 *</span><select name="p_sub_${i}" required data-subsel="${i}"><option value="">先选主分类…</option></select></label>
      <label class="field"><span>一句话介绍 *</span><input name="p_desc_${i}" required maxlength="50" placeholder="卖点/用途"></label>
    </div>
  </div>`;
}

function setupJoinForm() {
  const form = $('#joinForm');
  if (!form) return;
  const rowsEl = $('#prodRows');
  const catOptions = PRODUCT_CATS.filter(c => c !== '全部').map(c => `<option value="${c}">${c}</option>`).join('');
  let rowCount = 0;
  const addRow = () => {
    if (rowCount >= 5) { toast('最多上架 5 个商品'); return; }
    rowsEl.insertAdjacentHTML('beforeend', prodRowHTML(rowCount, catOptions));
    rowCount++;
  };
  addRow();
  $('#addProdBtn').addEventListener('click', addRow);
  rowsEl.addEventListener('click', e => {
    const del = e.target.closest('[data-delrow]');
    if (!del) return;
    if ($$('.prod-row', rowsEl).length <= 1) { toast('至少保留 1 个商品'); return; }
    del.closest('.prod-row').remove();
  });
  rowsEl.addEventListener('change', e => {
    const sel = e.target.closest('[data-catsel]');
    if (!sel) return;
    const i = sel.dataset.catsel;
    const subSel = rowsEl.querySelector(`[data-subsel="${i}"]`);
    const subs = SUBCATS[sel.value] || [];
    subSel.innerHTML = '<option value="">请选择…</option>' + subs.map(s => `<option value="${s}">${s}</option>`).join('');
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const msg = $('#formMsg');
    const fail = t => { msg.className = 'form-msg err'; msg.textContent = '❌ ' + t; msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    const name = (fd.get('name') || '').trim(), short = (fd.get('short') || '').trim();
    const city = (fd.get('city') || '').trim(), industry = (fd.get('industry') || '').trim();
    const policy = fd.get('policy'), since = (fd.get('since') || '').trim();
    const patternNote = (fd.get('patternNote') || '').trim(), summary = (fd.get('summary') || '').trim();
    const evidence = (fd.get('evidence') || '').trim();
    if (!name || !short || !city || !industry) return fail('请完整填写企业全称、简称、城市与行业。');
    if (!POLICY_META[policy]) return fail('规定①未通过：工时政策类型必须属于四类之一。');
    if (!since || !patternNote || !summary) return fail('请填写实施时间、作息说明与企业简介。');
    if (evidence.length < 10) return fail('规定①未通过：必须提供可查证的信息来源。');
    if (!fd.get('salaryKept')) return fail('规定②未通过：薪资打折的企业不予上架。');
    const products = [];
    for (let i = 0; i < 6; i++) {
      const pn = fd.get('p_name_' + i);
      if (pn === null) continue;
      const pc = fd.get('p_cat_' + i), ps = fd.get('p_sub_' + i), pd = (fd.get('p_desc_' + i) || '').trim();
      if (!pn.trim() || !pc || !ps || !pd) return fail(`规定③未通过：商品 ${i + 1} 的名称、分类与介绍均为必填。`);
      products.push({ name: pn.trim(), cat: pc, sub: ps, desc: pd });
    }
    if (!products.length) return fail('规定③未通过：至少上架 1 个商品。');
    const domain = (fd.get('domain') || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const careers = (fd.get('careers') || '').trim();
    const co = {
      id: 'custom-' + Date.now(), custom: true,
      name, short, initial: short[0], color: '#7A6FF0',
      industry, city, policy, policyLabel: POLICY_META[policy].label,
      restDays: REST_BY_POLICY[policy], salaryKept: true, since,
      status: 'pending', pattern: PATTERN_BY_POLICY[policy], patternNote,
      summary, evidence,
      salary: { level: fd.get('salaryLevel') || '未公开', benefits: ['企业自荐提交'], note: (fd.get('salaryNote') || '').trim() || '企业自荐提交，待核实。' },
      products
    };
    if (domain) co.domain = domain;
    if (careers && /^https?:\/\//.test(careers)) co.careers = careers;
    const list = getCustom(); list.push(co); saveCustom(list);
    msg.className = 'form-msg ok';
    msg.textContent = '✅ 上架成功！企业已标记「自荐待核实」。';
    toast('上架成功：' + short);
    setTimeout(() => { location.hash = '#/company/' + co.id; }, 900);
  });
}

/* ---------- 页面：关于 ---------- */
function pageAbout() {
  const srcList = [...new Set(ALL_GOOD().map(c => c.evidence))];
  return `
  <h2 class="sec-title">关于双休购</h2>
  <section class="panel">
    <h3><span class="q">💡</span>为什么做这个应用</h3>
    <p style="font-size:14.5px;line-height:2">
      灵感来自博主「C位满分姐」的视频<b>《实现的双休不是等来的而是争取来的》</b>：双休是法律赋予打工人的权利，但仍有企业通过「大小周」「隐形加班」侵占休息时间。
      「双休购」把这件事变得可执行：哪些企业真的双休、有什么商品可以买、哪些企业有劳动争议记录，一查便知；像逛京东淘宝一样浏览双休企业的商品展示（演示）。
    </p>
  </section>
  <section class="panel">
    <h3><span class="q">⚖️</span>双休的法律依据</h3>
    ${LEGAL_FACTS.map(l => `<div class="law-item"><h4>${esc(l.title)}</h4><p>${esc(l.text)}</p></div>`).join('')}
  </section>
  <section class="panel">
    <h3><span class="q">✅</span>收录与核实标准</h3>
    <div class="law-item"><h4>核实等级</h4><p>「已核实」多源且企业确认；「媒体报道」权威媒体；「部分岗位」仅部分部门；「社区口碑」外企/成熟企业普遍双休；「自荐待核实」企业自主提交。</p></div>
    <div class="law-item"><h4>电商说明</h4><p>本应用的购物流程为演示环境，订单、支付与售后均保存在本机浏览器，不发生真实交易；商品信息用于展示与消费决策参考。</p></div>
    <div class="law-item"><h4>免责说明</h4><p>企业政策可能调整，产品与招聘信息以官方为准。本站仅供参考，不构成法律建议。<a href='#/privacy'>查看隐私政策</a>。</p></div>
  </section>
  <section class="panel">
    <h3><span class="q">📰</span>信息来源清单（${srcList.length} 条）</h3>
    ${srcList.map(s => `<div class="src-item">${esc(s)}</div>`).join('')}
  </section>`;
}

/* ---------- 路由 ---------- */
/* ---------- 页面：商品对比 ---------- */
function pageCompare() {
  const ids = getCompareList();
  const items = ids.map(pid => getProductByPid(pid)).filter(Boolean);
  if (!items.length) {
    return `<h2 class="sec-title">商品对比</h2>
    <div class="empty"><div class="emo">⚖️</div>还没有选择对比的商品<br><span class="tiny">在商品详情页点「加入对比」，最多选 4 个</span>
    <div style="margin-top:18px"><a class="btn btn-green" href="#/products">去选商品</a></div></div>`;
  }
  const rows = [
    ['价格', p => `<b style="color:var(--red)">${fmtMoney(p.price)}</b><s class="tiny">${fmtMoney(p.origPrice)}</s>`],
    ['评分', p => `${p.rating} ★`],
    ['月销', p => `${p.sales}`],
    ['评价数', p => `${p.reviews}`],
    ['所属企业', p => esc(p.cname)],
    ['分类', p => esc(p.cat) + (p.sub ? ' · ' + esc(p.sub) : '')],
    ['企业政策', p => esc(p.company.policyLabel)],
    ['每周休息', p => `${p.company.restDays} 天`],
    ['薪资水平', p => esc(p.company.salary.level)],
  ];
  return `
  <h2 class="sec-title">商品对比 <span class="tiny" style="font-weight:400">${items.length} 个商品</span></h2>
  <div class="compare-wrap">
    <div class="compare-grid" style="grid-template-columns: 120px repeat(${items.length}, 1fr)">
      <div class="compare-cell head">对比项</div>
      ${items.map(p => `<div class="compare-cell head prod-cell">
        <img src="${p.img}" alt="" loading="lazy" onclick="location.hash='#/product/${p.pid}'">
        <div class="cmp-name">${esc(p.name)}</div>
      </div>`).join('')}
      ${rows.map(([label, fn]) => `
        <div class="compare-cell label">${label}</div>
        ${items.map(p => `<div class="compare-cell">${fn(p)}</div>`).join('')}
      `).join('')}
    </div>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-line-cart" id="btnClearCompare">清空对比</button>
      <a class="btn btn-green" href="#/products">继续挑选</a>
    </div>
  </div>`;
}

/* ---------- 页面：优惠券中心 ---------- */
function pageCoupons() {
  return `
  <h2 class="sec-title">优惠券中心 <span class="tiny" style="font-weight:400">领券后下单自动抵扣</span></h2>
  <div class="coupon-center">
    ${COUPONS.map((cp, i) => `
      <div class="coupon-card">
        <div class="cc-left">
          <div class="cc-amount">${cp.type === 'threshold' ? `¥${cp.amount}` : `${cp.amount}%`}</div>
          <div class="cc-thresh">满${cp.threshold || 0}可用</div>
        </div>
        <div class="cc-right">
          <div class="cc-title">${esc(cp.title)}</div>
          <div class="cc-scope">适用：${esc(cp.cat)} · ${esc(cp.desc || '')}</div>
          <button class="btn btn-orange sm" data-coupon-claim="${i}">领取</button>
        </div>
      </div>`).join('')}
  </div>
  <div class="panel" style="margin-top:20px">
    <h3><span class="q">💡</span>领券规则</h3>
    <p class="muted" style="font-size:13.5px;line-height:1.8">· 每个用户每种券限领一张，下单时自动选择最优券<br>· 新人首单额外送 50 积分<br>· 积分可在下次下单时抵扣，100 积分 = 1 元</p>
  </div>`;
}

/* ---------- 页面：消息通知 ---------- */
function pageNotifications() {
  const notifs = [
    { icon: '🎉', title: '欢迎来到双休购', text: '首次访问送 50 积分，下单可抵扣', time: '刚刚', unread: true },
    { icon: '📦', title: '订单发货提醒', text: '你的订单已发出，物流正在更新中', time: '2小时前', unread: true },
    { icon: '🎫', title: '优惠券到账', text: '你领取的「满199减30」已放入账户', time: '昨天', unread: true },
    { icon: '💼', title: '新岗位上线', text: '双休企业新增了 12 个在招岗位', time: '3天前', unread: false },
  ];
  return `
  <h2 class="sec-title">消息通知</h2>
  <div class="notif-list">
    ${notifs.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        <div class="notif-icon">${n.icon}</div>
        <div class="notif-body">
          <b>${esc(n.title)}</b>
          <p>${esc(n.text)}</p>
          <span class="notif-time">${esc(n.time)}</span>
        </div>
        ${n.unread ? '<span class="notif-dot"></span>' : ''}
      </div>`).join('')}
  </div>`;
}

/* ---------- 页面：隐私政策 ---------- */
function pagePrivacy() {
  return `
  <a class="back-link" href="#/about">← 返回关于</a>
  <h2 class="sec-title">隐私政策</h2>
  <section class="panel">
    <h3><span class="q">🔒</span>数据存储</h3>
    <p style="font-size:14px;line-height:1.9">本应用为纯前端演示项目，<b>所有数据仅存储在您浏览器的 localStorage 中</b>，不会上传到任何服务器，也不会与任何第三方共享。</p>
    <ul style="font-size:14px;line-height:1.9;padding-left:20px">
      <li>收藏、订单、地址、收藏等数据仅保存在您的本机浏览器</li>
      <li>清除浏览器缓存或使用无痕模式将删除上述数据</li>
      <li>我们不收集任何个人身份信息（姓名、手机号、地址等仅用于前端演示，不上传）</li>
      <li>不使用 Cookie 追踪、不嵌入第三方分析统计、不展示广告</li>
    </ul>
  </section>
  <section class="panel">
    <h3><span class="q">📋</span>数据来源</h3>
    <p style="font-size:14px;line-height:1.9">企业信息与劳动争议记录均来自公开渠道：企业官方公告、劳动仲裁裁决书、法院判决、国家赔偿决定、公安机关通报、国务院安委会督办、人社部约谈等。本应用仅做信息整理与展示，不代表对任何企业的评价或判断。</p>
  </section>
  <section class="panel">
    <h3><span class="q">🎬</span>演示性质</h3>
    <p style="font-size:14px;line-height:1.9">本应用中的电商流程（商品浏览、加收藏、下单、支付、物流、售后）均为<b>界面原型演示</b>，不涉及真实交易、不扣款、不发货。所有价格、库存、物流状态均为模拟数据。</p>
  </section>
  <section class="panel">
    <h3><span class="q">📮</span>联系我们</h3>
    <p style="font-size:14px;line-height:1.9">如对数据准确性有疑问，或希望更正/移除某条记录，请通过 GitHub Issue 反馈：<br>https://github.com/ENDcodeworld/shuangxiugou</p>
  </section>`;
}

const routes = {
  '': pageHome, 'companies': pageCompanies, 'company': pageCompanyDetail,
  'product': pageProductDetail, 'products': pageProducts, 'cart': pageCart,
  'checkout': pageCheckout, 'orders': pageOrders, 'order': pageOrderDetail,
  'aftersale': pageAftersale, 'rank': pageRank, 'blacklist': pageBlacklist,
  'badcase': pageBadDetail, 'favorites': pageFavorites, 'join': pageJoin, 'about': pageAbout, 'compare': pageCompare, 'coupons': pageCoupons, 'notifications': pageNotifications, 'privacy': pagePrivacy
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const segs = pathPart.split('/').filter(Boolean);
  return { page: segs[0] || '', arg: segs[1] ? decodeURIComponent(segs[1]) : null, params: new URLSearchParams(queryPart || '') };
}

function render() {
  const { page, arg, params } = parseHash();
  const fn = routes[page] || pageHome;
  const main = $('#main');
  main.innerHTML = fn((page === 'company' || page === 'badcase' || page === 'product' || page === 'order' || page === 'aftersale') ? arg : params);
  bindPageEvents(page, params);
  syncNav(page);
  syncSearchInput(params);
  syncCartUI();
  window.scrollTo(0, 0);
  // 数字滚动动画
  $$('.count-up').forEach(el => {
    const target = parseInt(el.dataset.count || '0');
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const dur = 1200, start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function syncNav(page) {
  const map = { company: 'companies', badcase: 'blacklist', product: 'products', join: 'companies', cart: 'cart', checkout: 'cart', order: 'orders', aftersale: 'orders' };
  const key = map[page] || page || 'home';
  $$('.nav-pc a, .tab-item').forEach(a => a.classList.toggle('active', a.dataset.nav === key));
}
function syncSearchInput(params) {
  const inp = $('#globalSearch');
  if (inp && inp.value !== (params.get('q') || '')) inp.value = params.get('q') || '';
}
function syncCartUI() {
  const n = cartCount();
  const el = $('#cartCnt');
  if (el) { el.textContent = n; el.classList.toggle('on', n > 0); }
}

/* ---------- 事件绑定 ---------- */
let mainDelegated = false;
function bindPageEvents(page, params) {
  if (!mainDelegated) {
    mainDelegated = true;
    $('#main').addEventListener('click', e => {
      const favBtn = e.target.closest('[data-fav]');
      if (favBtn) { e.stopPropagation(); toggleFav(favBtn.dataset.fav, favBtn.dataset.name); render(); return; }

      // 加入收藏（卡片上）
      const addBtn = e.target.closest('[data-addcart]');
      if (addBtn) { e.stopPropagation(); addToCart(addBtn.dataset.addcart, 1); toast('已收藏'); return; }

      const chip = e.target.closest('[data-chip]');
      if (chip) { const cur = parseHash().params; cur.set('p', chip.dataset.chip); goto('companies', cur); return; }
      const catChip = e.target.closest('[data-catchip]');
      if (catChip) { const cur = parseHash().params; cur.set('cat', catChip.dataset.catchip); cur.delete('sub'); goto('products', cur); return; }
      const subChip = e.target.closest('[data-subchip]');
      if (subChip) { const cur = parseHash().params; cur.set('sub', subChip.dataset.subchip); goto('products', cur); return; }
      const sevChip = e.target.closest('[data-sevchip]');
      if (sevChip) { const cur = parseHash().params; cur.set('sev', sevChip.dataset.sevchip); goto('blacklist', cur); return; }
      const orderTab = e.target.closest('[data-ordertab]');
      if (orderTab) { const cur = parseHash().params; cur.set('tab', orderTab.dataset.ordertab); goto('orders', cur); return; }

      // 收藏数量
      const cqty = e.target.closest('[data-cart-qty]');
      if (cqty) { const pid = cqty.dataset.pid; const cur = getCart().find(x => x.pid === pid); setCartQty(pid, (cur ? cur.qty : 0) + parseInt(cqty.dataset.cartQty)); render(); return; }
      const cdel = e.target.closest('[data-cart-del]');
      if (cdel) { setCartQty(cdel.dataset.cartDel, 0); toast('已删除'); render(); return; }

      const delBtn = e.target.closest('#delCustom');
      if (delBtn) {
        const { arg } = parseHash();
        if (confirm('确定删除这条自荐企业吗？（仅删除本机数据）')) {
          saveCustom(getCustom().filter(c => c.id !== arg));
          toast('已删除'); location.hash = '#/companies';
        }
        return;
      }
      const gotoEl = e.target.closest('[data-goto]');
      if (gotoEl) location.hash = gotoEl.dataset.goto;
    });
  }

  const sortSel = $('#sortSel');
  if (sortSel) sortSel.addEventListener('change', () => { const cur = parseHash().params; cur.set('s', sortSel.value); goto('companies', cur); });
  const prodSort = $('#prodSort');
  if (prodSort) prodSort.addEventListener('change', () => { const cur = parseHash().params; cur.set('sort', prodSort.value); goto('products', cur); });

  /* 商品详情：数量 + 加购 + 立即购买 */
  const qtyInput = $('#qtyInput');
  if (qtyInput) {
    $$('[data-qty]').forEach(b => b.addEventListener('click', () => {
      const v = Math.max(1, Math.min(99, (parseInt(qtyInput.value) || 1) + parseInt(b.dataset.qty)));
      qtyInput.value = v;
    }));
    const pid = parseHash().arg;
    $('#btnAddCart').addEventListener('click', () => { addToCart(pid, 1); toast('已收藏，可在收藏查看'); });
    const buyBtn = $('#btnBuyNow');
    const prod = getProductByPid(pid);
    if (buyBtn && prod && prod.buyUrl) buyBtn.href = prod.buyUrl;
    const favBtn = $('#btnFavProduct');
    if (favBtn) favBtn.addEventListener('click', () => {
      toggleFavProduct(pid);
      const on = isFavProduct(pid);
      favBtn.classList.toggle('on', on);
      favBtn.querySelector('svg').setAttribute('fill', on ? '#E8792B' : 'none');
      toast(on ? '已收藏该商品' : '已取消收藏');
    });

    // 图片轮播切换
    $$('.gthumb').forEach(t => t.addEventListener('click', () => {
      $$('.gthumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const main = $('#galleryMain');
      if (main) { main.style.filter = t.dataset.filter || ''; main.src = t.src; }
    }));

    // 加入对比
    const btnCmp = $('#btnCompare');
    if (btnCmp) btnCmp.addEventListener('click', () => {
      toggleCompare(pid);
      const on = isInCompare(pid);
      btnCmp.textContent = on ? '✓ 已加入对比' : '⚖️ 加入对比';
      toast(on ? '已加入对比，最多选4个' : '已移出对比');
    });

    // 分享商品（复制链接+文案）
    const btnShare = $('#btnShare');
    if (btnShare) btnShare.addEventListener('click', () => {
      const url = location.origin + location.pathname + '#/product/' + pid;
      const text = `【双休购】${p.name}（¥${p.price}）——双休企业「${c.short}」出品\n${url}`;
      const doCopy = () => {
        navigator.clipboard.writeText(text).then(() => toast('链接已复制，快去分享吧！')).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); toast('链接已复制'); } catch(e) { toast(text); }
          document.body.removeChild(ta);
        });
      };
      if (navigator.share) {
        navigator.share({ title: p.name, text: `${p.name} ¥${p.price}`, url: url }).catch(() => doCopy());
      } else { doCopy(); }
    });
  }

  // 清空对比
  const btnClearCmp = $('#btnClearCompare');
  if (btnClearCmp) btnClearCmp.addEventListener('click', () => {
    localStorage.removeItem('sxg_compare'); toast('已清空对比'); render();
  });

  // 评价表单
  let rfRating = 5;
  $$('#rfStars span').forEach(s => s.addEventListener('click', () => {
    rfRating = parseInt(s.dataset.r);
    $$('#rfStars span').forEach(x => x.style.color = parseInt(x.dataset.r) <= rfRating ? '#E8792B' : '#DDD');
  }));
  const rfBtn = $('#btnSubmitReview');
  if (rfBtn) rfBtn.addEventListener('click', () => {
    const txt = $('#rfText').value.trim();
    const o = getOrder(oid);
    o.items.forEach(it => addUserReview(it.pid, rfRating, txt || '不错'));
    o.status = 'done'; pushTimeline(o, `评价完成（${rfRating}星），订单已完成`);
    saveOrders(getOrders().map(x => x.id === oid ? o : x));
    toast('感谢您的评价！'); render();
  });

  // 领取优惠券
  $$('[data-coupon-claim]').forEach(btn => btn.addEventListener('click', () => {
    btn.textContent = '已领取'; btn.disabled = true;
    toast('优惠券已放入账户，下单自动抵扣');
  }));

  // 每日签到
  const btnCheckin = $('#btnCheckin');
  if (btnCheckin) btnCheckin.addEventListener('click', () => {
    if (!canCheckin()) { toast('今天已签到，明天再来吧'); return; }
    doCheckin();
    toast('签到成功 +10 积分'); render();
  });

  // 客服悬浮
  const csBtn = $('#csFloat');
  if (csBtn) csBtn.addEventListener('click', () => {
    toast('正在为您接入人工客服…');
  });

  // 简历投递
  const applyForm = $('#applyForm');
  if (applyForm) applyForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(applyForm);
    const name = (fd.get('aname') || '').trim();
    const phone = (fd.get('aphone') || '').trim();
    if (!name || !/^1\d{10}$/.test(phone)) { toast('请填写姓名和正确手机号'); return; }
    const msg = $('#applyMsg');
    if (msg) { msg.innerHTML = '<div class="note-box" style="margin-top:8px">✅ 简历已提交！HR 会在 3 个工作日内联系你。</div>'; }
    applyForm.reset();
    toast('投递成功！');
  });

  /* 收藏 - 跳转外部平台购买 */
  const btnCheckout = $('#btnCheckout');
  if (btnCheckout) btnCheckout.addEventListener('click', () => {
    const items = cartDetail();
    if (!items.length) return;
    items.forEach((x, i) => {
      if (x.prod.buyUrl) setTimeout(() => window.open(x.prod.buyUrl, '_blank'), i * 300);
    });
    toast('正在打开京东购买页面…');
  });

  /* 提交订单 */
  const checkoutForm = $('#checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(checkoutForm);
    const name = (fd.get('name') || '').trim(), phone = (fd.get('phone') || '').trim();
    const region = (fd.get('region') || '').trim(), detail = (fd.get('detail') || '').trim();
    if (!name || !phone || !region || !detail) { toast('请完整填写收货信息'); return; }
    if (!/^1\d{10}$/.test(phone)) { toast('手机号格式不正确'); return; }
    const items = cartDetail().map(x => ({ pid: x.prod.pid, name: x.prod.name, price: x.prod.price, qty: x.qty, img: x.prod.img, cname: x.prod.cname }));
    const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
    const mainCat = items[0] ? items[0].cname : '';
    const cat = getAllProducts().find(x => x.pid === items[0].pid)?.cat || '全部';
    const { coupon, off, total } = applyCoupon(subtotal, cat);
    const order = {
      id: 'SX' + Date.now().toString().slice(-8),
      items, subtotal, coupon, off, total, address: { name, phone, region, detail },
      payment: fd.get('pay') || '微信支付', status: 'pending_pay',
      createdAt: nowISO(), timeline: [{ text: '订单已提交，等待付款', time: nowISO() }], aftersale: null
    };
    const os = getOrders(); os.unshift(order); saveOrders(os);
    try { localStorage.setItem('sxg_addr', JSON.stringify({ name, phone, region, detail })); } catch (e) {}
    saveCart([]); syncCartUI();
    addPoints(Math.floor(total / 10));
    location.hash = '#/order/' + order.id;
  });

  /* 订单操作 */
  const oid = parseHash().page === 'order' ? parseHash().arg : null;
  if (oid) {
    const btnCancel = document.querySelector('[data-orderaction="cancel"]');
    if (btnCancel) btnCancel.addEventListener('click', () => {
      if (!confirm('确定取消该订单吗？')) return;
      const o = getOrder(oid);
      o.status = 'cancelled';
      pushTimeline(o, '订单已取消');
      saveOrders(getOrders().map(x => x.id === oid ? o : x));
      toast('订单已取消'); render();
    });
    const btnPay = $('#btnPay');
    if (btnPay) btnPay.addEventListener('click', () => {
      btnPay.disabled = true; btnPay.textContent = '支付中…';
      setTimeout(() => {
        const o = getOrder(oid);
        o.status = 'pending_ship'; pushTimeline(o, `已通过${o.payment}付款 ${fmtMoney(o.total)}`); pushTimeline(o, '商家已接单，正在备货');
        saveOrders(getOrders().map(x => x.id === oid ? o : x));
        toast('支付成功！'); render();
      }, 1200);
    });
    const btnShip = $('#btnShip');
    if (btnShip) btnShip.addEventListener('click', () => {
      const o = getOrder(oid);
      const sf = 'SF' + String(Date.now()).slice(-10);
      o.status = 'shipped';
      pushTimeline(o, `商家已发货（顺丰速运 ${sf}）`);
      pushTimeline(o, `包裹已到达【广州转运中心】`);
      pushTimeline(o, `运输中：【广州转运中心】→【北京转运中心】`);
      pushTimeline(o, `派送中：快递员 王师傅 138****1234 正在派送`);
      saveOrders(getOrders().map(x => x.id === oid ? o : x));
      toast('已发货！物流已更新'); render();
    });
    const btnReceive = $('#btnReceive');
    if (btnReceive) btnReceive.addEventListener('click', () => {
      const o = getOrder(oid);
      o.status = 'received'; pushTimeline(o, '您已确认收货，期待您的评价');
      saveOrders(getOrders().map(x => x.id === oid ? o : x));
      toast('已确认收货'); render();
    });
    const btnDone = $('#btnDone');
    if (btnDone) btnDone.addEventListener('click', () => {
      const o = getOrder(oid);
      o.status = 'done'; pushTimeline(o, '评价完成，订单已完成');
      saveOrders(getOrders().map(x => x.id === oid ? o : x));
      toast('感谢评价！订单完成'); render();
    });
  }

  /* 售后提交 */
  const asForm = $('#aftersaleForm');
  if (asForm) asForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(asForm);
    const o = getOrder(parseHash().arg);
    o.status = 'aftersale';
    o.aftersale = { type: fd.get('type'), reason: fd.get('reason'), note: (fd.get('note') || '').trim(), reply: '客服已受理，48小时内联系您处理' };
    pushTimeline(o, `提交售后申请（${o.aftersale.type}）：${o.aftersale.reason}`);
    saveOrders(getOrders().map(x => x.id === o.id ? o : x));
    toast('售后申请已提交'); location.hash = '#/order/' + o.id;
  });

  if (page === '') setupInstallBanner();
  if (page === 'join') setupJoinForm();
}

function goto(page, params) {
  const qs = params.toString();
  location.hash = '#/' + page + (qs ? '?' + qs : '');
}

function updateFavUI() {
  const n = store.favs.length;
  $$('.tab-item .cnt').forEach(el => { el.textContent = n; el.style.display = n ? 'grid' : 'none'; });
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- PWA 安装 ---------- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  const b = $('#installBanner');
  if (b && !sessionStorage.getItem('sxg_install_closed')) b.classList.add('show');
});
function setupInstallBanner() {
  const banner = $('#installBanner'), btn = $('#installBtn'), close = $('#installClose');
  if (!banner || !btn || !close) return;
  if (deferredInstall && !sessionStorage.getItem('sxg_install_closed')) banner.classList.add('show');
  btn.addEventListener('click', async () => {
    if (!deferredInstall) { toast('请用浏览器菜单「添加到主屏幕」安装'); return; }
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    if (outcome === 'accepted') toast('正在安装到桌面…');
    deferredInstall = null; banner.classList.remove('show');
  });
  close.addEventListener('click', () => { banner.classList.remove('show'); sessionStorage.setItem('sxg_install_closed', '1'); });
}

/* ---------- 启动 ---------- */
function boot() {
  const inp = $('#globalSearch');
  inp.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = inp.value.trim();
    const { page } = parseHash();
    const target = (page === 'products' || page === 'product') ? 'products' : 'companies';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    goto(target, params);
  });
  let debounce = null;
  inp.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const { page, params } = parseHash();
      if (page !== 'companies' && page !== 'products') return;
      const q = inp.value.trim();
      if (q) params.set('q', q); else params.delete('q');
      history.replaceState(null, '', '#/' + page + (params.toString() ? '?' + params.toString() : ''));
      render();
    }, 260);
  });

  window.addEventListener('hashchange', render);
  render();
  updateFavUI(); syncCartUI();

  // 新人弹窗
  try {
    if (!localStorage.getItem('sxg_newuser_seen')) {
      setTimeout(() => { $('#newUserPopup').style.display = 'flex'; }, 1500);
    }
  } catch (e) {}
  const nupClose = $('#nupClose'), nupClaim = $('#nupClaim');
  if (nupClose) nupClose.addEventListener('click', () => { $('#newUserPopup').style.display = 'none'; try { localStorage.setItem('sxg_newuser_seen', '1'); } catch (e) {} });
  if (nupClaim) nupClaim.addEventListener('click', () => {
    addPoints(50);
    try { localStorage.setItem('sxg_newuser_seen', '1'); } catch (e) {}
    $('#newUserPopup').style.display = 'none';
    toast('已领取新人礼包：50 积分 + ¥30 券');
  });

  // 深色模式
  const themeBtn = $('#themeToggle');
  const applyTheme = t => {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  };
  try { const saved = localStorage.getItem('sxg_theme'); if (saved) applyTheme(saved); } catch (e) {}
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(cur);
    try { localStorage.setItem('sxg_theme', cur); } catch (e) {}
  });

  // 搜索联想下拉
  const suggestBox = $('#searchSuggest');
  const allProducts = getAllProducts();
  inp.addEventListener('input', () => {
    const q = inp.value.trim().toLowerCase();
    if (!q || !suggestBox) { suggestBox.style.display = 'none'; return; }
    const qs = q.toLowerCase().split(/\s+/).filter(Boolean); const matches = allProducts.filter(p => { const s = (p.name + ' ' + p.cname + ' ' + p.desc).toLowerCase(); return qs.every(k => s.includes(k)); }).slice(0, 6);
    if (!matches.length) { suggestBox.style.display = 'none'; return; }
    suggestBox.innerHTML = matches.map(p => `<div class="suggest-item" data-sq="${esc(p.name)}"><b>${esc(p.name)}</b><span class="tiny">${esc(p.cname)}</span></div>`).join('');
    suggestBox.style.display = 'block';
    suggestBox.querySelectorAll('.suggest-item').forEach(el => el.addEventListener('click', () => {
      inp.value = el.dataset.sq;
      suggestBox.style.display = 'none';
      pushSearchHistory(inp.value.trim());
      const { page } = parseHash();
      const params = new URLSearchParams();
      params.set('q', inp.value.trim());
      goto(page === 'products' ? 'products' : 'products', params);
    }));
  });
  // 聚焦时显示搜索历史 + 热搜
  inp.addEventListener('focus', () => {
    const hist = getSearchHistory();
    const hot = HOT_SEARCH.slice(0, 5);
    if (!suggestBox || (hist.length === 0 && hot.length === 0)) return;
    suggestBox.innerHTML =
      (hist.length ? `<div class="suggest-hist">${hist.map(h => `<div class="suggest-item" data-sq="${esc(h)}"><b>🕐 ${esc(h)}</b></div>`).join('')}</div>` : '') +
      `<div class="suggest-hot">${hot.map(h => `<div class="suggest-item" data-sq="${esc(h)}"><b>🔥 ${esc(h)}</b></div>`).join('')}</div>`;
    suggestBox.style.display = 'block';
    suggestBox.querySelectorAll('.suggest-item').forEach(el => el.addEventListener('click', () => {
      inp.value = el.dataset.sq.replace(/^(🕐|🔥)\s/, '');
      suggestBox.style.display = 'none';
      pushSearchHistory(inp.value.trim());
      const params = new URLSearchParams();
      params.set('q', inp.value.trim());
      goto('products', params);
    }));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#searchWrap')) suggestBox.style.display = 'none';
  });

  // 回到顶部
  const btt = $('#backToTop');
  window.addEventListener('scroll', () => {
    if (btt) btt.style.display = window.scrollY > 400 ? 'grid' : 'none';
  });
  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}

document.addEventListener('DOMContentLoaded', boot);
