import React, { useState } from 'react';
import { EmailParsingRequest } from '../../../shared/types';

interface EmailInputProps {
  onSubmit: (request: EmailParsingRequest) => void;
  isLoading: boolean;
}

const SAMPLE_EMAILS = [
  {
    id: 1,
    title: "John's Apartment Order",
    content: `Hey there,

I'm moving into a new apartment and need to place an order. Could you get these to me by June 20, 2025?

- 9 x Coffee STRÅDAL 620
- 2 x Loveseat HEMNHOLM 512
- 10 x Sofa VIKTMARK 446
- 8 x Wardrobe LUNDLUND 757

Ship to: John Smith, 123 Maple Street, Springfield, IL 62704

Let me know if anything's out of stock!

Thanks,
John Smith`
  },
  {
    id: 2,
    title: "Lena's Quote Request",
    content: `To whom it may concern,

Please prepare a quote and availability for the following items, with quantities indicated:

* Bed TRÄNBERG 858 – Qty: 2
* Dining FJÄRDAL 292 – Qty: 5

Requested delivery date: July 1, 2025
Delivery address: 45 Königstraße, Stuttgart, Germany

Sincerely,
Lena Müller`
  },
  {
    id: 3,
    title: "Carlos's Stock Check",
    content: `Hello team,

Can you help me confirm if you have these in stock and can ship them before June 22, 2025?

I'm looking to purchase:
3 units of Bar FJÄRMARK 344
3 units of Outdoor VALLHOLM 134
7 units of Console LUNDBERG 220
3 units of Console VALLSUND 240

Send to:
Carlos Ramirez
Av. Insurgentes Sur 3500, Mexico City

If there are better alternatives for any item, I'm all ears.

Cheers,
Carlos Ramirez`
  },
  {
    id: 4,
    title: "Fatima's Urgent Order",
    content: `Hi,

I'd like to buy the following items urgently:
Loveseat FJÄRBERG 744 – need 7 pcs
Wardrobe SNÖRSKÄR 220 – need 8 pcs
Ottoman TRÄNSUND 415 – need 6 pcs

Ship them to: Al-Mutannabi St, Beirut, Lebanon
Deadline: June 30, 2025

Thanks,
Fatima Al-Sayeed`
  },
  {
    id: 5,
    title: "Yuki's Procurement",
    content: `Greetings,

Following up on our conversation – I've shortlisted the products below for procurement:

8 pieces: Office LUNDMARK 699
1 pieces: Nightstand SNÖRFORS 19
3 pieces: Bar MÖRKDAL 443

Do deliver to: 2-11-3 Meguro, Tokyo, Japan
Before: June 18, 2025

Let me know pricing and availability.
Warm regards,
Yuki Tanaka`
  }
];

export const EmailInput: React.FC<EmailInputProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit({ emailContent: email.trim() });
    }
  };

  const loadSampleEmail = (sampleEmail: typeof SAMPLE_EMAILS[0]) => {
    setEmail(sampleEmail.content);
    setShowSamples(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">📧 Email Input</h2>
        <button
          type="button"
          onClick={() => setShowSamples(!showSamples)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          {showSamples ? 'Hide' : 'Show'} Sample Emails
        </button>
      </div>

      {showSamples && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📋 Sample Emails from Zaqathon:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {SAMPLE_EMAILS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSampleEmail(sample)}
                className="p-2 text-left text-sm bg-white border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-800">{sample.title}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {sample.content.substring(0, 50)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Paste customer email content:
          </label>
          <textarea
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="Paste the raw email content here...

Example:
Hey there,
I need to order:
- 2x Coffee STRÅDAL 620
- 1x Wardrobe LUNDLUND 757

Ship to: John Doe, 123 Main St, City
Thanks!"
            required
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 Tip: Try one of the sample emails above or paste your own messy customer email
          </div>
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                🚀 Process Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 