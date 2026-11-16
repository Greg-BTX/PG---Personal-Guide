const { criarAparelho, conferir } = require('./aparelho');

module.exports = {
  'tela inicial mostra as categorias e nada mais': () => {
    const a = criarAparelho();
    conferir(a.texto() === 'O que vamos praticar? Música Musculação', 'início: ' + a.texto());
  },

  'abre direto no dia de hoje; com a opção desligada, pede o dia': () => {
    const a = criarAparelho();
    a.clicar({ cat: 'musica' });
    conferir(a.x.state.tela === 'rotina' && a.x.state.dia === a.x.hoje, 'devia abrir a rotina de hoje');
    a.clicar({ back: '1' });
    a.clicar({ config: '1' }); a.clicar({ toggle: 'diaAtual' }); a.clicar({ back: '1' });
    a.clicar({ cat: 'musica' });
    conferir(a.x.state.tela === 'semana', 'devia pedir o dia');
  },

  'rotina de segunda: 7 exercícios, 33 minutos, fases': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica');
    const t = a.texto();
    conferir(t.includes('Shape 1, a base') && t.includes('Faltam 33 min'), t);
    conferir(t.includes('Aquecimento · 10 min') && t.includes('Prática · 18 min') && t.includes('Improviso · 5 min'), 'fases: ' + t);
    conferir(a.x.idsDe('g1').length === 7, 'exercícios');
  },

  'diagrama do shape 1 tem 12 notas e 3 tônicas': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica'); a.clicar({ ex: 'sobe1' });
    conferir((a.html().match(/class="note/g) || []).length === 12, 'notas');
    conferir((a.html().match(/class="note root"/g) || []).length === 3, 'tônicas');
  },

  'Feito avança para o próximo e, no último, volta para a rotina': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica');
    const ids = a.x.idsDe('g1');
    a.clicar({ ex: ids[0] });
    for (let i = 0; i < ids.length; i++) {
      conferir(a.x.state.tela === 'exercicio' && a.x.state.ex === ids[i], 'devia estar no exercício ' + i);
      a.clicar({ feito: '1' });
    }
    conferir(a.x.state.tela === 'rotina' && a.texto().includes('Treino concluído'), a.texto());
  },

  'o feito vale só para a data: outro dia começa zerado': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica'); a.clicar({ check: 'along' });
    const chaves = Object.keys(a.x.state.feitos);
    conferir(chaves.length === 1 && /^\d{4}-\d\d-\d\d$/.test(chaves[0]) && chaves[0] === a.x.chaveDe(1), 'chave: ' + chaves);
    a.clicar({ semana: '1' }); a.clicar({ dia: '2' });
    conferir(a.texto().includes('Faltam 33 min'), 'terça devia estar zerada');
  },

  'Recomeçar zera o treino do dia': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica');
    a.x.idsDe('g1').forEach(id => a.clicar({ check: id }));
    a.clicar({ reset: '1' });
    conferir(a.texto().includes('Faltam 33 min'), a.texto());
  },

  'domingo é dia livre na rotina de exemplo': () => {
    const a = criarAparelho();
    a.clicar({ cat: 'musica' }); if (a.x.state.tela === 'rotina') a.clicar({ semana: '1' });
    conferir(/Domingo( Hoje)? Livre/.test(a.texto()), a.texto());
  },

  'texto digitado pelo usuário nunca vira HTML': () => {
    const a = criarAparelho();
    a.clicar({ modoedit: '1' }); a.clicar({ novacat: '1' }); a.alterar({ f: 'catNome' }, '<img src=x onerror=alert(1)>');
    a.clicar({ back: '1' });
    conferir(!a.html().includes('<img src=x'), 'nome entrou como HTML');
    conferir(a.html().includes('&lt;img src=x'), 'nome devia aparecer escapado');
  },
};
