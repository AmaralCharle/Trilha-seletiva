# Verificações da versão 3.3

70 testes em 9 arquivos; detalhes da câmera, matriz visual e entradas em [MOBILE_3_3.md](MOBILE_3_3.md). Medições e screenshots reais em capturas-v33. As seções abaixo registram versões anteriores.

# Verificações da versão 3.2

67 testes em 9 arquivos aprovados; build Pages concluído. Reset seletivo, migração e fallback, hitboxes e geometria mobile possuem novos casos. Os testes de interface, dimensões, evidências e limites estão em [MOBILE_3_2.md](MOBILE_3_2.md). O relato abaixo é histórico da versão 3.1.

# Verificações da versão 3.1

Ambiente: Windows, Node.js25.0.0, npm11.6.2, Phaser3.90.0, Vite6.4.6, Vitest4.1.12. Navegador integrado baseado em Chromium. Data19/11/2026.

## Comandos e automação

npm install foi executado e o npm informou zero vulnerabilidades conhecidas. npm test final aprovou62 testes em 8 arquivos. npm run build gerou a distribuição de produção. O aviso de bundle acima de 500kB é esperado pelo Phaser incluído localmente; o pacote minificado de JavaScript fica em torno de 1,58 MB, 373kB comprimido.

Os testes abrangem cinco fases, precisão, estrelas, preparação, duplicatas, tempo e perdas;400 lotes de campanha em 80 sementes, categorias e cotas;300 itens do gerador contínuo;1400 decisões no arcade e limites de velocidade/memória;combos10/20/30;três vidas e game over;ranking10, ordem e persistência isolada;preferências antigas;arquivos WAV reais;controle de áudio com uma voz;pausa, fades e ausência de loop no Game Over;skip, callback atrasado e gravação única do resultado.

Uma execução do teste de 400 lotes excedeu o limite de 5 segundos no ambiente ocupado. O cálculo de viabilidade foi otimizado para reutilizar a contagem de categorias por passo, removendo recontagem para cada candidato. O mesmo conjunto de sementes e invariantes foi preservado; a execução final passou, sem apenas ampliar o timeout.

## Testes reais no navegador nesta rodada

| Situação | Resultado observado |
|---|---|
| Acesso ao arcade | Disponível no menu sem concluir a campanha; apelido aceito e cinco lixeiras visíveis |
| Novo desafio | Três vidas, zero pontos, onda 1 e geração em andamento |
| Acerto e recorde | PET em plástico gerou10 pontos e aviso NOVO RECORDE |
| Pausa e retomada | Modal bloqueou entradas; pontuação permaneceu na retomada |
| Perda de três vidas | Três itens perdidos encerraram a tentativa; os demais pendentes não retiraram vidas extras |
| Game Over 3.1 | GAME OVER e a mensagem da central, 10 pontos, combo 1, onda 1,1 acerto, 3 perdas, 25% e primeiro lugar local |
| Ignorar animação | Botão Pular animação acionado com sucesso; resultado permaneceu aberto |
| Reiniciar o arcade | Tentar novamente criou sessão com três vidas e zero pontos |
| Ranking | Marca de 10 pontos acima das tentativas de zero; apelido e data exibidos; sobreviveu a recarregar |
| Campanha por tempo | Fase2 terminou com TEMPO ESGOTADO, 0/16,16 perdas, dica educativa e nenhum botão de próxima fase |
| Registro único | Histórico era3 tentativas antes do teste de prazo e passou a4; abandono do reinício não acrescentou tentativa |
| Reinício da campanha | Tentar novamente restaurou tempo60 s, zero pontos e lote16 |
| Progresso anterior | As três estrelas da fase 1 e o desbloqueio da fase 2 permaneceram; fase 3 continuou bloqueada |
| Preferências de áudio | Música23%, efeitos34% e som ligado preservados após recarregar; amostra acionada sem erro de console |
| Recursos | Ilustrações, poses, fontes e áudios locais carregados; nenhum erro de console observado nas telas verificadas |

As capturas desta rodada estão em docs/capturas-v3. Os apelidos QA são rótulos de testes operados pelo assistente, não participantes externos. Os resultados da rodada anterior abaixo são históricos, não devem ser atribuídos ao novo gerador.

## Limitações

A jornada das cinco fases e ondas avançadas foram verificadas por automação de regras, sem passagem manual completa atual. Não houve testes com jogadores externos, medição sustentada de FPS, qualidade musical avaliada por especialistas, Chrome/Edge nativos ou toque em aparelho físico. A reprodução única e o não sobrepor músicas foram verificados com mocks do SoundManager e leitura do controle, além de carregamento sem erros no navegador; não houve medição acústica da saída de áudio.

As cinco fases mantêm seu balanceamento; o arcade e o novo embaralhamento ainda precisam de testes humanos. Rankings locais podem ser alterados por quem controla o navegador e não servem como avaliação acadêmica confiável por si sós. Falhas de armazenamento têm fallback em memória e aviso.

# Histórico das verificações anteriores

# Verificações executadas

## Versão 2.0.0 e atualização visual 2

Nesta rodada, `npm test` concluiu com 29 testes aprovados em quatro arquivos: os 26 testes existentes e três contratos de arte em `tests/art.test.js`. Os novos casos verificam 27 SVGs distintos e sem recursos HTTP embutidos, quatro poses distintas de Eco, corpos e tampas separados para as lixeiras, camadas do ambiente e codificação de Unicode. `npm run build` passou.

