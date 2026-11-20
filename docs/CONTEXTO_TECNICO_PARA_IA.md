# Trilha Seletiva 3.3 — contexto técnico para continuidade por outra IA

Este arquivo é um guia de transferência de contexto, não substitui o código, os testes ou o GDD. Foi preparado para que outra pessoa ou IA consiga localizar as regras, entender o fluxo e continuar o desenvolvimento sem confundir funcionalidades implementadas com validações ainda pendentes.

## Instruções para quem assumir o projeto

1. Leia este documento e o DOCX `GDD-Trilha-Seletiva-3.3.docx`, se estiver acessível em `/home/mizael-marques/Downloads/GDD-Trilha-Seletiva-3.3.docx`. Ele é a especificação acadêmica consolidada mais recente que foi fornecida.
2. Leia o código relacionado antes de alterar uma regra. Para regras de domínio, os módulos em `src/systems/` e `src/config/` são a autoridade da implementação.
3. Faça mudanças cirúrgicas. Preserve os dois modos e o isolamento entre a campanha e o Desafio Infinito. Não altere regras acadêmicas, balanceamento, catálogo, persistência ou experiência sem que a solicitação peça isso.
4. Atualize a documentação diretamente afetada. O `docs/GDD.md` incluído no projeto é uma versão anterior (3.1), enquanto o DOCX fornecido consolida a 3.3; não trate esses documentos como equivalentes.
5. Não apresente testes, testes com pessoas, validação em aparelhos ou publicação como feitos sem executá-los e confirmar seus resultados. O GDD registra evidências históricas da versão 3.3, não uma execução feita nesta tarefa.
6. Rode os testes e o build pertinentes à alteração. Os comandos definidos pelo projeto são `npm test` e `npm run build`.

## Identidade e objetivo

**Trilha Seletiva — Missão Reciclagem** é um serious game educativo 2D para navegador. O jogador trabalha numa central de triagem fictícia com Eco, um robô instrutor, e encaminha resíduos que chegam por uma esteira às categorias papel, plástico, vidro, metal ou rejeito.

O público imaginado é composto por estudantes a partir de aproximadamente 12 anos e moradores iniciantes em coleta seletiva. Esse perfil é uma hipótese de projeto, não resultado de pesquisa de público. O jogo ensina uma convenção pedagógica simplificada: regras municipais variam, e as dicas orientam a consultar a coleta local em casos especiais. Retirar restos não significa lavar toda embalagem.

O jogo tem dois modos independentes:

- **Campanha educativa:** cinco fases sequenciais, tutorial, revisão orientada pelos erros, histórico e estatísticas.
- **Desafio Infinito:** modo arcade disponível desde o início, com vidas, ondas, recordes e ranking local.

Não há conta, backend, banco remoto, sincronização entre aparelhos, ranking online, anúncios, compras ou envio automático de métricas. Progresso e preferências são armazenados no navegador e na origem/site onde a aplicação está aberta.

## Tecnologias, execução e publicação

- JavaScript ES Modules, Phaser 3.90.0, Vite 6.4.6 e Vitest 4.1.12.
- Dependências fixadas em `package.json` e `package-lock.json`; o projeto declara Node.js 20.19+ ou 22.12+.
- `npm install`: instala dependências.
- `npm run dev`: inicia Vite em `127.0.0.1`; abrir o endereço que o Vite imprimir. Não abrir `index.html` por duplo clique.
- `npm test`: executa Vitest uma vez.
- `npm run build`: gera `dist/`.
- `npm run preview`: serve a distribuição local em `127.0.0.1`.
- `npm run audio:generate`: recria o manifesto e os 21 WAVs locais por síntese no Node, sem baixar samples.
- `vite.config.js` usa `/Trilha-seletiva/` quando `GITHUB_PAGES=true` e `./` em build normal.
- `.github/workflows/deploy.yml` executa `npm ci`, testes, build para GitHub Pages, upload do artefato e deploy após push em `main` ou execução manual.
- URL documentada: `https://amaralcharle.github.io/Trilha-seletiva/`.

