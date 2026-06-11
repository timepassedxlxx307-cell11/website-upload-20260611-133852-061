function initMoviePlayer(source) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playerCover");
    var message = document.getElementById("playerMessage");
    var hls;

    if (!video || !source) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add("show");
        }
    }

    function attachSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showMessage("视频暂时无法加载");
                    }
                }
            });
            return;
        }

        video.src = source;
    }

    function playVideo() {
        if (cover) {
            cover.classList.add("hidden");
        }

        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {
                showMessage("请再次点击播放");
                if (cover) {
                    cover.classList.remove("hidden");
                }
            });
        }
    }

    attachSource();

    if (cover) {
        cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
