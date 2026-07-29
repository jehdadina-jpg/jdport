// ═══════════════════════════════════════════════════
// PORTFOLIO INTERACTIVE ENGINE — ALL 10 FEATURES
// ═══════════════════════════════════════════════════

const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');
const sectionNames = ['Home', 'Experience', 'Skills', 'Projects', 'Contact'];
let currentSectionIndex = 0;
let isScrolling = false;

// ─────────────────────────────────────────────────
// NAV DOTS + SCROLL TRACKING
// ─────────────────────────────────────────────────
function goTo(i) {
  if (isScrolling) return;
  isScrolling = true;
  currentSectionIndex = i;
  
  // Update dots
  dots.forEach((d, j) => d.classList.toggle('active', i === j));
  
  // Smooth scroll
  sections[i].scrollIntoView({ behavior: 'smooth' });
  
  updateNavbar(i);
  updateNavButtons(i);
  
  setTimeout(() => { isScrolling = false; }, 850);
}

// ── NAVIGATION CONTROLS (Manual Only) ──
function goUp() {
  if (currentSectionIndex > 0) goTo(currentSectionIndex - 1);
}

function goDown() {
  if (currentSectionIndex < sections.length - 1) goTo(currentSectionIndex + 1);
}

const navUpBtn = document.getElementById('nav-up');
const navDownBtn = document.getElementById('nav-down');

function updateNavButtons(idx) {
  if (navUpBtn) navUpBtn.disabled = (idx === 0);
  if (navDownBtn) navDownBtn.disabled = (idx === sections.length - 1);
}

// Initial state
updateNavButtons(0);

// Lock global wheel scroll from changing sections
window.addEventListener('wheel', (e) => {
  if (!e.target.closest('.timeline-content') &&
      !e.target.closest('.tech-content') &&
      !e.target.closest('.projects-content') &&
      !e.target.closest('.contact-content')) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!e.target.closest('.timeline-content') &&
      !e.target.closest('.tech-content') &&
      !e.target.closest('.projects-content') &&
      !e.target.closest('.contact-content')) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(e.key)) {
    e.preventDefault();
    if (isScrolling) return;
    if (['ArrowDown', 'PageDown'].includes(e.key)) goDown();
    if (['ArrowUp', 'PageUp'].includes(e.key)) goUp();
  }
}, { passive: false });

const obs = new IntersectionObserver(entries => {
  if (isScrolling) return;
  entries.forEach(e => {
    if (e.isIntersecting) {
      const i = [...sections].indexOf(e.target);
      currentSectionIndex = i;
      dots.forEach((d, j) => d.classList.toggle('active', i === j));
      updateNavbar(i);
    }
  });
}, { threshold: .5 });
sections.forEach(s => obs.observe(s));

// ─────────────────────────────────────────────────
// FEATURE 10: STICKY NAVBAR MORPH
// ─────────────────────────────────────────────────
const topNav = document.getElementById('top-nav');
const navSectionName = document.getElementById('nav-section-name');
const navLinks = document.querySelectorAll('.nav-links-bar a');

function updateNavbar(idx) {
  topNav.classList.toggle('scrolled', idx > 0);
  navSectionName.textContent = sectionNames[idx] || '';
  navLinks.forEach((a, j) => a.classList.toggle('active', j === idx));
}

// ─────────────────────────────────────────────────
// FEATURE 1: BLUR TEXT REVEAL
// ─────────────────────────────────────────────────
document.querySelectorAll('.blur-line').forEach(line => {
  const text = line.dataset.text;
  line.innerHTML = '';
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'blur-char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    line.appendChild(span);
    setTimeout(() => span.classList.add('revealed'), 400 + i * 80);
  });
});

