import { Request, Response } from 'express';
import { z } from 'zod';
import { OrderProcessingService } from '../services/OrderProcessingService';
import { PDFFormFillerService } from '../services/PDFFormFillerService';
import { ApiResponse, EmailParsingRequest } from '../../../shared/types';

// Validation schema
const EmailParsingSchema = z.object({
  emailContent: z.string().min(1, 'Email content is required')
});

export class OrderController {
  private orderProcessingService: OrderProcessingService;
  private pdfFormFillerService: PDFFormFillerService;

  constructor() {
    // Initialize services with proper dependencies
    const productService = new (require('../services/ProductService').ProductService)();
    const emailParsingService = new (require('../services/EmailParsingService').EmailParsingService)(process.env.GEMINI_API_KEY || '');
    const validationService = new (require('../services/ValidationService').ValidationService)(productService);
    
    this.orderProcessingService = new OrderProcessingService(emailParsingService, validationService, productService);
    this.pdfFormFillerService = new PDFFormFillerService();
  }

  async processEmail(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = EmailParsingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: validationResult.error.errors[0].message
        } as ApiResponse<null>);
        return;
      }

      const { emailContent } = validationResult.data;

      // Process the email
      const parsedOrder = await this.orderProcessingService.processEmail(emailContent);

      res.json({
        success: true,
        data: parsedOrder,
        message: 'Email processed successfully'
      } as ApiResponse<typeof parsedOrder>);

    } catch (error) {
      console.error('Error in processEmail controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process email'
      } as ApiResponse<null>);
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Smart Order Intake API is running',
      timestamp: new Date().toISOString()
    });
  }

  async processOrder(req: Request, res: Response): Promise<void> {
    try {
      const { emailContent }: EmailParsingRequest = req.body;

      if (!emailContent) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email content is required'
        };
        res.status(400).json(response);
        return;
      }

      const parsedOrder = await this.orderProcessingService.processEmail(emailContent);

      // Get actual product data for each validated item
      const productService = new (require('../services/ProductService').ProductService)();
      await productService.loadProducts();

      // Transform the data to match frontend expectations with real product data
      const validItems = [];
      const actualIssues = [];
      let totalPrice = 0;

      for (const item of parsedOrder.items) {
        // Find the actual product to get stock and MOQ info
        let product = productService.findProductBySku(item.sku);
        
        // If not found by exact SKU, try searching by name
        if (!product) {
          const searchResult = productService.searchProducts(item.sku);
          if (searchResult.exactMatches.length > 0) {
            product = searchResult.exactMatches[0];
          }
        }

        if (product) {
          // Product found - check for stock and MOQ issues
          const validItem = {
            sku: product.Product_Code,
            name: product.Product_Name,
            quantity: item.requestedQuantity,
            price: product.Price,
            subtotal: product.Price * item.requestedQuantity,
            stock: product.Available_in_Stock,
            moq: product.Min_Order_Quantity,
            confidence: item.confidence
          };

          validItems.push(validItem);
          totalPrice += validItem.subtotal;

          // Check for stock issues
          if (product.Available_in_Stock === 0) {
            actualIssues.push({
              type: 'OUT_OF_STOCK',
              message: `${product.Product_Name} is out of stock`,
              suggestedSolution: 'Consider alternative products or wait for restock'
            });
          } else if (product.Available_in_Stock < item.requestedQuantity) {
            actualIssues.push({
              type: 'INSUFFICIENT_STOCK',
              message: `${product.Product_Name}: Only ${product.Available_in_Stock} units available, but ${item.requestedQuantity} requested`,
              suggestedSolution: `Reduce quantity to ${product.Available_in_Stock} or consider partial shipment`
            });
          }

          // Check for MOQ issues
          if (item.requestedQuantity < product.Min_Order_Quantity) {
            actualIssues.push({
              type: 'MOQ_NOT_MET',
              message: `${product.Product_Name}: Minimum order quantity is ${product.Min_Order_Quantity}, but ${item.requestedQuantity} requested`,
              suggestedSolution: `Increase quantity to ${product.Min_Order_Quantity} or more`
            });
          }
        } else {
          // Product not found
          const notFoundItem = {
            sku: item.sku,
            name: item.productName,
            quantity: item.requestedQuantity,
            price: 0,
            subtotal: 0,
            stock: 0,
            moq: 1,
            confidence: item.confidence
          };

          validItems.push(notFoundItem);

          actualIssues.push({
            type: 'INVALID_SKU',
            message: `Product "${item.sku}" not found in catalog`,
            suggestedSolution: 'Verify product code or consider similar products'
          });
        }
      }

      const validationResult = {
        validItems,
        issues: actualIssues,
        totalPrice
      };

      const response: ApiResponse<any> = {
        success: true,
        data: {
          parsedOrder,
          validationResult
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Error processing order:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };

      res.status(500).json(response);
    }
  }

  async generatePDFForm(req: Request, res: Response): Promise<void> {
    try {
      const { parsedOrder, validationResult } = req.body;

      if (!parsedOrder || !validationResult) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parsed order and validation result are required'
        };
        res.status(400).json(response);
        return;
      }

      const pdfResult = await this.pdfFormFillerService.generateSalesOrderForm(
        parsedOrder, 
        validationResult
      );

      if (pdfResult.success) {
        const response: ApiResponse<any> = {
          success: true,
          data: {
            formData: pdfResult.data,
            templateInfo: this.pdfFormFillerService.getTemplateInfo()
          }
        };
        res.json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to generate PDF form data'
        };
        res.status(500).json(response);
      }
    } catch (error) {
      console.error('Error generating PDF form:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };

      res.status(500).json(response);
    }
  }

  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      // In a real application, you'd track these stats in a database
      const stats = {
        totalProcessed: 0,
        successfulOrders: 0,
        ordersWithIssues: 0,
        averageConfidence: 0,
        systemUptime: process.uptime(),
        version: '1.0.0',
        features: [
          'AI Email Parsing',
          'Inventory Validation',
          'Smart Suggestions',
          'Confidence Scoring',
          'PDF Form Generation',
          'JSON Export'
        ]
      };

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting system stats:', error);
      
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };

      res.status(500).json(response);
    }
  }
} 