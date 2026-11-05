(() => {
'use strict';
/* THÊM ẢNH MỚI: chép ảnh vào assets/images/ rồi thêm đường dẫn vào mảng này.
   Ảnh nào không tồn tại sẽ tự động bị bỏ qua; nếu chưa có ảnh nào, web hiển thị khung mẫu. */
const IMAGES = ['assets/images/anh1.jpg','assets/images/anh2.jpg','assets/images/anh3.jpg','assets/images/anh4.jpg','assets/images/anh5.jpg','assets/images/anh6.jpg','assets/images/anh7.jpg','assets/images/anh8.jpg','assets/images/anh9.jpg','assets/images/anh10.jpg'];
const MAX_PHOTOS = 10, MAX_MOBILE = 5; /* số ảnh tối đa bay cùng lúc: máy tính / điện thoại */
const FORM = ['H₂O','CO₂','NaCl','CH₄','O₃','NH₃','C₆H₆','C₆H₁₂O₆','H₂SO₄','2H₂ + O₂ → 2H₂O'];

const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isM = () => innerWidth < 640;
let mode = 'gift', valid = [], opened = false, timers = [];

/* ---------- Ảnh bay từ dưới lên ---------- */
const layer = $('#rise');
const preload = () => Promise.all(IMAGES.map(src => new Promise(ok => {
  const i = new Image(); i.onload = () => ok(src); i.onerror = () => ok(null); i.src = src;
}))).then(r => { valid = r.filter(Boolean); });

function rise() {
  const m = isM();
  if (document.hidden || layer.children.length >= (m ? MAX_MOBILE : MAX_PHOTOS)) return;
  const w = m ? rnd(66, 104) : rnd(110, 170), el = document.createElement('div');
  el.className = 'ph'; el.style.width = w + 'px';
  if (valid.length) { const im = new Image(); im.alt = ''; im.src = valid[Math.random() * valid.length | 0]; el.append(im); }
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
}
const burst = (x, y) => { if (!reduce) for (let i = 0; i < 40; i++) ps.push(petal(x * D, y * D, true)); };
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min((t - last) / 1000, .05); last = t;
  if (document.hidden) return;
  cx.clearRect(0, 0, W, H);
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

/* ---------- Chuyển màn hình & lời chúc ---------- */
const items = [...document.querySelectorAll('.rv')], env = $('#env');
const stop = () => { timers.forEach(clearTimeout); timers = []; };
const go = id => { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === id)); mode = id === 's2' ? 'card' : 'gift'; };
function reveal() {
  stop(); items.forEach(e => e.classList.remove('show')); $('.body').scrollTop = 0;
  let d = 1500;
  items.forEach(e => {
    timers.push(setTimeout(() => { e.classList.add('show'); e.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, d));
    d += 700 + e.textContent.length * 12;
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

addEventListener('resize', seed);
seed(); requestAnimationFrame(frame);
preload().then(() => { setTimeout(rise, 300); setTimeout(rise, 1500); setTimeout(loop, 3200); });
})();
