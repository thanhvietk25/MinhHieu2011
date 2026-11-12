(() => {
'use strict';
/* Icon tab trình duyệt: nếu index.html thiếu thẻ <link rel="icon"> thì tự thêm (dùng assets/favicon.png) */
if (!document.querySelector('link[rel~="icon"]')) { const ic = document.createElement('link'); ic.rel = 'icon'; ic.type = 'image/png'; ic.href = 'assets/favicon.png'; document.head.append(ic); }
/* ẢNH: chạy file cap-nhat-anh.bat để tự tạo js/images.js từ MỌI ảnh trong assets/images/ (tên gì cũng được).
   Nếu chưa chạy, web thử các tên anh1.jpg ... anh100.jpg (ảnh thiếu sẽ tự bị bỏ qua). */
const LISTED = Array.isArray(window.IMAGE_LIST) && window.IMAGE_LIST.length > 0;
let IMAGES = LISTED ? window.IMAGE_LIST : Array.from({ length: 100 }, (_, i) => `assets/images/anh${i + 1}.jpg`);
const MAX_PHOTOS = 10, MAX_MOBILE = 5; /* số ảnh tối đa bay cùng lúc: máy tính / điện thoại */
const FORM = ['H₂O','CO₂','NaCl','CH₄','O₃','NH₃','C₆H₆','C₆H₁₂O₆','H₂SO₄','2H₂ + O₂ → 2H₂O'];

const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isM = () => innerWidth < 640;
let mode = 'gift', valid = [], opened = false, timers = [];

/* ---------- Ảnh bay từ dưới lên ---------- */
const layer = $('#rise');
/* Không chờ tải hết ảnh: có danh sách (images.js) thì dùng ngay; chưa có thì ảnh nào tải xong là dùng ảnh đó (tối đa chờ 4 giây ảnh đầu tiên) */
const preload = () => LISTED ? Promise.resolve().then(() => { valid = IMAGES.slice(); }) : new Promise(done => {
  IMAGES.forEach(src => { const i = new Image(); i.onload = () => { valid.push(src); done(); }; i.src = src; });
  setTimeout(done, 4000);
});

/* ---------- Tự nhận ảnh mới (không cần chạy cap-nhat-anh.bat nữa) ----------
   - Web chạy trên GitHub Pages: tự hỏi GitHub xem thư mục assets/images có ảnh nào, ảnh mới upload là có ngay (kết quả nhớ 5 phút).
   - Mở file trực tiếp trên máy / host khác: tự thử các tên nối tiếp (anh42.jpg, anh43.jpg ...). Ảnh đặt tên khác thì chạy cap-nhat-anh.bat. */
const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;
const addImgs = list => list.forEach(src => { if (!IMAGES.includes(src)) IMAGES.push(src); if (!valid.includes(src)) valid.push(src); });
async function ghList() {
  const h = location.hostname;
  if (!/\.github\.io$/i.test(h)) return null;
  const owner = h.split('.')[0], parts = location.pathname.split('/').filter(Boolean);
  if (parts.length && /\.[a-z0-9]+$/i.test(parts[parts.length - 1])) parts.pop();           /* bỏ index.html */
  const tries = parts.length ? [[parts[0], parts.slice(1)], [h, parts]] : [[h, []]];       /* repo dự án, hoặc repo owner.github.io */
  let stale = null;
  for (const [repo, sub] of tries) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${[...sub, 'assets', 'images'].join('/')}`, key = 'imgs:' + url;
    try {
      const c = JSON.parse(localStorage.getItem(key) || 'null');
      if (c && Date.now() - c.t < 3e5) return c.list;
      if (c) stale = c.list;
      const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) continue;
      const list = (await r.json()).filter(f => f.type === 'file' && IMG_RE.test(f.name)).map(f => 'assets/images/' + encodeURIComponent(f.name));
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), list })); } catch (e) {}
      return list;
    } catch (e) {}
  }
  return stale;
}
function probeMore() {
  const top = Math.max(0, ...IMAGES.map(s => +(/anh(\d+)\.jpg$/i.exec(s) || [])[1]).filter(Boolean));
  for (let n = 1; n <= top + 50; n++) {
    const src = `assets/images/anh${n}.jpg`; if (IMAGES.includes(src)) continue;
    const i = new Image(); i.onload = () => addImgs([src]); i.src = src;
  }
}
const discover = () => ghList().catch(() => null).then(list => list ? addImgs(list) : probeMore());

function rise() {
  const m = isM();
  if (document.hidden || layer.children.length >= (m ? MAX_MOBILE : MAX_PHOTOS)) return;
  const w = m ? rnd(66, 104) : rnd(110, 170), el = document.createElement('div');
  el.className = 'ph'; el.style.width = w + 'px';
  if (valid.length) { const im = new Image(), src = valid[Math.random() * valid.length | 0]; im.alt = ''; im.decoding = 'async'; im.onerror = () => el.remove(); im.src = src; el.append(im); }
  else { el.classList.add('e'); el.textContent = FORM[Math.random() * 9 | 0]; }
  const vw = innerWidth, vh = innerHeight, edge = m ? [-w * .25, vw * .04] : [vw * .03, vw * .22];
  const off = rnd(edge[0], edge[1]);
  el.style.left = (Math.random() < .5 ? off : vw - w - off) + 'px'; /* ảnh bay ở hai bên, tránh nội dung chính */
  const gift = mode === 'gift', peak = gift ? (m ? .8 : .95) : (m ? .4 : .6), r = rnd(-9, 9), dist = vh + w * 1.8;
  const f = [{ opacity: 0, transform: `translateY(0) rotate(${r}deg)`, offset: 0 }, { opacity: peak, offset: .1 }];
  if (gift) f.push({ opacity: peak * .85, offset: .55 });
  f.push({ opacity: 0, transform: `translateY(${-dist}px) rotate(${-r}deg)`, offset: 1 });
  layer.append(el);
  el.animate(f, { duration: rnd(15000, 21000), easing: 'linear', fill: 'forwards' }).onfinish = () => el.remove();
}
const loop = () => { rise(); setTimeout(loop, (mode === 'gift' ? 1000 : 1300) + rnd(0, 800)); };

/* ---------- Hoa rơi + hạt sáng (canvas) ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'), COL = ['#f6c6d8', '#fbd9e5', '#e4d8fa', '#fff0d6', '#d6ebf7'];
let W, H, D, ps = [], st = [], last = 0;
const petal = (x, y, b) => ({ x, y, s: rnd(5, 11) * D, vy: rnd(16, 40) * D, w: rnd(0, 6.3), r: rnd(0, 6.3), vr: rnd(-1.5, 1.5), c: COL[Math.random() * 5 | 0], bx: b ? rnd(-600, 600) * D : 0, by: b ? rnd(-700, -150) * D : 0, once: b });
function seed() {
  D = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * D; H = cv.height = innerHeight * D;
  const k = reduce ? .3 : isM() ? .55 : 1;
  ps = Array.from({ length: 24 * k | 0 }, () => petal(rnd(0, W), rnd(0, H)));
  st = Array.from({ length: 46 * k | 0 }, () => ({ x: rnd(0, W), y: rnd(0, H), s: rnd(.8, 2.2) * D, p: rnd(0, 6.3), v: rnd(.8, 2) }));
  netSeed();
}
const burst = (x, y) => { if (!reduce) for (let i = 0; i < 40; i++) ps.push(petal(x * D, y * D, true)); };
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min((t - last) / 1000, .05); last = t;
  if (document.hidden) return;
  cx.clearRect(0, 0, W, H);
  net(dt);
  cx.fillStyle = '#f3d48a';
  for (const s of st) { cx.globalAlpha = .15 + .6 * (.5 + .5 * Math.sin(t / 1000 * s.v + s.p)); cx.beginPath(); cx.arc(s.x, s.y, s.s, 0, 6.283); cx.fill(); }
  const k = Math.pow(.2, dt);
  cx.globalAlpha = .8;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i]; p.w += dt * 1.3; p.r += p.vr * dt; p.bx *= k; p.by *= k;
    p.x += (Math.sin(p.w) * 22 * D + p.bx) * dt; p.y += (p.vy + p.by) * dt;
    if (p.y > H + 20) { if (p.once) { ps.splice(i, 1); continue; } p.y = -20; p.x = rnd(0, W); }
    cx.fillStyle = p.c; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
    cx.beginPath(); cx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); cx.fill(); cx.restore();
  }
}

/* ---------- Mạng lưới phân tử ở nền ---------- */
const nv = $('#net'), nx = nv.getContext('2d');
let at = [], NW, NH;
function netSeed() {
  NW = nv.width = innerWidth * D; NH = nv.height = innerHeight * D;
  at = Array.from({ length: reduce ? 10 : isM() ? 16 : 30 }, () => ({ x: rnd(0, NW), y: rnd(0, NH), vx: rnd(-8, 8) * D, vy: rnd(-8, 8) * D, r: rnd(2.5, 5) * D, c: Math.random() < .5 ? '143,120,196' : '217,138,168' }));
}
function net(dt) {
  nx.clearRect(0, 0, NW, NH);
  const L = (isM() ? 120 : 170) * D;
  for (const a of at) {
    a.x += a.vx * dt; a.y += a.vy * dt;
    if ((a.x < 0 && a.vx < 0) || (a.x > NW && a.vx > 0)) a.vx *= -1;
    if ((a.y < 0 && a.vy < 0) || (a.y > NH && a.vy > 0)) a.vy *= -1;
  }
  nx.lineWidth = D;
  for (let i = 0; i < at.length; i++) for (let k = i + 1; k < at.length; k++) {
    const d = Math.hypot(at[i].x - at[k].x, at[i].y - at[k].y);
    if (d < L) { nx.strokeStyle = `rgba(143,120,196,${.4 * (1 - d / L)})`; nx.beginPath(); nx.moveTo(at[i].x, at[i].y); nx.lineTo(at[k].x, at[k].y); nx.stroke(); }
  }
  for (const a of at) { nx.fillStyle = `rgba(${a.c},.5)`; nx.beginPath(); nx.arc(a.x, a.y, a.r, 0, 6.283); nx.fill(); }
}

/* ---------- Công thức hóa học hiện rồi mờ dần ---------- */
const chem = $('.chem');
setInterval(() => {
  if (document.hidden || chem.children.length > 5) return;
  const s = document.createElement('span');
  s.textContent = FORM[Math.random() * FORM.length | 0];
  s.style.cssText = `left:${rnd(4, 80)}%;top:${rnd(8, 84)}%;font-size:${rnd(15, 28)}px`;
  s.onanimationend = () => s.remove(); chem.append(s);
}, 1800);

/* ---------- Nhạc nền (tùy chọn) ---------- */
const au = $('#bgm'), mb = $('#music');
au.volume = .4;
const sync = () => mb.classList.toggle('on', !au.paused);
const play = () => au.play().then(sync, () => {});
mb.onclick = () => au.paused ? play() : au.pause();
au.onpause = au.onplay = sync;
au.onerror = () => { mb.hidden = true; }; /* không có file nhạc → ẩn nút, web vẫn chạy bình thường */
/* Thử phát ngay khi vào web; nếu trình duyệt chặn thì phát ở lần bấm/chạm/gõ phím đầu tiên */
const evs = ['pointerdown', 'keydown', 'touchstart'];
const unlock = e => {
  if (e.target.closest?.('#music')) return;
  evs.forEach(n => removeEventListener(n, unlock));
  if (au.paused) play();
};
evs.forEach(n => addEventListener(n, unlock));
play();

/* ---------- Chuyển màn hình & lời chúc ---------- */
const items = [...document.querySelectorAll('.rv')], env = $('#env'), lab = $('.lab');
const SPEED = 20; /* ms cho mỗi ký tự khi đánh máy */
items.forEach(e => { if (e !== lab) { e._c = Array.from(e.textContent.trim()); e.innerHTML = '<span></span><span class="g"></span>'; } });
const put = (e, n) => { e.children[0].textContent = e._c.slice(0, n).join(''); e.children[1].textContent = e._c.slice(n).join(''); };
const stop = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; };
const go = id => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id)); mode = id === 's2' ? 'card' : 'gift'; };
function reveal() {
  stop(); lab.classList.remove('react'); $('.body').scrollTop = 0;
  items.forEach(e => { e.classList.remove('show', 'typing'); if (e._c) put(e, 0); });
  let d = 1500;
  items.forEach(e => {
    const n = e._c ? e._c.length : 0;
    timers.push(setTimeout(() => {
      e.classList.add('show'); e.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (!e._c) return;
      if (reduce) { put(e, n); return; }
      e.classList.add('typing'); let i = 0;
      const iv = setInterval(() => {
        put(e, ++i);
        if (i < n) return;
        clearInterval(iv); e.classList.remove('typing');
        if (e.classList.contains('end')) { const r = e.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); } /* cánh hoa bung ra ở lời kết */
      }, SPEED);
      timers.push(iv);
    }, d));
    d += (reduce ? 0 : n * SPEED) + 700;
  });
}
function openGift() {
  if (opened) return; opened = true; env.classList.add('open'); play();
  const b = env.getBoundingClientRect(); burst(b.left + b.width / 2, b.top + b.height / 2);
  timers.push(setTimeout(() => { go('s2'); reveal(); }, 1700));
}
$('#open').onclick = env.onclick = openGift;
$('#replay').onclick = reveal;
$('#home').onclick = () => { stop(); go('s1'); setTimeout(() => { env.classList.remove('open'); opened = false; }, 900); };

/* ---------- Thí nghiệm ống nghiệm ---------- */
$('#react').onclick = e => {
  lab.classList.remove('react'); void lab.offsetWidth; lab.classList.add('react');
  e.target.textContent = 'Thử lại phản ứng ⚗';
  timers.push(setTimeout(() => { const b = lab.querySelector('.tube').getBoundingClientRect(); burst(b.left + b.width / 2, b.top + b.height / 2); }, 2600));
};

/* ---------- Thư viện kỷ niệm ---------- */
const gal = $('#gal'), grid = $('#grid'), lb = $('#lb'), lbi = lb.querySelector('img');
let li = 0;
const byNum = new Intl.Collator(undefined, { numeric: true }).compare;   /* anh2 trước anh10 */
let pics = [];                                                       /* ảnh của thư viện: chốt lại mỗi lần mở */
const showLb = i => { li = (i + pics.length) % pics.length; lbi.src = pics[li]; lb.hidden = false; };
$('#galbtn').onclick = () => {
  grid.textContent = ''; pics = (LISTED ? IMAGES.slice() : valid.slice()).sort(byNum); 
  if (!pics.length) grid.innerHTML = '<p class="none">Chưa có ảnh. Hãy bỏ ảnh vào thư mục assets/images/ nhé.</p>';
  pics.forEach((src, i) => {
    const b = document.createElement('button'), im = new Image();
    b.className = 't'; im.src = src; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.onerror = () => b.remove(); b.append(im); b.onclick = () => showLb(i); grid.append(b);
  });
  gal.hidden = false;
};
$('#gx').onclick = () => { gal.hidden = true; };
lb.onclick = e => {
  const c = e.target.classList;
  if (c.contains('p')) showLb(li - 1); else if (c.contains('n')) showLb(li + 1); else lb.hidden = true;
};
addEventListener('keydown', e => {
  if (gal.hidden) return;
  if (e.key === 'Escape') { if (lb.hidden) gal.hidden = true; else lb.hidden = true; }
  else if (!lb.hidden && e.key === 'ArrowLeft') showLb(li - 1);
  else if (!lb.hidden && e.key === 'ArrowRight') showLb(li + 1);
});

/* ---------- Lời chúc từ các bạn (đọc từ js/wishes.js) ---------- */
const wsh = $('#wsh'), wl = $('#wl');
const WISHES = Array.isArray(window.WISH_LIST) ? window.WISH_LIST : [];
const mkWish = w => {
  const c = document.createElement('article'), t = document.createElement('p'), f = document.createElement('footer');
  c.className = 'w'; t.textContent = w.text; f.textContent = '— ' + (w.name || 'Một bạn học sinh');
  c.append(t, f); return c;
};


/* Nút "Lời chúc từ các bạn": danh sách đầy đủ, cuộn dọc */
$('#wishbtn').onclick = () => {
  wl.textContent = '';
  const box = document.createElement('div'); box.className = 'wc'; wl.append(box);
  if (!WISHES.length) { const n = document.createElement('p'); n.className = 'none'; n.textContent = 'Chưa có lời chúc nào. Hãy thêm vào file js/wishes.js nhé.'; box.append(n); }
  WISHES.forEach((w, i) => { const c = mkWish(w); c.style.setProperty('--d', Math.min(i * .12, 1.5) + 's'); box.append(c); });
  wl.scrollTop = 0; wsh.hidden = false;
};
$('#wx').onclick = () => { wsh.hidden = true; };
addEventListener('keydown', e => { if (e.key === 'Escape' && !wsh.hidden) wsh.hidden = true; });

/* ---------- Bí mật: bánh sinh nhật 30/11 (nút nằm dưới nút "Mở tình cảm của bọn em") ---------- */
const CANDLES = [112, 131, 150, 169, 188], CCOL = ['#f3b9cf', '#cbb8f0', '#f6e3a8', '#d6ebf7', '#f3b9cf'];
const LET = ['#ffb3d1', '#ffd27a', '#c9b6ff', '#9fe3ff', '#ffe9a8'];                       /* màu từng chữ Happy Birthday */
const CF_COL = ['#f3b9cf', '#c9739b', '#cbb8f0', '#9b83d6', '#c9a45c', '#ffe08a', '#d6ebf7', '#ffffff'];
const FW_COL = ['#ffd27a', '#ff8fb8', '#b8a2ff', '#8fe3ff', '#ffffff', '#ffb36b'];       /* màu pháo hoa */

/* nút bí mật thay cho khối "C + O = Cô" ở màn hình đầu */
const secret = document.createElement('button');
secret.id = 'secret'; secret.className = 'secret'; secret.innerHTML = '<span>🔒</span> Bí mật – cô đừng mở nhé!';
$('#open').after(secret);
{ const tl = $('.tiles'); if (tl) tl.remove(); }

const cake = document.createElement('section');
cake.id = 'cake'; cake.className = 'gal cake'; cake.hidden = true; cake.setAttribute('aria-label', 'Bánh sinh nhật');
cake.innerHTML = '<div class="fxl">' + Array.from({ length: 38 }, () => `<i class="st" style="left:${rnd(1, 99).toFixed(1)}%;top:${rnd(1, 99).toFixed(1)}%;--z:${rnd(1, 2.8).toFixed(1)}px;animation-delay:${rnd(0, 4).toFixed(1)}s;animation-duration:${rnd(2.2, 4.6).toFixed(1)}s"></i>`).join('') + '</div>' + `
  <button class="x" id="cx" aria-label="Đóng">✕</button>
  <h3>Sinh nhật cô iuuuuu 🎂</h3>
  <p class="cd" id="cd"></p>
  <div class="hbt" id="hbt"></div>
  <div class="stage" id="cstage">
    <svg viewBox="0 50 300 245" class="cksvg" role="img" aria-label="Chiếc bánh sinh nhật có 5 ngọn nến">
      <defs>
        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9d3e2"/><stop offset="1" stop-color="#f0a9c6"/></linearGradient>
        <linearGradient id="gt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3d6f8"/><stop offset="1" stop-color="#c3aeed"/></linearGradient>
        <radialGradient id="gg"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
        <linearGradient id="gf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9d3c"/><stop offset=".6" stop-color="#ffd35c"/><stop offset="1" stop-color="#fff3b8"/></linearGradient>
      </defs>
      <ellipse cx="150" cy="268" rx="132" ry="18" fill="#efe6fa" stroke="#c9a45c" stroke-width="1.5"/>
      <ellipse cx="150" cy="264" rx="112" ry="12" fill="#faf5ff"/>
      <rect x="50" y="186" width="200" height="76" rx="12" fill="url(#gb)"/>
      <rect x="50" y="228" width="200" height="6" fill="#c9a45c" opacity=".55"/>
      <rect x="50" y="186" width="200" height="14" rx="7" fill="#fffaf5"/>
      <g fill="#fffaf5"><circle cx="66" cy="203" r="8"/><circle cx="96" cy="206" r="9"/><circle cx="132" cy="204" r="8"/><circle cx="168" cy="207" r="9"/><circle cx="204" cy="204" r="8"/><circle cx="234" cy="203" r="8"/></g>
      <g fill="#c9a45c"><circle cx="72" cy="248" r="2.6"/><circle cx="108" cy="246" r="2.6"/><circle cx="150" cy="250" r="2.6"/><circle cx="192" cy="246" r="2.6"/><circle cx="228" cy="248" r="2.6"/></g>
      <rect x="85" y="128" width="130" height="62" rx="12" fill="url(#gt)"/>
      <rect x="85" y="128" width="130" height="14" rx="7" fill="#fffaf5"/>
      <g fill="#fffaf5"><circle cx="102" cy="145" r="7"/><circle cx="130" cy="148" r="8"/><circle cx="162" cy="146" r="7"/><circle cx="190" cy="148" r="8"/></g>
      <g fill="#c9739b"><path d="M150 176c-9-9-20-1-14 6l14 12 14-12c6-7-5-15-14-6z"/></g>
      <g id="cdl"></g>
      <g id="smk"></g>
    </svg>
  </div>
  <div class="cacts"><button class="cta" id="blow">🌬️ Thổi nến </button></div>`;
document.body.append(cake);
const cf = document.createElement('canvas'); cf.className = 'cf'; cf.setAttribute('aria-hidden', 'true'); document.body.append(cf);
const cstage = $('#cstage'), hbt = $('#hbt'), blow = $('#blow'), cx2 = cf.getContext('2d');
$('#cdl').innerHTML = CANDLES.map((x, i) => `
  <g class="cn" style="--d:${i * .13}s">
    <rect x="${x - 3.2}" y="94" width="6.4" height="35" rx="2" fill="${CCOL[i]}" stroke="#c9a45c" stroke-width=".8"/>
    <path d="M${x - 3.2} 104l6.4 -4M${x - 3.2} 113l6.4 -4M${x - 3.2} 122l6.4 -4" stroke="#fff" stroke-width="1.6" opacity=".8"/>
    <line class="wick" x1="${x}" y1="94" x2="${x}" y2="88" stroke="#6b5b73" stroke-width="1.4" stroke-linecap="round"/>
    <g class="lit" transform="translate(${x} 82)">
      <circle class="glow" r="17" fill="url(#gg)" style="--gd:${i * .17}s"/>
      <g class="fl" style="--fd:${i * .11}s"><path d="M0 -12C7 -4 6 4 0 6C-6 4 -7 -4 0 -12Z" fill="url(#gf)"/><path d="M0 -4C3 0 3 3 0 4C-3 3 -3 0 0 -4Z" fill="#fffbe0"/></g>
    </g>
  </g>`).join('');

/* ----- âm thanh: bản Happy Birthday + tiếng thổi/pháo hoa (tự tạo bằng WebAudio, không cần file nhạc) ----- */
let ac = null, tune = null;
const AC = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } return ac; };
const HB = [[67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2], [67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2], [67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,1], [77,.75],[77,.25],[76,1],[72,1],[74,1],[72,2]];
function stopTune() {
  if (!tune) return;
  const t = tune; tune = null;
  try { t.m.gain.setTargetAtTime(0, t.a.currentTime, .08); } catch (e) {}
  setTimeout(() => { try { t.m.disconnect(); } catch (e) {} }, 700);
}
function playTune() {
  stopTune(); const a = AC(); if (!a) return;
  const m = a.createGain(); m.gain.value = .55; m.connect(a.destination);
  let t = a.currentTime + .2; const beat = .52;
  HB.forEach(([n, b]) => {
    const f = 440 * Math.pow(2, (n - 69) / 12), d = b * beat;      /* giọng "hộp nhạc": sóng sin + 2 họa âm, tắt dần */
    [[1, .5], [2, .17], [3, .06]].forEach(([k, v]) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * k;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + d + .6);
      o.connect(g); g.connect(m); o.start(t); o.stop(t + d + .65);
    });
    t += d;
  });
  tune = { a, m };
}
function noise(dur, vol, f0, f1) {                                  /* tiếng thổi / tiếng nổ: nhiễu lọc dải tần */
  const a = AC(); if (!a) return;
  const len = a.sampleRate * dur | 0, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const n = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  n.buffer = buf; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, a.currentTime); fl.frequency.exponentialRampToValueAtTime(f1, a.currentTime + dur);
  g.gain.value = vol; n.connect(fl); fl.connect(g); g.connect(a.destination); n.start();
}

/* ----- trạng thái ----- */
let lit = true, blowT = [], parts = [], cfRaf = 0, rainT = [], bgmOff = false;
mb.addEventListener('click', () => { bgmOff = au.paused; });
const PROMPT = 'Cô hãy ước một điều ước, rồi thổi nến nhé ✨';
function cakeDays() {
  const n = new Date(), td = new Date(n.getFullYear(), n.getMonth(), n.getDate()), b = new Date(n.getFullYear(), 10, 30);
  if (b < td) b.setFullYear(b.getFullYear() + 1);
  const d = Math.round((b - td) / 864e5);
  return d === 0 ? 'Hôm nay là sinh nhật cô rồi! 🎉' : d <= 60 ? `Còn ${d} ngày nữa là đến sinh nhật cô rồiiii 🎂` : 'Sinh nhật cô – tụi em chúc cô một tuổi mới thật nhiều niềm vui, hạnh phúc nha ạaaaa💝';
}
function cakeReset() {
  blowT.forEach(clearTimeout); blowT = []; lit = true;
  cstage.className = 'stage'; cake.classList.remove('done'); $('#smk').textContent = '';
  cake.querySelectorAll('.bl').forEach(e => e.remove());
  hbt.className = 'hbt'; hbt.textContent = PROMPT;
  blow.textContent = 'Thổi nến 🌬️'; blow.disabled = false;
  parts.length = 0; rainT.forEach(clearInterval); rainT = [];
}

/* ----- pháo giấy + pháo hoa (canvas riêng, không đụng canvas cánh hoa) ----- */
function cfSize() { const d = Math.min(devicePixelRatio || 1, 2); cf.width = innerWidth * d; cf.height = innerHeight * d; cx2.setTransform(d, 0, 0, d, 0, 0); }
function conf(x, y, ang, spread, pow) {
  const a = ang + rnd(-spread, spread), v = pow * rnd(.55, 1);
  parts.push({ k: 'c', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: rnd(6, 11), h: rnd(3, 6), r: rnd(0, 6.3), vr: rnd(-9, 9), c: CF_COL[Math.random() * CF_COL.length | 0], t: 0, max: rnd(3.2, 5.2), round: Math.random() < .3, sw: rnd(0, 6.3) });
}
function firework(x, y) {
  const c1 = FW_COL[Math.random() * FW_COL.length | 0], c2 = FW_COL[Math.random() * FW_COL.length | 0], n = isM() ? 46 : 74;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.283 + rnd(-.05, .05), v = rnd(110, 300) * (i % 2 ? 1 : .6);
    parts.push({ k: 's', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: i % 3 ? c1 : c2, t: 0, max: rnd(1.1, 1.9), r: rnd(1.4, 2.7) });
  }
  noise(.3, .3, 2200, 260);
}
function rocket(x, ty) { parts.push({ k: 'r', x, y: innerHeight + 8, ty, vy: -(innerHeight - ty) / .85, t: 0, max: 3 }); }
function cfLoop() {
  if (cfRaf) return; let t0 = 0;
  const step = t => {
    const dt = Math.min((t - (t0 || t)) / 1000, .05), H = innerHeight; t0 = t; cx2.clearRect(0, 0, innerWidth, H);
    parts = parts.filter(p => p.t < p.max && p.y < H + 24);
    for (const p of parts) {
      p.t += dt;
      if (p.k === 'r') {                                              /* tên lửa pháo hoa bay lên, để lại đuôi lấp lánh */
        p.y += p.vy * dt;
        parts.push({ k: 's', x: p.x + rnd(-1.5, 1.5), y: p.y + 4, vx: rnd(-14, 14), vy: rnd(10, 50), c: '#ffe3a3', t: 0, max: rnd(.3, .55), r: 1.5 });
        if (p.y <= p.ty) { p.t = p.max; firework(p.x, p.y); }
        continue;
      }
      if (p.k === 's') {
        p.vx -= p.vx * 1.4 * dt; p.vy += (150 - p.vy * 1.4) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        const al = Math.min(1, (p.max - p.t) / .5);
        cx2.globalCompositeOperation = 'lighter'; cx2.globalAlpha = al; cx2.fillStyle = p.c;
        cx2.beginPath(); cx2.arc(p.x, p.y, p.r * (.5 + al * .5), 0, 6.3); cx2.fill();
        cx2.globalCompositeOperation = 'source-over'; continue;
      }
      p.vx += -p.vx * 1.6 * dt; p.vy += (460 - p.vy * 1.6) * dt;
      p.x += (p.vx + Math.sin(p.sw + p.t * 7) * 26) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      cx2.save(); cx2.globalAlpha = Math.min(1, (p.max - p.t) / .7); cx2.translate(p.x, p.y); cx2.rotate(p.r); cx2.fillStyle = p.c;
      if (p.round) { cx2.beginPath(); cx2.arc(0, 0, p.h * .7, 0, 6.3); cx2.fill(); } else cx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 1.3)) + 1);
      cx2.restore();
    }
    cx2.globalAlpha = 1;
    cfRaf = parts.length || rainT.length ? requestAnimationFrame(step) : (cx2.clearRect(0, 0, innerWidth, H), 0);
  };
  cfRaf = requestAnimationFrame(step);
}
function celebrate() {
  if (reduce) return;
  const W = innerWidth, H = innerHeight, k = isM() ? .6 : 1;
  for (let i = 0; i < 70 * k; i++) { conf(0, H, -Math.PI / 3, .45, H * 1.5); conf(W, H, -Math.PI * 2 / 3, .45, H * 1.5); }
  for (let i = 0; i < 50 * k; i++) conf(W / 2, H * .55, -Math.PI / 2, .9, H * 1.1);
  let n = 0; const id = setInterval(() => { for (let i = 0; i < 4 * k; i++) conf(rnd(0, W), -12, Math.PI / 2, .3, 140); if (++n > 45) { clearInterval(id); rainT = rainT.filter(q => q !== id); } }, 70);
  rainT.push(id);
  /* pháo hoa nổ trên bầu trời */
  [[0, .25, .28], [.45, .75, .22], [.95, .5, .36], [1.5, .15, .3], [2.1, .85, .26], [2.7, .4, .2]].slice(0, isM() ? 4 : 6)
    .forEach(([d, fx, fy]) => blowT.push(setTimeout(() => { rocket(W * fx, H * fy); cfLoop(); }, d * 1000)));
  /* bóng bay bay lên */
  for (let i = 0; i < (isM() ? 9 : 15); i++) {
    const el = document.createElement('div'), b = document.createElement('i'), w = rnd(34, 58);
    el.className = 'bl'; el.style.cssText = `left:${rnd(2, 92).toFixed(1)}%;--w:${w.toFixed(0)}px;--t:${rnd(7, 12).toFixed(1)}s;animation-delay:${rnd(0, 2.6).toFixed(2)}s`;
    b.style.cssText = `--c:${CF_COL[(Math.random() * 6 | 0) + 1]};animation-delay:${rnd(0, 2).toFixed(2)}s`; el.append(b);
    el.addEventListener('animationend', e => { if (e.target === el) el.remove(); }); $('#cake .fxl').append(el);
  }
  cfLoop();
}

function puffSmoke(x) {
  const g = $('#smk');
  for (let j = 0; j < 8; j++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x + rnd(-1.5, 1.5)); c.setAttribute('cy', 86); c.setAttribute('r', rnd(4.5, 7.5)); c.setAttribute('class', 'sm');
    c.style.setProperty('--dx', (Math.sin(j * 1.3) * 12 + rnd(-5, 5)).toFixed(1) + 'px'); c.style.animationDelay = j * .2 + 's';
    c.addEventListener('animationend', () => c.remove()); g.append(c);
  }
}
function blowOut() {
  if (!lit) { cakeReset(); playBday(); return; }                    /* bấm lần nữa: thắp nến lại */
  lit = false; blow.disabled = true; cstage.classList.add('blowing'); noise(.8, .55, 500, 2600);
  CANDLES.forEach((x, i) => blowT.push(setTimeout(() => puffSmoke(x), 500 + i * 130)));
  blowT.push(setTimeout(() => {
    cstage.classList.replace('blowing', 'out'); cake.classList.add('done');
    hbt.className = 'hbt on'; hbt.textContent = '';
    const big = document.createElement('div'), sub = document.createElement('div');
    big.className = 'big'; sub.className = 'sub'; sub.textContent = 'Tuy hơi sớm nhưng mà\nCHÚC MỪNG SINH NHẬT CÔ ẠAAAA💖';
    [...'Happy Birthday!'].forEach((ch, i) => { const sp = document.createElement('span'); sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.animationDelay = i * .07 + 's'; sp.style.color = LET[i % 5]; big.append(sp); });
    hbt.append(big, sub); celebrate();
    blow.textContent = 'Thắp nến lại 🕯️'; blow.disabled = false;
  }, 1300));
}
function cakeOpen() {
  if (!au.paused) au.pause();                                        /* tạm dừng nhạc nền để nghe bản Happy Birthday */
  cakeReset(); $('#cd').textContent = cakeDays(); cake.hidden = false; cfSize(); playBday();
}
function cakeClose() {
  cake.hidden = true; cakeReset(); stopBday();
  if (!bgmOff) play();                                               /* bật lại nhạc nền như cũ */
}
secret.onclick = cakeOpen; blow.onclick = blowOut; $('#cx').onclick = cakeClose;
addEventListener('keydown', e => { if (e.key === 'Escape' && !cake.hidden) cakeClose(); });
addEventListener('resize', () => { if (!cake.hidden) cfSize(); });

/* ---------- Nhạc riêng cho từng phần (file mp3 do bạn tự thêm vào assets/music/) ----------
   - memories.mp3 : phát khi bấm "Xem kỷ niệm", tắt khi đóng.
   - birthday.mp3 : phát khi mở phòng bánh bí mật.
   Muốn đổi tên file thì sửa 2 dòng ngay bên dưới. Chưa có file thì web tự dùng nhạc nền (kỷ niệm) / giai điệu tự tạo (sinh nhật). */
const MUSIC = { memories: 'assets/music/memories.mp3', birthday: 'assets/music/birthday.mp3' };

/* nhạc sinh nhật */
const bday = new Audio(MUSIC.birthday); bday.preload = 'none'; bday.volume = .85;
let bdayOK = true;                                                 /* file lỗi/không có → dùng giai điệu tự tạo */
function playBday() {
  stopBday();
  if (!bdayOK) { playTune(); return; }
  bday.currentTime = 0;
  bday.play().catch(() => { if (!cake.hidden) { bdayOK = false; playTune(); } });
}
function stopBday() { bday.pause(); stopTune(); }

/* nhạc phần kỷ niệm */
const mem = new Audio(MUSIC.memories); mem.loop = true; mem.preload = 'none'; mem.volume = .6;
let memDuck = false;                                               /* nhạc nền có đang bị tạm dừng nhường cho nhạc kỷ niệm không */
$('#galbtn').addEventListener('click', () => {
  mem.currentTime = 0;
  mem.play().then(() => { if (!au.paused) { au.pause(); memDuck = true; } }, () => {});   /* không có file → giữ nguyên nhạc nền */
});
new MutationObserver(() => {
  if (!gal.hidden) return;
  mem.pause();
  if (memDuck) { memDuck = false; if (!bgmOff) play(); }
}).observe(gal, { attributes: true, attributeFilter: ['hidden'] });

addEventListener('resize', seed);
seed(); requestAnimationFrame(frame);
preload().then(() => { setTimeout(rise, 300); setTimeout(rise, 1500); setTimeout(loop, 3200); discover(); });
})();
