/**
 * Marketplace catalog item used by the product grid and product detail panel.
 * This mirrors the design data shown on the marketplace listing cards.
 */
export type QualityGrade = "A" | "B";

export interface MarketplaceProduct {
  id: string;
  batchCode: string;
  title: string;
  grade: QualityGrade;
  quantity: number;
  unit?: string;
  pricePerTonne: number;
  currency?: string;
  category: string;
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

export interface MarketplaceListing extends MarketplaceProduct {}

export interface CreateProductRequest {
  title: string;
  batchCode?: string;
  grade: QualityGrade;
  quantity: number;
  unit?: string;
  pricePerTonne: number;
  currency?: string;
  category: string;
  location: string;
  storageLocation?: string;
  seller: string;
  storageTime?: string;
  temperatureC?: number;
  humidityPercent?: number;
  description?: string;
  images?: string[];
}

export interface CreateListingRequest extends CreateProductRequest {}

export interface UpdateProductRequest {
  title?: string;
  batchCode?: string;
  grade?: QualityGrade;
  quantity?: number;
  unit?: string;
  pricePerTonne?: number;
  currency?: string;
  category?: string;
  location?: string;
  storageLocation?: string;
  seller?: string;
  storageTime?: string;
  temperatureC?: number;
  humidityPercent?: number;
  description?: string;
  images?: string[];
}

export interface UpdateListingRequest extends UpdateProductRequest {}

export interface ListingCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MarketplaceCategory extends ListingCategory {}