A verificação manual no navegador integrado baseado em Chromium completou a fase 1: 12/12 acertos, 100%, 220 pontos, três estrelas e zero perdas; o botão de próxima etapa foi exibido e a trilha mostrou a fase 2 desbloqueada. O tutorial foi concluído com 3/3 e 40 pontos. Arrastar o jornal até PAPEL, classificar pelas teclas 1 e 2 e pausar/retomar foram observados; a pausa bloqueou a classificação. Na revisão, enviar um balde plástico a REJEITO exibiu dica pelo material e Eco com expressão de erro. Cinco capturas em 1280×720 registram a nova apresentação em `docs/capturas-v2`. Não houve nova passagem manual por todas as cinco fases nem teste externo de aprendizagem.


A verificação final observou menu, trilha e revisão com cinco lixeiras em 960×540; menu, jogo e resultado em 1280×720; e menu em 1600×900. Foram corrigidas duas sobreposições em largura até 1100: a faixa de estatísticas decorativas do menu deixou de disputar espaço com o rodapé, e a altura mínima do HUD foi ajustada para não cobrir a missão. `npm run build` passou novamente; a distribuição servida na porta 4173 renderizou menu e cenário, e seus logs filtrados não apresentaram erros observados. O diff Git confirmou ausência de alterações em domínio, configurações e dados. Não houve medição sustentada de FPS, teste em Chrome/Edge nativos ou toque em aparelho físico.

As verificações específicas da arte e as pendências da rodada estão em `VISUAL_2.md`.

## Registro histórico da primeira versão visual

Os resultados abaixo pertencem à verificação anterior da primeira apresentação. Sua manutenção documenta a origem das evidências e não afirma que todos esses casos foram repetidos na atualização visual 2.

Data: 19 de novembro de 2026. Ambiente: Windows, Node.js25.0.0, npm11.6.2; navegador integrado baseado em Chromium. Phaser3.90.0, Vite6.4.6, Vitest4.1.12.

## Automação

`npm install` concluído. `npm test`:26 testes aprovados em 3 arquivos, cobrindo pontuação, combo, penalidades, bônus, precisão, meta, estrelas, pausa, resolução duplicada, prazo, contabilização de pendentes, preparação, revisão, armazenamento corrompido/indisponível, CSV e jornada das cinco fases no domínio. Não corresponde a uma passagem manual de cinco fases.

`npm run build` concluído. O aviso de pacote JavaScript acima de 500kB é esperado pelo Phaser empacotado; não impede execução. Auditoria de dependências após atualização:zero vulnerabilidades conhecidas reportadas pelo npm. A versão de produção foi servida com `npm run preview` e abriu o menu e todas as ilustrações carregadas localmente. A falha inicial de dataURI SVG encontrada durante desenvolvimento foi corrigida para base64 antes desta verificação.

## Verificação no navegador

| Situação | Evidência observada |
|---|---|
| Primeiro acesso | Menu, instruções e fases2–5 bloqueadas |
| Tutorial | Três itens resolvidos, 100%,40 pontos, resultado exibido |
| Acerto | Mouse na lixeira e teclado; retorno de 10 pontos |
| Erro | Dica por material e resultado abaixo da meta |
| Arraste | Balde plástico arrastado até PLÁSTICO na revisão, acerto registrado |
| Item perdido | Fase1 terminou com 4 perdas e12 itens contabilizados |
| Conclusão da tentativa | Resultado17%,2 acertos, 6 erros, 4 perdas; nenhuma estrela |
| Pausa | Modal, entradas de classificação bloqueadas pela sessão; teste automatizado de congelamento temporal |
| Reinício | Reinício pela pausa da revisão, HUD voltou a0 |
| Abandono | Volta à trilha sem gravar revisão interrompida |
| Persistência | Tentativa fase 1 e som desligado preservados após recarregar |
| Revisão | Itens com erro reapresentados, um parado por vez, sem relógio |
| Exportação | Download real CSV e leitura do cabeçalho e da tentativa coerentes com resultado |
| Áudio | Alternância de som e estado salvo verificados; qualidade audível não aferida |
| Assets | Menu e telas com SVGs e fonte local renderizados; todos27 SVGs pré-carregados no início |
| Produção | Distribuição Vite aberta por HTTP no navegador integrado |

## Limites da verificação

Fim do tempo, aprovação/desbloqueio, repetição do mesmo item e jornada completa de cinco fases foram cobertos por automação do domínio. Não houve passagem manual de todas as cinco fases, teste com pessoas externas, medição sustentada de FPS, certificação de acessibilidade, execução em Chrome/Edge nativos ou toque em aparelho físico. Layout validado visualmente em 1280×720 no navegador integrado; telas menores ainda precisam de validação. O jogo prioriza desktop em orientação horizontal. Não existe música de fundo; efeitos são sintetizados localmente.

O progresso mantém as últimas500 tentativas e é específico do navegador e endereço. Trocar porta/servidor não transfere os dados. Nenhuma melhora de aprendizagem foi medida. Teste externo, integrantes/matrículas e vídeo público de 1–3min continuam pendentes para a entrega acadêmica.

Verificação final da distribuição 3.1: servida por npm run preview na porta 4173; abertura do Desafio Infinito, cena com três vidas e pausa funcional, sem erros de console observados nessa execução.
