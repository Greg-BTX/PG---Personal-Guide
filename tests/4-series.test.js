const { criarAparelho, conferir } = require('./aparelho');

function naAcademia() {
  const a = criarAparelho();
  a.clicar({ cat: 'musculacao' }); a.clicar({ gerir: '1' }); a.clicar({ novar: '1' }); a.alterar({ f: 'rotNome' }, 'Pernas');
  a.clicar({ colarabrir: '1' }); a.campo('colaTxt').value = 'Leg press - 3x12\nPanturrilha - 4x15'; a.clicar({ colar: '1' });
  const rot = a.x.state.editR, [leg, pan] = a.x.idsDe(rot);
  a.clicar({ back: '1' }); a.alterar({ agenda: '1' }, rot);
  a.irAoInicio(); a.clicar({ cat: 'musculacao' }); if (a.x.state.tela === 'rotina') a.clicar({ semana: '1' });
  return { a, rot, leg, pan };
}
// registra um treino na segunda-feira da semana anterior
function semanaPassada(a, rot, leg, pan) {
  const d = a.x.chaveDe(1).split('-').map(Number), dt = new Date(d[0], d[1] - 1, d[2] - 7), k = a.x.chaveData(dt);
  a.x.state.log[leg] = { [k]: [{ c: '80', r: '12', ok: true }, { c: '80', r: '10', ok: true }, { c: '85', r: '8', ok: true }] };
  a.x.state.feitos[k] = { [rot]: [leg, pan] };
  return k;
}

module.exports = {
  'detalhe "3x12" vira 3 séries de 12': () => {
    const { a, leg, pan } = naAcademia();
    conferir(a.x.seriesDe(a.x.exercicios[leg]) === 3 && a.x.repsDe(a.x.exercicios[leg]) === '12', 'leg');
    conferir(a.x.seriesDe(a.x.exercicios[pan]) === 4, 'panturrilha');
    conferir(a.x.seriesDe(a.x.exercicios.crom) === 0, 'guitarra não tem séries');
  },

  'campo Séries tem prioridade sobre o detalhe': () => {
    const { a, leg } = naAcademia();
    a.clicar({ gerir: '1' }); a.clicar({ edite: leg }); a.alterar({ f: 'exSeries' }, '5');
    conferir(a.x.seriesDe(a.x.exercicios[leg]) === 5, 'campo');
    a.alterar({ f: 'exSeries' }, '');
    conferir(a.x.seriesDe(a.x.exercicios[leg]) === 3, 'vazio volta ao detalhe');
  },

  'mostra a última vez e sugere os mesmos valores': () => {
    const { a, rot, leg, pan } = naAcademia();
    semanaPassada(a, rot, leg, pan);
    a.clicar({ dia: '1' }); a.clicar({ ex: leg });
    conferir(a.texto().includes('80 kg × 12 · 80 kg × 10 · 85 kg × 8'), a.texto());
    conferir((a.html().match(/class="set"/g) || []).length === 3, 'linhas');
    conferir(a.html().includes('placeholder="85"'), 'sugestão');
  },

  'marcar a série grava, herda a anterior e inicia o descanso': () => {
    const { a, rot, leg, pan } = naAcademia();
    semanaPassada(a, rot, leg, pan);
    a.clicar({ dia: '1' }); a.clicar({ ex: leg });
    a.alterar({ set: '0', k: 'c' }, '82.5'); a.clicar({ setok: '0' });
    const s = a.x.setsDe(leg);
    conferir(s[0].ok && s[0].c === '82.5' && s[0].r === '12', 'série 1: ' + JSON.stringify(s[0]));
    conferir(a.x.R.fim && a.campo('sets').innerHTML.includes('Descanso'), 'descanso');
    a.clicar({ restskip: '1' }); conferir(!a.x.R.fim, 'pular');
    a.clicar({ setok: '1' });
    conferir(s[1].c === '80' && s[1].r === '10', 'herda a série 2 da última vez');
    a.clicar({ setok: '2' });
    conferir(!a.x.R.fim, 'a última série não inicia descanso');
    a.clicar({ setok: '2' }); conferir(!s[2].ok, 'tocar de novo desmarca');
  },

  'série extra vale só para o dia': () => {
    const { a, leg } = naAcademia();
    a.clicar({ dia: '1' }); a.clicar({ ex: leg });
    a.clicar({ addset: '1' });
    conferir(a.x.setsDe(leg).length === 4, 'quatro');
    a.clicar({ back: '1' }); a.clicar({ semana: '1' }); a.clicar({ dia: '2' });
    conferir(a.x.setsDe(leg).length === 0, 'outro dia começa limpo');
  },

  'histórico: dia completo, parcial e detalhe do dia': () => {
    const { a, rot, leg, pan } = naAcademia();
    const k = semanaPassada(a, rot, leg, pan);
    conferir(a.x.diaTreinado(k) === 2, 'completo');
    a.x.state.feitos[k][rot] = [leg];
    conferir(a.x.diaTreinado(k) === 1, 'parcial');
    conferir(a.x.diaTreinado('1999-01-01') === 0, 'sem treino');
    a.irAoInicio(); a.clicar({ hist: '1' }); a.clicar({ hd: k });
    conferir(a.texto().includes('Pernas 1 de 2 exerc.'), a.texto());
  },

  'sequência conta treinos seguidos e dia livre não quebra': () => {
    const a = criarAparelho();
    for (const c in a.x.agenda) a.x.agenda[c] = {};          // nenhum dia agendado
    const dia = n => { const d = a.x.agora(); d.setDate(d.getDate() - n); return a.x.chaveData(d); };
    a.x.state.feitos[dia(0)] = { g1: ['along'] };
    a.x.state.feitos[dia(1)] = { g1: ['along'] };
    a.x.state.feitos[dia(3)] = { g1: ['along'] };
    conferir(a.x.sequencia() === 3, 'dias livres não quebram: ' + a.x.sequencia());
    a.x.agenda.musica = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(d => [d, 'g1']));   // agora todo dia tem rotina
    conferir(a.x.sequencia() === 2, 'falta em dia agendado quebra: ' + a.x.sequencia());
  },
};
