# Versão 3.1 de Trilha Seletiva

A entrega integra a evolução 3.0 e o refinamento3.1. A campanha de cinco fases e a identidade visual2 foram mantidas. A nova classificação compartilhada conserva as regras pedagógicas; o arcade utiliza contadores próprios.

## Diagnóstico e encerramento

A versão de trabalho3.0 já possuía uma tela Fim de jogo e a verificação local chegou a esse resultado após três perdas. Faltavam uma apresentação explícita GAME OVER, um estado de reação da fábrica e uma música exclusiva longa. A versão 3.1 separa o encerramento da simulação da apresentação do resultado, sem atribuir a falha a um evento que não foi reproduzido.

ResultFlow registra cada sessão uma única vez em WeakSet. onStart salva a tentativa antes da animação, e onResult apenas apresenta o resultado. Skip, término do temporizador e callbacks atrasados são idempotentes; navegar ou reiniciar cancela apresentações antigas. A cena interrompe geração e entradas quando deixa play. Perdas pendentes não geram vidas extras descontadas após o fim. Derrota não libera a próxima fase.

FactoryScene.presentDefeat congela a esteira, aplica iluminação reduzida, faz pequenas luzes reagirem e chama a apresentação após1,75 s. Movimento reduzido desativa os efeitos, preservando a oportunidade de pular. O painel final fica aberto até escolha do usuário. O domínio mantém resultados de tempo esgotado, meta não alcançada e vidas zeradas separados. Uma fase que cumpre sua condição real de aprovação continua sendo vitória, mesmo quando o prazo encerra o lote.

## Sistemas da evolução 3

- WasteSequenceGenerator e buildDeck usam Fisher–Yates, entropia nova em partidas normais e sementes explícitas para testes. Respeitam categorias, cotas e preparação; evitam trincas de categoria quando existem alternativas e reduzem ciclos curtos. A revisão mantém prioridade das dificuldades.
- InfiniteSession começa com três vidas e85 px/s; resolve uma identidade por vez, aplica combos10/20/30 e avança a cada dez decisões. Usa apenas um Map com no máximo seis pendentes e histórico recente limitado no gerador.
- getDifficulty define a tabela das ondas, limite 240 px/s e intervalo mínimo 1,1 s. A cena respeita espaçamento150 px e limite simultâneo.
- leaderboard usa chave própria, valida registros, ordena dez marcas e trata corrupção ou indisponibilidade de armazenamento. O apelido é limitado a15 caracteres e escapado na interface.
- AudioManager usa WAVs originais locais, uma voz musical, transições sem sobreposição, pausa, silêncio e volumes independentes. Há sete loops e duas vinhetas de resultado sem repetição.
- A arte foi polida com piscar e gestos de Eco, indicadores em tubulações, pequenas oscilações dos objetos e sombra ao arrastar. O cenário e os destinos existentes foram reutilizados.

## Verificação e limites

O inventário de testes executados e observações do navegador está em TESTES.md. Não houve pesquisa com usuários nesta rodada, medição sustentada de FPS ou validação manual de todas as ondas. A automação simula uma sequência longa de 1400 decisões para verificar limites de memória e velocidade. Ranking local não mede aprendizagem nem substitui as métricas da campanha.
