// Valores-base preservados da configuração Python. Velocidade em px/s no espaço lógico de 960 px.
export const LEVELS = [
  {
    "id": 1,
    "title": "Papel ou plástico?",
    "description": "Duas lixeiras e sem relógio. Arraste cada item para a lixeira certa.",
    "count": 12,
    "speed": 70,
    "interval": 2.6,
    "time": null,
    "target": 0.75,
    "categories": [
      "paper",
      "plastic"
    ],
    "trickyFraction": 0.0,
    "prepFraction": 0.0,
    "pauseOnError": true
  },
  {
    "id": 2,
    "title": "Entram vidro e metal",
    "description": "Quatro lixeiras e o relógio começa a contar. Errar custa 3 segundos.",
    "count": 16,
    "speed": 95,
    "interval": 2.2,
    "time": 60,
    "target": 0.8,
    "categories": [
      "paper",
      "plastic",
      "glass",
      "metal"
    ],
    "trickyFraction": 0.0,
    "prepFraction": 0.0,
    "pauseOnError": true
  },
  {
    "id": 3,
    "title": "Nem tudo recicla",
    "description": "Chega a lixeira cinza (rejeito). Cuidado: alguns itens parecem recicláveis e não são.",
    "count": 20,
    "speed": 115,
    "interval": 1.9,
    "time": 60,
    "target": 0.8,
    "categories": [
      "paper",
      "plastic",
      "glass",
      "metal",
      "reject"
    ],
    "trickyFraction": 0.45,
    "prepFraction": 0.0,
    "pauseOnError": false
  },
  {
    "id": 4,
    "title": "Sujo contamina",
    "description": "Retire os restos de alimento antes de separar. Economize água; não é preciso lavar toda embalagem.",
    "count": 20,
    "speed": 130,
    "interval": 1.8,
    "time": 65,
    "target": 0.8,
    "categories": [
      "paper",
      "plastic",
      "glass",
      "metal",
      "reject"
    ],
    "trickyFraction": 0.3,
    "prepFraction": 0.4,
    "pauseOnError": false
  },
  {
    "id": 5,
    "title": "Hora do rush",
    "description": "Saindo atrasado para o trabalho: tudo junto, mais rápido. Mostre que virou hábito.",
    "count": 26,
    "speed": 160,
    "interval": 1.4,
    "time": 55,
    "target": 0.85,
    "categories": [
      "paper",
      "plastic",
      "glass",
      "metal",
      "reject"
    ],
    "trickyFraction": 0.4,
    "prepFraction": 0.3,
    "pauseOnError": false
  }
];
export const BINS = {
  "paper": {
    "name": "PAPEL",
    "color": "#2563b6",
    "symbol": "P"
  },
  "plastic": {
    "name": "PLÁSTICO",
    "color": "#c82d2d",
    "symbol": "PL"
  },
  "glass": {
    "name": "VIDRO",
    "color": "#2e8b46",
    "symbol": "V"
  },
  "metal": {
    "name": "METAL",
    "color": "#f0c419",
    "symbol": "M"
  },
  "reject": {
    "name": "REJEITO",
    "color": "#787878",
    "symbol": "R"
  }
};
export { RULES } from './rules.js';
