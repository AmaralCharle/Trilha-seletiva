# Trilha Seletiva

Versão 3.3.0. Jogo educacional 2D no navegador com cinco fases de campanha, tutorial, revisão personalizada e Desafio Infinito. A identidade cartoon industrial da versão 2 foi preservada. A campanha pratica a separação dos materiais; o arcade oferece ondas e recordes locais sem alterar a progressão acadêmica.

## Executar

Instale Node.js 20.19 ou superior, ou 22.12 ou superior. Abra um terminal na pasta deste README e execute:

```powershell
npm install
npm run dev
```

Abra o endereço HTTP exibido pelo Vite, mantendo o terminal aberto. Não abra index.html por duplo clique. O layout atende desktop, tablets e celulares em paisagem. A validação desta rodada utilizou o navegador integrado baseado em Chromium, com viewports descritos em docs/MOBILE_3_2.md; Android/iOS físicos ainda precisam de verificação.

```powershell
npm test
npm run build
npm run preview
```

O build gera dist com todos os recursos locais; a instalação inicial precisa de internet, mas o jogo não depende de CDN, APIs, autenticação própria ou backend para operar. O GitHub Pages oferece uma publicação pública, sem login para jogar. O progresso é local à origem de cada navegador; não é transferido automaticamente da hospedagem anterior.

## Jogar

Mouse ou toque: selecione o objeto e a lixeira, ou arraste e solte. Teclado: 1–5 escolhem o destino, Tab muda o item, E retira restos e Esc pausa. As categorias são papel, plástico, vidro, metal e rejeito, identificadas por nome e símbolo além da cor. Retirar restos não significa lavar toda embalagem; consulte as regras da coleta do município.

Campanha: cinco fases e parâmetros originais. Acerto vale 10 pontos, ou 20 a partir do terceiro consecutivo; erro e perda descontam 3 segundos onde há relógio; cinco acertos devolvem 2 segundos. A precisão usa todo o lote, incluindo perdas e pendentes. As metas continuam 75%,80%,80%,80%,85%. A revisão apresenta um item parado por vez, sem cronômetro, priorizando dificuldades ainda não corrigidas. O tutorial permanece acompanhado e previsível para ensinar o controle; as partidas normais são embaralhadas.

## Desafio Infinito

Disponível desde o primeiro acesso. Escolha um apelido de até 15 caracteres, ou use Jogador. Comece com três vidas e todas as categorias. Erro de classificação, preparação incorreta ou item perdido retira uma vida e interrompe a sequência. Acertos valem 10 pontos, 20 a partir do terceiro seguido e30 a partir do décimo. Acertos não recuperam vidas.

Cada dez itens resolvidos inicia uma onda. A esteira começa em 85 px/s e intervalo2,5 s, cresce pela tabela em src/config/infinite.js e limita a velocidade a240 px/s e o intervalo a1,1 s. Há no máximo seis itens simultâneos e espaçamento mínimo 150 px. Ondas avançadas incluem mais confundíveis e preparação de embalagens. A geração mantém memória limitada, sem um lote infinito armazenado em RAM.

Ao perder a última vida, a partida para. A fábrica escurece, suas pequenas luzes reagem, Eco demonstra surpresa e aparece GAME OVER. A introdução dura 1,75 s e pode ser pulada. O resultado permanece aberto até Tentar novamente, Ver ranking ou Menu principal. A campanha usa a mesma identidade para TEMPO ESGOTADO ou DESAFIO NÃO CONCLUÍDO, sem receber um sistema de vidas.

O ranking guarda as dez melhores tentativas apenas neste navegador e endereço, com apelido, pontos, onda, combo, acertos, precisão e data. Limpar recordes exige confirmação e não apaga a campanha. Abandonar uma partida em andamento não insere um recorde. Dados podem ser apagados pelo navegador; não há ranking online.

## Áudio original local

Sete músicas instrumentais distintas: fases 1–5, revisão e arcade. Mais duas vinhetas sem repetição, Game Over de 6,4 s e vitória de 5,2 s, e doze efeitos. As configurações oferecem volumes independentes de música e efeitos, além de silêncio geral, preservados entre acessos. O som só começa após uma interação.

