import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { ParsedOrder, CustomerInfo, OrderItem } from '../../../shared/types';
import { IEmailParsingService } from '../interfaces/IEmailParsingService';

export class EmailParsingService implements IEmailParsingService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async parseEmail(emailContent: string): Promise<ParsedOrder> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Parse the following customer email and extract order information. Return ONLY a valid JSON object with this exact structure:

        {
          "customerInfo": {
            "name": "string",
            "email": "string or null",
            "deliveryAddress": "string",
            "deliveryDate": "string or null",
            "notes": "string or null"
          },
          "items": [
            {
              "sku": "string (product code)",
              "productName": "string",
              "requestedQuantity": number,
              "confidence": number (0-1)
            }
          ]
        }

        Email content:
        ${emailContent}

        Rules:
        - For SKU: If you see a full product code like "DSK-0001", "CFT-0167", use that exactly
        - If you only see product names like "Coffee STRÅDAL 620", extract the descriptive part "STRÅDAL 620" as the SKU
        - For productName: Extract the full product description (e.g., "Coffee STRÅDAL 620")
        - Extract quantities (numbers before 'x' or after 'Qty:')
        - Extract customer name from signature or greeting
        - Extract delivery address if mentioned
        - Extract delivery date if mentioned
        - Set confidence based on how clear the information is
        - Return ONLY the JSON, no other text
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      // Create the full ParsedOrder object
      const parsedOrder: ParsedOrder = {
        id: uuidv4(),
        originalEmail: emailContent,
        customerInfo: parsedData.customerInfo,
        items: parsedData.items.map((item: any) => ({
          ...item,
          issues: [],
          price: 0,
          totalPrice: 0
        })),
        totalValue: 0,
        overallIssues: [],
        confidence: this.calculateOverallConfidence(parsedData.items),
        status: 'NEEDS_REVIEW',
        createdAt: new Date()
      };

      return parsedOrder;
    } catch (error) {
      console.error('Error parsing email:', error);
      
      // Fallback: create a basic order with the raw email
      return {
        id: uuidv4(),
        originalEmail: emailContent,
        customerInfo: {
          name: 'Unknown Customer',
          deliveryAddress: 'Address not specified'
        },
        items: [],
        totalValue: 0,
        overallIssues: [{
          type: 'SKU_NOT_FOUND',
          message: 'Failed to parse email content',
          suggestedSolution: 'Manual review required'
        }],
        confidence: 0,
        status: 'INVALID',
        createdAt: new Date()
      };
    }
  }

  private calculateOverallConfidence(items: any[]): number {
    if (items.length === 0) return 0;
    const totalConfidence = items.reduce((sum, item) => sum + item.confidence, 0);
    return totalConfidence / items.length;
  }
} 