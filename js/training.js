// Reiter "Trainingsplan": Wochenplan mit Übungen pro Tag
App.onReady(function(){
  var el = App.el, uid = App.uid;
  var KEY = 'training';
  var DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var today = (new Date().getDay() + 6) % 7; // Montag = 0

  function ex(name, sets, reps, weight){
    return {id: uid(), name: name, sets: sets, reps: reps, weight: weight, done: false};
  }
  function defaults(){
    return DAYS.map(function(name, i){
      var d = {name: name, title: '', exercises: []};
      if (i === 0){ d.title = 'Oberkörper'; d.exercises = [ex('Bankdrücken', 4, 8, 60), ex('Klimmzüge', 3, 6, 0), ex('Schulterdrücken', 3, 10, 20)]; }
      if (i === 2){ d.title = 'Beine'; d.exercises = [ex('Kniebeugen', 4, 8, 80), ex('Rumänisches Kreuzheben', 3, 10, 60)]; }
      if (i === 4){ d.title = 'Ganzkörper'; d.exercises = [ex('Rudern', 3, 10, 50), ex('Plank', 3, 1, 0)]; }
      return d;
    });
  }
  function num(v){
    var n = parseFloat(String(v).replace(',', '.'));
    return isFinite(n) && n > 0 ? n : 0;
  }
  function detail(e){
    var parts = [];
    if (e.sets || e.reps) parts.push((e.sets || '–') + ' × ' + (e.reps || '–'));
    if (e.weight) parts.push(e.weight + ' kg');
    return parts.join(' · ');
  }

  var data = App.load(KEY, defaults);
  var week = document.getElementById('week');
  function save(){ App.save(KEY, data); }

  function render(focusDay){
    week.textContent = '';
    data.forEach(function(d, di){
      var card = el('article', {'class': 'day' + (di === today ? ' today' : '')});

      var head = el('div', {'class': 'dayhead'});
      head.appendChild(el('h3', null, d.name));
      if (di === today) head.appendChild(el('span', {'class': 'badge'}, 'Heute'));

      var title = el('input', {type: 'text', 'class': 'daytitle', value: d.title,
        placeholder: 'Fokus, z. B. Beine', 'aria-label': 'Fokus am ' + d.name, maxlength: '40'});
      title.addEventListener('change', function(){ d.title = title.value.trim(); save(); });

      var list = el('ul');
      d.exercises.forEach(function(e){
        var li = el('li', e.done ? {'class': 'done'} : null);
        var cb = el('input', {type: 'checkbox', id: 'e-' + e.id});
        cb.checked = e.done;
        cb.addEventListener('change', function(){ e.done = cb.checked; save(); render(); });
        var lab = el('label', {'for': 'e-' + e.id}, e.name);
        var det = detail(e);
        if (det) lab.appendChild(el('span', {'class': 'detail'}, det));
        var x = el('button', {'class': 'ghost', type: 'button', 'aria-label': 'Übung löschen'}, '×');
        x.addEventListener('click', function(){
          d.exercises = d.exercises.filter(function(y){ return y.id !== e.id; });
          save(); render(di);
        });
        li.appendChild(cb); li.appendChild(lab); li.appendChild(x);
        list.appendChild(li);
      });

      var form = el('form', {'class': 'exadd', autocomplete: 'off'});
      var fName = el('input', {type: 'text', 'class': 'name', placeholder: 'Neue Übung', 'aria-label': 'Neue Übung', maxlength: '60'});
      fName.dataset.day = di;
      var fSets = el('input', {type: 'number', min: '0', inputmode: 'numeric', placeholder: 'Sätze', 'aria-label': 'Sätze'});
      var fReps = el('input', {type: 'number', min: '0', inputmode: 'numeric', placeholder: 'Wdh.', 'aria-label': 'Wiederholungen'});
      var fKg = el('input', {type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder: 'kg', 'aria-label': 'Gewicht in kg'});
      var btn = el('button', {type: 'submit'}, '+');
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var name = fName.value.trim();
        if (!name) return;
        d.exercises.push({id: uid(), name: name, sets: num(fSets.value), reps: num(fReps.value), weight: num(fKg.value), done: false});
        save(); render(di);
      });
      [fName, fSets, fReps, fKg, btn].forEach(function(n){ form.appendChild(n); });

      card.appendChild(head); card.appendChild(title);
      if (d.exercises.length){
        var done = d.exercises.filter(function(e){ return e.done; }).length;
        card.appendChild(el('div', {'class': 'meta'}, done + ' von ' + d.exercises.length + ' erledigt'));
        card.appendChild(list);
      } else {
        card.appendChild(el('p', {'class': 'rest'}, 'Keine Übungen. Ruhetag oder unten eine hinzufügen.'));
      }
      card.appendChild(form);
      week.appendChild(card);
    });
    if (focusDay != null){
      var f = week.querySelector('input[data-day="' + focusDay + '"]');
      if (f) f.focus();
    }
  }

  document.getElementById('resetWeek').addEventListener('click', function(){
    if (!confirm('Alle Häkchen dieser Woche entfernen?')) return;
    data.forEach(function(d){ d.exercises.forEach(function(e){ e.done = false; }); });
    save(); render();
  });

  render();
});
