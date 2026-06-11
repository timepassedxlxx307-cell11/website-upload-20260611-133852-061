(function () {

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.style.display = panel.style.display === "block" ? "none" : "block";
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        if (slides.length) {
            showSlide(0);
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var filterInput = document.querySelector("[data-card-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector(".empty-state");

        function filterCards(value) {
            var needle = String(value || "").trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var match = !needle || haystack.indexOf(needle) !== -1;
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? "none" : "block";
            }
        }

        if (filterInput) {
            filterInput.addEventListener("input", function () {
                filterCards(filterInput.value);
            });
        }

        var searchRoot = document.querySelector("[data-search-root]");
        if (searchRoot && Array.isArray(window.SEARCH_MOVIES)) {
            var searchForm = document.querySelector("[data-search-form]");
            var searchInput = document.querySelector("[data-search-input]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (searchInput) {
                searchInput.value = initialQuery;
            }

            function renderSearch(query) {
                var value = String(query || "").trim().toLowerCase();
                var results = window.SEARCH_MOVIES.filter(function (movie) {
                    return !value || movie.search.indexOf(value) !== -1;
                }).slice(0, 120);

                searchRoot.innerHTML = results.map(function (movie) {
                    return [
                        '<article class="movie-card">',
                        '    <a class="poster" href="./' + movie.file + '">',
                        '        <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                        '        <span class="poster-tag">' + escapeHtml(movie.region) + '</span>',
                        '    </a>',
                        '    <div class="movie-card-body">',
                        '        <a class="movie-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
                        '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                        '        <div class="movie-meta">',
                        '            <span>' + escapeHtml(movie.year) + '</span>',
                        '            <span>' + escapeHtml(movie.type) + '</span>',
                        '            <span>' + escapeHtml(movie.genre) + '</span>',
                        '        </div>',
                        '    </div>',
                        '</article>'
                    ].join("");
                }).join("");

                if (emptyState) {
                    emptyState.style.display = results.length ? "none" : "block";
                }
            }

            renderSearch(initialQuery);

            if (searchForm && searchInput) {
                searchForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    var nextQuery = searchInput.value || "";
                    var url = nextQuery ? "./search.html?q=" + encodeURIComponent(nextQuery) : "./search.html";
                    history.replaceState(null, "", url);
                    renderSearch(nextQuery);
                });
            }
        }
    });
})();
