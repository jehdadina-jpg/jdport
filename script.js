// ═══════════════════════════════════════════════════
// PORTFOLIO ENGINE — Ethereal Glass edition
// ═══════════════════════════════════════════════════

const sections = document.querySelectorAll('.section');
const dots = document.querySelectorAll('.dot');
const sectionNames = ['Home', 'Experience', 'Stack', 'Work', 'Contact'];
const sectionSlugs = ['home', 'experience', 'skills', 'projects', 'contact'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let currentSectionIndex = 0;

// ─────────────────────────────────────────────────
// MOTION STACK — GSAP + ScrollTrigger + Lenis (all optional)
// ─────────────────────────────────────────────────
const hasGsap = !!(window.gsap && window.ScrollTrigger) && !reducedMotion;
let lenis = null;

if (hasGsap) {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('has-gsap');

  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

function lockScroll(locked) {
  document.body.classList.toggle('no-scroll', locked);
  if (lenis) locked ? lenis.stop() : lenis.start();
}

// ─────────────────────────────────────────────────
// SECTION NAVIGATION
// ─────────────────────────────────────────────────
let veilTimer = 0;
function goTo(i, opts) {
  opts = opts || {};
  if (!sections[i]) return;

  if (i !== currentSectionIndex && !opts.instant && !reducedMotion) {
    const veil = document.getElementById('page-veil');
    if (veil) {
      veil.classList.add('show');
      clearTimeout(veilTimer);
      veilTimer = setTimeout(() => veil.classList.remove('show'), 520);
    }
  }

  if (lenis) lenis.scrollTo(sections[i], { immediate: !!opts.instant, duration: 1.6, force: true });
  else sections[i].scrollIntoView({ behavior: opts.instant || reducedMotion ? 'auto' : 'smooth' });
  setActiveSection(i);

  if (!opts.skipHash && history.replaceState) {
    history.replaceState(null, '', '#' + sectionSlugs[i]);
  }

  const announcer = document.getElementById('a11y-announcer');
  if (announcer) announcer.textContent = sectionNames[i] + ' section';
}

function goUp() {
  if (currentSectionIndex > 0) goTo(currentSectionIndex - 1);
}

function goDown() {
  if (currentSectionIndex < sections.length - 1) goTo(currentSectionIndex + 1);
}

const topNav = document.getElementById('top-nav');
const navLinks = document.querySelectorAll('.nav-links-bar a');
const auras = document.querySelectorAll('.aura');
const navUpBtn = document.getElementById('nav-up');
const navDownBtn = document.getElementById('nav-down');

function setActiveSection(idx) {
  currentSectionIndex = idx;
  dots.forEach((d, j) => {
    d.classList.toggle('active', j === idx);
    d.setAttribute('aria-selected', j === idx ? 'true' : 'false');
  });
  navLinks.forEach((a, j) => a.classList.toggle('active', j === idx));
  auras.forEach((a, j) => a.classList.toggle('is-on', j === idx));
  if (navUpBtn) navUpBtn.disabled = idx === 0;
  if (navDownBtn) navDownBtn.disabled = idx === sections.length - 1;
  moveNavIndicator();
}

// Sliding pill behind the active nav link
const navIndicator = document.querySelector('.nav-indicator');
function moveNavIndicator() {
  const active = navLinks[currentSectionIndex];
  if (!navIndicator || !active || !active.offsetWidth) return;
  navIndicator.style.setProperty('--x', active.offsetLeft + 'px');
  navIndicator.style.setProperty('--w', active.offsetWidth + 'px');
}
window.addEventListener('resize', moveNavIndicator);
document.fonts?.ready.then(moveNavIndicator);
setActiveSection(0);

// Track the section crossing the middle of the viewport
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) setActiveSection([...sections].indexOf(e.target));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => sectionObs.observe(s));

// Nav island densifies once the hero copy is left behind
new IntersectionObserver(([e]) => {
  topNav.classList.toggle('scrolled', !e.isIntersecting);
}, { rootMargin: '-80px 0px 0px 0px', threshold: 0 }).observe(document.querySelector('.hero-copy'));

// ─────────────────────────────────────────────────
// KEYBOARD
// ─────────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
  const mod = e.metaKey || e.ctrlKey || e.altKey;

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCmdk();
    return;
  }

  if (e.key === 'Escape') {
    closeCmdk();
    closeShortcuts();
    closeSakiReveal();
    closeMobileMenu();
    return;
  }

  if (typing || mod) return;

  if (/^[1-5]$/.test(e.key)) goTo(parseInt(e.key, 10) - 1);
  else if (e.key === 'j') goDown();
  else if (e.key === 'k') goUp();
  else if (e.key === '?') toggleShortcuts();
});

// ─────────────────────────────────────────────────
// HERO — split-character mask reveal
// ─────────────────────────────────────────────────
document.querySelectorAll('.chars').forEach(el => {
  const text = el.dataset.text;
  el.textContent = '';
  el.style.setProperty('--n', text.length);
  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.style.setProperty('--ci', i);
    span.textContent = char;
    if (char === ' ') span.style.whiteSpace = 'pre';
    el.appendChild(span);
  });
});

// ─────────────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────────────
function startTypewriter() {
  const el = document.getElementById('typewriter-el');
  if (!el) return;
  const phrases = [
    'Code. Create. Repeat.',
    'From concept to commit.',
    'Engineering ideas into reality.',
    'Minimal talk. Maximum output.',
  ];
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  if (reducedMotion) {
    el.textContent = phrases[0];
    el.appendChild(cursor);
    return;
  }
  let phraseIdx = 0, charIdx = 0, isDeleting = false;

  function type() {
    const current = phrases[phraseIdx];
    charIdx += isDeleting ? -1 : 1;
    el.textContent = current.slice(0, charIdx);
    el.appendChild(cursor);

    if (!isDeleting && charIdx === current.length) {
      isDeleting = true;
      return setTimeout(type, 2200);
    }
    if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      return setTimeout(type, 450);
    }
    setTimeout(type, isDeleting ? 28 : 55 + Math.random() * 45);
  }
  type();
}

