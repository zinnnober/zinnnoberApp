// Datenschicht: spricht mit Supabase. Nur diese Datei kennt den Anbieter.
(function(){
  var statusEl = document.getElementById('status');
  function setStatus(text, isError){
    statusEl.textContent = text;
    statusEl.style.color = isError ? 'var(--c3)' : '';
  }
  if (!window.supabase){
    document.getElementById('loading').textContent = 'Verbindung zu Supabase nicht möglich. Bitte Seite neu laden.';
    return;
  }
  var cfg = window.APP_CONFIG;
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);
  var timers = {};

  App.remote = {
    client: sb,
    // Holt alle Bereiche des angemeldeten Nutzers
    fetchAll: function(){
      return sb.from('app_data').select('key,data').then(function(r){
        if (r.error) throw r.error;
        var out = {};
        r.data.forEach(function(row){ out[row.key] = row.data; });
        return out;
      });
    },
    // Speichert einen Bereich (kurz verzögert, damit nicht jeder Klick eine Anfrage auslöst)
    save: function(key, data){
      clearTimeout(timers[key]);
      setStatus('Speichert …');
      timers[key] = setTimeout(function(){
        sb.from('app_data').upsert(
          {user_id: App.user.id, key: key, data: data, updated_at: new Date().toISOString()},
          {onConflict: 'user_id,key'}
        ).then(function(r){
          if (r.error) setStatus('Nicht gespeichert', true);
          else setStatus('Gespeichert');
        });
      }, 400);
    }
  };
})();
