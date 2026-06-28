export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  priceCny: number;
  priceRub: number;
  minOrder: number;
  rating: number;
  imageUrl: string;
  moqUnit: string;
  weightEstKg: number;
}

export interface CalculationResult {
  weight: number;
  volume: number;
  density: number;
  category: string;
  insurance: boolean;
  insuranceCostUsd: number;
  freightCostUsd: number;
  totalCostUsd: number;
  totalCostRub: number;
  route: string;
  deliveryDays: string;
}
