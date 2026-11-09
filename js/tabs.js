// Reiter-Navigation, gesteuert über den URL-Hash (#ziele, #training)
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function show(name){
    if (!document.getElementById('panel-' + name)) name = tabs[0].dataset.tab;
    tabs.forEach(function(t){
      var on = t.dataset.tab === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + t.dataset.tab).hidden = !on;
    });
  }

  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ location.hash = t.dataset.tab; });
    t.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var next = tabs[(i + d + tabs.length) % tabs.length];
      location.hash = next.dataset.tab;
      next.focus();
    });
  });

  window.addEventListener('hashchange', function(){ show(location.hash.slice(1)); });
  show(location.hash.slice(1));
})();
