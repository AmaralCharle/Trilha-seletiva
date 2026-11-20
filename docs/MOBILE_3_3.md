# Trilha Seletiva 3.3 — correção do layout em paisagem

## Causa e solução

A versão 3.2 mantinha o canvas em 1280 × 720 com FIT dentro de uma viewport muito mais larga. O cabeçalho HTML de 44 px e o HUD eram posicionados por cima dessa imagem, enquanto a barra inferior tinha seu próprio tamanho. A cena era reduzida inteira, incluindo o teto decorativo, deixando faixas laterais e pouco espaço para os resíduos. O HTML não acompanhava a proporção do canvas.

A versão 3.3 cria três regiões próprias durante a partida em paisagem curta: HUD de 50 px, canvas no espaço intermediário e ações de 44 px. O cabeçalho de navegação é ocultado somente durante esse modo; som e tela cheia continuam disponíveis na pausa. O critério considera altura até 540 px e proporção mínima 1,4, com largura maior que altura; não depende de user-agent ou de um modelo de aparelho.

O Scale Manager continua em FIT para preservar a versão desktop. Em paisagem curta, setGameSize passa a usar as dimensões reais do espaço reservado ao canvas. A câmera enquadra uniformemente a faixa jogável y=260..700 do mundo existente, centrada em (640,480). O zoom é o menor entre largura/1280 e altura/440. Isso preserva toda a esteira, cartões, etiquetas RESTOS e zonas ampliadas das lixeiras, descartando apenas a necessidade de enquadrar todo o teto e o chão decorativos. Nenhum sprite é esticado, e as posições lógicas e velocidades da simulação continuam iguais.

Em 800 × 360, o canvas agora ocupa 800 × 266, entre HUD e ações. A arte ocupa aproximadamente 774 px de largura, com margens discretas de cerca de 13 px por lado para manter toda a área interativa; antes a cena tinha cerca de 555 px. Nos outros três tamanhos curtos solicitados, a arte ocupa toda a largura. Em 1280 × 720, tablet 1024 × 768 e desktop 1600 × 900, o enquadramento original é mantido.

O HUD conserva fase/onda, pontos, sequência/combo, itens/resolvidos, precisão/tempo ou vidas, progresso e pausa. Foram reduzidos os espaços internos e organizados os rótulos e valores, sem remover indicadores. A meta e o progresso ficam na base da faixa superior.

A fala do Eco foi integrada à barra de ações no modo compacto, abaixo do nome do item. Não existe balão HTML flutuando sobre a esteira ou as lixeiras nesse modo. A barra mantém os dois botões com 40 px de altura, nome legível e até duas linhas de retorno. O layout e o balão originais são restaurados ao voltar para desktop.

## Ponteiros, resize e estado

Com a câmera ampliada, posições de toque/mouse precisam voltar ao espaço do mundo: getWorldPoint é usado no destaque e na soltura. Os eventos drag do Phaser já entregam posições de arrasto no mundo e continuam sendo reutilizados. Não foi criado outro classificador.

O gráfico arrastado com toque considera o zoom efetivo; seu deslocamento acima do dedo é limitado pelas bordas da câmera para não esconder cartões ou a etiqueta RESTOS sob o HUD. O destino continua determinado pelo ponto do dedo, sem alterar a categoria. Uma soltura inválida retorna à esteira, e pausa/resize/saída cancelam o arrasto com segurança.

visualViewport.height atualiza a altura disponível; dvh e safe-area-inset continuam como suporte e fallback CSS. Resize, orientação e fullscreen reutilizam a mesma cena e sessão. Girar para retrato pausa; voltar para paisagem ajusta a câmera e exige Continuar. Não reinicia Phaser, não recria resíduos nem reaplica eventos. O menu de pausa mantém áudio e tela cheia mesmo depois de alternar entre desktop e paisagem curta.

## Telas e evidências

As imagens e medições reais estão em docs/capturas-v33. antes-800x360.png registra a versão 3.2. Os arquivos depois-LARGURAxALTURA.png registram o layout final 3.3. medidas-layout.json contém os retângulos DOM medidos, ausência de rolagem horizontal, limites dos botões e a confirmação de que o retorno do Eco está na barra inferior nos quatro tamanhos compactos.

| Viewport | Enquadramento | Verificação |
|---|---|---|
| 800 × 360 | Compacto, canvas 800 × 266 | HUD e ações separados, cinco lixeiras, cartão inteiro, dica de duas linhas, arrasto correto |
| 844 × 390 | Compacto, canvas 844 × 296 | Cena em toda a largura, descarte único correto |
| 915 × 412 | Compacto, canvas 915 × 318 | RESTOS visível, preparação pelo botão e descarte correto |
| 960 × 440 | Compacto, canvas 960 × 346 | Cena completa, descarte e combo preservados |
| 1280 × 720 | Desktop original | Proporções, balão, HUD e arrasto preservados |
| 1024 × 768 | Tablet | Esteira/lixeiras visíveis; arrasto após múltiplos resizes |
| 1600 × 900 | Desktop original | Cena e controles proporcionais, arrasto correto |

