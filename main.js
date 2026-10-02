(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const WA = '998995779191';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const pre = $('.preloader');
  const ready = () => document.dispatchEvent(new Event('site:ready'));
  if (pre) {
    const bar = $('.preloader__bar i', pre), pct = $('.preloader__pct', pre);
    let p = 0, finished = false;
    const t = setInterval(() => { p = Math.min(p + Math.random() * 16, 90); bar.style.width = p + '%'; pct.textContent = Math.round(p) + '%'; }, 110);
    const done = () => {
      if (finished) return; finished = true;
      clearInterval(t); bar.style.width = '100%'; pct.textContent = '100%';
      setTimeout(() => { pre.classList.add('done'); ready(); }, 260);
    };
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
    setTimeout(done, 2800);
  } else { requestAnimationFrame(ready); }

  /* ---------- Broken image fallback ---------- */
  $$('img').forEach(img => {
    const fail = () => { img.classList.add('broken'); img.parentElement && img.parentElement.classList.add('ph'); };
    if (img.complete && img.getAttribute('src') && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
  });

  /* ---------- Header / progress / to-top ---------- */
  const header = $('.header'), toTop = $('.to-top');
  const prog = document.createElement('div'); prog.className = 'progress-line'; document.body.appendChild(prog);
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header && header.classList.toggle('scrolled', y > 40);
    toTop && toTop.classList.toggle('show', y > 700);
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Burger ---------- */
  const burger = $('.burger'), mm = $('.mobile-menu');
  const setMenu = open => { burger.classList.toggle('open', open); mm.classList.toggle('open', open); document.body.classList.toggle('lock', open); };
  burger && burger.addEventListener('click', () => setMenu(!mm.classList.contains('open')));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (innerWidth > 1024 && mm && mm.classList.contains('open')) setMenu(false); });

  /* ---------- Hero slider ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero), texts = $$('.hero__text', hero), dots = $$('.hero__dot', hero);
    const DUR = 6500;
    // split h1 into masked words
    texts.forEach(t => {
      const h = $('h1', t); let i = 0;
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span'); w.className = 'w';
              const s = document.createElement('span'); s.textContent = part; s.style.transitionDelay = (0.1 + i++ * 0.07) + 's';
              w.appendChild(s); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(h);
    });
    hero.style.setProperty('--dur', DUR / 1000 + 's');
    let cur = 0, timer, busy = false;
    const show = (n, first) => {
      if (busy && !first) return;
      n = (n + slides.length) % slides.length;
      if (n === cur && !first) return;
      busy = true; setTimeout(() => busy = false, first ? 0 : 900);
      slides.forEach(s => s.classList.remove('is-prev'));
      if (!first) { slides[cur].classList.remove('active'); slides[cur].classList.add('is-prev'); texts[cur].classList.remove('active'); }
      cur = n;
      const s = slides[cur];
      const img = $('img', s); if (img.loading === 'lazy') img.loading = 'eager';
      void s.offsetWidth; s.classList.add('active');
      setTimeout(() => texts[cur].classList.add('active'), first ? 50 : 350);
      dots.forEach((d, i) => { d.classList.remove('active'); d.classList.toggle('done', i < cur); });
      void dots[cur].offsetWidth; dots[cur].classList.add('active');
      clearTimeout(timer); timer = setTimeout(() => show(cur + 1), DUR);
    };
    // preload next images after load
    window.addEventListener('load', () => slides.forEach(s => { const i = $('img', s); i.loading = 'eager'; }));
    $('.hero__next', hero).addEventListener('click', () => show(cur + 1));
    $('.hero__prev', hero).addEventListener('click', () => show(cur - 1));
    dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
    let sx = 0;
    hero.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    hero.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 60) show(cur + (d < 0 ? 1 : -1)); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else { clearTimeout(timer); timer = setTimeout(() => show(cur + 1), DUR); } });
    const start = () => show(0, true);
    if (pre) document.addEventListener('site:ready', start, { once: true }); else start();
  }

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .1, rootMargin: '0px 0px -6% 0px' });
  const startReveal = () => $$('.rv,.rv-img').forEach(el => io.observe(el));
  if (pre) document.addEventListener('site:ready', startReveal, { once: true }); else startReveal();

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, dur = 1700, st = performance.now();
    const step = now => {
      const k = Math.min((now - st) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString('ru-RU');
      if (k < 1) requestAnimationFrame(step);
    };
    reduce ? (el.textContent = to) : requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: .4 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Spotlight on bento ---------- */
  $$('.b-card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- Tabs filter ---------- */
  $$('[data-tabs]').forEach(group => {
    const target = $(group.dataset.tabs);
    $$('.tab', group).forEach(tab => tab.addEventListener('click', () => {
      $$('.tab', group).forEach(t => t.classList.remove('active')); tab.classList.add('active');
      const f = tab.dataset.filter;
      $$('[data-cat]', target).forEach(card => {
        const hide = f !== 'all' && card.dataset.cat !== f;
        card.classList.toggle('hide', hide);
        if (!hide) { card.classList.add('in'); card.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,.8,.2,1)' }); }
      });
    }));
  });

  /* ---------- Price-mode toggle ---------- */
  $$('[data-price-mode]').forEach(group => {
    $$('.tab', group).forEach(tab => tab.addEventListener('click', () => {
      $$('.tab', group).forEach(t => t.classList.remove('active')); tab.classList.add('active');
      const m = tab.dataset.mode;
      $$('[data-col]').forEach(c => c.style.display = (m === 'all' || c.dataset.col === m) ? '' : 'none');
    }));
  });

  /* ---------- Accordion ---------- */
  $$('.acc').forEach(acc => {
    $$('.acc__item', acc).forEach(item => {
      const q = $('.acc__q', item), a = $('.acc__a', item);
      q.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.acc__item', acc).forEach(o => { o.classList.remove('open'); $('.acc__a', o).style.maxHeight = null; });
        if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
    const first = $('.acc__item', acc); if (first) { first.classList.add('open'); $('.acc__a', first).style.maxHeight = $('.acc__a', first).scrollHeight + 'px'; }
  });

  /* ---------- Modals ---------- */
  const openModal = (id, subject) => {
    const m = $(id); if (!m) return;
    m.classList.remove('sent');
    if (subject) { const s = $('[name="subject"]', m); if (s) s.value = subject; const h = $('.modal__subject', m); if (h) h.textContent = subject; }
    m.classList.add('open'); document.body.classList.add('lock');
    setTimeout(() => { const f = $('input:not([type=hidden]):not([type=checkbox])', m); f && f.focus({ preventScroll: true }); }, 350);
  };
  const closeModal = m => { if (!m) return; m.classList.remove('open'); document.body.classList.remove('lock'); };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal(t.dataset.modal, t.dataset.subject); return; }
    const c = e.target.closest('.modal__close, .modal__bg');
    if (c) closeModal(c.closest('.modal, .lightbox'));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.open, .lightbox.open').forEach(closeModal); });

  /* ---------- Lightbox ---------- */
  const lb = $('.lightbox');
  $$('[data-lightbox]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); $('img', lb).src = a.href; lb.classList.add('open'); document.body.classList.add('lock');
  }));

  /* ---------- Phone mask ---------- */
  $$('input[type="tel"]').forEach(inp => {
    const fmt = () => {
      let d = inp.value.replace(/\D/g, '');
      if (!d.startsWith('998')) d = '998' + d.replace(/^998/, '');
      d = d.slice(0, 12);
      const p = [d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)];
      let out = '+998';
      if (p[0]) out += ' (' + p[0] + (p[0].length === 2 ? ')' : '');
      if (p[1]) out += ' ' + p[1];
      if (p[2]) out += '-' + p[2];
      if (p[3]) out += '-' + p[3];
      inp.value = out;
    };
    inp.addEventListener('focus', () => { if (!inp.value) inp.value = '+998 '; });
    inp.addEventListener('blur', () => { if (inp.value.replace(/\D/g, '') === '998') inp.value = ''; });
    inp.addEventListener('input', fmt);
  });

  /* ---------- Toast ---------- */
  const toast = msg => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = '<i></i>' + msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 4200);
  };

  /* ---------- Forms → WhatsApp lead ---------- */
  $$('form.lead-form').forEach(form => {
    $$('[required]', form).forEach(inp => inp.addEventListener('input', () => inp.closest('.field')?.classList.remove('error')));
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(inp => {
        const f = inp.closest('.field');
        const bad = inp.type === 'tel' ? inp.value.replace(/\D/g, '').length < 12 : (inp.type === 'checkbox' ? !inp.checked : !inp.value.trim());
        if (f) f.classList.toggle('error', bad);
        if (bad) ok = false;
      });
      if (!ok) { toast('Проверьте заполнение полей'); return; }
      const lines = ['Заявка с сайта BIKO PLAST TERMIZ'];
      for (const [k, v] of new FormData(form).entries()) {
        if (!v || k === 'agree') continue;
        const lbl = form.querySelector(`[name="${k}"]`)?.dataset.label || k;
        lines.push(`${lbl}: ${v}`);
      }
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
      const m = form.closest('.modal');
      if (m) m.classList.add('sent'); else toast('Спасибо! Заявка отправлена — менеджер свяжется с вами.');
      form.reset();
    });
  });

  /* ---------- Calculator ---------- */
  const calc = $('#calc');
  if (calc) {
    const P = {
      rama: { white: 154200, lam: 279400, one: 237600 },
      stvorka: { white: 169800, lam: 308600, one: 264600 },
      imp: { white: 169800, lam: 308600, one: 264600 },
      shtapik: { white: 37400, lam: 84700, one: 37400 },
      arm: 62500
    };
    const fmt = n => Math.round(n).toLocaleString('ru-RU') + ' сум';
    const run = () => {
      const w = +$('#c-w', calc).value || 0, h = +$('#c-h', calc).value || 0;
      const leaves = +$('#c-leaf', calc).value, qty = Math.max(+$('#c-qty', calc).value || 1, 1);
      const opening = Math.min(+$('#c-open', calc).value, leaves);
      const col = $('#c-color', calc).value;
      const W = w / 1000, H = h / 1000;
      const ramaM = 2 * (W + H), impM = Math.max(leaves - 1, 0) * H, stvM = opening * 2 * (W / leaves + H), shtM = 2 * (W + H) + impM * 2;
      const per6 = (m, k) => (m / 6) * P[k][col];
      const profile = (per6(ramaM, 'rama') + per6(impM, 'imp') + per6(stvM, 'stvorka') + per6(shtM, 'shtapik')) * 1.08;
      const arm = ((ramaM + impM + stvM) / 6) * P.arm;
      const total = (profile + arm) * qty;
      $('#r-rama', calc).textContent = (ramaM * qty).toFixed(1) + ' м';
      $('#r-stv', calc).textContent = (stvM * qty).toFixed(1) + ' м';
      $('#r-imp', calc).textContent = (impM * qty).toFixed(1) + ' м';
      $('#r-arm', calc).textContent = fmt(arm * qty);
      $('#r-total', calc).textContent = fmt(total);
      const hid = $('#calc-summary');
      if (hid) hid.value = `${w}×${h} мм, секций ${leaves}, створок ${opening}, ${qty} шт, ${$('#c-color', calc).selectedOptions[0].text}, ≈ ${fmt(total)}`;
    };
    $$('input,select', calc).forEach(el => el.addEventListener('input', run)); run();
  }

  $$('.year').forEach(y => y.textContent = new Date().getFullYear());
})();