// ─────────────────────────────────────────────────
// SCROLL REVEALS (+ count-ups, bars, chart)
// ─────────────────────────────────────────────────
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  if (reducedMotion) { el.textContent = target.toFixed(decimals); return; }
  const duration = 1800;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = (eased * target).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function startReveals() {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

// Terminal-style decode: each glyph cycles through noise before locking to its real
// character, cascading left to right in sync with the existing rise/fade transform.
function scrambleChars(container, lineDelayMs) {
  if (reducedMotion) return;
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01$%';
  container.querySelectorAll('.ch').forEach((span, i) => {
    const final = span.textContent;
    if (!final || final === ' ') return;
    const w = span.getBoundingClientRect().width;
    span.style.width = w + 'px';
    span.style.textAlign = 'center';
    setTimeout(() => {
      let frame = 0;
      const total = 5 + ((Math.random() * 4) | 0);
      const iv = setInterval(() => {
        if (frame < total) {
          span.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          frame++;
        } else {
          clearInterval(iv);
          span.textContent = final;
          span.style.width = '';
          span.style.textAlign = '';
        }
      }, 35);
    }, (lineDelayMs || 0) + i * 45);
  });
}

let heroStarted = false;
function startHero() {
  if (heroStarted) return;
  heroStarted = true;
  document.getElementById('page1').classList.add('is-ready');
  document.querySelectorAll('.hero-name .mask-line .chars').forEach(chars => {
    scrambleChars(chars, chars.tagName === 'EM' ? 260 : 0);
  });
  startReveals();
  setTimeout(startTypewriter, 700);
}

// ─────────────────────────────────────────────────
// SPOTLIGHT TRACKING on bezel cards
// ─────────────────────────────────────────────────
if (canHover) {
  document.querySelectorAll('.spot').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// ─────────────────────────────────────────────────
// TECH STACK ICONS (SVG inline)
// ─────────────────────────────────────────────────
const techData = {
  frontend: [
    { name: 'React', svg: `<svg viewBox="0 0 24 24" fill="#61DAFB"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1.2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" stroke-width="1.2" transform="rotate(120 12 12)"/></svg>` },
    { name: 'Next.js', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.859 8.292 8.208 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747C23.027 4.165 19.82.379 15.472.074c-.274-.02-.53-.026-1.2-.02-.415.003-.79.01-.914.016a19.888 19.888 0 00-.357.024L11.572 0z"/></svg>` },
    { name: 'TypeScript', svg: `<svg viewBox="0 0 24 24" fill="#3178C6"><path d="M0 12v12h24V0H0zm19.341-.956c.61.152 1.074.423 1.501.865.221.236.549.666.575.77.008.03-1.036.73-1.668 1.123-.023.015-.115-.084-.217-.236-.31-.45-.633-.644-1.128-.678-.728-.05-1.196.331-1.192.967a.88.88 0 00.102.45c.16.331.458.53 1.39.933 1.719.74 2.454 1.227 2.911 1.92.51.773.625 2.008.278 2.926-.38.998-1.325 1.676-2.655 1.9-.411.073-1.386.062-1.828-.018-.964-.172-1.878-.648-2.442-1.273-.221-.243-.652-.88-.625-.925.011-.016.11-.077.22-.141.108-.061.511-.294.892-.515l.69-.4.145.214c.202.308.643.731.91.872.766.404 1.817.347 2.335-.118a.883.883 0 00.313-.72c0-.278-.035-.4-.18-.61-.186-.266-.567-.49-1.649-.96-1.238-.533-1.771-.864-2.259-1.39a3.165 3.165 0 01-.659-1.2c-.091-.339-.114-1.189-.042-1.531.255-1.197 1.158-2.03 2.461-2.278.423-.08 1.406-.05 1.821.053zm-5.634 1.002l.008.983H10.59v8.876H8.38v-8.876H5.258v-.964c0-.534.011-.98.026-.99.012-.016 1.913-.024 4.217-.02l4.195.012z"/></svg>` },
    { name: 'Vite', svg: `<svg viewBox="0 0 24 24" fill="#646CFF"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.760 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>` },
    { name: 'Tailwind', svg: `<svg viewBox="0 0 24 24" fill="#06B6D4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>` },
    { name: 'JavaScript', svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#F7DF1E" rx="2"/><path fill="#000" d="M6.235 5.396v9.56c0 2.16-.716 3.14-2.044 3.14-.607 0-1.214-.226-1.62-.524l-.505 1.564c.555.396 1.417.657 2.35.657 2.57 0 3.896-1.597 3.896-4.56V5.396H6.235zm8.43 9.056c0-1.89-1.116-3.01-2.614-3.665l-.97-.437c-.97-.447-1.372-.895-1.372-1.745 0-.715.52-1.24 1.372-1.24.836 0 1.356.447 1.785 1.24l1.372-.895c-.656-1.240-1.613-1.880-3.157-1.880-1.865 0-3.156 1.240-3.156 3.010 0 1.790.97 2.835 2.614 3.570l.97.447c1.010.465 1.460.970 1.460 1.880 0 .894-.670 1.490-1.780 1.490-.990 0-1.760-.555-2.205-1.490l-1.460.880c.640 1.460 1.830 2.280 3.690 2.280 2.060 0 3.450-1.240 3.450-3.450z"/></svg>` },
    { name: 'HTML5', svg: `<svg viewBox="0 0 24 24" fill="#E34F26"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>` },
    { name: 'CSS3', svg: `<svg viewBox="0 0 24 24" fill="#1572B6"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.05 4.41H5.45l.23 2.72h12.63l-.34 3.42H6.01l.23 2.71h11.45l-.38 3.82-5.31 1.43-5.3-1.43-.35-3.49H3.63l.49 5.95L12 21.65l7.88-2.11 1.08-15.13h-2.41z"/></svg>` },
    { name: 'shadcn/ui', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M14.5 3.5l6 6M9.5 20.5l-6-6M13.2 4.8L4.8 13.2M19.2 10.8l-8.4 8.4" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
    { name: 'Framer Motion', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 3h16v6H4v6h8l8 6H4v-6h8l-8-6V3z"/></svg>` }
  ],

  backend: [
    { name: 'Node.js', svg: `<svg viewBox="0 0 24 24" fill="#339933"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.249 1.327-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.198.045.277 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.052-.19-.137-.241l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68c-.087.05-.141.144-.141.242v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.111.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675c-.57-.329-.922-.943-.922-1.604V6.921c0-.661.352-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.942.924 1.603v10.15c0 .661-.354 1.275-.924 1.604l-8.794 5.078c-.282.163-.602.247-.925.247"/></svg>` },
    { name: 'Python', svg: `<svg viewBox="0 0 24 24" fill="#3776AB"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.79zm-.96 4.54l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/></svg>` },
    { name: 'FastAPI', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M13.1 2.5L5 13h6l-1.1 8.5L19 10h-6l.1-7.5z" fill="#009688"/></svg>` },
    { name: 'OpenAI API', svg: `<svg viewBox="0 0 24 24" fill="#74AA9C"><path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.950a4.5 4.5 0 01-6.140-1.646zM2.340 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.020 1.168a.076.076 0 01-.071 0l-4.830-2.786A4.504 4.504 0 012.340 7.896zm16.597 3.855l-5.833-3.387 2.019-1.168a.076.076 0 01.071 0l4.830 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.790.790 0 00-.411-.663zm2.010-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.230V6.897a.066.066 0 01.028-.061l4.830-2.787a4.5 4.5 0 016.680 4.660zm-12.640 4.135l-2.020-1.164a.080.080 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.080L8.704 5.460a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.500 2.607 1.500v2.999l-2.597 1.500-2.607-1.500z"/></svg>` },
    { name: 'Claude API', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D97706" stroke-width="1.5"/><path d="M8 12s1.5-3 4-3 4 3 4 3-1.5 3-4 3-4-3-4-3z" stroke="#D97706" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="#D97706"/></svg>` },
    { name: 'Transformers', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z" fill="#FFD21E"/><path d="M10 8h4M8 11v2m8-2v2M10 16h4" stroke="#111" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { name: 'XGBoost', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 5l6 6-6 8M9 5l6 6-6 8M15 5l6 6-6 8" stroke="#FF6600" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { name: 'LightGBM', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 20V4M5 20h15" stroke="#00A67D" stroke-width="1.8" stroke-linecap="round"/><path d="M7 17l3-5 3 2 5-8" stroke="#00A67D" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { name: 'PyTorch', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#EE4C2C" stroke-width="2"/><path d="M12 2v5M12 17v5M4.93 4.93l3.54 3.54M15.53 15.53l3.54 3.54M2 12h5M17 12h5M4.93 19.07l3.54-3.54M15.53 8.47l3.54-3.54" stroke="#EE4C2C" stroke-width="1.7" stroke-linecap="round"/></svg>` },
    { name: 'PostgreSQL', svg: `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="6" rx="8" ry="3" stroke="#4169E1" stroke-width="1.5"/><path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="#4169E1" stroke-width="1.5"/><path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" stroke="#4169E1" stroke-width="1.5"/></svg>` }
  ],

  data: [
    { name: 'Pandas', svg: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="4" height="7" rx="1" fill="#E70488"/><rect x="3" y="14" width="4" height="7" rx="1" fill="#E70488"/><rect x="10" y="8" width="4" height="8" rx="1" fill="#150458" stroke="#E70488" stroke-width="1"/><rect x="17" y="3" width="4" height="7" rx="1" fill="#E70488"/><rect x="17" y="14" width="4" height="7" rx="1" fill="#E70488"/></svg>` },
    { name: 'NumPy', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 5l7 4v10M19 19l-7-4V5M5 5l7-3 7 3" stroke="#4DABCF" stroke-width="2" stroke-linejoin="round"/><path d="M8 7v10M16 7v10" stroke="#4DABCF" stroke-width="1.5"/></svg>` },
    { name: 'scikit-learn', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F7931E" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="#F7931E" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { name: 'SciPy', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 17c3-8 5-8 8-1s5 7 8-5" stroke="#8CAAE6" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="5" cy="17" r="2" fill="#8CAAE6"/><circle cx="19" cy="11" r="2" fill="#8CAAE6"/></svg>` },
    { name: 'SHAP', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18L9 13l3 3 8-10" stroke="#FF4B4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 21h16" stroke="#FF4B4B" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { name: 'Recharts', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h17" stroke="#22C55E" stroke-width="1.6" stroke-linecap="round"/><path d="M7 15l3-5 3 3 5-7" stroke="#22C55E" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    { name: 'Chart.js', svg: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FF6384" stroke-width="1.5"/><path d="M12 12L8 8m4 4l4-4m-4 4v5" stroke="#FF6384" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { name: 'D3.js', svg: `<svg viewBox="0 0 24 24" fill="#F9A03C"><path d="M5 3h6v2H5zM5 7h8v2H5zm0 4h8v2H5zm0 4h6v2H5zm10-12l4 4-4 4V3zm0 10l4 4-4 4v-8z"/></svg>` },
    { name: 'Three.js', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M5.28 21L2 3l7.14 2.57L21 2l-2.57 7.14L21 21l-7.14-2.57L5.28 21zM7.93 18.29l3.5-1.26 3.5 1.26-1.26-3.5 1.26-3.5-3.5 1.26-3.5-1.26 1.26 3.5-1.26 3.5z"/></svg>` },
    { name: 'Figma', svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF"/><path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE"/></svg>` }
  ]
};

function renderTech(key, items) {
  const el = document.getElementById('tech-' + key);
  if (!el) return;
  el.innerHTML = items.map(t => `
    <div class="tech-item">
      <div class="tech-icon">${t.svg}</div>
      <div class="tech-name">${t.name}</div>
    </div>
  `).join('');
  const label = String(items.length).padStart(2, '0') + ' tools';
  const count = document.getElementById('count-' + key);
  if (count) count.textContent = label;
  document.querySelectorAll(`[data-count-mirror="${key}"]`).forEach(m => { m.textContent = label; });
}
renderTech('frontend', techData.frontend);
renderTech('backend', techData.backend);
renderTech('data', techData.data);

// ─────────────────────────────────────────────────
// LIVE MUMBAI TIME
// ─────────────────────────────────────────────────
(function () {
  const timeEl = document.getElementById('mumbai-time');
  if (!timeEl) return;
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  function updateTime() { timeEl.textContent = formatter.format(new Date()); }
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
  if (mobileOverlay.classList.contains('active')) {
    closeMobileMenu();
  } else {
    mobileOverlay.classList.add('active');
    hamburgerBtn.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
  }
}

function closeMobileMenu() {
  if (!mobileOverlay || !hamburgerBtn || !mobileOverlay.classList.contains('active')) return;
  mobileOverlay.classList.remove('active');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  lockScroll(false);
}

// ═══════════════════════════════════════════════════
// BOOT SEQUENCE → hands off to the hero reveal
// ═══════════════════════════════════════════════════
(function () {
  const screen = document.getElementById('boot-screen');
  const linesEl = document.getElementById('boot-lines');
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    window.removeEventListener('keydown', finish);
    window.removeEventListener('click', finish);
    if (screen) {
      screen.classList.add('hidden');
      setTimeout(() => screen.remove(), 1000);
    }
    lockScroll(false);
    setTimeout(startHero, reducedMotion ? 0 : 250);
  }

  if (!screen || !linesEl || reducedMotion) {
    finish();
    return;
  }

  lockScroll(true);
  const script = [
    { text: '> whoami', delay: 0 },
    { text: 'jeh_dadina', delay: 300, ok: true },
    { text: '> status --check', delay: 550 },
    { text: 'fintech systems ... online', delay: 850, ok: true },
    { text: 'ai/ml pipeline ... online', delay: 1050, ok: true },
    { text: '> launching portfolio', delay: 1300 },
  ];
  script.forEach(line => {
    setTimeout(() => {
      if (done) return;
      const div = document.createElement('div');
      div.className = 'boot-line' + (line.ok ? ' ok' : '');
      div.textContent = line.text;
      linesEl.appendChild(div);
    }, line.delay);
  });

  window.addEventListener('keydown', finish);
  window.addEventListener('click', finish);
  setTimeout(finish, 2100);
})();

// ═══════════════════════════════════════════════════
// TIME-OF-DAY GREETING
// ═══════════════════════════════════════════════════
(function () {
  const el = document.getElementById('greeting-tag');
  if (!el) return;
  const h = new Date().getHours();
  let msg = 'Good night';
  if (h >= 5 && h < 12) msg = 'Good morning';
  else if (h >= 12 && h < 17) msg = 'Good afternoon';
  else if (h >= 17 && h < 21) msg = 'Good evening';
  el.textContent = msg;
})();

// ═══════════════════════════════════════════════════
// TOAST + COPY EMAIL
// ═══════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

async function copyEmail() {
  try { await navigator.clipboard.writeText('jehdadina@gmail.com'); showToast('Email copied to clipboard ✓'); }
  catch { showToast('Copy failed. Email: jehdadina@gmail.com'); }
}

document.getElementById('copy-email-btn')?.addEventListener('click', copyEmail);

// ═══════════════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════════════
const cmdkCommands = [
  { icon: '→', label: 'Go to Home', hint: '1', action: () => goTo(0) },
  { icon: '→', label: 'Go to Experience', hint: '2', action: () => goTo(1) },
  { icon: '→', label: 'Go to Stack', hint: '3', action: () => goTo(2) },
  { icon: '→', label: 'Go to Work', hint: '4', action: () => goTo(3) },
  { icon: '→', label: 'Go to Contact', hint: '5', action: () => goTo(4) },
  { icon: '⧉', label: 'Copy email address', hint: '', action: copyEmail },
  { icon: '✉', label: 'Email Jeh directly', hint: '', action: () => window.location.href = 'mailto:jehdadina@gmail.com' },
  { icon: '↓', label: 'Request resume', hint: '', action: () => window.location.href = 'mailto:jehdadina@gmail.com?subject=Resume%20Request&body=Hi%20Jeh%2C%0A%0ACould%20you%20send%20over%20your%20resume%3F%0A%0AThanks!' },
  { icon: '↗', label: 'GitHub', hint: '↗', action: () => window.open('https://github.com/jehdadina-jpg', '_blank') },
  { icon: '↗', label: 'LinkedIn', hint: '↗', action: () => window.open('https://www.linkedin.com/in/jehdadina/', '_blank') },
  { icon: '↗', label: 'Instagram', hint: '↗', action: () => window.open('https://www.instagram.com/jehdadina/', '_blank') },
  { icon: '↗', label: 'CodeChef', hint: '↗', action: () => window.open('https://www.codechef.com/users/jehdadina/', '_blank') },
  { icon: '?', label: 'Show keyboard shortcuts', hint: '?', action: () => toggleShortcuts() },
];

let cmdkActiveIndex = 0;
let cmdkFiltered = cmdkCommands.slice();

function renderCmdkList() {
  const list = document.getElementById('cmdk-list');
  if (!list) return;
  if (!cmdkFiltered.length) {
    list.innerHTML = '<div class="cmdk-empty">No matching commands</div>';
    return;
  }
  list.innerHTML = cmdkFiltered.map((cmd, i) => `
    <div class="cmdk-item${i === cmdkActiveIndex ? ' active' : ''}" data-idx="${i}">
      <span class="cmdk-item-icon">${cmd.icon}</span>
      <span>${cmd.label}</span>
      ${cmd.hint ? `<span class="cmdk-item-hint">${cmd.hint}</span>` : ''}
    </div>
  `).join('');
  [...list.children].forEach(child => {
    child.addEventListener('click', () => {
      const cmd = cmdkFiltered[parseInt(child.dataset.idx, 10)];
      if (cmd) { closeCmdk(); cmd.action(); }
    });
  });
}

function openCmdk() {
  const overlay = document.getElementById('cmdk-overlay');
  const input = document.getElementById('cmdk-input');
  if (!overlay) return;
  closeShortcuts();
  closeMobileMenu();
  cmdkFiltered = cmdkCommands.slice();
  cmdkActiveIndex = 0;
  renderCmdkList();
  overlay.classList.add('open');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 50); }
}

function closeCmdk() {
  const overlay = document.getElementById('cmdk-overlay');
  if (overlay) overlay.classList.remove('open');
}

(function () {
  const overlay = document.getElementById('cmdk-overlay');
  const input = document.getElementById('cmdk-input');
  if (!overlay || !input) return;

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeCmdk();
  });

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    cmdkFiltered = cmdkCommands.filter(c => c.label.toLowerCase().includes(q));
    cmdkActiveIndex = 0;
    renderCmdkList();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cmdkActiveIndex = Math.min(cmdkActiveIndex + 1, cmdkFiltered.length - 1);
      renderCmdkList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cmdkActiveIndex = Math.max(cmdkActiveIndex - 1, 0);
      renderCmdkList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = cmdkFiltered[cmdkActiveIndex];
      if (cmd) { closeCmdk(); cmd.action(); }
    }
  });
})();

// ═══════════════════════════════════════════════════
// KEYBOARD SHORTCUTS PANEL
// ═══════════════════════════════════════════════════
function toggleShortcuts() {
  const overlay = document.getElementById('shortcuts-overlay');
  if (!overlay) return;
  if (overlay.classList.contains('open')) closeShortcuts();
  else { closeCmdk(); overlay.classList.add('open'); }
}
function closeShortcuts() {
  const overlay = document.getElementById('shortcuts-overlay');
  if (overlay) overlay.classList.remove('open');
}
document.getElementById('shortcuts-overlay')?.addEventListener('mousedown', (e) => {
  if (e.target === e.currentTarget) closeShortcuts();
});

// ═══════════════════════════════════════════════════
// URL HASH DEEP LINKING
// ═══════════════════════════════════════════════════
(function () {
  function jumpFromHash() {
    const idx = sectionSlugs.indexOf(window.location.hash.replace('#', ''));
    if (idx > -1) goTo(idx, { instant: true, skipHash: true });
  }
  if (window.location.hash) setTimeout(jumpFromHash, 100);
  window.addEventListener('popstate', jumpFromHash);
})();

// ═══════════════════════════════════════════════════
// CURSOR GLOW (desktop, fine pointer, motion-safe only)
// ═══════════════════════════════════════════════════
(function () {
  const glow = document.getElementById('cursor-glow');
  if (!glow || !canHover || reducedMotion) return;

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2, x = tx, y = ty, running = false;
  function loop() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) requestAnimationFrame(loop);
    else running = false;
  }
  window.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    glow.classList.add('active');
    if (!running) { running = true; requestAnimationFrame(loop); }
  });
  document.addEventListener('mouseleave', () => glow.classList.remove('active'));
})();

// ═══════════════════════════════════════════════════
// SAKI — Jeh's Kawasaki Ninja 300 (nav-triggered cameo)
// ═══════════════════════════════════════════════════
function triggerSakiRide() {
  const wrap = document.getElementById('saki-bike-wrap');
  if (!wrap) return;
  if (reducedMotion) {
    openSakiReveal();
    return;
  }
  if (wrap.classList.contains('riding')) return;
  wrap.classList.add('riding');
  wrap.addEventListener('animationend', () => wrap.classList.remove('riding'), { once: true });
}

function openSakiReveal() {
  const overlay = document.getElementById('saki-overlay');
  const lines = document.getElementById('saki-lines');
  if (!overlay || !lines) return;
  lines.innerHTML = '';
  overlay.classList.add('open');

  const script = [
    { text: '> IDENTIFIED: Jeh\'s Kawasaki Ninja 300', delay: 200 },
    { text: '> ALIAS: "Saki"', delay: 700, ok: true },
  ];
  script.forEach(line => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'boot-line' + (line.ok ? ' ok' : '');
      div.textContent = line.text;
      lines.appendChild(div);
    }, line.delay);
  });
}

function closeSakiReveal() {
  document.getElementById('saki-overlay')?.classList.remove('open');
}

document.getElementById('saki-bike-img')?.addEventListener('click', (e) => { e.stopPropagation(); openSakiReveal(); });
document.getElementById('saki-overlay')?.addEventListener('click', closeSakiReveal);

// ═══════════════════════════════════════════════════
// KONAMI CODE EASTER EGG
// ═══════════════════════════════════════════════════
(function () {
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;

  window.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === sequence[pos]) {
      pos++;
      if (pos === sequence.length) { pos = 0; triggerKonami(); }
    } else {
      pos = (key === sequence[0]) ? 1 : 0;
    }
  });

  function triggerKonami() {
    const overlay = document.getElementById('konami-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    if (!reducedMotion) runRain();
    const close = () => overlay.classList.remove('open');
    overlay.addEventListener('click', close, { once: true });
    setTimeout(close, 4000);
  }

  function runRain() {
    const canvas = document.getElementById('konami-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 18);
    const drops = new Array(cols).fill(0);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let frames = 0;

    function draw() {
      frames++;
      ctx.fillStyle = 'rgba(5,5,5,.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9BF2CF';
      ctx.font = '15px "Geist Mono", monospace';
      drops.forEach((d, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, d * 18);
        drops[i] = (d * 18 > canvas.height && Math.random() > .975) ? 0 : d + 1;
      });
      if (frames < 240 && document.getElementById('konami-overlay').classList.contains('open')) {
        requestAnimationFrame(draw);
      }
    }
    draw();
  }
})();

// ═══════════════════════════════════════════════════
// MAGNETIC HOVER (socials, nav cameo buttons)
// ═══════════════════════════════════════════════════
(function () {
  if (!canHover || reducedMotion) return;

  // GSAP path: elastic quickTo springs, buttons included
  if (hasGsap) {
    function magnetize(selector, strength, hoverScale) {
      document.querySelectorAll(selector).forEach(el => {
        const xTo = gsap.quickTo(el, 'x', { duration: .8, ease: 'elastic.out(1, .4)' });
        const yTo = gsap.quickTo(el, 'y', { duration: .8, ease: 'elastic.out(1, .4)' });
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * strength);
          yTo((e.clientY - r.top - r.height / 2) * strength);
        });
        if (hoverScale) {
          el.addEventListener('mouseenter', () => gsap.to(el, { scale: hoverScale, duration: .5, ease: 'back.out(2)' }));
        }
        el.addEventListener('mouseleave', () => {
          xTo(0); yTo(0);
          if (hoverScale) gsap.to(el, { scale: 1, duration: .6, ease: 'expo.out' });
        });
      });
    }
    magnetize('.magnetic', 0.3);
    magnetize('.magnetic-pop', 0.35, 1.15);
    magnetize('.btn', 0.16);
    return;
  }

  function magnetize(selector, strength, extra) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0) ${extra}`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }
  magnetize('.magnetic', 0.3, '');
  magnetize('.magnetic-pop', 0.35, 'scale(1.15)');
})();

// ═══════════════════════════════════════════════════
// TEXT ROLL — nav links + button labels
// ═══════════════════════════════════════════════════
document.querySelectorAll('.nav-links-bar a, .btn > span:first-child').forEach(el => {
  const text = el.textContent.trim();
  el.textContent = '';
  const roll = document.createElement('span');
  roll.className = 'roll';
  const inner = document.createElement('span');
  inner.dataset.t = text;
  inner.textContent = text;
  roll.appendChild(inner);
  el.appendChild(roll);
});
moveNavIndicator();

// ═══════════════════════════════════════════════════
// STACK ACCORDION — hover / focus / tap expands a slice
// ═══════════════════════════════════════════════════
(function () {
  const panels = document.querySelectorAll('.acc-panel');
  const wide = window.matchMedia('(min-width: 901px)');
  function open(panel) {
    if (!wide.matches || panel.classList.contains('is-open')) return;
    panels.forEach(p => p.classList.toggle('is-open', p === panel));
    if (hasGsap) {
      gsap.fromTo(panel.querySelectorAll('.tech-item'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: .7, ease: 'expo.out', stagger: .025, delay: .3, clearProps: 'opacity,transform' });
    }
  }
  panels.forEach(p => {
    p.addEventListener('mouseenter', () => open(p));
    p.addEventListener('focus', () => open(p));
    p.addEventListener('click', () => open(p));
  });
})();

// ═══════════════════════════════════════════════════
// CUSTOM CURSOR — ring that grows over links, "View" over work
// ═══════════════════════════════════════════════════
(function () {
  const cursor = document.getElementById('cursor');
  if (!cursor || !canHover || reducedMotion) return;
  let setX, setY;
  if (hasGsap) {
    setX = gsap.quickTo(cursor, 'x', { duration: .45, ease: 'power3.out' });
    setY = gsap.quickTo(cursor, 'y', { duration: .45, ease: 'power3.out' });
  } else {
    setX = x => { cursor.style.left = x + 'px'; };
    setY = y => { cursor.style.top = y + 'px'; };
  }
  window.addEventListener('mousemove', e => {
    cursor.classList.add('on');
    setX(e.clientX);
    setY(e.clientY);
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('on'));
  document.addEventListener('mouseover', e => {
    const link = e.target.closest('a, button, [role="tab"], .acc-panel:not(.is-open), .ink-pill, .knock, #crt-screen');
    cursor.classList.toggle('is-link', !!link);
  });
})();

// ═══════════════════════════════════════════════════
// MOTION ENGINE — scroll choreography (GSAP only)
// ═══════════════════════════════════════════════════
(function () {
  if (!hasGsap) return;

  // Split an element's text into masked words, preserving <em>/<br>/pills
  function splitWords(root, maskClass, innerClass) {
    const out = [];
    function walk(node) {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const inner = document.createElement('span');
            inner.className = innerClass;
            inner.textContent = part;
            if (maskClass) {
              const mask = document.createElement('span');
              mask.className = maskClass;
              mask.appendChild(inner);
              frag.appendChild(mask);
            } else {
              frag.appendChild(inner);
            }
            out.push(inner);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          if (child.classList.contains('ink-pill')) { child.classList.add(innerClass); out.push(child); }
          else walk(child);
        }
      });
    }
    walk(root);
    return out;
  }

  // 1. Headings — words rise out of masks
  document.querySelectorAll('.split-words').forEach(h => {
    const words = splitWords(h, 'wm', 'wi');
    gsap.from(words, {
      yPercent: 115,
      rotate: 6,
      duration: 1.3,
      ease: 'expo.out',
      stagger: .07,
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
    });
  });

  // 2. Manifesto — words scrub from 12% to full as you scroll (Scrubbing Text Reveal)
  const scrub = document.querySelector('.scrub-text');
  if (scrub) {
    const words = splitWords(scrub, null, 'sw');
    gsap.to(words, {
      opacity: 1,
      ease: 'none',
      stagger: .1,
      scrollTrigger: { trigger: scrub, start: 'top 80%', end: 'bottom 45%', scrub: .6 },
    });
    gsap.from(scrub.querySelectorAll('.ink-pill'), {
      scale: .4,
      rotate: -12,
      ease: 'back.out(2)',
      stagger: .2,
      scrollTrigger: { trigger: scrub, start: 'top 70%', end: 'bottom 50%', scrub: .6 },
    });
  }

  // 3. Hero intro, after danilodemarco.com's opening: the TV straightens, glides to centre,
  //    then the camera flies into the phosphor screen and cuts to black, landing on "Roots in Finance".
  const hero = document.getElementById('page1');
  const heroStage = hero && hero.querySelector('.hero-stage');
  const crtZoom = hero && hero.querySelector('.crt-zoom');
  const crtScreen = document.getElementById('crt-screen');
  if (heroStage && crtZoom && crtScreen) {
    // offsets ignore transforms, so geometry stays stable mid-animation and on resize
    const offsetWithin = (el, ancestor) => {
      let x = 0, y = 0, n = el;
      while (n && n !== ancestor) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x, y };
    };
    let G = { ox: 0, oy: 0, dx: 0, dy: 0, scale: 4 };
    const measure = () => {
      const z = offsetWithin(crtZoom, heroStage);
      const s = offsetWithin(crtScreen, crtZoom);
      const cx = s.x + crtScreen.offsetWidth / 2;
      const cy = s.y + crtScreen.offsetHeight / 2;
      const vw = heroStage.clientWidth, vh = heroStage.clientHeight;
      G = {
        ox: cx,
        oy: cy,
        dx: vw / 2 - (z.x + cx),
        dy: vh / 2 - (z.y + cy),
        scale: Math.max(vw / crtScreen.offsetWidth, vh / crtScreen.offsetHeight) * 1.4,
      };
      gsap.set(crtZoom, { transformOrigin: `${G.ox}px ${G.oy}px` });
    };
    measure();

    let boosted = false;
    const intro = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onUpdate: self => {
          // re-rasterise the CRT at higher resolution while it fills the viewport
          const want = self.progress > .3;
          if (want !== boosted && typeof window.crtSetBoost === 'function') {
            boosted = want;
            window.crtSetBoost(want ? 3 : 1);
          }
        },
      },
    });
    intro
      .fromTo(crtZoom, { rotation: -6, x: 0, y: 24 }, { rotation: 0, x: () => G.dx, y: () => G.dy, duration: .32, ease: 'power2.inOut' }, 0)
      .to('.hero-copy', { yPercent: -22, opacity: 0, duration: .22, ease: 'power1.in' }, 0)
      .to('.hero-roles', { y: -30, opacity: 0, duration: .16 }, 0)
      .to('.desk-item, .desk', { opacity: 0, duration: .14 }, .22)
      .fromTo(crtZoom, { scale: 1 }, { scale: () => G.scale, duration: .5, ease: 'power3.in' }, .34)
      .to('.hero-glow', { opacity: 0, duration: .3 }, .4)
      .to('.zoom-black', { opacity: 1, duration: .14 }, .8);
  }

  // 4. Marquee — base drift, accelerates and skews with scroll velocity
  const track = document.querySelector('.marquee-track');
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 42, ease: 'none', repeat: -1 });
    let boost = 0, dir = 1;
    ScrollTrigger.create({
      onUpdate: self => {
        dir = self.direction;
        boost = Math.min(Math.abs(self.getVelocity()) / 180, 9);
      },
    });
    const skewTo = gsap.quickSetter(track, 'skewX', 'deg');
    gsap.ticker.add(() => {
      boost *= .93;
      const target = dir * (1 + boost);
      loop.timeScale(loop.timeScale() + (target - loop.timeScale()) * .12);
      skewTo(-boost * dir * .9);
    });
  }

  const mm = gsap.matchMedia();

  // 5. Experience — pin the heading while the timeline scrolls past (Scroll Pinning)
  mm.add('(min-width: 901px)', () => {
    const head = document.querySelector('#page2 .sticky-head');
    const tl = document.querySelector('#page2 .tl');
    if (!head || !tl) return;
    ScrollTrigger.create({
      trigger: tl,
      start: 'top 128px',
      end: () => `+=${Math.max(0, tl.offsetHeight - head.offsetHeight)}`,
      pin: head,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  });

  // 6. Timeline line draws itself, nodes ignite as it passes
  const line = document.querySelector('.tl-line i');
  if (line) {
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.tl-track', start: 'top 70%', end: 'bottom 55%', scrub: .5 },
    });
    document.querySelectorAll('.tl-node').forEach(node => {
      gsap.from(node, {
        scale: 0,
        duration: .9,
        ease: 'back.out(3)',
        scrollTrigger: { trigger: node, start: 'top 72%', once: true },
      });
    });
  }

  // 7. Statement lines drift in opposite directions while scrolling (Danilo-style)
  gsap.utils.toArray('.stmt-line').forEach((line, i) => {
    gsap.fromTo(line, { xPercent: i % 2 ? 8 : -8 }, {
      xPercent: i % 2 ? -2 : 2,
      ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: .8 },
    });
  });

  // Cream sheets scale up slightly as they arrive, like a page sliding in
  gsap.utils.toArray('.cream').forEach(sheet => {
    gsap.fromTo(sheet, { scale: .94, borderRadius: '5rem' }, {
      scale: 1,
      borderRadius: window.innerWidth < 768 ? '1.8rem' : '2.6rem',
      ease: 'none',
      scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 40%', scrub: .6 },
    });
  });

  // 8. Footer wordmark rises as the page ends
  gsap.fromTo('.wordmark-inner', { yPercent: 70 }, {
    yPercent: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.wordmark', start: 'top bottom', end: 'bottom bottom', scrub: .6 },
  });

  // Layout shifts (fonts, images) — recalc trigger positions
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();

// ═══════════════════════════════════════════════════
// CRT TELEVISION — ASCII portrait / simulated market / anomaly scan / neural net
// ═══════════════════════════════════════════════════
(function () {
  const screen = document.getElementById('crt-screen');
  const canvas = document.getElementById('crt-canvas');
  if (!screen || !canvas) return;
  const ctx = canvas.getContext('2d');
  const knob = document.getElementById('crt-knob');
  const chEl = document.getElementById('crt-ch');
  const labelEl = document.getElementById('crt-label');

  const RAMP = ' .,:;-=+*#%@';
  const CHAR_ASPECT = 1.6;          // cell height / cell width
  const STATIC_MS = 260;            // noise burst when changing channel
  const channels = ['JEH.DADINA', 'NIFTY50 LIVE', 'ANOMALY.SCAN SIM', 'NEURAL.NET'];

  let W = 0, H = 0, cols = 0, rows = 0, cw = 0, chh = 0, boost = 1;
  let portrait = null;
  let channel = 0, switchedAt = -1e9, knobRot = 0;
  let mouse = { x: -9999, y: -9999 };
  let running = false, visible = false, rafId = 0, last = 0, started = false;

  const img = new Image();
  img.src = 'images/jeh.webp';

  // Render something into a cols × rows buffer (1 px per character cell) and read it back
  function sample(draw) {
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const o = off.getContext('2d', { willReadFrequently: true });
    draw(o);
    return o.getImageData(0, 0, cols, rows).data;
  }

  function buildPortrait() {
    if (!cols || !img.naturalWidth) return;
    const data = sample(o => {
      o.fillStyle = '#fff';
      o.fillRect(0, 0, cols, rows);
      // fit the head to the screen height (slight overscan), centred, then squash into cell space
      const realW = cols * cw, realH = rows * chh;
      // drop the head slightly so the hairline clears the top OSD strip
      const s = realH / img.naturalHeight;
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      const dx = (realW - dw) / 2, dy = realH * .08;
      o.drawImage(img, dx / cw, dy / chh, dw / cw, dh / chh);
    });
    const n = cols * rows;
    const lums = new Float32Array(n);
    const fg = [];
    for (let i = 0; i < n; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      const lum = (.299 * r + .587 * g + .114 * b) / 255;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      // near-white, unsaturated pixels are the studio backdrop — drop them
      lums[i] = (lum > .86 && sat < 28) ? -1 : lum;
      if (lums[i] >= 0) fg.push(lum);
    }
    // stretch contrast across the subject only so facial features separate
    fg.sort((a, b) => a - b);
    const lo = fg[Math.floor(fg.length * .04)] || 0;
    const hi = fg[Math.floor(fg.length * .97)] || 1;
    portrait = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      if (lums[i] < 0) continue;
      const v = Math.min(1, Math.max(0, (lums[i] - lo) / (hi - lo || 1)));
      // lifted shadows: hair and the black blazer still render as dim glyphs, so the whole
      // head reads as a silhouette instead of a floating face strip; skin stays brightest
      portrait[i] = .24 + .76 * Math.pow(v, 1.2);
    }
  }

  // Channel 3: simulated anomaly scan. Two transaction clusters, a handful of outliers the sweep flags.
  const CLUSTERS = [[.32, .56, .085], [.66, .44, .07]];
  const pts = [];
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  CLUSTERS.forEach(([cx, cy, sd]) => {
    for (let i = 0; i < 80; i++) pts.push({ x: cx + gauss() * sd, y: cy + gauss() * sd * .9, o: false, ph: Math.random() * 6.28 });
  });
  while (pts.filter(p => p.o).length < 6) {
    const x = .08 + Math.random() * .84, y = .12 + Math.random() * .76;
    const far = CLUSTERS.every(([cx, cy, sd]) => Math.hypot(x - cx, y - cy) > sd * 3);
    if (far) pts.push({ x, y, o: true, ph: Math.random() * 6.28 });
  }

  function drawScatter(now) {
    const t = now / 1000;
    const top = H * .2, bottom = H * .82, left = W * .07, right = W * .93;
    const px = v => left + v * (right - left);
    const py = v => top + v * (bottom - top);
    const sweep = (t * .22) % 1.15;
    const sx = px(sweep);

    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = 'rgba(155,242,207,.3)';
    ctx.lineWidth = 1;
    CLUSTERS.forEach(([cx, cy, sd]) => {
      ctx.beginPath();
      ctx.ellipse(px(cx), py(cy), sd * 2.6 * (right - left), sd * 2.4 * (bottom - top), 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    const g = ctx.createLinearGradient(sx - 40, 0, sx, 0);
    g.addColorStop(0, 'rgba(155,242,207,0)');
    g.addColorStop(1, 'rgba(155,242,207,.18)');
    ctx.fillStyle = g;
    ctx.fillRect(sx - 40, top, 40, bottom - top);

    let flagged = 0;
    pts.forEach(p => {
      const x = px(p.x + Math.sin(t + p.ph) * .003);
      const y = py(p.y + Math.cos(t * .8 + p.ph) * .003);
      if (!p.o) {
        ctx.fillStyle = 'rgba(155,242,207,.75)';
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        return;
      }
      const hit = sx > x;
      if (hit) flagged++;
      ctx.fillStyle = hit ? '#FF9FBF' : 'rgba(155,242,207,.75)';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      if (hit) {
        ctx.strokeStyle = 'rgba(255,159,191,.85)';
        ctx.beginPath();
        ctx.arc(x, y, 9 + Math.sin(t * 4 + p.ph) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.font = `500 ${Math.max(11, W * .03)}px "Geist Mono", monospace`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    ctx.fillStyle = flagged ? '#FF9FBF' : '#9BF2CF';
    ctx.fillText(`FLAGGED ${flagged}/6`, right, H * .15);
    ctx.textAlign = 'left';
  }

  // Channel 4: a small network with signals travelling layer to layer, ending in a trade call
  const LAYERS = [4, 6, 6, 3];
  const OUTPUTS = ['BUY', 'HOLD', 'SELL'];
  const pulses = [];
  function drawNeural(now) {
    const t = now / 1000;
    const nodes = LAYERS.map((n, li) => Array.from({ length: n }, (_, i) => ({
      x: W * (.12 + li * (.66 / (LAYERS.length - 1))),
      y: H * (.2 + (i + .5) * (.6 / n)),
    })));

    ctx.strokeStyle = 'rgba(155,242,207,.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let l = 0; l < nodes.length - 1; l++) {
      nodes[l].forEach(a => nodes[l + 1].forEach(b => { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }));
    }
    ctx.stroke();

    if (running && Math.random() < .5) {
      const l = (Math.random() * (nodes.length - 1)) | 0;
      pulses.push({ l, a: (Math.random() * nodes[l].length) | 0, b: (Math.random() * nodes[l + 1].length) | 0, t0: now });
    }
    const winner = Math.floor(t / 2.4) % OUTPUTS.length;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      const k = (now - p.t0) / 650;
      if (k > 1) { pulses.splice(i, 1); continue; }
      const A = nodes[p.l][p.a], B = nodes[p.l + 1][p.b];
      const x = A.x + (B.x - A.x) * k, y = A.y + (B.y - A.y) * k;
      ctx.strokeStyle = 'rgba(155,242,207,.55)';
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = '#9BF2CF';
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    }

    nodes.forEach((layer, li) => layer.forEach((n, i) => {
      const isOut = li === nodes.length - 1;
      const a = isOut ? (i === winner ? 1 : .3) : .35 + .65 * (.5 + .5 * Math.sin(t * 2.2 + i + li));
      ctx.fillStyle = `rgba(155,242,207,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, isOut ? 6 : 4.5, 0, Math.PI * 2); ctx.fill();
      if (isOut) {
        ctx.font = `500 ${Math.max(11, W * .03)}px "Geist Mono", monospace`;
        ctx.textBaseline = 'middle';
        ctx.fillText(OUTPUTS[i], n.x + 14, n.y);
      }
    }));
  }

  // Simulated price feed for channel 0 (default), labelled LIVE on the OSD
  const series = [];
  let price = 24310, lastTick = 0;
  function stepPrice() {
    price += (Math.random() - .47) * 18;
    series.push(price);
    if (series.length > 90) series.shift();
  }
  for (let i = 0; i < 90; i++) stepPrice();

  // Bottom ticker tape — a handful of other symbols drifting, Bloomberg-tape style
  const TAPE = [
    { sym: 'BANKNIFTY', v: 51820.15, dir: 1 },
    { sym: 'SENSEX', v: 80120.40, dir: -1 },
    { sym: 'USD/INR', v: 83.42, dir: 1 },
    { sym: 'GOLD', v: 71230, dir: -1 },
    { sym: 'CRUDE', v: 6840.50, dir: 1 },
  ];
  function stepTape() {
    TAPE.forEach(s => {
      s.v += (Math.random() - .5) * (s.v * .0006) * s.dir;
      if (Math.random() < .02) s.dir *= -1;
    });
  }

  // Backing-store size; `boost` raises it while the intro zooms the TV to fill the viewport
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * boost;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resize() {
    W = screen.clientWidth;
    H = screen.clientHeight;
    if (!W || !H) return;
    sizeCanvas();
    cols = Math.max(56, Math.round(W / 5.2));
    cw = W / cols;
    chh = cw * CHAR_ASPECT;
    rows = Math.ceil(H / chh);
    buildPortrait();
    if (!running) renderFrame(performance.now());
  }

  window.crtSetBoost = b => {
    if (b === boost || !W) return;
    boost = b;
    sizeCanvas();
    if (!running) renderFrame(performance.now());
  };

  function drawAscii(grid, now) {
    const t = now / 1000;
    const scanY = ((t * .22) % 1.3 - .15) * H;
    const reveal = Math.min(rows, (now - switchedAt - STATIC_MS) / 12);
    const R = Math.max(46, W * .13), R2 = R * R;
    ctx.font = `${Math.round(chh * .9)}px "Geist Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    for (let r = 0; r < reveal; r++) {
      const y = r * chh;
      const band = Math.max(0, 1 - Math.abs(y - scanY) / 38) * .4;
      for (let c = 0; c < cols; c++) {
        let v = grid[r * cols + c];
        const x = c * cw;
        const dx = x + cw / 2 - mouse.x, dy = y + chh / 2 - mouse.y, d2 = dx * dx + dy * dy;
        let glyph = null;
        if (d2 < R2) {
          const k = 1 - d2 / R2;
          v = Math.min(1, v + k * .5);
          if (Math.random() < k * .45) glyph = RAMP[1 + ((Math.random() * (RAMP.length - 1)) | 0)];
        }
        if (v < .05) continue;
        glyph = glyph || RAMP[Math.min(RAMP.length - 1, 1 + ((v * (RAMP.length - 1)) | 0))];
        ctx.fillStyle = `rgba(155,242,207,${Math.min(1, .22 + v * .78 + band).toFixed(2)})`;
        ctx.fillText(glyph, x, y);
      }
    }
  }

  function drawTicker(now) {
    if (now - lastTick > 140 && running) { stepPrice(); stepTape(); lastTick = now; }
    // price row sits clear of the OSD strip even on a small phone-sized screen
    const PY = Math.max(H * .2, 52);
    const padX = W * .06, top = Math.max(H * .33, PY + Math.max(28, H * .12)), bottom = H * .74;
    let min = Infinity, max = -Infinity;
    series.forEach(v => { if (v < min) min = v; if (v > max) max = v; });
    const range = max - min || 1;
    const px = i => padX + (W - padX * 2) * i / (series.length - 1);
    const py = v => bottom - (v - min) / range * (bottom - top);

    ctx.strokeStyle = 'rgba(155,242,207,.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + (bottom - top) * i / 4;
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke();
    }

    ctx.beginPath();
    series.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
    ctx.strokeStyle = 'rgba(155,242,207,.95)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo(px(series.length - 1), bottom);
    ctx.lineTo(px(0), bottom);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, 'rgba(155,242,207,.22)');
    g.addColorStop(1, 'rgba(155,242,207,0)');
    ctx.fillStyle = g;
    ctx.fill();

    const lastV = series[series.length - 1];
    const pct = (lastV - series[0]) / series[0] * 100;
    ctx.beginPath();
    ctx.arc(px(series.length - 1), py(lastV), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#9BF2CF';
    ctx.fill();

    const priceFont = `500 ${Math.max(12, W * .036)}px "Geist Mono", monospace`;
    ctx.font = priceFont;
    ctx.textBaseline = 'alphabetic';
    const priceText = lastV.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    ctx.fillStyle = '#9BF2CF';
    ctx.fillText(priceText, padX, PY);

    // terminal-style blinking cursor after the last price
    if (running && Math.floor(now / 500) % 2 === 0) {
      const pw = ctx.measureText(priceText).width;
      ctx.fillStyle = 'rgba(155,242,207,.85)';
      ctx.fillRect(padX + pw + 7, PY - Math.max(11, W * .028), Math.max(6, W * .012), Math.max(13, W * .032));
    }

    ctx.fillStyle = pct >= 0 ? '#9BF2CF' : '#FF9FBF';
    ctx.textAlign = 'right';
    ctx.fillText(`${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`, W - padX, PY);
    ctx.textAlign = 'left';

    // OHL strip + bottom ticker tape — richer Bloomberg-terminal chrome, only where there's
    // room to breathe; on a small phone-width CRT this would collide with the OSD/typewriter rows
    if (W > 380) {
      let hi = -Infinity, lo = Infinity;
      series.forEach(v => { if (v > hi) hi = v; if (v < lo) lo = v; });
      ctx.font = `500 ${Math.max(9, W * .02)}px "Geist Mono", monospace`;
      ctx.fillStyle = 'rgba(244,201,140,.85)';
      ctx.fillText(`O ${series[0].toFixed(2)}   H ${hi.toFixed(2)}   L ${lo.toFixed(2)}`, padX, PY + Math.max(15, H * .065));

      const tapeY = H * .9;
      ctx.font = `500 ${Math.max(9, W * .021)}px "Geist Mono", monospace`;
      ctx.textBaseline = 'middle';
      const tapeStr = TAPE.map(s => `${s.sym} ${s.v.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${s.dir > 0 ? '▲' : '▼'}`).join('     ✦     ') + '     ✦     ';
      const tapeW = ctx.measureText(tapeStr).width;
      const speed = W * .022;
      let offset = -((now / 1000 * speed) % tapeW);
      ctx.fillStyle = 'rgba(244,201,140,.55)';
      while (offset < W) { ctx.fillText(tapeStr, offset, tapeY); offset += tapeW; }
      ctx.textBaseline = 'alphabetic';
    }
  }

  function drawStatic() {
    ctx.font = `${Math.round(chh * .9)}px "Geist Mono", monospace`;
    ctx.textBaseline = 'top';
    for (let i = 0; i < cols * rows * .45; i++) {
      const c = (Math.random() * cols) | 0, r = (Math.random() * rows) | 0;
      ctx.fillStyle = `rgba(200,255,230,${(Math.random() * .8).toFixed(2)})`;
      ctx.fillText(RAMP[(Math.random() * RAMP.length) | 0], c * cw, r * chh);
    }
  }

  function renderFrame(now) {
    ctx.clearRect(0, 0, W, H);
    if (now - switchedAt < STATIC_MS) { drawStatic(); return; }
    if (channel === 0 && portrait) drawAscii(portrait, now);
    else if (channel === 1) drawTicker(now);
    else if (channel === 2) drawScatter(now);
    else if (channel === 3) drawNeural(now);
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30fps is plenty for a CRT
    last = now;
    renderFrame(now);
  }

  function setRunning(on) {
    if (reducedMotion) on = false;
    if (on === running) return;
    running = on;
    if (on) {
      if (!started) { started = true; switchedAt = performance.now() - STATIC_MS; }
      rafId = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  function nextChannel() {
    channel = (channel + 1) % channels.length;
    switchedAt = reducedMotion ? -1e9 : performance.now();
    if (!reducedMotion) {
      screen.classList.remove('glitch');
      void screen.offsetWidth; // restart the animation
      screen.classList.add('glitch');
      setTimeout(() => screen.classList.remove('glitch'), 340);
    }
    if (chEl) chEl.textContent = 'CH 0' + (channel + 1);
    if (labelEl) labelEl.textContent = channels[channel];
    window.dispatchEvent(new CustomEvent('crt:channel', { detail: channel }));
    knobRot += 90;
    if (knob) knob.style.setProperty('--rot', knobRot + 'deg');
    if (!running) renderFrame(performance.now());
  }

  screen.addEventListener('click', nextChannel);
  screen.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextChannel(); }
  });
  if (knob) knob.addEventListener('click', e => { e.stopPropagation(); nextChannel(); });

  screen.addEventListener('pointermove', e => {
    // rect is post-transform (the intro scales the TV), so map back to canvas CSS pixels
    const r = screen.getBoundingClientRect();
    mouse = { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  });
  screen.addEventListener('pointerleave', () => { mouse = { x: -9999, y: -9999 }; });

  img.addEventListener('load', () => { buildPortrait(); if (!running) renderFrame(performance.now()); });
  new ResizeObserver(resize).observe(screen);

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    setRunning(visible && !document.hidden);
  }).observe(screen);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
})();

// ═══════════════════════════════════════════════════
// STATEMENT — Saki rides through "FINANCE," and knocks the letters over
// ═══════════════════════════════════════════════════
(function () {
  const line = document.querySelector('.knock');
  if (!line) return;
  const bike = line.querySelector('.stmt-bike');
  const letters = [];
  [...line.childNodes].forEach(n => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    [...n.textContent].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'kl';
      s.textContent = ch;
      frag.appendChild(s);
      letters.push(s);
    });
    n.replaceWith(frag);
  });

  // Split the other lines into characters too (recursing into <em>) for the letter-by-letter fade
  const stmtLines = [...document.querySelectorAll('.stmt-line')];
  stmtLines.forEach(l => {
    if (l === line) return;
    (function walk(node) {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'sc';
            s.textContent = ch === ' ' ? ' ' : ch;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    })(l);
  });
  if (!hasGsap || !bike) return;

  // Letters light up one by one as each line rises into view (after Danilo's "Roots" reveal)
  stmtLines.forEach(l => {
    gsap.to(l.querySelectorAll('.sc, .kl'), {
      opacity: 1,
      ease: 'none',
      stagger: .08,
      scrollTrigger: { trigger: l, start: 'top 90%', end: 'top 58%', scrub: .4 },
    });
  });

  let riding = false;
  function ride() {
    if (riding) return;
    riding = true;
    const lineRect = line.getBoundingClientRect();
    const bw = bike.offsetWidth || 200;
    const fs = parseFloat(getComputedStyle(line).fontSize);
    const startX = -lineRect.left - bw - 40;
    const endX = window.innerWidth - lineRect.left + 40;
    const dur = 2.4;
    const speed = (endX - startX) / dur;

    const tl = gsap.timeline({ onComplete: () => { riding = false; } });
    tl.fromTo(bike, { x: startX }, { x: endX, duration: dur, ease: 'none' }, 0);
    tl.fromTo(bike, { y: 0, rotation: 0 }, { y: -fs * .03, rotation: -2.5, duration: .16, yoyo: true, repeat: Math.floor(dur / .16), ease: 'sine.inOut' }, 0);

    letters.forEach(l => {
      const cx = l.offsetLeft + l.offsetWidth / 2;
      const hit = (cx - bw * .85 - startX) / speed;
      if (hit < 0 || hit > dur) return;
      tl.to(l, {
        y: -fs * gsap.utils.random(.35, .95),
        x: fs * gsap.utils.random(.04, .3),
        rotation: gsap.utils.random(-75, 75),
        duration: .32,
        ease: 'power2.out',
      }, hit).to(l, { y: 0, x: 0, rotation: 0, duration: 1.3, ease: 'bounce.out' }, hit + .32);
    });
  }

  ScrollTrigger.create({ trigger: line, start: 'top 52%', once: true, onEnter: ride });
  line.addEventListener('click', ride);

  // Idle letters hop when you brush past them
  letters.forEach(l => l.addEventListener('mouseenter', () => {
    if (riding) return;
    const fs = parseFloat(getComputedStyle(line).fontSize);
    gsap.fromTo(l, { y: 0 }, { y: -fs * .1, rotation: gsap.utils.random(-8, 8), duration: .22, yoyo: true, repeat: 1, ease: 'power2.out' });
  }));
})();

// ═══════════════════════════════════════════════════
// WORK INDEX — preview card follows the cursor, slides between projects
// ═══════════════════════════════════════════════════
(function () {
  const list = document.querySelector('.work-list');
  const pv = document.querySelector('.work-preview');
  if (!list || !pv || !canHover) return;
  const track = pv.querySelector('.wp-track');

  // GitHub's preview service rate-limits bursts: retry once, then fall back to the project name
  pv.querySelectorAll('.wp img').forEach((img, i) => {
    img.addEventListener('error', () => {
      if (!img.dataset.retried) {
        img.dataset.retried = '1';
        setTimeout(() => { img.src = img.src.split('?')[0] + '?r=' + Date.now(); }, 1500);
        return;
      }
      const name = document.querySelectorAll('.wr-name')[i];
      img.parentElement.classList.add('wp-fallback');
      img.replaceWith(Object.assign(document.createElement('span'), { textContent: name ? name.textContent : '' }));
    });
  });

  let setX, setY, setR;
  if (hasGsap) {
    setX = gsap.quickTo(pv, 'x', { duration: .55, ease: 'power3.out' });
    setY = gsap.quickTo(pv, 'y', { duration: .55, ease: 'power3.out' });
    setR = gsap.quickTo(pv, 'rotation', { duration: .9, ease: 'power3.out' });
  } else {
    setX = v => { pv.style.left = v + 'px'; };
    setY = v => { pv.style.top = v + 'px'; };
    setR = () => {};
  }
  let lastX = 0;
  list.addEventListener('mouseenter', e => {
    if (hasGsap) gsap.set(pv, { x: e.clientX, y: e.clientY });
    lastX = e.clientX;
  });
  list.addEventListener('mousemove', e => {
    setX(e.clientX);
    setY(e.clientY);
    setR(Math.max(-10, Math.min(10, (e.clientX - lastX) * .5)));
    lastX = e.clientX;
  });
  list.querySelectorAll('.work-row').forEach(row => row.addEventListener('mouseenter', () => {
    track.style.transform = `translate3d(0, ${-row.dataset.i * 100}%, 0)`;
    pv.classList.add('on');
  }));
  list.addEventListener('mouseleave', () => { pv.classList.remove('on'); setR(0); });
})();

// ═══════════════════════════════════════════════════
// CONSOLE — keycaps drive the oscilloscope and the LCD
// ═══════════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('scope-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const label = document.getElementById('scope-label');
  const msg = document.getElementById('lcd-msg');
  const idleMsg = msg ? msg.textContent : '';
  let W = 0, H = 0;
  let freq = 1.4, amp = .28, tf = 1.4, ta = .28, phase = 0, burst = 0;
  let running = false, visible = false, rafId = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) drawWave(true);
  }

  function drawWave(clear) {
    if (clear) {
      ctx.clearRect(0, 0, W, H);
    } else {
      // phosphor persistence: fade the previous frame instead of wiping it
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.32)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.beginPath();
    for (let x = 0; x <= W; x += 2) {
      const u = x / W;
      const y = H / 2
        + Math.sin(u * Math.PI * 2 * freq + phase) * amp * H * .42
        + Math.sin(u * Math.PI * 2 * freq * 3 + phase * 1.7) * amp * H * .05
        + (burst > .01 ? (Math.random() - .5) * burst * H * .45 : 0);
      if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(155,242,207,.95)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    freq += (tf - freq) * .08;
    amp += (ta - amp) * .08;
    burst *= .92;
    phase += .05 + freq * .012;
    drawWave(false);
  }

  function setRunning(on) {
    if (reducedMotion) on = false;
    if (on === running) return;
    running = on;
    if (on) rafId = requestAnimationFrame(loop);
    else cancelAnimationFrame(rafId);
  }

  function focusKey(k) {
    tf = parseFloat(k.dataset.f) || 3;
    ta = .55;
    if (msg) msg.textContent = k.dataset.msg || idleMsg;
    if (label) label.textContent = 'SIG · ' + k.textContent.replace(/^\s*\d+/, '').trim().toUpperCase();
    if (!running) drawWave(true);
  }
  function idle(k) {
    tf = 1.4;
    ta = .28;
    if (msg) msg.textContent = idleMsg;
    if (label) label.textContent = 'SIG · IDLE';
    if (k) k.classList.remove('is-down');
  }

  document.querySelectorAll('.key').forEach(k => {
    k.addEventListener('mouseenter', () => focusKey(k));
    k.addEventListener('focus', () => focusKey(k));
    k.addEventListener('mouseleave', () => idle(k));
    k.addEventListener('blur', () => idle(k));
    k.addEventListener('pointerdown', () => { burst = 1; k.classList.add('is-down'); });
    k.addEventListener('pointerup', () => k.classList.remove('is-down'));
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    setRunning(visible && !document.hidden);
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
})();

// ═══════════════════════════════════════════════════
// CRT — cursor tilt, moving glass reflection, channel pips, knob hint
// ═══════════════════════════════════════════════════
(function () {
  const crt = document.querySelector('.crt');
  const screen = document.getElementById('crt-screen');
  const knob = document.getElementById('crt-knob');
  const pips = [...document.querySelectorAll('.crt-pips i')];

  window.addEventListener('crt:channel', e => {
    pips.forEach((p, i) => p.classList.toggle('on', i === e.detail));
    if (knob) knob.classList.remove('hint');
  });

  const hero = document.getElementById('page1');
  if (!crt || !screen || !hero || !hasGsap || !canHover) return;

  gsap.set(crt, { transformPerspective: 1100 });
  const rx = gsap.quickTo(crt, 'rotationX', { duration: .9, ease: 'power3.out' });
  const ry = gsap.quickTo(crt, 'rotationY', { duration: .9, ease: 'power3.out' });
  const flatten = () => { rx(0); ry(0); };

  hero.addEventListener('pointermove', e => {
    // stay flat once the camera starts flying into the screen
    if (window.scrollY > 40) return flatten();
    const r = crt.getBoundingClientRect();
    const px = (e.clientX - (r.left + r.width / 2)) / innerWidth;
    const py = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    ry(px * 14);
    rx(-py * 10);
    // the reflection slides against the tilt, like light on curved glass
    screen.style.setProperty('--gx', (30 - px * 60).toFixed(1) + '%');
    screen.style.setProperty('--gy', (10 - py * 40).toFixed(1) + '%');
  });
  hero.addEventListener('pointerleave', flatten);
  ScrollTrigger.create({ trigger: hero, start: 'top top-=40', onEnter: flatten });
})();

// ═══════════════════════════════════════════════════
// LED DOT FIELD — fixed dot matrix that lights up mint around the cursor
// ═══════════════════════════════════════════════════
(function () {
  const backdrop = document.querySelector('.backdrop');
  if (!backdrop) return;
  const cv = document.createElement('canvas');
  cv.id = 'dot-field';
  backdrop.appendChild(cv);
  document.documentElement.classList.add('has-dots');

  const ctx = cv.getContext('2d');
  const base = document.createElement('canvas');
  const bctx = base.getContext('2d');
  const GAP = 26, R = 170;
  const live = canHover && !reducedMotion;
  let W = 0, H = 0, dpr = 1, ox = 0, oy = 0;
  let mx = -1e4, my = -1e4, tx = -1e4, ty = -1e4, raf = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    [cv, base].forEach(c => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(W / GAP) + 1, rows = Math.ceil(H / GAP) + 1;
    ox = (W - (cols - 1) * GAP) / 2;
    oy = (H - (rows - 1) * GAP) / 2;
    // static layer: every dot, drawn once
    bctx.clearRect(0, 0, W, H);
    bctx.fillStyle = 'rgba(255,255,255,.075)';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      bctx.beginPath();
      bctx.arc(ox + c * GAP, oy + r * GAP, .75, 0, 6.2832);
      bctx.fill();
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0, W, H);
    if (mx < -1e3) return;
    // only the dots inside the cursor's radius get repainted
    const c0 = Math.max(0, Math.floor((mx - R - ox) / GAP)), c1 = Math.ceil((mx + R - ox) / GAP);
    const r0 = Math.max(0, Math.floor((my - R - oy) / GAP)), r1 = Math.ceil((my + R - oy) / GAP);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const x = ox + c * GAP, y = oy + r * GAP;
      const d = Math.hypot(x - mx, y - my);
      if (d >= R) continue;
      const k = 1 - d / R, e = k * k;
      ctx.fillStyle = `rgba(155,242,207,${(.1 + e * .6).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, .75 + e * 1.35, 0, 6.2832);
      ctx.fill();
    }
  }

  function tick() {
    mx += (tx - mx) * .18;
    my += (ty - my) * .18;
    draw();
    raf = Math.abs(tx - mx) + Math.abs(ty - my) > .5 ? requestAnimationFrame(tick) : 0;
  }

  size();
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 120); });
  if (!live) return;

  window.addEventListener('pointermove', e => {
    if (mx < -1e3) { mx = e.clientX; my = e.clientY; }
    tx = e.clientX;
    ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    tx = ty = mx = my = -1e4;
    draw();
  });
})();

// ═══════════════════════════════════════════════════
// WORK — live GitHub stars / last push per repo, fetched when the list nears view
// ═══════════════════════════════════════════════════
(function () {
  const rows = [...document.querySelectorAll('.work-row')];
  const list = document.querySelector('.work-list');
  if (!rows.length || !list || !window.fetch) return;
  const KEY = 'jd-gh-meta-v1';

  const ago = iso => {
    const d = (Date.now() - new Date(iso).getTime()) / 864e5;
    if (d < 1) return 'today';
    if (d < 2) return 'yesterday';
    if (d < 30) return Math.floor(d) + 'd ago';
    if (d < 365) return Math.floor(d / 30) + 'mo ago';
    return Math.floor(d / 365) + 'y ago';
  };

  const repoOf = row => {
    const m = row.href.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    return m ? { owner: m[1], key: (m[1] + '/' + m[2]).toLowerCase() } : null;
  };

  function paint(map) {
    rows.forEach(row => {
      const ref = repoOf(row);
      const cat = row.querySelector('.wr-cat');
      const repo = ref && map[ref.key];
      if (!repo || !repo.pushed || !cat || cat.querySelector('.wr-live')) return;
      const el = document.createElement('span');
      el.className = 'wr-live';
      if (repo.stars > 0) {
        const star = document.createElement('span');
        star.innerHTML = '<i class="ph-light ph-star" aria-hidden="true"></i>';
        star.append(String(repo.stars));
        const sep = document.createElement('span');
        sep.className = 'wr-live-sep';
        el.append(star, sep);
      }
      el.append('updated ' + ago(repo.pushed));
      cat.appendChild(el);
    });
  }

  function load() {
    try {
      const c = JSON.parse(sessionStorage.getItem(KEY));
      if (c && Date.now() - c.t < 30 * 60e3) return paint(c.map);
    } catch (e) { /* storage blocked, fetch instead */ }
    const owners = [...new Set(rows.map(repoOf).filter(Boolean).map(r => r.owner))];
    Promise.all(owners.map(o =>
      fetch(`https://api.github.com/users/${encodeURIComponent(o)}/repos?per_page=100`)
        .then(r => (r.ok ? r.json() : []))
        .catch(() => [])
    )).then(lists => {
      const map = {};
      lists.flat().forEach(r => {
        if (r && r.full_name) map[r.full_name.toLowerCase()] = { stars: Number(r.stargazers_count) || 0, pushed: r.pushed_at };
      });
      try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), map })); } catch (e) { /* ignore */ }
      paint(map);
    });
  }

  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    load();
  }, { rootMargin: '600px 0px' });
  io.observe(list);
})();

