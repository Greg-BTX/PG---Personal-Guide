const { criarAparelho, esperar, conferir } = require('./aparelho');

const noCromatico = () => { const a = criarAparelho(); a.abrirSegunda('musica'); a.clicar({ ex: 'crom' }); return a; };

module.exports = {
  'cronômetro: inicia, pausa, zera e avisa no fim': async () => {
    const a = noCromatico();
    conferir(a.html().includes('05:00'), 'duração do exercício');
    a.clicar({ timer: '1' }); conferir(a.x.T.fim, 'rodando');
    a.clicar({ timer: '1' }); conferir(!a.x.T.fim && a.x.T.restante <= 300, 'pausado');
    a.clicar({ timerreset: '1' }); conferir(a.x.T.restante === 300, 'zerado');
    a.x.T.restante = 1; a.clicar({ timer: '1' });
    await esperar(1500);
    conferir(a.x.T.restante === 0 && !a.x.T.fim, 'terminou');
    conferir(a.campo('tools').innerHTML.includes('fim'), 'mostra o estado de fim');
  },

  'sair do exercício para o cronômetro': () => {
    const a = noCromatico();
    a.clicar({ timer: '1' }); a.clicar({ back: '1' });
    conferir(!a.x.T.fim, 'devia parar');
  },

  'metrônomo aparece só quando o detalhe tem bpm e lembra o último andamento': () => {
    const a = noCromatico();
    conferir(a.html().includes('60 bpm') && a.html().includes('data-metro'), 'metrônomo');
    a.clicar({ bpm: '5' }); a.clicar({ bpm: '5' });
    conferir(a.x.exercicios.crom.bpmUlt === 70, 'salvo');
    a.clicar({ back: '1' }); a.clicar({ ex: 'along' });
    conferir(!a.html().includes('data-metro'), 'alongamento não tem metrônomo');
    const b = criarAparelho({ armazenamento: a.armazenamento });
    b.abrirSegunda('musica'); b.clicar({ ex: 'crom' });
    conferir(b.html().includes('70 bpm'), 'lembrado depois de reabrir');
  },

  'anotação do exercício grava e reaparece': () => {
    const a = noCromatico();
    a.alterar({ f: 'exNota' }, 'dedo 4 fraco');
    a.clicar({ back: '1' }); a.clicar({ ex: 'crom' });
    conferir(a.html().includes('dedo 4 fraco'), 'nota');
  },

  'botão voltar do Android volta uma tela por vez': async () => {
    const a = criarAparelho();
    a.clicar({ config: '1' }); a.clicar({ toggle: 'diaAtual' }); a.clicar({ back: '1' }); await esperar(10);
    a.clicar({ cat: 'musica' }); a.clicar({ dia: '1' }); a.clicar({ ex: 'crom' });
    a.voltarDoAndroid(); conferir(a.x.state.tela === 'rotina', '1: ' + a.x.state.tela);
    a.voltarDoAndroid(); conferir(a.x.state.tela === 'semana', '2: ' + a.x.state.tela);
    a.voltarDoAndroid(); conferir(a.x.state.tela === 'inicio', '3: ' + a.x.state.tela);
  },

  'fora do início existe exatamente uma entrada extra no histórico': async () => {
    const a = criarAparelho();
    a.abrirSegunda('musica'); a.clicar({ ex: 'crom' }); a.clicar({ feito: '1' });
    conferir(a.historico.tamanho === 1, 'empilhou: ' + a.historico.tamanho);
    a.clicar({ back: '1' }); a.clicar({ back: '1' }); if (a.x.state.tela !== 'inicio') a.clicar({ back: '1' });
    await esperar(10);
    conferir(a.x.state.tela === 'inicio' && a.historico.tamanho === 0, 'sobrou: ' + a.historico.tamanho);
  },

  'texto maior aplica o zoom': () => {
    const a = criarAparelho();
    a.clicar({ config: '1' }); a.clicar({ toggle: 'textoGrande' });
    conferir(a.zoom() === '1.15', 'zoom: ' + a.zoom());
  },

  'vídeo do YouTube cadastrado toca dentro do app': () => {
    const a = noCromatico();
    conferir(a.html().includes('youtube.com/results'), 'sem link, o botão busca');
    a.clicar({ edite: 'crom' }); a.alterar({ f: 'exVideo' }, 'https://youtu.be/dQw4w9WgXcQ'); a.clicar({ back: '1' });
    a.clicar({ player: '1' });
    conferir(a.html().includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'player');
  },
};
