(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function filterCards(input) {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      card.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
    });
  }

  function setupFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    filters.forEach(function (input) {
      input.addEventListener("input", function () {
        filterCards(input);
      });
    });

    var searchInput = document.querySelector("[data-search-page-input]");
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      searchInput.value = q;
      filterCards(searchInput);
      searchInput.addEventListener("input", function () {
        filterCards(searchInput);
      });
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
