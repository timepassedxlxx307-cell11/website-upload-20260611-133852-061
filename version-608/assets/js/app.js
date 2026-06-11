(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle("is-active", position === current);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === current);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(index);
          play();
        });
      });

      if (slides.length > 1) {
        play();
      }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
      var input = root.querySelector("[data-search-input]");
      var sort = root.querySelector("[data-sort-select]");
      var list = root.querySelector("[data-card-list]");
      var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-category-filter]"));
      var activeCategory = "all";

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.children);

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilters() {
        var keyword = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var category = card.getAttribute("data-category") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchCategory = activeCategory === "all" || category === activeCategory;
          card.classList.toggle("is-hidden", !(matchKeyword && matchCategory));
        });
      }

      function applySort() {
        if (!sort || sort.value === "default") {
          cards.forEach(function (card) {
            list.appendChild(card);
          });
          applyFilters();
          return;
        }

        var sorted = cards.slice().sort(function (a, b) {
          if (sort.value === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (sort.value === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          return normalize(a.getAttribute("data-search")).localeCompare(normalize(b.getAttribute("data-search")), "zh-Hans-CN");
        });

        sorted.forEach(function (card) {
          list.appendChild(card);
        });
        applyFilters();
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      if (sort) {
        sort.addEventListener("change", applySort);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-category-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilters();
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-movie-player]")).forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector("[data-player-cover]");
      var button = box.querySelector("[data-play-button]");
      var hls = null;
      var started = false;

      if (!video) {
        return;
      }

      function begin() {
        var stream = video.getAttribute("data-stream");

        if (!stream) {
          return;
        }

        if (cover) {
          cover.classList.add("is-hidden");
        }

        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", begin);
      }

      if (cover && cover !== button) {
        cover.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (!started) {
          begin();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
