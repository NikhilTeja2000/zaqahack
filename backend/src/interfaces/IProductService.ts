import { Product, ProductSearchResult } from '../../../shared/types';

export interface IProductService {
  loadProducts(): Promise<void>;
  getAllProducts(): Product[];
  findProductBySku(sku: string): Product | null;
  searchProducts(query: string): ProductSearchResult;
  validateStock(sku: string, quantity: number): boolean;
  checkMinOrderQuantity(sku: string, quantity: number): boolean;
} 