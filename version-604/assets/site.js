(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupImageFallback() {
    var images = document.querySelectorAll("img");
    images.forEach(function (img) {
      img.addEventListener("error", function () {
        var frame = img.closest(".poster-frame, .hero-poster, .category-card, .related-item, .ranking-row, .category-image");
        if (frame) {
          frame.classList.add("image-missing");
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFiltering() {
    var containers = document.querySelectorAll("[data-card-container]");
    if (!containers.length) {
      return;
    }

    containers.forEach(function (container) {
      var root = container.closest("section") || document;
      var searchInput = root.querySelector("[data-search-input]");
      var yearFilter = root.querySelector("[data-year-filter]");
      var typeFilter = root.querySelector("[data-type-filter]");
      var categoryFilter = root.querySelector("[data-category-filter]");
      var counter = root.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));

      function apply() {
        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var type = normalize(typeFilter && typeFilter.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.category,
            card.dataset.tags
          ].join(" "));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = !year || normalize(card.dataset.year) === year;
          var matchesType = !type || normalize(card.dataset.type) === type;
          var matchesCategory = !category || normalize(card.dataset.category) === category;
          var shouldShow = matchesQuery && matchesYear && matchesType && matchesCategory;
          card.classList.toggle("is-hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = visible + " 部";
        }
      }

      [searchInput, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && searchInput) {
        searchInput.value = q;
      }
      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupImageFallback();
    setupHeroCarousel();
    setupFiltering();
  });
})();
