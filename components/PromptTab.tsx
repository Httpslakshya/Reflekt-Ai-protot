import React, { useState } from 'react';
import { PromptMode, AITool } from '../types';
import { enhancePrompt } from '../services/geminiService';
import { getRecommendations, trackToolUsage } from '../services/recommender';

const PromptTab: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<PromptMode>(PromptMode.NORMAL);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AITool[]>([]);

  const handleToggleFlavor = (flavor: string) => {
    setFlavors(prev => 
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
  };

  const handleEnhance = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRecommendations([]); 
    
    try {
      const refined = await enhancePrompt(input, mode, flavors);
      setOutput(refined);
      
      // Get AI Recommendations based on refined text or input
      const recs = await getRecommendations(input);
      setRecommendations(recs);
    } catch (err) {
      setOutput("Error: Could not connect to Gemini. Check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleToolClick = (tool: AITool) => {
    // Copy text
    navigator.clipboard.writeText(output);
    // Track usage & set alarm
    trackToolUsage(tool.id, output, 'unknown'); // Intent is re-detected inside track if needed, or passed
    // Open URL
    window.open(tool.url, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 overflow-y-auto h-full">
      {/* Input */}
      <div className="glass rounded-xl p-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write or paste your rough prompt..."
          className="w-full h-24 bg-transparent p-3 text-sm focus:outline-none resize-none placeholder-gray-500 text-white"
        />
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: PromptMode.LIGHT, label: 'Light', icon: '✨' },
          { id: PromptMode.NORMAL, label: 'Normal', icon: '📄' },
          { id: PromptMode.DETAILED, label: 'Detailed', icon: '🧠' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              mode === m.id
                ? 'bg-neonBlue/10 border-neonBlue text-neonBlue neon-glow'
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="text-xl mb-1">{m.icon}</span>
            <span className="text-[10px] font-bold uppercase">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Flavor Options */}
      <div className="flex flex-col gap-2">
        {['Aesthetic', 'Step-by-step', 'Include Examples'].map((flav) => (
          <button
            key={flav}
            onClick={() => handleToggleFlavor(flav)}
            className={`w-full text-left px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
              flavors.includes(flav)
                ? 'bg-gradient-to-r from-neonPurple/20 to-transparent border-neonPurple/50 text-white'
                : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
            }`}
          >
            {flavors.includes(flav) ? '✓ ' : '+ '} {flav}
          </button>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={handleEnhance}
        disabled={loading || !input}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-neonBlue to-blue-600 text-black font-bold text-sm shadow-lg hover:shadow-neonBlue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enhancing with Reflekt...' : 'Enhance Prompt'}
      </button>

      {/* Output Area */}
      {output && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass rounded-xl p-3 relative group">
            <div className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
              {output}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="absolute top-2 right-2 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
            >
              Copy
            </button>
          </div>

          {/* AI Suggestions */}
          {recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Recommended Tools</h3>
              <div className="flex flex-col gap-2">
                {recommendations.map(tool => (
                  <div
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neonBlue/50 hover:bg-white/10 cursor-pointer transition-all group"
                  >
                    <div className="text-2xl">{tool.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white group-hover:text-neonBlue transition-colors">{tool.name}</div>
                      <div className="text-[10px] text-gray-400">{tool.subtitle}</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptTab;
