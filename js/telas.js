// render(): monta o HTML de cada tela a partir do estado.

/* ---------- TELAS (uma decisão por tela) ---------- */
// uso:     inicio -> rotina de hoje (ou semana) -> exercicio
// edição:  semana -> gerir (categoria) -> editRotina -> editEx
const app = document.getElementById('app');
const seta = '<svg class="chev right" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8l5 5 5-5"/></svg>';
const engrenagem = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>';
const ARTE = {
  musica: '<svg viewBox="0 0 120 120" aria-hidden="true"><g transform="rotate(35 60 60)"><rect x="53" y="8" width="14" height="14" rx="3" fill="var(--ink)"/><rect x="56" y="20" width="8" height="46" fill="var(--muted)"/><circle cx="60" cy="62" r="17" fill="var(--accent)"/><circle cx="60" cy="86" r="25" fill="var(--accent)"/><circle cx="60" cy="72" r="7" fill="var(--bg)"/><rect x="50" y="93" width="20" height="4" rx="2" fill="var(--accent-ink)"/><path d="M58 12V94M60 12V94M62 12V94" stroke="var(--ink)" stroke-width=".7" opacity=".8"/></g></svg>',
  musculacao: '<svg viewBox="0 0 120 120" aria-hidden="true"><g transform="rotate(-25 60 60)"><rect x="30" y="56" width="60" height="8" rx="4" fill="var(--muted)"/><rect x="28" y="36" width="13" height="48" rx="5" fill="var(--good)"/><rect x="79" y="36" width="13" height="48" rx="5" fill="var(--good)"/><rect x="15" y="44" width="10" height="32" rx="4" fill="var(--ink)"/><rect x="95" y="44" width="10" height="32" rx="4" fill="var(--ink)"/></g></svg>'
};
const calIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>';
const MESES_LONGOS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const lapis = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';
const lixo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg>';
const apagarItem = (chave, nome) => state.confirma === chave
  ? `<button class="mini sure" data-delitem="${chave}">Apagar?</button>`
  : `<button class="mini" data-delitem="${chave}" aria-label="Apagar ${esc(nome)}">${lixo}</button>`;
const NOMES = {1:'Segunda',2:'Terça',3:'Quarta',4:'Quinta',5:'Sexta',6:'Sábado',0:'Domingo'};
const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const faseDe = id => exercicios[id].fase || 'Prática';
const voltar = txt => `<button class="back" data-back="1">‹ ${esc(txt)}</button>`;
const excluir = (tipo, txt) => `<button class="danger${state.confirma === tipo ? ' sure' : ''}" data-del="${tipo}">${lixo}${state.confirma === tipo ? 'Toque de novo para apagar' : txt}</button>`;

function dataBloco() {
  const dt = dataDe(state.dia);
  return `<div class="date"><span class="num">${String(dt.getDate()).padStart(2, '0')}</span><span class="mo">${MESES[dt.getMonth()]}<small>${state.dia === hoje ? 'Hoje, ' + NOMES[state.dia].toLowerCase() : NOMES[state.dia]}</small></span></div>`;
}

