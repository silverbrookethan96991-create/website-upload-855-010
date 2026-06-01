import { H as Hls } from "./hls-vendor.js";

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function initMenu() {
  const button = qs("[data-menu-button]");
  const panel = qs("[data-mobile-panel]");
  if (!button || !panel) return;

  button.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function initSearchForms() {
  qsa("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = qs("input", form);
      const query = input ? input.value.trim() : "";
      const target = query ? `./search.html?q=${encodeURIComponent(query)}` : "./search.html";
      window.location.href = target;
    });
  });
}

function initHero() {
  const hero = qs("[data-hero]");
  if (!hero) return;

  const slides = qsa(".hero-slide", hero);
  const dots = qsa(".hero-dot", hero);
  if (slides.length === 0) return;

  let active = 0;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === active);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => show(index));
  });

  show(0);
  window.setInterval(() => show(active + 1), 5000);
}

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function initFilters() {
  const panel = qs("[data-filter-panel]");
  if (!panel) return;

  const input = qs("[data-filter-keyword]", panel);
  const region = qs("[data-filter-region]", panel);
  const type = qs("[data-filter-type]", panel);
  const sort = qs("[data-filter-sort]", panel);
  const cards = qsa("[data-movie-card]");
  const empty = qs("[data-empty-result]");
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";

  if (input && query) {
    input.value = query;
  }

  const apply = () => {
    const keyword = normalize(input ? input.value : "");
    const regionValue = normalize(region ? region.value : "");
    const typeValue = normalize(type ? type.value : "");
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.text);
      const cardRegion = normalize(card.dataset.region);
      const cardType = normalize(card.dataset.type);
      const matchedKeyword = !keyword || text.includes(keyword);
      const matchedRegion = !regionValue || cardRegion === regionValue;
      const matchedType = !typeValue || cardType.includes(typeValue);
      const matched = matchedKeyword && matchedRegion && matchedType;
      card.style.display = matched ? "" : "none";
      if (matched) visible += 1;
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  };

  const sortCards = () => {
    if (!sort) return;
    const grid = qs("[data-movie-grid]");
    if (!grid) return;
    const sorted = [...cards];
    const mode = sort.value;

    sorted.sort((a, b) => {
      if (mode === "year") return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      if (mode === "rating") return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
    });

    sorted.forEach((card) => grid.appendChild(card));
    apply();
  };

  [input, region, type].forEach((control) => {
    if (control) control.addEventListener("input", apply);
    if (control) control.addEventListener("change", apply);
  });

  if (sort) sort.addEventListener("change", sortCards);
  sortCards();
  apply();
}

function initPlayers() {
  qsa("[data-player]").forEach((root) => {
    const video = qs("video", root);
    const start = qs("[data-player-start]", root);
    if (!video) return;

    const url = video.dataset.videoUrl;
    let ready = false;
    let hls = null;

    const begin = () => {
      if (start) start.classList.add("hidden");

      if (!ready && url) {
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal || !hls) return;
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", () => {
            video.play().catch(() => {});
          }, { once: true });
          video.load();
        }
        ready = true;
      } else {
        video.play().catch(() => {});
      }
    };

    if (start) start.addEventListener("click", begin);
    root.addEventListener("click", (event) => {
      if (event.target === video && video.paused) begin();
    });

    window.addEventListener("pagehide", () => {
      if (hls) hls.destroy();
    });
  });
}

initMenu();
initSearchForms();
initHero();
initFilters();
initPlayers();
