import React, { useState } from 'react';
import { RAG } from '../types';
import DocumentIcon from './icons/DocumentIcon';
import ApiIcon from './icons/ApiIcon';
import ChatIcon from './icons/ChatIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import ChatModal from './ChatModal';
import SparklesIcon from './icons/SparklesIcon';
import CacheIcon from './icons/CacheIcon';
import MemoryIcon from './icons/MemoryIcon';
import ExperimentIcon from './icons/ExperimentIcon';
import TargetIcon from './icons/TargetIcon';
import CloneIcon from './icons/CloneIcon';


interface GPTCardProps {
  rag: RAG;
  onDelete: (id: string) => void;
  onViewApi: () => void;
  onClone: () => void;
}

const GPTCard: React.FC<GPTCardProps> = ({ rag, onDelete, onViewApi, onClone }) => {
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<RAG['status']>(rag.status);
  const usagePercentage = (rag.apiCalls / rag.apiLimit) * 100;

  const handleStatusToggle = () => {
    setCurrentStatus(prevStatus => (prevStatus === 'Published' ? 'Unpublished' : 'Published'));
  };
  
  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete "${rag.name}"? This action cannot be undone.`)) {
        onDelete(rag.id);
    }
  };

  const getMemoryModeLabel = (mode: RAG['memoryMode']) => {
    switch (mode) {
      case 'session_only': return 'Session Only';
      case 'long_term': return 'Long-Term';
      case 'hybrid': return 'Hybrid';
      default: return 'Default';
    }
  };


  const IconButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }> = ({ icon, label, onClick, disabled }) => (
    <button 
        onClick={onClick}
        className="p-2 rounded-full text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-colors disabled:text-tertiary disabled:hover:bg-transparent"
        title={label}
        aria-label={label}
        disabled={disabled}
    >
        {icon}
    </button>
  );

  return (
    <>
      <div className="flex flex-col bg-surface rounded-2xl shadow-lg hover:shadow-primary/10 transition-all duration-300 border border-outline-variant hover:border-primary-dark">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                  <img src={rag.avatarUrl} alt={rag.name} className="w-14 h-14 rounded-lg object-cover border-2 border-outline" />
                  <div>
                      <h3 className="text-lg font-medium text-on-surface">{rag.name}</h3>
                      {rag.experimentId && (
                        <div className="mt-1 flex items-center text-xs font-medium text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full w-fit">
                            <ExperimentIcon className="w-3.5 h-3.5 mr-1" />
                            In Experiment
                        </div>
                      )}
                  </div>
              </div>
              <div className="text-right">
                <button
                  onClick={handleStatusToggle}
                  role="switch"
                  aria-checked={currentStatus === 'Published'}
                  aria-label={`Set status to ${currentStatus === 'Published' ? 'Unpublished' : 'Published'}`}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary ${
                      currentStatus === 'Published' ? 'bg-green-500' : 'bg-tertiary'
                  }`}
                >
                  <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                          currentStatus === 'Published' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
                <div className="mt-1 text-xs font-medium">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                    currentStatus === 'Published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {currentStatus}
                  </span>
                </div>
              </div>
          </div>
          
          <p className="mt-4 text-sm text-on-surface-variant h-20 overflow-hidden">{rag.description}</p>
          
          <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <div className="flex items-center min-w-0" title={rag.models.map(m => m.name).join(', ')}>
                    <SparklesIcon className="w-5 h-5 mr-2 text-secondary flex-shrink-0" />
                    <span className="truncate">{rag.models.map(m => m.name).join(', ') || 'No models configured'}</span>
                  </div>
                  {rag.cachingEnabled && (
                    <div className="flex items-center ml-auto pl-2 flex-shrink-0" title="Caching Enabled">
                      <CacheIcon className="w-5 h-5 text-secondary" />
                    </div>
                  )}
              </div>
              <div className="flex items-center text-sm text-on-surface-variant">
                <MemoryIcon className="w-5 h-5 mr-2 text-secondary" />
                <span>Memory: {getMemoryModeLabel(rag.memoryMode)}</span>
              </div>
               <div className="flex items-center text-sm text-on-surface-variant">
                <TargetIcon className="w-5 h-5 mr-2 text-secondary" />
                <span>Purpose: {rag.purpose || 'Not set'}</span>
              </div>
              <div className="flex items-center text-sm text-on-surface-variant">
                  <DocumentIcon className="w-5 h-5 mr-2 text-secondary" />
                  <span>{rag.documentCount} documents</span>
              </div>
               <div className="flex items-center text-sm text-on-surface-variant">
                  <ApiIcon className="w-5 h-5 mr-2 text-secondary" />
                  <span>{rag.apiCalls.toLocaleString()} / {rag.apiLimit.toLocaleString()} API calls</span>
              </div>
              <div className="w-full bg-outline rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
          </div>
        </div>
        
        <div className="bg-surface/50 border-t border-outline-variant p-2 flex justify-around rounded-b-2xl">
          <IconButton icon={<EditIcon className="w-5 h-5" />} label={`Edit ${rag.name}`} />
          <IconButton icon={<CloneIcon className="w-5 h-5" />} label={`Clone ${rag.name}`} onClick={onClone} />
          <IconButton icon={<ChatIcon className="w-5 h-5" />} label={`Chat with ${rag.name}`} onClick={() => setChatModalOpen(true)} />
          <IconButton icon={<ApiIcon className="w-5 h-5" />} label="View API" onClick={onViewApi} disabled={!rag.apiEnabled} />
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
      {isChatModalOpen && (
        <ChatModal rag={rag} onClose={() => setChatModalOpen(false)} />
      )}
    </>
  );
};

export default GPTCard;