A especificação DOCX informa que a publicação 3.3 foi confirmada e registra um commit e uma execução do GitHub Actions. Esses dados são histórico do GDD e devem ser reconfirmados antes de qualquer nova declaração de publicação.

## Árvore e responsabilidade dos arquivos

### Raiz

| Caminho | Responsabilidade |
|---|---|
| `index.html` | Documento HTML em pt-BR; elementos-base `#game`, `#ui`, aviso de orientação e toast; carrega `src/main.js`. |
| `package.json` | Scripts e versões de runtime/dev. |
| `package-lock.json` | Lockfile npm. |
| `vite.config.js` | Base relativa para desenvolvimento/build comum e subcaminho do GitHub Pages. |
| `.github/workflows/deploy.yml` | Pipeline de teste, build e deploy Pages. |
| `.openai/hosting.json` | Configuração de hosting do projeto. |
| `.gitattributes`, `.gitignore` | Regras Git locais. |
| `tools/generate-audio.mjs` | Geração reproduzível dos arquivos de áudio originais. |

### Aplicação (`src/`)

| Caminho | Responsabilidade |
|---|---|
| `src/main.js` | Orquestra Phaser, telas HTML, sessões, ações, pausa, áudio, persistência, fluxo de resultado e layout responsivo. É o ponto de entrada e integra os sistemas. |
| `src/styles.css` | Identidade visual, componentes HTML, layouts de telas, HUD, telas compactas, breakpoints, safe areas e respeito a `prefers-reduced-motion`. |
| `src/config/levels.js` | Configuração das cinco fases e metadados visuais das categorias (`BINS`). |
| `src/config/rules.js` | Valores compartilhados de pontuação, penalidade, bônus e estrelas. |
| `src/config/infinite.js` | Constantes, tabela de ondas, nomes de dificuldade e cálculo de dificuldade do arcade. |
| `src/data/catalog.js` | Catálogo de 27 resíduos, categorias, dicas, marca `tricky` e capacidade `needsPrep`; também expõe `CATALOG_BY_ID` e aviso educativo. |
| `src/data/audioManifest.js` | Chaves e caminhos locais dos sons e função de preload. |
| `src/entities/FactoryEnvironment.js` | Camadas e animações ambientais da fábrica, cidade, engrenagens, luzes e Eco do menu. |
| `src/scenes/FactoryScene.js` | Cena Phaser: renderização, objetos, esteira, lixeiras, drag-and-drop, teclado, preparação, efeitos, perdas e simulação. |
| `src/systems/classification.js` | Regra comum aos modos: categoria correta e preparação obrigatória. |
| `src/systems/session.js` | Domínio da campanha/revisão/tutorial, pontuação, timer, precisão, resultado e montagem de deck. |
| `src/systems/sequence.js` | Aleatoriedade com sementes, Fisher–Yates, restrições de ordem e gerador contínuo limitado do arcade. |
| `src/systems/infiniteSession.js` | Domínio do arcade: itens pendentes, vidas, pontuação, combo, ondas, precisão e fim. |
| `src/systems/storage.js` | Progresso, histórico, configurações e CSV no `localStorage` da campanha. |
| `src/systems/leaderboard.js` | Validação, unicidade de apelidos, ordenação e persistência do top 10 local em `trilha-seletiva-infinite-v1`, separado da campanha. |
| `src/systems/AudioManager.js` | Reprodução Phaser, volumes, silêncio, fades, pausa, efeitos, fila de troca e tratamento visual de falhas. |
| `src/systems/ResultFlow.js` | Coordena encerramento uma única vez, introdução de derrota, skip e cancelamento de callbacks antigos. |
| `src/systems/mobile.js` | Geometria pura para orientação, viewport compacto, resolução e entrada por toque/descarte. |
| `src/ui/art.js` | SVGs originais gerados em código para resíduos, Eco, corpos e tampas de lixeira; conversão para data URL. |
| `src/ui/factoryArt.js` | SVGs originais de fábrica, cidade e engrenagem. |
| `src/ui/arcade.js` | Templates HTML do modo arcade, ranking e resultado; escape do apelido, corações e botões. |

### Recursos e testes

