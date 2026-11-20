/*
 * Ficha de cada modelo vendido pela RL iPhones.
 *
 * O estoque (cor, armazenamento, condição, garantia, bateria e preço) vem da planilha da loja.
 * Aqui ficam só os dados fixos de cada modelo:
 *   nome, familia, ordem (posição nas vitrines), ano de lançamento,
 *   specs (especificações de referência), cores (tom da amostra) e fotos (arquivo por cor).
 *
 * As fotos ficam em assets/produtos/<nome>-g.webp (grande) e <nome>-p.webp (pequena).
 * Modelo ou cor nova na planilha que não estiver aqui aparece no site do mesmo jeito,
 * com a foto da primeira cor do modelo (ou um ícone da família, se o modelo não tiver foto).
 */
window.RL_MODELOS = {
  /* ---------------- iPhone ---------------- */
  "iphone-18-pro-max": {
    nome: "iPhone 18 Pro Max", familia: "iphone", ordem: 1, ano: 2026,
    specs: { tela: "6,9 polegadas", chip: "A20 Pro", camera: "Sistema de câmera tripla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Prateado": "#D7D6D2", "Glacial": "#A9B7CF", "Bordô": "#5B2230", "Preto": "#3A3B3D" },
    fotos: { "Prateado": "iphone-18-pro-max-prateado", "Glacial": "iphone-18-pro-max-glacial", "Bordô": "iphone-18-pro-max-bordo", "Preto": "iphone-18-pro-max-preto" }
  },
  "iphone-17-pro-max": {
    nome: "iPhone 17 Pro Max", familia: "iphone", ordem: 2, ano: 2025,
    specs: { tela: "6,9 polegadas", chip: "A19 Pro", camera: "Sistema de câmera tripla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Laranja": "#E57A3C", "Azul": "#3B4660", "Prata": "#E3E3E1" },
    fotos: { "Laranja": "iphone-17-pro-max-laranja", "Azul": "iphone-17-pro-max-azul", "Prata": "iphone-17-pro-max-prata" }
  },
  "iphone-17": {
    nome: "iPhone 17", familia: "iphone", ordem: 3, ano: 2025,
    specs: { tela: "6,3 polegadas", chip: "A19", camera: "Câmera dupla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Preto": "#2E2F31" },
    fotos: { "Preto": "iphone-17-preto" }
  },
  "iphone-16-pro-max": {
    nome: "iPhone 16 Pro Max", familia: "iphone", ordem: 4, ano: 2024,
    specs: { tela: "6,9 polegadas", chip: "A18 Pro", camera: "Sistema de câmera tripla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Natural": "#C2BCB2", "Deserto": "#C8AE97" },
    fotos: { "Natural": "iphone-16-pro-max-natural", "Deserto": "iphone-16-pro-max-deserto" }
  },
  "iphone-16-pro": {
    nome: "iPhone 16 Pro", familia: "iphone", ordem: 5, ano: 2024,
    specs: { tela: "6,3 polegadas", chip: "A18 Pro", camera: "Sistema de câmera tripla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Natural": "#C2BCB2", "Deserto": "#C8AE97" },
    fotos: { "Natural": "iphone-16-pro-natural", "Deserto": "iphone-16-pro-deserto" }
  },
  "iphone-16": {
    nome: "iPhone 16", familia: "iphone", ordem: 6, ano: 2024,
    specs: { tela: "6,1 polegadas", chip: "A18", camera: "Câmera dupla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Azul": "#7D8BE3", "Preto": "#3C3D3F" },
    fotos: { "Azul": "iphone-16-azul", "Preto": "iphone-16-preto" }
  },
  "iphone-16e": {
    nome: "iPhone 16e", familia: "iphone", ordem: 7, ano: 2025,
    specs: { tela: "6,1 polegadas", chip: "A18", camera: "Câmera de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Preto": "#2C2C2E" },
    fotos: { "Preto": "iphone-16e-preto" }
  },
  "iphone-15-pro-max": {
    nome: "iPhone 15 Pro Max", familia: "iphone", ordem: 8, ano: 2023,
    specs: { tela: "6,7 polegadas", chip: "A17 Pro", camera: "Sistema de câmera tripla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Natural": "#BEB9AF" },
    fotos: { "Natural": "iphone-15-pro-max-natural" }
  },
  "iphone-15-pro": {
    nome: "iPhone 15 Pro", familia: "iphone", ordem: 9, ano: 2023,
    specs: { tela: "6,1 polegadas", chip: "A17 Pro", camera: "Sistema de câmera tripla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Azul": "#3F4A5A" },
    fotos: { "Azul": "iphone-15-pro-azul" }
  },
  "iphone-15": {
    nome: "iPhone 15", familia: "iphone", ordem: 10, ano: 2023,
    specs: { tela: "6,1 polegadas", chip: "A16 Bionic", camera: "Câmera dupla de 48 MP", conector: "USB-C", biometria: "Face ID" },
    cores: { "Verde": "#CAD7C4", "Preto": "#3A3D3F" },
    fotos: { "Verde": "iphone-15-verde", "Preto": "iphone-15-preto" }
  },
  "iphone-14-pro-max": {
    nome: "iPhone 14 Pro Max", familia: "iphone", ordem: 11, ano: 2022,
    specs: { tela: "6,7 polegadas", chip: "A16 Bionic", camera: "Sistema de câmera tripla de 48 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Branco": "#E9EAE6", "Preto": "#403E3D" },
    fotos: { "Branco": "iphone-14-pro-max-branco", "Preto": "iphone-14-pro-max-preto" }
  },
  "iphone-14-pro": {
    nome: "iPhone 14 Pro", familia: "iphone", ordem: 12, ano: 2022,
    specs: { tela: "6,1 polegadas", chip: "A16 Bionic", camera: "Sistema de câmera tripla de 48 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Preto": "#403E3D" },
    fotos: { "Preto": "iphone-14-pro-preto" }
  },
  "iphone-14": {
    nome: "iPhone 14", familia: "iphone", ordem: 13, ano: 2022,
    specs: { tela: "6,1 polegadas", chip: "A15 Bionic", camera: "Câmera dupla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Preto": "#262B31", "Branco": "#F2EEE8", "Lilás": "#DCD3E3" },
    fotos: { "Preto": "iphone-14-preto", "Branco": "iphone-14-branco", "Lilás": "iphone-14-lilas" }
  },
  "iphone-13-pro-max": {
    nome: "iPhone 13 Pro Max", familia: "iphone", ordem: 14, ano: 2021,
    specs: { tela: "6,7 polegadas", chip: "A15 Bionic", camera: "Sistema de câmera tripla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Preto": "#54524F", "Branco": "#E9EAE6" },
    fotos: { "Preto": "iphone-13-pro-max-preto", "Branco": "iphone-13-pro-max-branco" }
  },
  "iphone-13-pro": {
    nome: "iPhone 13 Pro", familia: "iphone", ordem: 15, ano: 2021,
    specs: { tela: "6,1 polegadas", chip: "A15 Bionic", camera: "Sistema de câmera tripla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Branco": "#E9EAE6" },
    fotos: { "Branco": "iphone-13-pro-branco" }
  },
  "iphone-13": {
    nome: "iPhone 13", familia: "iphone", ordem: 16, ano: 2021,
    specs: { tela: "6,1 polegadas", chip: "A15 Bionic", camera: "Câmera dupla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Preto": "#262B31", "Rosa": "#F5DCD5", "Branco": "#F2EEE8" },
    fotos: { "Preto": "iphone-13-preto", "Rosa": "iphone-13-rosa", "Branco": "iphone-13-branco" }
  },
  "iphone-12-pro-max": {
    nome: "iPhone 12 Pro Max", familia: "iphone", ordem: 17, ano: 2020,
    specs: { tela: "6,7 polegadas", chip: "A14 Bionic", camera: "Sistema de câmera tripla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Azul": "#2F4452", "Dourado": "#EBDCC3", "Branco": "#E9EAE6" },
    fotos: { "Azul": "iphone-12-pro-max-azul", "Dourado": "iphone-12-pro-max-dourado", "Branco": "iphone-12-pro-max-branco" }
  },
  "iphone-12-pro": {
    nome: "iPhone 12 Pro", familia: "iphone", ordem: 18, ano: 2020,
    specs: { tela: "6,1 polegadas", chip: "A14 Bionic", camera: "Sistema de câmera tripla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Azul": "#2F4452", "Branco": "#E9EAE6", "Grafite": "#52514F" },
    fotos: { "Azul": "iphone-12-pro-azul", "Branco": "iphone-12-pro-branco", "Grafite": "iphone-12-pro-grafite" }
  },
  "iphone-12": {
    nome: "iPhone 12", familia: "iphone", ordem: 19, ano: 2020,
    specs: { tela: "6,1 polegadas", chip: "A14 Bionic", camera: "Câmera dupla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Branco": "#F2EEE8", "Preto": "#25262B", "Vermelho": "#B3132B" },
    fotos: { "Branco": "iphone-12-branco", "Preto": "iphone-12-preto", "Vermelho": "iphone-12-vermelho" }
  },
  "iphone-11": {
    nome: "iPhone 11", familia: "iphone", ordem: 20, ano: 2019,
    specs: { tela: "6,1 polegadas", chip: "A13 Bionic", camera: "Câmera dupla de 12 MP", conector: "Lightning", biometria: "Face ID" },
    cores: { "Preto": "#232426", "Branco": "#F2EEE8", "Roxo": "#CFC8DB" },
    fotos: { "Preto": "iphone-11-preto", "Branco": "iphone-11-branco", "Roxo": "iphone-11-roxo" }
  },
  "iphone-se": {
    nome: "iPhone SE", familia: "iphone", ordem: 21, ano: 2020,
    specs: { tela: "4,7 polegadas", conector: "Lightning", biometria: "Touch ID" },
    cores: { "Preto": "#232426" },
    fotos: { "Preto": "iphone-se-preto" }
  },

  /* ---------------- iPad ---------------- */
  "ipad-11": {
    nome: "iPad 11", familia: "ipad", ordem: 30, ano: 2025,
    specs: { tela: "11 polegadas", conector: "USB-C", biometria: "Touch ID" },
    cores: { "Azul": "#9DB3D6" },
    fotos: { "Azul": "ipad-11-azul" }
  },
  "ipad-air-4": {
    nome: "iPad Air 4", familia: "ipad", ordem: 31, ano: 2020,
    specs: { tela: "10,9 polegadas", chip: "A14 Bionic", conector: "USB-C", biometria: "Touch ID" },
    cores: { "Cinza": "#6E6E73" },
    fotos: { "Cinza": "ipad-air-4-cinza" }
  },

  /* ---------------- Apple Watch ---------------- */
  "apple-watch-ultra-1": {
    nome: "Apple Watch Ultra", familia: "watch", ordem: 40, ano: 2022,
    specs: { caixa: "49 mm, titânio" },
    cores: { "Prata": "#C9C5BC", "Preto": "#2B2B2E" },
    fotos: { "Prata": "apple-watch-ultra-1-prata", "Preto": "apple-watch-ultra-1-prata" }
  },
  "apple-watch-series-10": {
    nome: "Apple Watch Series 10", familia: "watch", ordem: 41, ano: 2024,
    specs: { caixa: "46 mm" },
    cores: { "Prata": "#D9D7D2", "Preto": "#2B2B2E" },
    fotos: { "Prata": "apple-watch-series-10-prata", "Preto": "apple-watch-series-10-prata" }
  },
  "apple-watch-series-7": {
    nome: "Apple Watch Series 7", familia: "watch", ordem: 42, ano: 2021,
    specs: { caixa: "45 mm" },
    cores: { "Prata": "#DCDCDA" },
    fotos: { "Prata": "apple-watch-series-7-prata" }
  },

  /* ---------------- Mac ---------------- */
  "macbook-neo": {
    nome: "MacBook Neo", familia: "mac", ordem: 50, ano: 2026,
    specs: {},
    cores: { "Azul": "#5B6B9A" },
    fotos: { "Azul": "macbook-neo-azul" }
  },
  "macbook-air-m1": {
    nome: "MacBook Air M1", familia: "mac", ordem: 51, ano: 2020,
    specs: { tela: "13,3 polegadas", chip: "M1" },
    cores: { "Rose Gold": "#E6C9B9" },
    fotos: { "Rose Gold": "macbook-air-m1-rose-gold" }
  },
  "imac": {
    nome: "iMac", familia: "mac", ordem: 52, ano: 2021,
    specs: {},
    cores: { "Azul": "#8AA6C2" },
    fotos: { "Azul": "imac-azul" }
  }
};

/* Nomes como estão na planilha → identificador do modelo acima. */
window.RL_APELIDOS = {
  "iphone se": "iphone-se",
  "ipad 11 128gb": "ipad-11",
  "ipad 11": "ipad-11",
  "apple watch s10": "apple-watch-series-10",
  "apple watch s7": "apple-watch-series-7",
  "apple watch ultra 1": "apple-watch-ultra-1",
  "macbook air m1": "macbook-air-m1",
  "macbook neo": "macbook-neo"
};

/* Grafia das cores no site (a planilha às vezes vem sem acento ou em inglês). */
window.RL_CORES = {
  "bordo": "Bordô", "lilas": "Lilás", "desert": "Deserto", "rose gold": "Rose Gold"
};
