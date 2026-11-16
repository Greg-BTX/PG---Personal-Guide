// Simula um aparelho com o app aberto, sem navegador: carrega os mesmos arquivos
// que o index.html carrega, na mesma ordem, e oferece um DOM mínimo de mentira.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const ARQUIVOS = [...fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const CODIGO = ARQUIVOS.map(f => [f, fs.readFileSync(path.join(RAIZ, f), 'utf8')]);

// nomes internos do app que os testes podem ler
const EXPOR = `({ state, config, categorias, exercicios, rotinas, rotina_exercicios, agenda, meta, nuvem, hoje,
  idsDe, seriesDe, repsDe, setsDe, sequencia, diaTreinado, chaveData, chaveDe, sincronizar, restanteAgora,
  agora: () => new Date(), get sessao() { return sessao; }, get T() { return T; }, get R() { return R; }, get metro() { return metro; } })`;

// PG_DESLOCAR_DIAS=n faz o app acreditar que hoje é daqui a n dias; serve para
// conferir que os testes passam em qualquer dia da semana.
const DESLOC = (+process.env.PG_DESLOCAR_DIAS || 0) * 864e5;
class DataDeslocada extends Date {
  constructor(...a) { if (a.length) super(...a); else super(Date.now() + DESLOC); }
  static now() { return Date.now() + DESLOC; }
}

function criarAparelho({ hash = '', armazenamento = {}, servidor = null, online = true } = {}) {
  let html = '';
  const ouvintes = {}, janela = {}, elementos = {}, baixados = [];
  const dados = Object.assign({}, armazenamento);
  const historico = { tamanho: 0 };
  const app = { set innerHTML(v) { html = v; }, get innerHTML() { return html; }, addEventListener(t, f) { ouvintes[t] = f; }, className: '' };
  const location = { hash, origin: 'https://exemplo.github.io', pathname: '/app/', search: '' };
  const contexto = vm.createContext({
    console, setTimeout, clearTimeout, setInterval, clearInterval, atob, URLSearchParams, Date: DataDeslocada,
    document: {
      getElementById: id => id === 'app' ? app : (elementos[id] = elementos[id] || { value: '', innerHTML: '', textContent: '' }),
      createElement: () => ({ click() {}, remove() {} }),
      body: { style: {}, appendChild() {} },
      addEventListener() {}, visibilityState: 'visible',
    },
    window: { scrollTo() {}, addEventListener(t, f) { janela[t] = f; } },
    navigator: { onLine: online },
    location,
    history: {
      pushState() { historico.tamanho++; },
      replaceState() { location.hash = ''; },
      back() { historico.tamanho--; setTimeout(() => janela.popstate && janela.popstate(), 0); },
    },
    localStorage: { getItem: k => (k in dados ? dados[k] : null), setItem(k, v) { dados[k] = String(v); } },
    fetch: servidor ? servidor.fetch : async () => { throw new Error('sem rede'); },
    Blob: class { constructor(p) { this.texto = p[0]; } },
    URL: { createObjectURL: b => { baixados.push(b.texto); return 'blob:teste'; } },
    FileReader: class { readAsText(f) { this.result = f.texto; this.onload(); } },
  });
  for (const [nome, codigo] of CODIGO) vm.runInContext(codigo, contexto, { filename: nome });
  const x = vm.runInContext(EXPOR, contexto);

  return {
    x, armazenamento: dados, baixados, historico,
    html: () => html,
    texto: () => html.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(),
    campo: id => contexto.document.getElementById(id),
    zoom: () => contexto.document.body.style.zoom,
    clicar: dataset => ouvintes.click({ target: { closest: () => ({ dataset }) } }),
    alterar: (dataset, value, extra = {}) => ouvintes.change({ target: Object.assign({ dataset, value }, extra) }),
    voltarDoAndroid: () => janela.popstate(),
    irAoInicio() { for (let i = 0; i < 8 && x.state.tela !== 'inicio'; i++) this.clicar({ back: '1' }); },
    // abre a rotina de segunda-feira de uma categoria, seja qual for o dia em que o teste roda
    abrirSegunda(cat) { this.clicar({ cat }); if (x.state.tela === 'rotina') this.clicar({ semana: '1' }); this.clicar({ dia: '1' }); },
  };
}

const esperar = ms => new Promise(r => setTimeout(r, ms));
function conferir(condicao, mensagem) { if (!condicao) throw new Error(mensagem); }

module.exports = { criarAparelho, esperar, conferir };
