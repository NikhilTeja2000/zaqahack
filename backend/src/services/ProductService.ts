import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import Fuse from 'fuse.js';
import { Product, ProductSearchResult } from '../../../shared/types';
import { IProductService } from '../interfaces/IProductService';

export class ProductService implements IProductService {
  private products: Product[] = [];
  private fuse: Fuse<Product> | null = null;

  async loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      const products: Product[] = [];
      const csvPath = path.join(__dirname, '../../../information/Product Catalog.csv');

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          products.push({
            Product_Code: row.Product_Code,
            Product_Name: row.Product_Name,
            Price: parseFloat(row.Price),
            Available_in_Stock: parseInt(row.Available_in_Stock),
            Min_Order_Quantity: parseInt(row.Min_Order_Quantity),
            Description: row.Description
          });
        })
        .on('end', () => {
          this.products = products;
          this.initializeFuzzySearch();
          console.log(`Loaded ${products.length} products`);
          resolve();
        })
        .on('error', reject);
    });
  }

  private initializeFuzzySearch(): void {
    const options = {
      keys: [
        { name: 'Product_Code', weight: 0.4 },
        { name: 'Product_Name', weight: 0.6 }
      ],
      threshold: 0.3,
      includeScore: true
    };
    this.fuse = new Fuse(this.products, options);
  }

  getAllProducts(): Product[] {
    return this.products;
  }

  findProductBySku(sku: string): Product | null {
    return this.products.find(p => 
      p.Product_Code.toLowerCase() === sku.toLowerCase()
    ) || null;
  }

  searchProducts(query: string): ProductSearchResult {
    const exactMatches = this.products.filter(p => 
      p.Product_Code.toLowerCase().includes(query.toLowerCase()) ||
      p.Product_Name.toLowerCase().includes(query.toLowerCase())
    );

    const fuzzyMatches: Product[] = [];
    const suggestions: Product[] = [];

    if (this.fuse) {
      const results = this.fuse.search(query);
      results.forEach(result => {
        if (result.score && result.score < 0.2) {
          fuzzyMatches.push(result.item);
        } else if (result.score && result.score < 0.5) {
          suggestions.push(result.item);
        }
      });
    }

    return {
      exactMatches,
      fuzzyMatches,
      suggestions: suggestions.slice(0, 5) // Limit suggestions
    };
  }

  validateStock(sku: string, quantity: number): boolean {
    const product = this.findProductBySku(sku);
    return product ? product.Available_in_Stock >= quantity : false;
  }

  checkMinOrderQuantity(sku: string, quantity: number): boolean {
    const product = this.findProductBySku(sku);
    return product ? quantity >= product.Min_Order_Quantity : false;
  }
} 