- `public/assets/audio/`: 21 arquivos WAV locais: sete trilhas de modo, duas vinhetas sem loop e doze efeitos. `manifest.json` documenta os áudios.
- `public/assets/DejaVuSans.ttf` e `public/assets/LICENCA_DejaVu.txt`: fonte local e licença preservada.
- `tests/`: nove arquivos Vitest, descritos na seção “Testes”.
- `docs/`: documentação acadêmica/técnica, evidências e capturas. `docs/GDD.md` é legado da versão 3.1; os suplementos `MOBILE_3_2.md` e `MOBILE_3_3.md` documentam as evoluções mobile.

## Telas e navegação

O estado de navegação é controlado por `screen` em `src/main.js`; não há roteador. As telas HTML são recriadas por `render()`; a cena Phaser continua sendo uma instância e muda entre menu, jogo e derrota.

1. **Menu:** campanha, Desafio Infinito, revisão, ajuda, mapa, resultados, ranking, créditos e configurações. “Como jogar” abre a ajuda com o guia visual; “Jogar campanha” abre ajuda/tutorial no primeiro acesso sem exibir esse guia e abre o mapa se já há histórico. “Resultados” abre estatísticas, cujo botão “Voltar” retorna ao `menu`. Se a Revisão for iniciada pelo menu, abandoná-la pela pausa retorna ao `menu` sem salvar tentativa.
2. **Ajuda:** apresenta as instruções de jogabilidade e os três botões de ação: iniciar o tutorial (“Treinar com o Eco”), abrir o mapa (“Ver minha trilha”) ou retornar à tela inicial (“Voltar”). O guia visual vertical dos 27 resíduos, com suas lixeiras correspondentes e frases explicativas, aparece somente ao entrar por “Como jogar” e é ordenado por Papel, Plástico, Vidro, Metal e Rejeito. Ao entrar por “Jogar campanha”, são exibidas apenas as instruções e ações básicas.
3. **Tutorial:** treinamento guiado de três itens; não grava tentativa de campanha nem altera estrelas. Se abandonado pela pausa, abre o mapa e preserva a origem `help` quando a jornada começou por “Jogar campanha”.
4. **Mapa:** cinco fases, estrelas e bloqueio sequencial; inclui revisão, estatísticas e reset seletivo. “Meu desempenho” abre estatísticas, cujo botão “Voltar” retorna ao `map`. O botão “Voltar” do mapa retorna à tela de origem: `help` quando acessado por “Ver minha trilha” nas instruções ou após abandonar pela pausa um treino/tutorial iniciado por “Jogar campanha”; `menu` nos demais acessos. Se a Revisão for iniciada pelo mapa, abandoná-la pela pausa retorna ao `map` sem salvar tentativa.
5. **Partida de campanha:** fase escolhida, revisão ou tutorial, HUD, meta, Eco, feedback e controles.
6. **Pausa:** congela sessão, cena, tween e áudio; permite continuar, reiniciar fase/desafio, abandonar, alternar áudio e, se disponível, fullscreen. Abandonar o treino/tutorial abre o mapa (`map`); se a jornada começou por “Jogar campanha”, a origem `help` é preservada para o botão “Voltar” do mapa. Na Revisão, o botão de saída mudou de “Voltar à trilha” para “Voltar”; retorna à origem (`menu` ou `map`) sem salvar tentativa. No Desafio Infinito, a saída da pausa se chama “Voltar” e retorna à introdução arcade sem salvar o abandono no ranking local.
7. **Resultado da campanha:** aprovação, precisão, acertos, pontos, perdas, erros por categoria, dica educacional quando falha; repetir, próxima fase, mapa, menu ou conclusão.
8. **Conclusão da jornada:** resumo de estatísticas com medalha.
9. **Estatísticas:** tentativas, primeira/última precisão, estrelas, dificuldades mais erradas, comparação por fase/revisão, últimas tentativas e exportação CSV. O botão “Voltar” retorna à origem: `menu` quando acessada por “Resultados” no menu principal ou `map` quando acessada por “Meu desempenho” no mapa; a navegação não altera o histórico, as estrelas ou a exportação CSV.
10. **Configurações:** volume independente de música e efeitos, silêncio geral, amostra musical, repetir tutorial e reiniciar Trilha.
11. **Créditos:** tecnologias, origem do conteúdo, arte/áudio e pendências da equipe.
12. **Introdução arcade:** recorde, regras e apelido até 15 caracteres; é a tela para a qual “Voltar” retorna ao abandonar uma partida arcade pausada.
13. **Partida arcade:** pontos, combo, resolvidos, vidas, onda, progresso até próxima onda e dicas. Durante a pausa, o botão de saída mudou de “Voltar ao menu” para “Voltar”; ele abandona a sessão atual e retorna à introdução arcade sem registrar o abandono no ranking local.
14. **Introdução de derrota:** animação de desligamento por 1,75 s, opção de pular.
15. **Game Over:** resultado persistente com tentar novamente, ranking e menu.
16. **Ranking local:** top dez e confirmação antes de limpar.

