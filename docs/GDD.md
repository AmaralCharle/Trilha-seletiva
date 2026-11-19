# GDD de Trilha Seletiva

Trilha Seletiva — Missão Reciclagem é um serious game de triagem em uma central de reciclagem fictícia. Este documento descreve o problema, as decisões de design, a implementação de navegador e o plano de validação. O tema é o número 03, Meio ambiente e cidade limpa, do Desafio P2 de Desenvolvimento de Jogos Digitais, Engenharia de Software, 7º período, Univassouras, professor Tiago Ruiz de Castro.

| Identificação | Informação |
|---|---|
| Dimensão e câmera | 2D, vista lateral da central de triagem |
| Gênero | Simulação arcade educacional para um jogador |
| Plataforma | Navegador desktop no Windows; mouse, teclado e toque |
| Tecnologia | JavaScript ES Modules, Phaser 3, Vite e Vitest; versões exatas no package-lock.json |
| Código entregue | https://github.com/AmaralCharle/Trilha-seletiva ; projeto com fonte, assets e testes |
| Integrantes e matrículas | Pendente de informação do grupo; máximo de cinco integrantes |
| Vídeo de 1 a 3 minutos | Pendente de gravação e publicação pelo grupo |
| Data e local de entrega | A confirmar com o professor; a aula não estabelece valores |

## 1 O problema

### Problema em uma frase

Moradores iniciantes em coleta seletiva, ao separar embalagens e pequenos resíduos em casa antes da coleta, podem escolher o destino incorreto porque confundem o material ou a contaminação do objeto.

### Contexto e evidência

O recorte do público é uma hipótese de projeto, ainda sem entrevista ou observação local do grupo. As orientações de Vinhedo e da Secretaria de Saúde de São Paulo mostram que a separação exige distinguir materiais, retirar restos e reconhecer rejeitos. Elas fundamentam o conteúdo do jogo; não comprovam a frequência dos erros no público proposto. O teste externo deverá verificar essa hipótese antes de uma afirmação de impacto.

### O que já existe e por que não basta

Cartilhas e campanhas explicam destinos corretos e cuidados de preparação. O jogo acrescenta prática repetida, decisão sobre objetos diferentes e explicação imediata do erro. A hipótese é que essa prática favorece o reconhecimento; não se presume que substitua orientação da cooperativa ou do município.

## 2 Público-alvo

### Perfil do jogador

Estudantes a partir de aproximadamente 12 anos e moradores iniciantes em coleta seletiva, com leitura de português e familiaridade básica com mouse ou teclado. O grupo deverá convidar uma pessoa com esse perfil, de fora da equipe, para testar.

### Situação de uso

Atividade breve em computador escolar ou doméstico. Cada fase apresenta de 12 a 26 resíduos; as quatro últimas possuem relógio de 55 a 65 segundos antes de bônus e penalidades. A primeira fase e a revisão permitem aprender sem cronômetro. A jornada pode ser interrompida entre tentativas, pois o progresso é local.

### Barreiras

| Barreira proposta | Natureza da evidência | Resposta do jogo |
|---|---|---|
| Confundir aparência e material | Hipótese a verificar | Resíduos com silhuetas distintas, nome e retorno de classificação |
| Achar que todo papel é reciclável | Distinção presente nas orientações oficiais | Papéis contaminados e itens confundíveis nas fases avançadas |
| Achar que toda embalagem precisa de lavagem | Orientação municipal consultada | Preparação por retirada de restos, sem comando de enxágue universal |
| Desistir depois de um erro | Hipótese de usabilidade | Dicas de Eco, repetição e revisão sem cronômetro |

### Acessibilidade

As lixeiras combinam cor, nome e símbolo. As ações centrais têm alternativa de teclado. O retorno usa texto e imagem além de som; áudio pode ser desligado. O tutorial apresenta uma ação por vez. O layout se adapta à área disponível, com prioridade ao desktop. A acessibilidade integral por leitor de tela no canvas e a adequação para todas as limitações motoras não foram validadas.

## 3 Objetivo de impacto

### Depois de jogar o jogador será capaz de

- Identificar o material predominante dos resíduos do catálogo.
- Distinguir embalagens recicláveis de rejeitos como papel contaminado e cerâmica na convenção de coleta apresentada.
- Decidir quando retirar restos de uma embalagem e procurar a regra local para casos especiais.

