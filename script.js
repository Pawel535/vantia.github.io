/* ═══════════════════════════════════════════════════════════════
   VANTIA STUDIO — Runtime Engine 2026
   Modules: Preloader, Cursor, Magnetic, Canvas, ScrollReveal,
            Navigation, Language, CountUp, ScrollProgress
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── UTILS ── */
  const lerp = (a, b, t) => a + (b - a) * t;
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (s, p) => (p || document).querySelector(s);
  const qsa = (s, p) => [...(p || document).querySelectorAll(s)];

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
     1. PRELOADER
     ══════════════════════════════════════ */
  const Preloader = {
    el: null,
    fill: null,
    progress: 0,
    init() {
      this.el = qs('.preloader');
      this.fill = qs('.preloader__fill');
      if (!this.el) return;
      
      // Optymalizacja Premium: Nie katujemy usera ładowaniem przy każdym przejściu
      if (sessionStorage.getItem('vantia-preloaded')) {
        this.el.style.display = 'none';
        setTimeout(() => {
          HeroReveal.run();
          ScrollReveal.init();
        }, 50);
        return;
      }
      
      document.body.style.overflow = 'hidden';
      this.simulateLoad();
    },
    simulateLoad() {
      const steps = [30, 55, 75, 90, 100];
      let i = 0;
      const tick = () => {
        if (i >= steps.length) return;
        this.progress = steps[i];
        if (this.fill) this.fill.style.width = this.progress + '%';
        i++;
        if (i < steps.length) {
          setTimeout(tick, 200 + Math.random() * 200);
        }
      };
      tick();
window.addEventListener('load', () => {
          if (this.fill) this.fill.style.width = '100%';
          // Hide preloader immediately on load to avoid LCP delay
          this.hide();
        });
      // Fallback: hide after 4s max
      setTimeout(() => this.hide(), 4000);
    },
    hide() {
      if (!this.el || this.el.classList.contains('is-done')) return;
      this.el.classList.add('is-done');
      document.body.style.overflow = '';
      sessionStorage.setItem('vantia-preloaded', 'true');
      setTimeout(() => {
        HeroReveal.run();
        ScrollReveal.init();
      }, 300);
    }
  };



  /* ══════════════════════════════════════
     3. MAGNETIC BUTTONS
     ══════════════════════════════════════ */
  const Magnetics = {
    init() {
      if (isTouchDevice()) return;
      qsa('.magnetic').forEach((el) => {
        let rAFId = null;
        let cachedRect = null;
        
        const updateRect = () => {
          cachedRect = el.getBoundingClientRect();
        };
        
        el.addEventListener('mouseenter', updateRect);
        window.addEventListener('resize', updateRect, { passive: true });
        
        el.addEventListener('mousemove', (e) => {
          if (!cachedRect) return;
          
          if (rAFId) cancelAnimationFrame(rAFId);
          rAFId = requestAnimationFrame(() => {
            const x = e.clientX - cachedRect.left - cachedRect.width / 2;
            const y = e.clientY - cachedRect.top - cachedRect.height / 2;
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
     4. HERO REVEAL SEQUENCE
     ══════════════════════════════════════ */
  const HeroReveal = {
    run() {
      // Title words — staggered
      const words = qsa('.hero__title-word');
      words.forEach((w, i) => {
        setTimeout(() => w.classList.add('is-revealed'), 120 + i * 80);
      });
      // Tag
      const tag = qs('.hero__tag');
      if (tag) {
        setTimeout(() => {
          tag.style.transition = 'opacity .8s var(--ease-out), transform .8s var(--ease-out)';
          tag.style.opacity = '1';
          tag.style.transform = 'translateY(0)';
        }, 50);
      }
      // Subtitle
      const sub = qs('.hero__subtitle');
      if (sub) {
        setTimeout(() => {
          sub.style.transition = 'opacity .8s var(--ease-out), transform .8s var(--ease-out)';
          sub.style.opacity = '1';
          sub.style.transform = 'translateY(0)';
        }, 600);
      }
      // Actions
      const actions = qs('.hero__actions');
      if (actions) {
        setTimeout(() => {
          actions.style.transition = 'opacity .8s var(--ease-out), transform .8s var(--ease-out)';
          actions.style.opacity = '1';
          actions.style.transform = 'translateY(0)';
        }, 800);
      }
      // Corners
      qsa('.hero__corner').forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = 'opacity 1s var(--ease-out)';
          c.style.opacity = '1';
        }, 1200 + i * 150);
      });
      // Scroll hint + Badge
      const scroll = qs('.hero__scroll');
      const badge = qs('.hero__badge');
      setTimeout(() => { if (scroll) { scroll.style.transition = 'opacity 1s'; scroll.style.opacity = '1'; } }, 1500);
      setTimeout(() => { if (badge) { badge.style.transition = 'opacity 1s'; badge.style.opacity = '1'; } }, 1700);
    }
  };

  /* ══════════════════════════════════════
     5. SCROLL REVEAL — Staggered
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
     6. COUNT-UP ANIMATION
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
      const isSpecial = isNaN(target);
      if (isSpecial) { el.textContent = target; return; }
      const end = parseInt(target, 10);
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
        el.textContent = Math.round(end * eased);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  };

  /* ══════════════════════════════════════
     7. NAVIGATION
     ══════════════════════════════════════ */
  const Nav = {
    el: null,
    hamburger: null,
    mobileMenu: null,
    init() {
      this.el = qs('.nav');
      this.hamburger = qs('.nav__hamburger');
      this.mobileMenu = qs('.nav__mobile-menu');
      if (!this.el) return;
      // Scroll
      window.addEventListener('scroll', () => {
        this.el.classList.toggle('nav--scrolled', window.scrollY > 60);
      }, { passive: true });
      // Hamburger
      if (this.hamburger) {
        this.hamburger.addEventListener('click', () => this.toggleMobile());
      }
      // Mobile links close menu
      qsa('.nav__mobile-link').forEach((link) => {
        link.addEventListener('click', () => this.closeMobile());
      });
      // Smooth scroll
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
     8. LANGUAGE SWITCHER
     ══════════════════════════════════════ */
  const Lang = {
    current: 'pl',
    init() {
      // Detect from localStorage or browser
      const stored = localStorage.getItem('vantia-lang');
      if (stored) {
        this.current = stored;
      } else {
        const browserLang = navigator.language?.substring(0, 2);
        this.current = browserLang === 'pl' ? 'pl' : 'en';
      }
      this.apply(this.current);
      qsa('.lang-switch__btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.apply(btn.dataset.langBtn);
        });
      });
    },
    apply(lang) {
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
     9. SCROLL PROGRESS BAR
     ══════════════════════════════════════ */
const ScrollProgress = {
    bar: null,
    ticking: false,
    maxScroll: 0,
    init() {
        this.bar = qs('.scroll-progress');
        if (!this.bar) return;
        // Compute max scroll height once and update on resize
        const computeMax = () => { this.maxScroll = document.documentElement.scrollHeight - window.innerHeight; };
        computeMax();
        window.addEventListener('resize', computeMax);
        window.addEventListener('scroll', () => this.update(), { passive: true });
    },
    update() {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
            const progress = this.maxScroll > 0 ? window.scrollY / this.maxScroll : 0;
            this.bar.style.transform = `scaleX(${progress})`;
            this.ticking = false;
        });
    }
};

  /* ══════════════════════════════════════
     10. CANVAS BACKGROUND — Deep Dark Luxe
     ══════════════════════════════════════ */
  const CanvasBg = {
    cv: null, ctx: null, W: 0, H: 0, t: 0,
    mouse: { x: -9999, y: -9999 },
    CELL: 80,
    isVisible: true,
    isPaused: false,
    orbs: [
      { fx: .78, fy: .12, r: 400, gold: true, a: .10, sp: .0007 },
      { fx: .1, fy: .82, r: 280, gold: false, a: .05, sp: .0005 },
      { fx: .50, fy: .95, r: 220, gold: true, a: .04, sp: .0009 },
      { fx: .92, fy: .50, r: 180, gold: false, a: .035, sp: .0006 }
    ],
    particles: [],
    init() {
      this.cv = qs('.canvas-bg');
      if (!this.cv || prefersReducedMotion()) return;
      this.ctx = this.cv.getContext('2d');
      const particleCount = window.innerWidth < 900 ? 18 : 35;
      // Generate particles
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random(), y: Math.random(),
          r: Math.random() * 1.2 + .3,
          vx: (Math.random() - .5) * .00008,
          vy: (Math.random() - .5) * .00008,
          a: Math.random() * .25 + .06
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
      document.addEventListener('visibilitychange', () => {
        this.isPaused = document.hidden;
      });
      this.render();
    },
    resize() {
      this.W = this.cv.width = window.innerWidth;
      this.H = this.cv.height = window.innerHeight;
    },
    render() {
      if (!this.isVisible || this.isPaused) { requestAnimationFrame(() => this.render()); return; }
      const { ctx, W, H, CELL, mouse } = this;
      this.t += .003;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, W, H);

      // Gradient follower
      if (mouse.x > 0) {
        const gf = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
        gf.addColorStop(0, 'rgba(212,175,55,0.04)');
        gf.addColorStop(0.5, 'rgba(100,80,200,0.015)');
        gf.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gf;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 450, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbs
      this.orbs.forEach((o, i) => {
        const ox = (o.fx + Math.sin(this.t * o.sp * 800 + i) * .04) * W;
        const oy = (o.fy + Math.cos(this.t * o.sp * 700 + i) * .03) * H;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        const c = o.gold ? '212,175,55' : '80,90,200';
        g.addColorStop(0, `rgba(${c},${o.a})`);
        g.addColorStop(.5, `rgba(${c},${o.a * .25})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid
      const gy = -(window.scrollY * .08) % CELL;
      ctx.lineWidth = .4;
      for (let x = 0; x < W + CELL; x += CELL) {
        const proximity = Math.max(.008, .04 - Math.abs(x - mouse.x) / W * .04);
        ctx.strokeStyle = `rgba(255,255,255,${proximity})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = gy; y < H + CELL; y += CELL) {
        const proximity = Math.max(.008, .04 - Math.abs(y - mouse.y) / H * .04);
        ctx.strokeStyle = `rgba(255,255,255,${proximity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Magnetic dots near cursor
      if (mouse.x > 0) {
        const sx = Math.round(mouse.x / CELL) * CELL;
        const sy = Math.round(mouse.y / CELL) * CELL;
        for (let dx = -3; dx <= 3; dx++) {
          for (let dy = -3; dy <= 3; dy++) {
            const px = sx + dx * CELL, py = sy + dy * CELL;
            const d = Math.sqrt((px - mouse.x) ** 2 + (py - mouse.y) ** 2);
            const da = Math.max(0, .6 - d / (CELL * 3));
            if (!da) continue;
            ctx.fillStyle = `rgba(212,175,55,${da})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Decorative arcs
      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.04)';
      ctx.lineWidth = .6;
      const pulse = 1 + Math.sin(this.t * .7) * .01;
      ctx.beginPath();ctx.arc(W, 0, 320 * pulse, 0, Math.PI / 2);ctx.stroke();
      ctx.beginPath();ctx.arc(0, H, 200 * pulse, -Math.PI / 2, 0);ctx.stroke();
      ctx.restore();

      // Particles
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
     11. EMAIL COPY
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
     12. COOKIE BANNER
     ══════════════════════════════════════ */
  const CookieBanner = {
    init() {
      const banner = qs('.cookie');
      const stored = localStorage.getItem('vantia-cookies');

      if (stored === 'all') {
        Analytics.load();
        return;
      }

      if (stored === 'essential') return;
      if (!banner) {
        Analytics.load();
        return;
      }

      setTimeout(() => banner.classList.add('is-visible'), 2000);
      const autoAcceptTimer = setTimeout(() => {
        if (!localStorage.getItem('vantia-cookies')) {
          localStorage.setItem('vantia-cookies', 'all');
          Analytics.load();
          banner.classList.remove('is-visible');
        }
      }, 8000);

      qs('.cookie__btn--accept')?.addEventListener('click', () => {
        localStorage.setItem('vantia-cookies', 'all');
        Analytics.load();
        banner.classList.remove('is-visible');
        clearTimeout(autoAcceptTimer);
      });

      qs('.cookie__btn--decline')?.addEventListener('click', () => {
        localStorage.setItem('vantia-cookies', 'essential');
        banner.classList.remove('is-visible');
        clearTimeout(autoAcceptTimer);
      });
    }
  };

  /* ══════════════════════════════════════
     CONTACT FORM
     ══════════════════════════════════════ */
  const ContactForm = {
    form: null,
    init() {
      this.form = qs('#contact-form');
      if (!this.form) return;
      qsa('.contact-form__input', this.form).forEach((field) => {
        field.addEventListener('input', () => this.validateField(field));
      });
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    setStatus(message, type = 'neutral') {
      const status = qs('.contact-form__status', this.form);
      if (!status) return;
      status.textContent = message;
      status.style.color = type === 'error' ? '#e08c8c' : (type === 'success' ? '#9ad67a' : 'var(--text-secondary)');
    },
    getErrorMessage(field) {
      const lang = document.documentElement.getAttribute('data-active-lang') || 'pl';
      if (field.validity.valueMissing) return lang === 'pl' ? 'To pole jest wymagane.' : 'This field is required.';
      if (field.validity.typeMismatch) return lang === 'pl' ? 'Podaj poprawny adres e-mail.' : 'Enter a valid email address.';
      if (field.validity.tooShort) return lang === 'pl' ? `Minimum ${field.minLength} znakow.` : `Minimum ${field.minLength} characters.`;
      if (field.validity.tooLong) return lang === 'pl' ? `Maksymalnie ${field.maxLength} znakow.` : `Maximum ${field.maxLength} characters.`;
      return '';
    },
    validateField(field) {
      const errorEl = qs(`[data-field-error="${field.name}"]`, this.form);
      const message = this.getErrorMessage(field);
      field.classList.toggle('is-invalid', Boolean(message));
      if (errorEl) errorEl.textContent = message;
      return !message;
    },
    validateAll() {
      return qsa('.contact-form__input', this.form).every((field) => this.validateField(field));
    },
    async handleSubmit(e) {
      e.preventDefault();
      if (!this.validateAll()) {
        const lang = document.documentElement.getAttribute('data-active-lang') || 'pl';
        this.setStatus(
          lang === 'pl' ? 'Popraw oznaczone pola i sprobuj ponownie.' : 'Please fix highlighted fields and try again.',
          'error'
        );
        return;
      }
      
      const btn = this.form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      const formData = new FormData(this.form);
      const honeypot = formData.get('_honey');
      if (honeypot) return;
      
      // Show loading state
      btn.disabled = true;
      btn.innerHTML = '<span class="btn__text" data-lang="pl">Wysyłanie...</span><span class="btn__text" data-lang="en">Sending...</span>';
      this.setStatus('');
      
      // Collect data
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('project'),
        timestamp: new Date().toISOString(),
        lang: document.documentElement.getAttribute('data-active-lang') || 'pl'
      };
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch('https://formsubmit.co/ajax/kikaspawel@gmail.com', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Request failed');
        
        // Show success
        const successMessage =
          data.lang === 'pl' 
            ? 'Wiadomość wysłana! Odpowiemy w ciągu 24h.' 
            : 'Message sent! We\'ll respond within 24h.';
        this.showNotification(successMessage, 'success');
        this.setStatus(successMessage, 'success');
        
        this.form.reset();
        qsa('.contact-form__error', this.form).forEach((errorEl) => { errorEl.textContent = ''; });
        qsa('.contact-form__input', this.form).forEach((field) => field.classList.remove('is-invalid'));
        btn.innerHTML = originalText;
        btn.disabled = false;
      } catch (error) {
        const errorMessage =
          data.lang === 'pl'
            ? 'Błąd przy wysyłaniu. Spróbuj ponownie.'
            : 'Error sending. Please try again.';
        this.showNotification(errorMessage, 'error');
        this.setStatus(errorMessage, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    },
    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `form-notification form-notification--${type}`;
      notification.innerHTML = `
        <div class="form-notification__content">
          <span class="form-notification__icon">${type === 'success' ? '✓' : '✕'}</span>
          <span class="form-notification__text">${message}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Trigger animation
      setTimeout(() => notification.classList.add('is-visible'), 10);
      
      // Remove after 5 seconds
      setTimeout(() => {
        notification.classList.remove('is-visible');
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }
  };

  /* ══════════════════════════════════════
     BOOT
     ══════════════════════════════════════ */
  // Global function for blog post email copy button
  window.copyEmail = function() {
    navigator.clipboard.writeText('kikaspawel@gmail.com').then(() => {
      const btn = qs('.email-copy');
      if (btn) {
        btn.classList.add('show-tooltip');
        setTimeout(() => btn.classList.remove('show-tooltip'), 2000);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    Preloader.init();
    if (!prefersReducedMotion()) {
      Magnetics.init();
    }
    Nav.init();
    Lang.init();
    CountUp.init();
    ScrollProgress.init();
    CanvasBg.init();
    EmailCopy.init();
    CookieBanner.init();
    ContactForm.init();
  });

})();
