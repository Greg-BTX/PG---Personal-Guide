// Conta e sincronização com o Supabase, e a partida do app.

/* ---------- NUVEM (Supabase) ---------- */
// A chave abaixo é pública por natureza: quem protege os dados é a regra do banco,
// que só deixa cada pessoa ler e gravar a própria linha.
const NUVEM = { url: 'https://grlayxznjcxsuwzdlhcx.supabase.co', chave: 'sb_publishable_NEn_etf1KarPW6jBhv03CQ_8tRrcxl0' };
let sessao = ler('pg-sessao', null);
const meta = ler('pg-sync', { alterado: 0 });   // hora da última alteração feita neste aparelho
const nuvem = { status: '', ocupado: false, denovo: false, timer: null, google: null };
// pergunta ao servidor se o login com Google já foi ativado; o botão só aparece quando sim
function verProvedores() {
  if (sessao || nuvem.google !== null) return;
  api('/auth/v1/settings').then(r => r.json()).then(j => { nuvem.google = !!(j && j.external && j.external.google); if (nuvem.google && state.tela === 'config') render(); }).catch(() => {});
}

function tocou() {
  meta.alterado = Date.now(); gravar('pg-sync', meta);
  if (sessao) { clearTimeout(nuvem.timer); nuvem.timer = setTimeout(sincronizar, 2500); }
}
function api(caminho, opt = {}, tk) {
  return fetch(NUVEM.url + caminho, Object.assign({}, opt, { headers: Object.assign({ apikey: NUVEM.chave, 'Content-Type': 'application/json' }, tk ? { Authorization: 'Bearer ' + tk } : {}, opt.headers || {}) }));
}
function guardarSessao(o) {
  const corpo = JSON.parse(atob(o.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  sessao = { at: o.access_token, rt: o.refresh_token, expira: Date.now() + (+o.expires_in || 3600) * 1000, uid: corpo.sub, email: corpo.email || '' };
  gravar('pg-sessao', sessao);
}
function encerrarSessao(msg) { sessao = null; gravar('pg-sessao', null); clearTimeout(nuvem.timer); nuvem.status = msg || ''; nuvem.conflito = false; meta.vinculado = false; gravar('pg-sync', meta); }
// este aparelho já tem cadastros ou histórico próprios?
const temLocal = () => !!ler('pg-dados-v1', null) || Object.keys(state.feitos).length > 0 || Object.keys(state.log).length > 0;
async function token() {
  if (sessao.expira - 60000 > Date.now()) return sessao.at;
  const r = await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: sessao.rt }) });
  if (!r.ok) {
    if (r.status >= 400 && r.status < 500) encerrarSessao('Sua sessão expirou. Entre de novo.');
    throw new Error('sessao');
  }
  guardarSessao(await r.json());
  return sessao.at;
}
function aplicarRemoto(r) {
  if (dadosValidos(r.dados)) { aplicarDados(r.dados); gravar('pg-dados-v1', r.dados); }
  for (const [alvo, fonte, chave] of [[state.feitos, r.feitos, 'pg-feitos-v2'], [state.log, r.log, 'pg-log-v1']]) {
    Object.keys(alvo).forEach(k => delete alvo[k]);
    Object.assign(alvo, fonte || {});
    gravar(chave, alvo);
  }
}
// Regra: vale a versão alterada por último. Se a da nuvem é mais nova, ela substitui a local; senão, a local sobe.
async function sincronizar() {
  if (!sessao) return;
  if (nuvem.ocupado) { nuvem.denovo = true; return; }
  if (navigator.onLine === false) { nuvem.status = 'Sem internet. Sincroniza quando a conexão voltar.'; return; }
  nuvem.ocupado = true;
  let puxou = false;
  try {
    const tk = await token();
    const r = await api('/rest/v1/user_data?select=dados,feitos,log,alterado', {}, tk);
    if (!r.ok) throw new Error('leitura ' + r.status);
    const remoto = (await r.json())[0];
    // Primeira vez deste aparelho nesta conta, com dados dos dois lados: quem decide é a pessoa, nunca o relógio.
    if (remoto && !meta.vinculado && temLocal()) {
      nuvem.conflito = true; nuvem.ocupado = false;
      nuvem.status = 'Falta escolher quais dados manter.';
      if (state.tela === 'config') render();
      return;
    }
    if (remoto && +remoto.alterado > meta.alterado) {
      if (meta.vinculado) guardarDesfazer('Dados da nuvem carregados');
      aplicarRemoto(remoto);
      meta.alterado = +remoto.alterado; gravar('pg-sync', meta);
      puxou = true;
    } else if (!remoto || meta.alterado > +remoto.alterado) {
      if (!meta.alterado) { meta.alterado = Date.now(); gravar('pg-sync', meta); }
      const enviado = meta.alterado;
      const w = await api('/rest/v1/user_data?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ user_id: sessao.uid, dados: JSON.parse(foto()), feitos: state.feitos, log: state.log, alterado: enviado, updated_at: new Date().toISOString() }) }, tk);
      if (!w.ok) throw new Error('gravação ' + w.status);
    }
    meta.vinculado = true; gravar('pg-sync', meta); nuvem.conflito = false;
    nuvem.status = 'Sincronizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.';
  } catch (e) {
    if (sessao) nuvem.status = 'Não consegui sincronizar agora. Seus dados continuam salvos neste aparelho.';
  }
  nuvem.ocupado = false;
  if (puxou && !['inicio', 'config', 'historico'].includes(state.tela)) ir('inicio');
  if (puxou || state.tela === 'config') render();
  if (nuvem.denovo) { nuvem.denovo = false; sincronizar(); }
}
// volta do link enviado por e-mail: os dados da sessão chegam depois do # no endereço
(function lerRetorno() {
  try {
    const h = location.hash.slice(1);
    if (!/access_token=|error=/.test(h)) return;
    const p = new URLSearchParams(h);
    history.replaceState(null, '', location.pathname + location.search);
    state.tela = 'config';
    if (p.get('access_token')) guardarSessao({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: p.get('expires_in') });
    else state.aviso = 'Este link expirou ou já foi usado. Peça outro abaixo.';
  } catch (e) {}
})();

render();
sincronizar();
if (state.tela === 'config') verProvedores();

if (window.addEventListener) {
  window.addEventListener('online', sincronizar);
  window.addEventListener('popstate', () => {
    if (ignorarPop) { ignorarPop = false; return; }
    armadilha = false;
    if (state.tela !== 'inicio') { ir(alvoVoltar()); render(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { telaLigada(emTreino()); sincronizar(); } });
}

// funciona offline depois da primeira visita
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(() => {}); }