### Hipótese de mudança

Se o jogador classifica resíduos, recebe explicações e pratica novamente seus erros, então poderá escolher destinos mais adequados na separação doméstica, porque exercita reconhecimento e correção em contextos variados. A transferência para resíduos físicos ainda precisa ser medida.

### Por que um jogo

A própria ação de encaminhar o objeto ao destino é o conteúdo praticado. O movimento da esteira exige atenção e priorização; as sequências de acertos oferecem retorno sobre consistência. A revisão reduz a pressão e concentra a prática nas dificuldades observadas.

## 4 Conceito do jogo

### Conceito em duas frases

O jogador trabalha com Eco, um pequeno robô instrutor, separando resíduos que chegam pela esteira de uma central de triagem. Cinco turnos introduzem novos materiais, rejeitos e preparação de embalagens, até uma operação com maior velocidade.

### Estilo e motor

A vista lateral 2D mantém o foco no reconhecimento e no destino dos objetos. Phaser 3 oferece atualização por tempo, entrada de ponteiro e teclado e renderização Canvas/WebGL em navegador; Vite organiza o desenvolvimento e gera uma distribuição estática. O projeto funciona sem backend, conta ou banco remoto e carrega seus recursos do próprio pacote.

| Campo | Definição |
|---|---|
| Jogadores | Um |
| Referências de design | Operação de esteira do original TrilhaSeletiva; prática espaçada e feedback imediato como decisões de design |
| Pilares | Reconhecer com clareza, aprender com cada tentativa, progredir por domínio |

## 5 Mecânica dinâmica e estética

| Mecânica | Dinâmica esperada | Estética pretendida | Ligação com o problema |
|---|---|---|---|
| Arrastar ou encaminhar por teclado | Observar e escolher destino | Controle e descoberta | A classificação é executada como ação |
| Resíduos na esteira com velocidade crescente | Priorizar sem perder a precisão | Atenção e desafio | Repetir reconhecimento em diferentes ritmos |
| Dica depois de erro | Comparar a decisão e o material | Segurança para tentar novamente | Corrigir a associação equivocada |
| Preparação de embalagens | Retirar restos antes do destino | Cuidado e competência | Separação depende também do estado do resíduo |
| Pontos por sequência e estrelas por precisão | Buscar consistência | Realização | Premiar acertos sustentados sem ocultar erros |
| Revisão baseada nos erros | Repetir os itens difíceis | Autonomia e domínio | Concentrar a prática na necessidade observada |

## 6 Regras e jogabilidade

### Ciclo central

| Etapa | Ação e retorno |
|---|---|
| Objetivo imediato | Identificar o próximo objeto antes que saia da área útil |
| Ação | Selecionar, preparar se necessário e encaminhar à lixeira |
| Retorno | Animação, texto explicativo, som opcional e atualização dos indicadores |
| Consequência | Acerto soma pontos; erro ou perda quebra a sequência e pode reduzir o tempo |
| Repetição | Concluir a fase, melhorar as estrelas ou revisar as dificuldades |

### Objetivos de curto médio e longo prazo

Nos próximos segundos, classificar o objeto selecionado. Na fase, atingir a meta com todos os resíduos contabilizados. Na jornada, concluir os cinco níveis e revisar os resíduos que ainda geram erros.

### Vitória derrota e encerramento

A precisão usa acertos divididos pelo total previsto da tentativa, inclusive itens perdidos e pendentes ao terminar o relógio. A tentativa encerra uma única vez, ao contabilizar o lote ou esgotar o tempo. A fase é aprovada somente se o resultado final atingir sua meta. Uma tentativa abaixo da meta pode ser repetida sem perda do progresso anterior. A quinta fase aprovada conclui a jornada principal.

| Regra | Valor e finalidade |
|---|---|
| Acerto | 10 pontos |
| Sequência | A partir do terceiro acerto consecutivo, cada acerto vale 20 pontos |
| Erro ou perda | Quebra a sequência; desconta 3 segundos quando há cronômetro |
| Bônus | A cada cinco acertos consecutivos, acrescenta 2 segundos quando há cronômetro |
| Tempo | Nunca fica abaixo de zero; a pausa interrompe sua contagem |
| Uma estrela | Meta da fase atingida e precisão abaixo de 90% |
| Duas estrelas | Meta atingida e precisão de pelo menos 90%, abaixo de 100% |
| Três estrelas | 100% de precisão |
| Resolução única | Uma identidade de resíduo só pode ser contabilizada uma vez |
| Reinício | Cria nova tentativa; a tentativa abandonada não concede estrelas |

