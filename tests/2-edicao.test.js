const { criarAparelho, conferir } = require('./aparelho');

// cria a rotina "Pernas" em Musculação com dois exercícios, agendada para segunda
function comFicha() {
  const a = criarAparelho();
  a.clicar({ cat: 'musculacao' }); a.clicar({ gerir: '1' }); a.clicar({ novar: '1' });
  a.alterar({ f: 'rotNome' }, 'Pernas');
  a.clicar({ colarabrir: '1' });
  a.campo('colaTxt').value = 'Leg press - 3x12\n\nPanturrilha; 4x15';
  a.clicar({ colar: '1' });
  const rot = a.x.state.editR;
  a.clicar({ back: '1' }); a.alterar({ agenda: '1' }, rot);
  return { a, rot, ids: a.x.idsDe(rot) };
}

module.exports = {
  'categoria vazia oferece montar a ficha': () => {
    const a = criarAparelho();
    a.clicar({ cat: 'musculacao' });
    conferir(a.texto().includes('Nenhuma ficha ainda Montar ficha'), a.texto());
  },

  'colar lista cria os exercícios com o detalhe': () => {
    const { a, ids } = comFicha();
    conferir(ids.length === 2, 'quantidade');
    conferir(a.x.exercicios[ids[0]].nome === 'Leg press' && a.x.exercicios[ids[0]].bpm === '3x12', 'traço');
    conferir(a.x.exercicios[ids[1]].nome === 'Panturrilha' && a.x.exercicios[ids[1]].bpm === '4x15', 'ponto e vírgula');
  },

  'colar lista reaproveita exercício que já existe': () => {
    const a = criarAparelho();
    a.clicar({ modoedit: '1' }); a.clicar({ cat: 'musica' }); a.clicar({ editr: 'g6' });
    const antes = Object.keys(a.x.exercicios).length;
    a.clicar({ colarabrir: '1' }); a.campo('colaTxt').value = 'cromático 1-2-3-4'; a.clicar({ colar: '1' });
    conferir(Object.keys(a.x.exercicios).length === antes, 'não devia criar outro');
    conferir(a.x.idsDe('g6').slice(-1)[0] === 'crom', 'devia apontar para o existente');
  },

  'campos gravam ao sair e a rotina aparece no dia agendado': () => {
    const { a, ids } = comFicha();
    a.clicar({ edite: ids[0] });
    a.alterar({ f: 'exNome' }, 'Leg press 45'); a.alterar({ f: 'exMin' }, '8');
    a.alterar({ f: 'exPassos' }, 'Pés na largura do ombro\n\nDesça até 90 graus');
    a.irAoInicio(); a.clicar({ cat: 'musculacao' }); if (a.x.state.tela === 'rotina') a.clicar({ semana: '1' });
    conferir(/Segunda( Hoje)? Pernas/.test(a.texto()), a.texto());
    a.clicar({ dia: '1' }); a.clicar({ ex: ids[0] });
    conferir(a.texto().includes('Leg press 45') && a.texto().includes('Desça até 90 graus'), a.texto());
    conferir(a.x.exercicios[ids[0]].passos.length === 2, 'linha vazia vira passo');
  },

  'setas reordenam e o X tira só da rotina': () => {
    const { a, rot, ids } = comFicha();
    a.clicar({ editr: rot }); a.clicar({ sobe: '1' });
    conferir(a.x.idsDe(rot)[0] === ids[1], 'ordem');
    a.clicar({ tira: '0' });
    conferir(a.x.idsDe(rot).length === 1 && a.x.exercicios[ids[1]], 'o exercício continua existindo');
  },

  'duplicar rotina e duplicar exercício': () => {
    const { a, rot, ids } = comFicha();
    a.clicar({ editr: rot }); a.clicar({ duplicar: 'rot' });
    const copia = a.x.state.editR;
    conferir(copia !== rot && a.x.rotinas[copia].nome === 'Pernas (cópia)' && a.x.idsDe(copia).length === 2, 'rotina');
    a.clicar({ edite: ids[0] }); a.clicar({ duplicar: 'ex' });
    conferir(a.x.exercicios[a.x.state.editE].nome === 'Leg press (cópia)', 'exercício');
    conferir(a.x.idsDe(copia).length === 3, 'a cópia entra na rotina de onde veio');
  },

  'apagar pede dois toques e pode ser desfeito': () => {
    const { a, rot, ids } = comFicha();
    a.clicar({ delitem: 'ex:' + ids[0] });
    conferir(a.x.exercicios[ids[0]] && a.texto().includes('Apagar?'), 'primeiro toque só confirma');
    a.clicar({ delitem: 'ex:' + ids[0] });
    conferir(!a.x.exercicios[ids[0]] && a.x.idsDe(rot).length === 1, 'segundo toque apaga');
    conferir(a.texto().includes('"Leg press" apagado Desfazer'), a.texto());
    a.clicar({ undo: '1' });
    conferir(a.x.exercicios[ids[0]] && a.x.idsDe(rot)[0] === ids[0], 'volta na mesma posição');
  },

  'apagar rotina limpa a agenda': () => {
    const { a, rot } = comFicha();
    a.clicar({ delitem: 'rot:' + rot }); a.clicar({ delitem: 'rot:' + rot });
    conferir(!a.x.rotinas[rot] && a.x.agenda.musculacao['1'] === null, 'agenda');
  },

  'modo de edição: criar, apagar e recuperar categoria': () => {
    const a = criarAparelho();
    conferir(!a.texto().includes('Nova'), 'bloco Nova só no modo de edição');
    a.clicar({ modoedit: '1' }); a.clicar({ novacat: '1' }); a.alterar({ f: 'catNome' }, 'Piano');
    a.clicar({ back: '1' });
    conferir(a.x.state.tela === 'inicio' && a.texto().includes('P Piano'), a.texto());
    a.clicar({ cat: a.x.categorias[2].id });
    conferir(a.x.state.tela === 'gerir', 'no modo de edição, tocar abre a edição');
    a.clicar({ del: 'cat' }); a.clicar({ del: 'cat' });
    conferir(a.x.categorias.length === 2 && a.x.state.tela === 'inicio', 'apagou');
    a.clicar({ undo: '1' });
    conferir(a.x.categorias.length === 3, 'desfez');
  },

  'lápis na tela da rotina edita e volta para ela': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica'); a.clicar({ editr: 'g1' });
    conferir(a.x.state.tela === 'editRotina', 'abre');
    a.clicar({ back: '1' });
    conferir(a.x.state.tela === 'rotina', 'volta');
  },

  'dados editados sobrevivem a fechar e abrir o app': () => {
    const { a, rot } = comFicha();
    const b = criarAparelho({ armazenamento: a.armazenamento });
    conferir(b.x.rotinas[rot] && b.x.rotinas[rot].nome === 'Pernas' && b.x.idsDe(rot).length === 2, 'recarregou');
  },
};
