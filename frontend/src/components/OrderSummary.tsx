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

  const generateDetailedPDFView = () => {
    if (!order || !validationResult) return;
    
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const hasIssues = validationResult.issues.length > 0;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Order Intake - Detailed Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4299e1;
        }
        
        .info-card h4 {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .info-card p {
            color: #4a5568;
        }
        
        .table-container {
            overflow-x: auto;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        
        tr:hover {
            background: #f7fafc;
        }
        
        .confidence-bar {
            width: 100px;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin: 4px 0;
        }
        
        .confidence-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .confidence-high { background: linear-gradient(90deg, #48bb78, #38a169); }
        .confidence-medium { background: linear-gradient(90deg, #ed8936, #dd6b20); }
        .confidence-low { background: linear-gradient(90deg, #f56565, #e53e3e); }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-success {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .status-warning {
            background: #faf089;
            color: #744210;
        }
        
        .status-error {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .issues-section {
            background: #fef5e7;
            border: 1px solid #f6ad55;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .issue-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 4px solid #f56565;
        }
        
        .issue-item:last-child {
            margin-bottom: 0;
        }
        
        .total-section {
            background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin-top: 30px;
        }
        
        .total-amount {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .footer {
            background: #f7fafc;
            padding: 20px 30px;
            text-align: center;
            color: #718096;
            font-size: 0.9rem;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
            .header { background: #667eea !important; }
        }
        
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
            table { font-size: 0.8rem; }
            th, td { padding: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Smart Order Intake System</h1>
            <p>AI-Powered Email Processing • Detailed Order Report</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">Generated on ${currentDate} at ${currentTime}</p>
        </div>
        
        <div class="content">
            <!-- Customer Information Section -->
            <div class="section">
                <h2 class="section-title">
                    <span>👤</span>
                    Customer Information
                </h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h4>Customer Name</h4>
                        <p>${order.customerInfo.name || 'Not provided'}</p>
                    </div>
                    <div class="info-card">
                        <h4>Email Address</h4>
                        <p>${order.customerInfo.email || 'Not provided'}</p>
                    </div>
                    <div class="info-card">
                        <h4>Delivery Address</h4>
                        <p>${order.customerInfo.deliveryAddress || 'Not provided'}</p>
                    </div>
                    <div class="info-card">
                        <h4>Requested Delivery Date</h4>
                        <p>${order.customerInfo.deliveryDate || 'Not specified'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Order Items Section -->
            <div class="section">
                <h2 class="section-title">
                    <span>📦</span>
                    Order Items (${validationResult.validItems.length} items)
                </h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>SKU</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total Price</th>
                                <th>AI Confidence</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${validationResult.validItems.map((item: any, index: number) => {
                                const confidence = Math.round((item.confidence || 0.8) * 100);
                                const confidenceClass = confidence >= 90 ? 'confidence-high' : confidence >= 70 ? 'confidence-medium' : 'confidence-low';
                                return `
                                <tr>
                                    <td><strong>${index + 1}</strong></td>
                                    <td><strong>${item.productName}</strong></td>
                                    <td><code>${item.sku}</code></td>
                                    <td><strong>${item.quantity}</strong></td>
                                    <td>$${(item.unitPrice || 0).toFixed(2)}</td>
                                    <td><strong>$${(item.totalPrice || 0).toFixed(2)}</strong></td>
                                    <td>
                                        <div class="confidence-bar">
                                            <div class="confidence-fill ${confidenceClass}" style="width: ${confidence}%"></div>
                                        </div>
                                        <small>${confidence}%</small>
                                    </td>
                                    <td><span class="status-badge status-success">✅ Valid</span></td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            ${hasIssues ? `
            <!-- Issues Section -->
            <div class="section">
                <h2 class="section-title">
                    <span>⚠️</span>
                    Validation Issues (${validationResult.issues.length})
                </h2>
                <div class="issues-section">
                    ${validationResult.issues.map((issue: any) => `
                        <div class="issue-item">
                            <h4 style="color: #742a2a; margin-bottom: 8px;">
                                ${issue.type === 'INSUFFICIENT_STOCK' ? '📦' : issue.type === 'INVALID_SKU' ? '❌' : '⚠️'} 
                                ${issue.message}
                            </h4>
                            ${issue.suggestion ? `<p style="color: #4a5568;"><strong>💡 Suggestion:</strong> ${issue.suggestion}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Order Summary -->
            <div class="total-section">
                <h2 style="margin-bottom: 20px;">Order Summary</h2>
                <div class="total-amount">$${validationResult.totalPrice.toFixed(2)}</div>
                <p style="font-size: 1.2rem; margin-bottom: 20px;">Total Order Value</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 600;">${validationResult.validItems.length}</div>
                        <div>Total Items</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 600;">${hasIssues ? validationResult.issues.length : 0}</div>
                        <div>Issues Found</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 600;">
                            ${Math.round(validationResult.validItems.reduce((sum: number, item: any) => sum + (item.confidence || 0.8), 0) / validationResult.validItems.length * 100)}%
                        </div>
                        <div>Avg Confidence</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: 600;">${hasIssues ? '⚠️ Review' : '✅ Ready'}</div>
                        <div>Order Status</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>🏆 Smart Order Intake System</strong> • Zaqathon Hackathon • AI-Powered Email Processing</p>
            <p style="margin-top: 5px;">Powered by React • TypeScript • Node.js • Gemini AI</p>
        </div>
    </div>
    
    <script>
        // Auto-print dialog for easy PDF saving
        window.onload = function() {
            setTimeout(() => {
                if (confirm('Would you like to save this report as PDF?\\n\\nClick OK to open print dialog, then choose "Save as PDF"')) {
                    window.print();
                }
            }, 1000);
        };
    </script>
</body>
</html>`;

    // Open in new window
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      alert('Please allow popups to view the detailed report!');
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
            onClick={generateDetailedPDFView}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="text-base">📋</span>
            <span>Detailed Report</span>
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
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">
            👤
          </div>
          <h3 className="font-bold text-blue-900 text-lg">Customer Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-sm text-slate-600 mb-1">Email Address</div>
            <div className="font-semibold text-slate-800">
              {order.customerInfo.email || 'Not provided'}
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-sm text-slate-600 mb-1">Customer Name</div>
            <div className="font-semibold text-slate-800">
              {order.customerInfo.name || 'Not provided'}
            </div>
          </div>
          <div className="md:col-span-2 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="text-sm text-slate-600 mb-1">Delivery Address</div>
            <div className="font-semibold text-slate-800">
              {order.customerInfo.deliveryAddress || 'Not provided'}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm">
            📦
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Order Items ({totalItems})</h3>
        </div>
        
        <div className="space-y-4">
          {validationResult?.validItems?.map((item: any, index: number) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{item.productName}</h4>
                      <div className="text-slate-600 text-sm mb-2">SKU: {item.sku}</div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Quantity:</span>
                          <span className="font-semibold text-slate-800">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Unit Price:</span>
                          <span className="font-semibold text-green-700">${item.unitPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Total:</span>
                          <span className="font-bold text-green-800">${item.totalPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confidence Score */}
                  <div className="bg-slate-50/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50">
                    <div className="text-sm text-slate-600 mb-2">AI Confidence Score</div>
                    <ConfidenceBar confidence={item.confidence || 0.8} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Issues */}
      {hasIssues && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center text-white text-sm">
              ⚠️
            </div>
            <h3 className="font-bold text-red-900 text-lg">Validation Issues ({validationResult.issues.length})</h3>
          </div>
          
          <div className="space-y-4">
            {validationResult.issues.map((issue: any, index: number) => (
              <div key={index} className="bg-red-50/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50">
                <div className="flex items-start gap-4">
                  <IssueIcon type={issue.type} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">{issue.message}</h4>
                    {issue.suggestion && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                        <div className="text-sm text-slate-600 mb-1">💡 Suggestion</div>
                        <div className="text-slate-800">{issue.suggestion}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Total */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold mb-2">Order Total</h3>
            <div className="text-slate-300 text-sm">
              {totalItems} item{totalItems !== 1 ? 's' : ''} • 
              {hasIssues ? ` ${validationResult.issues.length} issue${validationResult.issues.length !== 1 ? 's' : ''}` : ' All validated'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-400">
              ${totalPrice.toFixed(2)}
            </div>
            <div className="text-slate-300 text-sm">
              Total Value
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 