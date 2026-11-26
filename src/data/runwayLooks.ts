export interface GarmentItem {
  id: string;
  lookId: string;
  name: string;
  category: string;
  material: string;
  color: string;
  price: number;
  sizes: { label: string; soldOut?: boolean }[];
  pinX: number; // percentage 0..100
  pinY: number; // percentage 0..100
  cropPosition: string; // CSS object-position for matching garment thumbnail crop
  cropScale?: number;
  note: string;
}

export interface RunwayLook {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  silhouetteNote: string;
  image: string;
  probeImage: string;
  alt: string;
  items: GarmentItem[];
}

export const RUNWAY_LOOKS: RunwayLook[] = [
  {
    id: 'look-01',
    number: 1,
    title: 'Монолитный крой',
    subtitle: 'Структурированная шерсть вирджин в паре с текучей графитовой драпировкой.',
    silhouetteNote: 'Открывающий выход · Чёткая линия плеча, удлинённые двубортные лацканы.',
    image: '/src/assets/images/runway_look_01_overcoat_1795548663096.jpg',
    probeImage: '/src/assets/images/runway_look_01_overcoat_1795548663096.jpg',
    alt: 'Образ 01: Двубортное антрацитовое пальто из шерсти поверх кашемировой водолазки оттенка слоновой кости и широких графитовых брюк.',
    items: [
      {
        id: 'l1-overcoat',
        lookId: 'look-01',
        name: 'Двубортное пальто из шерсти вирджин',
        category: 'Верхняя одежда',
        material: '100% шерсть вирджин · Подкладка из купро Bemberg',
        color: 'Антрацит меланж',
        price: 185000,
        sizes: [
          { label: 'XS' },
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
          { label: 'XL', soldOut: true },
        ],
        pinX: 38,
        pinY: 34,
        cropPosition: '48% 34%',
        cropScale: 2.1,
        note: 'Остроконечные лацканы на ручной бортовке, роговые пуговицы и глубокая шлица.',
      },
      {
        id: 'l1-turtleneck',
        lookId: 'look-01',
        name: 'Кашемировая водолазка тонкой вязки',
        category: 'Трикотаж',
        material: 'Кашемир Внутренней Монголии · 16 класс вязки',
        color: 'Тёплая слоновая кость',
        price: 52000,
        sizes: [
          { label: 'XS' },
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
        ],
        pinX: 50,
        pinY: 25,
        cropPosition: '50% 24%',
        cropScale: 3.1,
        note: 'Невесомый трикотаж второй кожи, связанный на мануфактуре в Биелле.',
      },
      {
        id: 'l1-trouser',
        lookId: 'look-01',
        name: 'Широкие брюки с двойными защипами',
        category: 'Портновская линия',
        material: 'Кручёная костюмная шерсть',
        color: 'Сланцево-серый',
        price: 69000,
        sizes: [
          { label: '40' },
          { label: '42' },
          { label: '44' },
          { label: '46' },
          { label: '48', soldOut: true },
        ],
        pinX: 51,
        pinY: 59,
        cropPosition: '50% 58%',
        cropScale: 2.3,
        note: 'Свободное падение штанин, выверенное для плавного вертикального шага.',
      },
      {
        id: 'l1-clutch',
        lookId: 'look-01',
        name: 'Жёсткий клатч с верхней ручкой',
        category: 'Изделия из кожи',
        material: 'Гладкая телячья кожа · Матовая латунь',
        color: 'Обсидиан',
        price: 94000,
        sizes: [{ label: 'Единый' }],
        pinX: 66,
        pinY: 58,
        cropPosition: '66% 58%',
        cropScale: 3.6,
        note: 'Архитектурный жёсткий корпус с внутренней отделкой из замши ягнёнка.',
      },
      {
        id: 'l1-boot',
        lookId: 'look-01',
        name: 'Скульптурные ботильоны из телячьей кожи',
        category: 'Обувь',
        material: 'Полированная итальянская кожа · Кожаная подошва',
        color: 'Чёрный',
        price: 86000,
        sizes: [
          { label: '37' },
          { label: '38' },
          { label: '39' },
          { label: '40' },
          { label: '41' },
        ],
        pinX: 52,
        pinY: 88,
        cropPosition: '51% 87%',
        cropScale: 3.4,
        note: 'Точёный миндалевидный мыс и наборный архитектурный каблук 45 мм.',
      },
    ],
  },
  {
    id: 'look-02',
    number: 2,
    title: 'Технический габардин',
    subtitle: 'Водоотталкивающий тренч, уравновешенный плотным жилетом из мериноса.',
    silhouetteNote: 'Выход 02 · Пропорция с отлетной кокеткой, поясом и мягкой фланелью.',
    image: '/src/assets/images/runway_look_02_trench_1795548657275.jpg',
    probeImage: '/src/assets/images/runway_look_02_trench_1795548657275.jpg',
    alt: 'Образ 02: Бежевый тренч из габардина с поясом поверх тёмно-кофейного жилета из мериноса и графитовых фланелевых брюк.',
    items: [
      {
        id: 'l2-trench',
        lookId: 'look-02',
        name: 'Тренч из технического габардина с поясом',
        category: 'Верхняя одежда',
        material: 'Плотный хлопково-нейлоновый габардин',
        color: 'Известняк',
        price: 162000,
        sizes: [
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
          { label: 'XL' },
        ],
        pinX: 39,
        pinY: 36,
        cropPosition: '48% 36%',
        cropScale: 2.0,
        note: 'Свободный рукав реглан и пояс с обтянутой в тон пряжкой.',
      },
      {
        id: 'l2-vest',
        lookId: 'look-02',
        name: 'Жилет из мериноса с глубоким V-вырезом',
        category: 'Трикотаж',
        material: 'Тонкорунная австралийская шерсть мериноса',
        color: 'Эспрессо',
        price: 41000,
        sizes: [
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
          { label: 'XL', soldOut: true },
        ],
        pinX: 50,
        pinY: 31,
        cropPosition: '50% 31%',
        cropScale: 3.0,
        note: 'Плотное переплетение милано с аккуратной круглой отделкой пройм.',
      },
      {
        id: 'l2-trouser',
        lookId: 'look-02',
        name: 'Свободные брюки из шерстяной фланели',
        category: 'Портновская линия',
        material: 'Ворсистая шерстяная фланель · 340 г/м²',
        color: 'Глубокий графит',
        price: 65000,
        sizes: [
          { label: '46' },
          { label: '48' },
          { label: '50' },
          { label: '52' },
        ],
        pinX: 49,
        pinY: 60,
        cropPosition: '50% 60%',
        cropScale: 2.3,
        note: 'Одинарная складка спереди и боковые паты для регулировки посадки.',
      },
      {
        id: 'l2-derby',
        lookId: 'look-02',
        name: 'Дерби из полированной кожи с квадратным мысом',
        category: 'Обувь',
        material: 'Кожа спаццолато · Рантовая конструкция Goodyear',
        color: 'Чёрный',
        price: 76000,
        sizes: [
          { label: '41' },
          { label: '42' },
          { label: '43' },
          { label: '44' },
          { label: '45' },
        ],
        pinX: 49,
        pinY: 89,
        cropPosition: '50% 88%',
        cropScale: 3.4,
        note: 'Отполированный вручную урез подошвы и сдержанный квадратный профиль.',
      },
    ],
  },
  {
    id: 'look-03',
    number: 3,
    title: 'Драпировка бургунди',
    subtitle: 'Тяжёлый шёлк по косой в сочетании с укороченным вечерним жакетом.',
    silhouetteNote: 'Выход 03 · Асимметричная спиральная драпировка и чёткие атласные лацканы.',
    image: '/src/assets/images/runway_look_03_draped_silk_1795548659764.jpg',
    probeImage: '/src/assets/images/runway_look_03_draped_silk_1795548659764.jpg',
    alt: 'Образ 03: Укороченный чёрный жакет с атласными лацканами поверх драпированного шёлкового платья оттенка бургунди и замшевых слингбэков.',
    items: [
      {
        id: 'l3-blazer',
        lookId: 'look-03',
        name: 'Укороченный жакет с атласными лацканами',
        category: 'Портновская линия',
        material: 'Шерсть баратея · Лацканы из шёлкового дюшеса',
        color: 'Нуар',
        price: 138000,
        sizes: [
          { label: '40' },
          { label: '42' },
          { label: '44' },
          { label: '46' },
        ],
        pinX: 41,
        pinY: 31,
        cropPosition: '48% 30%',
        cropScale: 2.4,
        note: 'Укороченная архитектура до талии и заострённая линия плеча «пагода».',
      },
      {
        id: 'l3-dress',
        lookId: 'look-03',
        name: 'Драпированное платье-колонна из тяжёлого шёлка',
        category: 'Вечерняя линия',
        material: 'Шёлковый атлас малбери 40 момми',
        color: 'Глубокий бургунди',
        price: 194000,
        sizes: [
          { label: 'XS' },
          { label: 'S' },
          { label: 'M' },
          { label: 'L', soldOut: true },
        ],
        pinX: 50,
        pinY: 57,
        cropPosition: '50% 56%',
        cropScale: 2.2,
        note: 'Ручная наколка на манекене для текучего асимметричного силуэта.',
      },
      {
        id: 'l3-cuff',
        lookId: 'look-03',
        name: 'Скульптурный браслет-кафф из серебра',
        category: 'Украшения',
        material: 'Переработанное серебро 925 пробы',
        color: 'Зеркальное серебро',
        price: 46000,
        sizes: [{ label: 'S/M' }, { label: 'M/L' }],
        pinX: 64,
        pinY: 49,
        cropPosition: '64% 49%',
        cropScale: 4.0,
        note: 'Литьё по выплавляемым моделям и ручная ковка в парижской мастерской.',
      },
      {
        id: 'l3-heel',
        lookId: 'look-03',
        name: 'Остроносые замшевые слингбэки',
        category: 'Обувь',
        material: 'Козья замша · Лакированный каблук 75 мм',
        color: 'Чёрный',
        price: 72000,
        sizes: [
          { label: '36' },
          { label: '37' },
          { label: '38' },
          { label: '39' },
          { label: '40' },
        ],
        pinX: 49,
        pinY: 90,
        cropPosition: '50% 88%',
        cropScale: 3.4,
        note: 'Вытянутый вырез союзки и деликатный эластичный ремешок на пятке.',
      },
    ],
  },
  {
    id: 'look-04',
    number: 4,
    title: 'Тактильная овчина',
    subtitle: 'Укороченный объём дублёнки в контрасте с острой шерстяной плиссировкой.',
    silhouetteNote: 'Выход 04 · Насыщенная фактура эспрессо поверх белоснежного поплина.',
    image: '/src/assets/images/runway_look_04_shearling_1795548658006.jpg',
    probeImage: '/src/assets/images/runway_look_04_shearling_1795548658006.jpg',
    alt: 'Образ 04: Укороченная дублёнка оттенка эспрессо поверх белой сорочки, плиссированная антрацитовая юбка макси и рыжие кожаные сапоги.',
    items: [
      {
        id: 'l4-shearling',
        lookId: 'look-04',
        name: 'Укороченная дублёнка из овчины',
        category: 'Верхняя одежда',
        material: 'Двусторонняя испанская овчина',
        color: 'Тёмный эспрессо',
        price: 239000,
        sizes: [
          { label: 'XS' },
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
        ],
        pinX: 40,
        pinY: 32,
        cropPosition: '48% 32%',
        cropScale: 2.3,
        note: 'Матовая вощёная наппа снаружи и плотный меховой воротник.',
      },
      {
        id: 'l4-shirt',
        lookId: 'look-04',
        name: 'Сорочка из поплина с архитектурной планкой',
        category: 'Сорочки',
        material: 'Египетский хлопковый поплин 120/2',
        color: 'Алебастр',
        price: 48000,
        sizes: [
          { label: 'XS' },
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
        ],
        pinX: 51,
        pinY: 27,
        cropPosition: '51% 27%',
        cropScale: 3.2,
        note: 'Потайная застёжка на перламутровые пуговицы и удлинённые французские манжеты.',
      },
      {
        id: 'l4-skirt',
        lookId: 'look-04',
        name: 'Шерстяная юбка макси в складку',
        category: 'Портновская линия',
        material: 'Плотная камвольная шерсть · Плиссе-солнце',
        color: 'Сырой антрацит',
        price: 84000,
        sizes: [
          { label: '40' },
          { label: '42' },
          { label: '44' },
          { label: '46' },
        ],
        pinX: 52,
        pinY: 60,
        cropPosition: '52% 60%',
        cropScale: 2.1,
        note: 'Стойкие паровые складки с выразительной динамикой при ходьбе.',
      },
      {
        id: 'l4-boot',
        lookId: 'look-04',
        name: 'Сапоги для верховой езды из телячьей кожи',
        category: 'Обувь',
        material: 'Тосканская кожа растительного дубления',
        color: 'Седельно-рыжий',
        price: 109000,
        sizes: [
          { label: '37' },
          { label: '38' },
          { label: '39' },
          { label: '40', soldOut: true },
          { label: '41' },
        ],
        pinX: 50,
        pinY: 88,
        cropPosition: '50% 87%',
        cropScale: 3.2,
        note: 'Прямое голенище без молнии с ручной восковой патиной.',
      },
    ],
  },
  {
    id: 'look-05',
    number: 5,
    title: 'Вечерний ноктюрн',
    subtitle: 'Удлинённый однобортный смокинг, выстроенный для текучего вечернего силуэта.',
    silhouetteNote: 'Финальный выход · Острый лацкан поверх расстёгнутого шёлкового крепа.',
    image: '/src/assets/images/runway_look_05_evening_suit_1795548662737.jpg',
    probeImage: '/src/assets/images/runway_look_05_evening_suit_1795548662737.jpg',
    alt: 'Образ 05: Чёрный смокинг с острыми лацканами поверх шёлковой рубашки оттенка слоновой кости, расклёшенные брюки и лаковые лоферы.',
    items: [
      {
        id: 'l5-tuxedo',
        lookId: 'look-05',
        name: 'Удлинённый смокинг с острыми лацканами',
        category: 'Вечерний крой',
        material: 'Шерсть вирджин Grain de Poudre',
        color: 'Обсидиан',
        price: 174000,
        sizes: [
          { label: '46' },
          { label: '48' },
          { label: '50' },
          { label: '52' },
        ],
        pinX: 41,
        pinY: 35,
        cropPosition: '50% 35%',
        cropScale: 2.2,
        note: 'Застёжка на одну обтянутую пуговицу и свободная бортовка из конского волоса.',
      },
      {
        id: 'l5-shirt',
        lookId: 'look-05',
        name: 'Рубашка из шёлкового крепа с открытым воротом',
        category: 'Сорочки',
        material: 'Тяжёлый матовый шёлковый крепдешин',
        color: 'Слоновая кость',
        price: 54000,
        sizes: [
          { label: 'S' },
          { label: 'M' },
          { label: 'L' },
          { label: 'XL' },
        ],
        pinX: 50,
        pinY: 27,
        cropPosition: '50% 27%',
        cropScale: 3.2,
        note: 'Плавный открытый вырез, спроектированный под вечерние лацканы.',
      },
      {
        id: 'l5-trouser',
        lookId: 'look-05',
        name: 'Вечерние расклёшенные брюки с высокой посадкой',
        category: 'Вечерний крой',
        material: 'Шерсть вирджин Grain de Poudre',
        color: 'Обсидиан',
        price: 72000,
        sizes: [
          { label: '46' },
          { label: '48' },
          { label: '50' },
          { label: '52', soldOut: true },
        ],
        pinX: 49,
        pinY: 63,
        cropPosition: '50% 62%',
        cropScale: 2.3,
        note: 'Чёткая заутюженная стрелка и деликатное расширение к низу.',
      },
      {
        id: 'l5-loafer',
        lookId: 'look-05',
        name: 'Лаковые лоферы из телячьей кожи',
        category: 'Обувь',
        material: 'Зеркальная лаковая кожа · Конструкция Blake',
        color: 'Чёрный',
        price: 74000,
        sizes: [
          { label: '41' },
          { label: '42' },
          { label: '43' },
          { label: '44' },
        ],
        pinX: 48,
        pinY: 87,
        cropPosition: '50% 86%',
        cropScale: 3.4,
        note: 'Изящный силуэт с тонкой кожаной подошвой в тон.',
      },
    ],
  },
];

