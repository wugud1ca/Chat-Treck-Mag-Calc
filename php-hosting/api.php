<?php
/**
 * Express2day - VED AI Agent PHP Proxy for Gemini API
 * 
 * This script serves as a drop-in replacement for the Express/Node.js backend (server.ts)
 * when deploying the application on a standard PHP hosting provider.
 * 
 * It listens for POST requests containing chat history, formats them according to the 
 * Gemini API schema, and proxies the request to Google's official Gemini endpoint.
 */

// 1. Configure Error Reporting (can be turned off in production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// 2. Set CORS & Content-Type Headers to allow smooth communication with the React frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Define configuration & Gemini API Key
// We search for the key in:
//   a) A local config or .env file (if parsed)
//   b) Environment variables
//   c) A fallback hardcoded value (you can insert your key below)
$gemini_api_key = getenv('GEMINI_API_KEY');

// If key is not in system environment, try reading a local .env file manually
if (empty($gemini_api_key) && file_exists(__DIR__ . '/.env')) {
    $env_lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if ($name === 'GEMINI_API_KEY') {
            $gemini_api_key = trim($value, '"\'');
            break;
        }
    }
}

// EDIT THIS LINE: If your hosting doesn't support environment variables, paste your key here
if (empty($gemini_api_key)) {
    $gemini_api_key = "YOUR_GEMINI_API_KEY_HERE";
}

// Validation check
if (empty($gemini_api_key) || $gemini_api_key === "YOUR_GEMINI_API_KEY_HERE") {
    http_response_code(500);
    echo json_encode([
        "error" => "Configuration Error",
        "details" => "Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable or configure it in api.php."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 4. AI VED Agent System Instruction
$system_instruction = "Ты — профессиональный ИИ Агент ВЭД (Внешнеэкономической деятельности) и эксперт по логистике компании \"Express2day\".\n" .
"Твоя цель — консультировать российских предпринимателей и клиентов по вопросам доставки грузов из Китая (карго и белая доставка) и выкупа товаров с китайских платформ (1688, Taobao, Alibaba, Tmall).\n\n" .
"Правила твоего общения:\n" .
"1. Пиши исключительно на русском языке, вежливо, экспертно, убедительно и дружелюбно. Избегай лишней воды. Пиши структурированно, используя списки и абзацы.\n" .
"2. Поддерживай специфический логистический сленг, но пиши понятно для новичков.\n" .
"3. Маршруты доставки, которыми мы оперируем:\n" .
"   - Быстрое авто (Fast Auto): 12-15 дней, от $2.5/кг. Идеально для одежды, обуви, электроники.\n" .
"   - Медленное / Обычное авто (Standard Auto): 18-25 дней, от $1.5/кг. Оптимальное соотношение цена/срок.\n" .
"   - Ж/Д доставка: 30-40 дней, от $0.8 - $1.2/кг. Для тяжелых, объемных партий, станков, оборудования.\n" .
"   - Авиа: 5-8 дней, от $4.5/кг. Для сверхсрочных грузов, образцов, дорогой микроэлектроники.\n" .
"4. Выкуп с 1688 / Taobao:\n" .
"   - Комиссия за выкуп составляет от 3% до 5% от стоимости заказа.\n" .
"   - Мы берем на себя общение с поставщиками, оплату в юанях (CNY), консолидацию грузов на наших собственных складах в Гуанчжоу и Иу.\n" .
"   - Делаем бесплатный фотоотчет при получении на складе в Китае, проверяем на явный брак.\n" .
"   - Делаем надежную упаковку: обрешетка, деревянный каркас (паллетный борт), влагозащитный мешок, скотч.\n" .
"5. Расчет стоимости:\n" .
"   - Если клиент просит рассчитать доставку, спроси у него ключевые параметры: Вес (кг), Объем (м³), наименование/категорию товара и нужно ли страхование.\n" .
"   - Если у тебя уже есть данные расчета из встроенного калькулятора (они передаются в сообщении), сразу прокомментируй их экспертно: подтверди, что тариф реалистичен, предложи оптимальный маршрут (например, авто или ж/д в зависимости от плотности груза — соотношения веса и объема), расскажи про требования к упаковке для данного типа товара.\n" .
"6. Действие к высокой конверсии:\n" .
"   - В конце содержательного ответа ненавязчиво, но уверенно предложи оставить контакты (Telegram или телефон) для точной сметы, подготовки договора и связи с персональным менеджером, который закрепит за клиентом выгодный тариф.\n" .
"7. Ответы должны быть компактными и удобными для чтения на мобильных устройствах и в чате. Используй эмодзи для разделов, но умеренно.";

// 5. Read incoming JSON request payload
$raw_input = file_get_contents('php://input');
$input_data = json_decode($raw_input, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($input_data['messages']) || !is_array($input_data['messages'])) {
    http_response_code(400);
    echo json_encode([
        "error" => "Bad Request",
        "details" => "Method must be POST and contain a 'messages' array."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 6. Format messages into Gemini REST API payload schema
$formatted_contents = [];
foreach ($input_data['messages'] as $msg) {
    // Map standard roles: 'assistant' -> 'model', others -> 'user'
    $role = ($msg['role'] === 'assistant') ? 'model' : 'user';
    $text = isset($msg['content']) ? $msg['content'] : '';
    
    $formatted_contents[] = [
        "role" => $role,
        "parts" => [
            ["text" => $text]
        ]
    ];
}

// Construct the complete Gemini Request Body
$gemini_request = [
    "contents" => $formatted_contents,
    "systemInstruction" => [
        "parts" => [
            ["text" => $system_instruction]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.7
    ]
];

// 7. Make the cURL request to Google Gemini API
$model = "gemini-2.5-flash"; // Highly reliable, fast model for chat proxying
$endpoint_url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($gemini_api_key);

$ch = curl_init($endpoint_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($gemini_request));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "User-Agent: aistudio-build-php-proxy"
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Keep secure on public servers

$response_raw = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// 8. Handle Gemini API response
if ($response_raw === false) {
    http_response_code(502);
    echo json_encode([
        "error" => "Gateway Error",
        "details" => "Failed to connect to Gemini API. Error: " . $curl_error
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

$response_data = json_decode($response_raw, true);

if ($http_code !== 200) {
    http_response_code($http_code);
    echo json_encode([
        "error" => "Gemini API Error",
        "details" => isset($response_data['error']['message']) ? $response_data['error']['message'] : "Unknown error returned from Gemini.",
        "raw" => $response_data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Extract text from Gemini structure
$reply_text = "";
if (isset($response_data['candidates'][0]['content']['parts'][0]['text'])) {
    $reply_text = $response_data['candidates'][0]['content']['parts'][0]['text'];
} else {
    $reply_text = "Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.";
}

// 9. Return the formatted response back to the React app
echo json_encode([
    "response" => $reply_text
], JSON_UNESCAPED_UNICODE);
