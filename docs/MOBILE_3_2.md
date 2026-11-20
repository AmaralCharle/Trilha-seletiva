# Mobile, reinício da trilha e GitHub Pages — 3.2

## Implementação

O jogo conserva Phaser 3, a cena de 1280 × 720, as cinco fases, as regras de classificação, a campanha e o domínio do Desafio Infinito. Não há aplicativo nativo, backend ou API externa durante as partidas.

A interface usa o viewport nas telas menores, com menus e painéis roláveis, botões de pelo menos 44 px, HUD próprio para paisagem e tabelas com rolagem interna. Durante a partida, a página não rola. O canvas permanece em FIT, com a centralização feita somente pelo Scale Manager; a combinação antiga de flex e margens do Phaser deslocava o canvas. Safe areas, 100dvh e visualViewport acomodam notch e mudanças da área disponível. O framebuffer permanece limitado à área lógica de 1280 × 720; a densidade das texturas de texto considera devicePixelRatio limitado a 2. Isso evita multiplicar todo o framebuffer por telas com DPR 3 ou 4. Phaser 3.90 não oferece a antiga opção global resolution; a densidade é aplicada pelo estilo de Text, suportado nessa versão.

Celulares e tablets em retrato recebem orientação para girar durante a partida. A sessão é pausada uma vez, com estado e áudio preservados; ao voltar para paisagem, o jogador precisa tocar em Continuar. Não há reload, nova sessão ou bloqueio obrigatório de orientação. visibilitychange, blur e pagehide também acionam a mesma pausa idempotente. A opção de fullscreen só aparece quando a API é oferecida.

O Phaser continua sendo o único sistema de ponteiros e classificação. TopOnly e um ponteiro ativo evitam selecionar objetos simultaneamente. Os resíduos têm hitbox maior (146 × 138 unidades lógicas), e os destinos usam zonas de 192 × 174, com espaços sem ambiguidade. Em toque, o gráfico sobe em relação ao dedo, mas a posição do ponteiro determina a lixeira. O destino é destacado; soltar fora devolve o objeto à esteira sem penalidade. Pausa, saída do canvas e redimensionamento cancelam o arrasto. Mouse, toque e teclado chamam a mesma função de classificação.

O nome do item selecionado também aparece em texto HTML fora do canvas. Retirar restos fica acessível por botão, além da tecla E. Elementos decorativos não recebem interação. touch-action:none é aplicado no canvas; os painéis preservam sua rolagem interna. Dispositivos que reportam até quatro núcleos usam animações ambientais reduzidas, assim como a preferência do sistema por menos movimento. O máximo de seis resíduos é preservado; pooling não trouxe benefício concreto para esse limite e não foi acrescentado.

## Reset centralizado

A chave legada trilha-seletiva-v1 reúne histórico, estrelas, desbloqueios e settings. resetProgress lê e preserva as configurações validadas/migradas e grava um novo estado inicial nessa mesma chave. Limpa todas as tentativas da campanha e revisão, incluindo dados usados para melhores resultados; somente a fase 1 fica disponível. Jogar campanha volta às instruções iniciais porque o histórico está vazio. O ranking independente trilha-seletiva-infinite-v1 e quaisquer outras chaves não são alterados. Não há localStorage.clear.

Reiniciar Trilha aparece no mapa e em Configurações. A confirmação personalizada usa o título e mensagem solicitados, CANCELAR e SIM, REINICIAR. Cancelar preserva a tela e os dados; confirmar cancela transições pendentes, remove a sessão antiga, atualiza o mapa e mostra uma confirmação visual. A falha do armazenamento mantém o fallback e o aviso existentes. Repetir tutorial abre o treino de três itens sem gravar tentativa ou alterar estrelas.

## Build e publicação

Remote preservado: https://github.com/AmaralCharle/Trilha-seletiva.git; branch real main. O repositório é público e a conta conectada tem permissão administrativa. GitHub CLI estava sem login, mas a credencial existente do gerenciador Git permitiu a configuração do Pages via REST sem salvar tokens no projeto. O conector GitHub foi usado para consultar o repositório; não oferece a configuração de Pages, por isso foi usado o fallback REST autenticado.

