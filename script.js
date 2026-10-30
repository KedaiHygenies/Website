/* Kedai Hygenies — skrip bersama */
(function () {
  'use strict';

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Slideshow hero ---------- */
  var slider = document.querySelector('.slider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dotsBox = slider.querySelector('.dots');
    var current = 0;
    var timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Slide ' + (i + 1));
      b.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(b);
    });
    var dots = dotsBox.querySelectorAll('button');

    function show(n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === current);
        var v = s.querySelector('video');
        if (v) { if (i === current) { v.play(); } else { v.pause(); } }
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }
    function start() { if (!reduce) { timer = setInterval(function () { show(current + 1); }, 5000); } }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }

    slider.querySelector('.prev').addEventListener('click', function () { show(current - 1); restart(); });
    slider.querySelector('.next').addEventListener('click', function () { show(current + 1); restart(); });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    /* geser jari di HP */
    var x0 = null;
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    });

    show(0);
    start();
  }

  /* ---------- Checklist interaktif ---------- */
  var list = document.getElementById('live-checklist');
  if (list) {
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    var progress = document.getElementById('check-progress');
    var KEY = 'kedai-hygenies-checklist-' + new Date().toISOString().slice(0, 10);
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { saved = {}; }

    function update() {
      var done = 0;
      boxes.forEach(function (b) { if (b.checked) done++; });
      if (progress) { progress.textContent = done + ' dari ' + boxes.length + ' selesai hari ini'; }
    }
    boxes.forEach(function (b, i) {
      if (saved[i]) b.checked = true;
      b.addEventListener('change', function () {
        saved[i] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
        update();
      });
    });
    update();

    var reset = document.getElementById('check-reset');
    if (reset) reset.addEventListener('click', function () {
      boxes.forEach(function (b) { b.checked = false; });
      saved = {};
      try { localStorage.removeItem(KEY); } catch (e) {}
      update();
    });
    var print = document.getElementById('check-print');
    if (print) print.addEventListener('click', function () { window.print(); });
  }

  /* ---------- Daftar isi aktif saat scroll ---------- */
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove('active'); });
          if (map[en.target.id]) map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.info-content > article').forEach(function (a) { io.observe(a); });
  }
})();
