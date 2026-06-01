(function () {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      const targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      const direction = button.hasAttribute('data-scroll-left') ? -1 : 1;
      target.scrollBy({ left: direction * 420, behavior: 'smooth' });
    });
  });

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    const input = panel.querySelector('[data-filter-input]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const categorySelect = panel.querySelector('[data-filter-category]');
    const reset = panel.querySelector('[data-filter-reset]');
    const scope = panel.closest('main') || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const empty = scope.querySelector('[data-empty-state]');
    const years = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    }).filter(Boolean))).sort().reverse();

    years.forEach(function (year) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (query && input) {
      input.value = query;
    }

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const category = categorySelect ? categorySelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = card.getAttribute('data-text') || '';
        const title = card.getAttribute('data-title') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const okKeyword = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        const okYear = !year || cardYear === year;
        const okCategory = !category || cardCategory === category;
        const showCard = okKeyword && okYear && okCategory;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', apply);
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        apply();
      });
    }

    apply();
  });
})();

function initVideoPlayer(videoId, buttonId, videoUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  if (!video || !button || !videoUrl) {
    return;
  }

  let loaded = false;

  const load = function () {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = videoUrl;
  };

  const play = function () {
    load();
    button.classList.add('is-hidden');
    video.controls = true;
    const request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  };

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
