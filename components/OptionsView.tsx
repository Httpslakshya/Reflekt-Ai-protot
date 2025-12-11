import React from 'react';

const OptionsView: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={goBack} className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>

      <div className="glass p-4 rounded-xl">
        <h3 className="text-sm font-bold text-white mb-2">API Configuration</h3>
        <p className="text-xs text-gray-400">
          The API key is managed via environment variables (process.env.API_KEY).
        </p>
      </div>
    </div>
  );
};

export default OptionsView;