AudioManager utiliza o áudio do Phaser. Na troca de trilha, o fade-out termina e a voz anterior é destruída antes de iniciar a próxima; nunca há duas músicas simultâneas. Pausa preserva a posição, e reiniciar retoma a música do modo. No menu não há música de fundo. Se um arquivo falhar, o retorno visual continua disponível. O arquivo de Game Over existe e é reproduzido uma vez, sem loop.

```powershell
npm run audio:generate
```

Esse comando recria os WAVs e o manifesto com Node.js e bibliotecas padrão, sem baixar amostras. Créditos, síntese e limites estão em docs/AUDIO_3.md.

## Organização

```text
src/config/   fases, pontuação e dificuldade do arcade
src/data/     catálogo e manifesto dos áudios
src/systems/  campanha, arcade, gerador, classificação comum, áudio e armazenamento
src/entities/ ambiente e animações reutilizados
src/scenes/   apresentação da fábrica, entradas e simulação
src/ui/       arte SVG, marcação arcade e cenário
public/assets/ fontes e WAVs locais com créditos
tests/        regras, geração, ranking, assets, áudio e transições
tools/        geração reprodutível de áudio
docs/         GDD, arquitetura, créditos e evidências
```

Tecnologias: Phaser3.90.0, Vite6.4.6, Vitest4.1.12 e JavaScript ES Modules. Repositório: https://github.com/AmaralCharle/Trilha-seletiva .

## Verificação e entrega acadêmica

Os testes e limites reais estão em docs/TESTES.md. Foram aprovados 70 testes em 9 arquivos nesta rodada; não equivalem a validação de aprendizagem com pessoas. A correção de paisagem 3.3 está em docs/MOBILE_3_3.md; a primeira adaptação 3.2 está em docs/MOBILE_3_2.md; o encerramento 3.1 está em docs/VERSAO_3_1.md. O GDD da campanha e da evolução até 3.1 está em docs/GDD.md e docs/GDD.pdf; o suplemento mobile 3.2 é docs/MOBILE_3_2.md.

Continuam pendentes integrantes/matrículas, teste com pessoa externa e vídeo acadêmico público de 1–3min. Não foi feita medição sustentada de FPS, validação de toque em aparelho físico ou certificação de acessibilidade. A campanha e o arcade continuam sujeitos a balanceamento com jogadores reais.

## Celular e reinício da trilha

No celular, abra o link no navegador e jogue na horizontal. Girar para retrato, ocultar a aba ou perder foco pausa a partida; ao voltar, toque em Continuar. Nenhum bloqueio de orientação é necessário. O botão Tela cheia aparece quando o navegador oferece a API; o jogo também funciona sem ela.

Toque e arraste um resíduo até a lixeira, ou toque no item e depois no destino. O gráfico fica acima do dedo durante o arrasto e o destino usa a posição do toque, com destaque e zonas maiores. Uma soltura inválida devolve o item à esteira. Toque em Retirar restos para preparar a embalagem selecionada.

Reiniciar Trilha está na seleção de fases e nas configurações, com confirmação. Apaga apenas histórico, estrelas, melhores resultados e desbloqueios da campanha; mantém áudio, preferências do navegador e ranking infinito. Depois, Jogar campanha volta às instruções iniciais. Repetir tutorial abre o treino de três itens sem apagar o progresso.

## GitHub Pages

Publicação: https://amaralcharle.github.io/Trilha-seletiva/

O workflow .github/workflows/deploy.yml roda npm ci, npm test e npm run build no push para main, envia dist e publica no ambiente github-pages. O Vite usa /Trilha-seletiva/ quando GITHUB_PAGES=true e ./ nos builds comuns. Não altere o nome real do subcaminho sem atualizar vite.config.js. Para reproduzir o build Pages em PowerShell:

```powershell
$env:GITHUB_PAGES='true'
npm run build
Remove-Item Env:GITHUB_PAGES
```

O endereço pode ser compartilhado pelo WhatsApp; não requer aplicativo nativo. Atualizações são publicadas apenas se os testes e o build passarem.

## Paisagem 3.3

Em celulares horizontais com pouca altura, HUD, canvas e ações têm espaços próprios. A câmera enquadra a área jogável em toda a largura possível, mantendo as proporções e as regras. A fala do Eco acompanha o nome do item na barra inferior. Som e tela cheia ficam disponíveis na pausa. Ao voltar para uma tela maior, o enquadramento desktop é restaurado sem reiniciar a sessão. Evidências e limitações: [MOBILE_3_3.md](docs/MOBILE_3_3.md).