// ═══════════════════════════════════════════════════
// WORK — project name decodes on hover, same glyph language as the hero
// ═══════════════════════════════════════════════════
(function () {
  if (!canHover || reducedMotion) return;
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01$%';
  document.querySelectorAll('.work-row').forEach(row => {
    const name = row.querySelector('.wr-name');
    if (!name) return;
    const text = name.textContent;
    let busy = false;
    row.addEventListener('mouseenter', () => {
      if (busy) return;
      busy = true;
      name.textContent = '';
      const spans = [...text].map(ch => {
        const s = document.createElement('span');
        s.className = 'wr-ch';
        s.textContent = ch;
        if (ch === ' ') s.style.whiteSpace = 'pre';
        name.appendChild(s);
        return s;
      });
      // lock each glyph's width so the noise characters can't make the line jitter
      spans.forEach(s => { s.style.width = s.getBoundingClientRect().width + 'px'; });
      let left = spans.length;
      const finish = () => {
        if (--left) return;
        name.textContent = text; // back to one text node so kerning returns at rest
        busy = false;
      };
      spans.forEach((s, i) => {
        if (text[i] === ' ') return finish();
        setTimeout(() => {
          let f = 0;
          const iv = setInterval(() => {
            if (f++ < 3) { s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]; return; }
            clearInterval(iv);
            s.textContent = text[i];
            finish();
          }, 32);
        }, i * 22);
      });
    });
  });
})();

// ═══════════════════════════════════════════════════
// FOOTER — Mumbai switches its lights on as you arrive
// ═══════════════════════════════════════════════════
(function () {
  const sky = document.querySelector('.footer-skyline');
  if (!sky || !hasGsap) return;
  gsap.fromTo(sky, { '--lit': 0, y: 50 }, {
    '--lit': 1,
    y: 0,
    ease: 'none',
    scrollTrigger: { trigger: sky, start: 'top bottom', end: 'bottom bottom', scrub: .6 },
  });
})();

// ═══════════════════════════════════════════════════
// HERO — role list ticks through like a live quote board
// ═══════════════════════════════════════════════════
(function () {
  const items = [...document.querySelectorAll('.hero-roles li')];
  if (items.length < 2) return;
  let i = 0;
  items[0].classList.add('is-on');
  if (reducedMotion) return;
  setInterval(() => {
    if (document.hidden || window.scrollY > innerHeight) return;
    items[i].classList.remove('is-on');
    i = (i + 1) % items.length;
    items[i].classList.add('is-on');
  }, 2400);
})();