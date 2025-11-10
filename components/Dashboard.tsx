import React, { useState } from 'react';
import GPTCard from './GPTCard';
import PlusIcon from './icons/PlusIcon';
import CreateGptForm from './CreateGptForm';
import { RAG, Model, MemoryMode } from '../types';

interface DashboardProps {
  rags: RAG[];
  setRags: React.Dispatch<React.SetStateAction<RAG[]>>;
  onViewApiDetails: (ragId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ rags, setRags, onViewApiDetails }) => {
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [ragToClone, setRagToClone] = useState<RAG | null>(null);

  const handleRagCreated = (newRagData: { 
    name: string; 
    description: string; 
    avatarUrl: string; 
    models: Model[]; 
    cachingEnabled: boolean;
    memoryMode: MemoryMode;
    finetuneDataset?: string;
    apiEnabled: boolean;
    apiKey?: string;
    purpose: string;
  }) => {
    const newRag: RAG = {
      ...newRagData,
      id: `rag-${Date.now()}`,
      documentCount: 0,
      apiCalls: 0,
      apiLimit: 1000,
      status: 'Unpublished',
    };
    setRags(prevRags => [newRag, ...prevRags]);
    // The form is now responsible for closing itself after the creation flow is complete.
  };

  const handleRagDeleted = (ragId: string) => {
    setRags(prevRags => prevRags.filter(rag => rag.id !== ragId));
  };


  return (
    <div className="relative h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-sans font-medium text-on-surface">My RAGs</h1>
              <p className="mt-2 text-on-surface-variant">Create and manage your custom AI assistants.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rags.map((rag) => (
            <GPTCard 
              key={rag.id} 
              rag={rag} 
              onDelete={handleRagDeleted} 
              onViewApi={() => onViewApiDetails(rag.id)}
              onClone={() => {
                setRagToClone(rag);
                setCreateFormVisible(true);
              }}
            />
          ))}
        </div>
      </div>
      <button 
        onClick={() => {
          setRagToClone(null);
          setCreateFormVisible(true);
        }}
        className="fixed bottom-8 right-8 flex items-center justify-center w-16 h-16 bg-primary-light text-primary-dark rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary"
        aria-label="Create New RAG"
        >
        <PlusIcon className="w-8 h-8" />
      </button>
      {isCreateFormVisible && (
        <CreateGptForm 
            onClose={() => {
              setCreateFormVisible(false);
              setRagToClone(null);
            }}
            onCreate={handleRagCreated}
            ragToClone={ragToClone}
        />
      )}
    </div>
  );
};

export default Dashboard;