O Pages foi habilitado com build_type=workflow e HTTPS. .github/workflows/deploy.yml instala com npm ci, roda npm test, constrói com GITHUB_PAGES=true, envia dist e publica via ações oficiais configure-pages/upload-pages-artifact/deploy-pages. Permissões de build e deploy são separadas. O Vite seleciona /Trilha-seletiva/ apenas no build Pages; o build comum usa caminhos relativos. A fonte pública e os WAVs respeitam a base. Não há rotas de servidor: os menus são estado local na mesma página, portanto atualizar a URL principal não exige rewrite de SPA.

URL retornada pela API de Pages: https://amaralcharle.github.io/Trilha-seletiva/

A publicação em outra origem não copia o localStorage da versão anterior. Campanha, preferências e ranking continuam locais ao navegador e ao endereço acessado. A hospedagem anterior do Sites permanece com seu acesso existente; o destino solicitado nesta rodada é GitHub Pages.

## Verificação realizada

- npm test: 67 testes aprovados em 9 arquivos. Novos casos verificam reset das cinco fases/revisão, persistência após recarregar o módulo, ranking e chaves externas intactos, preferências antigas, fallback de armazenamento, áreas de descarte sem ambiguidade, deslocamento visual do toque e limite de resolução.
- Build Vite com GITHUB_PAGES=true concluído. HTML aponta para /Trilha-seletiva/assets; áudio usa import.meta.env.BASE_URL; a fonte usa a mesma base. O aviso de bundle Phaser acima de 500 kB continua visível.
- UI no navegador Chromium integrado: menu em 390 × 844, confirmação de reset e cancelamento; mapa com progresso anterior preservado; configurações com música 23% e efeitos 34%; abertura do Repetir tutorial com três itens.
- Revisão em 844 × 390: arrasto de garrafa long neck até VIDRO resultou em exatamente um acerto, 10 pontos e 1/12; soltura inválida do item seguinte manteve 10 pontos e 1/12.
- Mudança para 390 × 844 durante essa sessão exibiu o aviso de girar e a pausa; ao voltar para 667 × 375, Continuar preservou os mesmos 10 pontos e 1/12. Os cinco destinos e controles permaneceram visíveis.
- Layout adicional de 568 × 320 inspecionado; a faixa de progresso e os controles foram compactados sem remover vidas, pontos, combo ou resolvidos.

As capturas estão em docs/capturas-v32. O reset destrutivo foi validado por testes isolados; no navegador foi exercitado o cancelamento, preservando o histórico existente. Não houve validação em Android/iPhone físicos, teste multitouch real, medição sustentada de FPS ou avaliação acústica. A adaptação de toque usa a API unificada do Phaser e geometria testada; o arrasto observado no navegador foi operado por mouse em viewport pequeno. É necessário confirmar o comportamento final em Safari iOS e Chrome Android reais antes de prometer compatibilidade integral ou 60 FPS.

## Referências técnicas

- https://docs.phaser.io/phaser/concepts/input — ponteiros unificados.
- https://docs.phaser.io/api-documentation/namespace/scale — Scale Manager.
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages — workflow e permissões.

O GDD PDF existente registra a campanha e a evolução até 3.1. Este documento é o suplemento técnico da versão 3.2; os dados acadêmicos ainda pendentes não foram inventados.

Verificações adicionais: Game Over em 844 × 390 mostrou as três ações sem rolagem após compactar o painel; Tentar novamente restaurou três vidas, zero pontos e onda 1. Captura game-over-paisagem.png. Não foram executadas duas gravações de resultado para a mesma tentativa. As tentativas QA são apenas evidências técnicas, não participantes externos.

A distribuição de produção foi servida localmente em /Trilha-seletiva/. Menu, configurações e amostra musical abriram sem erros de console observados. A fonte e os 21 WAVs retornaram HTTP 200 nesse subcaminho; os WAVs também tiveram seu cabeçalho RIFF validado. O mapa em 1024 × 768 foi inspecionado com as cinco fases e ações legíveis; o menu desktop em 1280 × 720 permaneceu funcional. Captura trilha-tablet.png.
