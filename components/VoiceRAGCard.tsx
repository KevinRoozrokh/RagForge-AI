import React from 'react';
import { VoiceRAG } from '../types';
import TrashIcon from './icons/TrashIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import { AVAILABLE_VOICES, AVAILABLE_LANGUAGES } from '../constants';

interface VoiceRAGCardProps {
  rag: VoiceRAG;
  onDelete: (id: string) => void;
  onPractice: () => void;
}

const VoiceRAGCard: React.FC<VoiceRAGCardProps> = ({ rag, onDelete, onPractice }) => {

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete "${rag.name}"?`)) {
        onDelete(rag.id);
    }
  };

  const voiceName = AVAILABLE_VOICES.find(v => v.id === rag.voice)?.name || rag.voice;
  const languageName = AVAILABLE_LANGUAGES.find(l => l.id === rag.language)?.name || rag.language;

  return (
    <div className="flex flex-col bg-surface rounded-2xl shadow-lg hover:shadow-primary/10 transition-all duration-300 border border-outline-variant hover:border-primary-dark">
      <div className="flex-1 p-6">
        <div className="flex items-start space-x-4">
            <img src={rag.avatarUrl} alt={rag.name} className="w-14 h-14 rounded-lg object-cover border-2 border-outline" />
            <div>
                <h3 className="text-lg font-medium text-on-surface">{rag.name}</h3>
                <p className="mt-1 text-sm text-on-surface-variant line-clamp-2">{rag.description}</p>
            </div>
        </div>
        
        <div className="mt-4 space-y-3 pt-4 border-t border-outline-variant">
            <div className="flex items-center text-sm text-on-surface-variant">
                <MicrophoneIcon className="w-5 h-5 mr-2 text-secondary" />
                <span>Voice: <strong>{voiceName}</strong></span>
            </div>
            <div className="flex items-center text-sm text-on-surface-variant">
                <span className="w-5 h-5 mr-2 text-secondary text-center font-bold">A</span>
                <span>Language: <strong>{languageName}</strong></span>
            </div>
        </div>
      </div>
      
      <div className="bg-surface/50 border-t border-outline-variant p-2 flex justify-around rounded-b-2xl">
        <button 
          onClick={onPractice}
          className="flex-1 text-center py-2 px-3 text-sm font-medium rounded-full text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-colors"
        >
          Practice
        </button>
        <button 
          onClick={handleDeleteClick}
          className="p-2 rounded-full text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors"
          title={`Delete ${rag.name}`}
          aria-label={`Delete ${rag.name}`}
        >
            <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VoiceRAGCard;