### Controles

Arrastar o objeto e soltar na lixeira funciona como entrada principal. Também é possível clicar no item e depois no destino. As teclas de 1 a 5 escolhem as lixeiras disponíveis na ordem visual; Tab seleciona o próximo item, E retira restos da embalagem selecionada e Esc pausa ou retoma. Botões visíveis oferecem pausa, preparação e repetição da dica. Não é necessário identificar uma lixeira apenas pela cor.

### Pontuação e recursos

Pontos comunicam consistência e não compram vantagens. Tempo organiza a duração dos turnos cronometrados. Estrelas representam a precisão final da tentativa, e o melhor resultado salvo permanece disponível. Não há vidas pagas, moeda comercial ou consumíveis.

## 7 Progressão e dificuldade

| Fase | Conteúdo | Resíduos | Lixeiras | Velocidade | Intervalo | Tempo | Meta |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 Papel ou plástico | Reconhecimento inicial | 12 | 2 | 70 px/s | 2,6 s | Sem relógio | 75% |
| 2 Vidro e metal | Ampliação de materiais | 16 | 4 | 95 px/s | 2,2 s | 60 s | 80% |
| 3 Nem tudo recicla | Rejeitos e confundíveis | 20 | 5 | 115 px/s | 1,9 s | 60 s | 80% |
| 4 Sujo contamina | Preparação de embalagens | 20 | 5 | 130 px/s | 1,8 s | 65 s | 80% |
| 5 Hora do rush | Combinação das habilidades | 26 | 5 | 160 px/s | 1,4 s | 55 s | 85% |

Os valores principais preservam a configuração original. A cena usa canvas lógico de 1280 × 720 e aproximadamente 1100 px de percurso útil, mais longo que a janela original de 960 px. Mantidas as velocidades, isso aumenta a tolerância antes de um item sair; não é uma comparação direta de dificuldade por velocidade isolada. A cena limita a seis itens simultâneos e suspende novas chegadas enquanto está cheia. O treino usa três itens a 45 px/s; a revisão usa 55 px/s e não tem cronômetro. Essas escolhas favorecem reconhecimento e controle, mas ainda precisam de balanceamento com pessoas. O desbloqueio é sequencial: aprovação libera o nível seguinte, até o quinto. A revisão usa as dificuldades registradas e remove o limite de tempo. Seu desempenho fica separado do desbloqueio da trilha.

### Alavancas de dificuldade

Quantidade de resíduos, categorias permitidas, velocidade, intervalo, presença de confundíveis, necessidade de preparação, tempo e meta ficam em `src/config/levels.js`. Regras de pontuação ficam em `src/config/rules.js`. A largura do percurso, o limite de seis itens e os valores do treino e da revisão ficam na integração e na cena. Alterações futuras devem registrar motivo e dados usados no balanceamento.

### Primeiro minuto

Eco introduz a esteira, a seleção e o destino. O exercício orientado permite executar uma classificação, observar o retorno e repetir a orientação. A primeira fase limita os materiais a papel e plástico e não usa cronômetro; o risco de perder um objeto ainda ensina a acompanhar a esteira.

## 8 Motivação e ética

### Impulsos centrais

Desenvolvimento e realização aparecem nas estrelas e no desbloqueio; autonomia aparece na escolha de repetir e revisar; significado aparece na missão de separar resíduos de forma responsável. São propostas de motivação white hat, baseadas em domínio e escolha, sem recompensa comercial ou ameaça.

### Perfis de jogador

Realizadores podem buscar três estrelas e completar a trilha. Exploradores podem consultar dicas, reconhecer exceções e comparar os resíduos. Não há ranking competitivo nem modo social; esses perfis não são prioridade desta versão.

### Decisões éticas e cuidado com o tema

O jogo não utiliza anúncios, microtransações, recompensas enganosas ou mensagens de humilhação. Erros geram explicação. A revisão reduz a pressão temporal. Eco valoriza a ação de aprender e o cuidado com os profissionais da coleta. A central é fictícia: sua convenção não substitui a regra do município. Retirar restos não significa lavar toda embalagem, e vidro quebrado exige acondicionamento e identificação seguros.

