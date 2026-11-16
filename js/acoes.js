// Respostas a toques e a campos alterados. Toda mudança de dados acontece aqui.

// guarda uma cópia dos dados antes de apagar; o aviso com "Desfazer" some sozinho
let undoTimer = null;
function guardarDesfazer(txt) {
  state.undo = { snap: foto(), txt };
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    state.undo = null;
    const el = document.querySelector && document.querySelector('.toast');
    if (el) el.remove();
  }, 9000);
}
function apagarEx(id) {
  delete exercicios[id];
  for (const r in rotina_exercicios) rotina_exercicios[r] = rotina_exercicios[r].filter(x => x !== id);
}
function apagarRot(id) {
  delete rotinas[id]; delete rotina_exercicios[id];
  for (const c in agenda) for (const dia in agenda[c]) if (agenda[c][dia] === id) agenda[c][dia] = null;
}

app.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b) return;
  const d = b.dataset;
  const ag = agenda[state.cat] || {};
  const rid = rotinas[ag[state.dia]] ? ag[state.dia] : null;
  const marcar = id => {
    const f = feitosDe(rid, true), i = f.indexOf(id);
    if (i >= 0) { f.splice(i, 1); salvar(); return false; }
    f.push(id); salvar(); return true;
  };
  const lista = rotina_exercicios[state.editR];
  if (d.timer || d.timerreset || d.metro || d.bpm) {
    if (d.timer) {
      if (T.fim) { T.restante = restanteAgora(); T.fim = null; }
      else { if (T.restante <= 0) T.restante = T.total; T.fim = Date.now() + T.restante * 1000; audio(); }
    }
    else if (d.timerreset) { T.fim = null; T.restante = T.total; }
    else if (d.metro) { if (metro.on) pararMetro(); else iniciarMetro(); }
    else if (d.bpm) {
      metro.bpm = Math.min(240, Math.max(30, metro.bpm + (+d.bpm)));
      if (exercicios[state.ex]) { exercicios[state.ex].bpmUlt = metro.bpm; salvarDados(); }
    }
    atualizarTools();
    return;
  }
  if (d.setok !== undefined || d.addset || d.restskip) {
    const e = exercicios[state.ex];
    if (d.setok !== undefined) {
      const i = +d.setok, t = setEm(i);
      if (t.ok) t.ok = false;
      else {
        const ant = ultimaVez(state.ex), p = (ant && (ant.sets[i] || ant.sets[ant.sets.length - 1])) || {};
        if (t.c === '') t.c = p.c ?? '';
        if (t.r === '') t.r = p.r || repsDe(e) || '';
        t.ok = true;
        const a = setsDe(state.ex), n = Math.max(seriesDe(e), a.length);
        if (a.filter(x => x.ok).length < n) { R.fim = Date.now() + (+e.descanso || 60) * 1000; audio(); } else R.fim = null;
      }
    }
    else if (d.addset) setEm(Math.max(seriesDe(e), setsDe(state.ex).length));
    else R.fim = null;
    salvarLog(); atualizarSets();
    return;
  }
  if (!d.del && !d.delitem) state.confirma = null;

  if (d.back) ir(alvoVoltar());
  else if (d.config) { ir('config'); verProvedores(); }
  else if (d.hist) { const n = new Date(); state.mes = { y: n.getFullYear(), m: n.getMonth() }; state.histDia = chaveData(n); ir('historico'); }
  else if (d.mesnav) { const n = new Date(state.mes.y, state.mes.m + (+d.mesnav), 1); state.mes = { y: n.getFullYear(), m: n.getMonth() }; state.histDia = null; }
  else if (d.hd) state.histDia = d.hd;
  else if (d.toggle) { config[d.toggle] = !config[d.toggle]; salvarConfig(); }
  else if (d.modoedit) state.editando = !state.editando;
  else if (d.cat) {
    state.cat = d.cat; state.dia = hoje;
    if (state.editando) { state.voltaGerir = 'inicio'; ir('gerir'); }
    else ir(config.diaAtual ? 'rotina' : 'semana');
  }
  else if (d.semana) ir('semana');
  else if (d.dia !== undefined) { state.dia = +d.dia; ir('rotina'); }
  else if (d.ex) { state.ex = d.ex; ir('exercicio'); }
  else if (d.check) marcar(d.check);
  else if (d.player) state.player = !state.player;
  else if (d.feito) {
    if (marcar(state.ex)) {
      const ids = idsDe(rid), f = feitosDe(rid), ix = ids.indexOf(state.ex);
      const prox = ids.slice(ix + 1).find(id => !f.includes(id)) || ids.find(id => !f.includes(id));
      if (prox) { state.ex = prox; ir('exercicio'); } else ir('rotina');
    }
  }
  else if (d.reset) { feitosDe(rid, true).length = 0; salvar(); }

  // ----- edição
  else if (d.gerir) { state.voltaGerir = state.tela; ir('gerir'); }
  else if (d.novacat) {
    const id = novoId();
    categorias.push({ id, nome:'Nova categoria' }); agenda[id] = {};
    state.cat = id; state.voltaGerir = 'inicio'; salvarDados(); ir('gerir');
  }
  else if (d.editr) { state.editR = d.editr; state.voltaRot = state.tela; ir('editRotina'); }
  else if (d.novar) {
    const id = novoId();
    rotinas[id] = { categoria: state.cat, nome:'Nova rotina' }; rotina_exercicios[id] = [];
    state.editR = id; state.voltaRot = 'gerir'; salvarDados(); ir('editRotina');
  }
  else if (d.edite) { state.editE = d.edite; state.voltaEx = state.tela; ir('editEx'); }
  else if (d.novoe) {
    const id = novoId();
    exercicios[id] = { nome:'Novo exercício', min:5, passos:[], cat: state.cat };
    if (state.tela === 'editRotina') lista.push(id);
    state.editE = id; state.voltaEx = state.tela; salvarDados(); ir('editEx');
  }
  else if (d.colarabrir) state.colando = !state.colando;
  else if (d.colar) {
    const campo = document.getElementById('colaTxt'), cat = rotinas[state.editR].categoria;
    String((campo && campo.value) || '').split('\n').forEach(linha => {
      const partes = linha.split(/\s+[-–—]\s+|;\s*|\t+/).map(x => x.trim()).filter(Boolean);
      if (!partes.length) return;
      const nome = partes[0], det = partes.slice(1).join(' · ');
      let id = exDaCat(cat).find(x => exercicios[x].nome.toLowerCase() === nome.toLowerCase());
      if (!id) { id = novoId(); exercicios[id] = { nome, min: 5, bpm: det, passos: [], cat }; }
      lista.push(id);
    });
    state.colando = false; salvarDados();
  }
  else if (d.sobe) { const i = +d.sobe; [lista[i - 1], lista[i]] = [lista[i], lista[i - 1]]; salvarDados(); }
  else if (d.desce) { const i = +d.desce; [lista[i + 1], lista[i]] = [lista[i], lista[i + 1]]; salvarDados(); }
  else if (d.tira) { lista.splice(+d.tira, 1); salvarDados(); }
  else if (d.addex) { const sel = document.getElementById('addSel'); if (sel && exercicios[sel.value]) { lista.push(sel.value); salvarDados(); } }
  else if (d.delfoto) { delete exercicios[state.editE].imagem; salvarDados(); }
  else if (d.undo) {
    if (state.undo) { aplicarDados(JSON.parse(state.undo.snap)); salvarDados(); state.undo = null; clearTimeout(undoTimer); }
    if (!categorias.some(c => c.id === state.cat) || (state.tela === 'editRotina' && !rotinas[state.editR]) || (state.tela === 'editEx' && !exercicios[state.editE])) ir('inicio');
  }
  else if (d.fechatoast) { state.undo = null; clearTimeout(undoTimer); }
  else if (d.duplicar === 'ex') {
    const id = novoId(), o = exercicios[state.editE];
    exercicios[id] = JSON.parse(JSON.stringify(o)); exercicios[id].nome = o.nome + ' (cópia)';
    if (state.voltaEx === 'editRotina' && rotina_exercicios[state.editR]) rotina_exercicios[state.editR].push(id);
    state.editE = id; salvarDados(); ir('editEx');
  }
  else if (d.duplicar === 'rot') {
    const id = novoId(), o = rotinas[state.editR];
    rotinas[id] = { categoria: o.categoria, nome: o.nome + ' (cópia)' };
    rotina_exercicios[id] = idsDe(state.editR).slice();
    state.editR = id; salvarDados(); ir('editRotina');
  }
  else if (d.entrar) {
    const campo = document.getElementById('nuvemEmail'), email = String((campo && campo.value) || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) state.aviso = 'Digite um e-mail válido.';
    else {
      state.aviso = 'Enviando…';
      api('/auth/v1/otp?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { method: 'POST', body: JSON.stringify({ email, create_user: true }) })
        .then(r => { state.aviso = r.ok ? 'Link enviado para ' + email + '. Abra o e-mail neste aparelho e toque no link.' : r.status === 429 ? 'Muitos pedidos seguidos. Espere um minuto e tente de novo.' : 'Não consegui enviar o link (erro ' + r.status + ').'; })
        .catch(() => { state.aviso = 'Sem conexão. Tente de novo com internet.'; })
        .then(() => { if (state.tela === 'config') render(); });
    }
  }
  else if (d.sync) { nuvem.status = 'Sincronizando…'; sincronizar(); }
  else if (d.resolver) {
    meta.alterado = d.resolver === 'local' ? Date.now() : 0;
    meta.vinculado = true; gravar('pg-sync', meta);
    nuvem.conflito = false; nuvem.status = 'Sincronizando…'; sincronizar();
  }
  else if (d.sair) {
    const tk = sessao && sessao.at;
    if (tk) api('/auth/v1/logout', { method: 'POST' }, tk).catch(() => {});
    encerrarSessao('Você saiu. Os dados continuam neste aparelho.');
  }
  else if (d.exportar) {
    try {
      const blob = new Blob([JSON.stringify({ app:'pratica-guiada', versao:1, dados: JSON.parse(foto()), feitos: state.feitos, log: state.log, config }, null, 1)], { type:'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'pratica-guiada-' + chaveDe(hoje) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      state.aviso = 'Arquivo gerado. Procure na pasta de downloads.';
    } catch (e) { state.aviso = 'Não consegui gerar o arquivo neste navegador.'; }
  }
  else if (d.delitem) {
    if (state.confirma !== d.delitem) state.confirma = d.delitem;
    else {
      const [tipo, id] = d.delitem.split(':');
      guardarDesfazer(`"${(tipo === 'ex' ? exercicios : rotinas)[id].nome}" apagado`);
      if (tipo === 'ex') apagarEx(id); else apagarRot(id);
      state.confirma = null; salvarDados();
    }
  }
  else if (d.del) {
    if (state.confirma !== d.del) state.confirma = d.del;
    else {
      guardarDesfazer(`"${d.del === 'ex' ? exercicios[state.editE].nome : d.del === 'rot' ? rotinas[state.editR].nome : categorias.find(c => c.id === state.cat).nome}" apagado`);
      if (d.del === 'ex') { apagarEx(state.editE); ir(state.voltaEx === 'exercicio' ? 'rotina' : state.voltaEx); }
      else if (d.del === 'rot') { apagarRot(state.editR); ir(state.voltaRot); }
      else if (d.del === 'cat') {
        const id = state.cat;
        rotDaCat(id).forEach(apagarRot);
        exDaCat(id).forEach(apagarEx);
        delete agenda[id];
        categorias.splice(categorias.findIndex(c => c.id === id), 1);
        ir('inicio');
      }
      salvarDados();
    }
  }
  else return;
  render();
});

// campos de edição gravam sozinhos ao sair do campo
app.addEventListener('change', ev => {
  const t = ev.target, d = t.dataset || {}, v = String(t.value ?? '').trim();
  const e = exercicios[state.editE];
  if (t.id === 'impArq') {
    const file = t.files && t.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onerror = () => { state.aviso = 'Não consegui ler o arquivo.'; render(); };
    r.onload = () => {
      try {
        const o = JSON.parse(r.result), d = o.dados || o;
        if (!dadosValidos(d)) throw 0;
        guardarDesfazer('Dados importados');
        aplicarDados(d);
        if (o.feitos && typeof o.feitos === 'object') { Object.assign(state.feitos, o.feitos); salvar(); }
        if (o.log && typeof o.log === 'object') { Object.assign(state.log, o.log); salvarLog(); }
        state.aviso = salvarDados() ? '' : 'Importado, mas sem espaço para guardar no aparelho.';
      } catch (e) { state.aviso = 'Este arquivo não é uma cópia do Prática Guiada.'; }
      render();
    };
    r.readAsText(file);
    return;
  }
  if (t.type === 'file') {
    const file = t.files && t.files[0];
    if (!file) return;
    lerFoto(file, url => {
      if (!url) state.aviso = 'Não consegui ler essa imagem.';
      else {
        const antes = e.imagem; e.imagem = url; state.aviso = '';
        if (!salvarDados()) { if (antes) e.imagem = antes; else delete e.imagem; state.aviso = 'Sem espaço no aparelho para guardar mais uma foto. Use um link no campo acima.'; }
      }
      render();
    });
    return;
  }
  if (d.set !== undefined) { setEm(+d.set)[d.k] = v; salvarLog(); return; }
  if (d.f === 'exNota') { if (exercicios[state.ex]) { exercicios[state.ex].nota = v; salvarDados(); } return; }
  if (d.agenda !== undefined) { (agenda[state.cat] || (agenda[state.cat] = {}))[d.agenda] = v || null; }
  else if (d.f === 'catNome') { if (v) categorias.find(c => c.id === state.cat).nome = v; }
  else if (d.f === 'rotNome') { if (v) rotinas[state.editR].nome = v; }
  else if (d.f === 'exNome') { if (v) e.nome = v; }
  else if (d.f === 'exMin') e.min = Math.max(0, Math.round(+v || 0));
  else if (d.f === 'exDet') e.bpm = v;
  else if (d.f === 'exSeries') { if (v === '') delete e.series; else e.series = Math.min(12, Math.max(0, Math.round(+v || 0))); }
  else if (d.f === 'exDesc') e.descanso = Math.max(5, Math.round(+v || 60));
  else if (d.f === 'exPassos') e.passos = v.split('\n').map(x => x.trim()).filter(Boolean);
  else if (d.f === 'exVideo') e.video = v;
  else return;
  salvarDados();
});
