(() => {
'use strict';
/* ẢNH: chạy file cap-nhat-anh.bat để tự tạo js/images.js từ MỌI ảnh trong assets/images/ (tên gì cũng được).
   Nếu chưa chạy, web thử các tên anh1.jpg ... anh40.jpg (ảnh thiếu sẽ tự bị bỏ qua). */
const LISTED = Array.isArray(window.IMAGE_LIST) && window.IMAGE_LIST.length > 0;
const IMAGES = LISTED ? window.IMAGE_LIST : Array.from({ length: 40 }, (_, i) => `assets/images/anh${i + 1}.jpg`);
const MAX_PHOTOS = 10, MAX_MOBILE = 5; /* số ảnh tối đa bay cùng lúc: máy tính / điện thoại */
const FORM = ['H₂O','CO₂','NaCl','CH₄','O₃','NH₃','C₆H₆','C₆H₁₂O₆','H₂SO₄','2H₂ + O₂ → 2H₂O'];

const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isM = () => innerWidth < 640;
let mode = 'gift', valid = [], opened = false, timers = [];

/* ---------- Ảnh bay từ dưới lên ---------- */
const layer = $('#rise');
const preload = () => LISTED ? Promise.resolve().then(() => { valid = IMAGES.slice(); }) : Promise.all(IMAGES.map(src => new Promise(ok => {
  const i = new Image(); i.onload = () => ok(src); i.onerror = () => ok(null); i.src = src;
}))).then(r => { valid = r.filter(Boolean); });

function rise() {
  const m = isM();
  if (document.hidden || layer.children.length >= (m ? MAX_MOBILE : MAX_PHOTOS)) return;
  const w = m ? rnd(66, 104) : rnd(110, 170), el = document.createElement('div');
  el.className = 'ph'; el.style.width = w + 'px';
  if (valid.length) { const im = new Image(), src = valid[Math.random() * valid.length | 0]; im.alt = ''; im.decoding = 'async'; im.onerror = () => { valid = valid.filter(v => v !== src); el.remove(); }; im.src = src; el.append(im); }
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
const showLb = i => { li = (i + valid.length) % valid.length; lbi.src = valid[li]; lb.hidden = false; };
$('#galbtn').onclick = () => {
  grid.textContent = '';
  if (!valid.length) grid.innerHTML = '<p class="none">Chưa có ảnh. Hãy bỏ ảnh vào thư mục assets/images/ nhé.</p>';
  valid.forEach((src, i) => {
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
$('#wishbtn').onclick = () => {
  wl.textContent = '';
  const box = document.createElement('div'); box.className = 'wc'; wl.append(box);
  if (!WISHES.length) { const n = document.createElement('p'); n.className = 'none'; n.textContent = 'Chưa có lời chúc nào. Hãy thêm vào file js/wishes.js nhé.'; box.append(n); }
  WISHES.forEach((w, i) => {
    const c = document.createElement('article'), t = document.createElement('p'), f = document.createElement('footer');
    c.className = 'w'; c.style.setProperty('--d', Math.min(i * .12, 1.5) + 's');
    t.textContent = w.text; f.textContent = '— ' + (w.name || 'Một bạn học sinh');
    c.append(t, f); box.append(c);
  });
  wl.scrollTop = 0; wsh.hidden = false;
};
$('#wx').onclick = () => { wsh.hidden = true; };
addEventListener('keydown', e => { if (e.key === 'Escape' && !wsh.hidden) wsh.hidden = true; });

addEventListener('resize', seed);
seed(); requestAnimationFrame(frame);
preload().then(() => { setTimeout(rise, 300); setTimeout(rise, 1500); setTimeout(loop, 3200); });
})();
