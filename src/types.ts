export type LocationType = 'HQ' | 'PROVINCIAL' | 'KHAN' | 'CENTRAL';

export interface Location {
  id: string;
  nameKh: string;
  nameEn: string;
  type: LocationType;
  code: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  nameKh: string;
  nameEn: string;
  category: string;
  unit: string;
  minStock: number; // For low-stock alerts
  imageUrl?: string;
}

export interface Stock {
  locationId: string;
  itemId: string;
  quantity: number;
}

export type TransactionType = 'STOCK_IN' | 'HANDOVER' | 'STOCK_OUT' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  type: TransactionType;
  fromLocationId: string | null;
  toLocationId: string | null;
  itemId: string;
  quantity: number;
  remark: string;
  createdAt: string;
  recordedBy: string;
}

export type Language = 'kh' | 'en';
