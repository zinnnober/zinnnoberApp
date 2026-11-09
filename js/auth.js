// Anmeldung und Start der App
(function(){
  if (!App.remote) return;
  var sb = App.remote.client;
  var loading = document.getElementById('loading');
  var gate = document.getElementById('login');
  var errBox = document.getElementById('loginError');
  var started = false;

  function showLogin(){ loading.hidden = true; gate.hidden = false; }

  function start(session){
    if (started) return;
    started = true;
    App.user = session.user;
    App.remote.fetchAll().then(function(all){
      App._cache = all;
      loading.hidden = true;
      gate.hidden = true;
      document.getElementById('app').hidden = false;
      App.setReady();
    }).catch(function(){
      started = false;
      loading.hidden = false;
      loading.textContent = 'Daten konnten nicht geladen werden. Bitte Seite neu laden.';
    });
  }

  sb.auth.getSession().then(function(r){
    if (r.data && r.data.session) start(r.data.session); else showLogin();
  });

  document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();
    errBox.textContent = '';
    sb.auth.signInWithPassword({
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    }).then(function(r){
      if (r.error){ errBox.textContent = 'Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.'; return; }
      start(r.data.session);
    });
  });

  document.getElementById('logout').addEventListener('click', function(){
    sb.auth.signOut().then(function(){ location.reload(); });
  });
})();
