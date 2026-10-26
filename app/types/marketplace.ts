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
  category?: "cassava-tubers" | "processed-derivatives" | "services-machinery" | string;
  sellerRole?: "farmer" | "processor" | "service-provider" | string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  page?: number;
  limit?: number;
  // Backward compatibility aliases
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
  items?: Array<{ productId: string; quantity: number }>;
  deliveryMethod: "yucavault-pickup" | "direct-delivery" | string;
  deliveryAddress?: string;
  pickupLocation?: string;
  [key: string]: any;
}

export interface CheckoutQuoteResponse {
  quoteId?: string;
  deliveryFee?: number;
  escrowFee?: number;
  subtotal?: number;
  totalAmount?: number;
  escrowGuarantee?: string;
  [key: string]: any;
}

export interface CreateMarketplaceOrderRequest {
  items?: Array<{ productId: string; quantity: number; unitPrice?: number }>;
  deliveryMethod: "yucavault-pickup" | "direct-delivery" | string;
  deliveryAddress?: string;
  paymentMethod: "bank-transfer" | string;
  notes?: string;
  type?: string;
  batchId?: string;
  quantityKg?: number;
  [key: string]: any;
}

export interface VerifyPaymentResponse {
  reference: string;
  status: string;
  successful?: boolean;
  amountPaid?: number;
  paidAt?: string;
  [key: string]: any;
}

export interface GetMyOrdersParams {
  status?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
}

export interface ConfirmDeliveryResponse {
  successful?: boolean;
  message?: string;
  [key: string]: any;
}

// 4.1 Farmer - Register Cassava Harvest Batch
export interface CreateFarmerBatchRequest {
  variety: string;
  weightKg: number;
  pricePerKg: number;
  farmLocation: string;
  harvestDate: string;
  storageDestination: string;
  // Optional extra metadata
  qualityGrade?: string;
  pricePerTonne?: number;
  notes?: string;
  harvestState?: string;
  harvestLga?: string;
  harvestLatitude?: number;
  harvestLongitude?: number;
  photoUrls?: string[];
  [key: string]: any;
}

// 4.2 Processor - List Finished Cassava Product
export interface CreateProcessorProductRequest {
  title: string;
  category: "processed-derivatives" | string;
  processingFacility: string;
  unitPrice: number;
  unit: string;
  availableQuantity: number;
  moistureGrade?: string;
  // Optional complementary fields
  productName?: string;
  description?: string;
  price?: number;
  unitOfMeasure?: string;
  stockAvailable?: number;
  machinesAvailable?: number;
  minimumOrder?: number;
  location?: string;
  status?: string;
  photoUrls?: string[];
  certifications?: string[];
  [key: string]: any;
}

// 4.3 Service Provider - List Machinery / Tractor Service
export interface CreateServiceListingRequest {
  title: string;
  category: "services-machinery" | string;
  operationalBase: string;
  dailyRate: number;
  operatorIncluded: boolean;
  coverageRadiusKm: number;
  // Optional complementary fields
  productName?: string;
  description?: string;
  price?: number;
  unitOfMeasure?: string;
  stockAvailable?: number;
  machinesAvailable?: number;
  minimumOrder?: number;
  location?: string;
  status?: string;
  photoUrls?: string[];
  certifications?: string[];
  [key: string]: any;
}

// 4.4 Seller - Get Sales & Escrow Inflow
export interface SellerSaleItem {
  id?: string;
  orderNumber: string;
  buyerName?: string;
  item?: string;
  productTitle?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  amount?: number;
  totalAmount?: number;
  escrowStatus?: string;
  payoutStatus?: string;
  status?: string;
  date?: string;
  createdAt?: string;
  sellerBankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  [key: string]: any;
}