function render() {
  const cat = categorias.find(c => c.id === state.cat) || categorias[0];
  const ag = agenda[state.cat] || {};
  const temAgenda = Object.values(ag).some(r => rotinas[r]);
  const rid = rotinas[ag[state.dia]] ? ag[state.dia] : null;
  const ids = rid ? idsDe(rid) : [];
  const feitos = rid ? feitosDe(rid).filter(id => ids.includes(id)) : [];
  const vazio = `<section class="empty"><h2>Nenhuma ficha ainda</h2><button class="btn primary" data-gerir="1">Montar ficha</button></section>`;
  let h = '';

  if (state.tela === 'inicio') {
    if (state.editando) h += `<div class="top"><h1 class="brand">Toque no que quer editar</h1><button class="daybtn" data-modoedit="1">Concluir</button></div><div class="tiles">`;
    else h += `<div class="top"><h1 class="brand">O que vamos praticar?</h1><span class="acts"><button class="icon" data-hist="1" aria-label="Histórico">${calIc}</button><button class="icon" data-modoedit="1" aria-label="Editar">${lapis}</button><button class="icon" data-config="1" aria-label="Configurações">${engrenagem}</button></span></div><div class="tiles">`;
    categorias.forEach(c => h += `<button class="tile ${esc(c.id)}" data-cat="${esc(c.id)}">${state.editando ? `<i class="badge">${lapis}</i>` : ''}${ARTE[c.id] || `<span class="letra">${esc(c.nome.charAt(0).toUpperCase())}</span>`}<span>${esc(c.nome)}</span></button>`);
    if (state.editando || !categorias.length) h += `<button class="tile nova" data-novacat="1" aria-label="Nova categoria"><span class="letra">+</span><span>Nova</span></button>`;
    h += `</div>`;
  }

  else if (state.tela === 'config') {
    h += voltar('Início') + `<h1 class="brand">Configurações</h1>`;
    h += `<button class="setting" role="switch" aria-checked="${config.diaAtual}" data-toggle="diaAtual"><span class="st"><b>Abrir no dia de hoje</b><small>Desligado, você escolhe o dia sempre que entrar.</small></span><span class="sw"></span></button>`;
    h += `<button class="setting" role="switch" aria-checked="${config.telaLigada}" data-toggle="telaLigada"><span class="st"><b>Manter a tela ligada</b><small>Durante o treino, o celular não apaga sozinho.</small></span><span class="sw"></span></button>`;
    h += `<button class="setting" role="switch" aria-checked="${config.textoGrande}" data-toggle="textoGrande"><span class="st"><b>Texto maior</b><small>Aumenta tudo, para ler com o celular mais longe.</small></span><span class="sw"></span></button>`;
    h += `<h2 class="sec">Conta e nuvem</h2>`;
    if (sessao) {
      h += `<p class="eyebrow">Conectado como <b>${esc(sessao.email)}</b>. ${esc(nuvem.status)}</p>`;
      if (nuvem.conflito) h += `<div class="empty"><h2>Quais dados manter?</h2><p>Esta conta já tem dados na nuvem, e este aparelho também tem os seus. Escolha um dos dois; o outro será substituído.</p><div class="rowsel"><button class="btn primary grow" data-resolver="local">Os deste aparelho</button><button class="btn ghost grow" data-resolver="nuvem">Os da nuvem</button></div></div>`;
      h += `<div class="rowsel">${nuvem.conflito ? '' : '<button class="btn ghost grow" data-sync="1">Sincronizar agora</button>'}<button class="btn ghost" data-sair="1">Sair</button></div>`;
    } else {
      h += `<p class="eyebrow">${esc(nuvem.status) || 'Entre com seu e-mail para guardar os dados na nuvem e usar em outros aparelhos. Não tem senha: você recebe um link.'}</p>`;
      h += `<div class="field"><label for="nuvemEmail">E-mail</label><input id="nuvemEmail" type="email" inputmode="email" autocomplete="email" placeholder="voce@exemplo.com"></div><button class="btn primary" data-entrar="1">Enviar link de acesso</button>`;
      if (nuvem.google) h += `<a class="btn ghost" href="${NUVEM.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(location.origin + location.pathname)}">Entrar com Google</a>`;
    }
    h += `<h2 class="sec">Cópia de segurança</h2><p class="eyebrow">Guarda em um arquivo tudo o que você cadastrou. Importar substitui os dados atuais.</p>`;
    h += `<div class="rowsel"><button class="btn ghost grow" data-exportar="1">Exportar</button><label class="btn ghost grow" for="impArq">Importar</label></div><input id="impArq" type="file" accept="application/json,.json" class="oculto">`;
    if (state.aviso) h += `<p class="aviso ok">${esc(state.aviso)}</p>`;
  }

  else if (state.tela === 'historico') {
    const { y, m } = state.mes, hojeK = chaveData(new Date());
    const dias = new Date(y, m + 1, 0).getDate(), desloc = (new Date(y, m, 1).getDay() + 6) % 7;
    const k = d => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    let noMes = 0;
    for (let d = 1; d <= dias; d++) if (diaTreinado(k(d))) noMes++;
    h += voltar('Início') + `<h1 class="brand">Histórico</h1>`;
    h += `<div class="stats"><div><b>${sequencia()}</b><span>treinos em sequência</span></div><div><b>${noMes}</b><span>dias em ${MESES_LONGOS[m]}</span></div></div>`;
    h += `<div class="top mes"><button class="icon" data-mesnav="-1" aria-label="Mês anterior">‹</button><b>${MESES_LONGOS[m]} ${y}</b><button class="icon" data-mesnav="1" aria-label="Próximo mês">›</button></div>`;
    h += `<div class="cal">${['S','T','Q','Q','S','S','D'].map(x => `<span class="cw">${x}</span>`).join('')}${'<span></span>'.repeat(desloc)}`;
    for (let d = 1; d <= dias; d++) {
      const t = diaTreinado(k(d));
      h += `<button class="cd${t === 2 ? ' full' : t === 1 ? ' part' : ''}${k(d) === hojeK ? ' hoje' : ''}${k(d) === state.histDia ? ' sel' : ''}" data-hd="${k(d)}" aria-label="Dia ${d}${t ? ', treinado' : ''}">${d}</button>`;
    }
    h += `</div>`;
    const f = state.histDia && state.feitos[state.histDia];
    if (state.histDia) {
      const linhas = Object.keys(f || {}).filter(r => f[r].length).map(r => `<div class="dayrow"><span class="dn">${esc(rotinas[r] ? rotinas[r].nome : 'Rotina apagada')}</span><span class="rn">${f[r].length}${rotinas[r] ? ' de ' + idsDe(r).length : ''} exerc.</span></div>`);
      h += `<p class="eyebrow">${+state.histDia.slice(8)} de ${MESES_LONGOS[+state.histDia.slice(5, 7) - 1]}</p>` + (linhas.length ? `<div class="choices">${linhas.join('')}</div>` : `<p class="eyebrow">Sem treino registrado.</p>`);
    }
  }

  else if (state.tela === 'semana') {
    h += `<div class="top">${voltar('Início')}<button class="daybtn" data-gerir="1">Editar</button></div><h1 class="brand">${esc(cat.nome)}</h1>`;
    if (!temAgenda) h += vazio;
    else {
      h += `<div class="choices">`;
      DIAS.forEach(([d]) => {
        const r = rotinas[ag[d]] ? ag[d] : null, t = d === hoje ? '<span class="tag">Hoje</span>' : '';
        if (r) h += `<button class="dayrow${d === hoje ? ' today' : ''}" data-dia="${d}"><span class="dn">${NOMES[d]}${t}</span><span class="rn">${esc(rotinas[r].nome)}</span>${seta}</button>`;
        else h += `<div class="dayrow off${d === hoje ? ' today' : ''}"><span class="dn">${NOMES[d]}${t}</span><span class="rn">Livre</span></div>`;
      });
      h += `</div>`;
    }
  }

  else if (state.tela === 'rotina') {
    h += `<div class="top">${voltar(config.diaAtual ? 'Início' : cat.nome)}<span class="acts">${rid ? `<button class="icon" data-editr="${rid}" aria-label="Editar esta rotina">${lapis}</button>` : ''}${temAgenda ? `<button class="daybtn" data-semana="1">Trocar dia</button>` : ''}</span></div>`;
    if (!temAgenda) h += `<h1 class="brand">${esc(cat.nome)}</h1>` + vazio;
    else if (!rid) h += `<section class="routine"><div class="hero">${dataBloco()}</div><h1 class="brand">Dia livre</h1></section>`;
    else {
      const falta = ids.reduce((t, id) => t + (feitos.includes(id) ? 0 : (+exercicios[id].min || 0)), 0);
      const prox = ids.find(id => !feitos.includes(id));
      const C = 2 * Math.PI * 32, frac = ids.length ? feitos.length / ids.length : 0;
      const fases = new Set(ids.map(faseDe));
      h += `<section class="routine"><div class="hero">${dataBloco()}<svg class="ring" viewBox="0 0 76 76" role="img" aria-label="${feitos.length} de ${ids.length} exercícios feitos"><circle class="trk" cx="38" cy="38" r="32"/><circle class="arc" cx="38" cy="38" r="32" stroke-dasharray="${C * frac} ${C}" transform="rotate(-90 38 38)"/><text x="38" y="43" text-anchor="middle">${feitos.length}/${ids.length}</text></svg></div>`;
      h += `<h1 class="brand">${esc(rotinas[rid].nome)}</h1>`;
      if (!ids.length) h += `<p class="eyebrow">Esta rotina ainda não tem exercícios.</p><button class="btn primary" data-editr="${rid}">Adicionar exercícios</button>`;
      else h += `<p class="eyebrow">${prox ? 'Faltam ' + falta + ' min' : 'Treino concluído · <button class="reset" data-reset="1">Recomeçar</button>'}</p>`;
      h += `<ol class="tl">`;
      let faseAtual = '';
      ids.forEach((id, i) => {
        const e = exercicios[id], done = feitos.includes(id), fase = faseDe(id);
        if (fases.size > 1 && fase !== faseAtual) {
          faseAtual = fase;
          const m = ids.filter(x => faseDe(x) === fase).reduce((t, x) => t + (+exercicios[x].min || 0), 0);
          h += `<li class="phase">${esc(fase)} · ${m} min</li>`;
        }
        h += `<li class="it${done ? ' done' : ''}${id === prox ? ' next' : ''}"><div class="rail"><button class="check" data-check="${id}" aria-pressed="${done}" aria-label="${done ? 'Desmarcar' : 'Marcar como feito'}: ${esc(e.nome)}">${done ? '✓' : i + 1}</button></div>`;
        h += `<button class="body" data-ex="${id}">${id === prox ? '<span class="tag">A seguir</span>' : ''}<span class="name">${esc(e.nome)}</span><span class="meta">${[e.min ? e.min + ' min' : '', e.bpm].filter(Boolean).map(esc).join(' · ')}</span></button></li>`;
      });
      h += `</ol></section>`;
    }
  }

  else if (state.tela === 'exercicio') {
    prepararEx();
    const e = exercicios[state.ex], done = feitos.includes(state.ex), ix = ids.indexOf(state.ex);
    const prox = ids.slice(ix + 1).find(id => !feitos.includes(id)) || ids.find(id => id !== state.ex && !feitos.includes(id));
    const vid = ytId(e.video), passos = e.passos || [];
    h += `<div class="top">${voltar(rotinas[rid].nome)}<span class="count">${ix + 1} de ${ids.length}</span><button class="daybtn" data-edite="${state.ex}">Editar</button></div>`;
    h += `<div class="segs" aria-hidden="true">${ids.map(id => `<i class="${id === state.ex ? 'cur' : feitos.includes(id) ? 'ok' : ''}"></i>`).join('')}</div>`;
    h += `<section class="routine"><h1 class="brand">${esc(e.nome)}</h1><div class="chips">${[!T.total && e.min ? e.min + ' min' : '', e.bpm, ids.some(x => faseDe(x) !== faseDe(state.ex)) ? faseDe(state.ex) : ''].filter(Boolean).map(t => `<span>${esc(t)}</span>`).join('')}</div>`;
    h += `<div class="tools" id="tools">${toolsHTML()}</div><div class="sets" id="sets">${setsHTML()}</div>`;
    if (state.player && vid) h += `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1" title="Vídeo de referência" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    if (e.imagem) h += `<div class="foto"><img src="${e.imagem}" alt="Imagem de referência"></div>`;
    else if (ehImagem(e.video)) h += `<div class="foto"><img src="${esc(e.video)}" alt="Imagem de referência"></div>`;
    if (e.fig) h += `<div class="fig big">${e.fig.tipo === 'tab' ? tab(e.fig.seg) : braco(e.fig.lo, e.fig.hi)}</div>`;
    if (passos.length) h += `<ol class="passos">${passos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>`;
    h += `<div class="field nota"><label for="exNota">Anotações</label><textarea id="exNota" data-f="exNota" rows="2" placeholder="Ex.: banco na posição 4, subir a carga na próxima">${esc(e.nota)}</textarea></div>`;
    h += `</section><div class="dock">`;
    const play = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
    if (vid) h += `<button class="vid" data-player="1">${play}${state.player ? 'Fechar' : 'Vídeo'}</button>`;
    else if (e.video && !ehImagem(e.video)) h += `<a class="vid" href="${esc(e.video)}" target="_blank" rel="noopener">${play}Vídeo</a>`;
    else h += `<a class="vid" href="${yt(e.busca || e.nome)}" target="_blank" rel="noopener">${play}${e.rotulo ? 'Base' : 'Buscar'}</a>`;
    h += done
      ? `<button class="feito off" data-feito="1"><b>Desmarcar</b><small>Já está marcado como feito</small></button></div>`
      : `<button class="feito" data-feito="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span><b>Feito</b><small>${prox ? 'Próximo: ' + esc(exercicios[prox].nome) : 'Concluir treino'}</small></span></button></div>`;
  }

  else if (state.tela === 'gerir') {
    const rs = rotDaCat(state.cat), es = exDaCat(state.cat);
    h += voltar('Voltar') + `<h1 class="brand">Editar ${esc(cat.nome)}</h1><div class="form">`;
    h += `<div class="field"><label for="catNome">Nome da categoria</label><input id="catNome" data-f="catNome" value="${esc(cat.nome)}"></div>`;
    h += `<h2 class="sec">Rotinas</h2>`;
    rs.forEach(r => h += `<div class="ordem"><button class="on" data-editr="${r}"><span class="grow">${esc(rotinas[r].nome)}</span><span class="n">${idsDe(r).length} exerc.</span></button>${apagarItem('rot:' + r, rotinas[r].nome)}</div>`);
    h += `<button class="add" data-novar="1">+ Nova rotina</button>`;
    if (rs.length) {
      h += `<h2 class="sec">Semana</h2>`;
      DIAS.forEach(([d]) => h += `<div class="rowsel"><label for="ag${d}">${NOMES[d]}</label><select id="ag${d}" data-agenda="${d}"><option value="">Livre</option>${rs.map(r => `<option value="${r}"${ag[d] === r ? ' selected' : ''}>${esc(rotinas[r].nome)}</option>`).join('')}</select></div>`);
    }
    h += `<h2 class="sec">Exercícios</h2>`;
    es.forEach(x => h += `<div class="ordem"><button class="on" data-edite="${x}"><span class="grow">${esc(exercicios[x].nome)}</span></button>${apagarItem('ex:' + x, exercicios[x].nome)}</div>`);
    h += `<button class="add" data-novoe="1">+ Novo exercício</button>`;
    h += excluir('cat', 'Excluir categoria') + `</div>`;
  }

  else if (state.tela === 'editRotina') {
    const r = rotinas[state.editR], lista = idsDe(state.editR), es = exDaCat(r.categoria);
    h += voltar('Voltar') + `<h1 class="brand">Editar rotina</h1><div class="form">`;
    h += `<div class="field"><label for="rotNome">Nome</label><input id="rotNome" data-f="rotNome" value="${esc(r.nome)}"></div>`;
    h += `<h2 class="sec">Exercícios, na ordem</h2>`;
    lista.forEach((x, i) => h += `<div class="ordem"><button class="on" data-edite="${x}"><span class="n">${i + 1}</span>${esc(exercicios[x].nome)}</button><button class="mini" data-sobe="${i}" aria-label="Subir"${i ? '' : ' disabled'}>↑</button><button class="mini" data-desce="${i}" aria-label="Descer"${i < lista.length - 1 ? '' : ' disabled'}>↓</button><button class="mini" data-tira="${i}" aria-label="Tirar da rotina">✕</button></div>`);
    if (es.length) h += `<div class="rowsel"><select id="addSel" aria-label="Exercício para adicionar">${es.map(x => `<option value="${x}">${esc(exercicios[x].nome)}</option>`).join('')}</select><button class="btn ghost" data-addex="1">Adicionar</button></div>`;
    h += `<button class="add" data-novoe="1">+ Novo exercício</button>`;
    if (state.colando) h += `<div class="field"><label for="colaTxt">Um exercício por linha. Para incluir o detalhe, use um traço: Leg press - 3x12</label><textarea id="colaTxt" rows="6" placeholder="Leg press - 3x12\nCadeira extensora - 3x15\nPanturrilha"></textarea><button class="btn primary" data-colar="1">Adicionar todos</button></div>`;
    else h += `<button class="add" data-colarabrir="1">Colar uma lista de exercícios</button>`;
    h += `<button class="btn ghost dup" data-duplicar="rot">Duplicar rotina</button>` + excluir('rot', 'Excluir rotina') + `</div>`;
  }

  else if (state.tela === 'editEx') {
    const e = exercicios[state.editE];
    h += voltar('Voltar') + `<h1 class="brand">Editar exercício</h1><div class="form">`;
    h += `<div class="field"><label for="exNome">Nome</label><input id="exNome" data-f="exNome" value="${esc(e.nome)}"></div>`;
    h += `<div class="duo"><div class="field"><label for="exMin">Minutos</label><input id="exMin" data-f="exMin" type="number" min="0" inputmode="numeric" value="${esc(e.min)}"></div>`;
    h += `<div class="field"><label for="exDet">Detalhe</label><input id="exDet" data-f="exDet" placeholder="3x12 · 20 kg, 60 bpm" value="${esc(e.bpm)}"></div></div>`;
    h += `<div class="duo"><div class="field"><label for="exSeries">Séries</label><input id="exSeries" data-f="exSeries" type="number" min="0" max="12" inputmode="numeric" placeholder="${seriesDe(e) || 'sem'}" value="${esc(e.series)}"></div>`;
    h += `<div class="field"><label for="exDesc">Descanso entre séries (segundos)</label><input id="exDesc" data-f="exDesc" type="number" min="5" inputmode="numeric" placeholder="60" value="${esc(e.descanso)}"></div></div>`;
    h += `<div class="field"><label for="exPassos">Como fazer (um passo por linha)</label><textarea id="exPassos" data-f="exPassos" rows="5">${esc((e.passos || []).join('\n'))}</textarea></div>`;
    h += `<div class="field"><label for="exVideo">Link do vídeo ou GIF</label><input id="exVideo" data-f="exVideo" type="url" inputmode="url" placeholder="Cole o link do YouTube" value="${esc(e.video)}"></div>`;
    h += `<div class="field"><label for="exFoto">Foto de referência</label>`;
    if (e.imagem) h += `<div class="foto"><img src="${e.imagem}" alt="Foto atual"></div>`;
    h += `<div class="rowsel"><label class="btn ghost grow" for="exFoto">${e.imagem ? 'Trocar foto' : 'Escolher foto'}</label>${e.imagem ? '<button class="btn ghost" data-delfoto="1">Remover</button>' : ''}</div><input id="exFoto" type="file" accept="image/*" class="oculto"></div>`;
    if (state.aviso) h += `<p class="aviso">${esc(state.aviso)}</p>`;
    h += `<button class="btn ghost dup" data-duplicar="ex">Duplicar exercício</button>` + excluir('ex', 'Excluir exercício') + `</div>`;
  }

  if (state.undo) h += `<div class="toast" role="status"><span>${esc(state.undo.txt)}</span><button data-undo="1">Desfazer</button><button data-fechatoast="1" aria-label="Fechar aviso">✕</button></div>`;
  app.className = 'app' + (state.tela === 'exercicio' ? ' tela-ex' : '');
  app.innerHTML = h;
  try { document.body.style.zoom = config.textoGrande ? '1.15' : ''; } catch (e) {}
  telaLigada(emTreino());
}
