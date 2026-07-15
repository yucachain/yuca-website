import type { QualityGrade } from "./FilterPanel";

export interface CassavaBatch {
  id: string;
  batchCode: string;
  title: string;
  grade: QualityGrade;
  quantity: number;
  unit?: string; // default "Tonnes"
  pricePerTonne: number;
  currency?: string; // default "₦"
  location: string;
  storageLocation?: string; // defaults to `location` if omitted
  seller: string;
  storageTime: string; // e.g. "16hrs"
  temperatureC: number;
  humidityPercent: number;
  isNew?: boolean;
  description?: string;
  /** First entry is the main photo; remaining entries are thumbnails. */
  images?: string[];
}

export type { QualityGrade };