# Arquitetura do Prática Guiada

## Visão geral

- **Onde roda:** no navegador do celular, instalado como PWA. Endereço: https://greg-btx.github.io/PG---Personal-Guide/
- **Onde os dados moram:** primeiro no aparelho (`localStorage`); com login, uma cópia vai para o Supabase.
- **Como a tela funciona:** existe um objeto `state` com a tela atual. `render()` lê o estado e reescreve o HTML inteiro
  de `#app`. Um toque altera dados ou estado (em `js/acoes.js`) e chama `render()` de novo.

## Modelo de dados

Cinco estruturas, pensadas como tabelas:

| Estrutura | O que guarda |
|---|---|
| `categorias` | Lista de `{ id, nome }`. Música e Musculação vêm de fábrica. |
| `exercicios` | Por id: `nome`, `min`, `bpm` (campo "Detalhe", texto livre), `passos[]`, `cat`, `fase`, `video`, `imagem`, `nota`, `series`, `descanso`, `bpmUlt`, `fig` (diagrama). |
| `rotinas` | Por id: `{ categoria, nome }`. |
| `rotina_exercicios` | Por id de rotina: lista ordenada de ids de exercício. |
| `agenda` | Por categoria: dia da semana (0 = domingo) → id da rotina, ou `null` para dia livre. |

Derivados do campo "Detalhe" (`bpm`), sem campo próprio:

- `60 bpm` ou `60–80 bpm` liga o metrônomo, começando no primeiro número.
- `3x12` vira 3 séries com 12 repetições sugeridas. O campo `series`, se preenchido, tem prioridade.

## O que fica salvo no aparelho

| Chave | Conteúdo |
|---|---|
| `pg-dados-v1` | As cinco estruturas acima. Só existe depois da primeira edição; antes disso vale o exemplo de `js/dados.js`. |
| `pg-feitos-v2` | `feitos[data][rotina] = [ids]`. Exercícios concluídos, por data (`AAAA-MM-DD`). |
| `pg-log-v1` | `log[exercicio][data] = [{ c, r, ok }]`. Carga, repetições e se a série foi feita. |
| `pg-config-v1` | `diaAtual`, `telaLigada`, `textoGrande`. Não vai para a nuvem: é preferência do aparelho. |
| `pg-sessao` | Sessão do Supabase (tokens, e-mail). |
| `pg-sync` | `alterado` (hora da última mudança local, em ms) e `vinculado` (este aparelho já sincronizou com esta conta). |

Fotos são reduzidas para no máximo 900 px e guardadas como texto (data URL) dentro do exercício.

## Navegação

Telas: `inicio`, `config`, `historico`, `semana`, `rotina`, `exercicio`, `gerir`, `editRotina`, `editEx`.

- `ir(tela)` troca de tela. `alvoVoltar()` diz para onde o voltar leva.
- **Botão voltar do Android:** enquanto o app não está no Início, mantém-se exatamente uma entrada extra no histórico
  do navegador. O evento `popstate` executa o voltar lógico e rearma a entrada. Por isso `ir()` não empilha uma
  entrada por tela.
- **Atualização parcial:** cronômetro, metrônomo e séries atualizam só o seu pedaço (`#tools`, `#sets`), sem `render()`,
  para não reiniciar um vídeo que esteja tocando.

## Sincronização

Banco: projeto Supabase `grlayxznjcxsuwzdlhcx`. Tabela `public.user_data`, uma linha por usuário:
`user_id`, `dados`, `feitos`, `log` (os três em `jsonb`), `alterado` (`bigint`), `updated_at`.
A segurança por linha (RLS) só deixa cada usuário ler e gravar a própria linha.

O app fala com o Supabase por `fetch` direto, sem biblioteca:

- Login por e-mail: `POST /auth/v1/otp`. Login com Google: link para `/auth/v1/authorize?provider=google`.
- Nos dois casos o usuário volta ao app com os tokens depois do `#` no endereço; `lerRetorno()` cria a sessão.
- Dados: `GET` e `POST` (upsert) em `/rest/v1/user_data`.

Regras, nesta ordem:

1. **Primeiro contato de um aparelho com uma conta, havendo dados dos dois lados:** o app para e pergunta
   "Quais dados manter?". Nunca escolhe sozinho.
2. **Depois disso, vale o lado alterado por último, inteiro.** Compara-se `alterado` da nuvem com o local.
   Nuvem mais nova substitui o local (com aviso e "Desfazer"); local mais novo sobe.
3. Toda gravação local chama `tocou()`, que marca a hora e agenda um envio para 2,5 segundos depois.
4. Sincroniza também ao abrir, ao voltar a ter internet e ao voltar para o app.

## Limitações conhecidas

- **Conflito entre dois aparelhos editando offline:** o que sincronizar por último vence e o outro perde as alterações.
- **Fotos dentro do bloco de dados:** cada sincronização reenvia todas. Muitas fotos deixam o envio pesado e podem
  estourar o espaço do `localStorage`.
- **Sem versão de formato:** não há número de versão nos dados salvos.
- **E-mails de login:** o serviço embutido do Supabase envia poucos por hora.
- **Cronômetro com a tela bloqueada:** o aviso pode não tocar.

## Próximos passos sugeridos, por ordem de risco

1. **Versão do formato.** Gravar `versao` junto dos dados e ter uma função de migração. Pré-requisito dos itens abaixo.
2. **Mesclagem por registro.** Trocar "vale o último, inteiro" por comparar exercício a exercício, rotina a rotina,
   com data de alteração em cada um. Exige cuidado com exclusões (guardar "lápides").
3. **Fotos no Storage do Supabase.** Guardar no exercício só o endereço da foto, com cópia local para uso offline.
4. **Abrir para outras pessoas.** Serviço de e-mail próprio, exclusão de conta, limites de uso.

## Testes

`npm test` roda `tests/rodar.js`, sem dependências.

- `tests/aparelho.js` cria um aparelho simulado: carrega os mesmos scripts do `index.html`, na mesma ordem,
  com um DOM mínimo de mentira. `clicar({ ... })` imita um toque num botão com aqueles atributos `data-`;
  `alterar({ ... }, valor)` imita sair de um campo.
- `tests/servidor.js` é um Supabase de mentira, com uma linha na memória.
- `PG_DESLOCAR_DIAS=3 npm test` roda como se hoje fosse daqui a 3 dias. Os testes precisam passar em qualquer dia da semana.

O que os testes não cobrem, e precisa de conferência no celular: aparência das telas, som, vibração,
tela ligada, escolha de foto, instalação e uso offline de verdade, e o login real por e-mail e Google.
