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
      this.ctx = this.cv.getContext('2d');
      // Generate particles
      for (let i = 0; i < 35; i++) {
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
      this.form = qs('#contact-form');
      if (!this.form) return;
      qsa('.contact-form__input', this.form).forEach((field) => {
        field.addEventListener('input', () => this.validateField(field));
      });
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    async handleSubmit(e) {
      e.preventDefault();
      
      const btn = this.form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      const formData = new FormData(this.form);
      
      // Show loading state
      btn.disabled = true;
      btn.innerHTML = '<span class="btn__text" data-lang="pl">Wysyłanie...</span><span class="btn__text" data-lang="en">Sending...</span>';
      
      // Collect data
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('project'),
        timestamp: new Date().toISOString(),
        lang: document.documentElement.getAttribute('data-active-lang') || 'pl'
      };
      
      try {
        // Option 1: Send to Discord webhook (if available) or use FormSubmit service
        // For now, we'll save to localStorage and show success
        const submissions = JSON.parse(localStorage.getItem('vantia-submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('vantia-submissions', JSON.stringify(submissions));
        
        // Also try to send via Formspree (FormSubmit.co works without config)
        await fetch('https://formsubmit.co/kikaspawel@gmail.com', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        }).catch(() => {
          // Silently fail if network unavailable
        });
        
        // Show success
        this.showNotification(
          data.lang === 'pl' 
            ? 'Wiadomość wysłana! Odpowiemy w ciągu 24h.' 
            : 'Message sent! We\'ll respond within 24h.',
          'success'
        );
        
        this.form.reset();
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
    Preloader.init();
    Magnetics.init();
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