Modal de pausa e confirmações são HTML. O modal aplica foco inicial e contenção básica de Tab. Esc alterna pausa/retomada durante jogo e pula introdução de resultado. O botão de menu durante uma partida abre a pausa, em vez de abandonar diretamente.

## Campanha: regras exatas

### Configuração das fases

| Fase | Itens | Categorias | Velocidade | Intervalo | Tempo | Meta | Confundíveis/preparação |
|---|---:|---|---:|---:|---:|---:|---|
| 1 — Papel ou plástico? | 12 | papel, plástico | 70 px/s | 2,6 s | sem timer | 75% | sem itens tricky ou RESTOS exigidos |
| 2 — Entram vidro e metal | 16 | papel, plástico, vidro, metal | 95 px/s | 2,2 s | 60 s | 80% | sem itens tricky ou RESTOS exigidos |
| 3 — Nem tudo recicla | 20 | todas as cinco | 115 px/s | 1,9 s | 60 s | 80% | fração tricky configurada em 0,45 |
| 4 — Sujo contamina | 20 | todas as cinco | 130 px/s | 1,8 s | 65 s | 80% | tricky 0,30; preparação configurada em 0,40 |
| 5 — Hora do rush | 26 | todas as cinco | 160 px/s | 1,4 s | 55 s | 85% | tricky 0,40; preparação configurada em 0,30 |

As fases com timer são penalizadas por erros e perdas. As quantidades, tempos, velocidade, categorias e metas vêm de `src/config/levels.js`; pontuação e limiares vêm de `src/config/rules.js`.

### Pontuação, tempo e encerramento

- Um acerto vale 10 pontos. A partir do terceiro acerto consecutivo, cada acerto vale 20.
- Erro ou perda zera a sequência e desconta 3 segundos quando a sessão tem timer.
- A cada cinco acertos consecutivos, inclusive sequências maiores, são adicionados 2 segundos.
- O timer não fica negativo; a pausa suspende o avanço.
- A tentativa termina quando todos os itens são resolvidos ou quando o timer chega a zero. Ao terminar, itens ainda não resolvidos, inclusive os que não chegaram a aparecer, são contados como perdas.
- Precisão é `acertos / total do deck`; portanto perdas e pendentes no momento do fim contam contra o denominador. Um deck vazio tem precisão 0.
- A aprovação exige tentativa não abortada, deck não vazio e precisão maior ou igual à meta da fase.
- Abaixo da meta: 0 estrelas. Aprovada: 1 estrela; precisão >=90%: 2; 100%: 3.
- Uma identidade de ocorrência (UID/posição do deck) só pode ser resolvida uma vez. O domínio consulta o item confiável no deck, não confia no objeto enviado pela cena.
- Aprovação de campanha normal salva a tentativa, melhores estrelas e libera a fase seguinte (até fase 5). Revisão não libera fase.
- Abandono (`abort`) não é salvo como tentativa nem concede avanço.

### Deck e revisão

`buildDeck` seleciona resíduos permitidos pelas categorias, faz amostragem balanceada por categoria e embaralhamento Fisher–Yates com restrições leves contra repetições longas/cíclicas. Partidas comuns usam entropia nova; testes podem fornecer `seed` ou `rng`. Categorias, cotas e flags do catálogo não devem ser mutadas.

