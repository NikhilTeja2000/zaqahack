import { ParsedOrder, ValidationIssue } from '../../../shared/types';
import * as fs from 'fs';
import * as path from 'path';

export class PDFFormFillerService {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '../../../information/sales_order_form_full.pdf');
  }

  /**
   * Generate a filled sales order form based on the parsed order
   * Note: This is a simplified implementation. In production, you'd use libraries like pdf-lib
   * to actually fill PDF forms or generate new PDFs with the order data.
   */
  async generateSalesOrderForm(
    parsedOrder: ParsedOrder, 
    validationResult: any
  ): Promise<{ success: boolean; filePath?: string; data?: any }> {
    try {
      // For this hackathon demo, we'll generate a structured data representation
      // that could be used to fill a PDF form
      const salesOrderData = this.prepareSalesOrderData(parsedOrder, validationResult);
      
      // In a real implementation, you would:
      // 1. Load the PDF template
      // 2. Fill the form fields with the data
      // 3. Save the filled PDF
      // 4. Return the path to the filled PDF
      
      // For now, we'll return the structured data that would be used to fill the form
      return {
        success: true,
        data: salesOrderData
      };
    } catch (error) {
      console.error('Error generating sales order form:', error);
      return {
        success: false
      };
    }
  }

  private prepareSalesOrderData(parsedOrder: ParsedOrder, validationResult: any) {
    const currentDate = new Date().toLocaleDateString();
    const orderNumber = `ORD-${Date.now()}`;
    
    return {
      // Header Information
      orderNumber,
      orderDate: currentDate,
      
      // Customer Information
      customerName: parsedOrder.customerInfo.name || 'N/A',
      customerEmail: parsedOrder.customerInfo.email || 'N/A',
      deliveryAddress: parsedOrder.customerInfo.deliveryAddress || 'N/A',
      requestedDeliveryDate: parsedOrder.customerInfo.deliveryDate || 'N/A',
      
      // Order Items
      items: validationResult.validItems.map((item: any, index: number) => ({
        lineNumber: index + 1,
        sku: item.sku,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.subtotal,
        stockStatus: item.stock >= item.quantity ? 'Available' : 'Insufficient Stock',
        moqStatus: item.quantity >= item.moq ? 'Met' : 'Below MOQ'
      })),
      
      // Order Summary
      totalItems: validationResult.validItems.length,
      subtotal: validationResult.totalPrice,
      tax: validationResult.totalPrice * 0.1, // Assuming 10% tax
      grandTotal: validationResult.totalPrice * 1.1,
      
      // Validation Status
      hasIssues: validationResult.issues.length > 0,
      issues: validationResult.issues.map((issue: any) => ({
        type: issue.type,
        message: issue.message,
        suggestions: issue.suggestions || []
      })),
      
      // Processing Information
      processedBy: 'Smart Order Intake System',
      processedAt: new Date().toISOString(),
      confidence: this.calculateOverallConfidence(parsedOrder),
      
      // Form Fields Mapping (for PDF form filling)
      formFields: {
        'order_number': orderNumber,
        'order_date': currentDate,
        'customer_name': parsedOrder.customerInfo.name || '',
        'customer_email': parsedOrder.customerInfo.email || '',
        'delivery_address': parsedOrder.customerInfo.deliveryAddress || '',
        'delivery_date': parsedOrder.customerInfo.deliveryDate || '',
        'total_amount': validationResult.totalPrice.toFixed(2),
        'status': validationResult.issues.length > 0 ? 'NEEDS_REVIEW' : 'APPROVED',
        'notes': this.generateOrderNotes(parsedOrder, validationResult)
      }
    };
  }

  private calculateOverallConfidence(parsedOrder: ParsedOrder): number {
    if (!parsedOrder.items || parsedOrder.items.length === 0) return 0;
    
    const totalConfidence = parsedOrder.items.reduce((sum, item) => 
      sum + (item.confidence || 0.8), 0
    );
    
    return totalConfidence / parsedOrder.items.length;
  }

  private generateOrderNotes(parsedOrder: ParsedOrder, validationResult: any): string {
    const notes = [];
    
    // Add confidence note
    const confidence = this.calculateOverallConfidence(parsedOrder);
    notes.push(`AI Extraction Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    // Add issue notes
    if (validationResult.issues.length > 0) {
      notes.push(`Issues Found: ${validationResult.issues.length}`);
      validationResult.issues.forEach((issue: any) => {
        notes.push(`- ${issue.message}`);
      });
    }
    
    // Add processing note
    notes.push('Processed by Smart Order Intake System');
    
    return notes.join('\n');
  }

  /**
   * Get PDF form template information
   */
  getTemplateInfo(): { exists: boolean; path?: string } {
    try {
      if (fs.existsSync(this.templatePath)) {
        return {
          exists: true,
          path: this.templatePath
        };
      }
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  }
} 