(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobileMenu.hasAttribute('hidden');
      if (isHidden) {
        mobileMenu.removeAttribute('hidden');
        menuButton.textContent = '×';
      } else {
        mobileMenu.setAttribute('hidden', '');
        menuButton.textContent = '☰';
      }
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
          start();
        }
      });
    });

    slider.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var list = scope.parentElement.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var queryInput = scope.querySelector('[data-filter-query]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var empty = scope.querySelector('[data-filter-empty]');

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var show = matchesQuery && matchesYear && matchesType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [queryInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  function htmlEscape(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + htmlEscape(movie.url) + '" class="card-link" aria-label="' + htmlEscape(movie.title) + '">',
      '    <span class="poster-wrap">',
      '      <img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
      '      <span class="play-badge">▶</span>',
      '      <span class="duration-badge">' + htmlEscape(movie.duration) + '</span>',
      '    </span>',
      '    <span class="card-body">',
      '      <span class="chip">' + htmlEscape(movie.category) + '</span>',
      '      <strong>' + htmlEscape(movie.title) + '</strong>',
      '      <span class="card-desc">' + htmlEscape(movie.description) + '</span>',
      '      <span class="card-meta"><span>' + htmlEscape(movie.year) + '</span><span>' + htmlEscape(movie.region) + '</span><span>★ ' + htmlEscape(movie.rating) + '</span></span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join('');
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  if (searchResults && typeof MOVIE_INDEX !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');

    if (searchInput) {
      searchInput.value = query;
    }

    if (query) {
      var lower = query.toLowerCase();
      var results = MOVIE_INDEX.filter(function (movie) {
        return movie.searchText.indexOf(lower) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = '搜索结果';
      }
      if (subtitle) {
        subtitle.textContent = results.length ? '以下内容与“' + query + '”相关。' : '没有找到相关影片，可以换一个关键词。';
      }
      searchResults.innerHTML = results.length ? results.map(renderSearchCard).join('') : '';
    }
  }

  function startPlayer(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-stream');
    if (!video || !source) {
      return;
    }

    player.classList.add('playing');
    video.controls = true;

    if (window.Hls && window.Hls.isSupported()) {
      if (!player.hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        player.hlsInstance = hls;
      }
    } else if (!video.getAttribute('src')) {
      video.setAttribute('src', source);
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(player);
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      startPlayer(player);
    });
  });
})();
