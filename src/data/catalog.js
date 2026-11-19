// Catálogo extraído dos 27 resíduos originais. needsPrep indica item que pode receber restos no sorteio.
export const CATALOG = [
  {
    "id": "jornal",
    "name": "Jornal velho",
    "category": "paper",
    "tip": "Jornal é papel limpo e seco: lixeira azul.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "caixa_papelao",
    "name": "Caixa de papelão",
    "category": "paper",
    "tip": "Papelão vai no azul. Desmonte a caixa para ocupar menos espaço.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "folha_caderno",
    "name": "Folha de caderno",
    "category": "paper",
    "tip": "Folha de caderno é papel: lixeira azul.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "envelope",
    "name": "Envelope",
    "category": "paper",
    "tip": "Envelope é papel: lixeira azul.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "revista",
    "name": "Revista",
    "category": "paper",
    "tip": "Revista é papel, mesmo sendo brilhante: lixeira azul.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "tubo_papel",
    "name": "Tubo do rolo de papel",
    "category": "paper",
    "tip": "O tubo do rolo é papelão limpo: lixeira azul.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "garrafa_pet",
    "name": "Garrafa PET",
    "category": "plastic",
    "tip": "Garrafa PET é plástico: lixeira vermelha.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "frasco_shampoo",
    "name": "Frasco de shampoo",
    "category": "plastic",
    "tip": "Frasco de shampoo é plástico: lixeira vermelha.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "sacola_plastica",
    "name": "Sacola plástica",
    "category": "plastic",
    "tip": "Sacola plástica limpa vai na lixeira vermelha.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "pote_margarina",
    "name": "Pote de margarina",
    "category": "plastic",
    "tip": "Pote de margarina é plástico: lixeira vermelha.",
    "tricky": false,
    "needsPrep": true
  },
  {
    "id": "balde_quebrado",
    "name": "Balde plástico quebrado",
    "category": "plastic",
    "tip": "Balde é plástico rígido: lixeira vermelha.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "garrafa_vidro",
    "name": "Garrafa de vidro",
    "category": "glass",
    "tip": "Garrafa é vidro de embalagem. Se quebrar, acondicione os cacos em recipiente resistente, fechado e identificado. Consulte a coleta local.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "pote_geleia",
    "name": "Pote de geleia",
    "category": "glass",
    "tip": "Pote de geleia é vidro de embalagem. Retire os restos de alimento; não é necessário lavar toda embalagem.",
    "tricky": false,
    "needsPrep": true
  },
  {
    "id": "long_neck",
    "name": "Garrafa long neck",
    "category": "glass",
    "tip": "Long neck é vidro de embalagem: lixeira verde.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "lata_refri",
    "name": "Lata de refrigerante",
    "category": "metal",
    "tip": "Lata de alumínio é metal: lixeira amarela.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "lata_milho",
    "name": "Lata de milho",
    "category": "metal",
    "tip": "Lata de conserva é metal: lixeira amarela.",
    "tricky": false,
    "needsPrep": true
  },
  {
    "id": "lata_sardinha",
    "name": "Lata de sardinha",
    "category": "metal",
    "tip": "Lata de sardinha é metal: lixeira amarela.",
    "tricky": false,
    "needsPrep": true
  },
  {
    "id": "marmita_aluminio",
    "name": "Marmita de alumínio",
    "category": "metal",
    "tip": "Marmita de alumínio é metal: lixeira amarela.",
    "tricky": false,
    "needsPrep": true
  },
  {
    "id": "frigideira",
    "name": "Frigideira velha",
    "category": "metal",
    "tip": "A parte metálica da frigideira é reciclável. Separe cabos de outros materiais quando possível e confirme a aceitação da coleta local.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "cupom_fiscal",
    "name": "Cupom fiscal",
    "category": "reject",
    "tip": "Este cupom é de papel térmico: no cenário do jogo, vai ao rejeito, separado dos papéis recicláveis. Consulte a orientação local.",
    "tricky": true,
    "needsPrep": false
  },
  {
    "id": "caixa_pizza",
    "name": "Caixa de pizza engordurada",
    "category": "reject",
    "tip": "A parte engordurada vai ao rejeito neste cenário. Separe partes de papelão limpas e secas para reciclagem.",
    "tricky": true,
    "needsPrep": false
  },
  {
    "id": "guardanapo",
    "name": "Guardanapo sujo",
    "category": "reject",
    "tip": "Guardanapo usado vai ao rejeito neste cenário. Consulte opções locais de compostagem para materiais aceitos.",
    "tricky": true,
    "needsPrep": false
  },
  {
    "id": "espelho",
    "name": "Espelho quebrado",
    "category": "reject",
    "tip": "Espelho não entra com vidro de embalagem. No cenário do jogo é rejeito: proteja as partes cortantes em recipiente resistente e identificado. Consulte a coleta local.",
    "tricky": true,
    "needsPrep": false
  },
  {
    "id": "xicara",
    "name": "Xícara de porcelana",
    "category": "reject",
    "tip": "Porcelana não é vidro de embalagem. No cenário do jogo vai ao rejeito; proteja cacos e consulte pontos de coleta locais.",
    "tricky": true,
    "needsPrep": false
  },
  {
    "id": "esponja",
    "name": "Esponja de cozinha",
    "category": "reject",
    "tip": "Esponja usada não entra na coleta seletiva comum do cenário. Programas específicos podem aceitar esse material.",
    "tricky": true,
    "needsPrep": false
  },
  {
    "id": "bituca",
    "name": "Bituca de cigarro",
    "category": "reject",
    "tip": "Bituca de cigarro é rejeito. Nunca jogue na rua, na lagoa ou na praia.",
    "tricky": false,
    "needsPrep": false
  },
  {
    "id": "fralda",
    "name": "Fralda descartável",
    "category": "reject",
    "tip": "Fralda usada é rejeito.",
    "tricky": false,
    "needsPrep": false
  }
];
export const CATALOG_BY_ID = Object.fromEntries(CATALOG.map(item => [item.id, item]));
export const LOCAL_NOTICE = "Este jogo usa um cenário de coleta seletiva. A aceitação dos materiais varia por município e cooperativa. Consulte o serviço local. Retire restos; não é preciso lavar toda embalagem. Proteja e identifique materiais cortantes.";
