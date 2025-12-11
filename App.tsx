import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptTab from './components/PromptTab';
import MessageTab from './components/MessageTab';
import OptionsView from './components/OptionsView';
import FeedbackView from './components/FeedbackView';
import { AppView, FeedbackPendingItem } from './types';

declare var chrome: any;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.PROMPT);
  const [feedbackItem, setFeedbackItem] = useState<FeedbackPendingItem | null>(null);

  useEffect(() => {
    // Check for pending feedback items that need action (flagged by background script)
    // Safe guard for non-extension environments
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      chrome.storage.local.get(['pendingFeedback'], (result: any) => {
        const pending = result.pendingFeedback || {};
        const hashes = Object.keys(pending);
        
        // Find one that was clicked in notification
        const actionItemHash = hashes.find((h: string) => pending[h].needsAction);
        
        if (actionItemHash) {
          setFeedbackItem(pending[actionItemHash]);
          setCurrentView(AppView.FEEDBACK);
        }
      });
    }
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case AppView.PROMPT:
        return <PromptTab />;
      case AppView.MESSAGE:
        return <MessageTab />;
      case AppView.OPTIONS:
        return <OptionsView goBack={() => setCurrentView(AppView.PROMPT)} />;
      case AppView.FEEDBACK:
        return feedbackItem ? (
          <FeedbackView 
            item={feedbackItem} 
            onComplete={() => setCurrentView(AppView.PROMPT)} 
          />
        ) : (
          <PromptTab />
        );
      default:
        return <PromptTab />;
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-slate-900 via-[#101424] to-slate-900">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-neonBlue/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-neonPurple/10 rounded-full blur-[80px] pointer-events-none" />

      {currentView !== AppView.OPTIONS && currentView !== AppView.FEEDBACK && (
        <Header currentView={currentView} setView={setCurrentView} />
      )}
      
      <main className="flex-1 relative z-10 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;