# Arquitetura de Trilha Seletiva

A versão usa Phaser 3.90.0, Vite 6.4.6 e Vitest 4.1.12. A aplicação separa regras determinísticas e recursos do navegador. A cena Phaser apresenta movimento e recebe entrada; o domínio decide se uma classificação é correta. A interface coordena telas e transforma resultados em progresso salvo. Essa separação permite testar pontuação, precisão e persistência sem renderizar o jogo.

## Dados e configuração

`src/data/catalog.js` exporta `CATALOG`, com 27 objetos identificados por ID, nome, categoria, dica e indicadores de item confundível e preparação. O campo `needsPrep` no catálogo indica capacidade; o lote concretiza quando a preparação é exigida. Categorias internas são `paper`, `plastic`, `glass`, `metal` e `reject`.

`src/config/levels.js` exporta `LEVELS`, com quantidade, velocidade em px/s, intervalo em segundos, tempo, meta e categorias de cada fase. `BINS` fornece nome, cor e símbolo. `src/config/rules.js` concentra pontuação, multiplicador, penalidade, bônus e limiares de estrelas. A cena deve usar os mesmos parâmetros do domínio.

## Domínio

`Session` em `src/systems/session.js` recebe uma configuração e um lote. Cada posição do lote tem uma identidade numérica `uid`; o catálogo não serve como identidade da ocorrência porque o mesmo objeto pode aparecer mais de uma vez.

- `tick(dt)` avança segundos de simulação quando a tentativa está ativa. Pausa e estado terminal impedem alteração.
- `resolve(uid, item, choice, decisionSeconds, prepared)` consulta o objeto confiável do lote, verifica destino e preparação, aplica pontos e registra uma resolução única.
- `miss(uid, item)` registra perda, quebra a sequência e aplica a penalidade de tempo.
- `canResolve(uid)` impede índices inválidos, eventos repetidos e ações após o fim ou durante a pausa.
- `checkEnd()` decide se o lote ou o relógio encerraram a tentativa.
- `finish(reason)` registra como perdas todas as ocorrências restantes e gera exatamente um resultado.
- `buildDeck(catalog, level, history, review)` monta o lote com distribuição previsível por categoria e exemplos. Na revisão prioriza os itens cuja decisão mais recente ainda foi errada ou perdida; frequência histórica desempata. Um acerto posterior reduz a prioridade do item para abrir espaço a outras dificuldades. Isso não representa comprovação de aprendizagem.

A precisão é `correct / deck.length`, com valor zero para lote vazio. `finish` não recalcula uma segunda conclusão quando chamado novamente. O resultado inclui nível, revisão, data, motivo, aprovação, precisão, estrelas, pontos, acertos, erros, perdas, total, duração ativa, tempo médio de decisão, erros por minuto, erros por categoria e objeto, matriz de classificações e acertos em confundíveis. O tempo de decisão é medido pela integração de jogo; o domínio apenas agrega os valores recebidos.

## Persistência e exportação

`src/systems/storage.js` usa a chave `trilha-seletiva-v1` do `localStorage`. `loadProgress` lê e valida o histórico e reconstrói estrelas e desbloqueio a partir das tentativas aceitas. `saveAttempt` não grava abandono e não concede desbloqueio por revisão. São mantidas as últimas 500 tentativas.

`saveSettings` grava som e volume limitando o volume ao intervalo de zero a um. `resetProgress` substitui os dados por um estado inicial. Em falha de leitura ou escrita, a aplicação continua em memória e retorna um aviso; não há garantia de persistência após fechar o navegador nessa condição.

`exportCSV` produz texto UTF-8 com BOM, separador ponto e vírgula e campos entre aspas, incluindo objetos de métricas em JSON nas respectivas células. A interface cria o arquivo para download. O arquivo contém dados de desempenho e datas; não exige nome do jogador.

## Apresentação

`src/ui/art.js` exporta `itemSVG`, `ecoSVG` e `svgURL`. As ilustrações são SVGs criados no projeto e usados localmente. Não há chamada a um gerador de imagens em tempo de execução.

`src/scenes/FactoryScene.js` integra a sessão com desenho, animação, entrada, seleção, posição e descarte. `src/main.js` integra as telas em HTML, as configurações e o resultado. As funções `menu`, `map`, `help`, `start`, `finish`, `stats`, `settings` e `credits` compõem as telas; `pause` e `resume` coordenam a simulação; `tone` sintetiza os efeitos sonoros e `actions` associa botões às operações. A seção 13 do GDD relaciona as funções verificadas. `preload` carrega os SVGs; `create` instala eventos; `start` prepara destinos e sessão; `spawn` cria uma ocorrência; `prepare` marca retirada de restos; `classify` consulta o domínio e anima o descarte; `update` move a esteira por delta e contabiliza saídas; `checkEnd` comunica o resultado. O percurso lógico usa canvas de 1280 × 720 e no máximo seis objetos ativos.

## Fluxo

Início permite abrir instruções, começar ou retomar. O mapa mostra cinco fases e o estado salvo. Iniciar cria uma sessão nova; pausar suspende a simulação; retomar a reativa. Terminar entrega um resultado para a interface, que salva a tentativa e mostra ações de repetição e progressão. Abandonar retorna ao mapa sem fabricar um resultado aprovado. Revisão cria uma tentativa sem cronômetro e não libera níveis.

## Verificação

Os testes de domínio usam Vitest e exemplos controlados. Verificações visuais e de produção cobrem a integração que o domínio isolado não consegue garantir, como soltura sobre lixeira, áudio, responsividade e download. O relatório em `TESTES.md` deve informar o que ocorreu, sem apresentar plano de teste como execução realizada.
