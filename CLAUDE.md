# Prática Guiada: instruções para quem for mexer no código

Web app instalável (PWA) de rotinas guiadas de música e musculação. Sem framework e sem
etapa de build: HTML, CSS e JavaScript puros, servidos pelo GitHub Pages a partir da branch `main`.
O dono do projeto não é programador; explique as mudanças em português, sem jargão.

Leia `docs/ARQUITETURA.md` antes de alterar dados, sincronização ou navegação.

## Antes de publicar qualquer mudança

1. `npm test` (ou `node tests/rodar.js`). Tudo precisa passar. Não há dependências a instalar.
2. Mudou comportamento? Acrescente ou ajuste um teste em `tests/`.
3. Aumente o número em `CACHE` no `sw.js` (`pratica-guiada-vN`). Sem isso, aparelhos podem ficar na versão antiga.
4. Criou arquivo novo em `js/` ou `css/`? Inclua no `index.html` e na lista `BASE` do `sw.js`.
5. Publicar é dar push na `main`. O site atualiza em um ou dois minutos.

## Regras que não podem ser quebradas

- **Nunca perder dados do usuário.** Qualquer mudança no formato do que é salvo precisa ler o formato antigo.
- **Nunca decidir sozinho entre dados locais e da nuvem** no primeiro login de um aparelho: o app pergunta (ver "Sincronização" na arquitetura).
- **Todo texto vindo do usuário passa por `esc()`** antes de entrar no HTML.
- **Nenhum segredo no repositório**, que é público. A chave em `js/nuvem.js` é a chave publicável do Supabase e pode ficar; a chave secreta do Google e a `service_role` do Supabase, nunca.
- **Interface mínima.** Uma decisão por tela; informação nova entra só quando a pessoa avança. Tema escuro quente, sem azul e sem branco puro.
- **Funciona offline.** Nada essencial pode depender da rede.

## Onde fica cada coisa

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Só a casca: carrega o CSS e os scripts, nesta ordem. |
| `css/app.css` | Todos os estilos. Cores e fontes nas variáveis do `:root`. |
| `js/dados.js` | Dados de exemplo (rotina de guitarra) usados na primeira vez. |
| `js/estado.js` | Armazenamento local, estado da navegação, funções de apoio. |
| `js/diagramas.js` | Desenho do braço da guitarra e das tablaturas. |
| `js/telas.js` | `render()`: monta o HTML de cada tela. |
| `js/treino.js` | Cronômetro, metrônomo, séries, histórico, tela ligada, navegação (`ir`). |
| `js/acoes.js` | Toques e campos alterados. Toda mudança de dados acontece aqui. |
| `js/nuvem.js` | Login, sincronização com o Supabase e a partida do app. |
| `sw.js` | Cache para uso offline. |
| `tests/` | Testes automáticos, que simulam um aparelho sem navegador. |

Os scripts são clássicos (não módulos) e compartilham o mesmo escopo global, por isso a ordem no `index.html` importa.
