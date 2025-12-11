import React, { useState } from 'react';
import { generateTones } from '../services/geminiService';
import { ToneType, GeminiToneResponse } from '../types';

const MessageTab: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tones, setTones] = useState<GeminiToneResponse | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setTones(null);
    try {
      const result = await generateTones(input);
      setTones(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const toneConfig = {
    [ToneType.PROFESSIONAL]: { icon: '💼', label: 'Professional', color: 'border-blue-400' },
    [ToneType.CASUAL]: { icon: '😎', label: 'Casual', color: 'border-green-400' },
    [ToneType.POLITE]: { icon: '🤝', label: 'Polite', color: 'border-yellow-400' },
    [ToneType.FUNNY]: { icon: '😂', label: 'Funny', color: 'border-pink-400' },
    [ToneType.SOCIAL]: { icon: '✨', label: 'Social', color: 'border-purple-400' },
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto h-full">
      <div className="glass rounded-xl p-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write your message..."
          className="w-full h-24 bg-transparent p-3 text-sm focus:outline-none resize-none placeholder-gray-500 text-white"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !input}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-neonPurple to-purple-600 text-white font-bold text-sm shadow-lg hover:shadow-neonPurple/50 transition-all disabled:opacity-50"
      >
        {loading ? 'Generating Variations...' : 'Generate Tone Variations'}
      </button>

      {tones && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(Object.keys(tones) as ToneType[]).map((key) => (
            <div 
              key={key} 
              className={`glass rounded-xl p-3 border-l-4 ${toneConfig[key].color} hover:bg-white/5 transition-colors group relative`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{toneConfig[key].icon}</span>
                <span className="text-xs font-bold text-gray-400 uppercase">{toneConfig[key].label}</span>
              </div>
              <p className="text-sm text-gray-200 pr-6">{tones[key]}</p>
              
              <button 
                onClick={() => copyToClipboard(tones[key])}
                className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageTab;
