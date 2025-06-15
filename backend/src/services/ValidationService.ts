import { OrderItem, ValidationIssue, Product } from '../../../shared/types';
import { IValidationService } from '../interfaces/IValidationService';
import { IProductService } from '../interfaces/IProductService';

export class ValidationService implements IValidationService {
  constructor(private productService: IProductService) {}

  validateOrderItem(item: OrderItem): OrderItem {
    const validatedItem = { ...item };
    validatedItem.issues = [];

    // First try to find the product by exact SKU
    let product = this.productService.findProductBySku(item.sku);
    
    // If not found by SKU, try to find by product name pattern
    if (!product) {
      const searchResult = this.productService.searchProducts(item.sku);
      
      // Check if we have exact matches in the search results
      if (searchResult.exactMatches.length > 0) {
        product = searchResult.exactMatches[0];
        // Update the SKU to the correct one
        validatedItem.sku = product.Product_Code;
        console.log(`Mapped "${item.sku}" to SKU "${product.Product_Code}"`);
      } else if (searchResult.fuzzyMatches.length > 0) {
        product = searchResult.fuzzyMatches[0];
        // Update the SKU to the correct one
        validatedItem.sku = product.Product_Code;
        console.log(`Fuzzy matched "${item.sku}" to SKU "${product.Product_Code}"`);
      }
    }
    
    if (!product) {
      // Still no product found, create issue
      const searchResult = this.productService.searchProducts(item.sku);
      
      validatedItem.issues.push({
        type: 'SKU_NOT_FOUND',
        message: `Product with SKU "${item.sku}" not found`,
        suggestedSolution: 'Consider similar products or verify SKU',
        suggestedProducts: [...searchResult.fuzzyMatches, ...searchResult.suggestions].slice(0, 3)
      });
      
      validatedItem.confidence = Math.max(0, validatedItem.confidence - 0.5);
      return validatedItem;
    }

    // Update item with product information
    validatedItem.productName = product.Product_Name;
    validatedItem.price = product.Price;

    // Check stock availability
    if (product.Available_in_Stock === 0) {
      validatedItem.issues.push({
        type: 'OUT_OF_STOCK',
        message: `${product.Product_Name} is out of stock`,
        suggestedSolution: 'Consider alternative products or wait for restock'
      });
    } else if (product.Available_in_Stock < item.requestedQuantity) {
      validatedItem.issues.push({
        type: 'INSUFFICIENT_STOCK',
        message: `Only ${product.Available_in_Stock} units available, but ${item.requestedQuantity} requested`,
        suggestedSolution: `Reduce quantity to ${product.Available_in_Stock} or consider partial shipment`
      });
      
      validatedItem.validatedQuantity = product.Available_in_Stock;
    }

    // Check minimum order quantity
    if (item.requestedQuantity < product.Min_Order_Quantity) {
      validatedItem.issues.push({
        type: 'MOQ_NOT_MET',
        message: `Minimum order quantity is ${product.Min_Order_Quantity}, but ${item.requestedQuantity} requested`,
        suggestedSolution: `Increase quantity to ${product.Min_Order_Quantity} or more`
      });
    }

    // Set validated quantity if no issues
    if (validatedItem.issues.length === 0) {
      validatedItem.validatedQuantity = item.requestedQuantity;
    }

    // Calculate total price
    const finalQuantity = validatedItem.validatedQuantity || item.requestedQuantity;
    validatedItem.totalPrice = product.Price * finalQuantity;

    // Adjust confidence based on issues
    if (validatedItem.issues.length > 0) {
      validatedItem.confidence = Math.max(0.1, validatedItem.confidence - (validatedItem.issues.length * 0.2));
    }

    return validatedItem;
  }

  suggestAlternatives(sku: string): Product[] {
    const searchResult = this.productService.searchProducts(sku);
    return [...searchResult.fuzzyMatches, ...searchResult.suggestions].slice(0, 5);
  }

  calculateOptimalQuantities(items: OrderItem[]): OrderItem[] {
    return items.map(item => {
      const product = this.productService.findProductBySku(item.sku);
      if (!product) return item;

      const optimizedItem = { ...item };

      // If requested quantity is less than MOQ, suggest MOQ
      if (item.requestedQuantity < product.Min_Order_Quantity) {
        optimizedItem.validatedQuantity = product.Min_Order_Quantity;
        
        // Add suggestion issue
        const moqIssue = optimizedItem.issues.find(issue => issue.type === 'MOQ_NOT_MET');
        if (moqIssue) {
          moqIssue.suggestedSolution = `Recommended quantity: ${product.Min_Order_Quantity} (meets MOQ requirement)`;
        }
      }

      // If requested quantity exceeds stock, limit to available stock
      if (item.requestedQuantity > product.Available_in_Stock) {
        optimizedItem.validatedQuantity = product.Available_in_Stock;
      }

      return optimizedItem;
    });
  }
} 