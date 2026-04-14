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
  const qs  = (s, p) => (p || document).querySelector(s);
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
      /* Words — staggered */
      qsa('.hero__title-word').forEach((w, i) => {
        setTimeout(() => w.classList.add('is-revealed'), 120 + i * 80);
      });
      /* Tag */
      const tag = qs('.hero__tag');
      if (tag) setTimeout(() => tag.classList.add('is-revealed'), 50);
      /* Subtitle */
      const sub = qs('.hero__subtitle');
      if (sub) setTimeout(() => sub.classList.add('is-revealed'), 600);
      /* Actions */
      const actions = qs('.hero__actions');
      if (actions) setTimeout(() => actions.classList.add('is-revealed'), 800);
      /* Corners */
      qsa('.hero__corner').forEach((c, i) => {
        setTimeout(() => c.classList.add('is-revealed'), 1200 + i * 150);
      });
      /* Scroll + Badge */
      const scroll = qs('.hero__scroll');
      const badge = qs('.hero__badge');
      setTimeout(() => scroll && scroll.classList.add('is-revealed'), 1500);
      setTimeout(() => badge && badge.classList.add('is-revealed'), 1700);
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
              this.observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
      qsa('.reveal').forEach((el) => this.observer.observe(el));
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

      window.addEventListener('scroll', () => {
        this.el.classList.toggle('nav--scrolled', window.scrollY > 60);
      }, { passive: true });

      if (this.hamburger) {
        this.hamburger.addEventListener('click', () => this.toggleMobile());
      }

      qsa('.nav__mobile-link').forEach((link) => {
        link.addEventListener('click', () => this.closeMobile());
      });

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
      const open = this.hamburger.classList.toggle('is-open');
      this.mobileMenu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    },
    closeMobile() {
      if (this.hamburger) this.hamburger.classList.remove('is-open');
      if (this.mobileMenu) this.mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
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
    init() {
      /* Read lang already applied by inline head script */
      this.current = document.documentElement.getAttribute('data-active-lang') || 'pl';
      /* Sync button states without triggering a re-apply */
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.langBtn === this.current);
      });
      /* Wire buttons */
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.addEventListener('click', () => this.apply(btn.dataset.langBtn));
      });
    },
    apply(lang) {
      if (this.current === lang) return; /* no-op if already active */
      this.current = lang;
      localStorage.setItem('vantia-lang', lang);
      document.documentElement.setAttribute('data-active-lang', lang);
      document.documentElement.setAttribute('lang', lang === 'pl' ? 'pl-PL' : 'en');
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.langBtn === lang);
      });
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
    paused: false,              /* NEW: hard-stop flag */
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

      const reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData      = navigator.connection?.saveData;
      const smallViewport = window.innerWidth < 768;
      const lowEnd        = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                            (navigator.deviceMemory && navigator.deviceMemory <= 4);

      if (reduceMotion || saveData || smallViewport || lowEnd) {
        this.cv.style.display = 'none';
        return;
      }

      this.ctx = this.cv.getContext('2d');

      const count = (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8) ? 28 : 20;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random(), y: Math.random(),
          r:  Math.random() * 1.2 + .3,
          vx: (Math.random() - .5) * .00008,
          vy: (Math.random() - .5) * .00008,
          a:  Math.random() * .25 + .06
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

      window.addEventListener('scroll', () => {
        this.scrollY = window.scrollY;
      }, { passive: true });

      /* FIX: pause loop when canvas is off-screen, resume when visible */
      new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        this.isVisible = visible;
        if (visible && this.paused) {
          this.paused = false;
          this.render();  /* restart loop */
        }
      }, { threshold: 0 }).observe(this.cv);

      this.render();
    },
    resize() {
      this.W = this.cv.width  = window.innerWidth;
      this.H = this.cv.height = window.innerHeight;
    },
    render() {
      /* FIX: hard-stop when not visible instead of scheduling another frame */
      if (!this.isVisible) {
        this.paused = true;
        return;
      }

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
        const gf = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
        gf.addColorStop(0,   'rgba(212,175,55,0.04)');
        gf.addColorStop(0.5, 'rgba(100,80,200,0.015)');
        gf.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = gf;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 450, 0, Math.PI * 2);
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
        ctx.fillStyle = `rgba(212,175,55,${p.a * .35})`;
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
      const btn = qs('.footer__email');
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

      setTimeout(() => banner.classList.add('is-visible'), 2000);

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
      this.form = qs('.contact-form');
      if (!this.form) return;
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    getLang() {
      return document.documentElement.getAttribute('data-active-lang') || 'pl';
    },
    sanitize(value) {
      return String(value || '').trim().replace(/\s+/g, ' ');
    },
    validate(data) {
      const pl = data.lang === 'pl';
      if (data.name.length < 2)
        return pl ? 'Podaj poprawną nazwę lub imię.' : 'Please provide a valid name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return pl ? 'Podaj poprawny adres e-mail.' : 'Please provide a valid email address.';
      if (data.subject.length < 5)
        return pl ? 'Tytuł powinien mieć min. 5 znaków.' : 'Subject must have at least 5 characters.';
      if (data.message.length < 25)
        return pl ? 'Opis projektu powinien mieć min. 25 znaków.' : 'Project description must have at least 25 characters.';
      if (data.phone && !/^[+()\-\s0-9]{7,20}$/.test(data.phone))
        return pl ? 'Numer telefonu ma nieprawidłowy format.' : 'Phone number format is invalid.';
      return null;
    },
    setButtonState(btn, loading) {
      if (!btn) return;
      btn.disabled = loading;
      btn.innerHTML = loading
        ? '<span class="btn__text" data-lang="pl">Wysyłanie...</span><span class="btn__text" data-lang="en">Sending...</span>'
        : '<span class="btn__text" data-lang="pl">Wyślij zapytanie</span><span class="btn__text" data-lang="en">Submit Request</span>';
    },
    async handleSubmit(e) {
      e.preventDefault();
      const btn  = this.form.querySelector('[type="submit"]');
      const lang = this.getLang();
      const fd   = new FormData(this.form);
      const data = {
        name:    this.sanitize(fd.get('name')),
        email:   this.sanitize(fd.get('email')).toLowerCase(),
        subject: this.sanitize(fd.get('subject')),
        phone:   this.sanitize(fd.get('phone')),
        message: this.sanitize(fd.get('project')),
        lang
      };

      const err = this.validate(data);
      if (err) { this.showNotification(err, 'error'); return; }

      this.setButtonState(btn, true);

      const payload = new FormData();
      payload.append('name',     data.name);
      payload.append('email',    data.email);
      payload.append('subject',  data.subject);
      payload.append('phone',    data.phone || '-');
      payload.append('project',  data.message);
      payload.append('_subject', `[VANTIA] ${data.subject} - ${data.name}`);
      payload.append('_template','table');
      payload.append('_captcha', 'false');

      try {
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 8000);
        const response   = await fetch(this.endpoint, {
          method: 'POST',
          body: payload,
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Form submit failed');
        this.showNotification(
          lang === 'pl'
            ? 'Wiadomość wysłana. Odpowiemy w ciągu 24h.'
            : "Message sent! We'll respond within 24h.",
          'success'
        );
        this.form.reset();
      } catch {
        this.showNotification(
          lang === 'pl'
            ? 'Błąd wysyłki. Sprawdź dane i spróbuj ponownie.'
            : 'Error sending. Please try again.',
          'error'
        );
      } finally {
        this.setButtonState(btn, false);
      }
    },
    showNotification(message, type) {
      const el = document.createElement('div');
      el.className = `form-notification form-notification--${type}`;
      el.innerHTML = `
        <div class="form-notification__content">
          <span class="form-notification__icon">${type === 'success' ? '✓' : '✕'}</span>
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
     GLOBALS (blog email copy button etc.)
     ══════════════════════════════════════ */
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
    Lang.init();           /* only syncs buttons — lang already applied by head script */
    ScrollReveal.init();
    Nav.init();
    CookieBanner.init();
    ContactForm.init();

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
        CanvasBg.init();
      });
    });
  });

})();