## 9 Mundo narrativa e personagens

### Ambientação e narrativa

Uma cidade brasileira contemporânea mantém uma central de triagem ilustrada. O jogador inicia como aprendiz de Eco, assume turnos com materiais mais variados e conclui a operação principal ao aprovar o quinto nível. O conflito está em reconhecer materiais e evitar contaminação do lote. Não há inimigos humanos ou estereótipos sobre moradores e catadores.

| Entidade | Papel | Comportamento e aparência |
|---|---|---|
| Eco | Instrutor | Robô pequeno e amigável; orientações curtas e reação ao desempenho |
| Resíduo | Objeto da decisão | Ilustração e nome; deslocamento da esquerda para a direita |
| Lixeira | Destino | Cor, nome e símbolo de material |
| Esteira | Organizador do ritmo | Movimento contínuo e saída que contabiliza perdas |
| Central | Contexto | Máquinas, tubulações, painéis e detalhes industriais ilustrados |

## 10 Level design

### Esboço funcional

```text
Indicadores da fase, pontos, sequência, tempo e progresso
                     Central de triagem
Entrada de resíduos -> Esteira e objetos -> Saída e perda
               Área de seleção e preparação
       Papel  Plástico  Vidro  Metal  Rejeito
               Eco e orientação contextual
```

O jogador inicia a observação junto à entrada, à esquerda. O objetivo é encaminhar cada objeto aos destinos abaixo antes da saída à direita. A dificuldade vem de movimento, simultaneidade, materiais confundíveis e preparação, sem obstáculos que escondam o nome do resíduo.

### Ritmo e posicionamento

A chegada espaçada dá tempo para reconhecer e agir. A progressão aumenta velocidade e frequência ao introduzir materiais. A tela de resultado e o mapa separam turnos, permitindo descanso. A revisão permite repetir decisões sem o relógio competitivo da trilha. As capturas reais da versão executada devem complementar este esboço no Anexo B.

## 11 Arte interface e áudio

### Direção de arte

Cartoon 2D industrial ecológico, com formas arredondadas, vegetação e cores de destaque em uma base escura legível. A arte de objetos e de Eco é vetorial, criada no projeto com assistência de IA e renderizada localmente. A esteira e os equipamentos usam desenho e animação programáticos. Não se depende de serviços externos para carregar arte durante a partida.

### Telas e HUD

O fluxo inclui início, instruções e tutorial, mapa da trilha, jogo, pausa, resultado, revisão e resumo de progresso. O HUD comunica fase, pontos, tempo quando aplicável, sequência e quantidade resolvida. O resultado distingue aprovação e nova tentativa, exibe precisão e dificuldades, e permite repetir ou prosseguir. Configurações oferecem controle de áudio.

### Áudio e assets

Os efeitos devem reforçar acerto, erro e interação sem transmitir informação exclusiva. Música ambiente é opcional e não é requisito para a mecânica. A origem e a licença dos materiais estão em `docs/CREDITOS.md`; recursos originais sem comprovação de licença não devem ser redistribuídos por presunção.

## 12 Arquitetura técnica

### Organização e componentes

A aplicação separa configuração, catálogo, domínio determinístico, armazenamento, cena Phaser e interface externa ao canvas. `src/main.js` coordena a navegação; `src/scenes/FactoryScene.js` desenha e atualiza a central; `src/systems/session.js` decide as regras; `src/systems/storage.js` salva e exporta resultados. `src/ui/art.js` contém as ilustrações originais. A descrição detalhada de dependências e funções consta em `docs/ARQUITETURA.md`.

### Estados ciclo tempo e colisão

A interface inicia uma tentativa com configuração e lote próprios. O ciclo de atualização do Phaser converte o delta de milissegundos para segundos, move os resíduos e avança o domínio. A soltura é comparada às regiões das lixeiras; uma saída da área útil registra perda. A pausa precisa interromper tanto simulação quanto cronômetro e entrada de classificação. O domínio impede contabilização duplicada e encerramentos concorrentes.

### Dados e persistência

A tentativa armazena acertos, erros, perdas, sequência, pontuação, tempo e decisões por identidade. O progresso inclui maior nível liberado, melhores estrelas, preferências e histórico local. Não há envio de métricas para servidor. Exportar CSV permite ao grupo analisar tentativas. A indisponibilidade do armazenamento deve ser informada; apagar dados do navegador remove o progresso local.

