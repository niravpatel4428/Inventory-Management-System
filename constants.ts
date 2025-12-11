
import { Product, Operation, OperationType, OperationStatus, Carrier, User } from './types';

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Accessories',
  'Office Supplies',
  'Computers',
  'Mobile Devices'
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', sku: 'ELEC-001', name: 'Wireless Ergonomic Mouse', category: 'Electronics', quantity: 145, unit: 'pcs', location: 'WH/Stock/Row1', price: 29.99, cost: 12.50, supplier: 'TechSource Inc.', minLevel: 20 },
  { id: '2', sku: 'ELEC-002', name: 'Mechanical Keyboard RGB', category: 'Electronics', quantity: 12, unit: 'pcs', location: 'WH/Stock/Row1', price: 89.99, cost: 45.00, supplier: 'TechSource Inc.', minLevel: 15 },
  { id: '3', sku: 'FURN-104', name: 'Office Chair - Mesh', category: 'Furniture', quantity: 8, unit: 'pcs', location: 'WH/Stock/Row4', price: 150.00, cost: 80.00, supplier: 'FurniWorld', minLevel: 5 },
  { id: '4', sku: 'ACC-552', name: 'USB-C Hub Multiport', category: 'Accessories', quantity: 300, unit: 'pcs', location: 'WH/Stock/Row2', price: 45.00, cost: 15.00, supplier: 'CableKing', minLevel: 50 },
  { id: '5', sku: 'ELEC-005', name: '27" 4K Monitor', category: 'Electronics', quantity: 0, unit: 'pcs', location: 'WH/Stock/Row3', price: 350.00, cost: 210.00, supplier: 'ScreenMasters', minLevel: 10 },
];

export const MOCK_OPERATIONS: Operation[] = [
  { id: 'op1', reference: 'WH/IN/00124', type: OperationType.RECEIPT, partner: 'TechSource Inc.', status: OperationStatus.READY, scheduledDate: '2023-10-25', items: [{ productId: '1', qty: 50, done: 0 }] },
  { id: 'op2', reference: 'WH/OUT/00098', type: OperationType.DELIVERY, partner: 'Acme Corp', status: OperationStatus.READY, scheduledDate: '2023-10-26', items: [{ productId: '2', qty: 2, done: 0 }] },
  { id: 'op3', reference: 'WH/INT/0033', type: OperationType.INTERNAL, partner: 'Internal', status: OperationStatus.DRAFT, scheduledDate: '2023-10-27', items: [{ productId: '4', qty: 10, done: 0 }] },
  { id: 'op4', reference: 'WH/OUT/00099', type: OperationType.DELIVERY, partner: 'Globex', status: OperationStatus.DONE, scheduledDate: '2023-10-24', items: [{ productId: '3', qty: 1, done: 1 }] },
];

export const CARRIERS: Carrier[] = [
  { id: 'fedex', name: 'FedEx', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/FedEx_Express.svg/1200px-FedEx_Express.svg.png', rate: 12.50 },
  { id: 'ups', name: 'UPS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/United_Parcel_Service_logo_2014.svg/1718px-United_Parcel_Service_logo_2014.svg.png', rate: 14.20 },
  { id: 'dhl', name: 'DHL', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Logo.svg/2560px-DHL_Logo.svg.png', rate: 18.00 },
  { id: 'usps', name: 'USPS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/USPS_Logo_2024.svg/1024px-USPS_Logo_2024.svg.png', rate: 8.99 },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@nex.com', role: 'admin', avatar: 'AU', password: '123' },
  { id: 'u2', name: 'Manager', email: 'manager@nex.com', role: 'manager', avatar: 'MG', password: '123' },
  { id: 'u3', name: 'Worker', email: 'worker@nex.com', role: 'user', avatar: 'WK', password: '123' },
];
