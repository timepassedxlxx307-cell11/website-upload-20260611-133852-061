(function(){
var toggle=document.querySelector('.nav-toggle');
var mobile=document.querySelector('.mobile-nav');
if(toggle&&mobile){toggle.addEventListener('click',function(){mobile.classList.toggle('open')})}
var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
if(slides.length){var current=0;var show=function(n){current=(n+slides.length)%slides.length;slides.forEach(function(s,i){s.classList.toggle('active',i===current)});dots.forEach(function(d,i){d.classList.toggle('active',i===current)})};dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});setInterval(function(){show(current+1)},5600)}
var input=document.querySelector('[data-filter-input]');
var type=document.querySelector('[data-filter-type]');
var year=document.querySelector('[data-filter-year]');
var grid=document.querySelector('[data-grid]');
if(grid){var cards=[].slice.call(grid.querySelectorAll('[data-card]'));var filter=function(){var q=input?input.value.trim().toLowerCase():'';var tv=type?type.value:'';var yv=year?year.value:'';var shown=0;cards.forEach(function(card){var hay=(card.getAttribute('data-title')+' '+card.getAttribute('data-tags')).toLowerCase();var ok=(!q||hay.indexOf(q)>-1)&&(!tv||card.getAttribute('data-type')===tv)&&(!yv||card.getAttribute('data-year')===yv);card.style.display=ok?'':'none';if(ok)shown++});grid.classList.toggle('is-empty',shown===0)};[input,type,year].forEach(function(el){if(el){el.addEventListener('input',filter);el.addEventListener('change',filter)}})}
var players=[].slice.call(document.querySelectorAll('[data-player]'));
players.forEach(function(box){var video=box.querySelector('video');var button=box.querySelector('.player-btn');var poster=box.querySelector('.player-poster');var ready=false;var start=function(){if(!video)return;box.classList.add('is-playing');if(!ready){var src=video.getAttribute('data-stream')||'';if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls();hls.loadSource(src);hls.attachMedia(video)}else{video.src=src}ready=true}var p=video.play();if(p&&p.catch){p.catch(function(){})}};if(button)button.addEventListener('click',start);if(poster)poster.addEventListener('click',start);if(video)video.addEventListener('click',function(){if(video.paused)start()})})
})();