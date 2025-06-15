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
    subtitle: "Mixed format with quantities",
    icon: "🏠",
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
    subtitle: "Formal business email",
    icon: "💼",
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
    subtitle: "International with alternatives",
    icon: "🌍",
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
    subtitle: "Urgent delivery requirements",
    icon: "⚡",
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
    subtitle: "Japanese customer formatting",
    icon: "🏯",
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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
            📧
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Email Input
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowSamples(!showSamples)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm"
        >
          {showSamples ? '🔼 Hide' : '🔽 Show'} Sample Emails
        </button>
      </div>

      {showSamples && (
        <div className="mb-6 p-4 bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📋</span>
            <h3 className="font-semibold text-slate-800">Sample Emails from Zaqathon Challenge</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {SAMPLE_EMAILS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSampleEmail(sample)}
                className="group p-3 text-left bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl hover:border-blue-300/60 hover:bg-blue-50/80 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
              >
                <div className="flex items-start gap-2">
                  <div className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {sample.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 group-hover:text-blue-800 transition-colors text-sm truncate">
                      {sample.title}
                    </div>
                    <div className="text-slate-600 text-xs mb-1">
                      {sample.subtitle}
                    </div>
                    <div className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                      {sample.content.substring(0, 60)}...
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
            📝 Paste customer email content:
          </label>
          <div className="relative">
            <textarea
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-64 p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none font-mono text-sm bg-white/50 backdrop-blur-sm placeholder-slate-400 shadow-inner"
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
            {email && (
              <div className="absolute top-3 right-3 bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">
                {email.length} chars
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-200/50">
            <span className="text-base">💡</span>
            <span>Try sample emails above or paste your own customer email</span>
          </div>
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-lg">🚀</span>
                <span>Process Email</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Processing Steps Indicator */}
      {isLoading && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="font-medium text-blue-900 text-sm">AI Processing Steps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Analyzing email structure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-200"></div>
              <span>Extracting products & quantities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-500"></div>
              <span>Validating against catalog</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-700"></div>
              <span>Calculating prices & inventory</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 