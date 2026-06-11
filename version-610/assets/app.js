(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startCarousel() {
        if (timer) {
            window.clearInterval(timer);
        }

        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(current - 1);
            startCarousel();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startCarousel();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-target')) || 0);
            startCarousel();
        });
    });

    startCarousel();

    var grid = document.querySelector('.searchable-grid');
    var searchInput = document.querySelector('.page-search');
    var regionSelect = document.querySelector('.filter-region');
    var typeSelect = document.querySelector('.filter-type');
    var yearSelect = document.querySelector('.filter-year');
    var sortSelect = document.querySelector('.sort-select');
    var emptyTip = document.querySelector('.empty-tip');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getCards() {
        if (!grid) {
            return [];
        }

        return Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
    }

    function applyFilters() {
        var cards = getCards();
        var keyword = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
            var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
            var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
            var isVisible = matchesKeyword && matchesRegion && matchesType && matchesYear;

            card.classList.toggle('is-filter-hidden', !isVisible);
            if (isVisible) {
                visible += 1;
            }
        });

        if (emptyTip) {
            emptyTip.classList.toggle('is-visible', visible === 0);
        }
    }

    function sortCards() {
        var cards = getCards();
        var mode = sortSelect ? sortSelect.value : 'heat';

        cards.sort(function (a, b) {
            if (mode === 'year') {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }

            if (mode === 'title') {
                return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
            }

            return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
        });

        cards.forEach(function (card) {
            grid.appendChild(card);
        });

        applyFilters();
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }

    sortCards();
})();
