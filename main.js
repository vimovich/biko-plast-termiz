(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const WA = '998995779191';

  /* Preloader */
  const pre = $('.preloader');
  if (pre) {
    const bar = $('.preloader__bar i', pre), pct = $('.preloader__pct', pre);
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(p + Math.random() * 18, 92);
      bar.style.width = p + '%'; pct.textContent = Math.round(p) + '%';
    }, 120);
    const done = () => {
      clearInterval(t); bar.style.width = '100%'; pct.textContent = '100%';
      setTimeout(() => { pre.classList.add('done'); document.dispatchEvent(new Event('site:ready')); }, 250);
    };
    if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
    setTimeout(done, 3500);
  }

  /* Broken image fallback */
  $$('img').forEach(img => {
    const fail = () => { img.classList.add('broken'); img.parentElement && img.parentElement.classList.add('ph'); };
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener('error', fail);
  });

  /* Header */
  const header = $('.header');
  const toTop = $('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('scrolled', y > 60);
    toTop && toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop && toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Burger */
  const burger = $('.burger'), mm = $('.mobile-menu');
  burger && burger.addEventListener('click', () => {
    burger.classList.toggle('open'); mm.classList.toggle('open'); document.body.classList.toggle('lock');
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open'); mm.classList.remove('open'); document.body.classList.remove('lock');
  }));

  /* Hero slider */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero), texts = $$('.hero__text', hero);
    const cur = $('.hero__count b', hero), prog = $('.hero__progress', hero);
    let i = 0, timer;
    const go = n => {
      slides[i].classList.remove('active'); texts[i] && texts[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active'); texts[i] && texts[i].classList.add('active');
      cur.textContent = String(i + 1).padStart(2, '0');
      prog.classList.remove('run'); void prog.offsetWidth; prog.classList.add('run');
      clearTimeout(timer); timer = setTimeout(() => go(i + 1), 6000);
    };
    $('.hero__next', hero).addEventListener('click', () => go(i + 1));
    $('.hero__prev', hero).addEventListener('click', () => go(i - 1));
    let sx = 0;
    hero.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    hero.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 60) go(i + (d < 0 ? 1 : -1)); });
    go(0);
  }

  /* Reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* Counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, dur = 1600, st = performance.now();
    const step = now => {
      const k = Math.min((now - st) / dur, 1), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString('ru-RU');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step); cio.unobserve(el);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* Tabs filter */
  $$('[data-tabs]').forEach(group => {
    const target = $(group.dataset.tabs);
    $$('.tab', group).forEach(tab => tab.addEventListener('click', () => {
      $$('.tab', group).forEach(t => t.classList.remove('active')); tab.classList.add('active');
      const f = tab.dataset.filter;
      $$('[data-cat]', target).forEach(card => card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f));
    }));
  });

  /* Price-mode toggle */
  $$('[data-price-mode]').forEach(group => {
    $$('.tab', group).forEach(tab => tab.addEventListener('click', () => {
      $$('.tab', group).forEach(t => t.classList.remove('active')); tab.classList.add('active');
      const m = tab.dataset.mode;
      $$('[data-col]').forEach(c => c.style.display = (m === 'all' || c.dataset.col === m) ? '' : 'none');
    }));
  });

  /* Accordion */
  $$('.acc__item').forEach(item => {
    const q = $('.acc__q', item), a = $('.acc__a', item);
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.acc__item', item.parentElement).forEach(o => { o.classList.remove('open'); $('.acc__a', o).style.maxHeight = null; });
      if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });
  const firstAcc = $('.acc__item'); firstAcc && $('.acc__q', firstAcc).click();

  /* Modals */
  const openModal = (id, subject) => {
    const m = $(id); if (!m) return;
    m.classList.remove('sent');
    if (subject) { const s = $('[name="subject"]', m); if (s) s.value = subject; const h = $('.modal__subject', m); if (h) h.textContent = subject; }
    m.classList.add('open'); document.body.classList.add('lock');
  };
  const closeModal = m => { m.classList.remove('open'); document.body.classList.remove('lock'); };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal(t.dataset.modal, t.dataset.subject); }
    const c = e.target.closest('.modal__close, .modal__bg');
    if (c) closeModal(c.closest('.modal, .lightbox'));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal.open, .lightbox.open').forEach(closeModal); });

  /* Lightbox */
  const lb = $('.lightbox');
  $$('[data-lightbox]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); $('img', lb).src = a.href; lb.classList.add('open'); document.body.classList.add('lock');
  }));

  /* Phone mask */
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
    inp.addEventListener('input', fmt);
  });

  /* Toast */
  const toast = msg => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = '<i></i>' + msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4200);
  };

  /* Forms → WhatsApp lead */
  $$('form.lead-form').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(inp => {
      const f = inp.closest('.field');
      const bad = inp.type === 'tel' ? inp.value.replace(/\D/g, '').length < 12 : (inp.type === 'checkbox' ? !inp.checked : !inp.value.trim());
      if (f) f.classList.toggle('error', bad);
      if (bad) ok = false;
    });
    if (!ok) { toast('Проверьте заполнение полей'); return; }
    const data = new FormData(form);
    const lines = ['Заявка с сайта BIKO PLAST TERMIZ'];
    for (const [k, v] of data.entries()) {
      if (!v || k === 'agree') continue;
      const lbl = form.querySelector(`[name="${k}"]`)?.dataset.label || k;
      lines.push(`${lbl}: ${v}`);
    }
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
    const m = form.closest('.modal');
    if (m) m.classList.add('sent'); else toast('Спасибо! Заявка отправлена — менеджер свяжется с вами.');
    form.reset();
  }));

  /* Calculator */
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
      const leaves = +$('#c-leaf', calc).value, qty = +$('#c-qty', calc).value || 1;
      const col = $('#c-color', calc).value;
      const W = w / 1000, H = h / 1000;
      const ramaM = 2 * (W + H);
      const impM = Math.max(leaves - 1, 0) * H;
      const opening = +$('#c-open', calc).value;
      const stvM = opening * 2 * (W / leaves + H);
      const shtM = 2 * (W + H) + impM * 2;
      const per6 = (m, k) => (m / 6) * P[k][col];
      const profile = (per6(ramaM, 'rama') + per6(impM, 'imp') + per6(stvM, 'stvorka') + per6(shtM, 'shtapik')) * 1.08;
      const arm = ((ramaM + impM + stvM) / 6) * P.arm;
      const total = (profile + arm) * qty;
      $('#r-rama', calc).textContent = (ramaM * qty).toFixed(1) + ' м';
      $('#r-stv', calc).textContent = (stvM * qty).toFixed(1) + ' м';
      $('#r-imp', calc).textContent = (impM * qty).toFixed(1) + ' м';
      $('#r-arm', calc).textContent = fmt(arm * qty);
      $('#r-total', calc).textContent = fmt(total);
      const hid = $('#calc-summary'); if (hid) hid.value = `${w}×${h} мм, створок ${leaves}, откр. ${opening}, ${qty} шт, цвет ${$('#c-color', calc).selectedOptions[0].text}, ≈ ${fmt(total)}`;
    };
    $$('input,select', calc).forEach(el => el.addEventListener('input', run)); run();
  }

  /* Year */
  $$('.year').forEach(y => y.textContent = new Date().getFullYear());
})();
