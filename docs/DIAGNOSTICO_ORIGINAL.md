# Diagnóstico do projeto original Trilha Seletiva

Análise estática do conteúdo fornecido em `TrilhaSeletiva.zip`, realizada em 19/11/2026. O original foi preservado. Esta análise não equivale à execução ou validação do programa Python com pessoas.

O projeto já tem um ciclo completo em Pygame, cinco lições, classificação, arraste, atalhos, pontuação, dicas, pausa, desbloqueio e revisão. Sua principal oportunidade é transformar a apresentação simples em uma central de triagem com objetos reconhecíveis, instruções curtas e retorno de ações claro. Antes disso, a reconstrução deve corrigir a contabilização de itens no fim do tempo, o arraste que permite parar um resíduo indefinidamente e as recomendações universais de enxágue.

## Arquivos analisados e responsabilidades

Todos os 21 arquivos Python foram lidos: `main.py`, `jogo.py`, `config.py`, `catalogo.py`, `esteira.py`, `item.py`, `lixeira.py`, `placar.py`, `progresso.py`, `audio.py`, `efeitos.py`, `ui.py`, os oito arquivos de `telas/` (incluindo `__init__.py`) e `ferramentas/gerar_assets.py`. Também foram lidos `README.md`, `requirements.txt` e as duas declarações de licença em `data/`.

`main.py` inicia `Jogo`. O loop limita o delta a 0,1 s e alterna entre início, instruções, trilha, lição, resultado e final. Cada tela recebe eventos, atualiza e desenha. A janela tem 960 × 640 a 60 FPS. `Esteira` controla fila, spawn e movimento. `Item` armazena estado de sujeira, posição, idade e arraste. `Lixeira.receber` classifica. `Placar` calcula resultados; `Progresso` salva JSON e anexa CSV.

## Catálogo original completo

| Material | IDs | Observação |
|---|---|---|
| Papel | jornal, caixa_papelao, folha_caderno, envelope, revista, tubo_papel | 6 itens |
| Plástico | garrafa_pet, frasco_shampoo, sacola_plastica, pote_margarina, balde_quebrado | 5 itens |
| Vidro | garrafa_vidro, pote_geleia, long_neck | 3 itens |
| Metal | lata_refri, lata_milho, lata_sardinha, marmita_aluminio, frigideira | 5 itens |
| Rejeito | cupom_fiscal, caixa_pizza, guardanapo, espelho, xicara, esponja, bituca, fralda | 8 itens |

Os seis itens confundíveis são cupom_fiscal, caixa_pizza, guardanapo, espelho, xicara e esponja. Os cinco que podem receber sujeira na geração de partidas são pote_margarina, pote_geleia, lata_milho, lata_sardinha e marmita_aluminio. A cópia bruta de todos os campos foi extraída para o arquivo de trabalho `work/catalog.json`; o catálogo da reconstrução está em `src/data/catalog.js` com os mesmos 27 IDs e dicas revistas.

## Parâmetros das fases

| Fase | Resíduos | Lixeiras | px/s | Intervalo | Tempo | Meta | Confundíveis | Sujos | Pausa na dica |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1 Papel ou plástico | 12 | 2 | 70 | 2,6 s | livre | 75% | 0% | 0% | sim |
| 2 Entram vidro e metal | 16 | 4 | 95 | 2,2 s | 60 s | 80% | 0% | 0% | sim |
| 3 Nem tudo recicla | 20 | 5 | 115 | 1,9 s | 60 s | 80% | 45% | 0% | não |
| 4 Sujo contamina | 20 | 5 | 130 | 1,8 s | 65 s | 80% | 30% | 40% | não |
| 5 Hora do rush | 26 | 5 | 160 | 1,4 s | 55 s | 85% | 40% | 30% | não |

Revisão original: até dez IDs errados, 80 px/s, intervalo 2,4 s, sem cronômetro, cinco lixeiras, meta zero e pausa na dica. A fração de sujos é aplicada ao total da fase, não apenas às embalagens elegíveis. Confundíveis e sujos são escolhidos com reposição; os demais usam um baralho embaralhado. A tentativa de evitar duplicatas adjacentes faz uma troca simples, sem garantir que todas desapareçam. O comentário que promete percorrer todas as lixeiras não corresponde a uma garantia por categoria.

## Regras originais

Acerto soma 10 pontos; a partir do terceiro acerto seguido, soma 20. Cada cinco acertos seguidos devolvem 2 s em fases cronometradas. Erro de lixeira, contaminação e desperdício zeram sequência e retiram 3 s; item perdido também. Enxaguar custa 1,5 s, inclusive em item limpo. O relógio é limitado a zero. O item desaparece em qualquer descarte, certo ou errado.

O código calcula precisão como acertos divididos por resolvidos, embora um comentário de `config.py` diga acertos divididos pelos itens da lição. Estrelas: zero se tempo esgotou ou precisão abaixo da meta; uma se cumpriu a meta; duas a partir de 90%; três com 100%. O original não exige explicitamente que todos os itens estejam contabilizados na rotina de estrelas.

## Persistência e métricas

`saves/progresso.json` guarda melhores estrelas por fase, conjunto de IDs para revisar e histórico por fase. A próxima fase exige estrelas na anterior. A revisão não entra no histórico JSON. O CSV mantém data/hora, fase, conclusão, estrelas, acertos, três tipos de erro, perdidos, precisão, erros/minuto, tempo médio de decisão, confundíveis vistos/acertados, enxágues necessários/desnecessários, duração e pontos. Ao zerar progresso, o CSV permanece.

