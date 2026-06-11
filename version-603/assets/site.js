(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filtered-grid"));
        if (!grids.length) {
            return;
        }
        var search = document.querySelector(".js-search");
        var region = document.querySelector(".js-region-filter");
        var type = document.querySelector(".js-type-filter");
        var year = document.querySelector(".js-year-filter");
        var category = document.querySelector(".js-category-filter");
        var empty = document.querySelector(".empty-state");
        var cards = [];
        grids.forEach(function (grid) {
            cards = cards.concat(Array.prototype.slice.call(grid.querySelectorAll(".movie-card")));
        });

        function matches(card) {
            var query = normalize(search && search.value);
            var selectedRegion = normalize(region && region.value);
            var selectedType = normalize(type && type.value);
            var selectedYear = normalize(year && year.value);
            var selectedCategory = normalize(category && category.value);
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (selectedRegion && selectedRegion !== "all" && normalize(card.getAttribute("data-region")) !== selectedRegion) {
                return false;
            }
            if (selectedType && selectedType !== "all" && normalize(card.getAttribute("data-type")) !== selectedType) {
                return false;
            }
            if (selectedYear && selectedYear !== "all" && normalize(card.getAttribute("data-year")) !== selectedYear) {
                return false;
            }
            if (selectedCategory && selectedCategory !== "all" && normalize(card.getAttribute("data-category")) !== selectedCategory) {
                return false;
            }
            return true;
        }

        function applyFilters() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [search, region, type, year, category].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
