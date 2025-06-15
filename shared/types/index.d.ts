export interface Product {
    Product_Code: string;
    Product_Name: string;
    Price: number;
    Available_in_Stock: number;
    Min_Order_Quantity: number;
    Description: string;
}
export interface OrderItem {
    sku: string;
    productName: string;
    requestedQuantity: number;
    validatedQuantity?: number;
    price?: number;
    totalPrice?: number;
    issues: ValidationIssue[];
    confidence: number;
}
export interface ValidationIssue {
    type: 'SKU_NOT_FOUND' | 'INSUFFICIENT_STOCK' | 'MOQ_NOT_MET' | 'OUT_OF_STOCK';
    message: string;
    suggestedSolution?: string;
    suggestedProducts?: Product[];
}
export interface CustomerInfo {
    name: string;
    email?: string;
    deliveryAddress: string;
    deliveryDate?: string;
    notes?: string;
}
export interface ParsedOrder {
    id: string;
    originalEmail: string;
    customerInfo: CustomerInfo;
    items: OrderItem[];
    totalValue: number;
    overallIssues: ValidationIssue[];
    confidence: number;
    status: 'VALID' | 'NEEDS_REVIEW' | 'INVALID';
    createdAt: Date;
}
export interface EmailParsingRequest {
    emailContent: string;
}
export interface EmailParsingResponse {
    success: boolean;
    data?: ParsedOrder;
    error?: string;
}
export interface ProductSearchResult {
    exactMatches: Product[];
    fuzzyMatches: Product[];
    suggestions: Product[];
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface AppConfig {
    geminiApiKey: string;
    port: number;
    corsOrigin: string;
}
//# sourceMappingURL=index.d.ts.map