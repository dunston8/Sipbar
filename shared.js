// SIP Bar — shared UI behaviors

(function () {
  // Nav scroll state
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu toggle
  const toggle = document.querySelector('.nav-mobile-toggle');
  const panel = document.querySelector('.nav-mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      panel.classList.toggle('open');
      document.body.style.overflow = panel.classList.contains('open') ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        panel.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Live "open now" indicator
  // Mon-Thu 15:00-02:30, Fri-Sat 15:00-03:30, Sun 15:00-01:00
  function computeOpen(now = new Date()) {
    // Use Europe/Oslo time via Intl
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Oslo',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const wd = parts.find(p => p.type === 'weekday').value; // Mon..Sun
    const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
    const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
    const mins = h * 60 + m;

    // Opening schedule per weekday keyed by start day
    // Returns true if currently open
    const schedule = {
      Mon: { open: 15 * 60, close: 26 * 60 + 30 }, // closes 02:30 Tue
      Tue: { open: 15 * 60, close: 26 * 60 + 30 },
      Wed: { open: 15 * 60, close: 26 * 60 + 30 },
      Thu: { open: 15 * 60, close: 26 * 60 + 30 },
      Fri: { open: 15 * 60, close: 27 * 60 + 30 }, // 03:30 Sat
      Sat: { open: 15 * 60, close: 27 * 60 + 30 },
      Sun: { open: 15 * 60, close: 25 * 60 },      // 01:00 Mon
    };
    const yest = { Mon: 'Sun', Tue: 'Mon', Wed: 'Tue', Thu: 'Wed', Fri: 'Thu', Sat: 'Fri', Sun: 'Sat' }[wd];

    const today = schedule[wd];
    const yday = schedule[yest];
    // check today
    if (mins >= today.open && mins < today.close && today.close <= 24 * 60) return true;
    if (mins >= today.open) return true; // open, closes after midnight
    // check yesterday spillover
    if (yday.close > 24 * 60 && mins < (yday.close - 24 * 60)) return true;
    return false;
  }
  const openEls = document.querySelectorAll('[data-open-indicator]');
  if (openEls.length) {
    const isOpen = computeOpen();
    openEls.forEach(el => {
      el.textContent = isOpen ? 'Åpent nå' : 'Stengt nå';
      el.classList.add(isOpen ? 'is-open' : 'is-closed');
    });
  }

  // Tonight's hours widget
  const tonightEl = document.querySelector('[data-tonight-hours]');
  if (tonightEl) {
    const wdFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', weekday: 'short' });
    const wd = wdFmt.format(new Date());
    const closeMap = { Mon:'02:30', Tue:'02:30', Wed:'02:30', Thu:'02:30', Fri:'03:30', Sat:'03:30', Sun:'01:00' };
    tonightEl.textContent = '15:00 – ' + (closeMap[wd] || '02:30');
  }

  // Hero cursor spotlight
  const spot = document.querySelector('[data-spotlight]');
  if (spot) {
    const root = spot.closest('[data-spotlight-root]') || document.body;
    root.addEventListener('pointermove', (e) => {
      const rect = root.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spot.style.setProperty('--mx', x + '%');
      spot.style.setProperty('--my', y + '%');
    });
  }

  // Parallax on hero photo (subtle)
  const parallax = document.querySelectorAll('[data-parallax]');
  if (parallax.length) {
    const onP = () => {
      const y = window.scrollY;
      parallax.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${y * speed}px, 0) scale(${1 + Math.min(y, 400) * 0.00025})`;
      });
    };
    onP();
    window.addEventListener('scroll', onP, { passive: true });
  }
})();
