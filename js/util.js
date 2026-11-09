// Gemeinsame Hilfsfunktionen für alle Reiter
(function(){
  window.App = {
    uid: function(){ return Math.random().toString(36).slice(2, 10); },
    // Erzeugt ein Element; Text wird per textContent gesetzt (sicher gegen HTML-Einschleusung)
    el: function(tag, attrs, text){
      var n = document.createElement(tag);
      if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (text != null) n.textContent = text;
      return n;
    },
    load: function(key, fallback){
      try {
        var raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return fallback();
    },
    save: function(key, data){
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }
  };
})();
