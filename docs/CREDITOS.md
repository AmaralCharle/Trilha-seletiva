# Créditos licenças e uso de IA

## Projeto e material fornecido

O usuário forneceu `TrilhaSeletiva.zip`, `Modelo GDD - Desafio P2 (preenchivel) (1).docx` e `Aula - Desafio P2.pdf`. O jogo original em Python/Pygame fundamenta o catálogo de 27 resíduos, as cinco fases e as regras essenciais. O ZIP não apresenta licença global explícita do código; não se atribui autoria pessoal sem informação do grupo e não se declara uma licença ampla para material de terceiros.

O modelo e a aula são materiais do professor Tiago Ruiz de Castro, da disciplina Desenvolvimento de Jogos Digitais. A estrutura de 16 seções do GDD acompanha esses materiais. As orientações acadêmicas foram utilizadas como requisitos de referência, sem simular aprovação pelo professor.

## Arte e áudio da reconstrução

A atualização visual 2 usa ilustrações SVG originais geradas em código com assistência do Codex. As cinco imagens de referência fornecidas pelo usuário foram utilizadas apenas como direção criativa de estilo e composição; não foram incorporadas ao jogo, copiadas como texturas nem incluídas nos arquivos distribuídos. Não se atribui a elas licença de redistribuição, autoria do grupo ou condição de domínio público.

| Recurso | Arquivo real | Origem e observação |
|---|---|---|
| 27 resíduos distintos | src/ui/art.js, itemSVG | Desenho vetorial do projeto, com assistência de IA; silhuetas, contornos e gradientes de material |
| Eco em quatro poses | src/ui/art.js, ecoPoseSVG | Robô original com repouso, celebração, orientação e erro |
| Corpos e tampas de cinco lixeiras | src/ui/art.js, binBodySVG e binLidSVG | SVGs originais separados para permitir animação; símbolos de material desenhados em código |
| Oficina, cidade e engrenagens | src/ui/factoryArt.js | SVGs originais do cenário, sem referências externas embutidas |
| Estrelas, medalha e interface | src/main.js e src/styles.css | Geometria vetorial e estilos produzidos para o projeto |
| Efeitos sonoros | src/main.js, tone | Osciladores Web Audio sintetizados localmente; sem faixa musical de terceiros |
| Fonte DejaVu Sans | public/assets/DejaVuSans.ttf | Reaproveitada do pacote original; recurso de terceiros, sem alteração |
| Aviso da fonte | public/assets/LICENCA_DejaVu.txt | Aviso Bitstream Vera/DejaVu preservado ao lado da fonte |

As ilustrações permanecem editáveis no código e são convertidas em texturas na inicialização. Não há download de arte ou consulta a um gerador de imagens durante a partida. As animações ambientais são implementadas em `src/entities/FactoryEnvironment.js`; a separação de ambiente e descarte mantém a arte fora das regras determinísticas.

A fonte DejaVu Sans contém copyright Bitstream e alterações DejaVu declaradas em domínio público no aviso fornecido. A licença Bitstream Vera permite reprodução e redistribuição da fonte com seus avisos e condições preservados; não é apropriado rotulá-la como fonte MIT ou como produção original de IA. O arquivo de aviso também inclui condições referentes a arquivos de empacotamento Debian; isso não muda a identificação da licença da fonte como Bitstream Vera/DejaVu. Fallbacks tipográficos do sistema podem ser utilizados se necessário.

Os PNGs derivados de Noto Emoji e os WAVs do original foram inspecionados na auditoria e não são usados como arte principal ou áudio da reconstrução. A permissão de um recurso não implica licença geral sobre todo o ZIP original. Não há música de fundo externa nesta versão.

## Dependências de software

| Dependência | Versão direta | Licença | Referência |
|---|---|---|---|
| Phaser | 3.90.0 | MIT | https://github.com/phaserjs/phaser |
| Vite | 6.4.6 | MIT | https://github.com/vitejs/vite |
| Vitest | 4.1.12 | MIT | https://github.com/vitest-dev/vitest |

As licenças das dependências transitivas permanecem nos respectivos pacotes. `package-lock.json` registra as versões resolvidas. Não se declara propriedade sobre bibliotecas de terceiros.

## Fontes do conteúdo educacional

Consulta em 19/11/2026. As fontes descrevem seus contextos e não tornam universal a aceitação de resíduos em qualquer município.

- Prefeitura de Vinhedo. Coletas seletiva e orgânica. https://www.vinhedo.sp.gov.br/portal/secretarias-paginas/165/coletas-seletiva-e-organica/ . Orientação para retirar excesso de restos e acondicionar vidros com segurança.
- Secretaria de Saúde do Estado de São Paulo. Coleta seletiva. https://saude.sp.gov.br/resources/centro-pioneiro-em-atencao-psicossocial-ajje/homepage/downloads/outros-assuntos/coleta_seletiva.pdf . Referência de categorias e materiais que exigem atenção.
- CONAMA 275/2001, cópia em repositório oficial de Minas Gerais. https://www.siam.mg.gov.br/sla/download.pdf?idNorma=291 . Referência das cores, sem funcionar como catálogo universal de aceitação.
- Prefeitura do Campus USP Fernando Costa. Guia de descarte de recicláveis. https://ambiental.puspfc.usp.br/wp-content/uploads/2024/07/Guia-de-Descarte-Reciclaveis.pdf . Retirada de excesso de resíduos, sem necessidade de lavar tudo.
- Prefeitura de Nova Santa Rosa. Orientação sobre acondicionamento de vidro quebrado. https://novasantarosa.pr.gov.br/poder-publico-faz-alerta-sobre-a-importancia-de-acomodar-vidro-quebrado-de-maneira-segura-para-a-coleta-seletiva/ . Recipiente rígido e identificação.

## Declaração de uso de IA

Codex, da OpenAI, auxiliou a análise estática do original, o redesign da experiência, a geração de JavaScript, as ilustrações vetoriais programáticas, testes e documentação. Na atualização visual 2, essa assistência abrange o novo ambiente em camadas, os resíduos individuais, as poses de Eco, as lixeiras com partes separadas e os estados da interface. A assistência abrange o projeto de navegador em `src`, `tests` e `docs`. O relatório técnico distingue testes automatizados de testes externos com pessoas.

Os integrantes devem preencher seus nomes, matrículas e contribuições reais e registrar a revisão humana realizada. Não foram inventados entrevistas, participantes, aprovação de usuários, medições de aprendizagem ou resultados de desempenho em hardware não testado. A autoria e a responsabilidade da entrega acadêmica devem ser assumidas pelo grupo, que precisa saber explicar o material entregue.
