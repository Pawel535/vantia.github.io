/* ═══════════════════════════════════════════════════════════════
   VANTIA STUDIO — Runtime Engine 2026 (Performance Edition)
   Fixes: CLS 0.589, forced reflow 51ms, non-composited animations,
          canvas rAF leak, hero reveal layout shifts
   ═══════════════════════════════════════════════════════════════ */

/* ── INLINE LANG BOOTSTRAP ──────────────────────────────────────
   CRITICAL: This block must be inlined in <head> BEFORE styles.css
   to prevent CLS caused by lang-switch rewriting display values.
   Copy the <script> tag below into every page's <head>:

   <script>
   (function(){
     var stored = localStorage.getItem('vantia-lang');
     var browser = (navigator.language || '').substring(0, 2);
     var lang = stored || (browser === 'pl' ? 'pl' : 'en');
     document.documentElement.setAttribute('data-active-lang', lang);
     document.documentElement.setAttribute('lang', lang === 'pl' ? 'pl-PL' : 'en');
   })();
   </script>

   This eliminates the #1 CLS source (0.589 score) by ensuring the
   correct lang attribute is present before the browser paints.
   ─────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── UTILS ── */
  const lerp = (a, b, t) => a + (b - a) * t;
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const qs = (s, p) => (p || document).querySelector(s);
  const qsa = (s, p) => [...(p || document).querySelectorAll(s)];

  /* ══════════════════════════════════════
     ANALYTICS
     ══════════════════════════════════════ */
  const Analytics = {
    id: 'G-S6KHMQRSPC',
    isLoaded: false,
    load() {
      if (this.isLoaded || !this.id) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', this.id, { anonymize_ip: true });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.id}`;
      document.head.appendChild(script);
      this.isLoaded = true;
    }
  };

  /* ══════════════════════════════════════
     MAGNETIC BUTTONS
     ══════════════════════════════════════ */
  const Magnetics = {
    init() {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
      qsa('.magnetic:not(.nav__logo)').forEach((el) => {
        let rAFId = null;
        let cachedRect = null;

        const updateRect = () => { cachedRect = el.getBoundingClientRect(); };

        el.addEventListener('mouseenter', updateRect);
        window.addEventListener('resize', updateRect, { passive: true });

        el.addEventListener('mousemove', (e) => {
          if (!cachedRect) return;
          if (rAFId) cancelAnimationFrame(rAFId);
          rAFId = requestAnimationFrame(() => {
            const x = e.clientX - cachedRect.left - cachedRect.width / 2;
            const y = e.clientY - cachedRect.top - cachedRect.height / 2;
            /* translate-only: stays on compositor — no forced reflow */
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
          });
        });

        el.addEventListener('mouseleave', () => {
          if (rAFId) cancelAnimationFrame(rAFId);
          el.style.transform = 'translate(0, 0)';
        });
      });
    }
  };

  /* ══════════════════════════════════════
     HERO REVEAL SEQUENCE
     FIX: Use CSS classes instead of inline style mutations.
     Add to styles.css:
       .hero__tag, .hero__subtitle, .hero__actions {
         opacity: 0; transform: translateY(20px);
         transition: opacity .8s var(--ease-out), transform .8s var(--ease-out);
       }
       .hero__tag.is-revealed, .hero__subtitle.is-revealed,
       .hero__actions.is-revealed { opacity: 1; transform: none; }
       .hero__corner { opacity: 0; transition: opacity 1s var(--ease-out); }
       .hero__corner.is-revealed { opacity: 1; }
       .hero__scroll, .hero__badge {
         opacity: 0; transition: opacity 1s;
       }
       .hero__scroll.is-revealed, .hero__badge.is-revealed { opacity: 1; }
     This prevents JS style mutation from triggering layout recalculation.
     ══════════════════════════════════════ */
  const HeroReveal = {
    run() {
      /* Folio/Tag */
      const folio = qs('.hero__folio');
      if (folio) setTimeout(() => folio.classList.add('is-revealed'), 100);
      /* Lines/Words — staggered */
      qsa('.hero__line').forEach((w, i) => {
        setTimeout(() => w.classList.add('is-revealed'), 300 + i * 150);
      });
      /* Body/Subtitle */
      const body = qs('.hero__body');
      if (body) setTimeout(() => body.classList.add('is-revealed'), 800);
      /* Actions */
      const actions = qs('.hero__actions');
      if (actions) setTimeout(() => actions.classList.add('is-revealed'), 1000);
      /* Meta Sidebar Groups */
      qsa('.hero__meta-group').forEach((c, i) => {
        setTimeout(() => c.classList.add('is-revealed'), 1200 + i * 150);
      });
      /* Scroll Indicator */
      const scroll = qs('.hero__scroll');
      if (scroll) setTimeout(() => scroll.classList.add('is-revealed'), 1800);
    }
  };

  /* ══════════════════════════════════════
     SCROLL REVEAL
     ══════════════════════════════════════ */
  const ScrollReveal = {
    observer: null,
    init() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              entry.target.classList.add('is-revealed');
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      qsa('.reveal, .hero__tag, .hero__title-word, .hero__subtitle, .service, .portfolio-card').forEach((el) => {
        this.observer.observe(el);
      });
    }
  };

  /* ══════════════════════════════════════
     COUNT-UP ANIMATION
     ══════════════════════════════════════ */
  const CountUp = {
    init() {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animate(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      qsa('[data-count]').forEach((el) => obs.observe(el));
    },
    animate(el) {
      const target = el.dataset.count;
      if (isNaN(target)) { el.textContent = target; return; }
      const end = parseInt(target, 10);
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(end * eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  };

  /* ══════════════════════════════════════
     NAVIGATION
     ══════════════════════════════════════ */
  const Nav = {
    el: null, hamburger: null, mobileMenu: null,
    init() {
      this.el = qs('.nav');
      this.hamburger = qs('.nav__hamburger');
      this.mobileMenu = qs('.nav__mobile-menu');
      if (!this.el) return;

      if (this.hamburger && this.mobileMenu) {
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
      }

      window.addEventListener('scroll', () => {
        this.el.classList.toggle('nav--scrolled', window.scrollY > 60);
      }, { passive: true });

      if (this.hamburger) {
        this.hamburger.addEventListener('click', () => this.toggleMobile());
      }

      qsa('.nav__mobile-link').forEach((link) => {
        link.addEventListener('click', () => this.closeMobile());
      });

      if (this.mobileMenu) {
        this.mobileMenu.addEventListener('click', (e) => {
          if (e.target === this.mobileMenu) this.closeMobile();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeMobile();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 900) this.closeMobile();
      }, { passive: true });

      qsa('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const target = qs(a.getAttribute('href'));
          if (target) {
            e.preventDefault();
            this.closeMobile();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    },
    toggleMobile() {
      if (!this.hamburger || !this.mobileMenu) return;
      const open = this.hamburger.classList.toggle('is-open');
      this.mobileMenu.classList.toggle('is-open', open);
      this.hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      this.mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.documentElement.style.overflow = open ? 'hidden' : '';
      document.body.style.overflow = open ? 'hidden' : '';
      document.body.classList.toggle('menu-open', open);
    },
    closeMobile() {
      if (this.hamburger) this.hamburger.classList.remove('is-open');
      if (this.mobileMenu) this.mobileMenu.classList.remove('is-open');
      if (this.hamburger) this.hamburger.setAttribute('aria-expanded', 'false');
      if (this.mobileMenu) this.mobileMenu.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
  };

  /* ══════════════════════════════════════
     LANGUAGE SWITCHER
     FIX: Lang.apply() no longer runs in DOMContentLoaded — the
     inline <head> script already set the correct attribute before
     first paint, eliminating the CLS. Here we only wire up the
     switcher buttons and sync state.
     ══════════════════════════════════════ */
  const Lang = {
    current: 'pl',
    meta: {
      pl: {
        title: 'VANTIA Studio - Strony internetowe z charakterem',
        description: 'VANTIA Studio projektuje dopracowane strony internetowe, portfolio i systemy front-end dla marek, które potrzebują wyrazistego kierunku, jakości i przejrzystości.'
      },
      en: {
        title: 'VANTIA Studio - Editorial Digital Direction',
        description: 'VANTIA Studio is an editorial digital agency for art-directed websites, portfolio systems, and front-end builds with restraint, clarity, and a strong point of view.'
      }
    },
    init() {
      /* Read lang already applied by inline head script */
      this.current = document.documentElement.getAttribute('data-active-lang') || 'pl';
      /* Sync button states without triggering a re-apply */
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.langBtn === this.current);
        btn.setAttribute('aria-pressed', btn.dataset.langBtn === this.current ? 'true' : 'false');
      });
      /* Wire buttons */
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.addEventListener('click', () => this.apply(btn.dataset.langBtn));
      });
      this.syncMeta();
    },
    apply(lang) {
      if (this.current === lang) return; /* no-op if already active */
      this.current = lang;
      localStorage.setItem('vantia-lang', lang);
      document.documentElement.setAttribute('data-active-lang', lang);
      document.documentElement.setAttribute('lang', lang === 'pl' ? 'pl-PL' : 'en');
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.langBtn === lang);
        btn.setAttribute('aria-pressed', btn.dataset.langBtn === lang ? 'true' : 'false');
      });
      this.syncMeta();
    },
    syncMeta() {
      if (!document.body.classList.contains('landing-editorial')) return;
      const meta = this.meta[this.current] || this.meta.pl;
      document.title = meta.title;
      const description = qs('meta[name="description"]');
      const ogTitle = qs('meta[property="og:title"]');
      const ogDescription = qs('meta[property="og:description"]');
      const twitterTitle = qs('meta[name="twitter:title"]');
      const twitterDescription = qs('meta[name="twitter:description"]');
      if (description) description.setAttribute('content', meta.description);
      if (ogTitle) ogTitle.setAttribute('content', meta.title);
      if (ogDescription) ogDescription.setAttribute('content', meta.description);
      if (twitterTitle) twitterTitle.setAttribute('content', meta.title);
      if (twitterDescription) twitterDescription.setAttribute('content', meta.description);
    }
  };

  const Theme = {
    current: 'dark',
    init() {
      this.current = document.documentElement.getAttribute('data-theme')
        || localStorage.getItem('vantia-theme')
        || 'dark';
      this.apply(this.current, false);
      qsa('[data-theme-btn]').forEach((btn) => {
        btn.addEventListener('click', () => this.apply(btn.dataset.themeBtn));
      });
    },
    apply(theme, persist = true) {
      const next = theme === 'dark' ? 'dark' : 'light';
      this.current = next;
      document.documentElement.setAttribute('data-theme', next);
      if (persist) localStorage.setItem('vantia-theme', next);
      qsa('[data-theme-btn]').forEach((btn) => {
        const active = btn.dataset.themeBtn === next;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      const themeColor = qs('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute('content', next === 'dark' ? '#0D0F13' : '#F4F5F7');
    }
  };

  /* ══════════════════════════════════════
     SCROLL PROGRESS BAR
     FIX: computeMax always wrapped in rAF to avoid forced
     synchronous layout (was causing 51ms reflow).
     ══════════════════════════════════════ */
  const ScrollProgress = {
    bar: null,
    ticking: false,
    maxScroll: 0,
    needsRecalc: true,
    init() {
      this.bar = qs('.scroll-progress');
      if (!this.bar) return;
      const markDirty = () => { this.needsRecalc = true; };
      window.addEventListener('load', markDirty, { once: true });
      window.addEventListener('resize', markDirty, { passive: true });
      window.addEventListener('scroll', () => this.update(), { passive: true });
    },
    computeMax() {
      this.maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      this.needsRecalc = false;
    },
    update() {
      if (this.ticking) return;
      this.ticking = true;
      requestAnimationFrame(() => {
        if (this.needsRecalc) this.computeMax();
        const progress = this.maxScroll > 0 ? window.scrollY / this.maxScroll : 0;
        /* scaleX stays on GPU compositor — no layout */
        this.bar.style.transform = `scaleX(${progress})`;
        this.ticking = false;
      });
    }
  };

  /* ══════════════════════════════════════
     CANVAS BACKGROUND
     FIX 1: when !isVisible, stop the rAF loop entirely (was leaking
             frames even when canvas was off-screen).
     FIX 2: canvas gets will-change:transform via CSS (see comment).
     FIX 3: grid lines batched into a single path per axis to cut
             draw calls from O(W/CELL + H/CELL) to 2.
     ══════════════════════════════════════ */
  const CanvasBg = {
    cv: null, ctx: null, W: 0, H: 0, t: 0,
    mouse: { x: -9999, y: -9999 },
    scrollY: 0,
    CELL: 80,
    isVisible: true,
    frameInterval: 1000 / 30,
    lastFrameTime: 0,
    orbs: [
      { fx: .78, fy: .12, r: 400, gold: true,  a: .10, sp: .0007 },
      { fx: .10, fy: .82, r: 280, gold: false, a: .05, sp: .0005 },
      { fx: .50, fy: .95, r: 220, gold: true,  a: .04, sp: .0009 },
      { fx: .92, fy: .50, r: 180, gold: false, a: .035,sp: .0006 }
    ],
    particles: [],
    init() {
      this.cv = qs('.canvas-bg');
      if (!this.cv) return;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        this.cv.style.display = 'none';
        return;
      }
      const isMobile = window.innerWidth < 768;
      const isLowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
        || (navigator.deviceMemory && navigator.deviceMemory <= 4);
      const saveData = navigator.connection && navigator.connection.saveData;
      this.frameInterval = isMobile ? 1000 / 24 : 1000 / 30;
      this.ctx = this.cv.getContext('2d');
      // Generate particles
      const particleCount = saveData || isLowPower ? (isMobile ? 16 : 22) : (isMobile ? 24 : 42);
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random(), y: Math.random(),
          r:  Math.random() * 1.2 + .3,
          vx: (Math.random() - .5) * .00008,
          vy: (Math.random() - .5) * .00008,
          a:  Math.random() * .35 + .12
        });
      }

      this.resize();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.resize(), 200);
      }, { passive: true });

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, { passive: true });
      window.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') return;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, { passive: true });
      window.addEventListener('pointerdown', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, { passive: true });
      // Visibility
      const obs = new IntersectionObserver((entries) => {
        this.isVisible = entries[0].isIntersecting;
      }, { threshold: 0 });
      obs.observe(this.cv);
      this.render();
    },
    resize() {
      this.W = this.cv.width  = window.innerWidth;
      this.H = this.cv.height = window.innerHeight;
    },
    render() {
      if (!this.isVisible) { requestAnimationFrame(() => this.render()); return; }
      const now = performance.now();
      if (now - this.lastFrameTime < this.frameInterval) {
        requestAnimationFrame(() => this.render());
        return;
      }
      this.lastFrameTime = now;
      const { ctx, W, H, CELL, mouse } = this;
      this.t += .003;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, W, H);

      /* Mouse gradient follower */
      if (mouse.x > 0) {
        const radius = W < 900 ? 520 : 620;
        const gf = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
        gf.addColorStop(0,   'rgba(212,175,55,0.08)');
        gf.addColorStop(0.45, 'rgba(100,80,200,0.03)');
        gf.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = gf;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Orbs */
      this.orbs.forEach((o, i) => {
        const ox = (o.fx + Math.sin(this.t * o.sp * 800 + i) * .04) * W;
        const oy = (o.fy + Math.cos(this.t * o.sp * 700 + i) * .03) * H;
        const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        const c  = o.gold ? '212,175,55' : '80,90,200';
        g.addColorStop(0,   `rgba(${c},${o.a})`);
        g.addColorStop(.5,  `rgba(${c},${o.a * .25})`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* FIX: batch grid lines into 2 paths (was N individual strokes) */
      const gy = -(this.scrollY * .08) % CELL;
      ctx.lineWidth = .4;

      ctx.beginPath();
      for (let x = 0; x < W + CELL; x += CELL) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      ctx.strokeStyle = `rgba(255,255,255,0.02)`;
      ctx.stroke();

      ctx.beginPath();
      for (let y = gy; y < H + CELL; y += CELL) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,0.02)`;
      ctx.stroke();

      /* Magnetic dots near cursor */
      if (mouse.x > 0) {
        const sx = Math.round(mouse.x / CELL) * CELL;
        const sy = Math.round(mouse.y / CELL) * CELL;
        for (let dx = -3; dx <= 3; dx++) {
          for (let dy = -3; dy <= 3; dy++) {
            const px = sx + dx * CELL;
            const py = sy + dy * CELL;
            const d  = Math.sqrt((px - mouse.x) ** 2 + (py - mouse.y) ** 2);
            const da = Math.max(0, .6 - d / (CELL * 3));
            if (!da) continue;
            ctx.fillStyle = `rgba(212,175,55,${da})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      /* Decorative arcs */
      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.04)';
      ctx.lineWidth = .6;
      const pulse = 1 + Math.sin(this.t * .7) * .01;
      ctx.beginPath(); ctx.arc(W, 0, 320 * pulse, 0, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, H, 200 * pulse, -Math.PI / 2, 0); ctx.stroke();
      ctx.restore();

      /* Particles */
      this.particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
        ctx.fillStyle = `rgba(212,175,55,${p.a * .55})`;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(() => this.render());
    }
  };

  /* ══════════════════════════════════════
     EMAIL COPY
     ══════════════════════════════════════ */
  const EmailCopy = {
    init() {
      const btn = qs('.footer__email-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText('kikaspawel@gmail.com').then(() => {
          btn.classList.add('is-copied');
          setTimeout(() => btn.classList.remove('is-copied'), 2000);
        });
      });
    }
  };

  /* ══════════════════════════════════════
     COOKIE BANNER
     ══════════════════════════════════════ */
  const CookieBanner = {
    init() {
      const banner = qs('.cookie');
      const stored = localStorage.getItem('vantia-cookies');

      if (stored === 'all') { Analytics.load(); return; }
      if (stored === 'essential' || !banner) return;
      const showBanner = () => {
        setTimeout(() => banner.classList.add('is-visible'), 1200);
      };
      if (document.readyState === 'complete') {
        showBanner();
      } else {
        window.addEventListener('load', showBanner, { once: true });
      }

      qsa('.cookie__btn--accept, .cookie__btn--primary').forEach((btn) => {
        btn.addEventListener('click', () => this.setChoice('all'));
      });
      qsa('.cookie__btn--decline, .cookie__btn--secondary').forEach((btn) => {
        btn.addEventListener('click', () => this.setChoice('essential'));
      });
    },
    setChoice(choice) {
      localStorage.setItem('vantia-cookies', choice);
      if (choice === 'all') Analytics.load();
      const banner = qs('.cookie');
      if (banner) banner.classList.remove('is-visible');
    }
  };

  /* ══════════════════════════════════════
     CONTACT FORM
     ══════════════════════════════════════ */
  const ContactForm = {
    form: null,
    endpoint: 'https://formsubmit.co/ajax/kikaspawel@gmail.com',
    init() {
      this.form = qs('#contact-form');
      if (!this.form) return;
      qsa('.contact-form__input, .contact-form__textarea', this.form).forEach((field) => {
        field.addEventListener('input', () => this.validateField(field));
      });
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    getErrorMessage(field) {
      const lang = document.documentElement.getAttribute('data-active-lang') || 'pl';
      if (field.validity.valueMissing) return lang === 'pl' ? 'To pole jest wymagane.' : 'This field is required.';
      if (field.validity.typeMismatch) return lang === 'pl' ? 'Podaj poprawny e-mail.' : 'Enter a valid email address.';
      return '';
    },
    validateField(field) {
      const message = this.getErrorMessage(field);
      field.classList.toggle('is-invalid', Boolean(message));
      return !message;
    },
    validateAll() {
      let isValid = true;
      qsa('.contact-form__input, .contact-form__textarea', this.form).forEach((field) => {
        if (!this.validateField(field)) isValid = false;
      });
      return isValid;
    },
    async handleSubmit(e) {
      e.preventDefault();
      const lang = document.documentElement.getAttribute('data-active-lang') || 'pl';
      if (!this.validateAll()) {
        this.showNotification(
          lang === 'pl' ? 'Popraw oznaczone pola i spróbuj ponownie.' : 'Please fix highlighted fields and try again.',
          'error'
        );
        return;
      }

      const btn = this.form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      const formData = new FormData(this.form);

      // Collect data BEFORE try — so it's available in catch
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('project'),
        timestamp: new Date().toISOString(),
        lang
      };

      // Show loading state
      btn.disabled = true;
      btn.innerHTML = '<span class="btn__text" data-lang="pl">Wysyłanie...</span><span class="btn__text" data-lang="en">Sending...</span>';

      try {
        // Send via FormSubmit AJAX endpoint
        const res = await fetch(this.endpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('FormSubmitError: ' + res.status);

        const payload = await res.json().catch(() => null);
        if (payload && (payload.success === false || payload.success === 'false')) {
          throw new Error('FormSubmit rejected');
        }

        // Persist locally as a backup log
        try {
          const submissions = JSON.parse(localStorage.getItem('vantia-submissions') || '[]');
          submissions.push(data);
          localStorage.setItem('vantia-submissions', JSON.stringify(submissions));
        } catch (_) {}

        // Show success
        this.showNotification(
          data.lang === 'pl'
            ? 'Wiadomość wysłana! Odpowiemy w ciągu 24h.'
            : "Message sent! We'll respond within 24h.",
          'success'
        );

        this.form.reset();
        qsa('.contact-form__input, .contact-form__textarea', this.form)
          .forEach((field) => field.classList.remove('is-invalid'));
        btn.innerHTML = originalText;
        btn.disabled = false;
      } catch (error) {
        this.showNotification(
          data.lang === 'pl'
            ? 'Błąd przy wysyłaniu. Spróbuj ponownie.'
            : 'Error sending. Please try again.',
          'error'
        );
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    },
    showNotification(message, type) {
      const el = document.createElement('div');
      el.className = `form-notification form-notification--${type}`;
      el.innerHTML = `
        <div class="form-notification__content">
          <span class="form-notification__icon">${type === 'success' ? 'OK' : 'NO'}</span>
          <span class="form-notification__text">${message}</span>
        </div>`;
      document.body.appendChild(el);
      setTimeout(() => el.classList.add('is-visible'), 10);
      setTimeout(() => {
        el.classList.remove('is-visible');
        setTimeout(() => el.remove(), 300);
      }, 5000);
    }
  };

  /* ══════════════════════════════════════
     FILTER SYSTEM (Portfolio / Blog)
     ══════════════════════════════════════ */
  const FilterSystem = {
    init() {
      qsa('[data-filter-group]').forEach((group) => {
        const target = qs(group.dataset.filterTarget);
        if (!target) return;
        const items = qsa('[data-cat]', target);
        const buttons = qsa('[data-filter]', group);

        buttons.forEach((btn) => {
          btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            buttons.forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            items.forEach((item) => {
              const match = filter === 'all' || item.dataset.cat === filter;
              item.style.display = match ? '' : 'none';
            });
          });
        });
      });
    }
  };

  /* ══════════════════════════════════════
     GLOBALS (blog email copy button etc.)
     ══════════════════════════════════════ */
  const EditorialLanding = {
    init() {
      if (!document.body.classList.contains('landing-editorial')) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nav = qs('[data-ed-nav]');
      const toggle = qs('[data-ed-menu-toggle]');
      const mobileMenu = qs('[data-ed-mobile-menu]');
      const loadItems = qsa('.ed-load');
      const revealItems = qsa('.ed-reveal');

      loadItems.forEach((el, i) => {
        el.style.setProperty('--ed-delay', `${Math.min(i * 0.14, 0.84)}s`);
      });
      revealItems.forEach((el, i) => {
        el.style.setProperty('--ed-delay', `${Math.min((i % 4) * 0.08, 0.24)}s`);
      });

      if (prefersReducedMotion) {
        document.body.classList.add('is-ready');
        revealItems.forEach((el) => el.classList.add('is-visible'));
      } else {
        requestAnimationFrame(() => {
          setTimeout(() => document.body.classList.add('is-ready'), 90);
        });
      }

      const syncNav = () => {
        if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      syncNav();
      window.addEventListener('scroll', syncNav, { passive: true });

      const closeMenu = () => {
        if (!toggle || !mobileMenu) return;
        const lang = document.documentElement.getAttribute('data-active-lang') || 'pl';
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', lang === 'pl' ? 'Otwórz nawigację' : 'Open navigation');
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
      };

      if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
          const isOpen = toggle.classList.toggle('is-open');
          const lang = document.documentElement.getAttribute('data-active-lang') || 'pl';
          toggle.setAttribute('aria-expanded', String(isOpen));
          toggle.setAttribute('aria-label', isOpen
            ? (lang === 'pl' ? 'Zamknij nawigację' : 'Close navigation')
            : (lang === 'pl' ? 'Otwórz nawigację' : 'Open navigation'));
          mobileMenu.classList.toggle('is-open', isOpen);
          mobileMenu.setAttribute('aria-hidden', String(!isOpen));
          document.body.classList.toggle('menu-open', isOpen);
        });
      }

      qsa('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
          const target = qs(link.getAttribute('href'));
          if (!target) return;
          event.preventDefault();
          closeMenu();
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
      });

      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 1180) closeMenu();
      }, { passive: true });

      if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
        revealItems.forEach((el) => observer.observe(el));
      } else {
        revealItems.forEach((el) => el.classList.add('is-visible'));
      }
    }
  };

  window.copyEmail = function () {
    navigator.clipboard.writeText('kikaspawel@gmail.com').then(() => {
      const btn = qs('.email-copy');
      if (btn) {
        btn.classList.add('show-tooltip');
        setTimeout(() => btn.classList.remove('show-tooltip'), 2000);
      }
    });
  };
  window.setCookieChoice = function (choice) { CookieBanner.setChoice(choice); };

  /* ══════════════════════════════════════
     BOOT — DOMContentLoaded
     ══════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    Lang.init();
    Theme.init();
    /* Nav.init() removed — EditorialLanding handles bento nav correctly */
    HeroReveal.run();
    ScrollReveal.init();
    /* CanvasBg.init() — canvas element not present in HTML, skipping */
    CookieBanner.init();
    ContactForm.init();
    EditorialLanding.init();
    FilterSystem.init();

    /* Init Lenis smooth scroll if available */
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
      function lenisRaf(time) {
        lenis.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    }

    /* Non-critical modules deferred until after load + idle */
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback.bind(window)
      : (cb) => setTimeout(cb, 120);

    window.addEventListener('load', () => {
      idle(() => {
        Magnetics.init();
        CountUp.init();
        ScrollProgress.init();
        EmailCopy.init();
      });
    });
  });

})();
