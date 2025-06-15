import React from 'react';
import { ParsedOrder, ValidationIssue } from '../../../shared/types';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  User, 
  MapPin, 
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';

interface OrderSummaryProps {
  order: ParsedOrder | null;
  validationResult: any | null;
  isLoading: boolean;
}

const ConfidenceBar: React.FC<{ confidence: number }> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);
  const getColor = () => {
    if (percentage >= 90) return 'from-green-500 to-emerald-500';
    if (percentage >= 70) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const getTextColor = () => {
    if (percentage >= 90) return 'text-green-700';
    if (percentage >= 70) return 'text-amber-700';
    return 'text-red-700';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div 
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className={`text-sm font-bold ${getTextColor()} min-w-[3rem]`}>
        {percentage}%
      </span>
    </div>
  );
};

const IssueIcon: React.FC<{ type: string }> = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case 'INSUFFICIENT_STOCK':
        return { icon: '📦', color: 'text-red-600 bg-red-100' };
      case 'INVALID_SKU':
        return { icon: '❌', color: 'text-red-600 bg-red-100' };
      case 'MOQ_NOT_MET':
        return { icon: '⚠️', color: 'text-amber-600 bg-amber-100' };
      default:
        return { icon: 'ℹ️', color: 'text-blue-600 bg-blue-100' };
    }
  };

  const { icon, color } = getIcon();
  
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} text-sm`}>
      {icon}
    </div>
  );
};

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  order, 
  validationResult, 
  isLoading 
}) => {
  const exportToJSON = () => {
    if (!order || !validationResult) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      customer: order.customerInfo,
      orderItems: validationResult.validItems,
      validation: {
        totalItems: validationResult.validItems.length,
        totalPrice: validationResult.totalPrice,
        issues: validationResult.issues,
        hasIssues: validationResult.issues.length > 0
      },
      rawOrder: order
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.customerInfo.email || 'unknown'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDFForm = async () => {
    if (!order || !validationResult) return;
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsedOrder: order,
          validationResult: validationResult
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Download the PDF form data as JSON (in a real app, this would be a PDF)
        const blob = new Blob([JSON.stringify(data.data.formData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-order-form-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('📄 PDF Form data generated! In production, this would be a filled PDF form.');
      } else {
        throw new Error(data.error || 'Failed to generate PDF form');
      }
    } catch (error) {
      console.error('Error generating PDF form:', error);
      alert('❌ Failed to generate PDF form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">AI Processing Your Email</h3>
            <p className="text-slate-600 mb-4">Extracting products, validating inventory, calculating prices</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="text-center text-slate-500 py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
            📧
          </div>
          <h3 className="text-2xl font-bold text-slate-700 mb-3">No Order Processed Yet</h3>
          <p className="text-slate-600 text-lg">Paste a customer email to see the AI magic happen!</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <span>✨</span>
            <span>AI-powered • Real-time validation • Smart suggestions</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    );
  }

  const hasIssues = validationResult?.issues?.length > 0;
  const totalItems = validationResult?.validItems?.length || 0;
  const totalPrice = validationResult?.totalPrice || 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white text-lg">
            📋
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Order Summary
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToJSON}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-base">📄</span>
            <span>Export JSON</span>
          </button>
          <button
            onClick={generatePDFForm}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-base">📋</span>
            <span>PDF Form</span>
          </button>
          <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${
            hasIssues 
              ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200' 
              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
          }`}>
            {hasIssues ? '⚠️ Issues Found' : '✅ All Valid'}
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">👤 Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Email:</span> {order.customerInfo.email || 'Not provided'}
          </div>
          <div>
            <span className="font-medium">Name:</span> {order.customerInfo.name || 'Not provided'}
          </div>
                     <div className="md:col-span-2">
             <span className="font-medium">Address:</span> {order.customerInfo.deliveryAddress || 'Not provided'}
           </div>
          {order.customerInfo.deliveryDate && (
            <div>
              <span className="font-medium">Delivery Date:</span> {order.customerInfo.deliveryDate}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">🛍️ Order Items ({totalItems})</h3>
        <div className="space-y-3">
          {validationResult?.validItems?.map((item: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">${item.subtotal.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">${item.price} × {item.quantity}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">Stock:</span> {item.stock}
                    {item.stock >= item.quantity ? (
                      <span className="text-green-600 ml-1">✅</span>
                    ) : (
                      <span className="text-red-600 ml-1">❌</span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">MOQ:</span> {item.moq}
                    {item.quantity >= item.moq ? (
                      <span className="text-green-600 ml-1">✅</span>
                    ) : (
                      <span className="text-yellow-600 ml-1">⚠️</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Confidence:</span>
                  <ConfidenceBar confidence={item.confidence || 0.8} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues Section */}
      {hasIssues && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-3">⚠️ Validation Issues</h3>
          <div className="space-y-2">
            {validationResult.issues.map((issue: ValidationIssue, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-red-400">
                <IssueIcon type={issue.type} />
                <div className="flex-1">
                  <div className="font-medium text-red-900">{issue.message}</div>
                                     {issue.suggestedSolution && (
                     <div className="mt-2">
                       <div className="text-sm font-medium text-gray-700">💡 Suggestion:</div>
                       <div className="text-sm text-gray-600 mt-1">
                         <span className="text-blue-500">→</span> {issue.suggestedSolution}
                       </div>
                     </div>
                   )}
                   {issue.suggestedProducts && issue.suggestedProducts.length > 0 && (
                     <div className="mt-2">
                       <div className="text-sm font-medium text-gray-700">🔄 Alternative Products:</div>
                       <ul className="text-sm text-gray-600 mt-1 space-y-1">
                         {issue.suggestedProducts.map((product, idx) => (
                           <li key={idx} className="flex items-center gap-2">
                             <span className="text-blue-500">→</span>
                             {product.Product_Name} ({product.Product_Code}) - ${product.Price}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>💰 Total Order Value:</span>
          <span className="text-2xl text-green-600">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {totalItems} items • {hasIssues ? 'Requires attention' : 'Ready to process'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          📝 Review & Edit Order
        </button>
        <button 
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            hasIssues 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          disabled={hasIssues}
        >
          {hasIssues ? '⚠️ Resolve Issues First' : '✅ Approve Order'}
        </button>
      </div>
    </div>
  );
}; 