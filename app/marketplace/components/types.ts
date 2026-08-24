import type { QualityGrade } from "./FilterPanel";

export interface CassavaBatch {
  id: string;
  batchCode: string;
  title: string;
  grade: QualityGrade;
  quantity: number;
  unit?: string;
  pricePerTonne: number;
  currency?: string;
  location: string;
  storageLocation?: string;
  seller: string;
  storageTime: string;
  temperatureC: number;
  humidityPercent: number;
  isNew?: boolean;
  description?: string;
  images?: string[];
}

export type { QualityGrade };