export type CartGrade = "A" | "B";

export interface CartItem {
  id: string;
  batchCode: string;
  title: string;
  grade: CartGrade;
  quantity: number;
  unit: string;
  pricePerTonne: number;
  currency: string;
  seller: string;
  location: string;
  image?: string;

  // Legacy compatibility fields for older listing-based payloads
  listingId?: string;
  price?: number;
  imageUrl?: string;
  sellerId?: string;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  vat?: number;
  total?: number;
}

export interface AddCartItemRequest {
  id?: string;
  batchCode?: string;
  listingId?: string;
  batchId?: string;
  title: string;
  grade?: CartGrade;
  quantity: number;
  unit?: string;
  pricePerTonne: number;
  currency?: string;
  seller?: string;
  location?: string;
  image?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
  unit?: string;
  pricePerTonne?: number;
  currency?: string;
}

export interface CartSummary {
  subtotal: number;
  logisticsFee: number;
  vat: number;
  total: number;
  totalItems: number;
}

export type CartEntry = CartItem;