A matriz foi observada no navegador Chromium integrado. Os retângulos dos botões estavam dentro da viewport e não havia rolagem horizontal nos sete tamanhos. Em modo compacto, o fim do HUD coincide com o início do canvas, e o fim do canvas coincide com o início das ações. O texto do Eco está contido nas ações. As capturas foram inspecionadas visualmente; não são apenas resultados de teste de fonte.

Uma sessão de revisão atravessou os tamanhos de tela com descartes corretos. Girar para 390 × 844 preservou 60 pontos e 4/12; depois de retornar e continuar, outro acerto elevou para 80 pontos e 5/12. Arrastos em desktop e tablet chegaram a 120 pontos e 7/12. Os resultados não foram gravados porque a revisão foi abandonada antes de concluir.

O Desafio Infinito iniciou com três vidas, zero pontos e onda 1. Mudar apenas a altura de 360 para 330 e voltar não reiniciou a sessão. Três perdas naturais levaram ao Game Over, e Tentar novamente restaurou o estado inicial. Os três botões do Game Over foram medidos dentro do painel em 800 × 360, 844 × 390, 915 × 412, 960 × 440 e 1280 × 720, sem rolagem horizontal; veja medidas-game-over.json e as respectivas capturas.

Foram acessados mapa, configurações, ranking, estatísticas, tutorial, confirmação de Reiniciar Trilha e cancelamento. Painéis longos mantêm rolagem interna, evitando rolagem acidental da página durante a partida. A tela de Game Over foi compactada para não cortar os botões. A vitória do tutorial também recebeu organização mais compacta, preservando estrelas e métricas. O histórico de campanha existente continuou com quatro tentativas e três estrelas na fase 1; repetir o tutorial não gerou uma tentativa de campanha.

Amostra musical e alternância de som pela pausa foram acionadas; os volumes 23%/34% permaneceram. Não houve avaliação acústica ou promessa de reprodução em todos os sistemas: o carregamento é observado no navegador e o ciclo de áudio é coberto pelos testes existentes com SoundManager simulado.

## Automação, build e publicação

npm test: 70 testes em 9 arquivos. Os três novos casos verificam enquadramento completo e projeção dos destinos em múltiplas proporções, restauração do desktop e limites do gráfico levantado por toque. Continuam os testes das cinco fases, pontuação, geração, vidas, ranking, reset seletivo, áudio e resultados únicos. Nenhuma configuração de fase, catálogo, domínio de classificação ou regra de progressão foi modificada.

npm run build e o build com GITHUB_PAGES=true são verificados antes da entrega. O bundle grande de Phaser continua emitindo aviso; isso não é ocultado nem confundido com erro. O workflow existente instala com npm ci, testa, constrói para /Trilha-seletiva/ e publica via GitHub Pages após push em main. Remote preservado, sem push forçado. A confirmação de commit e execução de publicação é fornecida na entrega após acompanhar a execução real.

URL: https://amaralcharle.github.io/Trilha-seletiva/

## Limites da validação

Os arrastos observados foram executados por mouse em viewports ajustados; a geometria específica de toque foi exercitada nos testes automatizados. Não houve aparelho Android/iPhone físico, emulação de notch real, teste acústico ou medição sustentada de FPS. A alteração de altura testa a reação ao espaço disponível, sem reproduzir todos os comportamentos das barras de cada navegador. O tamanho ultralargo 1280 × 480 também possui teste de geometria: mantém a área interativa inteira, aceitando margens maiores em vez de distorcer ou cortar itens.

As demais telas acadêmicas e o GDD até 3.1 foram preservados. MOBILE_3_2.md é histórico da primeira adaptação; este suplemento descreve a estratégia atual de câmera e separação das regiões. Não foi adicionado nenhum asset de terceiros nesta versão.

Conferência final: a vitória do tutorial em 800 × 360 mostrou três estrelas, 40 pontos, 3/3 e ambos os botões inteiramente dentro do painel. A fase 2 foi aberta com 16 itens, meta 80% e cronômetro de 60 s, usando o mesmo HUD compacto; foi abandonada pela pausa, sem registrar tentativa. O arcade foi novamente aberto no layout final com três vidas e cinco lixeiras e abandonado sem novo recorde. O console não apresentou erros nessa conferência. Capturas fase2-800x360.png, arcade-800x360.png e vitoria-tutorial-800x360.png.

Build final: npm test aprovou 70/70; npm run build e GITHUB_PAGES=true npm run build terminaram com sucesso. A distribuição foi servida em /Trilha-seletiva/ na porta 4173. Um arrasto de folha de caderno até PAPEL gerou exatamente 10 pontos e 1/12, sem erros de console observados. A fonte e os 21 WAVs carregaram nesse subcaminho com HTTP 200, e os WAVs tiveram cabeçalho RIFF validado.
