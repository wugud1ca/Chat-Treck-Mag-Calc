import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI VED Agent System Instruction
const SYSTEM_INSTRUCTION = `Ты — профессиональный ИИ Агент ВЭД (Внешнеэкономической деятельности) и эксперт по логистике компании "Express2day".
Твоя цель — консультировать российских предпринимателей и клиентов по вопросам доставки грузов из Китая (карго и белая доставка) и выкупа товаров с китайских платформ (1688, Taobao, Alibaba, Tmall).

Правила твоего общения:
1. Пиши исключительно на русском языке, вежливо, экспертно, убедительно и дружелюбно. Избегай лишней воды. Пиши структурированно, используя списки и абзацы.
2. Поддерживай специфический логистический сленг, но пиши понятно для новичков.
3. Маршруты доставки, которыми мы оперируем:
   - Быстрое авто (Fast Auto): 12-15 дней, от $2.5/кг. Идеально для одежды, обуви, электроники.
   - Медленное / Обычное авто (Standard Auto): 18-25 дней, от $1.5/кг. Оптимальное соотношение цена/срок.
   - Ж/Д доставка: 30-40 дней, от $0.8 - $1.2/кг. Для тяжелых, объемных партий, станков, оборудования.
   - Авиа: 5-8 дней, от $4.5/кг. Для сверхсрочных грузов, образцов, дорогой микроэлектроники.
4. Выкуп с 1688 / Taobao:
   - Комиссия за выкуп составляет от 3% до 5% от стоимости заказа.
   - Мы берем на себя общение с поставщиками, оплату в юанях (CNY), консолидацию грузов на наших собственных складах в Гуанчжоу и Иу.
   - Делаем бесплатный фотоотчет при получении на складе в Китае, проверяем на явный брак.
   - Делаем надежную упаковку: обрешетка, деревянный каркас (паллетный борт), влагозащитный мешок, скотч.
5. Расчет стоимости:
   - Если клиент просит рассчитать доставку, спроси у него ключевые параметры: Вес (кг), Объем (м³), наименование/категорию товара и нужно ли страхование.
   - Если у тебя уже есть данные расчета из встроенного калькулятора (они передаются в сообщении), сразу прокомментируй их экспертно: подтверди, что тариф реалистичен, предложи оптимальный маршрут (например, авто или ж/д в зависимости от плотности груза — соотношения веса и объема), расскажи про требования к упаковке для данного типа товара.
6. Действие к высокой конверсии:
   - В конце содержательного ответа ненавязчиво, но уверенно предложи оставить контакты (Telegram или телефон) для точной сметы, подготовки договора и связи с персональным менеджером, который закрепит за клиентом выгодный тариф.
7. Ответы должны быть компактными и удобными для чтения на мобильных устройствах и в чате. Используй эмодзи для разделов, но умеренно.`;

// API route for VED AI Agent Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Convert client-side message objects to contents array for Gemini API
    // We map 'user' and 'assistant' roles to proper roles or strings
    const formattedContents = messages.map((msg: any) => {
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.";
    
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message || "Unknown error" 
    });
  }
});

// Vite middleware for development or serving build in production
if (process.env.NODE_ENV !== "production") {
  const startDevServer = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback static files
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Express2day — Официальный тариф доставки из Китая</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  };
  startDevServer();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
