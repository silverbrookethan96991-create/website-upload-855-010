(function () {
  function attachSource(video, source, onReady) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      onReady();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          onReady();
        });
      } else {
        onReady();
      }
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', source);
    }
    onReady();
  }

  window.initializeMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    var cover = document.querySelector('[data-player-for="' + videoId + '"]');

    if (!video || !source) {
      return;
    }

    function start() {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      attachSource(video, source, function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }

    video.addEventListener('click', start);

    if (cover) {
      cover.addEventListener('click', start);
    }
  };
})();
