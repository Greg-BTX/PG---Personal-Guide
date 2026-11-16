// Armazenamento no aparelho, estado da navegação e funções de apoio.

/* ---------- ESTADO ---------- */
const ler = (k, pad) => { try { return JSON.parse(localStorage.getItem(k)) || pad; } catch (e) { return pad; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

// Dados cadastrados: na primeira vez vale o exemplo acima; depois, o que estiver salvo no aparelho.
function aplicarDados(src) {
  categorias.length = 0; categorias.push(...src.categorias);
  for (const [alvo, fonte] of [[exercicios, src.exercicios], [rotinas, src.rotinas], [rotina_exercicios, src.rotina_exercicios], [agenda, src.agenda]]) {
    Object.keys(alvo).forEach(k => delete alvo[k]);
    Object.assign(alvo, fonte || {});
  }
}
const dadosValidos = d => d && Array.isArray(d.categorias) && d.exercicios && d.rotinas && d.rotina_exercicios && typeof d.exercicios === 'object';
const salvo = ler('pg-dados-v1', null);
if (dadosValidos(salvo)) aplicarDados(salvo);
const foto = () => JSON.stringify({ categorias, exercicios, rotinas, rotina_exercicios, agenda });
const salvarDados = () => { const ok = gravar('pg-dados-v1', { categorias, exercicios, rotinas, rotina_exercicios, agenda }); tocou(); return ok; };

const DIAS = [[1,'Seg'],[2,'Ter'],[3,'Qua'],[4,'Qui'],[5,'Sex'],[6,'Sáb'],[0,'Dom']];
const hoje = new Date().getDay();
const state = { tela:'inicio', cat:'musica', dia:hoje, ex:null, editR:null, editE:null, voltaEx:'gerir', voltaRot:'gerir', voltaGerir:'semana', editando:false, player:false, confirma:null, aviso:'', undo:null, colando:false,
  feitos: ler('pg-feitos-v2', {}) };   // feitos[data][rotina] = [exercícios]: cada data começa zerada
const config = Object.assign({ diaAtual:true, telaLigada:true, textoGrande:false }, ler('pg-config-v1', {}));
const salvarConfig = () => gravar('pg-config-v1', config);
const salvar = () => { gravar('pg-feitos-v2', state.feitos); tocou(); };
state.log = ler('pg-log-v1', {});   // log[exercício][data] = [{ c: carga, r: repetições, ok }]
const salvarLog = () => { gravar('pg-log-v1', state.log); tocou(); };
{ const d = new Date(); state.mes = { y: d.getFullYear(), m: d.getMonth() }; state.histDia = null; }

// data do dia escolhido, dentro da semana atual (segunda a domingo)
const posSemana = d => (d + 6) % 7;
function dataDe(dia) { const dt = new Date(); dt.setDate(dt.getDate() + posSemana(dia) - posSemana(hoje)); return dt; }
const chaveData = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const chaveDe = dia => chaveData(dataDe(dia));
function feitosDe(rid, criar) {
  const k = chaveDe(state.dia);
  if (!state.feitos[k]) { if (!criar) return []; state.feitos[k] = {}; }
  if (!state.feitos[k][rid]) { if (!criar) return []; state.feitos[k][rid] = []; }
  return state.feitos[k][rid];
}

const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const novoId = () => 'x' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
const idsDe = rid => (rotina_exercicios[rid] || []).filter(id => exercicios[id]);
const exDaCat = cat => Object.keys(exercicios).filter(id => exercicios[id].cat === cat);
const rotDaCat = cat => Object.keys(rotinas).filter(id => rotinas[id].categoria === cat);
const ytId = url => { const m = String(url || '').match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/)([\w-]{11})/); return m ? m[1] : null; };
const ehImagem = url => /\.(gif|png|jpe?g|webp)(\?.*)?$/i.test(url || '');

// reduz a foto antes de guardar, para caber no armazenamento do aparelho
function lerFoto(file, cb) {
  const r = new FileReader();
  r.onerror = () => cb(null);
  r.onload = () => {
    const im = new Image();
    im.onerror = () => cb(null);
    im.onload = () => {
      const k = Math.min(1, 900 / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.72));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
}
