(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initGlobalSearch() {
    all('[data-global-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) target += '?q=' + encodeURIComponent(value);
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) return;
    var slides = all('[data-hero-slide]', carousel);
    var buttons = all('[data-hero-to]', carousel);
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      buttons.forEach(function (button, i) {
        button.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        show(parseInt(button.getAttribute('data-hero-to'), 10) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var cards = all('.filter-card', scope);
      var input = scope.querySelector('[data-search-input]');
      var year = scope.querySelector('[data-year-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) input.value = q;

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var show = matchKeyword && matchYear;
          card.classList.toggle('is-hidden', !show);
          if (show) visible += 1;
        });
        if (empty) empty.style.display = visible ? 'none' : 'block';
      }

      if (input) input.addEventListener('input', apply);
      if (year) year.addEventListener('change', apply);
      apply();
    });
  }

  function attachHls(video, stream) {
    if (!stream || video.dataset.ready === '1') return;
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      video.dataset.ready = '1';
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.dataset.ready = '1';
    }
  }

  function initPlayers() {
    all('.cinema-player').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.center-play');
      var stream = player.getAttribute('data-stream');
      if (!video || !button || !stream) return;

      function play() {
        attachHls(video, stream);
        var action = video.paused ? video.play() : video.pause();
        if (action && action.catch) action.catch(function () {});
      }

      button.addEventListener('click', play);
      video.addEventListener('click', play);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initGlobalSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();
