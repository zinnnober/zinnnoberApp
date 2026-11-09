// Gemeinsame Hilfsfunktionen und Zwischenspeicher für alle Reiter
(function(){
  var queue = [], ready = false;
  window.App = {
    _cache: {},
    uid: function(){ return Math.random().toString(36).slice(2, 10); },
    // Erzeugt ein Element; Text wird per textContent gesetzt (sicher gegen HTML-Einschleusung)
    el: function(tag, attrs, text){
      var n = document.createElement(tag);
      if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      return n;
    },
    // Reiter starten erst, wenn Anmeldung und Datenladen fertig sind
    onReady: function(fn){ if (ready) fn(); else queue.push(fn); },
    setReady: function(){ ready = true; queue.splice(0).forEach(function(f){ f(); }); },
    load: function(key, fallback){
      return App._cache[key] != null ? App._cache[key] : fallback();
    },
    save: function(key, data){
      App._cache[key] = data;
      if (App.remote) App.remote.save(key, data);
    }
  };
})();
