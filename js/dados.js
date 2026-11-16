// Dados de exemplo usados na primeira vez (rotina de guitarra). Depois valem os dados salvos.

/* ---------- DADOS (espelham as tabelas do banco) ---------- */
const categorias = [
  { id: 'musica', nome: 'Música' },
  { id: 'musculacao', nome: 'Musculação' }
];

const JANELAS = { 1:[5,8], 2:[7,10], 3:[9,13], 4:[12,15], 5:[14,17] }; // casas de cada shape em Lá menor
const yt = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

const exercicios = {
  along: { nome:'Alongamento de mãos e punhos', min:2, fig:null,
    passos:['Abra e feche as mãos devagar, 10 vezes.','Estenda um braço à frente, palma para cima, e puxe os dedos para baixo com a outra mão por 15 segundos. Troque de lado.','Gire os punhos 10 vezes para cada lado.','Nada aqui deve doer. Se doer, alivie.'],
    busca:'alongamento mãos punhos guitarrista' },
  crom: { nome:'Cromático 1-2-3-4', min:5, bpm:'60 bpm', fig:{tipo:'tab', seg:'5-6-7-8-'},
    passos:['Um dedo por casa: indicador na 5, médio na 6, anelar na 7, mínimo na 8.','Comece na 6ª corda (a mais grave) e suba corda por corda. Depois volte.','Palhetada alternada: uma para baixo, uma para cima.','Uma nota por clique do metrônomo. Som limpo vale mais que velocidade.'],
    busca:'exercício cromático 1234 guitarra iniciante' },
  lig: { nome:'Ligados: hammer-on e pull-off', min:3, bpm:'60 bpm', fig:{tipo:'tab', seg:'5h7p5-'},
    passos:['Palhete só a primeira nota (casa 5).','Martele o anelar na casa 7 sem palhetar (hammer-on).','Puxe o anelar para soar a casa 5 de novo (pull-off).','Repita 4 vezes em cada corda, da mais grave à mais aguda.'],
    busca:'hammer on pull off guitarra exercício' },
  umacorda: { nome:'Pentatônica em uma corda só', min:5, bpm:'60 bpm', fig:{tipo:'braco', lo:5, hi:17},
    passos:['Escolha uma corda e toque só as notas marcadas nela, da casa 5 até a 17.','Volte descendo pelas mesmas notas.','Repita em cada uma das 6 cordas.','Isso ensina o caminho horizontal entre os shapes.'],
    busca:'pentatônica em uma corda guitarra' },
  todos: { nome:'Os 5 shapes em sequência', min:10, bpm:'60–80 bpm', fig:{tipo:'braco', lo:5, hi:17},
    passos:['Suba o shape 1 (casas 5–8) e desça pelo shape 2 (casas 7–10).','Suba o shape 3 e desça pelo 4. Suba o 5.','Volte o caminho inteiro até o shape 1.','Sem parar entre um shape e outro.'],
    busca:'5 shapes pentatônica menor ao longo do braço' },
  improvtotal: { nome:'Improviso pelo braço inteiro', min:10, fig:{tipo:'braco', lo:5, hi:17},
    passos:['Coloque uma backing track em Lá menor.','Comece no shape 1 e mude de região a cada 4 compassos.','Termine as frases nas notas amarelas (Lá): é onde a frase soa resolvida.'],
    busca:'backing track A minor blues', rotulo:'Buscar backing track no YouTube' },
  tonicas1: { nome:'Shape 1: achar as tônicas', min:5, fig:{tipo:'braco', lo:5, hi:8},
    passos:['Toque só as notas amarelas (Lá) do shape, da grave à aguda.','Diga "Lá" em voz alta a cada nota.','Depois toque o shape inteiro parando 2 tempos em cada Lá.'],
    busca:'tônicas pentatônica menor shape 1' }
};

