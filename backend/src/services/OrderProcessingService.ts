import { ParsedOrder } from '../../../shared/types';
import { IEmailParsingService } from '../interfaces/IEmailParsingService';
import { IValidationService } from '../interfaces/IValidationService';
import { IProductService } from '../interfaces/IProductService';

export class OrderProcessingService {
  constructor(
    private emailParsingService: IEmailParsingService,
    private validationService: IValidationService,
    private productService: IProductService
  ) {}

  async processEmail(emailContent: string): Promise<ParsedOrder> {
    try {
      // Step 1: Parse the email using AI
      const parsedOrder = await this.emailParsingService.parseEmail(emailContent);

      // Step 2: Validate each order item
      const validatedItems = parsedOrder.items.map(item => 
        this.validationService.validateOrderItem(item)
      );

      // Step 3: Calculate optimized quantities
      const optimizedItems = this.validationService.calculateOptimalQuantities(validatedItems);

      // Step 4: Calculate total order value
      const totalValue = optimizedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

      // Step 5: Determine overall order status
      const hasIssues = optimizedItems.some(item => item.issues.length > 0);
      const hasCriticalIssues = optimizedItems.some(item => 
        item.issues.some(issue => 
          issue.type === 'SKU_NOT_FOUND' || issue.type === 'OUT_OF_STOCK'
        )
      );

      let status: 'VALID' | 'NEEDS_REVIEW' | 'INVALID';
      if (hasCriticalIssues) {
        status = 'INVALID';
      } else if (hasIssues) {
        status = 'NEEDS_REVIEW';
      } else {
        status = 'VALID';
      }

      // Step 6: Compile overall issues
      const overallIssues = this.compileOverallIssues(optimizedItems);

      // Step 7: Calculate final confidence score
      const finalConfidence = this.calculateFinalConfidence(optimizedItems, parsedOrder.confidence);

      // Return the fully processed order
      return {
        ...parsedOrder,
        items: optimizedItems,
        totalValue,
        overallIssues,
        confidence: finalConfidence,
        status
      };

    } catch (error) {
      console.error('Error processing email:', error);
      throw new Error('Failed to process email order');
    }
  }

  private compileOverallIssues(items: any[]): any[] {
    const issues: any[] = [];
    
    // Count different types of issues
    const issueStats = {
      skuNotFound: 0,
      outOfStock: 0,
      insufficientStock: 0,
      moqNotMet: 0
    };

    items.forEach(item => {
      item.issues.forEach((issue: any) => {
        switch (issue.type) {
          case 'SKU_NOT_FOUND':
            issueStats.skuNotFound++;
            break;
          case 'OUT_OF_STOCK':
            issueStats.outOfStock++;
            break;
          case 'INSUFFICIENT_STOCK':
            issueStats.insufficientStock++;
            break;
          case 'MOQ_NOT_MET':
            issueStats.moqNotMet++;
            break;
        }
      });
    });

    // Create summary issues
    if (issueStats.skuNotFound > 0) {
      issues.push({
        type: 'SKU_NOT_FOUND',
        message: `${issueStats.skuNotFound} product(s) not found in catalog`,
        suggestedSolution: 'Review product codes and consider suggested alternatives'
      });
    }

    if (issueStats.outOfStock > 0) {
      issues.push({
        type: 'OUT_OF_STOCK',
        message: `${issueStats.outOfStock} product(s) are out of stock`,
        suggestedSolution: 'Remove out-of-stock items or wait for restock'
      });
    }

    if (issueStats.insufficientStock > 0) {
      issues.push({
        type: 'INSUFFICIENT_STOCK',
        message: `${issueStats.insufficientStock} product(s) have insufficient stock`,
        suggestedSolution: 'Adjust quantities to available stock levels'
      });
    }

    if (issueStats.moqNotMet > 0) {
      issues.push({
        type: 'MOQ_NOT_MET',
        message: `${issueStats.moqNotMet} product(s) don't meet minimum order quantities`,
        suggestedSolution: 'Increase quantities to meet MOQ requirements'
      });
    }

    return issues;
  }

  private calculateFinalConfidence(items: any[], baseConfidence: number): number {
    if (items.length === 0) return 0;

    const itemConfidences = items.map(item => item.confidence);
    const avgItemConfidence = itemConfidences.reduce((sum, conf) => sum + conf, 0) / items.length;
    
    // Combine base parsing confidence with validation confidence
    return (baseConfidence + avgItemConfidence) / 2;
  }
} 