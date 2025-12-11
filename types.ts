
export enum ProductStatus {
  IN_STOCK = 'In Stock',
  LOW_STOCK = 'Low Stock',
  OUT_OF_STOCK = 'Out of Stock',
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // New: e.g., 'pcs', 'kg', 'box'
  location: string;
  price: number;
  cost: number;
  supplier: string;
  minLevel: number;
}

export enum OperationType {
  RECEIPT = 'Receipt',
  DELIVERY = 'Delivery',
  INTERNAL = 'Internal Transfer',
  ADJUSTMENT = 'Inventory Adjustment'
}

export enum OperationStatus {
  DRAFT = 'Draft',
  READY = 'Ready',
  DONE = 'Done',
}

export interface Operation {
  id: string;
  reference: string;
  type: OperationType;
  partner: string; // Customer or Supplier
  status: OperationStatus;
  scheduledDate: string;
  items: { productId: string; qty: number; done: number; batchNumber?: string }[];
}

export interface Carrier {
  id: string;
  name: string;
  logo: string; // URL or icon name
  rate: number;
}

export interface AIInsight {
  type: 'warning' | 'suggestion' | 'success';
  message: string;
  action?: string;
}

export type Role = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  password?: string; // In a real app, never store plain text passwords
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  entityId?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  date: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reference: string;
  batchNumber?: string;
  balanceAfter: number;
}
