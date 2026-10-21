'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Header state ----
const header = $('#header');
const toTop = $('#to-top');
const progress = $('#progress');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
  toTop.classList.toggle('visible', window.scrollY > 600);
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
  }
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// ---- Mobile nav (dialog pattern: focus trap, Escape, restore focus) ----
(() => {
  const burger = $('#nav-burger');
  const nav = $('#mobile-nav');
  let opener = null;

  const focusables = () => $$('a[href], button', nav);
  const trap = (e) => {
    if (e.key !== 'Tab') return;
    const items = [burger, ...focusables()];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      opener = document.activeElement;
      nav.hidden = false;
      focusables()[0]?.focus();
      document.addEventListener('keydown', trap);
    } else {
      nav.hidden = true;
      document.removeEventListener('keydown', trap);
      opener?.focus();
    }
  };

  burger.addEventListener('click', () => setOpen(nav.hidden));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !nav.hidden) setOpen(false); });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches && !nav.hidden) setOpen(false); });
})();

// ---- Active nav link ----
(() => {
  const links = $$('.nav__link');
  const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((l) => l.classList.remove('active'));
      map.get(en.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  // observe every section so the highlight clears over sections without a nav link
  $$('main > section[id]').forEach((s) => io.observe(s));
})();

// ---- Scroll reveal ----
(() => {
  const els = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  els.forEach((el, i) => {
    // stagger siblings that enter together, capped so late items never wait
    const idx = $$(':scope > .reveal', el.parentElement).indexOf(el);
    el.style.transitionDelay = `${Math.min(Math.max(idx, 0), 4) * 120}ms`;
    io.observe(el);
  });
})();

// ---- Run log game: break the workflow, watch it recover ----
(() => {
  const log = $('#runlog');
  if (!log) return;
  const panel = log.closest('.runlog');
  const buttons = $$('.chaos');
  const state = $('#runlog-state');
  const prompt = $('#runlog-prompt');
  const scoreEl = $('#runlog-score');
  const runsEl = $('#runlog-runs');
  const cta = $('#runlog-cta');

  // [html, class, seconds since previous line]. Simulated runs, labelled as examples.
  const SCENARIOS = {
    intro: [
      ['webhook received &middot; invoice_0412.pdf', '', 0],
      ['<b class="t-auto">ai.extract</b> &rarr; vendor, amount, due_date', '', 1],
      ['validate: amount missing &rarr; <b class="t-warn">retry</b>', '', 0],
      ['validate: <b class="t-auto">ok</b>', '', 2],
      ['airtable.create &rarr; rec_{id}', '', 0],
      ['run complete &middot; 4.1s &middot; 0 dropped', 'runlog__done', 1],
    ],
    ok: [
      ['webhook received &middot; invoice_0413.pdf', '', 0],
      ['<b class="t-auto">ai.extract</b> &rarr; vendor, amount, due_date', '', 1],
      ['validate: <b class="t-auto">ok</b>', '', 1],
      ['airtable.create &rarr; rec_{id}', '', 1],
      ['run complete &middot; 3.2s &middot; 0 dropped', 'runlog__done', 1],
    ],
    malformed: [
      ['webhook received &middot; payload.json', '', 0],
      ['parse error: unexpected token at position 41', '', 1],
      ['<b class="t-warn">schema guard</b> &rarr; rejected before AI step', '', 0],
      ['route &rarr; human-review queue', '', 1],
      ['alert sent &rarr; #ops', '', 0],
      ['run complete &middot; 1.8s &middot; 0 dropped', 'runlog__done', 1],
    ],
    empty: [
      ['webhook received &middot; invoice_0414.pdf', '', 0],
      ['<b class="t-auto">ai.extract</b> &rarr; <b class="t-warn">empty response</b>', '', 1],
      ['guard: message content undefined &rarr; blank record blocked', '', 0],
      ['retry 1/2 &rarr; <b class="t-auto">ok</b>', '', 2],
      ['airtable.create &rarr; rec_{id}', '', 0],
      ['run complete &middot; 6.4s &middot; 0 dropped', 'runlog__done', 1],
    ],
    duplicate: [
      ['webhook received &middot; invoice_0412.pdf', '', 0],
      ['webhook received &middot; invoice_0412.pdf', '', 0],
      ['dedupe: key 0412 already processed &rarr; <b class="t-warn">skipped</b>', '', 1],
      ['1 record created, 0 duplicates', '', 0],
      ['run complete &middot; 2.1s &middot; 0 dropped', 'runlog__done', 1],
    ],
    token: [
      ['webhook received &middot; invoice_0415.pdf', '', 0],
      ['airtable.create &rarr; <b class="t-warn">401 token expired</b>', '', 1],
      ['oauth2.refresh &rarr; <b class="t-auto">ok</b>', '', 1],
      ['airtable.create (retry) &rarr; rec_{id}', '', 1],
      ['run complete &middot; 5.0s &middot; 0 dropped', 'runlog__done', 1],
    ],
  };
  const CHAOS = ['malformed', 'empty', 'duplicate', 'token'];

  const handled = new Set();
  let timers = [];
  let clock = 9 * 3600 + 14 * 60 + 2;   // 09:14:02
  let runs = 0;

  const fmt = (t) => [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60].map((n) => String(n).padStart(2, '0')).join(':');
  const recId = () => `rec_${Math.random().toString(36).slice(2, 6)}\u2026`;

  const addLine = ([html, cls, dt]) => {
    clock += dt;
    const li = document.createElement('li');
    if (cls) li.className = cls;
    const time = document.createElement('time');
    time.textContent = fmt(clock);
    const span = document.createElement('span');
    span.innerHTML = html.replace('rec_{id}', recId());   // html is static, authored above
    li.append(time, span);
    log.append(li);
    requestAnimationFrame(() => li.classList.add('on'));
  };

  const setBusy = (busy) => {
    buttons.forEach((b) => { b.disabled = busy; });
    state.textContent = busy ? 'running' : 'live';
  };

  const finish = (key) => {
    setBusy(false);
    runs += 1;
    if (CHAOS.includes(key) && !handled.has(key)) {
      handled.add(key);
      $(`[data-scenario="${key}"]`).classList.add('is-done');
      $(`[data-pip="${key}"]`).classList.add('on');
    }
    scoreEl.textContent = `${handled.size} of 4 failures handled`;
    runsEl.textContent = `${runs} run${runs === 1 ? '' : 's'} \u00b7 0 dropped`;
    if (handled.size === CHAOS.length) {
      panel.classList.add('runlog--won');
      prompt.textContent = 'Every failure was caught, retried or routed to a person.';
      cta.hidden = false;
    } else if (key !== 'intro') {
      const left = CHAOS.length - handled.size;
      prompt.textContent = `${left} failure mode${left === 1 ? '' : 's'} left to try.`;
    }
  };

  const play = (key) => {
    timers.forEach(clearTimeout);
    timers = [];
    log.innerHTML = '';
    setBusy(true);
    const lines = SCENARIOS[key];
    if (reduceMotion) {
      lines.forEach(addLine);
      finish(key);
      return;
    }
    lines.forEach((line, i) => timers.push(setTimeout(() => addLine(line), 350 + i * 430)));
    timers.push(setTimeout(() => finish(key), 350 + lines.length * 430 + 150));
  };

  buttons.forEach((b) => b.addEventListener('click', () => play(b.dataset.scenario)));
  play('intro');
})();

// ---- Work filter ----
(() => {
  const buttons = $$('.filter');
  const cards = $$('#work-grid .card');
  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.track === f;
      const wasHidden = c.hidden;
      c.hidden = !show;
      if (show && wasHidden && !reduceMotion) {
        c.classList.add('is-entering');
        c.addEventListener('animationend', () => c.classList.remove('is-entering'), { once: true });
      }
    });
  }));
})();

