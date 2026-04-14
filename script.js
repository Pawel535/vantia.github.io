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
      // Initial language is set as early as possible in <head> to prevent CLS.
      const rootLang = document.documentElement.getAttribute('data-active-lang');
      const stored = localStorage.getItem('vantia-lang');
      const browserLang = navigator.language?.substring(0, 2);
      this.current = stored || rootLang || (browserLang === 'pl' ? 'pl' : 'en');
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
        // Compute max scroll height after layout settles to avoid forced reflow.
        const computeMax = () => {
          requestAnimationFrame(() => {
            this.maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          });
        };
        computeMax();
        window.addEventListener('load', computeMax, { once: true });
        window.addEventListener('resize', computeMax, { passive: true });
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
    scrollY: 0,
    CELL: 80,
    isVisible: true,
    frameInterval: 1000 / 30,
    lastFrameTime: 0,
    orbs: [
      { fx: .78, fy: .12, r: 400, gold: true, a: .10, sp: .0007 },
      { fx: .1, fy: .82, r: 280, gold: false, a: .05, sp: .0005 },
      { fx: .50, fy: .95, r: 220, gold: true, a: .04, sp: .0009 },
      { fx: .92, fy: .50, r: 180, gold: false, a: .035, sp: .0006 }
    ],
    particles: [],
    init() {
      this.cv = qs('.canvas-bg');
      if (!this.cv) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = navigator.connection?.saveData;
      const lowPowerViewport = window.innerWidth < 768;
      const lowEndDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4);
      if (reduceMotion || saveData || lowPowerViewport || lowEndDevice) {
        this.cv.style.display = 'none';
        return;
      }
      this.ctx = this.cv.getContext('2d');
      // Generate particles
      const particleCount = (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 8) ? 28 : 20;
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
      window.addEventListener('scroll', () => {
        this.scrollY = window.scrollY;
      }, { passive: true });
      // Visibility
      const obs = new IntersectionObserver((entries) => {
        this.isVisible = entries[0].isIntersecting;
      }, { threshold: 0 });
      obs.observe(this.cv);
      this.render();
    },
    resize() {
      this.W = this.cv.width = window.innerWidth;
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
      const gy = -(this.scrollY * .08) % CELL;
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

      if (stored === 'essential' || !banner) {
        return;
      }

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
      const messages = {
        name: data.lang === 'pl' ? 'Podaj poprawną nazwę lub imię.' : 'Please provide a valid name.',
        email: data.lang === 'pl' ? 'Podaj poprawny adres e-mail.' : 'Please provide a valid email address.',
        subject: data.lang === 'pl' ? 'Tytuł powinien mieć min. 5 znaków.' : 'Subject must have at least 5 characters.',
        message: data.lang === 'pl' ? 'Opis projektu powinien mieć min. 25 znaków.' : 'Project description must have at least 25 characters.',
        phone: data.lang === 'pl' ? 'Numer telefonu ma nieprawidłowy format.' : 'Phone number format is invalid.'
      };

      if (data.name.length < 2) return messages.name;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return messages.email;
      if (data.subject.length < 5) return messages.subject;
      if (data.message.length < 25) return messages.message;
      if (data.phone && !/^[+()\-\s0-9]{7,20}$/.test(data.phone)) return messages.phone;
      return null;
    },
    setButtonState(btn, loading) {
      if (!btn) return;
      if (loading) {
        btn.disabled = true;
        btn.innerHTML = '<span class="btn__text" data-lang="pl">Wysyłanie...</span><span class="btn__text" data-lang="en">Sending...</span>';
        return;
      }
      btn.disabled = false;
      btn.innerHTML = '<span class="btn__text" data-lang="pl">Wyślij zapytanie</span><span class="btn__text" data-lang="en">Submit Request</span>';
    },
    async handleSubmit(e) {
      e.preventDefault();

      const btn = this.form.querySelector('[type="submit"]');
      const lang = this.getLang();
      const formData = new FormData(this.form);

      const data = {
        name: this.sanitize(formData.get('name')),
        email: this.sanitize(formData.get('email')).toLowerCase(),
        subject: this.sanitize(formData.get('subject')),
        phone: this.sanitize(formData.get('phone')),
        message: this.sanitize(formData.get('project')),
        lang
      };

      const validationError = this.validate(data);
      if (validationError) {
        this.showNotification(validationError, 'error');
        return;
      }

      this.setButtonState(btn, true);

      const payload = new FormData();
      payload.append('name', data.name);
      payload.append('email', data.email);
      payload.append('subject', data.subject);
      payload.append('phone', data.phone || '-');
      payload.append('project', data.message);
      payload.append('_subject', `[VANTIA] ${data.subject} - ${data.name}`);
      payload.append('_template', 'table');
      payload.append('_captcha', 'false');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          body: payload,
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Form submit failed');

        this.showNotification(
          data.lang === 'pl'
            ? 'Wiadomość wysłana. Odpowiemy w ciągu 24h.'
            : 'Message sent! We\'ll respond within 24h.',
          'success'
        );

        this.form.reset();
      } catch (error) {
        this.showNotification(
          data.lang === 'pl'
            ? 'Błąd wysyłki. Sprawdź dane i spróbuj ponownie.'
            : 'Error sending. Please try again.',
          'error'
        );
      } finally {
        this.setButtonState(btn, false);
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
  window.setCookieChoice = function(choice) {
    CookieBanner.setChoice(choice);
  };

  document.addEventListener('DOMContentLoaded', () => {
    Lang.init();
    Preloader.init();
    Magnetics.init();
    Nav.init();
    CountUp.init();
    ScrollProgress.init();
    CanvasBg.init();
    EmailCopy.init();
    CookieBanner.init();
    ContactForm.init();
  });

})();
