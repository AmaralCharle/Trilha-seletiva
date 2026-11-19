# Trilha Seletiva

Jogo educacional 2D de triagem de resíduos no navegador. Você ajuda Eco a operar uma central de reciclagem, aprende a reconhecer materiais e avança por cinco fases. Os 27 exemplos e os parâmetros principais preservam a base do projeto Python fornecido; as regras, a apresentação e o armazenamento foram reconstruídos para navegador.

## Iniciar

1. Instale Node.js 20.19 ou superior, ou 22.12 ou superior. A instalação inicial das dependências requer internet.
2. Extraia o projeto e abra um terminal na pasta que contém este README e `package.json`.
3. Execute:

```powershell
npm install
npm run dev
```

Abra o endereço local que o Vite mostrar. Chrome e Edge no Windows são os navegadores-alvo. Mantenha o terminal aberto enquanto estiver jogando. A execução precisa de servidor HTTP; não abra `index.html` diretamente por duplo clique.

## Produção e testes

```powershell
npm test
npm run build
npm run preview
```

`npm test` executa os testes determinísticos de domínio e persistência. `npm run build` gera a pasta `dist`, com Phaser e recursos empacotados. `npm run preview` serve essa distribuição localmente. O jogo não usa CDN, autenticação ou backend para sua mecânica. O relatório de verificações efetivamente executadas está em [docs/TESTES.md](docs/TESTES.md).

## Jogar

Comece pelo tutorial de Eco. Selecione um objeto na esteira, prepare a embalagem quando houver restos e encaminhe-a à lixeira correta. Você pode arrastar e soltar; a interface também apresenta os atalhos de teclado. Cada lixeira tem nome e símbolo além da cor. A primeira fase não tem cronômetro. A partir da segunda, erro ou perda desconta três segundos; cinco acertos seguidos devolvem dois segundos. O terceiro acerto consecutivo já vale o dobro.

Ao terminar, a precisão considera todo o lote da tentativa, incluindo perdas e objetos pendentes. A meta aprovada libera a fase seguinte. Repita para melhorar estrelas ou use a revisão sem cronômetro para praticar as dificuldades. Dados ficam no `localStorage` deste navegador; exporte CSV se precisar guardar o histórico fora dele. Apagar os dados do site ou usar outro navegador não transfere seu progresso.

## Organização

```text
src/
  config/     parâmetros dos níveis e regras centrais
  data/       catálogo de 27 resíduos e conteúdo educacional
  scenes/     central de triagem no Phaser
  systems/    sessão determinística e persistência local
  ui/         ilustrações vetoriais originais
  main.js     navegação, telas e integração
public/       recursos locais quando necessários
tests/        testes automatizados
docs/         GDD, arquitetura, auditoria, créditos e verificações
```

Tecnologias fixadas: Phaser 3.90.0, Vite 6.4.6 e Vitest 4.1.12; versões transitivas exatas em `package-lock.json`.

## Conteúdo e limites

A central de triagem é fictícia. Regras locais de aceitação variam: consulte seu município ou cooperativa, sobretudo para vidros especiais e materiais compostos. Preparar uma embalagem significa retirar restos, sem exigir lavagem de tudo. Vidro quebrado precisa ser acondicionado e identificado com segurança. O jogo não orienta descarte de pilhas, lâmpadas, medicamentos ou resíduos de saúde.

Ainda precisam ser feitos pelo grupo: preencher integrantes e matrículas, revisar o GDD, observar pelo menos uma pessoa externa jogando e produzir o vídeo acadêmico de 1 a 3 minutos. Não há comprovação de melhoria de aprendizagem. Acesso integral por leitor de tela no canvas e desempenho em todas as máquinas de laboratório não foram validados.

## Documentação

- [GDD com 16 seções e rastreabilidade](docs/GDD.md)
- [Arquitetura e contratos](docs/ARQUITETURA.md)
- [Diagnóstico do original](docs/DIAGNOSTICO_ORIGINAL.md)
- [Créditos, licenças e uso de IA](docs/CREDITOS.md)
- [Testes e pendências](docs/TESTES.md)

A reconstrução foi desenvolvida com assistência do Codex da OpenAI. O grupo deve revisar o código e saber explicar o projeto antes da entrega; a declaração detalhada está nos créditos e na seção 16 do GDD.