### Como executar

1. Instalar uma versão de Node.js compatível com a exigência declarada pelo projeto.
2. Extrair o projeto e abrir um terminal na pasta que contém `package.json`.
3. Executar `npm install` para instalar as dependências.
4. Executar `npm run dev` e abrir o endereço local indicado no terminal.
5. Para verificar as regras, executar `npm test`.
6. Para gerar a distribuição, executar `npm run build`; para servi-la localmente, executar `npm run preview`.

Os passos são iguais aos do README. A primeira instalação requer acesso à rede; a distribuição gerada leva os recursos de execução e não usa CDN. Navegador e hardware de teste, desempenho medido e resultados executados são registrados apenas depois de verificação real, em `docs/TESTES.md`.

## 13 Rastreabilidade do GDD ao código

A tabela foi conferida por inspeção dos arquivos da reconstrução. “Implementado” indica código presente; não equivale à validação externa de usabilidade. A execução e os limites de verificação ficam na seção 14 e no relatório técnico.

| Regra ou mecânica | Seção | Arquivo | Classe ou função | Situação |
|---|---|---|---|---|
| Catálogo de 27 resíduos e dicas | 5, 6 | src/data/catalog.js | CATALOG, LOCAL_NOTICE | Implementado |
| Cinco fases com quantidade, velocidade, intervalo, tempo e meta | 7 | src/config/levels.js | LEVELS | Implementado |
| Cores, nomes e símbolos dos destinos | 2, 6 | src/config/levels.js; src/scenes/FactoryScene.js | BINS; FactoryScene.start | Implementado; a cena desenha nomes e números |
| Ordem balanceada e presença de confundíveis e preparação | 5, 7 | src/systems/session.js | buildDeck | Implementado |
| Pontos 10 e multiplicador a partir do terceiro acerto | 6 | src/config/rules.js; src/systems/session.js | RULES; Session.resolve | Implementado |
| Penalidade de 3 s e bônus de 2 s a cada cinco acertos | 6 | src/systems/session.js | Session.resolve, Session.miss | Implementado |
| Retirada de restos antes de classificar quando exigida | 5, 6 | src/scenes/FactoryScene.js; src/systems/session.js | FactoryScene.prepare; Session.resolve | Implementado |
| Resolução única e bloqueio de ação pausada ou encerrada | 6 | src/systems/session.js | Session.canResolve, Session.resolve, Session.miss | Implementado |
| Movimento por delta e item que sai da esteira | 5, 6 | src/scenes/FactoryScene.js | FactoryScene.update | Implementado |
| Limite de seis objetos e controle de chegada | 7 | src/scenes/FactoryScene.js | FactoryScene.update, FactoryScene.spawn | Implementado |
| Arrastar, clicar em objeto e destino, teclas 1–5 e Tab | 6 | src/scenes/FactoryScene.js | FactoryScene.create, FactoryScene.classify, FactoryScene.start | Implementado |
| Preparação com E | 6 | src/scenes/FactoryScene.js | FactoryScene.create, FactoryScene.prepare | Implementado |
| Precisão sobre lote total e contabilização de pendentes | 6 | src/systems/session.js | Session.finish | Implementado |
| Relógio limitado a zero e encerramento único | 6 | src/systems/session.js | Session.tick, Session.checkEnd, Session.finish | Implementado |
| Meta, aprovação e estrelas | 6, 7 | src/systems/session.js | Session.finish | Implementado |
| Tutorial com três itens e repetição da orientação | 7 | src/main.js | help, start, actions.hint | Implementado |
| Mapa e desbloqueio progressivo | 7 | src/main.js; src/systems/storage.js | map; saveAttempt, loadProgress | Implementado |
| Revisão sem cronômetro e priorização por erros históricos | 5, 7 | src/main.js; src/systems/session.js | start; buildDeck | Implementado |
| Pausa, Esc, retomada e pausa quando a página fica oculta | 6, 12 | src/main.js; src/systems/session.js; src/scenes/FactoryScene.js | pause, resume, visibilitychange; Session.tick; FactoryScene.update | Implementado |
| Reinício e abandono sem recompensa | 6 | src/main.js; src/systems/storage.js | start, actions.restart, actions.abandon; saveAttempt | Implementado |
| Feedback, partículas e sons opcionais | 5, 11 | src/main.js; src/scenes/FactoryScene.js | feedback, tone; FactoryScene.classify | Implementado |
| Resultado, próxima fase e conclusão da jornada | 6, 9, 11 | src/main.js | finish, actions.next, stats | Implementado |
| Histórico, erros por objeto e categoria e métricas | 12, 14 | src/systems/session.js; src/systems/storage.js | Session.finish; saveAttempt | Implementado |
| Exportação CSV | 14 | src/systems/storage.js; src/main.js | exportCSV; actions.export | Implementado |
| Áudio, volume e tela cheia quando suportada | 2, 11 | src/main.js; src/systems/storage.js | settings, tone, actions.sound, actions.fullscreen; saveSettings | Implementado |
| Reset e aviso de armazenamento indisponível | 12 | src/systems/storage.js; src/main.js | resetProgress, loadProgress, persist; render, toast | Implementado |
| Ilustrações locais e erro de carregamento | 11, 12 | src/ui/art.js; src/scenes/FactoryScene.js; src/main.js | itemSVG, ecoSVG; FactoryScene.preload; asset-error | Implementado |

