(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Disabled store buttons (until the app is live)
  document.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // Header state, scroll progress and hero parallax
  var header = document.getElementById('top');
  var progress = document.getElementById('progress');
  var parallax = Array.prototype.slice.call(document.querySelectorAll('.parallax'));
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (!reduceMotion) {
      parallax.forEach(function (el) {
        el.style.transform = 'translateY(' + y * parseFloat(el.dataset.speed || 0) + 'px)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Count-up numbers
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion || !target) return;
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Screenshot gallery arrows
  var gallery = document.getElementById('gallery');
  document.querySelectorAll('.gallery-nav button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var shot = gallery.querySelector('.shot');
      var step = shot ? shot.getBoundingClientRect().width + 28 : 260;
      gallery.scrollBy({ left: step * 2 * parseInt(btn.dataset.dir, 10), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // Warm-up level: a button you must not press (it dodges the mouse a few times)
  var btn = document.getElementById('bigbtn');
  var arena = document.getElementById('arena');
  var msg = document.getElementById('bigbtn-msg');
  var card = document.getElementById('tryit');
  var presses = 0;
  var dodges = 0;
  var lines = [
    'You touched it.',
    'Again? Really?',
    'The chicken saw that.',
    'That was a test. You failed.',
    'OK, at this point just download the game.',
    'Curiosity Killed the Button. 🏆'
  ];
  function say(text) {
    msg.textContent = text;
    msg.classList.remove('pop');
    void msg.offsetWidth;
    msg.classList.add('pop');
  }
  btn.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse' || reduceMotion || dodges >= 4) return;
    dodges++;
    var maxX = Math.max(0, (arena.clientWidth - btn.offsetWidth) / 2 - 8);
    var maxY = Math.max(0, (arena.clientHeight - btn.offsetHeight) / 2);
    var x = (Math.random() < 0.5 ? -1 : 1) * (maxX * (0.5 + Math.random() * 0.5));
    var y = (Math.random() * 2 - 1) * maxY;
    btn.style.translate = x + 'px ' + y + 'px';
    if (dodges === 4) {
      say("Fine. I'm tired. Just… don't.");
      setTimeout(function () { btn.style.translate = '0 0'; }, 700);
    }
  });
  btn.addEventListener('click', function () {
    say(lines[Math.min(presses, lines.length - 1)]);
    presses++;
    if (!reduceMotion) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
    if (navigator.vibrate) navigator.vibrate(40);
  });
})();
