import React, { useState } from 'react';
import PlusIcon from './icons/PlusIcon';
import { VoiceRAG } from '../types';
import CreateVoiceRagForm from './CreateVoiceRagForm';
import VoiceRAGCard from './VoiceRAGCard';
import LiveConversationModal from './LiveConversationModal';

interface VoiceDashboardProps {
  voiceRags: VoiceRAG[];
  setVoiceRags: React.Dispatch<React.SetStateAction<VoiceRAG[]>>;
}

const VoiceDashboard: React.FC<VoiceDashboardProps> = ({ voiceRags, setVoiceRags }) => {
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [practiceRag, setPracticeRag] = useState<VoiceRAG | null>(null);

  const handleVoiceRagCreated = (newRagData: Omit<VoiceRAG, 'id'>) => {
    const newRag: VoiceRAG = {
      ...newRagData,
      id: `vrag-${Date.now()}`,
    };
    setVoiceRags(prev => [newRag, ...prev]);
    setCreateFormVisible(false);
  };

  const handleVoiceRagDeleted = (ragId: string) => {
    setVoiceRags(prev => prev.filter(rag => rag.id !== ragId));
  };

  return (
    <div className="relative h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-sans font-medium text-on-surface">Voice AI RAGs</h1>
              <p className="mt-2 text-on-surface-variant">Build and manage your conversational voice assistants.</p>
        </div>
        
        {voiceRags.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {voiceRags.map((rag) => (
                    <VoiceRAGCard 
                        key={rag.id} 
                        rag={rag} 
                        onDelete={handleVoiceRagDeleted}
                        onPractice={() => setPracticeRag(rag)}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-surface/50 rounded-2xl border-2 border-dashed border-outline-variant">
                <h3 className="text-xl font-medium text-on-surface">No Voice AI Assistants Yet</h3>
                <p className="mt-2 text-on-surface-variant">Click the button below to create your first voice RAG.</p>
            </div>
        )}

      </div>
      <button 
        onClick={() => setCreateFormVisible(true)}
        className="fixed bottom-8 right-8 flex items-center justify-center w-16 h-16 bg-primary-light text-primary-dark rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary"
        aria-label="Create New Voice AI"
        >
        <PlusIcon className="w-8 h-8" />
      </button>
      {isCreateFormVisible && (
        <CreateVoiceRagForm 
            onClose={() => setCreateFormVisible(false)}
            onCreate={handleVoiceRagCreated}
        />
      )}
      {practiceRag && (
        <LiveConversationModal 
            rag={practiceRag}
            onClose={() => setPracticeRag(null)}
        />
      )}
    </div>
  );
};

export default VoiceDashboard;