// ─────────────────────────────────────────────────
// FEATURE 4: TYPEWRITER CYCLING ROLES
// ─────────────────────────────────────────────────
(function () {
  const el = document.getElementById('typewriter-el');
  if (!el) return;
  const phrases = [
    'Code. Create. Repeat.',
    'From concept to commit.',
    'Engineering ideas into reality.',
    'Minimal talk. Maximum output.',
  ];
  let phraseIdx = 0, charIdx = 0, isDeleting = false;
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  function type() {
    const current = phrases[phraseIdx];
    if (!isDeleting) {
      el.textContent = current.slice(0, charIdx + 1);
      el.appendChild(cursor);
      charIdx++;
      if (charIdx === current.length) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 60 + Math.random() * 40);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      el.appendChild(cursor);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 30);
    }
  }
  setTimeout(type, 1200);
})();

// ─────────────────────────────────────────────────
// FEATURE 5: MAGNETIC 3D TILT ON TILTED CARD
// ─────────────────────────────────────────────────
(function () {
  const figure = document.getElementById('tilted-card');
  if (!figure) return;
  const inner = figure.querySelector('.tilted-card-inner');
  const caption = figure.querySelector('.tilted-card-caption');

  let rotateAmplitude = 12;
  let scaleOnHover = 1.05;
  let lastY = 0;

  figure.addEventListener('mousemove', e => {
    const rect = figure.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    inner.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scaleOnHover})`;

    const targetCaptionX = e.clientX - rect.left;
    const targetCaptionY = e.clientY - rect.top;

    const velocityY = offsetY - lastY;
    let rotateFigcaption = -velocityY * 0.6;
    rotateFigcaption = Math.max(-15, Math.min(15, rotateFigcaption));

    caption.style.transform = `translate(calc(-50% + ${targetCaptionX}px), calc(-50% + ${targetCaptionY}px)) rotate(${rotateFigcaption}deg)`;

    lastY = offsetY;
  });

  figure.addEventListener('mouseenter', () => {
    inner.style.transition = 'transform 0.1s ease-out';
    caption.style.opacity = '1';
    caption.style.transition = 'opacity 0.2s ease-out';
  });

  figure.addEventListener('mouseleave', () => {
    inner.style.transition = 'transform 0.5s ease-out';
    inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    caption.style.opacity = '0';
    caption.style.transition = 'opacity 0.2s ease-out';
    caption.style.transform = 'translate(-50%, -50%) rotate(0deg)';
  });
})();

// ─────────────────────────────────────────────────
// FEATURE 6: TIMELINE SLIDE-IN ON SCROLL
// ─────────────────────────────────────────────────
const tlObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.2 });
document.querySelectorAll('.tl-item').forEach(el => tlObs.observe(el));

// Allow internal scrolling inside the experience box
const tlContent = document.querySelector('.timeline-content');
if (tlContent) {
  tlContent.addEventListener('wheel', (e) => {
    // Unconditionally stop propagation to prevent outer slide navigation
    // This creates a "scroll lock" inside the box
    e.stopPropagation();
  }, { passive: false });
}

// ─────────────────────────────────────────────────
// FEATURE 7: SCRAMBLE TEXT ON SECTION HEADINGS
// ─────────────────────────────────────────────────
(function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  const scrambleEls = document.querySelectorAll('[data-scramble]');

  function scramble(el) {
    const target = el.dataset.scramble;
    let iteration = 0;
    const interval = setInterval(() => {
      el.textContent = target
        .split('')
        .map((ch, i) => {
          if (i < iteration) return target[i];
          if (ch === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      iteration += 1 / 2;
      if (iteration >= target.length) {
        clearInterval(interval);
        el.textContent = target;
      }
    }, 30);
  }

  const scrambleObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        scramble(e.target);
        scrambleObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  scrambleEls.forEach(el => scrambleObs.observe(el));
})();

// ─────────────────────────────────────────────────
// FEATURE 2: SPOTLIGHT CURSOR ON PROJECTS
// ─────────────────────────────────────────────────
(function () {
  const page4 = document.getElementById('page4');
  const overlay = document.getElementById('spotlight-overlay');
  if (!page4 || !overlay) return;
  page4.addEventListener('mousemove', e => {
    const r = page4.getBoundingClientRect();
    overlay.style.setProperty('--sx', `${e.clientX - r.left}px`);
    overlay.style.setProperty('--sy', `${e.clientY - r.top}px`);
  });
})();

// ─────────────────────────────────────────────────
// FEATURE 3: ANIMATED COUNTER STATS
// ─────────────────────────────────────────────────
(function () {
  const bar = document.getElementById('stats-bar');
  if (!bar) return;
  let counted = false;
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !counted) {
        counted = true;
        document.querySelectorAll('.stat-num').forEach(num => {
          const target = parseInt(num.dataset.target);
          const suffix = num.dataset.suffix || '';
          const duration = 1500;
          const start = performance.now();
          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            num.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else num.textContent = target + suffix;
          }
          requestAnimationFrame(tick);
        });
      }
    });
  }, { threshold: 0.3 });
  statsObs.observe(bar);
})();

// ─────────────────────────────────────────────────
// BORDER GLOW mouse tracking
// ─────────────────────────────────────────────────
document.querySelectorAll('.glow-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ─────────────────────────────────────────────────
// PARTICLES BACKGROUND (Page 1)
// ─────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', () => { resize(); init(); });
  const NUM = 120;
  function Particle() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - .5) * .4; this.vy = (Math.random() - .5) * .4;
    this.r = Math.random() * 1.5 + .5;
    this.life = Math.random(); this.speed = .003 + Math.random() * .003;
  }
  function init() { particles = []; for (let i = 0; i < NUM; i++) particles.push(new Particle()); }
  init();
  const LINK = 120;
  let isActive = false;
  function draw() {
    if (!isActive) return;
    ctx.clearRect(0, 0, W, H);
    // ... existing particle drawing logic
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life += p.speed;
      const a = Math.sin(p.life) * 0.7 + 0.3;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(77,159,255,${a * .8})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(77,159,255,${(1 - dist / LINK) * .2})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('canvas-toggle-hero', (e) => {
    isActive = e.detail.active;
    if (isActive) draw();
  });
})();

// ─────────────────────────────────────────────────
// GALAXY BACKGROUND (Page 2)
// ─────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('galaxy-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', () => { resize(); initGalaxy(); });
  const NUM = 700;
  function Star() {
    this.angle = Math.random() * Math.PI * 2;
    this.r = Math.pow(Math.random(), .4) * (Math.min(W, H) * .45);
    this.x = W / 2 + Math.cos(this.angle) * this.r;
    this.y = H / 2 + Math.sin(this.angle) * this.r * .55;
    this.size = Math.random() * 1.8 + .2;
    const t = Math.random();
    const r2 = Math.round(50 + t * 200), g2 = Math.round(100 + t * 155), b2 = 255;
    this.color = `rgba(${r2},${g2},${b2},`;
    this.speed = .0002 + Math.random() * .0004;
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = .02 + Math.random() * .03;
  }
  function initGalaxy() { stars = []; for (let i = 0; i < NUM; i++) stars.push(new Star()); }
  initGalaxy();
  let t = 0;
  let isActive = false;
  function drawGalaxy() {
    if (!isActive) return;
    t += .005;
    ctx.fillStyle = 'rgba(3,5,15,.15)'; ctx.fillRect(0, 0, W, H);
    stars.forEach(s => {
      s.angle += s.speed;
      s.x = W / 2 + Math.cos(s.angle) * s.r;
      s.y = H / 2 + Math.sin(s.angle) * s.r * .55;
      s.twinkle += s.twinkleSpeed;
      const a = .4 + Math.sin(s.twinkle) * .4;
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
      grd.addColorStop(0, s.color + a + ')');
      grd.addColorStop(1, s.color + '0)');
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
    });
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * .22);
    grd.addColorStop(0, 'rgba(40,80,200,.06)'); grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    requestAnimationFrame(drawGalaxy);
  }

  window.addEventListener('canvas-toggle-galaxy', (e) => {
    isActive = e.detail.active;
    if (isActive) drawGalaxy();
  });
})();

// ─────────────────────────────────────────────────
// LETTER GLITCH BACKGROUND (Page 3)
// ─────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('glitch-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, cols, rows, cells = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>/\\[]{}';
  const SIZE = 22;
  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cols = Math.ceil(W / SIZE) + 1; rows = Math.ceil(H / SIZE) + 1;
    cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      cells.push({
        x: c * SIZE, y: r * SIZE,
        char: chars[Math.floor(Math.random() * chars.length)],
        opacity: Math.random() * .08 + .01,
        timer: Math.floor(Math.random() * 80),
        interval: 20 + Math.floor(Math.random() * 120)
      });
    }
  }
  resize(); window.addEventListener('resize', resize);
  let isActive = false;
  function drawGlitch() {
    if (!isActive) return;
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${SIZE * .8}px 'Space Mono',monospace`;
    cells.forEach(cell => {
      cell.timer--;
      if (cell.timer <= 0) {
        cell.char = chars[Math.floor(Math.random() * chars.length)];
        cell.timer = cell.interval;
        if (Math.random() < .01) cell.opacity = Math.random() * .25 + .1;
        else cell.opacity = Math.random() * .07 + .01;
      }
      ctx.fillStyle = `rgba(77,159,255,${cell.opacity})`;
      ctx.fillText(cell.char, cell.x, cell.y + SIZE * .8);
    });
    requestAnimationFrame(drawGlitch);
  }

  window.addEventListener('canvas-toggle-glitch', (e) => {
    isActive = e.detail.active;
    if (isActive) drawGlitch();
  });
})();