for (let n = 1; n <= 5; n++) {
  const [lo, hi] = JANELAS[n];
  exercicios['sobe'+n] = { nome:`Shape ${n}: subir e descer`, min:8, bpm:'60–80 bpm', fig:{tipo:'braco', lo, hi},
    passos:[`Região das casas ${lo} a ${hi}. Comece na 6ª corda (linha de baixo do diagrama).`,'Toque as duas notas de cada corda, da mais grave à mais aguda, e volte.','Palhetada alternada, uma nota por clique.','Acertou 4 vezes seguidas sem erro? Suba o metrônomo 5 bpm.'],
    busca:`pentatônica menor shape ${n} guitarra` };
  exercicios['seq'+n] = { nome:`Shape ${n}: grupos de 3 notas`, min:5, bpm:'60 bpm', fig:{tipo:'braco', lo, hi},
    passos:['Numere as notas do shape da mais grave à mais aguda: 1, 2, 3, 4…','Toque 1-2-3, depois 2-3-4, depois 3-4-5, até o fim.','Na volta, faça o mesmo descendo.','O objetivo é sair do sobe-e-desce automático.'],
    busca:'pentatônica sequência de 3 notas guitarra' };
  exercicios['improv'+n] = { nome:`Improviso em Lá menor no shape ${n}`, min:5, fig:{tipo:'braco', lo, hi},
    passos:['Coloque uma backing track em Lá menor.','Use só as notas deste shape.','Faça frases curtas, de 3 a 5 notas, e deixe pausas.','Termine as frases nas notas amarelas (Lá).'],
    busca:'backing track A minor blues', rotulo:'Buscar backing track no YouTube' };
  if (n > 1) {
    const plo = JANELAS[n-1][0];
    exercicios['con'+n] = { nome:`Conexão: shape ${n-1} com shape ${n}`, min:5, bpm:'60 bpm', fig:{tipo:'braco', lo:plo, hi},
      passos:[`Suba o shape ${n-1} e, na corda mais aguda, deslize para o shape ${n}.`,`Desça o shape ${n} e, na corda mais grave, deslize de volta para o ${n-1}.`,'Repare nas notas que os dois shapes dividem: são a ponte entre eles.'],
      busca:`conectar shapes pentatônica ${n-1} e ${n}` };
  }
}

const rotinas = {
  g1:{ categoria:'musica', nome:'Shape 1, a base', resumo:'O desenho mais usado da pentatônica, nas casas 5 a 8.' },
  g2:{ categoria:'musica', nome:'Shape 2', resumo:'Casas 7 a 10, ligado ao shape de ontem.' },
  g3:{ categoria:'musica', nome:'Shape 3', resumo:'Casas 9 a 13, o que mais abre a mão.' },
  g4:{ categoria:'musica', nome:'Shape 4', resumo:'Casas 12 a 15, uma oitava acima das cordas soltas.' },
  g5:{ categoria:'musica', nome:'Shape 5', resumo:'Casas 14 a 17, o último antes de repetir o shape 1.' },
  g6:{ categoria:'musica', nome:'Braço inteiro', resumo:'Junta os cinco shapes e termina com improviso.' }
};
const aquec = ['along','crom','lig'];
const rotina_exercicios = {
  g1:[...aquec,'sobe1','seq1','tonicas1','improv1'],
  g2:[...aquec,'sobe2','seq2','con2','improv2'],
  g3:[...aquec,'sobe3','seq3','con3','improv3'],
  g4:[...aquec,'sobe4','seq4','con4','improv4'],
  g5:[...aquec,'sobe5','seq5','con5','improv5'],
  g6:[...aquec,'todos','umacorda','improvtotal']
};
for (const id in exercicios) {
  exercicios[id].cat = 'musica';
  exercicios[id].fase = aquec.includes(id) ? 'Aquecimento' : id.startsWith('improv') ? 'Improviso' : 'Prática';
}
// agenda: dia da semana (0 = domingo) -> rotina
const agenda = { musica:{1:'g1',2:'g2',3:'g3',4:'g4',5:'g5',6:'g6',0:null}, musculacao:{} };
