
import { Product, Operation, User, AuditLog, StockMovement, OperationType } from '../types';
import { MOCK_PRODUCTS, MOCK_OPERATIONS, MOCK_USERS, PRODUCT_CATEGORIES } from '../constants';

// Simulated DB delay to feel like a real backend
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  private getStorage<T>(key: string, defaultData: T): T {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(stored);
  }

  private setStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Initialization ---
  async init() {
    // Ensure default data exists
    this.getStorage('nex_products', MOCK_PRODUCTS);
    this.getStorage('nex_operations', MOCK_OPERATIONS);
    this.getStorage('nex_users', MOCK_USERS);
    this.getStorage('nex_categories', PRODUCT_CATEGORIES);
    this.getStorage('nex_audit_logs', []);
    this.getStorage('nex_stock_movements', []);
    await delay(500); // Simulate connection
    return true;
  }

  // --- Auth & Users ---
  async login(email: string, password: string): Promise<User | null> {
    await delay(800);
    const users = this.getStorage<User[]>('nex_users', MOCK_USERS);
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  async getUsers(): Promise<User[]> {
    await delay(300);
    return this.getStorage<User[]>('nex_users', MOCK_USERS);
  }

  async addUser(user: User): Promise<void> {
    await delay(500);
    const users = this.getUsers();
    (await users).push(user);
    this.setStorage('nex_users', await users);
  }

  async deleteUser(id: string): Promise<void> {
    await delay(300);
    let users = await this.getUsers();
    users = users.filter(u => u.id !== id);
    this.setStorage('nex_users', users);
  }

  // --- Categories ---
  async getCategories(): Promise<string[]> {
    await delay(200);
    return this.getStorage<string[]>('nex_categories', PRODUCT_CATEGORIES);
  }

  async addCategory(category: string): Promise<void> {
    await delay(300);
    const cats = await this.getCategories();
    if (!cats.includes(category)) {
      cats.push(category);
      cats.sort();
      this.setStorage('nex_categories', cats);
    }
  }

  async deleteCategory(category: string): Promise<void> {
    await delay(300);
    let cats = await this.getCategories();
    cats = cats.filter(c => c !== category);
    this.setStorage('nex_categories', cats);
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    await delay(300);
    return this.getStorage<Product[]>('nex_products', MOCK_PRODUCTS);
  }

  async saveProduct(product: Product): Promise<void> {
    await delay(400);
    let products = await this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    
    // Check if quantity changed manually for adjustment log
    if (idx >= 0) {
      const oldQty = products[idx].quantity;
      if (oldQty !== product.quantity) {
        await this.recordStockMovement({
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id,
          date: new Date().toISOString(),
          type: 'ADJUST',
          quantity: product.quantity - oldQty,
          reference: 'Manual Adjustment',
          balanceAfter: product.quantity
        });
      }
      products[idx] = product;
    } else {
      // New product
      await this.recordStockMovement({
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        date: new Date().toISOString(),
        type: 'IN',
        quantity: product.quantity,
        reference: 'Initial Inventory',
        balanceAfter: product.quantity
      });
      products.push(product);
    }
    this.setStorage('nex_products', products);
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    let products = await this.getProducts();
    products = products.filter(p => p.id !== id);
    this.setStorage('nex_products', products);
  }

  // --- Operations ---
  async getOperations(): Promise<Operation[]> {
    await delay(300);
    return this.getStorage<Operation[]>('nex_operations', MOCK_OPERATIONS);
  }

  async saveOperation(operation: Operation): Promise<void> {
    await delay(400);
    let ops = await this.getOperations();
    const idx = ops.findIndex(o => o.id === operation.id);
    if (idx >= 0) {
      ops[idx] = operation;
    } else {
      ops.unshift(operation);
    }
    this.setStorage('nex_operations', ops);
  }

  // Transaction for processing an order
  async processOperation(op: Operation, updatedProducts: Product[]): Promise<void> {
    await delay(600);
    await this.saveOperation(op);
    this.setStorage('nex_products', updatedProducts);

    // Record Movements
    for (const item of op.items) {
      const product = updatedProducts.find(p => p.id === item.productId);
      if (product) {
        const type = op.type === OperationType.RECEIPT ? 'IN' : 'OUT';
        const qty = op.type === OperationType.RECEIPT ? item.qty : -item.qty;
        
        await this.recordStockMovement({
          id: Math.random().toString(36).substr(2, 9),
          productId: item.productId,
          date: new Date().toISOString(),
          type: type,
          quantity: qty,
          reference: op.reference,
          batchNumber: item.batchNumber,
          balanceAfter: product.quantity
        });
      }
    }
  }

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(300);
    const logs = this.getStorage<AuditLog[]>('nex_audit_logs', []);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addAuditLog(log: AuditLog): Promise<void> {
    const logs = await this.getAuditLogs();
    logs.unshift(log);
    // Keep only last 100 logs
    if (logs.length > 100) logs.pop();
    this.setStorage('nex_audit_logs', logs);
  }

  // --- Stock Movements ---
  async getStockMovements(productId?: string): Promise<StockMovement[]> {
    await delay(200);
    const movements = this.getStorage<StockMovement[]>('nex_stock_movements', []);
    const sorted = movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (productId) {
      return sorted.filter(m => m.productId === productId);
    }
    return sorted;
  }

  async recordStockMovement(move: StockMovement): Promise<void> {
    const movements = this.getStorage<StockMovement[]>('nex_stock_movements', []);
    movements.push(move);
    this.setStorage('nex_stock_movements', movements);
  }

  // --- System ---
  async resetDatabase(): Promise<void> {
    await delay(500); 
    localStorage.removeItem('nex_products');
    localStorage.removeItem('nex_operations');
    localStorage.removeItem('nex_users');
    localStorage.removeItem('nex_categories');
    localStorage.removeItem('nex_audit_logs');
    localStorage.removeItem('nex_stock_movements');
    // Force re-initialization of default data
    await this.init();
  }
}

export const db = new DatabaseService();