// ─────────────────────────────────────────────────
// TECH STACK ICONS (SVG inline)
// ─────────────────────────────────────────────────
const techData = {
  frontend: [
    { name: 'React', svg: `<svg viewBox="0 0 24 24" fill="#61DAFB"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1.2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1.2" transform="rotate(120 12 12)"/></svg>` },
    { name: 'Next.js', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.859 8.292 8.208 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747C23.027 4.165 19.82.379 15.472.074c-.274-.02-.53-.026-1.2-.02-.415.003-.79.01-.914.016a19.888 19.888 0 00-.357.024L11.572 0z"/></svg>` },
    { name: 'TypeScript', svg: `<svg viewBox="0 0 24 24" fill="#3178C6"><path d="M0 12v12h24V0H0zm19.341-.956c.61.152 1.074.423 1.501.865.221.236.549.666.575.77.008.03-1.036.73-1.668 1.123-.023.015-.115-.084-.217-.236-.31-.45-.633-.644-1.128-.678-.728-.05-1.196.331-1.192.967a.88.88 0 00.102.45c.16.331.458.53 1.39.933 1.719.74 2.454 1.227 2.911 1.92.51.773.625 2.008.278 2.926-.38.998-1.325 1.676-2.655 1.9-.411.073-1.386.062-1.828-.018-.964-.172-1.878-.648-2.442-1.273-.221-.243-.652-.88-.625-.925.011-.016.11-.077.22-.141.108-.061.511-.294.892-.515l.69-.4.145.214c.202.308.643.731.91.872.766.404 1.817.347 2.335-.118a.883.883 0 00.313-.72c0-.278-.035-.4-.18-.61-.186-.266-.567-.49-1.649-.96-1.238-.533-1.771-.864-2.259-1.39a3.165 3.165 0 01-.659-1.2c-.091-.339-.114-1.189-.042-1.531.255-1.197 1.158-2.03 2.461-2.278.423-.08 1.406-.05 1.821.053zm-5.634 1.002l.008.983H10.59v8.876H8.38v-8.876H5.258v-.964c0-.534.011-.98.026-.99.012-.016 1.913-.024 4.217-.02l4.195.012z"/></svg>` },
    { name: 'Vite', svg: `<svg viewBox="0 0 24 24" fill="#646CFF"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>` },
    { name: 'Tailwind', svg: `<svg viewBox="0 0 24 24" fill="#06B6D4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>` },
    { name: 'JavaScript', svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#F7DF1E" rx="2"/><path fill="#000" d="M6.235 5.396v9.56c0 2.16-.716 3.14-2.044 3.14-.607 0-1.214-.226-1.62-.524l-.505 1.564c.555.396 1.417.657 2.35.657 2.57 0 3.896-1.597 3.896-4.56V5.396H6.235zm8.43 9.056c0-1.89-1.116-3.01-2.614-3.665l-.97-.437c-.97-.447-1.372-.895-1.372-1.745 0-.715.52-1.24 1.372-1.24.836 0 1.356.447 1.785 1.24l1.372-.895c-.656-1.24-1.613-1.88-3.157-1.88-1.865 0-3.156 1.24-3.156 3.01 0 1.79.97 2.835 2.614 3.57l.97.447c1.01.465 1.46.97 1.46 1.88 0 .894-.67 1.49-1.78 1.49-.99 0-1.76-.555-2.205-1.49l-1.46.88c.64 1.46 1.83 2.28 3.69 2.28 2.06 0 3.45-1.24 3.45-3.45z"/></svg>` },
    { name: 'HTML5', svg: `<svg viewBox="0 0 24 24" fill="#E34F26"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>` },
  ],
  backend: [
    { name: 'Node.js', svg: `<svg viewBox="0 0 24 24" fill="#339933"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.249 1.327-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.198.045.277 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.052-.19-.137-.241l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.087.05-.141.144-.141.242v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.111.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.943-.922-1.604V6.921c0-.661.352-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.942.924 1.603v10.15c0 .661-.354 1.275-.924 1.604l-8.794 5.078c-.282.163-.602.247-.925.247"/></svg>` },
    { name: 'Supabase', svg: `<svg viewBox="0 0 24 24" fill="#3ECF8E"><path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.33 12.59.72 13.39 1.409 13.39h9.174a.972.972 0 01.972.972L12.1 22.964c.015.986 1.26 1.41 1.874.637l9.262-11.653c.434-.54.044-1.34-.645-1.34h-9.12a.972.972 0 01-.972-.972l-.598-8.6z"/></svg>` },
    { name: 'Python', svg: `<svg viewBox="0 0 24 24" fill="#3776AB"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.79zm-.96 4.54l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/></svg>` },
    { name: 'Claude API', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D97706" stroke-width="1.5"/><path d="M8 12s1.5-3 4-3 4 3 4 3-1.5 3-4 3-4-3-4-3z" stroke="#D97706" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="2" fill="#D97706"/></svg>` },
    { name: 'Hugging Face', svg: `<svg viewBox="0 0 24 24" fill="#FFD21E"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-4.5 3.5s1 2 3 2 3-2 3-2H9z"/></svg>` },
    { name: 'Flask', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M15.01 1.54l.49 1.38c-1.56.43-3.36 1.22-4.47 2.24-.44.4-.71.8-.79 1.14-.08.36.04.68.44.95.83.56 2.44.81 4.37.72l.56 1.58c-2.24.26-4.39.05-5.66-.8-1.16-.77-1.5-1.94-1.08-3.15.4-1.17 1.52-2.29 3.05-3.16.94-.54 2.05-.73 3.09-.9zm-3.61 7.47c-.62.34-1.2.64-1.8.87-.6.22-1.11.28-1.47.16-.89-.32-1.06-1.24-.9-2.14.07-.38.21-.78.42-1.14l1.26.58c-.09.16-.16.32-.2.48-.12.55.05.91.34.97.23.04.58-.06.97-.23.4-.17.84-.43 1.28-.69l.1 1.14zM10.5 12c0 .83-.67 1.5-1.5 1.5S7.5 12.83 7.5 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm1 2.5c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zM8 18l8 3H8l-6-3h6zm0 0V10l6 3v5H8z"/></svg>` },
    { name: 'OpenAI', svg: `<svg viewBox="0 0 24 24" fill="#74AA9C"><path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.896zm16.597 3.855l-5.833-3.387 2.019-1.168a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.411-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>` },
    { name: 'PostgreSQL', svg: `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="#4169E1" stroke-width="1.5"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="#4169E1" stroke-width="1.5"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" stroke="#4169E1" stroke-width="1.5"/></svg>` },
  ],


  data: [
    { name: 'Chart.js', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FF6384" stroke-width="1.5"/><path d="M12 12L8 8m4 4l4-4m-4 4v5" stroke="#FF6384" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { name: 'D3.js', svg: `<svg viewBox="0 0 24 24" fill="#F9A03C"><path d="M5 3h6v2H5zM5 7h8v2H5zm0 4h8v2H5zm0 4h6v2H5zm10-12l4 4-4 4V3zm0 10l4 4-4 4v-8z"/></svg>` },
    { name: 'Three.js', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M5.28 21L2 3l7.14 2.57L21 2l-2.57 7.14L21 21l-7.14-2.57L5.28 21zM7.93 18.29l3.5-1.26 3.5 1.26-1.26-3.5 1.26-3.5-3.5 1.26-3.5-1.26 1.26 3.5-1.26 3.5z"/></svg>` },
    { name: 'Pandas', svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="4" height="7" rx="1" fill="#E70488"/><rect x="3" y="14" width="4" height="7" rx="1" fill="#E70488"/><rect x="10" y="8" width="4" height="8" rx="1" fill="#150458" stroke="#E70488" stroke-width="1"/><rect x="17" y="3" width="4" height="7" rx="1" fill="#E70488"/><rect x="17" y="14" width="4" height="7" rx="1" fill="#E70488"/></svg>` },
    { name: 'scikit-learn', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F7931E" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="#F7931E" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { name: 'Figma', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF"/><path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE"/></svg>` },
    { name: 'Git', svg: `<svg viewBox="0 0 24 24" fill="#F05032"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/></svg>` },
    { name: 'C++', svg: `<svg viewBox="0 0 24 24" fill="#00599C"><path d="M22.394 6c-.167-.29-.38-.543-.593-.77L15.19 1.247a2 2 0 00-2 0L6.804 5.155c-.208.188-.42.382-.596.616v.04L6.2 5.826a2 2 0 00-.392 1.177v8.7c0 .44.162.883.392 1.177l.005.008c.167.29.38.542.593.77L13.807 21.75a2 2 0 002 0l6.386-3.907c.208-.188.42-.383.596-.617l.005-.007c.23-.295.392-.738.392-1.178V7.003A2 2 0 0022.394 6zm-7.394 10h-2v-2h2v2zm0-4h-2v-2h2v2zm3 4h-1v-2h-1v2h-1v-5h3v5zm3 0h-1v-2h-1v2h-1v-5h3v5z"/></svg>` },
  ]
};

function renderTech(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(t => `
    <div class="tech-item">
      <div class="tech-icon">${t.svg}</div>
      <div class="tech-name">${t.name}</div>
    </div>
  `).join('');
}
renderTech('tech-frontend', techData.frontend);
renderTech('tech-backend', techData.backend);
renderTech('tech-data', techData.data);

/* ══════════════════════════════════════
   FEATURE 9: SHAPE GRID CONTACT BACKGROUND
══════════════════════════════════════ */
function initShapeGrid() {
  const canvas = document.getElementById('shapegrid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const direction = 'diagonal';
  const speed = 0.5;
  const borderColor = '#271E37';
  const hoverFillColor = '#222222';
  const squareSize = 40;
  const shape = 'square';
  const hoverTrailAmount = 0;

  let requestRef = null;
  let gridOffset = { x: 0, y: 0 };
  let hoveredSquare = null;
  let trailCells = [];
  let cellOpacities = new Map();

  const isHex = shape === 'hexagon';
  const isTri = shape === 'triangle';
  const hexHoriz = squareSize * 1.5;
  const hexVert = squareSize * Math.sqrt(3);

  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const drawHex = (cx, cy, size) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const vx = cx + size * Math.cos(angle);
      const vy = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
  };

  const drawCircle = (cx, cy, size) => {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.closePath();
  };

  const drawTriangle = (cx, cy, size, flip) => {
    ctx.beginPath();
    if (flip) {
      ctx.moveTo(cx, cy + size / 2);
      ctx.lineTo(cx + size / 2, cy - size / 2);
      ctx.lineTo(cx - size / 2, cy - size / 2);
    } else {
      ctx.moveTo(cx, cy - size / 2);
      ctx.lineTo(cx + size / 2, cy + size / 2);
      ctx.lineTo(cx - size / 2, cy + size / 2);
    }
    ctx.closePath();
  };

  const drawGrid = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isHex) {
      const colShift = Math.floor(gridOffset.x / hexHoriz);
      const offsetX = ((gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
      const offsetY = ((gridOffset.y % hexVert) + hexVert) % hexVert;
      const cols = Math.ceil(canvas.width / hexHoriz) + 3;
      const rows = Math.ceil(canvas.height / hexVert) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * hexHoriz + offsetX;
          const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;
          const cellKey = `${col},${row}`;
          const alpha = cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            drawHex(cx, cy, squareSize);
            ctx.fillStyle = hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          drawHex(cx, cy, squareSize);
          ctx.strokeStyle = borderColor;
          ctx.stroke();
        }
      }
    } else if (isTri) {
      const halfW = squareSize / 2;
      const colShift = Math.floor(gridOffset.x / halfW);
      const rowShift = Math.floor(gridOffset.y / squareSize);
      const offsetX = ((gridOffset.x % halfW) + halfW) % halfW;
      const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(canvas.width / halfW) + 4;
      const rows = Math.ceil(canvas.height / squareSize) + 4;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * halfW + offsetX;
          const cy = row * squareSize + squareSize / 2 + offsetY;
          const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;
          const cellKey = `${col},${row}`;
          const alpha = cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            drawTriangle(cx, cy, squareSize, flip);
            ctx.fillStyle = hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          drawTriangle(cx, cy, squareSize, flip);
          ctx.strokeStyle = borderColor;
          ctx.stroke();
        }
      }
    } else if (shape === 'circle') {
      const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const cx = col * squareSize + squareSize / 2 + offsetX;
          const cy = row * squareSize + squareSize / 2 + offsetY;
          const cellKey = `${col},${row}`;
          const alpha = cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            drawCircle(cx, cy, squareSize);
            ctx.fillStyle = hoverFillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          drawCircle(cx, cy, squareSize);
          ctx.strokeStyle = borderColor;
          ctx.stroke();
        }
      }
    } else {
      const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * squareSize + offsetX;
          const sy = row * squareSize + offsetY;
          const cellKey = `${col},${row}`;
          const alpha = cellOpacities.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }
    }

    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  let isActive = false;
  const updateAnimation = () => {
    if (!isActive) return;
    const effectiveSpeed = Math.max(speed, 0.1);
    const wrapX = isHex ? hexHoriz * 2 : squareSize;
    const wrapY = isHex ? hexVert : isTri ? squareSize * 2 : squareSize;

    switch (direction) {
      case 'right': gridOffset.x = (gridOffset.x - effectiveSpeed + wrapX) % wrapX; break;
      case 'left': gridOffset.x = (gridOffset.x + effectiveSpeed + wrapX) % wrapX; break;
      case 'up': gridOffset.y = (gridOffset.y + effectiveSpeed + wrapY) % wrapY; break;
      case 'down': gridOffset.y = (gridOffset.y - effectiveSpeed + wrapY) % wrapY; break;
      case 'diagonal':
        gridOffset.x = (gridOffset.x - effectiveSpeed + wrapX) % wrapX;
        gridOffset.y = (gridOffset.y - effectiveSpeed + wrapY) % wrapY;
        break;
    }

    updateCellOpacities();
    drawGrid();
    requestRef = requestAnimationFrame(updateAnimation);
  };

  const updateCellOpacities = () => {
    const targets = new Map();
    if (hoveredSquare) targets.set(`${hoveredSquare.x},${hoveredSquare.y}`, 1);
    if (hoverTrailAmount > 0) {
      for (let i = 0; i < trailCells.length; i++) {
        const t = trailCells[i];
        const key = `${t.x},${t.y}`;
        if (!targets.has(key)) targets.set(key, (trailCells.length - i) / (trailCells.length + 1));
      }
    }
    for (const [key] of targets) if (!cellOpacities.has(key)) cellOpacities.set(key, 0);
    for (const [key, opacity] of cellOpacities) {
      const target = targets.get(key) || 0;
      const next = opacity + (target - opacity) * 0.15;
      if (next < 0.005) cellOpacities.delete(key);
      else cellOpacities.set(key, next);
    }
  };

  const handleMouseMove = event => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let col, row;
    if (isHex) {
      const colShift = Math.floor(gridOffset.x / hexHoriz);
      const offsetX = ((gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
      const offsetY = ((gridOffset.y % hexVert) + hexVert) % hexVert;
      col = Math.round((mouseX - offsetX) / hexHoriz);
      const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
      row = Math.round((mouseY - offsetY - rowOffset) / hexVert);
    } else if (isTri) {
      const halfW = squareSize / 2;
      const offsetX = ((gridOffset.x % halfW) + halfW) % halfW;
      const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
      col = Math.round((mouseX - offsetX) / halfW);
      row = Math.floor((mouseY - offsetY) / squareSize);
    } else {
      const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
      col = Math.floor((mouseX - offsetX) / squareSize);
      row = Math.floor((mouseY - offsetY) / squareSize);
    }

    if (!hoveredSquare || hoveredSquare.x !== col || hoveredSquare.y !== row) {
      if (hoveredSquare && hoverTrailAmount > 0) {
        trailCells.unshift({ ...hoveredSquare });
        if (trailCells.length > hoverTrailAmount) trailCells.length = hoverTrailAmount;
      }
      hoveredSquare = { x: col, y: row };
    }
  };

  const handleMouseLeave = () => {
    if (hoveredSquare && hoverTrailAmount > 0) {
      trailCells.unshift({ ...hoveredSquare });
      if (trailCells.length > hoverTrailAmount) trailCells.length = hoverTrailAmount;
    }
    hoveredSquare = null;
  };

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  window.addEventListener('canvas-toggle-shapegrid', (e) => {
    isActive = e.detail.active;
    if (isActive) updateAnimation();
  });
}

initShapeGrid();

// ─────────────────────────────────────────────────
// GLOBAL CANVAS VISIBILITY OBSERVER
// ─────────────────────────────────────────────────
(function () {
  const canvasMap = [
    { id: 'page1', event: 'canvas-toggle-hero' },
    { id: 'page2', event: 'canvas-toggle-galaxy' },
    { id: 'page3', event: 'canvas-toggle-glitch' },
    { id: 'page5', event: 'canvas-toggle-shapegrid' }
  ];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const config = canvasMap.find(item => item.id === entry.target.id);
      if (config) {
        window.dispatchEvent(new CustomEvent(config.event, {
          detail: { active: entry.isIntersecting }
        }));
      }
    });
  }, { threshold: 0.1 });

  canvasMap.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) observer.observe(el);
  });
})();

// ─────────────────────────────────────────────────
// LIVE MUMBAI TIME
// ─────────────────────────────────────────────────
(function () {
  const timeEl = document.getElementById('mumbai-time');
  if (!timeEl) return;
  function updateTime() {
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    timeEl.textContent = formatter.format(new Date());
  }
  updateTime();
  setInterval(updateTime, 1000);
})();

// ─────────────────────────────────────────────────
// MOBILE NAVIGATION MENU
// ─────────────────────────────────────────────────
const mobileOverlay = document.getElementById('mobile-menu-overlay');
const hamburgerBtn = document.getElementById('hamburger-btn');

function toggleMobileMenu() {
  if (!mobileOverlay || !hamburgerBtn) return;
  const isOpen = mobileOverlay.classList.contains('active');
  if (isOpen) {
    closeMobileMenu();
  } else {
    mobileOverlay.classList.add('active');
    hamburgerBtn.classList.add('open');
  }
}

function closeMobileMenu() {
  if (!mobileOverlay || !hamburgerBtn) return;
  mobileOverlay.classList.remove('active');
  hamburgerBtn.classList.remove('open');
}