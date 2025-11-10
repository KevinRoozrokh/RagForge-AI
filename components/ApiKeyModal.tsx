import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import CopyIcon from './icons/CopyIcon';

interface ApiKeyModalProps {
  apiKey: string;
  onClose: () => void;
  title?: string;
  description?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  apiKey, 
  onClose, 
  title = "Your New API Key", 
  description = "Here is your new API key. Please store it securely. You will not be able to see it again." 
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" aria-modal="true">
      <div className="relative w-full max-w-lg bg-surface rounded-3xl shadow-xl border border-outline-variant m-4">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-xl font-medium text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-white/10 transition-colors" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-on-surface-variant mb-4">
            {description}
          </p>
          <div className="flex items-center space-x-2 bg-background p-3 rounded-lg border border-outline">
            <span className="flex-grow font-mono text-sm text-on-surface-variant truncate">{apiKey}</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-on-surface-variant bg-tertiary hover:bg-outline rounded-md transition-colors"
            >
              <CopyIcon className="w-4 h-4" />
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end p-6 bg-surface/50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;