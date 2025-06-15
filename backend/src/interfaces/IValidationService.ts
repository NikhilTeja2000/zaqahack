import { OrderItem, ValidationIssue, Product } from '../../../shared/types';

export interface IValidationService {
  validateOrderItem(item: OrderItem): OrderItem;
  suggestAlternatives(sku: string): Product[];
  calculateOptimalQuantities(items: OrderItem[]): OrderItem[];
} 