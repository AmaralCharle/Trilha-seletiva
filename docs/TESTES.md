# Verificações executadas

Data: 19 de novembro de 2026. Ambiente: Windows, Node.js25.0.0, npm11.6.2; navegador integrado baseado em Chromium. Phaser3.90.0, Vite6.4.6, Vitest4.1.12.

## Automação

`npm install` concluído. `npm test`:26 testes aprovados em3 arquivos, cobrindo pontuação, combo, penalidades, bônus, precisão, meta, estrelas, pausa, resolução duplicada, prazo, contabilização de pendentes, preparação, revisão, armazenamento corrompido/indisponível, CSV e jornada das cinco fases no domínio. Não corresponde a uma passagem manual de cinco fases.

`npm run build` concluído. O aviso de pacote JavaScript acima de500kB é esperado pelo Phaser empacotado; não impede execução. Auditoria de dependências após atualização:zero vulnerabilidades conhecidas reportadas pelo npm. A versão de produção foi servida com `npm run preview` e abriu o menu e todas as ilustrações carregadas localmente. A falha inicial de dataURI SVG encontrada durante desenvolvimento foi corrigida para base64 antes desta verificação.

## Verificação no navegador

| Situação | Evidência observada |
|---|---|
| Primeiro acesso | Menu, instruções e fases2–5 bloqueadas |
| Tutorial | Três itens resolvidos, 100%,40 pontos, resultado exibido |
| Acerto | Mouse na lixeira e teclado; retorno de10 pontos |
| Erro | Dica por material e resultado abaixo da meta |
| Arraste | Balde plástico arrastado até PLÁSTICO na revisão, acerto registrado |
| Item perdido | Fase1 terminou com4 perdas e12 itens contabilizados |
| Conclusão da tentativa | Resultado17%,2 acertos,6 erros,4 perdas; nenhuma estrela |
| Pausa | Modal, entradas de classificação bloqueadas pela sessão; teste automatizado de congelamento temporal |
| Reinício | Reinício pela pausa da revisão, HUD voltou a0 |
| Abandono | Volta à trilha sem gravar revisão interrompida |
| Persistência | Tentativa fase1 e som desligado preservados após recarregar |
| Revisão | Itens com erro reapresentados, um parado por vez, sem relógio |
| Exportação | Download real CSV e leitura do cabeçalho e da tentativa coerentes com resultado |
| Áudio | Alternância de som e estado salvo verificados; qualidade audível não aferida |
| Assets | Menu e telas com SVGs e fonte local renderizados; todos27 SVGs pré-carregados no início |
| Produção | Distribuição Vite aberta por HTTP no navegador integrado |

## Limites da verificação

Fim do tempo, aprovação/desbloqueio, repetição do mesmo item e jornada completa de cinco fases foram cobertos por automação do domínio. Não houve passagem manual de todas as cinco fases, teste com pessoas externas, medição sustentada de FPS, certificação de acessibilidade, execução em Chrome/Edge nativos ou toque em aparelho físico. Layout validado visualmente em1280×720 no navegador integrado; telas menores ainda precisam de validação. O jogo prioriza desktop em orientação horizontal. Não existe música de fundo; efeitos são sintetizados localmente.

O progresso mantém as últimas500 tentativas e é específico do navegador e endereço. Trocar porta/servidor não transfere os dados. Nenhuma melhora de aprendizagem foi medida. Teste externo, integrantes/matrículas e vídeo público de1–3min continuam pendentes para a entrega acadêmica.
