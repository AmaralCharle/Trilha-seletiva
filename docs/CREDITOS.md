# Créditos licenças e uso de IA

## Projeto e material fornecido

O usuário forneceu `TrilhaSeletiva.zip`, `Modelo GDD - Desafio P2 (preenchivel) (1).docx` e `Aula - Desafio P2.pdf`. O jogo original em Python/Pygame fundamenta o catálogo de 27 resíduos, as cinco fases e as regras essenciais. O ZIP não apresenta licença global explícita do código; não se atribui autoria pessoal sem informação do grupo e não se declara uma licença ampla para material de terceiros.

O modelo e a aula são materiais do professor Tiago Ruiz de Castro, da disciplina Desenvolvimento de Jogos Digitais. A estrutura de 16 seções do GDD acompanha esses materiais. As orientações acadêmicas foram utilizadas como requisitos de referência, sem simular aprovação pelo professor.

## Arte e áudio da reconstrução

As ilustrações de resíduos e de Eco em `src/ui/art.js`, os desenhos da central e os elementos de interface foram produzidos como código vetorial ou desenho programático para esta reconstrução, com assistência do Codex. Não são imagens obtidas de bancos externos, nem sprites Noto Emoji. As formas são editáveis no código e não exigem download de arte durante a execução.

Os efeitos sonoros da versão de navegador são sintetizados em tempo de execução por código. Não se presume licença de música externa e não se redistribui faixa musical de terceiros. Fontes de interface utilizam recursos disponíveis no sistema, salvo indicação contrária no pacote final.

Os PNGs Noto/DejaVu e WAVs do ZIP original foram inspecionados na auditoria e não precisam ser incluídos na reconstrução. Sua presença no original não concede licença geral ao novo projeto. Se o grupo decidir reaproveitá-los no futuro, deverá preservar os textos de licença aplicáveis e conferir a origem de cada recurso.

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

Codex, da OpenAI, auxiliou a análise estática do original, o redesign da experiência, a geração de JavaScript, as ilustrações vetoriais programáticas, testes e documentação. A assistência abrange o projeto de navegador em `src`, `tests` e `docs`. O relatório técnico distingue testes automatizados de testes externos com pessoas.

Os integrantes devem preencher seus nomes, matrículas e contribuições reais e registrar a revisão humana realizada. Não foram inventados entrevistas, participantes, aprovação de usuários, medições de aprendizagem ou resultados de desempenho em hardware não testado. A autoria e a responsabilidade da entrega acadêmica devem ser assumidas pelo grupo, que precisa saber explicar o material entregue.
