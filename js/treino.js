// Ferramentas do treino: cronômetro, metrônomo, séries, histórico, tela ligada e navegação.

/* ---------- FERRAMENTAS DO TREINO ---------- */
const playIc = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const pausaIc = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>';
const fmt = seg => String(Math.floor(seg / 60)).padStart(2, '0') + ':' + String(seg % 60).padStart(2, '0');
const bpmDe = txt => { const m = String(txt || '').match(/(\d{2,3})\s*(?:[–-]\s*\d{2,3}\s*)?bpm/i); return m ? +m[1] : 0; };

// cronômetro: guarda a hora em que termina, para não atrasar com a tela apagada
let T = { ex:null, total:0, restante:0, fim:null };
const restanteAgora = () => T.fim ? Math.max(0, Math.ceil((T.fim - Date.now()) / 1000)) : T.restante;

// metrônomo: os cliques são agendados no relógio do áudio, que é preciso
let ac = null;
const metro = { on:false, bpm:0, prox:0, timer:null };
function audio() {
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
  return ac;
}
function bip(t, freq, dur, vol) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
function iniciarMetro() {
  if (!audio()) return;
  metro.on = true; metro.prox = ac.currentTime + 0.06;
  clearInterval(metro.timer);
  metro.timer = setInterval(() => { while (metro.prox < ac.currentTime + 0.15) { bip(metro.prox, 1000, 0.05, 0.5); metro.prox += 60 / metro.bpm; } }, 25);
}
function pararMetro() { metro.on = false; clearInterval(metro.timer); }
function alarme() {
  try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) {}
  try { if (audio()) [0, 0.25, 0.5].forEach(d => bip(ac.currentTime + 0.05 + d, 880, 0.15, 0.4)); } catch (e) {}
}
function prepararEx() {
  if (T.ex === state.ex) return;
  const e = exercicios[state.ex], seg = (+e.min || 0) * 60;
  T = { ex: state.ex, total: seg, restante: seg, fim: null };
  pararMetro(); R.fim = null;
  metro.bpm = e.bpmUlt || bpmDe(e.bpm) || 0;
}
function toolsHTML() {
  let h = '';
  if (T.total > 0) {
    const run = !!T.fim;
    h += `<button class="tool${run ? ' on' : ''}${!run && T.restante === 0 ? ' fim' : ''}" data-timer="1" aria-label="${run ? 'Pausar' : 'Iniciar'} cronômetro">${run ? pausaIc : playIc}<span id="tmr">${fmt(restanteAgora())}</span></button>`;
    if (run || T.restante !== T.total) h += `<button class="tool sm" data-timerreset="1" aria-label="Zerar cronômetro">↺</button>`;
  }
  if (metro.bpm) {
    h += `<span class="grupo"><button class="tool${metro.on ? ' on' : ''}" data-metro="1" aria-label="${metro.on ? 'Parar' : 'Tocar'} metrônomo">${metro.on ? pausaIc : playIc}<span>${metro.bpm} bpm</span></button>`;
    h += `<button class="tool sm" data-bpm="-5" aria-label="Diminuir 5 bpm">−</button><button class="tool sm" data-bpm="5" aria-label="Aumentar 5 bpm">+</button></span>`;
  }
  return h;
}
function atualizarTools() { const el = document.getElementById('tools'); if (el) el.innerHTML = toolsHTML(); }
setInterval(() => {
  if (!T.fim) return;
  const r = restanteAgora(), el = document.getElementById('tmr');
  if (el) el.textContent = fmt(r);
  if (r <= 0) { T.fim = null; T.restante = 0; alarme(); atualizarTools(); }
}, 400);