A revisão usa até 12 itens (mínimo 6 quando disponíveis), sem timer e sem movimento/perda de esteira. Prioriza objetos cuja decisão mais recente foi erro/perda; erros acumulados desempataram/priorizam itens, mas acerto posterior reduz a prioridade. A regra é prática personalizada, não evidência de aprendizagem.

O tutorial força três entradas numa ordem didática: jornal, primeiro plástico não-tricky e novamente jornal. A partida não salva histórico de campanha, não altera estrelas e tem uma introdução com diálogo.

## Catálogo e classificação

O catálogo tem 27 IDs (seis papel, cinco plástico, três vidro, cinco metal, oito rejeito). Cada item tem nome, categoria, dica e flags `tricky` e `needsPrep`.

- **Papel:** `jornal`, `caixa_papelao`, `folha_caderno`, `envelope`, `revista`, `tubo_papel`.
- **Plástico:** `garrafa_pet`, `frasco_shampoo`, `sacola_plastica`, `pote_margarina`, `balde_quebrado`.
- **Vidro:** `garrafa_vidro`, `pote_geleia`, `long_neck`.
- **Metal:** `lata_refri`, `lata_milho`, `lata_sardinha`, `marmita_aluminio`, `frigideira`.
- **Rejeito:** `cupom_fiscal`, `caixa_pizza`, `guardanapo`, `espelho`, `xicara`, `esponja`, `bituca`, `fralda`.
- `tricky=true`: `cupom_fiscal`, `caixa_pizza`, `guardanapo`, `espelho`, `xicara`, `esponja`.
- `needsPrep=true` no catálogo: `pote_margarina`, `pote_geleia`, `lata_milho`, `lata_sardinha`, `marmita_aluminio`.

- `tricky` indica material escolhido para dificuldade/cota; não é avaliação real de pessoas.
- `needsPrep` indica que o item pode ser sorteado com condição RESTOS; não significa que todo exemplar esteja sujo.
- `classifyWaste(item, choice, prepared)` primeiro verifica a categoria; se a categoria estiver certa, exige `prepared` para item marcado com `needsPrep`. Os resultados internos são `category`, `preparation` ou `correct`.
- A interface permite “Retirar restos” e tecla E para preparar o item selecionado.
- Categorias/cor/símbolo: papel (azul/P), plástico (vermelho/PL), vidro (verde/V), metal (amarelo/M), rejeito (cinza/R); a UI também imprime o nome, então não depende apenas da cor.
- A lista completa de itens, dicas e flags está em `src/data/catalog.js` e no Anexo C do GDD.
- A classificação é uma simplificação educativa. O aviso do jogo recomenda seguir as regras do município, acondicionar vidro quebrado com segurança e não lavar universalmente embalagens.

## Desafio Infinito

