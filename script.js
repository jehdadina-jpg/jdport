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

  // 3. Hero intro: the train picks up speed, the camera pushes into Jeh's laptop,
  //    the editor fills the screen and cuts to black, landing on "Roots in Finance".
  //    The scene reads trainState.p; this timeline only drives the progress.
  const hero = document.getElementById('page1');
  const trainState = window.trainState || (window.trainState = { p: 0 });
  if (hero && hero.querySelector('.hero-stage')) {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 1 },
    })
      .to(trainState, { p: 1, duration: 1 }, 0)
      .to('.hero-copy', { yPercent: -22, opacity: 0, duration: .22, ease: 'power1.in' }, 0)
      .to('.hero-caption', { opacity: 0, duration: .12 }, 0)
      .to('.hero-scrim', { opacity: 0, duration: .25 }, 0)
      .to('.hero-roles', { y: -30, opacity: 0, duration: .16 }, 0)
      .to('.hero-glow, .hero-glow-2', { opacity: 0, duration: .3 }, .4)
      .to('.zoom-black', { opacity: 1, duration: .12 }, .84);
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
// CENTRAL LINE — over-the-shoulder shot of Jeh coding on a fast local at night.
// Everything is drawn live in a 1600×900 world; scroll pushes into the laptop.
// ═══════════════════════════════════════════════════
(function () {
  const cv = document.getElementById('train-canvas');
  const hero = document.getElementById('page1');
  const stage = hero && hero.querySelector('.hero-stage');
  if (!cv || !stage) return;
  const ctx = cv.getContext('2d');
  const state = window.trainState || (window.trainState = { p: 0 });
  const WW = 1600, WH = 900;
  const MONO = '"Geist Mono", ui-monospace, Consolas, monospace';
  const DEVA = '"Nirmala UI", "Kohinoor Devanagari", "Noto Sans Devanagari", sans-serif';

  const hash = (i, k) => { const x = Math.sin(i * 127.1 + (k || 0) * 311.7) * 43758.5453; return x - Math.floor(x); };
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeO = t => 1 - Math.pow(1 - t, 3);

  // ── Openings in the far wall (world coords)
  const WIN1 = { x: 170, y: 235, w: 470, h: 220, r: 22 };
  const DOOR = { x: 820, y: 150, w: 220, h: 470, r: 10 };
  const WIN2 = { x: 1100, y: 235, w: 440, h: 220, r: 22 };
  const HORIZON = 470, FLOOR = 620;

  function rr(c, x, y, w, h, r) {
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  const openings = new Path2D();
  [WIN1, DOOR, WIN2].forEach(o => rr(openings, o.x, o.y, o.w, o.h, o.r));

  // ── Laptop (ROG Zephyrus Duo) quads
  const LID = [[972, 462], [1246, 446], [1252, 652], [978, 664]];
  const DISP = [[983, 472], [1236, 457], [1242, 641], [989, 653]];
  const PAD = [[986, 669], [1250, 657], [1256, 694], [991, 708]];
  const DECK = [[991, 708], [1256, 694], [1292, 744], [974, 760]];
  const quad = q => { const p = new Path2D(); p.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) p.lineTo(q[i][0], q[i][1]); p.closePath(); return p; };
  const lidPath = quad(LID), dispPath = quad(DISP), padPath = quad(PAD), deckPath = quad(DECK);
  const SCREEN_C = [1112, 556];

  // ── Jeh, from behind: curly hair, black shirt
  const HEAD = { x: 1312, y: 388, rx: 106, ry: 98 };
  const figure = new Path2D();
  const torso = new Path2D();
  torso.moveTo(1036, 900);
  torso.bezierCurveTo(1046, 800, 1066, 716, 1100, 664);
  torso.bezierCurveTo(1120, 632, 1146, 612, 1176, 598);
  torso.bezierCurveTo(1206, 584, 1236, 560, 1258, 528);
  torso.lineTo(1352, 530);
  torso.bezierCurveTo(1384, 560, 1430, 576, 1478, 590);
  torso.bezierCurveTo(1530, 606, 1556, 640, 1564, 700);
  torso.bezierCurveTo(1574, 770, 1586, 840, 1600, 900);
  torso.closePath();
  figure.addPath(torso);
  const neck = new Path2D();
  neck.moveTo(1262, 452); neck.lineTo(1346, 458); neck.lineTo(1354, 534); neck.lineTo(1256, 534); neck.closePath();
  figure.addPath(neck);
  const hair = new Path2D();
  hair.ellipse(HEAD.x, HEAD.y, HEAD.rx, HEAD.ry, -.16, 0, Math.PI * 2);
  for (let i = 0; i < 96; i++) {
    const th = (i / 96) * Math.PI * 2;
    const nape = Math.max(0, Math.sin(th + .16));
    const crown = Math.max(0, -Math.sin(th + .16));
    const r = lerp(12 + hash(i, 2) * 11 + crown * 6, 7 + hash(i, 2) * 4, Math.pow(nape, 2));
    const out = lerp(2 + hash(i, 3) * 13 + crown * 8, -8, Math.pow(nape, 1.4));
    const cx = HEAD.x + Math.cos(th - .16) * (HEAD.rx + out - r * .45);
    const cy = HEAD.y + Math.sin(th - .16) * (HEAD.ry + out - r * .45);
    hair.moveTo(cx + r, cy);
    hair.arc(cx, cy, r, 0, Math.PI * 2);
  }
  figure.addPath(hair);
  const tube = (pts, w0, w1) => {
    const p = new Path2D();
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
      L.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]);
      R.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]);
    }
    p.moveTo(L[0][0], L[0][1]);
    L.forEach(q => p.lineTo(q[0], q[1]));
    R.reverse().forEach(q => p.lineTo(q[0], q[1]));
    p.closePath();
    const e = pts[pts.length - 1];
    p.moveTo(e[0] + w1 / 2, e[1]);
    p.arc(e[0], e[1], w1 / 2, 0, Math.PI * 2);
    return p;
  };
  const armR = tube([[1548, 700], [1532, 780], [1470, 812], [1360, 784], [1262, 748]], 76, 34);
  const armL = tube([[1110, 720], [1092, 748], [1064, 754]], 46, 26);
  figure.addPath(armR);
  figure.addPath(armL);
  const PARTS = [torso, neck, hair, armR, armL];
  const fillFig = c => PARTS.forEach(pp => c.fill(pp));

  // ── Editor content: real-ish Python that types itself out
  const SNIPPETS = [
    {
      file: 'detect.py', repo: 'anomaly-terminal', crumbs: 'anomaly-terminal › core › detect.py',
      code: [
        'import numpy as np',
        'import pandas as pd',
        'from sklearn.ensemble import IsolationForest',
        '',
        '',
        'def flag_anomalies(candles: pd.DataFrame, z: float = 4.0):',
        '    """Flag sessions that move more than z sigma."""',
        '    r = np.log(candles.close).diff().dropna()',
        '    score = (r - r.rolling(50).mean()) / r.rolling(50).std()',
        '',
        '    forest = IsolationForest(contamination=0.01, random_state=7)',
        '    iso = forest.fit_predict(r.to_frame())',
        '',
        '    hits = candles.loc[(score.abs() > z) | (iso == -1)]',
        '    return hits.assign(sigma=score.abs().round(1))',
      ],
      term: ['$ python -m core.detect --ticker NIFTY50 --tf 1d', 'loaded 2,481 sessions  ·  2016-01-01 → today', '✓ 3 anomalies flagged  ·  max 4.2σ on 2024-06-04'],
    },
    {
      file: 'match.py', repo: 'swiperight', crumbs: 'swiperight › engine › match.py',
      code: [
        'from dataclasses import dataclass',
        '',
        '',
        '@dataclass(frozen=True)',
        'class Card:',
        '    name: str',
        '    annual_fee: float',
        '    rates: dict[str, float]',
        '',
        '',
        'def best_card(spend: dict[str, float], cards: list[Card]) -> Card:',
        '    """The one card that pays you most for how you spend."""',
        '    def yearly(card: Card) -> float:',
        '        earn = sum(card.rates.get(c, 0.01) * amt for c, amt in spend.items())',
        '        return 12 * earn - card.annual_fee',
        '',
        '    return max(cards, key=yearly)',
      ],
      term: ['$ python -m engine.match statement.pdf', 'parsed 312 txns  ·  13 categories  ·  140 cards', '✓ best match  ·  +₹18,240 / yr'],
    },
  ];
  const KW = /^(import|from|def|return|class|for|in|if|else|lambda|as|and|or|not|None|True|False)$/;
  function tokens(line) {
    const out = [];
    const re = /(#.*$)|("""[^]*?"""|"[^"]*"|'[^']*')|(@\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|(\s+)|([^\sA-Za-z_\d"'#@]+)/g;
    let m, prev = '';
    while ((m = re.exec(line))) {
      const t = m[0];
      let col = '#c9d1d9';
      if (m[1]) col = '#5c6773';
      else if (m[2]) col = '#F4C98C';
      else if (m[3]) col = '#FF9FBF';
      else if (m[4]) col = '#FF9FBF';
      else if (m[5]) {
        if (KW.test(t)) col = '#B7A3FF';
        else if (prev === 'def' || prev === 'class') col = '#9BF2CF';
        else if (/^[A-Z]/.test(t)) col = '#7cc7ff';
        else if (line[m.index + t.length] === '(') col = '#9BF2CF';
      } else if (m[7]) col = '#8b949e';
      if (m[5]) prev = t;
      out.push([t, col]);
    }
    return out;
  }
  SNIPPETS.forEach(s => { s.tok = s.code.map(tokens); s.total = s.code.reduce((n, l) => n + l.length + 1, 0); });

  let snip = 0, typed = 0, typeAcc = 0, termLines = 0, holdUntil = 0;
  function updateTyping(dt, now, boost) {
    const S = SNIPPETS[snip];
    if (reducedMotion) { typed = S.total; termLines = S.term.length; return; }
    if (typed < S.total) {
      typeAcc += dt * (26 + Math.sin(now / 900) * 10) * (boost || 1);
      while (typeAcc >= 1 && typed < S.total) { typed++; typeAcc -= 1; }
      if (typed >= S.total) holdUntil = now + 500;
    } else if (termLines < S.term.length) {
      if (now > holdUntil) { termLines++; holdUntil = now + (termLines === 1 ? 900 : 700); }
    } else if (now > holdUntil + 4200) {
      snip = (snip + 1) % SNIPPETS.length; typed = 0; termLines = 0;
    }
  }

  const istTime = (sec) => {
    try { return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: sec ? '2-digit' : undefined }); }
    catch (_) { return new Date().toTimeString().slice(0, sec ? 8 : 5); }
  };

  // Editor in a 1280×800 logical space
  function drawEditor(c, now) {
    const S = SNIPPETS[snip];
    c.fillStyle = '#0b0f14';
    c.fillRect(0, 0, 1280, 800);
    c.fillStyle = '#0f141b';
    c.fillRect(0, 0, 1280, 30);
    c.font = `500 13px ${MONO}`;
    c.textAlign = 'center';
    c.fillStyle = '#6e7681';
    c.fillText(`${S.file} — ${S.repo} — Visual Studio Code`, 640, 20);
    c.textAlign = 'left';
    c.fillStyle = '#0d1218';
    c.fillRect(0, 30, 50, 742);
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = i === 0 ? '#c9d1d9' : '#4a525c';
      c.lineWidth = 2;
      c.strokeRect(15, 52 + i * 48, 20, 20);
    }
    c.fillStyle = '#0f141b';
    c.fillRect(50, 30, 1230, 36);
    const tabs = [S.file, snip ? 'statement.py' : 'signals.py', 'README.md'];
    let tx = 50;
    tabs.forEach((t, i) => {
      const w = 34 + t.length * 9;
      c.fillStyle = i === 0 ? '#0b0f14' : '#0f141b';
      c.fillRect(tx, 30, w, 36);
      if (i === 0) { c.fillStyle = '#9BF2CF'; c.fillRect(tx, 30, w, 2); }
      c.fillStyle = i === 0 ? '#e6edf3' : '#6e7681';
      c.font = `500 14px ${MONO}`;
      c.fillText(t, tx + 16, 53);
      tx += w + 1;
    });
    c.fillStyle = '#6e7681';
    c.font = `500 12.5px ${MONO}`;
    c.fillText(S.crumbs, 70, 86);

    // code
    const LH = 25, top = 118;
    c.font = `500 17px ${MONO}`;
    const cw = c.measureText('M').width;
    let rem = typed, curL = 0, curC = 0;
    for (let li = 0; li < S.code.length; li++) {
      const len = S.code[li].length;
      if (rem >= 0 && rem <= len) { curL = li; curC = rem; }
      const shown = Math.max(0, Math.min(len, rem));
      const y = top + li * LH;
      c.fillStyle = rem >= 0 ? '#3d4651' : '#1c2229';
      c.textAlign = 'right';
      c.fillText(String(li + 1), 100, y);
      c.textAlign = 'left';
      let x = 124, left = shown;
      for (const [tk, col] of S.tok[li]) {
        if (left <= 0) break;
        const part = tk.slice(0, left);
        c.fillStyle = col;
        c.fillText(part, x, y);
        x += part.length * cw;
        left -= tk.length;
      }
      rem -= len + 1;
    }
    if (typed >= S.total) { curL = S.code.length - 1; curC = S.code[curL].length; }
    if (Math.floor(now / 530) % 2 === 0 || typed < S.total) {
      c.fillStyle = '#9BF2CF';
      c.fillRect(124 + curC * cw, top + curL * LH - 17, 2.5, 22);
    }
    c.fillStyle = 'rgba(155,242,207,.05)';
    c.fillRect(50, top + curL * LH - 19, 1150, LH);

    // minimap
    for (let li = 0; li < S.code.length; li++) {
      const len = S.code[li].length;
      if (!len) continue;
      c.fillStyle = 'rgba(201,209,217,.16)';
      c.fillRect(1200, 110 + li * 4, Math.min(64, len * .9), 2);
    }

    // terminal
    c.fillStyle = '#0d1117';
    c.fillRect(50, 560, 1230, 212);
    c.fillStyle = '#1b222b';
    c.fillRect(50, 560, 1230, 1);
    c.font = `600 12px ${MONO}`;
    ['TERMINAL', 'PROBLEMS', 'OUTPUT', 'PORTS'].forEach((t, i) => {
      c.fillStyle = i === 0 ? '#e6edf3' : '#6e7681';
      c.fillText(t, 74 + i * 108, 588);
      if (!i) { c.fillStyle = '#9BF2CF'; c.fillRect(74, 595, 72, 2); }
    });
    c.font = `500 15px ${MONO}`;
    for (let i = 0; i < termLines; i++) {
      const line = S.term[i];
      c.fillStyle = line.startsWith('✓') ? '#9BF2CF' : line.startsWith('$') ? '#e6edf3' : '#8b949e';
      c.fillText(line, 74, 630 + i * 26);
    }
    if (termLines >= S.term.length || typed < S.total) {
      const py = 630 + termLines * 26;
      c.fillStyle = '#e6edf3';
      c.fillText('$', 74, py);
      if (Math.floor(now / 530) % 2 === 0) c.fillRect(92, py - 13, 9, 17);
    }

    // status bar
    c.fillStyle = '#10503d';
    c.fillRect(0, 772, 1280, 28);
    c.font = `500 13px ${MONO}`;
    c.fillStyle = '#e8fff6';
    c.fillText('⎇ main*   ⟳   ⊗ 0  ⚠ 0', 14, 791);
    c.textAlign = 'right';
    c.fillText(`Ln ${curL + 1}, Col ${curC + 1}   Python 3.11   Central · Fast → Thane   ${istTime()}`, 1266, 791);
    c.textAlign = 'left';
  }

  // ScreenPad (second screen) in a 1000×140 logical space
  function drawPad(c, t) {
    c.fillStyle = '#07090f';
    c.fillRect(0, 0, 1000, 140);
    const g = c.createLinearGradient(0, 0, 1000, 0);
    g.addColorStop(0, 'rgba(183,163,255,.18)');
    g.addColorStop(1, 'rgba(155,242,207,.12)');
    c.fillStyle = g;
    c.fillRect(0, 0, 1000, 140);
    for (let i = 0; i < 24; i++) {
      const v = Math.sin(i * .7 + t * .6) * 18 + Math.sin(i * 2.1) * 10;
      const up = Math.cos(i * 1.3 + t * .4) > -.2;
      c.fillStyle = up ? '#9BF2CF' : '#FF7A90';
      c.fillRect(24 + i * 13, 70 - v - 10, 7, 20 + Math.abs(v) * .4);
    }
    c.font = `600 26px ${MONO}`;
    c.fillStyle = '#e6edf3';
    c.fillText('NIFTY 50  25,184.60', 380, 62);
    c.font = `500 20px ${MONO}`;
    c.fillStyle = '#9BF2CF';
    c.fillText('▲ 0.42%   ·   RTX 3060  41%   ·   lo-fi beats', 380, 100);
  }

  // Map a w×h logical space onto a parallelogram given by three corners (in device px)
  function setQuad(c, tl, tr, bl, w, h) {
    c.setTransform((tr[0] - tl[0]) / w, (tr[1] - tl[1]) / w, (bl[0] - tl[0]) / h, (bl[1] - tl[1]) / h, tl[0], tl[1]);
  }

  // ── Scenery state
  let off = 0, speed = 0;
  const events = { kind: null, start: 0, next: 4 };
  const STATIONS = ['CURREY ROAD', 'PAREL', 'MATUNGA', 'SION', 'VIDYAVIHAR', 'VIKHROLI'];
  let stationName = STATIONS[0];

  // Skyline strips, rendered once per scale. Indices wrap (k = i mod N) so the strip tiles seamlessly.
  let stripCache = null;
  function skyStrips() {
    const res = Math.max(.35, s * dpr * .5);
    if (stripCache && stripCache.res === res) return stripCache;
    const make = (N, tile, H, paint) => {
      const P = N * tile;
      const cvs = document.createElement('canvas');
      cvs.width = Math.ceil(P * res);
      cvs.height = Math.ceil(H * res);
      const c = cvs.getContext('2d');
      c.scale(res, res);
      for (let i = -3; i < N + 3; i++) paint(c, i, ((i % N) + N) % N, P);
      return { cv: cvs, P, H };
    };
    const far = make(40, 86, HORIZON + 4, (c, i, k) => {
      const x = i * 86 + hash(k, 1) * 24;
      const w = 46 + hash(k, 2) * 62, h = 60 + Math.pow(hash(k, 3), 2) * 230;
      const y = HORIZON - h;
      c.fillStyle = '#0a0d17';
      c.fillRect(x, y, w, h);
      for (let wy = y + 8; wy < HORIZON - 6; wy += 11) {
        for (let wx = 5; wx < w - 5; wx += 9) {
          const r = hash(k * 131 + wx * .7, wy * .3);
          if (r > .78) {
            c.fillStyle = r > .93 ? 'rgba(190,225,255,.45)' : 'rgba(255,196,120,.5)';
            c.fillRect(x + wx, wy, 3, 4);
          }
        }
      }
    });
    const mid = make(30, 150, HORIZON + 52, (c, i, k) => {
      const x = i * 150;
      const w = 110 + hash(k, 4) * 60, h = 40 + hash(k, 5) * 120;
      const y = HORIZON + 20 - h;
      c.fillStyle = '#06070c';
      c.fillRect(x, y, w, h + 30);
      if (hash(k, 6) > .5) { c.fillRect(x + w * .6, y - 22, 26, 22); c.fillRect(x + w * .6 + 4, y - 26, 18, 4); }
      for (let wy = y + 10; wy < y + h; wy += 20) {
        for (let wx = 8; wx < w - 10; wx += 18) {
          const r = hash(k * 71 + wx, wy);
          if (r > .62) {
            c.fillStyle = r > .95 ? 'rgba(120,170,255,.4)' : 'rgba(255,180,90,.55)';
            c.fillRect(x + wx, wy, 8, 9);
          }
        }
      }
      if (k % 7 === 3) {
        const label = ['VADA PAV 24×7', 'CUTTING CHAI', 'SEA LINK', 'DADAR MKT'][(k / 7 | 0) % 4];
        c.font = `700 15px ${MONO}`;
        const lw = c.measureText(label).width + 22;
        c.fillStyle = '#0b0b10';
        c.fillRect(x + 10, y - 50, lw, 30);
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(255,79,163,.16)';
        c.fillRect(x + 4, y - 56, lw + 12, 42);
        c.globalCompositeOperation = 'source-over';
        c.fillStyle = '#ff7cc0';
        c.fillText(label, x + 21, y - 30);
      }
    });
    stripCache = { res, far, mid };
    return stripCache;
  }

  // Draws everything visible through the openings. o = distance travelled (world px)
  function drawOutside(c, t, o, ev) {
    // sky
    const sky = c.createLinearGradient(0, 120, 0, FLOOR);
    sky.addColorStop(0, '#04060d');
    sky.addColorStop(.42, '#0b1024');
    sky.addColorStop(.7, '#2a1626');
    sky.addColorStop(.82, '#46222a');
    sky.addColorStop(1, '#0b0709');
    c.fillStyle = sky;
    c.fillRect(0, 100, WW, FLOOR - 100);

    // far + mid skyline: pre-rendered repeating strips (thousands of lit windows → two blits)
    const strips = skyStrips();
    const fo = o * .035, mo = o * .16;
    [[strips.far, fo], [strips.mid, mo]].forEach(([st, oo]) => {
      const x0 = -(oo % st.P);
      c.drawImage(st.cv, x0, 0, st.P, st.H);
      c.drawImage(st.cv, x0 + st.P, 0, st.P, st.H);
    });
    // aviation lights stay live (a handful per frame)
    for (let i = Math.floor(fo / 86) - 2, e = i + WW / 86 + 5; i < e; i++) {
      const k = ((i % 40) + 40) % 40;
      const h = 60 + Math.pow(hash(k, 3), 2) * 230;
      if (h > 210 && Math.sin(t * 2.4 + k) > .6) {
        const x = i * 86 - fo + hash(k, 1) * 24, w = 46 + hash(k, 2) * 62;
        c.fillStyle = '#ff3b3b';
        c.beginPath(); c.arc(x + w / 2, HORIZON - h - 4, 2.2, 0, 7); c.fill();
      }
    }

    // opposite-direction train
    if (ev.kind === 'train') {
      const k = (t - ev.start) / ev.dur;
      const len = 5200, x0 = WW + 200 - k * (len + WW + 400);
      c.fillStyle = '#151b27';
      c.fillRect(x0, 250, len, 260);
      c.fillStyle = '#5b3d8c';
      c.fillRect(x0, 452, len, 14);
      for (let wx = x0 + 30; wx < x0 + len; wx += 118) {
        if (wx < -120 || wx > WW + 20) continue;
        const door = Math.round((wx - x0) / 118) % 6 === 2;
        c.fillStyle = door ? 'rgba(235,245,255,.9)' : 'rgba(255,236,200,.78)';
        c.fillRect(wx, door ? 290 : 300, door ? 70 : 84, door ? 210 : 72);
        c.fillStyle = 'rgba(20,24,34,.7)';
        if (!door) for (let b = 0; b < 3; b++) c.fillRect(wx, 314 + b * 18, 84, 3);
      }
      const streak = c.createLinearGradient(0, 0, WW, 0);
      streak.addColorStop(0, 'rgba(255,240,220,.0)');
      streak.addColorStop(.5, 'rgba(255,240,220,.08)');
      streak.addColorStop(1, 'rgba(255,240,220,.0)');
      c.fillStyle = streak;
      c.fillRect(0, 250, WW, 260);
    }

    // trackside wall + sodium lamps
    const wo = o * .55;
    c.fillStyle = '#08090d';
    c.fillRect(0, HORIZON, WW, 50);
    for (let i = Math.floor(wo / 64) - 1, e = i + WW / 64 + 3; i < e; i++) {
      c.fillStyle = '#0c0d12';
      c.fillRect(i * 64 - wo, HORIZON - 4, 10, 54);
    }
    const lamps = [];
    const lo = o * .82, lt = 760;
    for (let i = Math.floor(lo / lt) - 1, e = i + WW / lt + 3; i < e; i++) {
      const x = i * lt - lo + 300;
      c.fillStyle = '#0b0c10';
      c.fillRect(x - 3, 190, 6, HORIZON - 190);
      c.fillRect(x - 3, 190, 46, 5);
      const g = c.createRadialGradient(x + 40, 198, 0, x + 40, 198, 150);
      g.addColorStop(0, 'rgba(255,170,70,.95)');
      g.addColorStop(.08, 'rgba(255,150,60,.55)');
      g.addColorStop(1, 'rgba(255,120,40,0)');
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = g;
      c.fillRect(x - 120, 40, 320, 320);
      c.fillStyle = 'rgba(255,200,120,.9)';
      c.fillRect(x + 28 - speed * .004, 196, 26 + speed * .008, 5);
      c.globalCompositeOperation = 'source-over';
      lamps.push(x + 40);
    }

    // platform (fast local blowing through a station)
    if (ev.kind === 'station') {
      const k = (t - ev.start) / ev.dur;
      const len = 4200, x0 = WW + 100 - k * (len + WW + 200);
      c.fillStyle = '#1a1c22';
      c.fillRect(x0, 200, len, 18);
      for (let px = x0 + 80; px < x0 + len; px += 260) {
        if (px < -40 || px > WW + 40) continue;
        c.fillStyle = '#1d3a33';
        c.fillRect(px, 218, 12, 300);
        c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(px + 120, 226, 0, px + 120, 226, 170);
        g.addColorStop(0, 'rgba(220,240,255,.5)');
        g.addColorStop(1, 'rgba(220,240,255,0)');
        c.fillStyle = g;
        c.fillRect(px - 60, 120, 360, 300);
        c.fillStyle = 'rgba(235,248,255,.95)';
        c.fillRect(px + 70, 220, 100, 4);
        c.globalCompositeOperation = 'source-over';
      }
      for (let bx = x0 + 600; bx < x0 + len; bx += 1500) {
        if (bx < -300 || bx > WW + 20) continue;
        c.fillStyle = '#f2c230';
        c.fillRect(bx, 288, 260, 52);
        c.strokeStyle = '#111';
        c.lineWidth = 3;
        c.strokeRect(bx + 5, 293, 250, 42);
        c.fillStyle = '#111';
        c.font = `700 24px ${MONO}`;
        c.textAlign = 'center';
        c.fillText(stationName, bx + 130, 323);
        c.textAlign = 'left';
      }
      c.fillStyle = '#2b2e36';
      c.fillRect(x0, 500, len, 60);
      c.fillStyle = '#d8b12a';
      c.fillRect(x0, 552, len, 6);
      for (let hx = x0 + 300; hx < x0 + len; hx += 420) {
        if (hx < -40 || hx > WW + 40) continue;
        const hh = 70 + hash(hx | 0, 9) * 20;
        c.fillStyle = '#07080b';
        c.beginPath();
        c.ellipse(hx, 500 - hh + 12, 11, 13, 0, 0, 7);
        c.fill();
        c.fillRect(hx - 15, 500 - hh + 24, 30, hh - 24);
      }
    }

    // masts, cantilevers, overhead wires, signals
    const ma = o * 1.0, mtile = 920;
    const masts = [];
    for (let i = Math.floor(ma / mtile) - 1, e = i + WW / mtile + 3; i < e; i++) masts.push(i * mtile - ma + 120);
    c.strokeStyle = 'rgba(20,22,30,.95)';
    c.lineWidth = 2;
    [205, 232].forEach((wy, wi) => {
      c.beginPath();
      for (let m = 0; m < masts.length - 1; m++) {
        const a = masts[m], b = masts[m + 1];
        for (let s = 0; s <= 20; s++) {
          const x = lerp(a, b, s / 20), sag = Math.sin(Math.PI * s / 20) * (wi ? 6 : 16);
          s === 0 && m === 0 ? c.moveTo(x, wy + sag) : c.lineTo(x, wy + sag);
        }
      }
      c.stroke();
    });
    masts.forEach((x, k) => {
      const blur = Math.min(1, speed / 2600);
      c.fillStyle = `rgba(12,13,18,${1 - blur * .35})`;
      c.fillRect(x - 9 - blur * 6, 120, 18 + blur * 12, HORIZON + 60 - 120);
      c.fillRect(x - 120, 200, 120, 6);
      c.fillRect(x - 118, 226, 4, 10);
      const idx = Math.round((x + ma - 120) / mtile);
      if (idx % 3 === 0) {
        c.fillStyle = '#0a0b0e';
        c.fillRect(x + 12, 300, 20, 46);
        const g = c.createRadialGradient(x + 22, 312, 0, x + 22, 312, 26);
        g.addColorStop(0, 'rgba(90,255,170,1)');
        g.addColorStop(1, 'rgba(90,255,170,0)');
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = g;
        c.fillRect(x - 10, 280, 64, 64);
        c.globalCompositeOperation = 'source-over';
      }
    });

    // ballast + rails (only seen through the door)
    c.fillStyle = '#07080a';
    c.fillRect(0, HORIZON + 50, WW, FLOOR - HORIZON - 50);
    const so = o * 1.45;
    c.fillStyle = 'rgba(40,36,34,.55)';
    for (let i = Math.floor(so / 46) - 1, e = i + WW / 46 + 3; i < e; i++) c.fillRect(i * 46 - so, 566, 16 + speed * .004, 44);
    c.fillStyle = 'rgba(160,150,140,.5)';
    c.fillRect(0, 572, WW, 3);
    c.fillRect(0, 600, WW, 4);
    return lamps;
  }

  // ── Interior far wall, ceiling, racks, benches, handles
  function drawInterior(c, t, sway, light) {
    // wall with holes
    const wall = new Path2D();
    wall.rect(0, 0, WW, FLOOR);
    wall.addPath(openings);
    const wg = c.createLinearGradient(0, 100, 0, FLOOR);
    wg.addColorStop(0, '#0d121b');
    wg.addColorStop(1, '#090c12');
    c.fillStyle = wg;
    c.fill(wall, 'evenodd');
    // ceiling
    c.fillStyle = '#0c1017';
    c.fillRect(0, 0, WW, 112);
    c.fillStyle = '#1b2230';
    c.fillRect(0, 108, WW, 4);
    // panel seams + rivets
    c.fillStyle = 'rgba(255,255,255,.035)';
    [140, 160, 470, 600].forEach(y => c.fillRect(0, y, WW, 1));
    c.fillStyle = 'rgba(255,255,255,.07)';
    for (let x = 30; x < WW; x += 54) { c.fillRect(x, 146, 2, 2); c.fillRect(x, 606, 2, 2); }
    // window frames: rubber gasket + bars
    [WIN1, WIN2].forEach(w => {
      c.strokeStyle = '#06080c';
      c.lineWidth = 8;
      c.beginPath(); rr(c, w.x - 2, w.y - 2, w.w + 4, w.h + 4, w.r + 2); c.stroke();
      c.strokeStyle = 'rgba(160,175,200,.16)';
      c.lineWidth = 1.5;
      c.beginPath(); rr(c, w.x - 7, w.y - 7, w.w + 14, w.h + 14, w.r + 6); c.stroke();
      for (let b = 0; b < 4; b++) {
        const by = w.y + 42 + b * 46;
        c.fillStyle = '#1d2431';
        c.fillRect(w.x, by, w.w, 9);
        c.fillStyle = 'rgba(200,215,235,.18)';
        c.fillRect(w.x, by, w.w, 1.5);
        c.fillStyle = `rgba(255,170,80,${light.lamp * .5})`;
        c.fillRect(w.x, by, w.w, 1.5);
      }
    });
    // door frame + pole
    c.fillStyle = '#1a202c';
    c.fillRect(DOOR.x - 16, DOOR.y - 12, 16, DOOR.h + 12);
    c.fillRect(DOOR.x + DOOR.w, DOOR.y - 12, 16, DOOR.h + 12);
    c.fillRect(DOOR.x - 16, DOOR.y - 14, DOOR.w + 32, 14);
    c.fillStyle = '#d6a72a';
    c.fillRect(DOOR.x - 16, FLOOR - 6, DOOR.w + 32, 6);
    const pole = c.createLinearGradient(924, 0, 938, 0);
    pole.addColorStop(0, '#2a313d');
    pole.addColorStop(.45, `rgb(${170 + light.lamp * 80},${180 + light.lamp * 30},${195 - light.lamp * 60})`);
    pole.addColorStop(1, '#1b212b');
    c.fillStyle = pole;
    c.fillRect(924, DOOR.y, 14, DOOR.h);
    // LED next-station board above the door
    c.fillStyle = '#050506';
    c.fillRect(828, 116, 204, 28);
    c.save();
    c.beginPath(); c.rect(832, 118, 196, 24); c.clip();
    const msg = '  पुढील स्थानक: दादर  •  NEXT STATION: DADAR  •  अगला स्टेशन: दादर  •';
    c.font = `600 15px ${MONO}, ${DEVA}`;
    const mw = c.measureText(msg).width;
    const mx = 1028 - ((t * 60) % mw);
    c.fillStyle = 'rgba(255,42,26,.14)';
    c.fillRect(832, 118, 196, 24);
    c.fillStyle = '#ff4a2a';
    c.fillText(msg, mx, 136);
    c.fillText(msg, mx + mw, 136);
    c.restore();
    c.fillStyle = 'rgba(5,5,6,.55)';
    for (let x = 832; x < 1028; x += 3) c.fillRect(x, 118, 1, 24);
    // route strip above window 2
    c.fillStyle = 'rgba(236,236,230,.86)';
    c.fillRect(1112, 206, 416, 20);
    c.font = `600 9px ${MONO}`;
    const route = ['CSMT', 'BYCULLA', 'DADAR', 'KURLA', 'GHATKOPAR', 'THANE'];
    route.forEach((s, i) => {
      const x = 1126 + i * 78;
      c.fillStyle = i === 2 ? '#d1361f' : '#2c3a8c';
      c.beginPath(); c.arc(x, 216, 3.4, 0, 7); c.fill();
      c.fillStyle = '#1a1a1a';
      c.fillText(s, x + 6, 219);
    });
    // a faded "Bengali Baba" sticker, as tradition demands
    c.save();
    c.translate(706, 300);
    c.rotate(-.04);
    c.fillStyle = 'rgba(214,196,150,.16)';
    c.fillRect(0, 0, 86, 110);
    c.fillStyle = 'rgba(160,40,40,.32)';
    c.font = `700 10px ${MONO}`;
    ['BENGALI', 'BABA', '', '100%', 'GUARANTEE', 'LOVE·JOB', 'EXAM'].forEach((l, i) => c.fillText(l, 8, 18 + i * 13));
    c.restore();
    // benches
    [[130, 800], [1060, 1600]].forEach(([a, b]) => {
      c.fillStyle = '#121b2c';
      c.fillRect(a, 462, b - a, 82);
      c.fillStyle = 'rgba(255,255,255,.04)';
      for (let x = a + 24; x < b; x += 48) c.fillRect(x, 466, 1, 74);
      c.fillStyle = '#17233a';
      c.fillRect(a, 544, b - a, 30);
      c.fillStyle = '#0c111b';
      c.fillRect(a, 574, b - a, 46);
      c.fillStyle = 'rgba(160,190,255,.08)';
      c.fillRect(a, 544, b - a, 2);
    });
    // luggage racks
    [[110, 810], [1050, 1600]].forEach(([a, b]) => {
      c.fillStyle = '#232b39';
      c.fillRect(a, 176, b - a, 5);
      c.fillRect(a, 196, b - a, 4);
      c.fillStyle = 'rgba(180,195,220,.1)';
      for (let x = a; x < b; x += 14) c.fillRect(x, 181, 1, 15);
      c.fillStyle = 'rgba(200,215,240,.2)';
      c.fillRect(a, 196, b - a, 1);
    });
    // tube lights + fans
    [[180, 500], [1060, 1380]].forEach(([a, b], i) => {
      const flick = i === 1 && Math.sin(t * 13) > .97 ? .35 : 1;
      c.fillStyle = `rgba(225,242,255,${.95 * flick})`;
      c.fillRect(a, 74, b - a, 9);
      c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(0, 40, 0, 200);
      g.addColorStop(0, `rgba(170,210,255,${.0})`);
      g.addColorStop(.25, `rgba(170,210,255,${.18 * flick})`);
      g.addColorStop(1, 'rgba(170,210,255,0)');
      c.fillStyle = g;
      c.fillRect(a - 60, 40, b - a + 120, 160);
      c.globalCompositeOperation = 'source-over';
    });
    [700, 1500].forEach(fx => {
      c.fillStyle = '#10141c';
      c.fillRect(fx - 4, 60, 8, 22);
      c.beginPath(); c.ellipse(fx, 92, 34, 12, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(120,135,160,.35)';
      c.lineWidth = 1;
      for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(fx, 92, 34 - k * 6, 12 - k * 2, 0, 0, 7); c.stroke(); }
      c.fillStyle = `rgba(140,155,180,${.18 + Math.sin(t * 40 + fx) * .06})`;
      c.beginPath(); c.ellipse(fx, 92, 30, 5, 0, 0, 7); c.fill();
    });
    // floor
    const fg = c.createLinearGradient(0, FLOOR, 0, WH);
    fg.addColorStop(0, '#0a0d13');
    fg.addColorStop(1, '#050608');
    c.fillStyle = fg;
    c.fillRect(0, FLOOR, WW, WH - FLOOR);
    c.fillStyle = 'rgba(255,255,255,.03)';
    [640, 668, 708, 768, 850].forEach(y => c.fillRect(0, y, WW, 1));
    // door light spilling onto the floor
    c.globalCompositeOperation = 'lighter';
    const spill = c.createLinearGradient(0, FLOOR, 0, FLOOR + 170);
    spill.addColorStop(0, `rgba(255,170,90,${.1 + light.lamp * .22 + light.flash * .25})`);
    spill.addColorStop(1, 'rgba(255,170,90,0)');
    c.fillStyle = spill;
    c.beginPath();
    c.moveTo(DOOR.x, FLOOR); c.lineTo(DOOR.x + DOOR.w, FLOOR); c.lineTo(DOOR.x + DOOR.w + 140, FLOOR + 170); c.lineTo(DOOR.x - 140, FLOOR + 170); c.closePath();
    c.fill();
    c.globalCompositeOperation = 'source-over';
    // grab handles, swinging with the train
    for (let i = 0; i < 11; i++) {
      const hx = 150 + i * 132;
      if (hx > 1120 && hx < 1480) continue;
      const a = Math.sin(t * 1.25 + i * .55) * .06 + sway * .9;
      const len = 92;
      const ex = hx + Math.sin(a) * len, ey = 122 + Math.cos(a) * len;
      c.strokeStyle = '#141923';
      c.lineWidth = 3;
      c.beginPath(); c.moveTo(hx, 122); c.lineTo(ex, ey); c.stroke();
      c.save();
      c.translate(ex, ey + 15);
      c.rotate(-a);
      c.strokeStyle = '#3c424e';
      c.lineWidth = 5;
      c.beginPath(); c.ellipse(0, 0, 13, 15, 0, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(210,225,245,.22)';
      c.lineWidth = 1.2;
      c.beginPath(); c.ellipse(0, 0, 13, 15, 0, 3.6, 5.2); c.stroke();
      c.restore();
    }
    // glass sheen on the windows
    [WIN1, WIN2].forEach(w => {
      c.save();
      c.beginPath(); rr(c, w.x, w.y, w.w, w.h, w.r); c.clip();
      const sh = c.createLinearGradient(w.x, w.y, w.x + w.w * .6, w.y + w.h);
      sh.addColorStop(0, 'rgba(200,220,255,0)');
      sh.addColorStop(.45, 'rgba(200,220,255,.06)');
      sh.addColorStop(.5, 'rgba(200,220,255,0)');
      c.fillStyle = sh;
      c.fillRect(w.x, w.y, w.w, w.h);
      c.restore();
    });
    c.fillStyle = '#1d2433';
    c.fillRect(0, 118, WW, 5);
  }

  function drawLaptop(c, t) {
    c.fillStyle = '#0a0b0f';
    c.fill(lidPath);
    c.strokeStyle = 'rgba(160,170,200,.22)';
    c.lineWidth = 1.2;
    c.stroke(lidPath);
    c.fillStyle = '#0b0c12';
    c.fill(deckPath);
    c.save();
    c.clip(deckPath);
    c.globalCompositeOperation = 'lighter';
    for (let r = 0; r < 5; r++) {
      for (let k = 0; k < 15; k++) {
        const u = (k + .5) / 15, v = (r + .7) / 5.6;
        const x = lerp(lerp(DECK[0][0], DECK[1][0], u), lerp(DECK[3][0], DECK[2][0], u), v);
        const y = lerp(lerp(DECK[0][1], DECK[1][1], u), lerp(DECK[3][1], DECK[2][1], u), v);
        const hue = 250 + Math.sin(t * .8 + k * .3 + r) * 40;
        c.fillStyle = `hsla(${hue},90%,62%,.55)`;
        c.fillRect(x - 6, y - 2, 12, 3);
      }
    }
    c.restore();
    c.fillStyle = '#08090d';
    c.fill(padPath);
    c.save();
    c.clip(padPath);
    setQuadWorld(c, PAD[0], PAD[1], PAD[3], 1000, 140);
    drawPad(c, t);
    c.restore();
    c.font = `600 7px ${MONO}`;
    c.fillStyle = 'rgba(200,205,220,.4)';
    c.fillText('ROG  ZEPHYRUS', 1088, 661);
  }

  // world → device transform, shared so screen-space overlays can use it
  let vw = 1, vh = 1, dpr = 1, s = 1, ox = 0, oy = 0, mobile = false;
  let cam = { z: 1, fx: SCREEN_C[0], fy: SCREEN_C[1], dx: 0, dy: 0, rot: 0 };
  function worldMatrix() {
    const sfx = SCREEN_C[0] * s + ox, sfy = SCREEN_C[1] * s + oy;
    const k = s * cam.z;
    return { k, tx: ox * cam.z + sfx * (1 - cam.z) + cam.dx, ty: oy * cam.z + sfy * (1 - cam.z) + cam.dy };
  }
  function applyWorld(c, q) {
    const m = worldMatrix(), f = dpr * (q || 1);
    c.setTransform(f * m.k, 0, 0, f * m.k, f * m.tx, f * m.ty);
    if (cam.rot) { c.translate(WW / 2, WH / 2); c.rotate(cam.rot); c.translate(-WW / 2, -WH / 2); }
  }
  // inside a world transform, map a logical space onto a world quad
  function setQuadWorld(c, tl, tr, bl, w, h) {
    c.transform((tr[0] - tl[0]) / w, (tr[1] - tl[1]) / w, (bl[0] - tl[0]) / h, (bl[1] - tl[1]) / h, tl[0], tl[1]);
  }
  function toScreen(p) {
    const m = worldMatrix();
    let x = p[0], y = p[1];
    if (cam.rot) {
      const cx = WW / 2, cy = WH / 2, cs = Math.cos(cam.rot), sn = Math.sin(cam.rot);
      const dx = x - cx, dy = y - cy;
      x = cx + dx * cs - dy * sn; y = cy + dx * sn + dy * cs;
    }
    return [x * m.k + m.tx, y * m.k + m.ty];
  }

  function drawFigure(c, light, t) {
    c.fillStyle = '#050608';
    c.fill(torso);
    c.fillStyle = '#120b09';
    c.fill(neck);
    c.fillStyle = '#060709';
    c.fill(armR);
    c.fill(armL);
    // hands on the keyboard, underlit by the RGB deck
    [[1244, 744, .22], [1056, 753, -.25]].forEach(([x, y, r], i) => {
      c.save();
      c.translate(x + Math.sin(t * 17 + i * 2) * (reducedMotion ? 0 : 1.4), y);
      c.rotate(r);
      c.fillStyle = '#1a100c';
      c.beginPath(); c.ellipse(0, 0, 21, 9, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(150,110,255,.12)';
      c.beginPath(); c.ellipse(0, 5, 16, 3, 0, 0, 7); c.fill();
      c.restore();
    });
    // collar
    c.fillStyle = '#08090c';
    c.beginPath();
    c.moveTo(1250, 536); c.quadraticCurveTo(1262, 512, 1304, 518); c.quadraticCurveTo(1346, 510, 1360, 534); c.quadraticCurveTo(1304, 546, 1250, 536);
    c.fill();
    c.strokeStyle = 'rgba(160,175,210,.12)';
    c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(1252, 534); c.quadraticCurveTo(1264, 512, 1304, 518); c.quadraticCurveTo(1344, 511, 1358, 532); c.stroke();
    // ear, jaw sliver, earbud
    c.fillStyle = '#1c110c';
    c.beginPath(); c.ellipse(1222, 426, 12, 20, .25, 0, 7); c.fill();
    c.beginPath();
    c.moveTo(1218, 446); c.quadraticCurveTo(1212, 482, 1240, 506); c.lineTo(1266, 506); c.lineTo(1256, 444); c.closePath();
    c.fill();
    c.fillStyle = '#dfe4ea';
    c.beginPath(); c.ellipse(1219, 430, 4.5, 5.5, 0, 0, 7); c.fill();
    c.fillRect(1216.5, 434, 3.5, 13);
    // hair: near-black mass with fine curl texture
    c.fillStyle = '#050403';
    c.fill(hair);
    c.save();
    c.clip(hair);
    c.lineCap = 'round';
    for (let i = 0; i < 260; i++) {
      const a = hash(i, 11) * Math.PI * 2, d = Math.sqrt(hash(i, 12));
      const x = HEAD.x + Math.cos(a) * HEAD.rx * d * 1.08, y = HEAD.y + Math.sin(a) * HEAD.ry * d * 1.08;
      const r = 3.5 + hash(i, 13) * 6.5;
      const top = clamp01((HEAD.y - y) / HEAD.ry * .8 + .4);
      c.strokeStyle = `rgba(${40 + top * 34},${32 + top * 26},${28 + top * 22},${.1 + hash(i, 15) * .16})`;
      c.lineWidth = 1.1;
      c.beginPath(); c.arc(x, y, r, hash(i, 16) * 6, hash(i, 16) * 6 + 2.2); c.stroke();
    }
    c.restore();
    // shirt folds catching the tube light
    c.strokeStyle = 'rgba(140,160,200,.05)';
    c.lineWidth = 4;
    c.beginPath(); c.moveTo(1306, 574); c.quadraticCurveTo(1336, 690, 1310, 880); c.stroke();
    c.beginPath(); c.moveTo(1190, 650); c.quadraticCurveTo(1236, 716, 1220, 880); c.stroke();
    c.beginPath(); c.moveTo(1452, 600); c.quadraticCurveTo(1490, 650, 1520, 720); c.stroke();

    // soft screen wash on the near side of the neck/jaw
    c.save();
    c.clip(neck);
    c.globalCompositeOperation = 'lighter';
    const sw = c.createRadialGradient(1190, 486, 0, 1190, 486, 100);
    sw.addColorStop(0, 'rgba(140,160,255,.14)');
    sw.addColorStop(1, 'rgba(140,160,255,0)');
    c.fillStyle = sw;
    c.fillRect(1080, 380, 230, 220);
    c.restore();
  }

  // Crescent rim light: the silhouette minus itself nudged away from the light,
  // tinted by distance to the light, added on top.
  const rimCv = document.createElement('canvas');
  const rimCtx = rimCv.getContext('2d');
  let rimBox = [0, 0, 1, 1];
  function rimLight(c, L, col, w, reach) {
    const r = rimCtx;
    const [bx, by, bw, bh] = rimBox;
    r.setTransform(1, 0, 0, 1, 0, 0);
    r.clearRect(bx, by, bw, bh);
    const m = c.getTransform();
    r.setTransform(m);
    const g = r.createRadialGradient(L[0], L[1], 0, L[0], L[1], reach);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    r.fillStyle = g;
    fillFig(r);
    const dx = L[0] - 1320, dy = L[1] - 600, d = Math.hypot(dx, dy) || 1;
    r.globalCompositeOperation = 'destination-out';
    r.translate(-dx / d * w, -dy / d * w);
    r.fillStyle = '#000';
    fillFig(r);
    r.globalCompositeOperation = 'source-over';
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'lighter';
    c.drawImage(rimCv, bx, by, bw, bh, bx, by, bw, bh);
    c.restore();
  }
  const RB = [1000, 250, 620, 670];
  let rimStatic = null;
  function buildStaticRim(key, R) {
    const out = document.createElement('canvas');
    out.width = Math.ceil(RB[2] * R); out.height = Math.ceil(RB[3] * R);
    const o = out.getContext('2d');
    const tmp = document.createElement('canvas');
    tmp.width = out.width; tmp.height = out.height;
    const tc = tmp.getContext('2d');
    [[[SCREEN_C[0], SCREEN_C[1] - 50], 'rgba(150,190,240,.72)', 4, 360], [[1300, -40], 'rgba(200,222,255,.32)', 3.5, 700]].forEach(([L, col, w, reach]) => {
      tc.setTransform(1, 0, 0, 1, 0, 0);
      tc.clearRect(0, 0, tmp.width, tmp.height);
      tc.setTransform(R, 0, 0, R, -RB[0] * R, -RB[1] * R);
      const g = tc.createRadialGradient(L[0], L[1], 0, L[0], L[1], reach);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      tc.fillStyle = g;
      fillFig(tc);
      const dx = L[0] - 1320, dy = L[1] - 600, d = Math.hypot(dx, dy) || 1;
      tc.globalCompositeOperation = 'destination-out';
      tc.translate(-dx / d * w, -dy / d * w);
      tc.fillStyle = '#000';
      fillFig(tc);
      tc.globalCompositeOperation = 'source-over';
      o.globalCompositeOperation = 'lighter';
      o.drawImage(tmp, 0, 0);
    });
    return { key, cv: out };
  }
  function drawRims(c, light) {
    if (rimCv.width !== cv.width || rimCv.height !== cv.height) { rimCv.width = cv.width; rimCv.height = cv.height; }
    // only the pixels around Jeh need the rim passes
    const a = toScreen([1000, 250]), b = toScreen([1620, 920]);
    const bx = Math.max(0, Math.floor(Math.min(a[0], b[0]) * dpr)), by = Math.max(0, Math.floor(Math.min(a[1], b[1]) * dpr));
    rimBox = [bx, by, Math.max(1, Math.min(cv.width, Math.ceil(Math.max(a[0], b[0]) * dpr)) - bx), Math.max(1, Math.min(cv.height, Math.ceil(Math.max(a[1], b[1]) * dpr)) - by)];
    // static rims (laptop + tube light) only change with zoom: cache them in world space
    const zq = Math.round(cam.z * 40) / 40, key = s + '|' + dpr + '|' + zq;
    if (!rimStatic || rimStatic.key !== key) rimStatic = buildStaticRim(key, s * dpr * zq);
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.drawImage(rimStatic.cv, RB[0], RB[1], RB[2], RB[3]);
    c.restore();
    if (light.lamp > .02) rimLight(c, [light.lampX, 300], `rgba(255,150,60,${.95 * light.lamp})`, 10, 900);
    if (light.flash > .02) rimLight(c, [820, 380], `rgba(225,238,255,${.6 * light.flash})`, 8, 1100);
  }

  // ── Layout
  function resize() {
    vw = stage.clientWidth;
    vh = stage.clientHeight;
    if (!vw || !vh) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(vw * dpr);
    cv.height = Math.round(vh * dpr);
    mobile = vw / vh < 1.05;
    if (mobile) {
      // the copy owns the top; frame the door, Jeh and the laptop in the lower half
      s = Math.max(vw / 760, (vh * .56) / WH);
      ox = vw - 1590 * s;
      oy = vh - WH * s + Math.min(60, vh * .06);
      stage.style.setProperty('--scene-top', (oy / vh * 100).toFixed(1) + '%');
    } else {
      s = Math.max(vw / WW, vh / WH);
      ox = vw - WW * s;
      oy = (vh - WH * s) / 2;
    }
  }

  // ── Loop
  let running = false, rafId = 0, last = 0, t0 = 0;
  const bg = document.createElement('canvas');
  const bctx = bg.getContext('2d');
  const capTime = document.getElementById('hc-time');
  let capLast = 0;

  function frame(now) {
    rafId = 0;
    if (!t0) t0 = now;
    const dt = Math.min(.05, (now - (last || now)) / 1000);
    last = now;
    const t = (now - t0) / 1000;
    const p = state.p || 0;

    const intro = reducedMotion ? 1 : clamp01(t / 2.2);
    const accel = easeIO(clamp01(p / .45));
    const target = reducedMotion ? 0 : (1500 + accel * 3600) * (.35 + .65 * easeO(clamp01(t / 3.5)));
    speed += (target - speed) * Math.min(1, dt * 1.6);
    off += speed * dt;
    updateTyping(dt, now, 1 + 9 * easeIO(clamp01((p - .2) / .4)));

    // events: a train the other way, or a station blurring past
    if (!reducedMotion) {
      if (!events.kind && t > events.next) {
        events.kind = hash(Math.floor(t), 5) > .45 ? 'train' : 'station';
        events.start = t;
        events.dur = events.kind === 'train' ? 1.5 : 2.6 / (speed / 2000);
        if (events.kind === 'station') stationName = STATIONS[Math.floor(hash(t, 8) * STATIONS.length)];
      }
      if (events.kind && t > events.start + events.dur) { events.kind = null; events.next = t + 7 + hash(t, 3) * 9; }
    }
    const flash = events.kind === 'train' ? Math.max(0, Math.sin(clamp01((t - events.start) / events.dur) * Math.PI)) * (.6 + .4 * Math.sin(t * 60)) :
      events.kind === 'station' ? .35 * Math.max(0, Math.sin(t * 9)) : 0;

    // camera: rocking carriage, rail-joint bumps, push-in on scroll
    const joint = (t * speed / 2400) % 1;
    const bump = reducedMotion ? 0 : (Math.exp(-joint * 26) + Math.exp(-Math.max(0, joint - .12) * 26) * (joint > .12 ? 1 : 0)) * 1.4;
    const sway = reducedMotion ? 0 : Math.sin(t * .9) * .012 + Math.sin(t * 2.3) * .004;
    const dive = easeIO(clamp01((p - .28) / .47));
    cam.z = (1 + .3 * easeIO(clamp01(p / .32))) * (1 + dive * 1.6);
    cam.dx = 0;
    cam.dy = bump * s - Math.sin(t * 1.7) * 1.2 * s * (reducedMotion ? 0 : 1);
    cam.rot = sway * .08;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, cv.width, cv.height);

    const BQ = .5;
    if (bg.width !== Math.round(cv.width * BQ)) { bg.width = Math.round(cv.width * BQ); bg.height = Math.round(cv.height * BQ); }
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.fillStyle = '#050505';
    bctx.fillRect(0, 0, bg.width, bg.height);
    applyWorld(bctx, BQ);
    bctx.save();
    bctx.clip(openings);
    const lamps = drawOutside(bctx, t, off, events);
    bctx.restore();

    // how strongly a sodium lamp is shining in right now (and from where)
    let lamp = 0, lampX = 0;
    lamps.forEach(x => {
      [WIN1, DOOR, WIN2].forEach(o => {
        const d = Math.max(0, 1 - Math.abs(x - (o.x + o.w / 2)) / (o.w * .9));
        if (d > lamp) { lamp = d; lampX = x + (x - 800) * .35; }
      });
    });
    const light = { lamp: lamp * (1 - dive), lampX, flash: flash * (1 - dive) };

    drawInterior(bctx, t, sway, light); 
    // interior washes: lamp beams through the openings, sweep, passing-train strobe
    bctx.globalCompositeOperation = 'lighter';
    if (light.lamp > .01) {
      [WIN1, DOOR, WIN2].forEach(o => {
        const dxb = (lampX - (o.x + o.w / 2)) * .6;
        const bm = bctx.createLinearGradient(0, o.y, 0, WH);
        bm.addColorStop(0, `rgba(255,150,60,${.08 * light.lamp})`);
        bm.addColorStop(1, 'rgba(255,150,60,0)');
        bctx.fillStyle = bm;
        bctx.beginPath();
        bctx.moveTo(o.x, o.y); bctx.lineTo(o.x + o.w, o.y);
        bctx.lineTo(o.x + o.w + 260 - dxb, WH); bctx.lineTo(o.x + 60 - dxb, WH);
        bctx.closePath();
        bctx.fill();
      });
      const g = bctx.createRadialGradient(lampX, 560, 0, lampX, 560, 420);
      g.addColorStop(0, `rgba(255,140,50,${.14 * light.lamp})`);
      g.addColorStop(1, 'rgba(255,140,50,0)');
      bctx.fillStyle = g;
      bctx.fillRect(lampX - 420, 140, 840, 760);
    }
    if (light.flash > .01) {
      bctx.fillStyle = `rgba(200,220,255,${.06 * light.flash})`;
      bctx.fillRect(0, 0, WW, WH);
    }
    const sg = bctx.createRadialGradient(SCREEN_C[0], SCREEN_C[1], 0, SCREEN_C[0], SCREEN_C[1], 460);
    sg.addColorStop(0, 'rgba(130,150,255,.12)');
    sg.addColorStop(1, 'rgba(130,150,255,0)');
    bctx.fillStyle = sg;
    bctx.fillRect(SCREEN_C[0] - 460, SCREEN_C[1] - 460, 920, 920);
    bctx.globalCompositeOperation = 'source-over';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = dive > .01 ? `blur(${dive * 4 * dpr}px)` : 'none';
    ctx.drawImage(bg, 0, 0, cv.width, cv.height);
    ctx.filter = 'none';
    applyWorld(ctx);

    drawLaptop(ctx, t);

    // the editor: on the laptop at rest, morphing to fill the viewport on the dive
    const qTL = toScreen(DISP[0]), qTR = toScreen(DISP[1]), qBL = toScreen(DISP[3]);
    const ew = Math.max(vw, vh * 1.6), eh = ew / 1.6;
    const fTL = [(vw - ew) / 2, (vh - eh) / 2], fTR = [(vw + ew) / 2, (vh - eh) / 2], fBL = [(vw - ew) / 2, (vh + eh) / 2];
    const lp = (a, b) => [lerp(a[0], b[0], dive) * dpr, lerp(a[1], b[1], dive) * dpr];
    const drawScreen = () => {
      ctx.save();
      setQuad(ctx, lp(qTL, fTL), lp(qTR, fTR), lp(qBL, fBL), 1280, 800);
      ctx.beginPath(); ctx.rect(0, 0, 1280, 800); ctx.clip();
      drawEditor(ctx, now);
      ctx.restore();
    };

    if (dive <= 0) {
      drawScreen();
      applyWorld(ctx);
      ctx.globalCompositeOperation = 'lighter';
      const bl = ctx.createRadialGradient(SCREEN_C[0], SCREEN_C[1], 60, SCREEN_C[0], SCREEN_C[1], 240);
      bl.addColorStop(0, 'rgba(120,150,255,.12)');
      bl.addColorStop(1, 'rgba(120,150,255,0)');
      ctx.fillStyle = bl;
      ctx.fillRect(SCREEN_C[0] - 240, SCREEN_C[1] - 240, 480, 480);
      ctx.globalCompositeOperation = 'source-over';
      drawFigure(ctx, light, t);
      drawRims(ctx, light);
    } else {
      applyWorld(ctx);
      drawFigure(ctx, light, t);
      drawRims(ctx, light);
    }

    // screen-space grade (scrim + vignette are static CSS layers; see .hero-scrim)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (dive > 0) {
      ctx.fillStyle = `rgba(3,3,4,${dive * .92})`;
      ctx.fillRect(0, 0, vw, vh);
      drawScreen();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (intro < 1) {
      ctx.fillStyle = `rgba(5,5,5,${1 - easeO(intro)})`;
      ctx.fillRect(0, 0, vw, vh);
    }

    if (capTime && now - capLast > 1000) { capTime.textContent = istTime(true) + ' IST'; capLast = now; }
    if (running) rafId = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; last = 0; rafId = requestAnimationFrame(frame); } }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; }

  resize();
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (!running) frame(performance.now()); }, 120); });
  let inView = false;
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; inView && !document.hidden ? start() : stop(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { document.hidden || !inView ? stop() : start(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { stripCache = null; if (!running) frame(performance.now()); });
  cv.classList.add('on');
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
            s.textContent = ch === ' ' ? ' ' : ch;
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
  document.querySelector('.stmt-replay')?.addEventListener('click', ride);

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
// PROJECT RING — 3D carousel: drag / flick / arrows, front card opens the repo
// ═══════════════════════════════════════════════════
(function () {
  const ring = document.querySelector('.ring');
  if (!ring) return;
  const stage = ring.querySelector('.ring-stage');
  const scene = ring.querySelector('.ring-scene');
  const cards = [...ring.querySelectorAll('.ring-card')];
  const cap = ring.querySelector('.ring-caption');
  const idxEl = document.getElementById('ring-idx');
  const nameEl = document.getElementById('ring-name');
  const catEl = document.getElementById('ring-cat');
  const N = cards.length;
  const STEP = 360 / N;

  let radius = 0, rot = 0, tgt = 0, active = 0;
  let tiltX = 0, tiltY = 0, tiltTX = 0, tiltTY = 0;
  let visible = false, hovering = false, rafId = 0, lastAuto = performance.now();
  let drag = null;

  function measure() {
    const cw = cards[0].offsetWidth;
    radius = (cw / 2) / Math.tan(Math.PI / N) * (ring.closest(".work-split") && innerWidth >= 1024 ? 1.06 : 1.18);
  }

  function render() {
    scene.style.transform = `translateZ(${-radius}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    for (let i = 0; i < N; i++) {
      const a = i * STEP + rot;
      const c = Math.cos(a * Math.PI / 180);
      const front = Math.pow(Math.max(0, c), 6);
      const s = 1 + front * .14;
      cards[i].style.transform = `rotateY(${a}deg) translateZ(${radius}px) scale(${s})`;
      cards[i].style.opacity = (.22 + .78 * Math.pow((c + 1) / 2, 1.6)).toFixed(3);
      cards[i].style.setProperty('--tag', front > .6 ? 1 : 0);
    }
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    markRow(i);
    cap.classList.add('swap');
    setTimeout(() => {
      idxEl.textContent = String(i + 1).padStart(2, '0');
      nameEl.textContent = cards[i].querySelector('.ring-tag').textContent.replace(/^\d+ · /, '');
      catEl.textContent = cards[i].dataset.cat;
      cap.classList.remove('swap');
    }, 220);
  }

  const mod = (n, m) => ((n % m) + m) % m;
  const snap = v => Math.round(v / STEP) * STEP;

  function go(dir) {
    tgt = snap(tgt) - dir * STEP;
    lastAuto = performance.now();
    wake();
  }

  function tick(now) {
    rafId = 0;
    if (!drag && !hovering && !reducedMotion && now - lastAuto > 3800) go(1);
    const k = reducedMotion ? 1 : .085;
    rot += (tgt - rot) * k;
    tiltX += (tiltTX - tiltX) * .06;
    tiltY += (tiltTY - tiltY) * .06;
    if (Math.abs(tgt - rot) < .01) rot = tgt;
    render();
    setActive(mod(-Math.round(rot / STEP), N));
    if (visible) rafId = requestAnimationFrame(tick);
  }

  function wake() {
    if (!rafId && visible) rafId = requestAnimationFrame(tick);
  }

  // Drag with momentum, then settle on the nearest card
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, start: tgt, v: 0, lx: e.clientX, lt: performance.now(), moved: false, id: e.pointerId };
  });
  window.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) {
      drag.moved = true;
      stage.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (!drag.moved) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.lt);
    drag.lx = e.clientX;
    drag.lt = now;
    tgt = drag.start + dx * (180 / (Math.PI * radius));
    wake();
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (drag.moved) {
      tgt = snap(tgt + drag.v * 260 * (180 / (Math.PI * radius)));
      stage.classList.remove('dragging');
      ring.dataset.justDragged = '1';
      setTimeout(() => { delete ring.dataset.justDragged; }, 50);
    }
    drag = null;
    lastAuto = performance.now();
    wake();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Clicking a side card brings it forward; only the front card navigates
  cards.forEach((card, i) => card.addEventListener('click', e => {
    if (ring.dataset.justDragged) { e.preventDefault(); return; }
    if (i !== active) {
      e.preventDefault();
      let d = mod(i - active, N);
      if (d > N / 2) d -= N;
      tgt = snap(tgt) - d * STEP;
      lastAuto = performance.now();
      wake();
    }
  }));

  // Hovering a project in the index spins the ring round to it
  function spinTo(i) {
    let d = mod(i - mod(-Math.round(tgt / STEP), N), N);
    if (d > N / 2) d -= N;
    tgt = snap(tgt) - d * STEP;
    lastAuto = performance.now();
    wake();
  }
  const rows = [...document.querySelectorAll('.work-row')];
  const list = document.querySelector('.work-list');
  rows.forEach(row => {
    const i = +row.dataset.i;
    row.addEventListener('mouseenter', () => spinTo(i));
    row.addEventListener('focus', () => spinTo(i));
  });
  if (list) {
    list.addEventListener('mouseenter', () => { hovering = true; });
    list.addEventListener('mouseleave', () => { hovering = false; lastAuto = performance.now(); });
  }
  const markRow = i => rows.forEach(r => r.classList.toggle('is-ring', +r.dataset.i === i));
  markRow(0);

  ring.querySelectorAll('.ring-btn').forEach(b => b.addEventListener('click', () => go(+b.dataset.dir)));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'Enter') cards[active].click();
  });

  // Horizontal trackpad swipes spin it; vertical scroll is left alone
  let wheelLock = 0;
  stage.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLock < 420) return;
    wheelLock = now;
    go(e.deltaX > 0 ? 1 : -1);
  }, { passive: false });

  stage.addEventListener('mouseenter', () => { hovering = true; });
  stage.addEventListener('mouseleave', () => { hovering = false; tiltTX = 0; tiltTY = 0; lastAuto = performance.now(); wake(); });
  if (canHover && !reducedMotion) stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    tiltTX = ((e.clientY - r.top) / r.height - .5) * -5;
    tiltTY = ((e.clientX - r.left) / r.width - .5) * 7;
    wake();
  });

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { paintAll(); lastAuto = performance.now(); wake(); }
  }, { rootMargin: '200px 0px' }).observe(stage);

  let rsz = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rsz);
    rsz = setTimeout(() => { measure(); painted = false; if (visible) paintAll(); render(); }, 150);
  });

  // ── Poster art — each project gets its own lit, grained still life ──
  const ART = {};
  let painted = false;

  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function gauss(r) { return (r() + r() + r() + r() - 2) / 2; }

  function glow(ctx, x, y, rad, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, color.replace('A', a));
    g.addColorStop(1, color.replace('A', 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 400, 500);
  }

  let grainTile = null;
  function grain() {
    if (grainTile) return grainTile;
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const g = c.getContext('2d');
    const img = g.createImageData(160, 160);
    const r = rng(7);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 22;
    }
    g.putImageData(img, 0, 0);
    return (grainTile = c);
  }

  function finish(ctx, W, H) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const v = ctx.createRadialGradient(W / 2, H * .45, W * .25, W / 2, H / 2, W * .85);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,.62)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(grain(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  function mono(ctx, txt, x, y, color, size, align) {
    ctx.font = `500 ${size || 9}px "Geist Mono", ui-monospace, monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.fillText(txt, x, y);
    ctx.textAlign = 'left';
  }

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 01 — Anomaly Terminal: a candle chart with one candle that shouldn't exist
  ART.anomaly = ctx => {
    const r = rng(11);
    ctx.fillStyle = '#0a0505';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 270, 250, 300, 'rgba(255,40,40,A)', .32);
    glow(ctx, 60, 60, 220, 'rgba(255,120,80,A)', .08);
    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    ctx.lineWidth = 1;
    for (let y = 70; y < 460; y += 39) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(400, y); ctx.stroke(); }
    let p = 300;
    const n = 30, AN = 21, cw = 7;
    const ax = 22 + AN * 12.2;
    for (let i = 0; i < n; i++) {
      const x = 22 + i * 12.2;
      const o = p;
      let c = p + gauss(r) * 16 - 1.6;
      if (i === AN) c = p + 118;
      const hi = Math.min(o, c) - r() * 12 - 3;
      const lo = Math.max(o, c) + r() * 12 + 3;
      const down = c > o;
      const anom = i === AN;
      ctx.shadowBlur = anom ? 34 : 0;
      ctx.shadowColor = '#ff2a2a';
      ctx.strokeStyle = ctx.fillStyle = anom ? '#ff3b3b' : down ? 'rgba(255,90,90,.62)' : 'rgba(255,240,235,.7)';
      ctx.beginPath(); ctx.moveTo(x, hi); ctx.lineTo(x, lo); ctx.stroke();
      ctx.fillRect(x - cw / 2, Math.min(o, c), cw, Math.max(2, Math.abs(c - o)));
      ctx.fillStyle = anom ? 'rgba(255,59,59,.85)' : 'rgba(255,255,255,.1)';
      const vh = anom ? 46 : 6 + r() * 16;
      ctx.fillRect(x - cw / 2, 470 - vh, cw, vh);
      p = c;
    }
    ctx.shadowBlur = 0;
    const ay = 395;
    ctx.strokeStyle = 'rgba(255,59,59,.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(ax, ay - 40, 30, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(255,59,59,.45)';
    ctx.beginPath(); ctx.arc(ax, ay - 40, 52, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, ay - 40); ctx.lineTo(400, ay - 40); ctx.moveTo(ax, 40); ctx.lineTo(ax, 480); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff3b3b';
    rrect(ctx, ax - 128, ay - 108, 92, 22, 4); ctx.fill();
    mono(ctx, 'ANOMALY  4.2σ', ax - 120, ay - 93, '#0a0505', 9);
    mono(ctx, 'NIFTY50 · 1D · ISOLATION FOREST', 22, 40, 'rgba(255,220,215,.55)');
    mono(ctx, 'SIGNAL: SELL', 378, 40, '#ff6b6b', 9, 'right');
  };

  // 02 — Viewpoint: thousands of portfolios under the efficient frontier
  ART.viewpoint = ctx => {
    const r = rng(23);
    ctx.fillStyle = '#07060d';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 300, 140, 280, 'rgba(150,120,255,A)', .3);
    glow(ctx, 80, 430, 220, 'rgba(255,120,190,A)', .1);
    const X = v => 40 + v * 330, Y = v => 440 - v * 340;
    const fr = x => Math.sqrt(Math.max(0, x - .06)) * .98;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2600; i++) {
      const x = .08 + r() * .88;
      const y = fr(x) - Math.abs(gauss(r)) * .28 - r() * .05;
      if (y < .02) continue;
      const sh = y / x;
      const hue = 250 + Math.min(1, sh / 1.6) * 80;
      ctx.fillStyle = `hsla(${hue},90%,${55 + sh * 10}%,.32)`;
      ctx.fillRect(X(x), Y(y), 1.6, 1.6);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#b7a3ff';
    ctx.strokeStyle = '#d9ceff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = .06; x <= .97; x += .005) { const px = X(x), py = Y(fr(x)); x === .06 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();
    const tx = .28, ty = fr(tx);
    ctx.shadowBlur = 0;
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(255,170,215,.7)';
    ctx.lineWidth = 1.2;
    const rf = .12, slope = (ty - rf) / tx;
    ctx.beginPath(); ctx.moveTo(X(0), Y(rf)); ctx.lineTo(X(.95), Y(rf + slope * .95)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 26;
    ctx.shadowColor = '#ff9fbf';
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(X(tx), Y(ty), 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,159,191,.6)';
    ctx.beginPath(); ctx.arc(X(tx), Y(ty), 14, 0, Math.PI * 2); ctx.stroke();
    mono(ctx, 'MAX SHARPE · 1.84', X(tx) + 20, Y(ty) + 4, '#ffd0e2');
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.beginPath(); ctx.moveTo(40, 60); ctx.lineTo(40, 440); ctx.lineTo(380, 440); ctx.stroke();
    mono(ctx, 'σ  RISK →', 378, 458, 'rgba(220,210,255,.45)', 9, 'right');
    mono(ctx, 'BLACK–LITTERMAN · SENTIMENT VIEWS', 22, 40, 'rgba(220,210,255,.55)');
  };

  // 03 — Alpha: two cointegrated stocks and the spread that trades them
  ART.alpha = ctx => {
    const r = rng(37);
    ctx.fillStyle = '#04090a';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 120, 170, 260, 'rgba(80,240,180,A)', .22);
    glow(ctx, 330, 380, 220, 'rgba(80,200,255,A)', .12);
    const n = 120, base = [];
    let w = 0;
    for (let i = 0; i < n; i++) { w += gauss(r) * 3; base.push(w); }
    const spread = [];
    let s = 0;
    for (let i = 0; i < n; i++) { s = s * .9 + gauss(r) * .9; spread.push(s); }
    const X = i => 22 + i * (356 / (n - 1));
    const line = (arr, off, col, lw, blur) => {
      ctx.shadowBlur = blur; ctx.shadowColor = col;
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath();
      arr.forEach((v, i) => { const y = 170 - v * 1.6 + off; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); });
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    line(base.map((v, i) => v + spread[i] * 3), -14, 'rgba(255,255,255,.55)', 1.3, 0);
    line(base, 14, '#9bf2cf', 1.8, 14);
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath(); ctx.moveTo(22, 292); ctx.lineTo(378, 292); ctx.stroke();
    const mid = 385, sc = 26;
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(155,242,207,.45)';
    [-2, 2].forEach(z => { ctx.beginPath(); ctx.moveTo(22, mid - z * sc); ctx.lineTo(378, mid - z * sc); ctx.stroke(); });
    ctx.setLineDash([]);
    const zs = spread.map(v => v * .95);
    ctx.save();
    ctx.beginPath();
    zs.forEach((v, i) => { const y = mid - v * sc; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); });
    ctx.lineTo(378, mid); ctx.lineTo(22, mid); ctx.closePath();
    const g = ctx.createLinearGradient(0, mid - 70, 0, mid + 70);
    g.addColorStop(0, 'rgba(155,242,207,.55)');
    g.addColorStop(.5, 'rgba(155,242,207,0)');
    g.addColorStop(1, 'rgba(155,242,207,.55)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 10; ctx.shadowColor = '#9bf2cf';
    ctx.strokeStyle = '#c8ffe9'; ctx.lineWidth = 1.4;
    ctx.beginPath();
    zs.forEach((v, i) => { const y = mid - v * sc; i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y); });
    ctx.stroke();
    ctx.shadowBlur = 0;
    zs.forEach((v, i) => {
      if (Math.abs(v) > 2 && Math.abs(zs[i - 1] || 0) <= 2) {
        ctx.fillStyle = v > 0 ? '#ff9fbf' : '#9bf2cf';
        ctx.beginPath(); ctx.arc(X(i), mid - v * sc, 4, 0, Math.PI * 2); ctx.fill();
      }
    });
    mono(ctx, 'HDFCBANK / ICICIBANK', 22, 40, 'rgba(200,255,235,.6)');
    mono(ctx, 'ADF p = 0.012', 378, 40, '#9bf2cf', 9, 'right');
    mono(ctx, 'SPREAD Z-SCORE  ±2σ', 22, 312, 'rgba(200,255,235,.45)');
  };

  // 04 — MFScope: a gold fan of NAV paths, one fund pulled out of the crowd
  ART.mfscope = ctx => {
    const r = rng(53);
    ctx.fillStyle = '#0b0805';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 330, 120, 300, 'rgba(255,190,90,A)', .3);
    glow(ctx, 40, 470, 200, 'rgba(255,140,60,A)', .1);
    const n = 90, ox = 26, oy = 420;
    const paths = [];
    for (let k = 0; k < 70; k++) {
      const drift = .9 + r() * 2.1, vol = 2 + r() * 4;
      let y = oy;
      const pts = [[ox, y]];
      for (let i = 1; i < n; i++) { y -= drift + gauss(r) * vol; pts.push([ox + i * (352 / (n - 1)), y]); }
      paths.push(pts);
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;
    paths.forEach(pts => {
      ctx.strokeStyle = 'rgba(244,190,110,.1)';
      ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
    const best = paths.reduce((a, b) => (b[n - 1][1] < a[n - 1][1] ? b : a));
    ctx.shadowBlur = 18; ctx.shadowColor = '#ffc46b';
    ctx.strokeStyle = '#ffe2b0'; ctx.lineWidth = 2.2;
    ctx.beginPath(); best.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    const [ex, ey] = best[n - 1];
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex, ey, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    const labels = ['S.SELL', 'SELL', 'HOLD', 'BUY', 'S.BUY'];
    labels.forEach((l, i) => {
      const x = 26 + i * 72;
      ctx.fillStyle = i === 4 ? '#f4c98c' : 'rgba(244,201,140,.14)';
      rrect(ctx, x, 448, 66, 6, 3); ctx.fill();
      mono(ctx, l, x, 472, i === 4 ? '#f4c98c' : 'rgba(244,201,140,.4)', 8);
    });
    mono(ctx, 'AMFI NAV · 1,400+ SCHEMES', 22, 40, 'rgba(255,225,180,.55)');
    mono(ctx, '+31.4% 3Y CAGR', Math.min(ex, 378), Math.max(70, ey - 14), '#ffe2b0', 9, 'right');
  };

  // 05 — SwipeRight: two holo cards, the right one wins
  ART.swiperight = ctx => {
    ctx.fillStyle = '#0d0609';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 210, 250, 290, 'rgba(255,110,170,A)', .3);
    glow(ctx, 320, 80, 200, 'rgba(183,163,255,A)', .16);
    const card = (cx, cy, rot, holo, dim) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; ctx.shadowColor = 'rgba(0,0,0,.7)';
      rrect(ctx, -130, -82, 260, 164, 14);
      const g = ctx.createLinearGradient(-130, -82, 130, 82);
      holo.forEach((c, i) => g.addColorStop(i / (holo.length - 1), c));
      ctx.fillStyle = g; ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.save(); ctx.clip();
      const sh = ctx.createLinearGradient(-60, -82, 40, 82);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(.5, 'rgba(255,255,255,.35)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sh; ctx.fillRect(-130, -82, 260, 164);
      ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(-130, -82, 260, 164);
      ctx.restore();
      const cg = ctx.createLinearGradient(-102, -30, -66, 0);
      cg.addColorStop(0, '#f6dfa4'); cg.addColorStop(1, '#b8904a');
      rrect(ctx, -104, -32, 38, 29, 5); ctx.fillStyle = cg; ctx.fill();
      ctx.strokeStyle = 'rgba(90,60,20,.5)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(-104, -18); ctx.lineTo(-66, -18); ctx.moveTo(-85, -32); ctx.lineTo(-85, -3); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.6;
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(-50, -18, 6 + k * 5, -.7, .7); ctx.stroke(); }
      mono(ctx, '••••  ••••  ••••  4011', -104, 34, 'rgba(255,255,255,.92)', 12);
      mono(ctx, 'J DADINA', -104, 60, 'rgba(255,255,255,.7)', 9);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.arc(92, 52, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.arc(108, 52, 13, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };
    card(185, 205, -.2, ['#3a2a4a', '#5a4a6e', '#2a2238'], .25);
    card(215, 300, .1, ['#ff9fbf', '#b7a3ff', '#9bf2cf', '#f4c98c'], 0);
    ctx.fillStyle = '#ff9fbf';
    rrect(ctx, 278, 380, 96, 24, 12); ctx.fill();
    mono(ctx, 'BEST MATCH ✓', 326, 396, '#1a0610', 9, 'center');
    mono(ctx, '140+ CARDS · 13 SPEND CATEGORIES', 22, 40, 'rgba(255,215,230,.55)');
    mono(ctx, 'SAVES ₹18,240 / YR', 22, 470, '#ffc4d8');
  };

  // 06 — GitControl: a branch graph lit like a circuit
  ART.gitcontrol = ctx => {
    const r = rng(71);
    ctx.fillStyle = '#05070b';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 200, 260, 280, 'rgba(110,160,255,A)', .2);
    glow(ctx, 300, 120, 200, 'rgba(155,242,207,A)', .12);
    ctx.font = '500 8px "Geist Mono", ui-monospace, monospace';
    for (let y = 70; y < 480; y += 15) {
      let h = '';
      for (let k = 0; k < 7; k++) h += '0123456789abcdef'[Math.floor(r() * 16)];
      ctx.fillStyle = `rgba(200,220,255,${.07 + r() * .1})`;
      ctx.fillText(h + '  ' + ['feat', 'fix', 'merge', 'chore', 'refactor'][Math.floor(r() * 5)] + ': ' + ['ui', 'auth', 'diff view', 'push flow', 'stash'][Math.floor(r() * 5)], 236, y);
    }
    const lanes = { main: 70, a: 125, b: 180 };
    const col = { main: '#9bf2cf', a: '#b7a3ff', b: '#f4c98c' };
    const seg = (x1, y1, x2, y2, c) => {
      ctx.shadowBlur = 12; ctx.shadowColor = c; ctx.strokeStyle = c; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      if (x1 === x2) ctx.lineTo(x2, y2);
      else ctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
      ctx.stroke(); ctx.shadowBlur = 0;
    };
    seg(lanes.main, 60, lanes.main, 470, col.main);
    seg(lanes.main, 110, lanes.a, 160, col.a);
    seg(lanes.a, 160, lanes.a, 300, col.a);
    seg(lanes.a, 300, lanes.main, 350, col.a);
    seg(lanes.a, 200, lanes.b, 245, col.b);
    seg(lanes.b, 245, lanes.b, 330, col.b);
    seg(lanes.b, 330, lanes.main, 400, col.b);
    const nodes = [['main', 80], ['main', 110], ['a', 160], ['a', 200], ['b', 245], ['main', 215], ['a', 260], ['b', 290], ['a', 300], ['b', 330], ['main', 350], ['main', 400], ['main', 440]];
    nodes.forEach(([l, y], i) => {
      ctx.fillStyle = '#05070b';
      ctx.strokeStyle = col[l]; ctx.lineWidth = 2;
      ctx.shadowBlur = 14; ctx.shadowColor = col[l];
      ctx.beginPath(); ctx.arc(lanes[l], y, i === nodes.length - 1 ? 7 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
    });
    ctx.fillStyle = '#9bf2cf';
    ctx.beginPath(); ctx.arc(lanes.main, 440, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(155,242,207,.14)';
    rrect(ctx, 92, 428, 120, 24, 12); ctx.fill();
    mono(ctx, 'HEAD → main  ↑ push', 104, 444, '#c8ffe9', 9);
    mono(ctx, 'ZERO SHELL · ELECTRON', 22, 40, 'rgba(210,225,255,.55)');
    mono(ctx, '3 BRANCHES', 378, 40, '#b7a3ff', 9, 'right');
  };

  // 07 — FinTrace: a dot globe with latency arcs out of Mumbai
  ART.fintrace = ctx => {
    ctx.fillStyle = '#03070a';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 200, 270, 250, 'rgba(90,200,255,A)', .22);
    glow(ctx, 200, 270, 140, 'rgba(155,242,207,A)', .1);
    const cx = 200, cy = 270, R = 150;
    const lon0 = 40 * Math.PI / 180, lat0 = 18 * Math.PI / 180;
    const proj = (lat, lon) => {
      const x = Math.cos(lat) * Math.sin(lon - lon0);
      const y0 = Math.sin(lat), z0 = Math.cos(lat) * Math.cos(lon - lon0);
      const y = y0 * Math.cos(lat0) - z0 * Math.sin(lat0);
      const z = y0 * Math.sin(lat0) + z0 * Math.cos(lat0);
      return [x, y, z];
    };
    const atm = ctx.createRadialGradient(cx, cy, R * .92, cx, cy, R * 1.12);
    atm.addColorStop(0, 'rgba(120,210,255,.0)');
    atm.addColorStop(.5, 'rgba(120,210,255,.18)');
    atm.addColorStop(1, 'rgba(120,210,255,0)');
    ctx.fillStyle = atm; ctx.fillRect(0, 0, 400, 500);
    const M = 2200, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < M; i++) {
      const yy = 1 - (i / (M - 1)) * 2, rr = Math.sqrt(1 - yy * yy), th = ga * i;
      const lat = Math.asin(yy), lon = Math.atan2(Math.sin(th) * rr, Math.cos(th) * rr);
      const [x, y, z] = proj(lat, lon);
      if (z <= 0) continue;
      ctx.fillStyle = `rgba(180,230,255,${(.12 + z * .5).toFixed(3)})`;
      ctx.fillRect(cx + x * R, cy - y * R, 1.4, 1.4);
    }
    const D = Math.PI / 180;
    const cities = { MUM: [19.07, 72.87], NYC: [40.7, -74], LDN: [51.5, -.1], SGP: [1.35, 103.8], TYO: [35.7, 139.7], FRA: [50.1, 8.7] };
    const ms = { NYC: 187, LDN: 111, SGP: 58, TYO: 121, FRA: 104 };
    const [mla, mlo] = cities.MUM;
    Object.keys(ms).forEach(k => {
      const [la, lo] = cities[k];
      ctx.shadowBlur = 10; ctx.shadowColor = '#9bf2cf';
      ctx.strokeStyle = 'rgba(155,242,207,.85)'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      let started = false;
      for (let t = 0; t <= 1.0001; t += .02) {
        const la1 = (mla + (la - mla) * t) * D, lo1 = (mlo + (lo - mlo) * t) * D;
        const lift = 1 + Math.sin(Math.PI * t) * .22;
        const [x, y, z] = proj(la1, lo1);
        if (z < -.05) { started = false; continue; }
        const px = cx + x * R * lift, py = cy - y * R * lift;
        started ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        started = true;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      const [x, y, z] = proj(la * D, lo * D);
      if (z > 0) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(cx + x * R, cy - y * R, 2.6, 0, Math.PI * 2); ctx.fill();
        mono(ctx, `${k} ${ms[k]}ms`, cx + x * R + 6, cy - y * R - 6, 'rgba(210,245,255,.8)', 8);
      }
    });
    const [x, y] = proj(mla * D, mlo * D);
    ctx.shadowBlur = 24; ctx.shadowColor = '#9bf2cf';
    ctx.fillStyle = '#9bf2cf';
    ctx.beginPath(); ctx.arc(cx + x * R, cy - y * R, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(155,242,207,.5)';
    ctx.beginPath(); ctx.arc(cx + x * R, cy - y * R, 12, 0, Math.PI * 2); ctx.stroke();
    mono(ctx, 'MUMBAI · NSE', cx + x * R + 16, cy - y * R + 14, '#c8ffe9', 9);
    mono(ctx, 'LIVE LATENCY · SSE', 22, 40, 'rgba(200,240,255,.55)');
    mono(ctx, '● STREAMING', 378, 40, '#9bf2cf', 9, 'right');
  };

  // 08 — PayRozgar: a payslip curling off a thermal printer, stamped offline
  ART.payrozgar = ctx => {
    const r = rng(97);
    ctx.fillStyle = '#0b0806';
    ctx.fillRect(0, 0, 400, 500);
    glow(ctx, 200, 60, 340, 'rgba(255,200,140,A)', .3);
    glow(ctx, 200, 480, 200, 'rgba(155,242,207,A)', .08);
    ctx.save();
    ctx.translate(205, 255);
    ctx.rotate(-.07);
    ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; ctx.shadowColor = 'rgba(0,0,0,.75)';
    const w = 210, top = -200, bot = 200;
    ctx.beginPath();
    ctx.moveTo(-w / 2, top);
    ctx.lineTo(w / 2, top);
    ctx.lineTo(w / 2, bot);
    for (let x = w / 2; x > -w / 2; x -= 10) { ctx.lineTo(x - 5, bot + 7); ctx.lineTo(x - 10, bot); }
    ctx.closePath();
    const pg = ctx.createLinearGradient(0, top, 0, bot);
    pg.addColorStop(0, '#f7f3ea'); pg.addColorStop(1, '#dcd6c8');
    ctx.fillStyle = pg; ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    const ink = 'rgba(20,18,14,.85)', soft = 'rgba(20,18,14,.45)';
    mono(ctx, 'PAYROZGAR', 0, top + 32, ink, 13, 'center');
    mono(ctx, 'PAYSLIP · SEP 2026', 0, top + 50, soft, 8, 'center');
    ctx.strokeStyle = 'rgba(20,18,14,.3)'; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(-w / 2 + 14, top + 64); ctx.lineTo(w / 2 - 14, top + 64); ctx.stroke();
    const rows = [['RAMESH K.', ''], ['DAYS PRESENT', '26 / 30'], ['BASIC', '₹14,300'], ['OVERTIME 6H', '₹1,050'], ['ADVANCE', '−₹2,000'], ['PF', '−₹1,716']];
    rows.forEach(([a, b], i) => {
      const y = top + 88 + i * 21;
      mono(ctx, a, -w / 2 + 16, y, i ? soft : ink, 9);
      mono(ctx, b, w / 2 - 16, y, ink, 9, 'right');
    });
    ctx.beginPath(); ctx.moveTo(-w / 2 + 14, top + 218); ctx.lineTo(w / 2 - 14, top + 218); ctx.stroke();
    ctx.setLineDash([]);
    mono(ctx, 'NET PAY', -w / 2 + 16, top + 244, ink, 10);
    mono(ctx, '₹11,634', w / 2 - 16, top + 246, ink, 16, 'right');
    for (let x = -w / 2 + 22; x < w / 2 - 22; x += 2.4) {
      if (r() > .42) { ctx.fillStyle = ink; ctx.fillRect(x, top + 300, r() > .6 ? 1.8 : 1, 44); }
    }
    mono(ctx, '0x7F3A · SYNCED LATER', 0, top + 360, soft, 7, 'center');
    ctx.restore();
    ctx.save();
    ctx.translate(290, 360);
    ctx.rotate(-.32);
    ctx.strokeStyle = 'rgba(24,140,98,.85)'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '600 10px "Geist Mono", ui-monospace, monospace';
    ctx.fillStyle = 'rgba(24,140,98,.9)';
    ctx.textAlign = 'center';
    ctx.fillText('OFFLINE', 0, -2);
    ctx.fillText('✓ PAID', 0, 12);
    ctx.textAlign = 'left';
    ctx.restore();
    mono(ctx, 'WORKS WITHOUT INTERNET', 22, 40, 'rgba(255,230,200,.55)');
    mono(ctx, 'PWA · SW CACHE', 378, 40, '#f4c98c', 9, 'right');
  };

  function paintAll() {
    if (painted) return;
    painted = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const draw = () => cards.forEach(card => {
      const cv = card.querySelector('canvas');
      const W = Math.round(card.offsetWidth * dpr * 1.15), H = Math.round(W * 1.25);
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      ctx.setTransform(W / 400, 0, 0, H / 500, 0, 0);
      (ART[card.dataset.art] || (() => {}))(ctx);
      finish(ctx, W, H);
    });
    document.fonts && document.fonts.ready ? document.fonts.ready.then(draw) : draw();
  }

  measure();
  render();
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
    if (!W || !H) return;
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
    if (!base.width) return;
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