export interface SizeChartRow {
  atelier: string;
  ru: string;
  eu: string;
  us: string;
  chestCm: string;
  waistCm: string;
}

export const SIZE_CHART_WOMENS: SizeChartRow[] = [
  { atelier: 'XS', ru: '40', eu: '34', us: '2', chestCm: '82', waistCm: '64' },
  { atelier: 'S', ru: '42', eu: '36', us: '4', chestCm: '86', waistCm: '68' },
  { atelier: 'M', ru: '44', eu: '38', us: '6', chestCm: '90', waistCm: '72' },
  { atelier: 'L', ru: '46', eu: '40', us: '8', chestCm: '94', waistCm: '76' },
  { atelier: 'XL', ru: '48', eu: '42', us: '10', chestCm: '98', waistCm: '80' },
];

export const SIZE_CHART_MENS: SizeChartRow[] = [
  { atelier: 'S', ru: '46', eu: '46', us: '36', chestCm: '92', waistCm: '78' },
  { atelier: 'M', ru: '48', eu: '48', us: '38', chestCm: '96', waistCm: '82' },
  { atelier: 'L', ru: '50', eu: '50', us: '40', chestCm: '100', waistCm: '86' },
  { atelier: 'XL', ru: '52', eu: '52', us: '42', chestCm: '104', waistCm: '90' },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function pluralizeRu(count: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(count) % 100;
  const mod10 = mod100 % 10;
  if (mod100 > 10 && mod100 < 20) return many;
  if (mod10 > 1 && mod10 < 5) return few;
  if (mod10 === 1) return one;
  return many;
}