## 14 Testes e validação

### Validação técnica

Foram executados 25 testes automatizados de domínio e persistência com resultado aprovado nesta etapa. Eles cobrem regras determinísticas e casos de borda; a contagem final e eventuais testes adicionais devem acompanhar o relatório técnico da versão entregue. A instalação, o build de produção e a execução visual precisam ser registrados com resultados reais em `docs/TESTES.md`. Aprovação automatizada não equivale a teste com pessoa de fora do grupo.

### Teste com pessoa externa

Pendente. Convidar pelo menos uma pessoa com o perfil definido, explicar apenas o objetivo geral e observar a sessão sem interferir. Registrar perfil, ponto de dificuldade, decisão de melhoria e tentativa de repetição, sem nome do participante. O grupo deverá completar esta seção depois da observação; nenhum participante ou resultado é presumido.

| Métrica | Tipo | Registro | Valor observado |
|---|---|---|---|
| Erros e perdas por categoria | Comportamento | Histórico de cada tentativa | Pendente de teste com público |
| Tempo médio de decisão | Comportamento complementar | Intervalo entre aparição e resolução | Pendente de teste com público |
| Precisão e erros por minuto | Resultado dentro do jogo | Comparação de tentativas da mesma fase | Pendente de teste com público |
| Classificação de resíduos físicos ou imagens novas | Resultado fora do jogo | Atividade posterior sem dicas | Ainda não implementada no software; aplicação pelo grupo |

### Critério de sucesso

Antes do teste, propõe-se comparar duas tentativas da mesma fase: redução de erros por minuto e precisão final de pelo menos 90%. Esse é um critério de desempenho no jogo, sujeito a revisão pelo grupo antes de coletar dados. Para afirmar impacto fora dele, aplicar uma classificação posterior com itens novos e registrar sua precisão. Repetir o mesmo lote pode refletir memorização; não prova aprendizagem geral.

### Defeitos conhecidos

O relatório técnico deve separar defeitos reproduzíveis de limitações do escopo. Ainda não há validação externa, auditoria integral de acessibilidade ou medição sustentada de desempenho em computadores de laboratório. O registro atualizado está em `docs/TESTES.md`.

## 15 Riscos limitações e próximos passos

### Como alguém burla o jogo

A pessoa pode decorar atalhos ou memorizar a ordem em vez de observar o material. Estrelas usam precisão sobre o lote total, e o domínio bloqueia eventos repetidos para a mesma identidade; isso reduz exploração por cliques duplicados. Um bom resultado permanece uma medida de desempenho no jogo, não uma certificação de comportamento ambiental.

### Risco de mensagem errada

Cores de lixeira não garantem que o município aceite todo objeto daquele material. Preparação não deve ensinar lavagem obrigatória, e rejeito no modelo simplificado não resolve todas as rotas de destinação. O conteúdo explicita variação local; resíduos perigosos, eletrônicos, lâmpadas e outras rotas especiais não são classificados como lixo comum por analogia com o catálogo.

### O que ficou de fora

Não há multiplayer, conta online, ranking global, sincronização entre aparelhos nem integração com calendários municipais. Música licenciada externa não é necessária para esta versão. Vídeo acadêmico, participantes, observação externa e comprovação de transferência de aprendizagem dependem do grupo.

