(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var results = scope.querySelector("[data-search-results]") || document.querySelector("[data-search-results]");
      if (!results) {
        return;
      }
      var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
      var input = panel.querySelector("[data-search-input]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-key]"));
      var empty = panel.querySelector(".empty-state");
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var ok = true;
          if (keyword && (card.getAttribute("data-search") || "").indexOf(keyword) === -1) {
            ok = false;
          }
          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter-key");
            var val = select.value;
            if (val && (card.getAttribute("data-" + key) || "") !== val) {
              ok = false;
            }
          });
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  function initPlayers(HlsClass) {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var loaded = false;
      if (!video || !stream) {
        return;
      }
      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (HlsClass && HlsClass.isSupported()) {
          hlsInstance = new HlsClass({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });

  window.MovieSite = {
    initPlayers: initPlayers
  };
})();
