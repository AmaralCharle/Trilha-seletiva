# Assets da atualização visual 2

A atualização usa desenhos vetoriais originais produzidos em JavaScript com assistência do Codex, da OpenAI. O arquivo `src/ui/art.js` constrói os SVGs localmente; o Phaser rasteriza as texturas no carregamento. Nenhuma imagem de referência, pacote pago ou recurso remoto foi incorporado.

## Origem e licença

| Recurso | Origem | Licença e observação |
|---|---|---|
| 27 resíduos vetoriais | Desenhos originais em `src/ui/art.js`, com assistência de IA | CC0 1.0 para os desenhos originais desta atualização |
| Eco e suas quatro poses | Desenho original em `ecoPoseSVG`, com assistência de IA | CC0 1.0 para os desenhos originais desta atualização |
| Corpos e tampas das cinco lixeiras | Desenhos originais em `binBodySVG` e `binLidSVG`, com assistência de IA | CC0 1.0 para os desenhos originais desta atualização |
| Imagens anexadas pelo usuário | Referências de direção artística | Apenas consulta visual; arquivos não redistribuídos. A licença das referências não foi presumida |
| Fonte DejaVu Sans | Recurso já presente no projeto | Mantida a licença em `public/assets/LICENCA_DejaVu.txt` |

Dedicação CC0 dos novos desenhos vetoriais: https://creativecommons.org/publicdomain/zero/1.0/. Essa dedicação se aplica às novas ilustrações, sem alterar as licenças de bibliotecas, fontes ou de materiais de referência.

As referências orientaram o uso de volumes suaves, materiais reconhecíveis, paleta ecológica, expressão amigável do mascote e apresentação recompensadora de resultados. O design do robô, as silhuetas dos objetos e as peças industriais foram desenhados para o projeto. Não há logotipos de produtos ou imagens comerciais recortadas nos sprites.

## Contrato dos desenhos

- `itemSVG(id)` entrega um SVG diferente para cada um dos 27 IDs reais do catálogo. Usa uma área lógica de 256 × 256, com preenchimentos em gradiente, contornos, detalhes de material e sombra de contato.
- `ecoPoseSVG(state)` aceita `idle`, `happy`, `guide` e `error`. Cada pose muda expressão e braços; felicidade inclui brilho, orientação inclui indicação e erro inclui uma gota discreta. `ecoSVG` mantém compatibilidade com a pose de espera.
- `binBodySVG(category)` produz o corpo em área lógica de 180 × 155, com símbolo branco do material, textura simplificada, rodas, volume e etiqueta inferior livre para o texto vivo do jogo.
- `binLidSVG(category)` produz uma tampa separada, em área lógica de 190 × 32, permitindo animar abertura, inclinação ou retorno pelo Phaser sem alterar o corpo.
- `svgURL(svg)` gera data URI base64 compatível com SVGLoader e imagens DOM, incluindo caracteres UTF-8.

O arquivo de arte não decide classificação, pontuação, meta ou desbloqueio. Ele recebe apenas identificadores e estados visuais. As cores das lixeiras continuam acompanhadas de nome, atalho e símbolo do material na integração.

## Verificação dos recursos

Os 27 IDs foram comparados ao catálogo real: todos têm arte e os 27 SVGs são distintos. As quatro poses de Eco e os cinco pares de corpo/tampa foram rasterizados com Sharp e inspecionados em pranchas locais. Não foram observados recortes ou falhas de desenho. A validação dessa prancha verifica os recursos; a legibilidade final depende também da escala e da integração no navegador, registrada no relatório de testes da atualização.
