function selectAll(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
}

function setupMobileMenu() {
    const button = document.querySelector('[data-mobile-menu-button]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
        return;
    }

    button.addEventListener('click', () => {
        menu.classList.toggle('is-open');
    });
}

function setupPosterFallbacks() {
    document.addEventListener('error', (event) => {
        const image = event.target;

        if (!(image instanceof HTMLImageElement)) {
            return;
        }

        if (!image.matches('[data-poster-image]')) {
            return;
        }

        image.classList.add('is-missing');
        image.alt = image.alt || '封面图片';
    }, true);
}

function setupHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = selectAll('[data-hero-slide]', carousel);
    const dots = selectAll('[data-hero-dot]', carousel);
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(() => showSlide(activeIndex + 1), 5600);
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            showSlide(activeIndex - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            showSlide(activeIndex + 1);
            startTimer();
        });
    }

    showSlide(0);
    startTimer();
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function getFilters(scopeName) {
    const keywordInput = document.querySelector(`[data-filter-input][data-filter-scope="${scopeName}"]`);
    const selects = selectAll(`[data-filter-select][data-filter-scope="${scopeName}"]`);
    const filters = {
        keyword: normalizeText(keywordInput ? keywordInput.value : ''),
        year: '',
        type: '',
        region: ''
    };

    selects.forEach((select) => {
        const key = select.dataset.filterSelect;
        filters[key] = normalizeText(select.value);
    });

    return filters;
}

function cardMatches(card, filters) {
    const title = normalizeText(card.dataset.title);
    const year = normalizeText(card.dataset.year);
    const type = normalizeText(card.dataset.type);
    const region = normalizeText(card.dataset.region);

    if (filters.keyword && !title.includes(filters.keyword)) {
        return false;
    }

    if (filters.year && year !== filters.year) {
        return false;
    }

    if (filters.type && type !== filters.type) {
        return false;
    }

    if (filters.region && region !== filters.region) {
        return false;
    }

    return true;
}

function applyFilter(scopeName) {
    const area = document.querySelector(`[data-filter-area="${scopeName}"]`);
    const counter = document.querySelector(`[data-filter-count="${scopeName}"]`);

    if (!area) {
        return;
    }

    const filters = getFilters(scopeName);
    const cards = selectAll('[data-movie-card]', area);
    let visible = 0;

    cards.forEach((card) => {
        const matches = cardMatches(card, filters);
        card.classList.toggle('is-hidden', !matches);
        if (matches) {
            visible += 1;
        }
    });

    if (counter) {
        counter.textContent = `显示 ${visible} 部`;
    }
}

function setupFilters() {
    const inputs = selectAll('[data-filter-input]');
    const selects = selectAll('[data-filter-select]');
    const controls = inputs.concat(selects);

    controls.forEach((control) => {
        const scopeName = control.dataset.filterScope;

        if (!scopeName) {
            return;
        }

        const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
        control.addEventListener(eventName, () => applyFilter(scopeName));
    });

    const url = new URL(window.location.href);
    const year = url.searchParams.get('year');

    if (year) {
        selectAll('[data-filter-select="year"]').forEach((select) => {
            select.value = year;
            if (select.dataset.filterScope) {
                applyFilter(select.dataset.filterScope);
            }
        });
    }
}

function setupMoviePlayers() {
    const players = selectAll('[data-movie-player]');

    if (!players.length) {
        return;
    }

    players.forEach((player) => {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.play-overlay');
        const status = player.querySelector('[data-player-status]');
        const source = player.dataset.src;
        let hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function setStatus(message, state) {
            if (!status) {
                return;
            }

            status.textContent = message;
            status.classList.toggle('is-ready', state === 'ready');
            status.classList.toggle('is-error', state === 'error');
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function showOverlay() {
            if (overlay && video.paused) {
                overlay.classList.remove('is-hidden');
            }
        }

        function attachSource() {
            if (player.dataset.sourceAttached === 'true') {
                return;
            }

            player.dataset.sourceAttached = 'true';

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源已就绪', 'ready');
                });
                hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        setStatus('视频加载失败，请稍后重试', 'error');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', () => setStatus('播放源已就绪', 'ready'), { once: true });
                video.addEventListener('error', () => setStatus('视频加载失败，请稍后重试', 'error'));
            } else {
                setStatus('当前浏览器不支持 HLS 播放', 'error');
            }
        }

        function playVideo() {
            attachSource();
            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    setStatus('请再次点击播放器开始播放', 'error');
                });
            }
        }

        attachSource();

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }

        video.addEventListener('click', () => {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', showOverlay);
        video.addEventListener('ended', showOverlay);

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupPosterFallbacks();
    setupHeroCarousel();
    setupFilters();
    setupMoviePlayers();
});