- Disponível desde o menu, sem exigir campanha.
- Inicia com três vidas, todas as categorias, sem relógio global, onda 1, velocidade 85 px/s e intervalo 2,5 s.
- Acertos valem 10 pontos; combo 3 ou mais dá 20; combo 10 ou mais dá 30. Não ganha vidas, e pontuação é limitada a `Number.MAX_SAFE_INTEGER`.
- Classificação errada, preparação incorreta e perda de item custam uma vida e zeram o combo.
- A cada dez decisões resolvidas (acertos, erros e perdas), avança a onda.
- Dificuldade por onda: `[85,2.5]`, `[95,2.3]`, `[110,2.1]`, `[125,1.9]`, `[140,1.7]`, `[155,1.5]`, `[170,1.4]`, `[185,1.3]`, `[200,1.2]`, `[210,1.1]` como velocidade/intervalo. Depois da onda 10, velocidade cresce 5 por onda até 240; intervalo mínimo 1,1 s.
- Os nomes são Iniciante (1–2), Operador (3–4), Especialista (5–6), Mestre da Triagem (7–9) e Lenda da Reciclagem (10+).
- Confundíveis entram progressivamente depois da onda 2; preparação depois da 3.
- Há no máximo seis itens simultâneos, espaçamento mínimo nominal 150 px entre chegadas e memória limitada: itens pendentes em `Map`, IDs recentes limitados e sem deck crescente.
- O gerador evita repetições e distribui categoria de modo equilibrado quando possível.
- Precisão é `acertos / resolvidos`, zero se nada foi resolvido; itens ainda pendentes são informados separadamente e não geram vidas adicionais no Game Over.
- Ao perder a terceira vida, a simulação congela e uma única transição leva ao Game Over. Abandono não registra ranking.
- Apelido é removido de caracteres de controle, aparado, limitado a 15 caracteres Unicode e usa “Jogador” se vazio.
- O ranking local fica na chave `trilha-seletiva-infinite-v1`. Um apelido já registrado nessa chave não pode ser reutilizado para iniciar outra partida; a comparação aplica `normalizeNickname` e `toLowerCase()`. `isNicknameTaken` consulta a disponibilidade e `saveInfiniteResult` retorna `status: 'nickname-taken'` e `saved: false` sem inserir duplicata.
- A introdução arcade valida o apelido durante a edição e novamente ao iniciar. Se o nome já estiver no ranking, exibe uma mensagem abaixo do campo e desativa “Começar desafio” até que seja informado um apelido disponível. A tela compacta reduz espaçamentos e mantém o painel rolável; um conflito encontrado ao repetir uma partida retorna à introdução para permitir trocar o nome.
- Ranking mantém as dez melhores entradas locais, ordenadas por pontos descendentes, maior combo, onda, data mais antiga e ID. Só salva fim natural por três vidas perdidas com exatamente três erros/perdas. Limpar ranking exige confirmação e não altera a campanha.

## Cena, controles e identidade visual

O Phaser usa mundo lógico 1280×720, Scale Manager `FIT` e uma `FactoryScene`. A cena compõe fábrica/cidade com SVGs carregados uma vez como texturas, cartões de resíduos, lixeiras e objetos ambientais. A esteira vai aproximadamente de entrada x=92 até a saída x>1195; lixeiras são posicionadas abaixo dela. Itens ativos de campanha são limitados a seis; revisão mantém um de cada vez. A seleção tem destaque visual.

Controles:

- Mouse/toque: arrastar e soltar no destino; também selecionar item e clicar/tocar na lixeira.
- Teclas 1–5 escolhem a lixeira na ordem visual da sessão; Tab troca item selecionado; E prepara; Esc pausa/retoma.
- Soltar fora de lixeira devolve item à esteira, sem resolver. A esteira continua; se sair, vira perda.
- Durante arrasto, destino sob o ponteiro destaca. Toque usa coordenada mundial via câmera; o gráfico é deslocado para cima do dedo quando há espaço e limitado à câmera.
- Pausa, saída do canvas e resize cancelam drag para evitar descarte/seleção inconsistente.
- `prefers-reduced-motion` e hardware com até quatro processadores reportados diminuem/removem animações decorativas, preservando indicadores.

## Layout mobile e interrupções

- Em jogo retrato e largura <=1100, exibe aviso “Gire para jogar”, pausa sessão e exige Continuar depois de voltar à paisagem. Não força orientação nem reinicia cena/sessão.
- Perda de foco, ocultação da aba e `pagehide` também tentam pausar.
- Paisagem compacta: largura>altura, altura disponível <=540 e razão >=1,4. O HTML reserva HUD (~50 px), canvas no espaço central e ações (~44 px); cabeçalho some durante esse jogo compacto.
- `syncViewport()` usa `visualViewport.height`, classe CSS e `setGameSize`; `FactoryScene.layoutViewport()` aplica zoom uniforme sobre região jogável y=260..700, centrada em (640,480). O mundo, posições, regras, velocidade e zonas de descarte mantêm coordenadas lógicas.
- A fala de Eco é movida para dentro da barra inferior no modo compacto; o mesmo elemento DOM é movido de volta no desktop (sem clonar IDs/listeners).
- Tablet/desktop preservam enquadramento 1280×720; fullscreen é opcional, só se o navegador expõe a API.
- Evidências de viewports 800×360, 844×390, 915×412, 960×440, 1024×768, 1280×720 e 1600×900 estão descritas em `docs/MOBILE_3_3.md` e capturas em `docs/capturas-v33/`. São testes de Chromium integrado, não validação física em aparelhos.

