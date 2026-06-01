(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prevButton = document.querySelector("[data-hero-prev]");
  var nextButton = document.querySelector("[data-hero-next]");
  var activeIndex = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle("is-active", itemIndex === activeIndex);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle("is-active", itemIndex === activeIndex);
    });
  }

  function moveSlide(step) {
    showSlide(activeIndex + step);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        moveSlide(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        moveSlide(1);
      });
    }

    heroTimer = window.setInterval(function () {
      moveSlide(1);
    }, 5200);

    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", function () {
        window.clearInterval(heroTimer);
      });

      hero.addEventListener("mouseleave", function () {
        heroTimer = window.setInterval(function () {
          moveSlide(1);
        }, 5200);
      });
    }
  }

  var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

  filterBars.forEach(function (bar) {
    var input = bar.querySelector("[data-filter-search]");
    var year = bar.querySelector("[data-filter-year]");
    var region = bar.querySelector("[data-filter-region]");
    var genre = bar.querySelector("[data-filter-genre]");
    var scope = document.querySelector(bar.getAttribute("data-filter-scope"));
    var emptyState = document.querySelector(bar.getAttribute("data-empty-state"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function runFilter() {
      if (!scope) {
        return;
      }

      var query = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var selectedGenre = normalize(genre && genre.value);
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".catalog-card"));
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }

        if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
          matched = false;
        }

        if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, region, genre].forEach(function (field) {
      if (field) {
        field.addEventListener("input", runFilter);
        field.addEventListener("change", runFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");
    if (queryValue && input) {
      input.value = queryValue;
    }

    runFilter();
  });
}());
