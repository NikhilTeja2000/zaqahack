import React, { useState } from 'react';
import { EmailInput } from './components/EmailInput';
import { OrderSummary } from './components/OrderSummary';
import { ParsedOrder, EmailParsingRequest } from '../../shared/types';

interface ProcessingStats {
  totalProcessed: number;
  successfulOrders: number;
  ordersWithIssues: number;
  averageConfidence: number;
}

function App() {
  const [order, setOrder] = useState<ParsedOrder | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats>({
    totalProcessed: 0,
    successfulOrders: 0,
    ordersWithIssues: 0,
    averageConfidence: 0
  });

  const handleEmailSubmit = async (request: EmailParsingRequest) => {
    setIsLoading(true);
    setError(null);
    setOrder(null);
    setValidationResult(null);

    try {
      const response = await fetch('/api/process-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data.parsedOrder);
        setValidationResult(data.data.validationResult);
        
        // Update stats
        const hasIssues = data.data.validationResult.issues.length > 0;
        const avgConfidence = data.data.parsedOrder.items.reduce((sum: number, item: any) => 
          sum + (item.confidence || 0.8), 0) / data.data.parsedOrder.items.length;
        
        setStats(prev => ({
          totalProcessed: prev.totalProcessed + 1,
          successfulOrders: prev.successfulOrders + (hasIssues ? 0 : 1),
          ordersWithIssues: prev.ordersWithIssues + (hasIssues ? 1 : 0),
          averageConfidence: ((prev.averageConfidence * prev.totalProcessed) + avgConfidence) / (prev.totalProcessed + 1)
        }));
      } else {
        throw new Error(data.error || 'Failed to process email');
      }
    } catch (err) {
      console.error('Error processing email:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🤖 Smart Order Intake System</h1>
              <p className="text-sm text-gray-600 mt-1">Zaqathon Hackathon - AI-Powered Email Processing</p>
            </div>
            
            {/* Stats Dashboard */}
            <div className="hidden md:flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg text-blue-600">{stats.totalProcessed}</div>
                <div className="text-gray-500">Processed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-green-600">{stats.successfulOrders}</div>
                <div className="text-gray-500">Success</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-yellow-600">{stats.ordersWithIssues}</div>
                <div className="text-gray-500">Issues</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-purple-600">
                  {stats.totalProcessed > 0 ? `${(stats.averageConfidence * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-gray-500">Avg Confidence</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Email Input */}
          <div className="space-y-6">
            <EmailInput onSubmit={handleEmailSubmit} isLoading={isLoading} />
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">❌</span>
                  <h3 className="font-medium text-red-900">Processing Error</h3>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* System Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">🎯 System Capabilities</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Extracts products, quantities, and customer info</li>
                <li>✅ Validates against 500+ product catalog</li>
                <li>✅ Checks inventory and MOQ requirements</li>
                <li>✅ Provides smart suggestions for issues</li>
                <li>✅ Generates structured JSON output</li>
                <li>✅ Confidence scoring for AI extractions</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <OrderSummary 
              order={order} 
              validationResult={validationResult}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Parsing</h3>
            <p className="text-sm text-gray-600">
              Uses Gemini 2.0 Flash to extract structured data from messy, unformatted customer emails
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Validation</h3>
            <p className="text-sm text-gray-600">
              Validates products against catalog, checks inventory, MOQ requirements, and suggests alternatives
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Confidence Scoring</h3>
            <p className="text-sm text-gray-600">
              Provides confidence scores for each extraction to help human reviewers focus on uncertain items
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>🏆 Built for Zaqathon Hackathon • Smart Order Intake Challenge</p>
            <p className="mt-1">Powered by React, TypeScript, Node.js, and Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 