## Áudio, preferências e falhas

- 21 WAVs locais: 7 trilhas em loop (fases 1–5, revisão, arcade), 2 vinhetas sem loop (game over 6,4 s, vitória 5,2 s) e 12 efeitos.
- Áudio só é iniciado após interação do usuário. Menu não tem música de fundo.
- `AudioManager` mantém uma voz musical: fade-out e destruição da anterior antes da próxima. Pausa preserva instância/posição da música; silêncio geral e volumes independentes de música/efeitos persistem.
- Efeitos são limitados a seis simultâneos e protegidos por cooldown curto. Falha de áudio apresenta aviso e não bloqueia a partida.
- Os sons são originais/sintetizados localmente e a ferramenta de geração está em `tools/generate-audio.mjs`; documentação e créditos adicionais em `docs/AUDIO_3.md` e `docs/CREDITOS.md`.

## Persistência e privacidade

- Campanha/configurações: chave `trilha-seletiva-v1`, versão de schema 1. Histórico limitado a 500 tentativas.
- Arcade: chave `trilha-seletiva-infinite-v1`, versão 1, dez entradas.
- `loadProgress()` valida tentativas e reconstrói estrelas/desbloqueio a partir de tentativas aprovadas não-abortadas; não confia cegamente em contadores salvos. Configuração antiga `volume` migra para efeitos; novos volumes são limitados a 0..1.
- Falha de leitura/escrita muda para fallback em memória e sinaliza aviso na UI. Não há servidor.
- Reset da campanha preserva preferências, apaga histórico/estrelas/desbloqueios da campanha e não toca na chave do arcade nem em outras chaves. Não usa `localStorage.clear()`.
- Reset do ranking só limpa a chave do arcade.
- CSV: UTF-8 com BOM, delimitador `;`, CRLF, campos entre aspas e escape de aspas; contém datas e métricas, sem exigir nome.
- Apagar dados do navegador ou mudar de origem/porta/domínio perde acesso à persistência local; hospedagem antiga e Pages não sincronizam dados.

## Fluxo técnico de uma classificação

1. `FactoryScene` seleciona/arrasta item do mundo e determina lixeira.
2. `FactoryScene.classify()` chama `Session.resolve(uid, item, category, decisionSeconds, prepared)` ou `InfiniteSession.resolve(...)`.
3. A sessão verifica UID/pêndencia/pausa/fim. O domínio obtém o item confiável pelo UID e chama `classifyWaste`.
4. Domínio registra decisão uma vez, pontuação, timer/vida, combo e possível fim.
5. Cena anima lixeira/objeto e feedback; `main.js` atualiza HUD/feedback.
6. Ao terminar, `ResultFlow` evita duplicatas e callbacks atrasados. Campanha salva tentativa válida; arcade tenta salvar resultado elegível no ranking. A UI conduz para resultado.

Não mova regras de domínio para a UI ou cena. A cena cuida de apresentação/entrada; sessões determinam resultado. `ResultFlow` coordena a apresentação, não cria nova regra de vitória/derrota.

## Testes presentes

O GDD de 3.3 registra 70 testes aprovados em nove arquivos e builds comuns/Pages concluídos naquela rodada. Isso é evidência histórica; repetir `npm test` para afirmar que o estado atual passou.

