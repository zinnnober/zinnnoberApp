App.onReady(function(){
  var KEY = 'ziele';
  var COLORS = ['var(--c0)','var(--c1)','var(--c2)','var(--c3)','var(--c4)'];
  var color = 0;

  var uid = App.uid, el = App.el;

  function load(){
    var saved = App.load(KEY, function(){ return null; });
    if (saved) return saved;
    return [{
      id: uid(), title: 'Beispiel: Marathon laufen', color: 1,
      todos: [
        {id: uid(), text: 'Laufschuhe kaufen', done: true},
        {id: uid(), text: 'Trainingsplan wählen', done: false},
        {id: uid(), text: 'Erste 10 km laufen', done: false}
      ]
    }];
  }
  var goals = load();

  function save(){
    App.save(KEY, goals);
  }


  var grid = document.getElementById('grid');

  function render(focusGoalId){
    App.unobserveCards(grid);
    grid.textContent = '';
    if (!goals.length){
      grid.appendChild(el('p', {'class':'empty'}, 'Noch keine Ziele. Gib oben dein erstes Ziel ein.'));
      return;
    }
    goals.forEach(function(g){
      var card = el('article', {'class':'goal'});
      card.style.setProperty('--accent', COLORS[g.color] || COLORS[0]);

      var head = el('div', {'class':'head'});
      var title = el('input', {type:'text', 'class':'title', value:g.title, 'aria-label':'Titel des Ziels', maxlength:'80'});
      title.addEventListener('change', function(){
        g.title = title.value.trim() || g.title; title.value = g.title; save();
      });
      var del = el('button', {'class':'ghost', type:'button', 'aria-label':'Ziel löschen'}, 'Löschen');
      del.addEventListener('click', function(){
        if (confirm('Ziel "' + g.title + '" mit allen To-Dos löschen?')){
          goals = goals.filter(function(x){ return x.id !== g.id; });
          save(); render();
        }
      });
      head.appendChild(title); head.appendChild(del);

      var doneCount = g.todos.filter(function(t){ return t.done; }).length;
      var total = g.todos.length;
      var bar = el('div', {'class':'bar'}); var fill = el('i');
      fill.style.width = total ? (doneCount / total * 100) + '%' : '0';
      bar.appendChild(fill);
      var meta = el('div', {'class':'meta'},
        total ? (doneCount === total ? 'Geschafft: alle ' + total + ' To-Dos erledigt' : doneCount + ' von ' + total + ' erledigt') : 'Noch keine To-Dos');

      var list = el('ul');
      g.todos.forEach(function(t){
        var li = el('li', t.done ? {'class':'done'} : null);
        var cb = el('input', {type:'checkbox', id:'t-' + t.id});
        cb.checked = t.done;
        cb.addEventListener('change', function(){ t.done = cb.checked; save(); render(); });
        var lab = el('label', {'for':'t-' + t.id}, t.text);
        var x = el('button', {'class':'ghost', type:'button', 'aria-label':'To-Do löschen'}, '×');
        x.addEventListener('click', function(){
          g.todos = g.todos.filter(function(y){ return y.id !== t.id; });
          save(); render(g.id);
        });
        li.appendChild(cb); li.appendChild(lab); li.appendChild(x);
        list.appendChild(li);
      });

      var form = el('form', {'class':'add', autocomplete:'off'});
      var inp = el('input', {type:'text', placeholder:'Neues To-Do', 'aria-label':'Neues To-Do', maxlength:'120'});
      inp.dataset.goal = g.id;
      var btn = el('button', {type:'submit'}, 'Hinzufügen');
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var v = inp.value.trim();
        if (!v) return;
        g.todos.push({id: uid(), text: v, done: false});
        save(); render(g.id);
      });
      form.appendChild(inp); form.appendChild(btn);

      card.appendChild(head); card.appendChild(bar); card.appendChild(meta);
      card.appendChild(list); card.appendChild(form);
      grid.appendChild(card);
      App.alignCard(card);
      App.alignButtons(card);
    });
    if (focusGoalId){
      var f = grid.querySelector('input[data-goal="' + focusGoalId + '"]');
      if (f) f.focus();
    }
  }

  // Farbwahl für neue Ziele
  var sw = document.getElementById('swatches');
  COLORS.forEach(function(c, i){
    var lab = el('label', {'class':'sw'});
    var r = el('input', {type:'radio', name:'color', value:String(i), 'aria-label':'Farbe ' + (i + 1)});
    if (i === 0) r.checked = true;
    r.addEventListener('change', function(){ color = i; });
    var s = el('span'); s.style.background = c;
    lab.appendChild(r); lab.appendChild(s); sw.appendChild(lab);
  });

  document.getElementById('newGoal').addEventListener('submit', function(e){
    e.preventDefault();
    var input = document.getElementById('goalName');
    var v = input.value.trim();
    if (!v) return;
    var g = {id: uid(), title: v, color: color, todos: []};
    goals.unshift(g);
    input.value = '';
    save(); render(g.id);
  });

  render();
});
