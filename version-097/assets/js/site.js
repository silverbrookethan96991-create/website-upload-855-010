(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(input) {
    var selector = input.getAttribute('data-filter-scope');
    var scope = selector ? document.querySelector(selector) : null;
    if (!scope) {
      return;
    }

    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-text'));
      card.classList.toggle('is-filtered-out', query && haystack.indexOf(query) === -1);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.page-filter')).forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input);
    });
  });

  function sortCards(select) {
    var selector = select.getAttribute('data-sort-scope');
    var scope = selector ? document.querySelector(selector) : null;
    if (!scope) {
      return;
    }

    var mode = select.value;
    var cards = Array.prototype.slice.call(scope.children);

    cards.sort(function (a, b) {
      if (mode === 'year-desc') {
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      }

      if (mode === 'score-desc') {
        return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
      }

      if (mode === 'title-asc') {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      }

      return 0;
    });

    cards.forEach(function (card) {
      scope.appendChild(card);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.page-sort')).forEach(function (select) {
    select.addEventListener('change', function () {
      sortCards(select);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (query) {
    var searchInput = document.getElementById('search-page-input');
    var filterInput = document.getElementById('search-filter');

    if (searchInput) {
      searchInput.value = query;
    }

    if (filterInput) {
      filterInput.value = query;
      filterCards(filterInput);
    }
  }
})();
