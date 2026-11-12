/* Bloc site: interaction and animation layer.
   Word reveals, block reveals, pinned hero headline, pinned app scene, cursor parallax,
   cursor spotlight, drifting glows. Every effect has a static fallback; nothing is hidden
   unless this script is running, and all motion stops for prefers-reduced-motion. */
(function () {
  'use strict';
  var doc = document.documentElement, body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 1021px)');
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var header = document.querySelector('.nav');
  var util = document.querySelector('.nav .util');
  var ready = false;

  /* ---- header: utility bar scrolls away, main bar stays; shadow after scroll ---- */
  function measure() {
    if (util) doc.style.setProperty('--utilh', util.offsetHeight + 'px');
    var main = header && header.querySelector('.w');
    if (main) doc.style.setProperty('--navh', main.offsetHeight + 'px');
  }
  measure();
  window.addEventListener('resize', measure);
  function onScrollHeader() { if (header) header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---- mobile menu ---- */
  var mb = document.querySelector('.mb'), menu = document.getElementById('menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    body.classList.toggle('menu-open', open);
    if (mb) mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var x = menu.querySelector('.mx'); if (x) x.focus(); } else if (mb) { mb.focus(); }
  }
  if (mb && menu) {
    mb.addEventListener('click', function () { setMenu(true); });
    menu.querySelector('.mx').addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  }

  /* ---- dropdowns: Escape closes and returns focus ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var a = document.activeElement;
    if (a && a.closest && a.closest('.dd')) a.blur();
  });

  if (reduce) {
    $$('.wr').forEach(function (el) { el.classList.add('in'); });
    return;
  }
  doc.classList.add('js');

  /* ---- word reveals ---- */
  function splitWords(el) {
    if (el.__split) return;
    el.__split = true;
    var idx = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
        var m = document.createElement('span'); m.className = 'hw';
        var s = document.createElement('span'); s.textContent = w;
        s.style.transitionDelay = Math.min(idx, 12) * 55 + 'ms';
        idx++; m.appendChild(s); frag.appendChild(m);
      });
      el.replaceChild(frag, node);
    });
  }
  var wrs = $$('main h1, main h2, .sc-cap h3').filter(function (el) { return !el.closest('.nav'); });
  wrs.forEach(function (el) { el.classList.add('wr'); splitWords(el); });

  /* ---- block reveals ---- */
  var RV = '.sec .lab,.sec .lead,.stmt .lab,.stmt p,.card,.bcard,.pc,.step,.si2,.fi,.stmt .ti,.split .sp,.split li,.faq details,.cbox,.dbox,.ipc,.ipr,.ipt .row,.ipn,.phbox,.duo,.trio';
  var rvs = $$(RV).filter(function (el) { return !el.closest('.nav') && !el.closest('.sc-pin') && !el.closest('.mnu'); });
  rvs.forEach(function (el) {
    var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (s) { return s.matches(RV); });
    var i = Math.max(0, sibs.indexOf(el));
    el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
    el.classList.add('rv');
    el.addEventListener('transitionend', function done(e) {
      if (e.target !== el || e.propertyName !== 'opacity') return;
      el.classList.remove('rv', 'in'); el.style.transitionDelay = ''; /* hand hover states back */
      el.removeEventListener('transitionend', done);
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  rvs.forEach(function (el) { io.observe(el); });
  var wio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); wio.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
  wrs.forEach(function (el) { if (!el.closest('.hero')) wio.observe(el); });
  /* hero and page-head headlines play on load */
  function playHeads() { $$('.hero h1, .iph h1').forEach(function (h) { h.classList.add('in'); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(playHeads, 80); }); else setTimeout(playHeads, 200);
  setTimeout(playHeads, 900);
  /* failsafe: never leave anything hidden */
  setTimeout(function () {
    $$('.rv:not(.in)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.add('in'); });
    $$('.wr:not(.in)').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.add('in'); });
  }, 2500);

  /* ---- drifting glows + cursor spotlight on dark bands; soft glows on heroes ---- */
  $$('.stmt, .navyb').forEach(function (el) {
    ['g1', 'g2'].forEach(function (c) { var g = document.createElement('i'); g.className = 'glow ' + c; g.setAttribute('aria-hidden', 'true'); el.insertBefore(g, el.firstChild); });
    if (fine) {
      var s = document.createElement('i'); s.className = 'spot'; s.setAttribute('aria-hidden', 'true'); el.insertBefore(s, el.firstChild);
      el.classList.add('has-spot');
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
    }
  });
  $$('.hero, .iph').forEach(function (el) {
    ['g1', 'g2'].forEach(function (c) { var g = document.createElement('i'); g.className = 'glow lt ' + c; g.setAttribute('aria-hidden', 'true'); el.insertBefore(g, el.firstChild); });
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  });

  /* ---- cursor parallax on hero cards ---- */
  var mp = [];
  [['.fc.c1', 16], ['.fc.c2', -12], ['.fc.c3', 14], ['.dashcard', 9]].forEach(function (p) {
    $$(p[0]).forEach(function (el) { mp.push({ el: el, d: p[1] }); });
  });
  if (mp.length && fine) {
    var tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    var loop = function () {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      mp.forEach(function (m) { m.el.style.transform = 'translate3d(' + (cx * m.d).toFixed(2) + 'px,' + (cy * m.d * 0.7).toFixed(2) + 'px,0)'; });
      requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  /* ---- home: pinned headline that eases from centre stage into the hero ---- */
  var hero = document.querySelector('.hero.hm');
  var z = { on: false, h1: null, pin: null, dx: 0, dy: 0, s: 1 };
  function ease(k) { return k * k * (3 - 2 * k); }
  function zoomFrame() {
    if (!z.on) return;
    var r = hero.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    var k = ease(Math.min(1, p / 0.5)), t = 1 - k;
    z.h1.style.transform = 'translate3d(' + (z.dx * t).toFixed(1) + 'px,' + (z.dy * t).toFixed(1) + 'px,0) scale(' + (1 + (z.s - 1) * t).toFixed(4) + ')';
    hero.style.setProperty('--k', k.toFixed(4));
    body.classList.toggle('stage2', k >= 0.85);
  }
  function zoomInit() {
    var ok = hero && desktop.matches && window.innerHeight >= 700;
    body.classList.toggle('zoomhero', !!ok);
    if (!ok) {
      z.on = false;
      if (hero) { hero.style.removeProperty('--k'); var h = hero.querySelector('h1'); if (h) h.style.transform = ''; var c = hero.querySelector('.cue'); if (c) c.remove(); }
      body.classList.remove('stage2');
      return;
    }
    z.h1 = hero.querySelector('h1'); z.pin = hero.querySelector(':scope > .w');
    var prev = z.h1.style.transform; z.h1.style.transform = 'none';
    var r = z.h1.getBoundingClientRect(), pr = z.pin.getBoundingClientRect();
    z.h1.style.transform = prev;
    /* measure against the pinned layout, not the scrolled one */
    var pinH = pr.height;
    var natTopInPin = r.top - pr.top, natLeftInPin = r.left - pr.left;
    z.s = Math.min(Math.max((pr.width * 0.78) / r.width, 1.25), 1.9);
    z.dx = (pr.width / 2) - (natLeftInPin + r.width / 2);
    z.dy = (pinH / 2) - (natTopInPin + r.height / 2);
    if (!hero.querySelector('.cue')) { var cue = document.createElement('div'); cue.className = 'cue'; cue.innerHTML = 'Scroll<i></i>'; cue.setAttribute('aria-hidden', 'true'); z.pin.appendChild(cue); }
    z.on = true;
    zoomFrame();
  }
  if (hero) {
    window.addEventListener('scroll', zoomFrame, { passive: true });
    window.addEventListener('resize', function () { body.classList.remove('zoomhero'); z.on = false; requestAnimationFrame(zoomInit); });
    zoomInit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(zoomInit);
  }

  /* ---- personal: pinned phone that changes screen as you scroll ---- */
  var scene = document.querySelector('.scene');
  if (scene) {
    var caps = $$('.sc-cap', scene), imgs = $$('.sc-img', scene), dots = $$('.sc-dots i', scene), cur = -1;
    var setIdx = function (i) {
      if (i === cur) return; cur = i;
      caps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
      imgs.forEach(function (c, k) { c.classList.toggle('on', k === i); });
      dots.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    };
    var frame = function () {
      if (!body.classList.contains('sceneon')) return;
      var r = scene.getBoundingClientRect(), span = r.height - window.innerHeight;
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      scene.style.setProperty('--csp', ease(p).toFixed(4));
      setIdx(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
    };
    var sceneInit = function () {
      var ok = desktop.matches && window.innerHeight >= 640;
      body.classList.toggle('sceneon', ok);
      if (!ok) { cur = -1; setIdx(0); } else frame();
    };
    window.addEventListener('scroll', frame, { passive: true });
    window.addEventListener('resize', sceneInit);
    sceneInit();
  }
  ready = true;
})();
