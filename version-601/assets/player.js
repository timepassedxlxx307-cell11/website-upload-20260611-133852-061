import { H as Hls } from "./hls-vendor.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var video = document.querySelector("video[data-video-url]");
  var overlay = document.querySelector(".player-overlay");
  if (!video) {
    return;
  }

  var source = video.dataset.videoUrl;
  if (!source) {
    return;
  }

  function bindSource() {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      window.addEventListener("beforeunload", function () {
        hls.destroy();
      });
    }
  }

  function startPlayback() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (!video.src && !video.currentSrc) {
      bindSource();
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  bindSource();

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
});
