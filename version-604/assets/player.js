import { H as Hls } from "./hls-vendor.js";

function setStatus(video, message) {
  var status = document.querySelector('[data-player-status="' + video.id + '"]');
  if (status) {
    status.textContent = message;
  }
}

function setupPlayer(video) {
  var source = video.dataset.hls;
  if (!source) {
    setStatus(video, "暂无播放线路");
    return;
  }

  if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(video, "高清线路已就绪");
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(video, "网络波动，正在重新连接");
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(video, "播放恢复中");
        hls.recoverMediaError();
      } else {
        setStatus(video, "当前线路暂不可用");
        hls.destroy();
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.addEventListener("loadedmetadata", function () {
      setStatus(video, "高清线路已就绪");
    });
  } else {
    setStatus(video, "浏览器不支持当前播放格式");
  }

  var shell = video.closest(".player-shell");
  var startButton = document.querySelector('[data-play-target="' + video.id + '"]');

  function playOrPause() {
    if (video.paused) {
      video.play().catch(function () {
        setStatus(video, "请再次点击播放");
      });
    } else {
      video.pause();
    }
  }

  if (startButton) {
    startButton.addEventListener("click", playOrPause);
  }

  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-playing");
    }
  });

  video.addEventListener("pause", function () {
    if (shell) {
      shell.classList.remove("is-playing");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("video[data-hls]").forEach(setupPlayer);
});
