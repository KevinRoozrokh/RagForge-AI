import React, { useState } from 'react';
import PlusIcon from './icons/PlusIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ApiKeyModal from './ApiKeyModal';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface ApiKey {
  name: string;
  project: string;
  createdOn: string;
  tier: string;
  value: string;
}

const initialApiKeys: ApiKey[] = [
  {
    name: 'medgpt',
    project: 'gen-lang-client-0392635673',
    createdOn: 'Oct 14, 2025',
    tier: 'Free tier',
    value: 'AIzaSyC..._3s4t5u6v7w8x9y0z'
  },
  {
    name: 'k-portfolio',
    project: 'gen-lang-client-0047460070',
    createdOn: 'Oct 14, 2025',
    tier: 'Free tier',
    value: 'AIzaSyD..._a1b2c3d4e5f6g7h8i'
  },
  {
    name: 'Generative Language API Key',
    project: 'gen-lang-client-0078428431',
    createdOn: 'Oct 6, 2025',
    tier: 'Free tier',
    value: 'AIzaSyE..._j9k8l7m6n5o4p3q2r'
  },
];


const ApiSettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCreateKey = () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const newKey: ApiKey = {
      name: `new-key-${generateRandomString(6)}`,
      project: `gen-lang-client-0${Math.floor(Math.random() * 900000000) + 100000000}`,
      createdOn: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
      tier: 'Free tier',
      value: `AIzaSyF..._${generateRandomString(18)}`
    };

    setApiKeys(prevKeys => [newKey, ...prevKeys]);
    setNewApiKey(newKey.value);
  };

  const handleCopy = (keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKey(keyValue);
    setTimeout(() => setCopiedKey(null), 2000); // Reset after 2 seconds
  };

  return (
    <>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl sm:text-4xl font-sans font-medium text-on-surface">API Keys</h1>
            <p className="mt-2 text-on-surface-variant">Manage your API keys for custom integrations.</p>
        </div>
        <button 
          onClick={handleCreateKey}
          className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-200">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create API key
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 border-b border-outline-variant pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-on-surface-variant">Group by</span>
            <button className="flex items-center text-sm bg-surface px-3 py-1.5 rounded-md text-on-surface hover:bg-white/10 border border-outline">
              <span>None</span>
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-on-surface-variant">Filter by</span>
            <button className="flex items-center text-sm bg-surface px-3 py-1.5 rounded-md text-on-surface hover:bg-white/10 border border-outline">
              <span>All projects</span>
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
      </div>
      
      <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Key</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Project</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Created on</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Quota tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {apiKeys.map((key) => (
                  <tr key={key.project} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-on-surface">{key.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-xs text-on-surface-variant">{key.value}</span>
                            <button
                              onClick={() => handleCopy(key.value)}
                              title="Copy API Key"
                              className="p-1 rounded-full text-on-surface-variant hover:bg-white/10 hover:text-primary transition-colors"
                              aria-label="Copy API Key"
                            >
                              {copiedKey === key.value ? (
                                <CheckIcon className="w-4 h-4 text-green-400" />
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{key.project}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{key.createdOn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{key.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      <div className="mt-8 p-6 bg-surface rounded-lg border border-outline-variant">
        <h3 className="text-lg font-medium text-on-surface">Can't find your API keys here?</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          You'll only see API keys for projects imported into Google AI Studio. Import projects from Google Cloud to manage their associated API keys. Or you can create a new API key here.
        </p>
        <a href="#" className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-light">Learn more</a>
      </div>

    </div>
    {newApiKey && (
        <ApiKeyModal 
            apiKey={newApiKey} 
            onClose={() => setNewApiKey(null)}
            title="API Key Created"
            description="Your new API key has been created. Please store it securely, as you won't be able to see it again."
        />
    )}
    </>
  );
};

export default ApiSettings;