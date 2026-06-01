(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupScrollButtons() {
    qsa('[data-scroll-left]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = qs('#' + button.getAttribute('data-scroll-left'));
        if (target) {
          target.scrollBy({ left: -420, behavior: 'smooth' });
        }
      });
    });
    qsa('[data-scroll-right]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = qs('#' + button.getAttribute('data-scroll-right'));
        if (target) {
          target.scrollBy({ left: 420, behavior: 'smooth' });
        }
      });
    });
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('.filter-input', scope);
      var year = qs('.filter-year', scope);
      var type = qs('.filter-type', scope);
      var cards = qsa('.movie-card', scope);

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-title') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = (!term || text.indexOf(term) !== -1) &&
            (!selectedYear || cardYear === selectedYear) &&
            (!selectedType || cardType === selectedType);
          card.classList.toggle('is-hidden', !matched);
        });
      }

      [input, year, type].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function setupPlayer(videoId, buttonId, overlayId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var ready = false;
    var hls = null;

    if (!video || !button || !overlay || !source) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      overlay.classList.add('is-loading');
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          overlay.classList.add('is-hidden');
          overlay.classList.remove('is-loading');
        }).catch(function () {
          overlay.classList.remove('is-loading');
        });
      } else {
        overlay.classList.add('is-hidden');
        overlay.classList.remove('is-loading');
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });

    overlay.addEventListener('click', function () {
      play();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('playing', function () {
      overlay.classList.add('is-hidden');
      overlay.classList.remove('is-loading');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupScrollButtons();
    setupFilters();
  });

  window.MovieSite = {
    setupPlayer: setupPlayer
  };
})();
