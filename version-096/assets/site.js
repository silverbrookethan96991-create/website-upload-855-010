(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function numberValue(value) {
    var num = parseFloat(value || '0');
    return Number.isFinite(num) ? num : 0;
  }

  ready(function() {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('.menu-toggle');
    if (header && menuToggle) {
      menuToggle.addEventListener('click', function() {
        var open = header.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }
      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
        });
      });
      if (slides.length > 1) {
        setInterval(function() {
          showSlide(current + 1);
        }, 5000);
      }
    }

    document.querySelectorAll('[data-toolbar]').forEach(function(toolbar) {
      var grid = toolbar.parentElement.querySelector('.sortable-grid');
      var sortSelect = toolbar.querySelector('.sort-select');
      var viewButtons = Array.prototype.slice.call(toolbar.querySelectorAll('.view-button'));
      if (!grid) {
        return;
      }
      if (sortSelect) {
        sortSelect.addEventListener('change', function() {
          sortCards(grid, sortSelect.value);
        });
      }
      viewButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          viewButtons.forEach(function(item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          grid.classList.toggle('list-view', button.getAttribute('data-view') === 'list');
        });
      });
    });

    var searchPanel = document.querySelector('[data-search-panel]');
    if (searchPanel) {
      var input = document.getElementById('pageSearchInput');
      var region = document.getElementById('regionFilter');
      var type = document.getElementById('typeFilter');
      var year = document.getElementById('yearFilter');
      var sort = document.getElementById('searchSort');
      var grid = document.getElementById('searchResults');
      var empty = document.querySelector('.no-result');
      var params = new URLSearchParams(window.location.search);
      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      function applySearch() {
        if (!grid) {
          return;
        }
        var keyword = (input && input.value || '').trim().toLowerCase();
        var regionValue = region && region.value || '';
        var typeValue = type && type.value || '';
        var yearValue = year && year.value || '';
        var shown = 0;
        Array.prototype.slice.call(grid.children).forEach(function(card) {
          var matchKeyword = !keyword || (card.getAttribute('data-search') || '').toLowerCase().indexOf(keyword) !== -1;
          var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var visible = matchKeyword && matchRegion && matchType && matchYear;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (sort && sort.value !== 'default') {
          sortCards(grid, sort.value);
        }
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }
      [input, region, type, year, sort].forEach(function(element) {
        if (element) {
          element.addEventListener(element === input ? 'input' : 'change', applySearch);
        }
      });
      applySearch();
    }
  });

  function sortCards(grid, mode) {
    var cards = Array.prototype.slice.call(grid.children);
    var sorted = cards.sort(function(a, b) {
      if (mode === 'latest') {
        return numberValue(b.getAttribute('data-year')) - numberValue(a.getAttribute('data-year'));
      }
      if (mode === 'rating') {
        return numberValue(b.getAttribute('data-rating')) - numberValue(a.getAttribute('data-rating'));
      }
      if (mode === 'popular') {
        return numberValue(b.getAttribute('data-views')) - numberValue(a.getAttribute('data-views'));
      }
      return 0;
    });
    sorted.forEach(function(card) {
      grid.appendChild(card);
    });
  }
})();
