import { useState, useEffect } from "react";
import { Scale, Box, Shield, ChevronRight, Truck, Info, HelpCircle, Train, Ship, Plane } from "lucide-react";
import { CalculationResult } from "../types";

interface TariffCalculatorProps {
  onSendToChat: (text: string) => void;
}

export default function TariffCalculator({ onSendToChat }: TariffCalculatorProps) {
  const [weight, setWeight] = useState<number>(120);
  const [volume, setVolume] = useState<number>(0.8);
  const [category, setCategory] = useState<string>("clothing");
  const [methodId, setMethodId] = useState<string>("fast_auto");
  const [insurance, setInsurance] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Categories pricing rates per kg or m3 based on density
  const CATEGORIES = [
    { id: "clothing", label: "Одежда и текстиль", rateMultiplier: 1.0 },
    { id: "electronics", label: "Электроника и гаджеты", rateMultiplier: 1.4 },
    { id: "equipment", label: "Станки и промышленное оборудование", rateMultiplier: 1.15 },
    { id: "household", label: "Хозтовары и быт", rateMultiplier: 0.9 },
    { id: "accessories", label: "Аксессуары и сумки", rateMultiplier: 1.1 }
  ];

  // Shipping methods with pricing rules
  const SHIPPING_METHODS = [
    {
      id: "fast_auto",
      label: "Быстрое Авто (Манчжурия)",
      baseRatePerKg: 2.2,
      baseRatePerM3: 350,
      days: "12-15 дней",
      description: "Оптимальный баланс цены и сроков доставки"
    },
    {
      id: "railway",
      label: "Ж/Д Доставка (Прямой поезд)",
      baseRatePerKg: 1.1,
      baseRatePerM3: 170,
      days: "28-35 дней",
      description: "Надежно для крупных партий и станков"
    },
    {
      id: "sea",
      label: "Морская доставка (LCL порт РФ)",
      baseRatePerKg: 0.6,
      baseRatePerM3: 95,
      days: "40-48 дней",
      description: "Максимальная экономия для несрочных грузов"
    },
    {
      id: "air",
      label: "АВИА Экспресс (Шэньчжэнь)",
      baseRatePerKg: 5.2,
      baseRatePerM3: 820,
      days: "5-8 дней",
      description: "Сверхбыстрая отправка ценных грузов и образцов"
    }
  ];

  const calculateTariff = () => {
    // Basic cargo logistics logic: Density = Weight / Volume
    const density = parseFloat((weight / (volume || 0.01)).toFixed(1));
    
    const catMultiplier = CATEGORIES.find(c => c.id === category)?.rateMultiplier || 1.0;
    const method = SHIPPING_METHODS.find(m => m.id === methodId) || SHIPPING_METHODS[0];

    // Under 120 kg/m3 cargo is volume-based (объемный груз), above is heavy (плотный груз)
    const isVolumeBilling = density < 120;
    let freightCostUsd = 0;

    if (isVolumeBilling) {
      freightCostUsd = parseFloat((volume * method.baseRatePerM3 * catMultiplier).toFixed(1));
    } else {
      freightCostUsd = parseFloat((weight * method.baseRatePerKg * catMultiplier).toFixed(1));
    }

    // Standard insurance is 1.5% of cargo estimated value (let's assume cargo value is weight * $15)
    const estimatedValueUsd = weight * 15;
    const insuranceCostUsd = insurance ? parseFloat((estimatedValueUsd * 0.015).toFixed(1)) : 0;
    
    const totalCostUsd = parseFloat((freightCostUsd + insuranceCostUsd).toFixed(1));
    
    // Current imaginary but realistic currency rate (1 USD = 92.5 RUB)
    const totalCostRub = Math.round(totalCostUsd * 92.5);

    setResult({
      weight,
      volume,
      density,
      category: CATEGORIES.find(c => c.id === category)?.label || "",
      insurance,
      insuranceCostUsd,
      freightCostUsd,
      totalCostUsd,
      totalCostRub,
      route: method.label,
      deliveryDays: method.days
    });
  };

  useEffect(() => {
    calculateTariff();
  }, [weight, volume, category, insurance, methodId]);

  const handleApply = () => {
    if (!result) return;
    const promptText = `Привет! Я рассчитал стоимость доставки на калькуляторе сайта:
- Вес: ${result.weight} кг
- Объем: ${result.volume} м³
- Плотность груза: ${result.density} кг/м³
- Категория: ${result.category}
- Страховка: ${result.insurance ? "Нужна" : "Не нужна"}
- Предварительный расчет логистики: $${result.totalCostUsd} (~${result.totalCostRub.toLocaleString("ru-RU")} руб.)
- Рекомендуемый маршрут: ${result.route} (${result.deliveryDays})

Подскажи, пожалуйста, насколько точен этот расчет, какие требования будут к упаковке для этой категории товара, и как мы можем запустить выкуп и доставку?`;
    onSendToChat(promptText);
  };

  return (
    <div id="tariff-calculator" className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-2">
            Калькулятор Cargo плотности
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Экспресс-расчет стоимости доставки
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Тариф зависит от веса, объема и категории. Рассчитайте плотность для выбора маршрута.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <Truck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Курс расчетов</div>
            <div className="text-sm font-semibold font-mono text-slate-800">1$ = 92.50 ₽</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-slate-400" /> Вес груза (кг)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors bg-slate-50 focus:bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">кг</span>
              </div>
              <input
                type="range"
                min="10"
                max="3000"
                step="10"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full mt-3 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Volume */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-slate-400" /> Объем груза (м³)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Math.max(0.01, Number(e.target.value)))}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors bg-slate-50 focus:bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">м³</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full mt-3 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Категория товаров груза
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-3 text-left text-sm rounded-xl border transition-all flex items-center justify-between ${
                    category === cat.id
                      ? "border-slate-800 bg-slate-900 text-white font-medium"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{cat.label}</span>
                  {category === cat.id && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Shipping Method Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Способ и маршрут доставки
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SHIPPING_METHODS.map((method) => {
                const IconComponent = 
                  method.id === "fast_auto" ? Truck :
                  method.id === "railway" ? Train :
                  method.id === "sea" ? Ship :
                  Plane;
                return (
                  <button
                    key={method.id}
                    onClick={() => setMethodId(method.id)}
                    className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between h-[96px] ${
                      methodId === method.id
                        ? "border-emerald-600 bg-emerald-50/10 ring-1 ring-emerald-500 font-medium"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className={`h-4 w-4 ${methodId === method.id ? "text-emerald-600" : "text-slate-400"}`} />
                        <span className="font-bold text-xs text-slate-950">{method.label.split(" (")[0]}</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">{method.days}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug mt-1 line-clamp-2">
                      {method.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insurance */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Финансовое страхование (1.5%)</div>
                <div className="text-xs text-slate-500">Полная компенсация в случае задержки или утери груза</div>
              </div>
            </div>
            <button
              onClick={() => setInsurance(!insurance)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                insurance ? "bg-emerald-500" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  insurance ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Outputs / Calculations */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-100 rounded-2xl p-6 flex flex-col justify-between border border-slate-800">
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Предварительная смета</div>

            {/* Main price display */}
            <div className="pb-6 border-b border-slate-800">
              <div className="text-sm text-slate-400 mb-1">Ориентировочная стоимость доставки</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {result ? result.totalCostRub.toLocaleString("ru-RU") : "0"}
                </span>
                <span className="text-lg font-semibold text-emerald-400">₽</span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                ≈ ${result?.totalCostUsd} (включая страховку и погрузочные работы)
              </div>
            </div>

            {/* Calculations metrics grid */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Карго плотность</div>
                <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
                  {result?.density} <span className="text-xs text-slate-400">кг/м³</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Страховой взнос</div>
                <div className="text-base font-bold font-mono text-white">
                  ${result?.insuranceCostUsd || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Выбранный маршрут</div>
                <div className="text-sm font-semibold text-slate-200">
                  {result?.route}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Ожидаемый срок</div>
                <div className="text-sm font-semibold text-white">
                  {result?.deliveryDays}
                </div>
              </div>
            </div>

            {/* Density info bubble */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2.5 leading-relaxed">
              <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                Плотность вашего груза составляет <strong className="text-white">{result?.density} кг/м³</strong>.{" "}
                {result && result.density < 120 ? (
                  <span>
                    Это считается <strong className="text-white">объемным грузом</strong> (менее 120 кг/м³). Стоимость доставки рассчитывается <strong className="text-emerald-400">по объему (м³)</strong>.
                  </span>
                ) : (
                  <span>
                    Это считается <strong className="text-white">плотным грузом</strong> (более 120 кг/м³). Стоимость доставки рассчитывается наиболее выгодно — <strong className="text-emerald-400">по весу (кг)</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <span>Передать расчет ИИ-Агенту</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
