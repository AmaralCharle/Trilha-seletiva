# Áudio original da versão 3

As composições e efeitos foram criados programaticamente para Trilha Seletiva com assistência de Codex/OpenAI. Não foram utilizados samples, músicas comerciais ou downloads externos. Os novos WAVs são disponibilizados sob CC0 1.0; essa dedicação não altera a licença de fontes ou bibliotecas. Fonte da dedicação: https://creativecommons.org/publicdomain/zero/1.0/ .

## Inventário

| Arquivo | Identidade | Estrutura |
|---|---|---|
| phase1.wav | Descoberta tranquila | 92 BPM, 8 compassos, pluck e pad |
| phase2.wav | Novos materiais | 108 BPM, 8 compassos, melodia de sinos |
| phase3.wav | Atenção na esteira | 116 BPM, 8 compassos, síntese chip e percussão |
| phase4.wav | Triagem avançada | 124 BPM, 12 compassos, arpejos |
| phase5.wav | Rush | 144 BPM, 12 compassos, síntese eletrônica |
| review.wav | Prática tranquila | 74 BPM, 8 compassos, sinos sem percussão |
| infinite.wav | Arcade | 136 BPM, 12 compassos, melodia e bateria próprias |
| gameover.wav | Derrota leve | 6,4 s, melodia descendente, sem loop |
| victory.wav | Vitória | 5,2 s, melodia ascendente, sem loop |

Doze efeitos: select, drag, correct, wrong, bin, combo3, combo5, unlock, victory, defeat, record e wave. Os arquivos têm prefixo fx-. O efeito curto defeat fica disponível; o encerramento final usa a composição mais longa gameover como única música.

## Produção e licença

O código tools/generate-audio.mjs sintetiza osciladores senoidais e harmônicos, envelopes de ataque/queda, baixo, acordes, ruído determinístico para percussão e eco circular nos loops. A escrita PCM usa apenas bibliotecas padrão de Node. Os arquivos são mono, 22050Hz, 16bits. O manifesto em public/assets/audio/manifest.json registra duração e tamanho reais. São21 WAVs, aproximadamente7,22 MB no total.

Os sete loops ocupam números inteiros de compassos; caudas e eco são somados circularmente. Os testes verificam arquivos reais, durações, hashes distintos, integridade e descontinuidade reduzida na fronteira. Isso é evidência estrutural, não uma avaliação auditiva de especialistas nem garantia contra diferenças de navegador ou dispositivo.

## Reprodução

preloadAudio carrega recursos locais e AudioManager controla o Phaser SoundManager. unlock é acionado pelo clique do usuário; nada inicia automaticamente no primeiro carregamento. A troca espera o fade-out de 250 ms antes de destruir a música antiga e começar a seguinte com fade-in de 550 ms. Só uma voz musical existe. Game Over e vitória têm loop false e são liberados ao terminar. O reinício solicita a trilha do modo; o menu permanece sem fundo musical.

Pausa preserva posição e congela o tween de volume. Efeitos breves em andamento são interrompidos, evitando repeti-los na retomada. Há limitação a seis efeitos simultâneos e supressão de disparos repetidos do mesmo som em 70 ms. Música e efeitos têm volumes independentes e silêncio geral. Preferências antigas são migradas preservando a campanha.

setIntensity aumenta discretamente o ganho no arcade, limitado a14% acima da referência; não acelera a gravação. Sons ausentes geram mensagem e não bloqueiam jogo, feedback textual ou classificação.