// ---- Contact form ----
(() => {
  const form = $('#contact-form');
  if (!form) return;
  const status = $('#form-status');
  const rules = {
    name:    (v) => (v ? '' : 'Enter your name.'),
    email:   (v) => (!v ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address, like you@company.com.'),
    message: (v) => (v ? '' : 'Describe the process or project in a sentence or two.'),
  };

  const check = (id) => {
    const input = $(`#${id}`);
    const msg = rules[id](input.value.trim());
    $(`#${id}-error`).textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  };

  Object.keys(rules).forEach((id) => $(`#${id}`).addEventListener('blur', () => check(id)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) { $('[aria-invalid="true"]', form)?.focus(); return; }

    const btn = $('[type="submit"]', form);
    const label = $('.btn__text', btn);
    btn.disabled = true;
    label.textContent = 'Sending';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.classList.add('ok');
      status.textContent = "Message sent. I'll reply within 24 hours.";
    } catch {
      status.classList.add('err');
      status.textContent = 'The message did not send. Try again, or email ade.enoch01@gmail.com.';
    } finally {
      btn.disabled = false;
      label.textContent = 'Send message';
    }
  });
})();

// ---- Image fallback ----
$$('img').forEach((img) => {
  const hide = () => { img.style.visibility = 'hidden'; };
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) hide();
  else img.addEventListener('error', hide);
});

