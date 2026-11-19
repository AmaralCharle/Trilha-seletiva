# Atualização visual 2 de Trilha Seletiva

A atualização reconstrói a apresentação da central e da interface mantendo as regras de classificação, pontuação, fases, métricas e progresso. O diagnóstico desta rodada é visual: a primeira versão já fechava o ciclo de jogo, mas usava formas simples, ambiente escuro e menos variação de silhueta entre objetos. O objetivo desta atualização é melhorar reconhecimento, hierarquia visual e resposta das ações sem alterar o domínio.

## Mudanças implementadas por inspeção de código

- Oficina cartoon clara, paredes verde-menta, piso de madeira, janela em arco, bairro, máquinas, tubulações e plantas em `src/ui/factoryArt.js`.
- Ambiente separado em camadas, com engrenagens, reflexos de roletes, indicadores, movimento discreto da cidade e apresentação de Eco em `src/entities/FactoryEnvironment.js`.
- Ilustrações individuais para os 27 resíduos, gradientes por material, reflexos, contornos e sombras em `src/ui/art.js`.
- Eco com quatro poses, lixeiras com corpo e tampa separados e símbolos de material no mesmo módulo de arte.
- Cena com criação de destinos em `createBin`, animação de tampa em `animateBin`, partículas em `feedbackParticles` e limpeza dos efeitos entre estados em `clearEffects`.
- Painéis claros, botões com relevo, trilha conectada, estados de etapa, estrelas vetoriais, medalha e expressão de Eco contextual em `src/main.js` e `src/styles.css`.
- Fonte DejaVu Sans local com aviso Bitstream Vera/DejaVu em `public/assets`.

Os SVGs são texturas carregadas na inicialização; as camadas móveis são objetos leves atualizados por delta. `prefers-reduced-motion` é consultado no ambiente e no CSS, reduzindo animações decorativas. Não há medição de FPS sustentado que permita afirmar uma taxa garantida de desempenho.

## Recursos e referências

As cinco imagens fornecidas nesta rodada foram referências de direção criativa. Elas não foram incluídas no pacote nem incorporadas como texturas, e nenhuma licença de redistribuição foi presumida. Os SVGs são criações em código para o projeto com assistência de IA; DejaVu Sans é o recurso de terceiros efetivamente empacotado, com seu aviso preservado. O inventário está em `CREDITOS.md`.

## Regras preservadas

Os módulos de `src/config`, `src/data` e `src/systems`, bem como os 26 testes existentes, não fazem parte da alteração visual. Foram acrescentados três contratos de arte em `tests/art.test.js`, totalizando 29 testes em quatro arquivos. Continuam válidos o lote de cinco fases, a resolução única, as metas, estrelas, preparação por retirada de restos, revisão, métricas e exportação. A ausência de alteração no domínio não prova ausência de regressão de integração. Os casos de arraste, destino, pausa e carregamento observados nesta rodada estão registrados abaixo; outros casos não repetidos permanecem identificados como históricos.

## Verificação desta atualização

Versão do jogo: 2.0.0. Os 29 testes foram aprovados e o build de produção passou. No navegador integrado baseado em Chromium, a fase 1 foi completada manualmente com 12/12 acertos, 100%, 220 pontos, três estrelas e nenhuma perda; o botão de próxima etapa apareceu. O tutorial terminou com 3/3 e 40 pontos. Foram observados arraste do jornal até PAPEL, acerto pelas teclas 1 e 2 e bloqueio de classificação na pausa, com retomada posterior. O layout foi observado em 1280×720. Cinco capturas da rodada foram salvas em `docs/capturas-v2`: menu, trilha, acerto, erro e resultado. A trilha mostra a fase 2 desbloqueada. Na revisão, enviar o balde plástico a REJEITO exibiu dica de classificação e a expressão de erro de Eco. Os testes e observações da primeira versão em `TESTES.md` são evidências anteriores; não devem ser apresentados como validação desta nova arte.

Para futuras rodadas, repetir pelo menos: carregamento das 27 ilustrações e quatro poses, menu, tutorial, trilha, acerto, erro, seleção e arraste, atalhos, preparação, pausa e retomada, reinício, resultado, persistência, CSV, produção e preferência de movimento reduzido. Distinguir teste observado de inspeção e de teste automatizado.



A verificação final observou menu, trilha e revisão com cinco lixeiras em 960×540; menu, jogo e resultado em 1280×720; e menu em 1600×900. Foram corrigidas duas sobreposições em largura até 1100: a faixa de estatísticas decorativas do menu deixou de disputar espaço com o rodapé, e a altura mínima do HUD foi ajustada para não cobrir a missão. `npm run build` passou novamente; a distribuição servida na porta 4173 renderizou menu e cenário, e seus logs filtrados não apresentaram erros observados. O diff Git confirmou ausência de alterações em domínio, configurações e dados. Não houve medição sustentada de FPS, teste em Chrome/Edge nativos ou toque em aparelho físico.

## Documentação e evidências

As seções 9 a 13 e 16 do GDD, a arquitetura, o README e os créditos foram atualizados com os arquivos e funções reais. O Anexo B usa cinco capturas da versão 2.0.0. As capturas da primeira versão permanecem separadas em `docs/capturas` como histórico e não são apresentadas como aparência atual. O PDF foi regenerado com os dados e as capturas desta rodada e submetido à revisão visual de todas as páginas.
