import { Product } from "./types";

export const PRODUCTS_1688: Product[] = [
  {
    id: "prod_1",
    title: "Умный портативный Full HD проектор Wanbo T2 Max",
    category: "Электроника и гаджеты",
    priceCny: 480,
    priceRub: 6480,
    minOrder: 5,
    rating: 4.9,
    moqUnit: "шт",
    weightEstKg: 1.2,
    imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod_2",
    title: "Беспроводные наушники Nothing Ear с ANC (Прозрачный дизайн)",
    category: "Аудиотехника",
    priceCny: 320,
    priceRub: 4320,
    minOrder: 10,
    rating: 4.8,
    moqUnit: "шт",
    weightEstKg: 0.15,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod_3",
    title: "Игровая консоль Retro Pocket 4 (Эмуляторы PS2/Wii)",
    category: "Электроника и гаджеты",
    priceCny: 590,
    priceRub: 7965,
    minOrder: 3,
    rating: 4.9,
    moqUnit: "шт",
    weightEstKg: 0.35,
    imageUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod_4",
    title: "Светодиодный Smart RGB торшер с управлением и музыкой",
    category: "Умный дом и свет",
    priceCny: 75,
    priceRub: 1012,
    minOrder: 20,
    rating: 4.7,
    moqUnit: "шт",
    weightEstKg: 0.8,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod_5",
    title: "Интеллектуальный массажер для шеи и плеч NeckRelax 3D",
    category: "Красота и здоровье",
    priceCny: 110,
    priceRub: 1485,
    minOrder: 15,
    rating: 4.8,
    moqUnit: "шт",
    weightEstKg: 1.1,
    imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "prod_6",
    title: "Портативная кофемашина эспрессо 2-в-1 (Капсулы/Молотый)",
    category: "Бытовая техника",
    priceCny: 185,
    priceRub: 2497,
    minOrder: 8,
    rating: 4.6,
    moqUnit: "шт",
    weightEstKg: 0.6,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
  }
];

export interface FAQItem {
  question: string;
  shortLabel: string;
  category: "Таможня" | "Оплата" | "Честный Знак" | "Тарифы" | "Выкуп";
  clicks: number;
}

export const SUGGESTED_QUESTIONS: FAQItem[] = [
  {
    question: "Как рассчитать официальную белую доставку с таможенной декларацией РФ под ключ?",
    shortLabel: "Официальная белая таможня РФ 🇷🇺",
    category: "Таможня",
    clicks: 1420
  },
  {
    question: "Нужна ли маркировка 'Честный Знак' на одежду и обувь из Китая и как её наносить на складе?",
    shortLabel: "Честный Знак & Маркировка 🏷️",
    category: "Честный Знак",
    clicks: 980
  },
  {
    question: "Как сейчас оплатить инвойс китайскому поставщику в юанях без задержек и рисков?",
    shortLabel: "Оплата поставщику в юанях 🇨🇳",
    category: "Оплата",
    clicks: 1650
  },
  {
    question: "Какая комиссия на выкуп товаров со 1688, Taobao и Alibaba, и как заказать?",
    shortLabel: "Комиссия и выкуп с маркетплейсов 🛍️",
    category: "Выкуп",
    clicks: 1240
  },
  {
    question: "Какая разница в стоимости и пошлинах между Карго и официальным ввозом через таможню?",
    shortLabel: "Карго против Белой доставки ⚖️",
    category: "Таможня",
    clicks: 850
  }
];
