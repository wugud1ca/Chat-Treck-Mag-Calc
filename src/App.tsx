import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Sparkles, Phone, ArrowRight, Check, 
  Truck, FileText, RefreshCw, Sliders, Search, Plus, 
  ShoppingCart, MapPin, ShieldAlert, CheckCircle2, 
  MessageSquare, Lock, ExternalLink, HelpCircle, 
  ChevronRight, ClipboardCheck, AlertCircle, X, Star
} from "lucide-react";
import { Message, Product, CalculationResult } from "./types";
import { PRODUCTS_1688, SUGGESTED_QUESTIONS } from "./data";
import TariffCalculator from "./components/TariffCalculator";

export default function App() {
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Приветствую! Я ИИ Агент ВЭД логистической компании **Express2day**. 🇨🇳✈️🇷🇺\n\nЯ знаю всё о доставке сборных грузов (карго и белая доставка) и выкупе товаров с китайских маркетплейсов **1688, Taobao и Alibaba**.\n\nЧем я могу помочь вам сегодня?\n- 📈 Рассчитать стоимость доставки по весу/объему\n- 🛍 Рассказать про комиссию и условия выкупа с 1688\n- 🛡 Помочь с выбором надежной упаковки (обрешетка, паллет)\n\n*Вы можете использовать калькулятор ниже или выбрать товар из витрины, чтобы я автоматически сделал расчет!*",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fontSizeMode, setFontSizeMode] = useState<"standard" | "large" | "extra">("standard");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1688 Vitrine States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [yuanRate, setYuanRate] = useState<number>(13.5); // 1 CNY = 13.5 RUB
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Tracking State
  const [trackNumber, setTrackNumber] = useState("ET-2026-8841");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState("");

  // Lead capture popups / status
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadSource, setLeadSource] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientTelegram, setClientTelegram] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [quickCallbackPhone, setQuickCallbackPhone] = useState("");
  const [quickCallbackSubmitted, setQuickCallbackSubmitted] = useState(false);

  // Scroll to chat when receiving data from calculator/vitrine
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle tracking code search
  const handleTrackSearch = (codeToSearch?: string) => {
    const code = codeToSearch || trackNumber;
    if (!code || code.trim().length < 5) {
      setTrackingError("Введите корректный номер накладной (минимум 5 символов)");
      setTrackingResult(null);
      return;
    }
    setTrackingError("");
    
    // Simulate real database logistics steps based on input code
    const mockSteps = [
      {
        title: "Консолидация на складе в Гуанчжоу (КНР)",
        desc: "Товар получен от поставщика 1688, упакован в деревянную обрешетку, нанесен защитный скотч.",
        date: "24.06.2026 14:30",
        completed: true,
        current: false,
        icon: "📦"
      },
      {
        title: "Отправка со склада Китая — Пограничный транзит",
        desc: "Груз загружен в фуру быстрого автовыхода. Направление: МЦПС Хоргос / Маньчжурия.",
        date: "25.06.2026 09:15",
        completed: true,
        current: false,
        icon: "🚛"
      },
      {
        title: "Таможенная очистка и декларирование",
        desc: "Пройден импортный контроль. Выпущен под таможенное оформление карго-тарифа.",
        date: "27.06.2026 17:40",
        completed: true,
        current: true,
        icon: "🛡️"
      },
      {
        title: "Сортировочный хаб Москва (Южные Ворота / Люблино)",
        desc: "Ожидаемое прибытие груза на главный склад выдачи и распределения по регионам РФ.",
        date: "Планируется: 03.07.2026",
        completed: false,
        current: false,
        icon: "🏬"
      }
    ];

    setTrackingResult({
      code: code.toUpperCase(),
      weight: "185 кг",
      volume: "1.1 м³",
      route: "Быстрое Авто (Маньчжурия)",
      status: "В пути (Таможенная очистка)",
      steps: mockSteps
    });
  };

  // Initial mock track load
  useEffect(() => {
    handleTrackSearch();
  }, []);

  // Send message to Gemini VED Agent
  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // Scroll chat into view if triggered from external elements
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      // Build the message history list for the server endpoint
      const currentHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: currentHistory })
      });

      if (!res.ok) {
        throw new Error("Failed to get response from agent server");
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: "⚠️ Прошу прощения, возникла сетевая заминка при связи с сервером ВЭД. Пожалуйста, напишите ваш вопрос еще раз, или оставьте контакты для связи с человеком-менеджером!",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Trigger from Calculator component
  const handleCalculatorData = (promptText: string) => {
    sendMessage(promptText);
  };

  // Trigger from 1688 product showcase "Рассчитать доставку"
  const handleProductCalculate = (product: Product) => {
    // Fill chat with a template prompt indicating specific product interest
    const rubPrice = Math.round(product.priceCny * yuanRate);
    const text = `Привет! Меня заинтересовал товар из каталога 1688:
🛍 **"${product.title}"**
- Цена за единицу: ¥${product.priceCny} (~${rubPrice} руб.)
- Минимальная партия выкупа (MOQ): ${product.minOrder} ${product.moqUnit}.
- Ориентировочный вес единицы: ${product.weightEstKg} кг.

Помогите рассчитать выкуп минимальной партии, сколько примерно выйдет страховка и быстрая автодоставка до Москвы?`;
    sendMessage(text);
  };

  // Trigger from 1688 product "Заказать выкуп"
  const openLeadForProduct = (product: Product) => {
    setLeadSource(`Выкуп товара 1688: ${product.title} (MOQ: ${product.minOrder} ${product.moqUnit} по цене ¥${product.priceCny})`);
    setIsLeadModalOpen(true);
  };

  // Handle lead capture submit
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    // Simulate sending lead data to CRM
    setLeadSubmitted(true);
    
    // Send a message to the chatbot on behalf of the application, letting the AI congratulate the user and suggest next steps
    setTimeout(() => {
      const confirmationMsg = `🎉 **Заявка на выкуп успешно сформирована!**

Наши менеджеры по закупкам уже получили ваши контакты и приступили к расчету спецификации для:
*${leadSource}*

**Ваши контакты:**
👤 ФИО: ${clientName}
📞 Телефон: ${clientPhone}
📱 Telegram: ${clientTelegram || "Не указан"}

Я зарезервировал за вашим номером специальный сниженный тариф на авиа/авто доставку. Можете задать мне любые дополнительные вопросы, пока менеджер готовит официальный договор.`;
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: confirmationMsg,
        timestamp: new Date()
      }]);
    }, 1000);
  };

  // Fast Callback form in sidebar / top banner
  const handleQuickCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCallbackPhone) return;

    setQuickCallbackSubmitted(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: `📞 **Заказан моментальный обратный звонок** на номер **${quickCallbackPhone}**.\n\nДежурный логист ВЭД свяжется с вами в течение 3-5 минут для предметного обсуждения вашего груза из Китая!`,
        timestamp: new Date()
      }]);
    }, 800);
  };

  const filteredProducts = PRODUCTS_1688.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || (selectedCategory === "electronics" && p.category.includes("Электроника"));
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-between font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      
      {/* Visual Top Decorative line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-500" />

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex-1 flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-800 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 font-extrabold text-2xl tracking-tighter shadow-md shadow-emerald-800/10 select-none">
              E2D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  Express2day
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-100">
                  Официальные Тарифы
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                Прямая логистика КНР ➔ РФ • Таможенное оформление и выкуп с 1688.com
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-3 lg:gap-4 w-full lg:w-auto">
            {/* Rates strip & Socials - grouped cleanly */}
            <div className="flex flex-col min-[400px]:flex-row flex-wrap items-stretch min-[400px]:items-center gap-2">
              {/* Rates strip */}
              <div className="flex items-center justify-between min-[400px]:justify-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-2 text-xs text-slate-600 font-mono w-full min-[400px]:w-auto">
                <div>
                  Юань: <span className="text-emerald-600 font-bold">{yuanRate} ₽</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div>
                  Доллар: <span className="text-emerald-700 font-bold">92.50 ₽</span>
                </div>
              </div>

              {/* Social Links in Header */}
              <div className="flex flex-wrap items-center gap-1.5 w-full min-[400px]:w-auto justify-center min-[400px]:justify-start">
                <a 
                  href="https://t.me/ExpressTodayHelp_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200/50 text-[#229ED9] rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95"
                  title="Написать в Telegram"
                >
                  <Send className="h-3 w-3" />
                  <span>TG</span>
                </a>
                <a 
                  href="https://wa.me/79282568263" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-[#25D366] rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95"
                  title="Написать в WhatsApp"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>WA</span>
                </a>
                <a 
                  href="https://max.ru/id271700368747_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 text-amber-600 rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95"
                  title="Перейти в MAX"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>MAX</span>
                </a>
              </div>
            </div>

            {/* Callback CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <a 
                href="tel:88005559425" 
                className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-150 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 bg-slate-50/50 hover:bg-white transition-all whitespace-nowrap"
              >
                <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">8 (800) 555-94-25</span>
              </a>
              <button 
                onClick={() => {
                  setLeadSource("Быстрая консультация по тарифам доставки");
                  setIsLeadModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all text-center w-full sm:w-auto cursor-pointer"
              >
                Консультация
              </button>
            </div>
          </div>
        </header>

        {/* Bento Grid layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT BENTO BLOCK: AI VED Chat (col-span-7 or 8 on large screens) */}
          <div ref={chatContainerRef} className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            
            {/* Chat Box Container */}
            <div className="flex flex-col bg-[#e3eae4] border border-slate-300 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm overflow-hidden h-[600px] sm:h-[680px] lg:h-[720px] transition-all">
            
            {/* Chat header: TG style */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200/60 bg-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center shadow-sm text-white text-xl sm:text-2xl select-none">
                    🤖
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse-slow"></div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight font-display">
                      ИИ Агент ВЭД
                    </h2>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-extrabold rounded uppercase tracking-wider border border-emerald-100">
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">
                    Бот-помощник • Отвечает за 5 сек.
                  </p>
                </div>
              </div>

              {/* Telegram-style Font Size control switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5 sm:p-1 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setFontSizeMode("standard")}
                    className={`px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${fontSizeMode === "standard" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                    title="Стандартный шрифт"
                  >
                    А
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFontSizeMode("large")}
                    className={`px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${fontSizeMode === "large" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                    title="Крупный шрифт"
                  >
                    А+
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFontSizeMode("extra")}
                    className={`px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${fontSizeMode === "extra" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                    title="Очень крупный шрифт"
                  >
                    А++
                  </button>
                </div>
                <div className="hidden sm:block text-[9px] text-slate-400 font-bold uppercase tracking-wider text-right leading-none max-w-[50px]">
                  Размер текста
                </div>
              </div>
            </div>

            {/* Chat Messages: TG-styled list */}
            <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto space-y-3 sm:space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const sizeClass = fontSizeMode === "large" 
                  ? "text-[16px] sm:text-[18px] leading-relaxed" 
                  : fontSizeMode === "extra" 
                    ? "text-[19px] sm:text-[21px] leading-relaxed" 
                    : "text-[13px] sm:text-sm leading-normal";

                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {/* Compact Avatar */}
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isUser 
                        ? "bg-emerald-600 text-white" 
                        : "bg-white text-emerald-700 border border-slate-200"
                    }`}>
                      {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>

                    {/* Bubble content */}
                    <div className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-sm border transition-all ${
                      isUser
                        ? "bg-[#e2f7cb] text-slate-900 border-[#c6ebaa]/40 rounded-tr-none"
                        : "bg-white text-slate-800 border-slate-200/50 rounded-tl-none"
                    }`}>
                      <div className={`whitespace-pre-wrap font-sans ${sizeClass}`}>
                        {/* Simple custom markdown renderer for bold terms */}
                        {msg.content.split("\n").map((line, lIdx) => {
                          const boldPattern = /\*\*(.*?)\*\*/g;
                          let lastIndex = 0;
                          let match;
                          const elements = [];

                          while ((match = boldPattern.exec(line)) !== null) {
                            if (match.index > lastIndex) {
                              elements.push(line.substring(lastIndex, match.index));
                            }
                            elements.push(
                              <strong key={match.index} className="text-slate-950 font-extrabold underline decoration-emerald-500/30 underline-offset-2">
                                {match[1]}
                              </strong>
                            );
                            lastIndex = boldPattern.lastIndex;
                          }

                          if (lastIndex < line.length) {
                            elements.push(line.substring(lastIndex));
                          }

                          return (
                            <p key={lIdx} className={lIdx > 0 ? "mt-1" : ""}>
                              {elements.length > 0 ? elements : line}
                            </p>
                          );
                        })}
                      </div>
                      <div className={`text-[9px] mt-1.5 font-mono text-right text-slate-400 select-none`}>
                        {msg.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2 sm:gap-3 max-w-[80%] mr-auto">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="h-3.5 w-3.5 text-emerald-700 animate-pulse" />
                  </div>
                  <div className="bg-white text-slate-500 border border-slate-200/50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="text-xs font-semibold">ИИ ВЭД Агент думает...</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <div className="p-3 sm:p-4 border-t border-slate-200 shrink-0 bg-white shadow-inner">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-slate-50 border border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 rounded-xl sm:rounded-2xl transition-all"
              >
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Спросите Агента или укажите параметры груза..." 
                  className={`flex-1 min-w-0 bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-slate-800 outline-none placeholder:text-slate-400 ${fontSizeMode === "large" ? "text-base" : fontSizeMode === "extra" ? "text-lg" : "text-xs sm:text-sm"}`}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isTyping}
                  className="bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg sm:rounded-xl px-3 sm:px-5 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                >
                  <span className="hidden sm:inline">Отправить</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Popular Questions & Customs Inquiries from Last Month */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                    Аналитика таможенных запросов за прошлый месяц
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 leading-none mt-1">
                    Популярные темы обращений в ВЭД-поддержку Express2day
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-center px-2.5 py-1 bg-amber-50 border border-amber-200/40 text-amber-700 text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                Горячие темы
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED_QUESTIONS.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(faq.question)}
                  className="flex flex-col items-start text-left p-3.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-150 hover:border-emerald-200/60 rounded-2xl transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase ${
                      faq.category === 'Таможня' ? 'bg-emerald-100/75 text-emerald-800' :
                      faq.category === 'Оплата' ? 'bg-amber-100 text-amber-800' :
                      faq.category === 'Честный Знак' ? 'bg-blue-100 text-blue-800' :
                      faq.category === 'Выкуп' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {faq.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1">
                      🔥 {faq.clicks} запросов
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                    {faq.question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* RIGHT BENTO BLOCK 1: Premium Promo Banner (col-span-4) */}
          <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            
            {/* Promo banner: High converting, bright, bento styled */}
            <div className="bg-orange-500 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]">
              
              {/* Background graphic */}
              <div className="absolute -right-8 -bottom-8 opacity-10 transform -rotate-12 select-none pointer-events-none">
                <Truck size={240} className="text-white" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-extrabold rounded-full uppercase tracking-widest mb-4">
                  Спецпредложение недели
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold leading-none tracking-tight font-display mb-3">
                  Карго от<br/>$0.50 / кг
                </h3>
                <p className="text-xs sm:text-sm text-orange-50 opacity-90 max-w-[85%] leading-relaxed">
                  Полная финансовая страховка груза, бесплатная консолидация на складе в Иу и фотоотчет каждой коробки перед отправкой.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/20">
                <div className="text-xs font-mono text-orange-100">
                  Мин. партия от 20 кг
                </div>
                <button 
                  onClick={() => {
                    setLeadSource("Спецтариф от $0.50/кг");
                    setIsLeadModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Закрепить тариф</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Live Tracking Status Block */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
                      <Truck className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base font-display">
                      Трекинг накладных E2D
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                    LIVE обновлено
                  </span>
                </div>

                <div className="flex flex-col min-[380px]:flex-row gap-2 mb-4">
                  <input 
                    type="text" 
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                    placeholder="Например: ET-2026-8841"
                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 px-4 py-2.5 rounded-xl text-sm font-mono text-slate-800 w-full"
                  />
                  <button 
                    onClick={() => handleTrackSearch()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0 w-full min-[380px]:w-auto text-center cursor-pointer"
                  >
                    Поиск
                  </button>
                </div>

                {trackingError && (
                  <div className="text-xs text-red-500 mb-3 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{trackingError}</span>
                  </div>
                )}

                {trackingResult && (
                  <div className="mt-4 space-y-4">
                    {/* Tiny summary metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-[11px] font-medium text-slate-600 border border-slate-100">
                      <div>
                        <div className="text-slate-400 mb-0.5">Груз</div>
                        <div className="font-bold text-slate-800 font-mono">{trackingResult.weight}</div>
                      </div>
                      <div className="border-x border-slate-200">
                        <div className="text-slate-400 mb-0.5">Маршрут</div>
                        <div className="font-bold text-slate-800 text-[10px] leading-tight">{trackingResult.route.split(" ")[0]}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-0.5">Статус</div>
                        <div className="font-bold text-emerald-600 font-mono text-[10px]">{trackingResult.status}</div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-6 space-y-4 mt-2 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      {trackingResult.steps.map((step: any, sIdx: number) => (
                        <div key={sIdx} className="relative text-xs">
                          {/* Indicator node */}
                          <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] ${
                            step.completed 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "bg-white border-slate-200 text-slate-400"
                          }`}>
                            {step.completed ? <Check className="h-2 w-2" /> : "•"}
                          </div>

                          <div className="flex justify-between items-baseline gap-2">
                            <span className={`font-bold ${step.current ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                              {step.icon} {step.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{step.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instant callback order */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <form onSubmit={handleQuickCallback} className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Остались вопросы? Моментальный созвон
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Перезвоним за 3 минуты и бесплатно разберем особенности вашего товара.
                  </p>
                  <div className="flex flex-col min-[380px]:flex-row gap-2">
                    <input 
                      type="tel"
                      required
                      placeholder="+7 (999) 000-00-00"
                      value={quickCallbackPhone}
                      onChange={(e) => setQuickCallbackPhone(e.target.value)}
                      className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-xs font-mono text-slate-800 w-full"
                    />
                    <button 
                      type="submit"
                      disabled={quickCallbackSubmitted}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 w-full min-[380px]:w-auto text-center cursor-pointer"
                    >
                      {quickCallbackSubmitted ? "Жду звонка" : "Перезвонить мне"}
                    </button>
                  </div>
                  {quickCallbackSubmitted && (
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1 animate-pulse">
                      <Check className="h-3 w-3" /> Заявка передана логисту Express2day!
                    </div>
                  )}
                </form>
              </div>
            </div>

          </section>
        </main>

        {/* WIDE SECTION 2: 1688 Showcase (Vitrine 1688) */}
        <section id="vitrine-1688" className="bg-white border border-slate-200 rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-sm mt-4">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                  Актуальные тренды 1688.com
                </h2>
                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md italic uppercase tracking-wider border border-red-100">
                  Популярное в РФ
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Мы берем на себя выкуп у китайских продавцов, оплату в CNY, страховку и логистику под ключ.
              </p>
            </div>

            {/* Currency Customizer Tool */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-2xl p-3 self-stretch lg:self-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Курс выкупа 1688:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">1 ¥ = </span>
                <input 
                  type="number"
                  step="0.1"
                  min="5"
                  max="30"
                  value={yuanRate}
                  onChange={(e) => setYuanRate(Math.max(1, Number(e.target.value)))}
                  className="w-16 h-8 text-center text-sm font-bold font-mono bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800">₽</span>
              </div>
              <div className="text-[10px] text-slate-400 max-w-[120px] leading-tight hidden xl:block">
                Включает конвертацию и перевод на фабрику в Китай
              </div>
            </div>
          </div>

          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Все товары" },
                { id: "electronics", label: "Электроника" },
                { id: "audio", label: "Аудио и Звук" },
                { id: "light", label: "Умный свет" },
                { id: "health", label: "Массаж и Здоровье" },
                { id: "appliance", label: "Бытовая техника" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedCategory(filter.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === filter.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию тренда..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Grid Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const rubPrice = Math.round(prod.priceCny * yuanRate);
              const minTotalRub = Math.round(rubPrice * prod.minOrder);

              return (
                <div 
                  key={prod.id} 
                  className="bg-slate-50 rounded-3xl p-4 border border-slate-200/50 hover:border-slate-300 transition-all flex flex-col justify-between group hover:shadow-md hover:shadow-slate-100"
                >
                  <div>
                    {/* Visual box container for image */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-200">
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 text-[10px] font-bold text-slate-800 rounded-lg shadow-sm border border-slate-100">
                        {prod.category}
                      </span>
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-emerald-800 text-white text-[10px] font-mono font-bold rounded">
                        ★ {prod.rating}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                      {prod.title}
                    </h4>

                    {/* Pricing grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pb-4 border-b border-slate-200/60 text-xs">
                      <div>
                        <div className="text-slate-400 mb-0.5">Цена в Китае</div>
                        <div className="font-bold text-slate-800 font-mono text-base">
                          ¥{prod.priceCny}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-0.5">В рублях</div>
                        <div className="font-bold text-slate-900 font-mono text-base">
                          {rubPrice.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                    </div>

                    {/* MOQ details */}
                    <div className="flex justify-between text-[11px] py-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-slate-400" />
                        <span>Минимум: <strong>{prod.minOrder} {prod.moqUnit}</strong></span>
                      </div>
                      <div>
                        Сумма партии: <strong className="text-slate-800 font-mono">{minTotalRub.toLocaleString("ru-RU")} ₽</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col min-[380px]:flex-row gap-2 mt-4">
                    <button
                      onClick={() => handleProductCalculate(prod)}
                      className="flex-1 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 font-bold text-[11px] text-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span>Обсудить в ИИ</span>
                    </button>
                    <button
                      onClick={() => openLeadForProduct(prod)}
                      className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <span>Заказать выкуп</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                Ничего не найдено по вашему запросу. Попробуйте сменить категорию.
              </div>
            )}
          </div>
        </section>

        {/* WIDE SECTION 1: Dynamic Logistics Calculator */}
        <section className="bg-white border border-slate-200/80 rounded-[3rem] p-1 shadow-sm mt-4">
          <TariffCalculator onSendToChat={handleCalculatorData} />
        </section>

        {/* WIDE SECTION 3: Why choose Express2day Bento-like informational highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-display mb-1">
                Юридическая чистота ВЭД
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Официальные валютные переводы юаней в Китай. Полный пакет закрывающих документов: Торг-12, ДТ (таможенная декларация), счета-фактуры с НДС и без.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-display mb-1">
                Собственные склады в КНР
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Склады консолидации в Гуанчжоу и Иу позволяют хранить грузы бесплатно до 30 дней, проверять комплектацию по спецификациям и надежно упаковывать.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-display mb-1">
                100% Возмещение страховки
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Собственный страховой фонд гарантирует полную выплату стоимости заявленной партии товара в течение 5 рабочих дней при повреждении или утере груза.
              </p>
            </div>
          </div>

        </section>

      </div>

      {/* FOOTER */}
      <footer className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 pt-10 border-t border-slate-200 bg-slate-50/50 rounded-t-[2.5rem] p-8 sm:p-10">
        <div className="flex flex-col gap-8">
          
          {/* Main 4-column informational grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-600 border-b border-slate-200/60 pb-8">
            
            {/* Col 1: Contacts */}
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-slate-900 text-sm font-display tracking-tight uppercase text-emerald-800">
                Контакты
              </h5>
              <ul className="flex flex-col gap-2">
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Единый бесплатный номер:</span>
                  <a href="tel:88005559425" className="font-bold text-slate-800 hover:text-emerald-700 transition-colors text-sm">
                    8 (800) 555-94-25
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Московский офис:</span>
                  <a href="tel:+74951200941" className="font-semibold text-slate-800 hover:text-emerald-700 transition-colors">
                    +7 (495) 120-09-41
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Электронная почта:</span>
                  <a href="mailto:info@express-today.ru" className="font-semibold text-slate-800 hover:text-emerald-700 transition-colors">
                    info@express-today.ru
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Режим работы:</span>
                  <span className="font-medium text-slate-700">Пн - Пт • 09:00 - 19:00 (МСК)</span>
                </li>
              </ul>
            </div>

            {/* Col 2: Addresses & Warehouses */}
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-slate-900 text-sm font-display tracking-tight uppercase text-emerald-800">
                Адреса и склады
              </h5>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Юридический адрес:</span>
                  <span className="font-medium text-slate-700 leading-relaxed block">
                    115407, г. Москва, Судостроительная ул., д. 41, пом. IV, ком. 1
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Центральный склад РФ:</span>
                  <span className="font-medium text-slate-700 leading-relaxed block">
                    г. Москва, ул. Рябиновая, д. 26, стр. 2 (теплый терминал)
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Склады консолидации КНР:</span>
                  <span className="font-medium text-slate-700 leading-relaxed block">
                    Гуанчжоу (Байюнь) • Иу (Чоучжоу) • Шэньчжэнь (Баоань)
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal Info */}
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-slate-900 text-sm font-display tracking-tight uppercase text-emerald-800">
                Реквизиты и лицензии
              </h5>
              <ul className="flex flex-col gap-2">
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Организация:</span>
                  <span className="font-bold text-slate-800">ООО «ЭКСПРЕСС ТУДЕЙ»</span>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">ИНН:</span>
                  <span className="font-mono text-slate-700">7724491223</span>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">ОГРН:</span>
                  <span className="font-mono text-slate-700">1197746624941</span>
                </li>
                <li>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Лицензия таможенного представителя:</span>
                  <span className="font-semibold text-emerald-700">ВЭД №77/12-0941 (ФТС РФ)</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Services */}
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-slate-900 text-sm font-display tracking-tight uppercase text-emerald-800">
                Услуги Express2day
              </h5>
              <ul className="flex flex-col gap-2 text-slate-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Выкуп 1688, Taobao, Alibaba, Tmall</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Официальное таможенное оформление</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Доставка сборных грузов (LCL) под ключ</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Маркировка «Честный Знак» в КНР</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Финансовая и юридическая гарантия</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Social Links Row in Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
            <div className="text-slate-800 font-bold text-sm text-center sm:text-left font-display">
              Наши официальные каналы и оперативная поддержка в мессенджерах:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a 
                href="https://t.me/ExpressTodayHelp_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200/50 text-[#229ED9] rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                title="Написать в Telegram"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Telegram Bot</span>
              </a>
              <a 
                href="https://wa.me/79282568263" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-[#25D366] rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                title="Написать в WhatsApp"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>WhatsApp Чат</span>
              </a>
              <a 
                href="https://max.ru/id271700368747_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 text-amber-600 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                title="Перейти в MAX"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Бот MAX</span>
              </a>
            </div>
          </div>

          {/* Copyright, disclaimer & legal info */}
          <div className="flex flex-col gap-4 text-xs text-slate-500">
            <p className="leading-relaxed text-center sm:text-left">
              © {new Date().getFullYear()} ООО «ЭКСПРЕСС ТУДЕЙ» под брендом <strong>Express2day Logistics</strong>. Все права защищены. Информация на данном интернет-сайте носит исключительно ознакомительный характер и ни при каких условиях не является публичной офертой, определяемой положениями Статьи 437 Гражданского кодекса Российской Федерации. Расчеты в калькуляторе и рекомендации ИИ-агента являются предварительными и требуют подтверждения со стороны специалистов ВЭД.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-between items-center border-t border-slate-200/40 pt-4">
              <div className="flex flex-wrap gap-4">
                <a href="#" className="hover:text-slate-800 transition-colors">Политика конфиденциальности</a>
                <span className="text-slate-300">|</span>
                <a href="#" className="hover:text-slate-800 transition-colors">Публичная оферта</a>
                <span className="text-slate-300">|</span>
                <a href="#" className="hover:text-slate-800 transition-colors">Пользовательское соглашение</a>
              </div>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">v2.5.0 • Лицензия ФТС РФ №77/12-0941 • ИИ Агент ВЭД</span>
            </div>
          </div>
        </div>
      </footer>

      {/* LEAD CAPTURE MODAL POPUP */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl animate-fade-in">
            
            <button 
              onClick={() => {
                setIsLeadModalOpen(false);
                setLeadSubmitted(false);
                setClientName("");
                setClientPhone("");
                setClientTelegram("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>

            {!leadSubmitted ? (
              <form onSubmit={handleLeadSubmit} className="space-y-5">
                <div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                    Оформление спецификации
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Заполните контакты. Логисты Express2day рассчитают точную стоимость с учетом таможни и предложат оптимальный вариант.
                  </p>
                </div>

                {leadSource && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-snug">
                    <span className="font-bold text-slate-500 block uppercase text-[10px] tracking-wider mb-0.5">Предмет запроса:</span>
                    {leadSource}
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Ваше Имя
                    </label>
                    <input 
                      type="text" 
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="w-full px-4 h-11 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Номер Телефона
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+7 (999) 000-00-00"
                      className="w-full px-4 h-11 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Ник в Telegram (необязательно)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                      <input 
                        type="text" 
                        value={clientTelegram}
                        onChange={(e) => setClientTelegram(e.target.value)}
                        placeholder="telegram_username"
                        className="w-full pl-8 pr-4 h-11 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-[10px] text-slate-400 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Ваши данные защищены политикой конфиденциальности.</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>Отправить спецификацию</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                    Заявка принята!
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Отличный выбор, <strong>{clientName}</strong>! ИИ-Агент ВЭД зарезервировал ваши параметры и уже продублировал информацию менеджеру по закупкам. Мы свяжемся с вами в Telegram или по номеру {clientPhone}.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsLeadModalOpen(false);
                    setLeadSubmitted(false);
                    setClientName("");
                    setClientPhone("");
                    setClientTelegram("");
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Вернуться на сайт
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