O carregamento tolera JSON inválido e erro de leitura, mas não valida estrutura/tipos dos dados válidos. A gravação não captura indisponibilidade de disco ou permissão. Não foram fornecidos saves nem métricas de jogadores. A tela final compara fases diferentes e declara domínio de descarte sem evidência suficiente para essa conclusão.

## Problemas que precisam ser corrigidos

1. Quando o tempo acaba, resíduos ativos e ainda na fila não são registrados como não resolvidos. Precisão e erros ficam incompletos.
2. O arraste suspende movimento indefinidamente. Ao soltar fora da lixeira, o item conserva a coordenada x do mouse; isso permite reposicioná-lo para ganhar tempo e pode sobrepor cartões.
3. Durante a fila de eventos, um item enviado por teclado pode continuar em `arrastado` e voltar a ser enviado na soltura. `item.kill()` não é uma proteção idempotente de domínio.
4. A revisão remove qualquer ID com pelo menos um acerto, mesmo se o mesmo ID também foi errado naquela tentativa. O resultado da revisão sempre anuncia realização, independentemente de domínio.
5. O tutorial só aponta o primeiro item da fase 1; não tem prática separada, repetição ou mascote.
6. A dica com pausa se fecha sozinha após 3,5 s. Não há garantia de tempo de leitura adequado.
7. Enxágue obrigatório e recomendação de enxaguar qualquer embalagem suja simplificam excessivamente a preparação e incentivam uso de água. O objetivo deve ser retirar restos, sem simular lavagem universal.
8. Apenas embrulhar cacos em jornal é uma orientação insuficiente de proteção. Usar recipiente resistente, fechado e identificado e consultar o serviço local.
9. Não há tratamento de falha ao carregar fonte/imagem, layout responsivo, controle de volume, tela de créditos ou exportação acionada na interface.
10. Não há testes automatizados no ZIP. A execução visual do original não foi feita nesta auditoria.

## Assets e licenças

São 30 PNGs de 72 × 72 (27 resíduos e três ícones de interface), sete WAVs e duas fontes TTF. Os 30 PNGs foram abertos com Pillow e suas dimensões conferidas; os sete WAVs foram abertos com a biblioteca wave: todos são PCM mono, 16 bits e 44.100 Hz, com duração entre 0,04 s e 0,8 s. O gerador revela que a maior parte dos ícones deriva de Noto Color Emoji; oito resíduos têm desenho programático próprio. Os WAVs são ondas sintetizadas por código. A inspeção estrutural não substitui ouvir os sons e verificar a legibilidade dos ícones em tela.

O arquivo `LICENCA_NotoEmoji.txt` é apenas uma declaração curta com links, não a íntegra da licença. A declaração diz SIL OFL 1.1 para a fonte usada. O material inclui DejaVu Sans regular/negrito e texto de licença Bitstream Vera/DejaVu. O ZIP não tem licença global explícita do código. A reconstrução produzirá vetores próprios para os resíduos e a central, evitando o uso de emojis como arte principal e a dependência dos PNGs originais. A autoria e permissão do código original devem permanecer atribuídas ao projeto fornecido, sem inventar nome de integrante.

## Manter, corrigir e aprimorar

Manter: problema educacional, 27 exemplos, cinco fases e parâmetros-base, nomes/números além das cores, pontuação, sequência, estrelas, revisão e armazenamento local.

Corrigir: fechamento da tentativa com denominador total, estados terminais únicos, descarte idempotente, arraste/retorno, revisão por desempenho observado, preparação sem lavagem universal e dicas sobre materiais cortantes. Usar comparações de primeira/última tentativa da mesma fase e evitar afirmar impacto no mundo real.

Aprimorar: arte vetorial original, robô Eco, central animada, tutorial praticável, retorno visual/sonoro, contraste e foco de teclado, tela de resultado com dificuldades, exportação CSV e documentação rastreável ao código real.

## Referências pedagógicas verificadas

As fontes abaixo sustentam as correções; não confirmam a aceitação de todos os materiais em qualquer município. Consulta em 19/11/2026.

- [Resolução CONAMA 275/2001 em repositório oficial de Minas Gerais](https://www.siam.mg.gov.br/sla/download.pdf?idNorma=291): estabelece as cores; não é um catálogo universal de materiais aceitos.
- [Guia de descarte de recicláveis da Prefeitura do Campus USP Fernando Costa](https://ambiental.puspfc.usp.br/wp-content/uploads/2024/07/Guia-de-Descarte-Reciclaveis.pdf): orienta retirar excesso de resíduos, sem necessidade de lavar.
- [Cartilha de práticas sustentáveis do TRT da 3ª Região](https://portal.trt3.jus.br/internet/institucional/gestao-sustentavel/download/cartilha_web_sust_acessivel-1.pdf): orienta retirar restos de alimentos e líquidos, sem lavar todas as embalagens.
- [Prefeitura de Nova Santa Rosa sobre vidro quebrado](https://novasantarosa.pr.gov.br/poder-publico-faz-alerta-sobre-a-importancia-de-acomodar-vidro-quebrado-de-maneira-segura-para-a-coleta-seletiva/): recipiente rígido e identificação.
- [Prefeitura de João Neiva sobre os materiais aceitos em seu coletor de vidro](https://www.joaoneiva.es.gov.br/noticia/ler/3889/prefeitura-instala-caixa-coletora-para-recolhimento-de-vidros-para-a-reciclagem): diferencia embalagens de espelhos, cerâmicas e porcelanas e evidencia regras locais de encaminhamento.

Itens como papel térmico e materiais compostos continuam descritos como decisões do cenário, sujeitas à orientação local. O jogo não inclui pilhas, lâmpadas ou resíduos de saúde, que exigem rotas específicas.
