function setupMoviePlayer(streamUrl) {
    var video = document.getElementById('videoPlayer');
    var overlay = document.getElementById('playOverlay');
    var hls = null;
    var ready = false;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function loadStream() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        loadStream();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var action = video.play();

        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
