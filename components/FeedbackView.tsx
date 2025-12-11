import React, { useState } from 'react';
import { updateToolStats, AVAILABLE_TOOLS } from '../services/recommender';
import { FeedbackPendingItem, AppView } from '../types';

declare var chrome: any;

interface FeedbackViewProps {
  item: FeedbackPendingItem;
  onComplete: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ item, onComplete }) => {
  const [rating, setRating] = useState<number | null>(null);
  
  const toolName = AVAILABLE_TOOLS.find(t => t.id === item.toolId)?.name || "AI Tool";

  const handleRate = async (r: number) => {
    setRating(r);
    // 1-5 rating based on index
    await updateToolStats(item.toolId, r);
    
    // Clear pending
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      const result: any = await new Promise(resolve => chrome.storage.local.get('pendingFeedback', resolve));
      const pendingFeedback = result.pendingFeedback || {};
      delete pendingFeedback[item.promptHash];
      await new Promise(resolve => chrome.storage.local.set({ pendingFeedback }, resolve));
    } else {
      const stored = localStorage.getItem('pendingFeedback');
      if (stored) {
          const pendingFeedback = JSON.parse(stored);
          delete pendingFeedback[item.promptHash];
          localStorage.setItem('pendingFeedback', JSON.stringify(pendingFeedback));
      }
    }

    setTimeout(onComplete, 1000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 rounded-full bg-neonBlue/20 flex items-center justify-center mb-4 text-3xl">
        👋
      </div>
      <h2 className="text-xl font-bold text-white mb-2">How was {toolName}?</h2>
      <p className="text-sm text-gray-400 mb-8">Help Reflekt recommend better tools for you.</p>

      <div className="flex gap-4">
        {[
          { r: 1, icon: '😡' },
          { r: 3, icon: '😐' },
          { r: 4, icon: '🙂' },
          { r: 5, icon: '😍' }
        ].map((opt) => (
          <button
            key={opt.r}
            onClick={() => handleRate(opt.r)}
            className="text-4xl hover:scale-125 transition-transform p-2 rounded-full hover:bg-white/5"
          >
            {opt.icon}
          </button>
        ))}
      </div>

      <button onClick={onComplete} className="mt-12 text-xs text-gray-500 hover:text-white underline">
        Skip Feedback
      </button>
    </div>
  );
};

export default FeedbackView;