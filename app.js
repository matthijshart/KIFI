// ClaimKompas v3 — minimal interactivity (tabs, counters, hero preview)
(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

  // Year
  const y = qs('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Drawer
  const drawer = qs('#drawer');
  const burger = qs('#burger');
  const dlinks = qsa('.dlink');
  const openDrawer = () => { drawer?.classList.add('open'); drawer?.setAttribute('aria-hidden','false'); };
  const closeDrawer = () => { drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden','true'); };

  burger?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  drawer?.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
  dlinks.forEach(a => a.addEventListener('click', () => closeDrawer()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // Smooth scroll
  document.documentElement.style.scrollBehavior = 'smooth';

  // Reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting){
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  qsa('.reveal').forEach(el => io.observe(el));

  // Counters
  const animateCount = (el, to) => {
    const dur = 750;
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  qsa('.tnum').forEach(el => {
    const to = parseInt(el.getAttribute('data-count') || '0', 10);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting){
          animateCount(el, to);
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.7 });
    obs.observe(el);
  });

  // Hero preview cases (very simple, low-text)
  const heroRisk = qs('#heroRisk');
  const heroFill = qs('#heroFill');
  const heroRiskLabel = qs('#heroRiskLabel');
  const heroNBA = qs('#heroNBA');
  const cases = qsa('.case');

  const labelFor = (r) => {
    if (r >= 70) return ['hoog','high'];
    if (r >= 45) return ['middel','med'];
    return ['laag','low'];
  };

  const setHero = (risk, nba) => {
    const r = clamp(risk, 0, 100);
    const [txt, cls] = labelFor(r);

    if (heroRisk) heroRisk.textContent = `${Math.round(r)}%`;
    if (heroFill) heroFill.style.width = `${Math.round(r)}%`;
    if (heroNBA) heroNBA.textContent = nba;

    if (heroRiskLabel){
      heroRiskLabel.textContent = txt;
      heroRiskLabel.classList.remove('high','med','low');
      heroRiskLabel.classList.add(cls);
    }
  };

  cases.forEach(btn => {
    btn.addEventListener('click', () => {
      cases.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      const risk = parseInt(btn.getAttribute('data-risk') || '0', 10);
      const nba = btn.getAttribute('data-nba') || '—';
      setHero(risk, nba);
    });
  });

  // Tabs
  const tabs = qsa('.tab');
  const panes = qsa('.pane');

  const setTab = (id) => {
    tabs.forEach(t => {
      const active = t.getAttribute('aria-controls') === id;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });
    panes.forEach(p => p.classList.toggle('active', p.id === id));
  };

  tabs.forEach(t => {
    t.addEventListener('click', () => setTab(t.getAttribute('aria-controls')));
    t.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(t);
      if (e.key === 'ArrowRight'){ e.preventDefault(); tabs[(idx+1)%tabs.length].focus(); }
      if (e.key === 'ArrowLeft'){ e.preventDefault(); tabs[(idx-1+tabs.length)%tabs.length].focus(); }
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); setTab(t.getAttribute('aria-controls')); }
    });
  });

  // Fake export (small feedback)
  const fakeExport = qs('#fakeExport');
  if (fakeExport){
    fakeExport.addEventListener('click', () => {
      const old = fakeExport.textContent;
      fakeExport.textContent = 'Export klaar ✓';
      fakeExport.disabled = true;
      setTimeout(() => {
        fakeExport.textContent = old;
        fakeExport.disabled = false;
      }, 1500);
    });
  }
})();