| Arquivo | Escopo principal |
|---|---|
| `tests/session.test.js` | Pontuação, combo, timer, pausa, preparação, UID único, precision/estrelas, métricas e decks/revisão. |
| `tests/journey.test.js` | Integração de regras/configurações da jornada de cinco fases e perdas. |
| `tests/infinite.test.js` | Aleatoriedade/seed, categorias/ordem, vidas, ondas, combos, limites de memória/itens e classificação. |
| `tests/storage.test.js` | Persistência, histórico, unlock, revisão/abort, dados corrompidos, volume, reset seletivo e CSV. |
| `tests/leaderboard.test.js` | Top 10, apelido, novo recorde, persistência e isolamento do ranking. |
| `tests/resultFlow.test.js` | Encerramento único, skip, callback atrasado e condições separadas dos modos. |
| `tests/mobile.test.js` | Geometria, escolha de destino, touch, orientação, resolução e enquadramento. |
| `tests/audio.test.js` | Manifesto/arquivos, voz única, pausa, volume, mute, falhas e vinheta sem loop. |
| `tests/art.test.js` | Contratos de SVG, ilustrações, poses, lixeiras, Unicode e camadas locais. |

Testes automatizados não substituem teste completo de interface, aparelhos reais ou validação de aprendizagem.

## Limitações e pendências explícitas

- Não há teste com pessoa externa ou demonstração de transferência para resíduos físicos/itens novos.
- Nenhum impacto educacional está comprovado; precisão no jogo mede desempenho naquele jogo.
- Não há medição sustentada de FPS.
- Não houve validação em Android/iPhone físicos, notch real, Chrome/Edge nativos ou medição acústica especializada na evidência documentada.
- A geometria de toque tem testes automatizados; arrastos observados em viewports foram executados com mouse no Chromium integrado.
- Acessibilidade integral para leitor de tela/canvas e todas as limitações motoras não foi validada.
- Catálogo é simplificado e deve ser confrontado com regras municipais/cooperativa.
- Testes manuais documentados cobrem situações específicas; não significam uma passagem manual recente por todas as cinco fases e ondas.
- Integrantes/matrículas, vídeo acadêmico, prazo/destino de entrega e teste externo estão pendentes no GDD.

## Discrepância detectada para conferir antes de documentar tutorial

O GDD 3.3 descreve o treino como três itens a 45 px/s. No código, `src/main.js` marca o tutorial como `review` ao criar `Session`; em `FactoryScene.update()`, sessões `review` não avançam os itens pela esteira. Portanto, apesar do parâmetro `speed:45`, o tutorial atual apresenta os itens sem movimento. Não alterar silenciosamente: confirmar se a intenção é tutorial estacionário ou esteira móvel e alinhar código/GDD após decisão.

## Fontes de documentação existentes

- DOCX fornecido e referência atual: `/home/mizael-marques/Downloads/GDD-Trilha-Seletiva-3.3.docx`.
- `docs/GDD.md`: GDD antigo, versão 3.1; não é cópia atualizada do DOCX 3.3.
- `docs/ARQUITETURA.md`: arquitetura e fluxo interno.
- `docs/TESTES.md`: resultados e limites de validação, com histórico de versões.
- `docs/MOBILE_3_2.md`, `docs/MOBILE_3_3.md`: decisões e evidências mobile.
- `docs/AUDIO_3.md`, `docs/CREDITOS.md`: áudio, assets e créditos.
- `docs/VISUAL_2.md`, `docs/ASSETS_VISUAL_2.md`: identidade visual e arte.
- `docs/DIAGNOSTICO_ORIGINAL.md`, `docs/VERSAO_3_1.md`: histórico/diagnóstico de evolução.
- `docs/GDD.pdf`: versão acadêmica anterior/exportada; verificar revisão antes de usar como atual.
- `docs/capturas-v33/`: imagens e JSON de medições da versão 3.3.

## Lista rápida antes de uma mudança

- Qual comportamento foi pedido e em qual modo se aplica?
- Há regra compartilhada que possa afetar campanha e arcade?
- O domínio, a cena, a UI, armazenamento, áudio, CSS e testes envolvidos foram lidos?
- O comportamento continua correto em desktop e paisagem compacta?
- A campanha continua isolada do ranking arcade (e vice-versa)?
- Tutorial/revisão/reset/pausa/abandono/resultados mantêm seus invariantes?
- Os testes cobrem a regressão e o build funciona?
- GDD DOCX, documentação no repositório, evidências e README precisam de atualização?
- As afirmações finais distinguem implementação, automação, observação manual e validação externa?
