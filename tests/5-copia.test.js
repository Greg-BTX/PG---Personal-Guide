const { criarAparelho, conferir } = require('./aparelho');

module.exports = {
  'exportar gera um arquivo com cadastros, histórico e séries': () => {
    const a = criarAparelho();
    a.abrirSegunda('musica'); a.clicar({ check: 'along' });
    a.clicar({ back: '1' }); if (a.x.state.tela !== 'inicio') a.clicar({ back: '1' });
    a.clicar({ config: '1' }); a.clicar({ exportar: '1' });
    const o = JSON.parse(a.baixados[0]);
    conferir(o.app === 'pratica-guiada' && o.dados.categorias.length === 2, 'dados');
    conferir(Object.keys(o.feitos).length === 1 && 'log' in o, 'histórico e séries');
  },

  'importar restaura o que foi apagado e pode ser desfeito': () => {
    const a = criarAparelho();
    a.clicar({ config: '1' }); a.clicar({ exportar: '1' });
    const arquivo = a.baixados[0];
    a.clicar({ back: '1' }); a.clicar({ modoedit: '1' }); a.clicar({ cat: 'musica' });
    a.clicar({ delitem: 'rot:g2' }); a.clicar({ delitem: 'rot:g2' });
    conferir(!a.x.rotinas.g2, 'apagou');
    a.alterar({}, '', { id: 'impArq', files: [{ texto: arquivo }] });
    conferir(a.x.rotinas.g2, 'importou');
    a.clicar({ undo: '1' });
    conferir(!a.x.rotinas.g2, 'desfez a importação');
  },

  'arquivo que não é do app é recusado sem mexer nos dados': () => {
    const a = criarAparelho();
    a.clicar({ config: '1' });
    a.alterar({}, '', { id: 'impArq', files: [{ texto: '{"x":1}' }] });
    conferir(a.x.state.aviso.includes('não é uma cópia') && a.x.categorias.length === 2, a.x.state.aviso);
    a.alterar({}, '', { id: 'impArq', files: [{ texto: 'isto não é json' }] });
    conferir(a.x.categorias.length === 2, 'dados intactos');
  },
};