// ---- Footer year ----
$('#year').textContent = new Date().getFullYear();

// ---- Workflow pipeline: steps light up in order once ----
(() => {
  const flow = $('.flow');
  if (!flow || reduceMotion || !('IntersectionObserver' in window)) return;
  const steps = $$('li', flow);
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    steps.forEach((li, i) => setTimeout(() => li.classList.add('lit'), 250 + i * 260));
    setTimeout(() => steps.forEach((li) => { if (!li.classList.contains('flow__ai')) li.classList.remove('lit'); }), 250 + steps.length * 260 + 700);
  }, { threshold: 0.6 });
  io.observe(flow);
})();

// ---- Testimonial slider: one at a time, in sequence ----
(() => {
  const root = $('#slider');
  if (!root) return;
  const slides = $$('.slide', root);
  const dotsEl = $('#slider-dots');
  const toggle = $('#slider-toggle');
  const DELAY = 8000;
  let index = 0;
  let timer = null;
  let userPaused = reduceMotion;   // autoplay is off by default for reduced motion
  let hovering = false;
  let visible = false;

  const dots = slides.map((_, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slider__dot';
    b.setAttribute('aria-label', `Show testimonial ${n + 1} of ${slides.length}`);
    b.addEventListener('click', () => show(n));
    dotsEl.append(b);
    return b;
  });

  const show = (n) => {
    index = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === index;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', String(!on));
      s.inert = !on;
    });
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === index)));
    if (timer) restart();
  };

  const stop = () => { clearInterval(timer); timer = null; };
  const restart = () => { stop(); timer = setInterval(() => show(index + 1), DELAY); };
  const sync = () => { if (!userPaused && !hovering && visible) { if (!timer) restart(); } else stop(); };

  const setToggle = () => {
    toggle.textContent = userPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', userPaused ? 'Start automatic slide change' : 'Pause automatic slide change');
  };

  $('#slider-prev').addEventListener('click', () => show(index - 1));
  $('#slider-next').addEventListener('click', () => show(index + 1));
  toggle.addEventListener('click', () => { userPaused = !userPaused; setToggle(); sync(); });
  root.addEventListener('mouseenter', () => { hovering = true; sync(); });
  root.addEventListener('mouseleave', () => { hovering = false; sync(); });
  root.addEventListener('focusin', () => { hovering = true; sync(); });
  root.addEventListener('focusout', () => { hovering = false; sync(); });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  let startX = 0;
  root.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  // only run the timer while the slider is on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(root);
  } else {
    visible = true;
  }

  setToggle();
  show(0);
})();