// séries: quantas o exercício pede (campo próprio ou lido de um detalhe como "3x12")
const seriesDe = e => {
  if (e.series !== undefined && e.series !== null && e.series !== '') return Math.min(12, Math.max(0, +e.series || 0));
  const m = /(\d+)\s*[x×]\s*\d+/i.exec(e.bpm || '');
  return m ? Math.min(12, +m[1]) : 0;
};
const repsDe = e => { const m = /\d+\s*[x×]\s*(\d+)/i.exec(e.bpm || ''); return m ? m[1] : ''; };
function setsDe(exId, criar) {
  const k = chaveDe(state.dia);
  if (!state.log[exId]) { if (!criar) return []; state.log[exId] = {}; }
  if (!state.log[exId][k]) { if (!criar) return []; state.log[exId][k] = []; }
  return state.log[exId][k];
}
function setEm(i) { const a = setsDe(state.ex, true); while (a.length <= i) a.push({ c:'', r:'', ok:false }); return a[i]; }
function ultimaVez(exId) {
  const k = chaveDe(state.dia), porEx = state.log[exId] || {};
  const d = Object.keys(porEx).filter(x => x < k && porEx[x].some(t => t.ok)).sort().pop();
  return d ? { data: d, sets: porEx[d].filter(t => t.ok) } : null;
}
// descanso entre séries
const R = { fim: null };
const restAgora = () => R.fim ? Math.max(0, Math.ceil((R.fim - Date.now()) / 1000)) : 0;
function setsHTML() {
  const e = exercicios[state.ex];
  if (!e) return '';
  const feitas = setsDe(state.ex), n = Math.max(seriesDe(e), feitas.length);
  if (!n) return '';
  const ant = ultimaVez(state.ex), reps = repsDe(e);
  let h = `<div class="sets-h"><b>Séries</b>${ant ? `<span>Última vez, ${+ant.data.slice(8)} ${MESES[+ant.data.slice(5, 7) - 1]}: ${ant.sets.map(t => esc((t.c !== '' ? t.c + ' kg × ' : '') + t.r)).join(' · ')}</span>` : ''}</div>`;
  for (let i = 0; i < n; i++) {
    const t = feitas[i] || { c:'', r:'', ok:false };
    const p = (ant && (ant.sets[i] || ant.sets[ant.sets.length - 1])) || {};
    h += `<div class="set${t.ok ? ' ok' : ''}"><span class="sn">${i + 1}</span>`;
    h += `<input type="number" inputmode="decimal" step="any" aria-label="Carga da série ${i + 1}, em kg" data-set="${i}" data-k="c" placeholder="${esc(p.c ?? '')}" value="${esc(t.c)}"><span class="un">kg ×</span>`;
    h += `<input type="number" inputmode="numeric" aria-label="Repetições da série ${i + 1}" data-set="${i}" data-k="r" placeholder="${esc(p.r || reps)}" value="${esc(t.r)}">`;
    h += `<button class="setok" data-setok="${i}" aria-pressed="${!!t.ok}" aria-label="Série ${i + 1} feita">✓</button></div>`;
  }
  h += `<button class="addset" data-addset="1">+ série</button>`;
  if (R.fim) h += `<div class="rest"><span>Descanso</span><b id="restv">${fmt(restAgora())}</b><button data-restskip="1">Pular</button></div>`;
  return h;
}
function atualizarSets() { const el = document.getElementById('sets'); if (el) el.innerHTML = setsHTML(); }
setInterval(() => {
  if (!R.fim) return;
  const r = restAgora(), el = document.getElementById('restv');
  if (el) el.textContent = fmt(r);
  if (r <= 0) { R.fim = null; alarme(); atualizarSets(); }
}, 400);

// histórico: 0 = sem treino, 1 = treino parcial, 2 = treino completo
function diaTreinado(k) {
  const d = state.feitos[k];
  if (!d) return 0;
  let algum = false, completo = true;
  for (const r in d) {
    if (!d[r].length) continue;
    algum = true;
    if (rotinas[r] && d[r].filter(x => exercicios[x]).length < idsDe(r).length) completo = false;
  }
  return algum ? (completo ? 2 : 1) : 0;
}
// sequência: treinos seguidos sem faltar em dia que tinha rotina marcada (dias livres não quebram)
function sequencia() {
  let n = 0;
  const dt = new Date();
  for (let i = 0; i < 400; i++) {
    const agendado = Object.values(agenda).some(a => a && rotinas[a[dt.getDay()]]);
    if (diaTreinado(chaveData(dt))) n++;
    else if (agendado && i > 0) break;
    dt.setDate(dt.getDate() - 1);
  }
  return n;
}

// tela ligada durante o treino
let trava = null;
async function telaLigada(on) {
  try {
    if (on && !trava && navigator.wakeLock) { trava = await navigator.wakeLock.request('screen'); trava.addEventListener('release', () => { trava = null; }); }
    else if (!on && trava) { const t = trava; trava = null; await t.release(); }
  } catch (e) { trava = null; }
}
const emTreino = () => config.telaLigada && (state.tela === 'rotina' || state.tela === 'exercicio');

// botão voltar do Android: mantém uma entrada extra no histórico enquanto não se está no Início
let armadilha = false, ignorarPop = false;
const alvoVoltar = () => ({ config:'inicio', semana:'inicio', rotina: config.diaAtual ? 'inicio' : 'semana', exercicio:'rotina', gerir: state.voltaGerir, editRotina: state.voltaRot, editEx: state.voltaEx, historico:'inicio' }[state.tela] || 'inicio');

function ir(tela) {
  state.tela = tela; state.confirma = null; state.player = false; state.aviso = ''; state.colando = false;
  if (tela !== 'exercicio') { T.ex = null; T.fim = null; R.fim = null; pararMetro(); }
  try {
    if (tela !== 'inicio' && !armadilha) { history.pushState({ pg: 1 }, ''); armadilha = true; }
    else if (tela === 'inicio' && armadilha) { armadilha = false; ignorarPop = true; history.back(); }
  } catch (e) {}
  try { window.scrollTo(0, 0); } catch (e) {}
}
