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

/* ------------------------------------------------------------------ */
/*  Marketplace API Contracts                                         */
/* ------------------------------------------------------------------ */

export interface GetProductsParams {
  Category?: string;
  Grade?: string;
  Location?: string;
  MinPrice?: number;
  MaxPrice?: number;
  Search?: string;
  Role?: string;
  Page?: number;
  PageSize?: number;
}

export interface CheckoutQuoteRequest {
  deliveryMethod: "SelfPickup" | "Delivery" | string;
  deliveryAddress?: string;
  pickupLocation?: string;
}

export interface CheckoutQuoteResponse {
  quoteId?: string;
  deliveryFee?: number;
  serviceFee?: number;
  subtotal?: number;
  total?: number;
  estimatedDeliveryDays?: number;
  deliveryMethod?: string;
  deliveryAddress?: string;
  pickupLocation?: string;
  [key: string]: any;
}

export interface CreateMarketplaceOrderRequest {
  type?: string;
  paymentMethod: "BankTransfer" | "Card" | string;
  deliveryMethod: "SelfPickup" | "Delivery" | string;
  deliveryAddress?: string;
  pickupLocation?: string;
  preferredPickupDate?: string;
  logisticsNote?: string;
  batchId?: string;
  quantityKg?: number;
}

export interface VerifyPaymentResponse {
  reference: string;
  status: string;
  successful: boolean;
  amount?: number;
  provider?: string;
  message?: string;
  [key: string]: any;
}

export interface GetMyOrdersParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ConfirmDeliveryResponse {
  successful?: boolean;
  message?: string;
  [key: string]: any;
}

export interface CreateFarmerBatchRequest {
  Variety: string;
  EstimatedWeightKg: number;
  HarvestDate: string;
  HarvestLatitude?: number;
  HarvestLongitude?: number;
  HarvestState?: string;
  HarvestLga?: string;
  IntendedDestination?: string;
  Notes?: string;
  photos?: string[];
}

export interface CreateProcessorProductRequest {
  category: string;
  processedCategory?: string;
  productName: string;
  description?: string;
  price: number;
  unitOfMeasure: string;
  stockAvailable?: number;
  machinesAvailable?: number;
  minimumOrder?: number;
  location?: string;
  sourceBatchId?: string;
  status?: "Draft" | "Active" | string;
  photoUrls?: string[];
  certifications?: string[];
}

export interface CreateServiceListingRequest {
  category: string;
  processedCategory?: string;
  productName: string;
  description?: string;
  price: number;
  unitOfMeasure: string;
  stockAvailable?: number;
  machinesAvailable?: number;
  minimumOrder?: number;
  location?: string;
  sourceBatchId?: string;
  status?: "Draft" | "Active" | string;
  photoUrls?: string[];
  certifications?: string[];
}

export interface SellerSaleItem {
  id?: string;
  orderNumber: string;
  productName?: string;
  productTitle?: string;
  category?: string;
  buyerName?: string;
  quantity?: number;
  unit?: string;
  totalAmount: number;
  payoutStatus?: string;
  status?: string;
  date?: string;
  createdAt?: string;
  [key: string]: any;
}
