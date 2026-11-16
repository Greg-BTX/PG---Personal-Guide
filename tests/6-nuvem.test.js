const { criarAparelho, esperar, conferir } = require('./aparelho');
const { criarServidor } = require('./servidor');

// aparelho que já entrou na conta (voltou pelo link do e-mail ou do Google)
const logado = async (servidor, armazenamento) => { const a = criarAparelho({ hash: servidor.retorno(), servidor, armazenamento }); await esperar(60); return a; };

module.exports = {
  'sem login, o app não faz nenhuma chamada à rede': async () => {
    const s = criarServidor(), a = criarAparelho({ servidor: s });
    a.abrirSegunda('musica'); a.clicar({ check: 'along' });
    await esperar(60);
    conferir(s.chamadas.length === 0, 'chamou: ' + s.chamadas);
  },

  'pedir o link por e-mail': async () => {
    const s = criarServidor(), a = criarAparelho({ servidor: s });
    a.clicar({ config: '1' });
    a.campo('nuvemEmail').value = 'sem-arroba'; a.clicar({ entrar: '1' });
    conferir(a.x.state.aviso.includes('e-mail válido'), 'validação');
    a.campo('nuvemEmail').value = 'teste@exemplo.com'; a.clicar({ entrar: '1' });
    await esperar(60);
    conferir(a.texto().includes('Link enviado para teste@exemplo.com'), a.texto());
  },

  'botão do Google só aparece quando o servidor diz que está ativo': async () => {
    const off = criarAparelho({ servidor: criarServidor({ google: false }) });
    off.clicar({ config: '1' }); await esperar(60);
    conferir(!off.html().includes('provider=google'), 'não devia aparecer');
    const on = criarAparelho({ servidor: criarServidor({ google: true }) });
    on.clicar({ config: '1' }); await esperar(60);
    conferir(on.html().includes('authorize?provider=google&redirect_to=https%3A%2F%2Fexemplo.github.io%2Fapp%2F'), 'devia aparecer');
  },

  'voltar pelo link cria a sessão e faz o primeiro envio': async () => {
    const s = criarServidor(), a = await logado(s);
    conferir(a.x.sessao && a.x.sessao.email === 'teste@exemplo.com', 'sessão');
    conferir(a.x.state.tela === 'config' && a.texto().includes('Conectado como teste@exemplo.com'), a.texto());
    conferir(s.linha && s.linha.dados.categorias.length === 2 && s.linha.alterado > 0, 'primeiro envio');
  },

  'link expirado avisa e não cria sessão': async () => {
    const a = criarAparelho({ hash: '#error=access_denied&error_description=expired', servidor: criarServidor() });
    conferir(!a.x.sessao && a.x.state.aviso.includes('expirou'), a.x.state.aviso);
  },

  'cada alteração sobe sozinha depois de alguns segundos': async () => {
    const s = criarServidor(), a = await logado(s);
    a.clicar({ back: '1' }); a.clicar({ modoedit: '1' }); a.clicar({ novacat: '1' }); a.alterar({ f: 'catNome' }, 'Piano');
    await esperar(2800);
    conferir(s.linha.dados.categorias.some(c => c.nome === 'Piano'), 'não subiu');
  },

  'aparelho novo na mesma conta recebe os dados e não regrava à toa': async () => {
    const s = criarServidor(), a = await logado(s);
    a.clicar({ back: '1' }); a.clicar({ modoedit: '1' }); a.clicar({ novacat: '1' }); a.alterar({ f: 'catNome' }, 'Piano');
    await a.x.sincronizar();
    const b = await logado(s);
    conferir(b.x.categorias.some(c => c.nome === 'Piano'), 'não recebeu');
    conferir(b.x.meta.alterado === s.linha.alterado, 'relógio');
    const antes = s.gravacoes(); await b.x.sincronizar();
    conferir(s.gravacoes() === antes, 'regravou sem mudança');
  },

  'aparelho que já tinha dados pergunta quais manter (nunca decide sozinho)': async () => {
    for (const escolha of ['local', 'nuvem']) {
      const s = criarServidor(); await logado(s);                       // a conta já tem dados na nuvem
      const c = criarAparelho(); c.clicar({ modoedit: '1' }); c.clicar({ novacat: '1' }); c.alterar({ f: 'catNome' }, 'Só no celular');
      const c2 = await logado(s, c.armazenamento);
      conferir(c2.texto().includes('Quais dados manter?'), 'devia perguntar');
      conferir(c2.x.categorias.length === 3 && s.linha.dados.categorias.length === 2, 'nada pode mudar antes da escolha');
      c2.clicar({ resolver: escolha }); await esperar(60);
      if (escolha === 'local') conferir(s.linha.dados.categorias.some(x => x.nome === 'Só no celular'), 'o aparelho devia subir');
      else conferir(c2.x.categorias.length === 2, 'a nuvem devia descer');
      conferir(!c2.texto().includes('Quais dados manter?') && c2.texto().includes('Sincronizado'), c2.texto());
    }
  },

  'sem internet, guarda no aparelho e avisa': async () => {
    const s = criarServidor(), a = await logado(s);
    const off = criarAparelho({ servidor: s, armazenamento: a.armazenamento, online: false });
    const antes = s.chamadas.length;
    await off.x.sincronizar();
    conferir(s.chamadas.length === antes && off.x.nuvem.status.includes('Sem internet'), off.x.nuvem.status);
  },

  'sair encerra a sessão e mantém os dados no aparelho': async () => {
    const s = criarServidor(), a = await logado(s);
    a.clicar({ sair: '1' });
    conferir(!a.x.sessao && a.texto().includes('Enviar link de acesso'), a.texto());
    conferir(a.x.categorias.length === 2, 'dados');
  },
};