### Próximos passos

Com mais um mês, realizar testes com público, ajustar a legibilidade e o ritmo por dados, validar o catálogo com uma cooperativa local e medir reconhecimento de novos objetos. Ampliar acessibilidade por tecnologia assistiva e perfis de dificuldade deve acompanhar a validação, sem ampliar o escopo antes de resolver os problemas observados.

## 16 Equipe uso de IA e créditos

### Divisão do trabalho

| Integrante | Matrícula | Contribuição |
|---|---|---|
| A informar pelo grupo | A informar | Registrar contribuição real e arquivos correspondentes |

Nenhum nome, matrícula ou distribuição de trabalho foi inventado. Cada integrante deverá saber explicar as regras, a separação do código e as decisões de design.

### Uso de IA e ferramentas

Codex, da OpenAI, foi utilizado para analisar o projeto Pygame fornecido, propor o redesign, gerar código JavaScript, ilustrações vetoriais programáticas, testes automatizados e rascunhos de documentação. Os arquivos gerados estão no projeto de navegador. A revisão humana do grupo e as alterações feitas por seus integrantes devem ser registradas antes da entrega; o uso de IA não substitui essa responsabilidade. Vite, Phaser e Vitest são dependências de terceiros com suas licenças próprias.

### Referências

- Tiago Ruiz de Castro. Aula Desafio P2, 12/11/2026, e Modelo GDD Desafio P2, materiais fornecidos pelo usuário. Fundamentam a estrutura e os critérios acadêmicos.
- Prefeitura de Vinhedo. Coletas seletiva e orgânica. https://www.vinhedo.sp.gov.br/portal/secretarias-paginas/165/coletas-seletiva-e-organica/ . Orienta retirar excesso de resíduos e acondicionar vidros para evitar acidentes.
- Secretaria de Saúde do Estado de São Paulo. Coleta seletiva. https://saude.sp.gov.br/resources/centro-pioneiro-em-atencao-psicossocial-ajje/homepage/downloads/outros-assuntos/coleta_seletiva.pdf . Referência de materiais e rejeitos, com limitações locais.
- Phaser. Documentação oficial. https://docs.phaser.io/ . Referência do motor.
- Projeto TrilhaSeletiva em Python e Pygame, fornecido no ZIP pelo usuário. Origem das cinco fases e do catálogo; autoria e licença não presumidas.

## Anexo A Trechos centrais

Como o projeto utiliza código de texto, grafos de motor visual não se aplicam. Os trechos abaixo foram extraídos dos arquivos da reconstrução.

### Resolução única

`src/systems/session.js`, `Session.canResolve`: bloqueia índice inválido, ação repetida e resolução durante a pausa ou depois do fim.

```javascript
canResolve(uid) {
  return !this.paused && !this.finished && Number.isInteger(uid)
    && uid >= 0 && uid < this.deck.length && !this.resolved.has(uid);
}
```

### Classificação e preparação

`src/systems/session.js`, `Session.resolve`: a categoria é consultada no objeto confiável do lote, e uma embalagem marcada com restos só acerta depois da preparação.

```javascript
const item = this.deck[uid];
const ok = choice === item.category && (!item.needsPrep || prepared);
const reason = ok ? 'correct'
  : choice !== item.category ? 'category' : 'preparation';
```

### Precisão final

`src/systems/session.js`, `Session.finish`: o lote inteiro é o denominador, depois que as ocorrências pendentes foram registradas como perdas.

```javascript
for (let uid = 0; uid < this.deck.length; uid++)
  if (!this.resolved.has(uid)) this.recordMiss(uid);
this.finished = true;
const precision = this.deck.length ? this.correct / this.deck.length : 0;
```

## Anexo B Capturas reais

As capturas da versão executada devem mostrar tela inicial, fase em andamento, acerto, erro e resultado. Não utilizar mockups como evidência de execução. A pasta de evidências e as legendas são completadas após a verificação visual.

## Pendências para a entrega acadêmica

O grupo deve preencher integrantes e matrículas, confirmar prazo e destino da entrega, registrar pelo menos um teste externo, revisar a declaração de IA, gravar um vídeo de 1 a 3 minutos com link acessível e conferir os anexos. Essas pendências não impedem o uso do jogo, mas impedem declarar a entrega acadêmica totalmente concluída.
