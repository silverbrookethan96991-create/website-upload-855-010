(function () {
  var qs = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var qsa = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  var normalize = function (value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  };

  qsa("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-missing");
    });
  });

  var menuToggle = qs("[data-menu-toggle]");
  var mobilePanel = qs("[data-mobile-panel]");
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var carousel = qs("[data-hero-carousel]");
  if (carousel) {
    var slides = qsa("[data-hero-slide]", carousel);
    var dots = qsa("[data-hero-dot]", carousel);
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  qsa("[data-filter-scope]").forEach(function (scope) {
    var grid = qs("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = qsa(".movie-card", grid);
    var typeValue = "all";
    var yearValue = "all";
    var applyFilter = function () {
      cards.forEach(function (card) {
        var matchType = typeValue === "all" || card.getAttribute("data-type") === typeValue;
        var matchYear = yearValue === "all" || card.getAttribute("data-year") === yearValue;
        card.hidden = !(matchType && matchYear);
      });
    };
    qsa("[data-type-filter]", scope).forEach(function (button) {
      button.addEventListener("click", function () {
        typeValue = button.getAttribute("data-type-filter") || "all";
        qsa("[data-type-filter]", scope).forEach(function (other) {
          other.classList.toggle("active", other === button);
        });
        applyFilter();
      });
    });
    qsa("[data-year-filter]", scope).forEach(function (button) {
      button.addEventListener("click", function () {
        yearValue = button.getAttribute("data-year-filter") || "all";
        qsa("[data-year-filter]", scope).forEach(function (other) {
          other.classList.toggle("active", other === button);
        });
        applyFilter();
      });
    });
  });

  var escapeHtml = function (value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  var renderResults = function (query) {
    var holder = qs("[data-global-results]");
    if (!holder || typeof window.siteMovies === "undefined") {
      return false;
    }
    var key = normalize(query);
    if (!key) {
      holder.hidden = true;
      holder.innerHTML = "";
      return true;
    }
    var hits = window.siteMovies.filter(function (movie) {
      return normalize(movie.title + movie.year + movie.region + movie.type + movie.genre + movie.line).indexOf(key) !== -1;
    }).slice(0, 48);
    var html = '<div class="search-result-panel"><div class="section-heading"><div><h2>搜索结果</h2><p>匹配片名、地区、年份、类型与题材。</p></div></div><div class="movie-grid dense">';
    html += hits.map(function (movie) {
      var title = escapeHtml(movie.title);
      var line = escapeHtml(movie.line);
      var year = escapeHtml(movie.year);
      var region = escapeHtml(movie.region);
      var type = escapeHtml(movie.type);
      var url = escapeHtml(movie.url);
      var poster = escapeHtml(movie.poster);
      return '<a class="movie-card compact" href="' + url + '">' +
        '<span class="poster-frame"><img src="' + poster + '" alt="' + title + '" loading="lazy"><span class="movie-type">' + type + '</span><span class="play-glow">▶</span></span>' +
        '<span class="movie-card-body"><strong>' + title + '</strong><em>' + line + '</em><span class="movie-card-meta"><span>' + year + '</span><span>' + region + '</span></span></span>' +
        '</a>';
    }).join("");
    if (!hits.length) {
      html += '<p class="empty-result">没有匹配的影片。</p>';
    }
    html += '</div></div>';
    holder.innerHTML = html;
    holder.hidden = false;
    qsa("img", holder).forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
    return true;
  };

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  if (initialQuery) {
    qsa("[data-site-search]").forEach(function (input) {
      input.value = initialQuery;
    });
    renderResults(initialQuery);
  }

  qsa("form").forEach(function (form) {
    var input = qs("[data-site-search]", form);
    if (!input) {
      return;
    }
    form.addEventListener("submit", function (event) {
      var value = input.value.trim();
      if (renderResults(value)) {
        event.preventDefault();
        if (value) {
          history.replaceState(null, "", "?q=" + encodeURIComponent(value));
          var holder = qs("[data-global-results]");
          if (holder) {
            holder.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    });
  });

  var startPlayer = function (player) {
    var video = qs("video", player);
    var streamUrl = player.getAttribute("data-stream");
    if (!video || !streamUrl) {
      return;
    }
    if (video.getAttribute("data-ready") !== "true") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = streamUrl;
      }
      video.setAttribute("data-ready", "true");
    }
    player.classList.add("playing");
    video.controls = true;
    var playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        player.classList.remove("playing");
      });
    }
  };

  qsa("[data-player]").forEach(function (player) {
    var trigger = qs("[data-play-trigger]", player);
    if (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayer(player);
      });
    }
    player.addEventListener("click", function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === "video") {
        return;
      }
      if (!player.classList.contains("playing")) {
        startPlayer(player);
      }
    });
  });
})();
