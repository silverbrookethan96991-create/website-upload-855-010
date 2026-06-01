(function () {
  function bindSource(video, sourceUrl) {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }

    video.setAttribute("data-ready", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return;
    }

    video.src = sourceUrl;
  }

  function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);

    if (!video || !sourceUrl) {
      return;
    }

    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector("[data-player-start]") : null;

    function startPlayback() {
      bindSource(video, sourceUrl);

      if (shell) {
        shell.classList.add("is-playing");
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === button || (button && button.contains(event.target))) {
          return;
        }

        if (event.target === video && video.getAttribute("data-ready") === "1") {
          return;
        }

        startPlayback();
      });
    }

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
