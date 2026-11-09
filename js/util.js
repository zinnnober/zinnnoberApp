// Gemeinsame Hilfsfunktionen und Zwischenspeicher für alle Reiter
(function(){
  var queue = [], ready = false;
  function alignToGrid(element){
    var rect = element.getBoundingClientRect();
    var unit = parseFloat(getComputedStyle(document.body).backgroundSize);
    if (!unit || !rect.height) return;
    var currentExtra = parseFloat(element.style.getPropertyValue('--grid-extra-padding')) || 0;
    var bottom = rect.top + window.scrollY + rect.height - currentExtra;
    var remainder = ((bottom % unit) + unit) % unit;
    var extra = remainder < 0.5 || unit - remainder < 0.5 ? 0 : unit - remainder;
    if (Math.abs(extra - currentExtra) > 0.5){
      element.style.setProperty('--grid-extra-padding', extra + 'px');
    }
  }
  function alignButton(button){
    button.style.removeProperty('--grid-button-width');
    var unit = parseFloat(getComputedStyle(document.body).backgroundSize);
    var width = button.getBoundingClientRect().width;
    if (!unit || !width) return;
    var snappedWidth = Math.ceil((width - 0.01) / unit) * unit;
    button.style.setProperty('--grid-button-width', snappedWidth + 'px');
  }
  function alignButtons(container){
    Array.prototype.forEach.call(container.querySelectorAll('button'), alignButton);
    if (container.matches && container.matches('button')) alignButton(container);
    if (buttonObserver){
      Array.prototype.forEach.call(container.querySelectorAll('button'), function(button){ buttonObserver.observe(button); });
      if (container.matches && container.matches('button')) buttonObserver.observe(container);
    }
  }
  var layoutObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function(entries){
    entries.forEach(function(entry){ alignToGrid(entry.target); });
  }) : null;
  var buttonObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function(entries){
    entries.forEach(function(entry){ alignButton(entry.target); });
  }) : null;
  window.App = {
    _cache: {},
    uid: function(){ return Math.random().toString(36).slice(2, 10); },
    alignCard: function(card){
      alignToGrid(card);
      if (layoutObserver) layoutObserver.observe(card);
    },
    alignElement: function(element){
      alignToGrid(element);
      if (layoutObserver) layoutObserver.observe(element);
    },
    alignButtons: alignButtons,
    unobserveCards: function(container){
      if (!layoutObserver) return;
      Array.prototype.forEach.call(container.querySelectorAll('.goal,.day'), function(card){
        layoutObserver.unobserve(card);
      });
    },
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
  Array.prototype.forEach.call(document.querySelectorAll('#app .site,#app .panel>h2,#app .panel>.sub,#newGoal,#panel-training .toolbar'), function(element){
    App.alignElement(element);
  });
  App.alignButtons(document);
  window.addEventListener('resize', function(){ App.alignButtons(document); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ App.alignButtons(document); });
})();
