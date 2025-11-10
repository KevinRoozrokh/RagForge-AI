import React, { useState, useEffect } from 'react';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';
import { generateRagDetails, generateExampleQuestions } from '../services/geminiService';
import { AVAILABLE_MODELS, RAG_PURPOSES } from '../constants';
import { Model, MemoryMode, RAG } from '../types';
import CacheIcon from './icons/CacheIcon';
import UploadIcon from './icons/UploadIcon';
import KeyIcon from './icons/KeyIcon';
import ApiKeyModal from './ApiKeyModal';

interface CreateGptFormProps {
  onClose: () => void;
  onCreate: (ragData: { 
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
  }) => void;
  ragToClone?: RAG | null;
}

const CreateGptForm: React.FC<CreateGptFormProps> = ({ onClose, onCreate, ragToClone }) => {
  const isCloning = !!ragToClone;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [generationModel, setGenerationModel] = useState('gemini-2.5-flash');
  const [targetAudience, setTargetAudience] = useState('');
  const [useCase, setUseCase] = useState('');
  const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
  
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-2.5-flash']);
  const [cachingEnabled, setCachingEnabled] = useState(true);
  const [memoryMode, setMemoryMode] = useState<MemoryMode>('hybrid');
  const [finetuneDataset, setFinetuneDataset] = useState<File | null>(null);
  const [finetuneDatasetFilename, setFinetuneDatasetFilename] = useState<string | null>(null);
  const [apiEnabled, setApiEnabled] = useState(false);
  const [purpose, setPurpose] = useState('');

  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [newlyGeneratedApiKey, setNewlyGeneratedApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (ragToClone) {
      setName(`${ragToClone.name} (Copy)`);
      setDescription(ragToClone.description);
      setAvatarUrl(ragToClone.avatarUrl);
      setSelectedModels(ragToClone.models.map(m => m.id));
      setCachingEnabled(ragToClone.cachingEnabled);
      setMemoryMode(ragToClone.memoryMode);
      setPurpose(ragToClone.purpose);
      setApiEnabled(ragToClone.apiEnabled);
      setFinetuneDatasetFilename(ragToClone.finetuneDataset || null);
    }
  }, [ragToClone]);

  const handleGenerateDetails = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingDetails(true);
    setDetailsError(null);
    setExampleQuestions([]); 
    setQuestionsError(null);
    try {
      const details = await generateRagDetails(aiPrompt, generationModel, targetAudience, useCase);
      setName(details.name);
      setDescription(details.description);
      setAvatarUrl(details.avatarUrl);
      if (useCase && RAG_PURPOSES.find(p => p.toLowerCase().includes(useCase.toLowerCase()))) {
        setPurpose(RAG_PURPOSES.find(p => p.toLowerCase().includes(useCase.toLowerCase()))!);
      }
    } catch (error) {
      setDetailsError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const handleGenerateQuestions = async () => {
      if (!name || !description) return;
      setIsGeneratingQuestions(true);
      setQuestionsError(null);
      try {
          const questions = await generateExampleQuestions(name, description);
          setExampleQuestions(questions);
      } catch (error) {
          setQuestionsError(error instanceof Error ? error.message : 'An unknown error occurred.');
      } finally {
          setIsGeneratingQuestions(false);
      }
  }

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.jsonl')) {
        setFinetuneDataset(file);
        setFinetuneDatasetFilename(null); // Clear the cloned filename
      } else {
        alert('Invalid file type. Please upload a .jsonl file.');
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modelsForRag = AVAILABLE_MODELS.filter(m => selectedModels.includes(m.id));
    if (modelsForRag.length === 0) {
        alert("Please select at least one model for the RAG.");
        return;
    }
    if (!purpose.trim()) {
        alert("Please define a purpose for the RAG.");
        return;
    }
    
    let apiKey;
    if (apiEnabled) {
      // In a real app, this would be returned from the backend server
      apiKey = `rag_live_sk_${[...Array(30)].map(() => Math.random().toString(36)[2]).join('')}`;
    }

    onCreate({ 
      name, 
      description, 
      avatarUrl, 
      models: modelsForRag, 
      cachingEnabled, 
      memoryMode, 
      finetuneDataset: finetuneDataset?.name,
      apiEnabled,
      apiKey,
      purpose
    });

    if (apiKey) {
      setNewlyGeneratedApiKey(apiKey);
    } else {
      onClose();
    }
  };

  const isBusy = isGeneratingDetails || isGeneratingQuestions;
  
  const getCostBadge = (cost: string) => {
    if (cost.toLowerCase().includes('free')) {
        return <span className="text-xs font-medium text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full">{cost}</span>;
    }
    return <span className="text-xs font-mono text-on-surface-variant">{cost}</span>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" aria-modal="true">
      <div className="relative w-full max-w-2xl bg-surface rounded-3xl shadow-xl border border-outline-variant m-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-xl font-medium text-on-surface">{isCloning ? 'Clone RAG Assistant' : 'Create New RAG'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-white/10 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="max-h-[80vh] overflow-y-auto">
            {/* AI Helper Section */}
            {!isCloning && <div className="p-6 space-y-4 bg-primary/5">
               <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-medium text-on-surface">Need ideas? Let AI help.</h3>
               </div>
               <p className="text-sm text-on-surface-variant">Describe the RAG you want to build, and we'll generate the details for you. Add context for better results.</p>
                
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="generation-model" className="block text-sm font-medium text-on-surface-variant mb-1">Detail Generation Model</label>
                        <select
                            id="generation-model"
                            value={generationModel}
                            onChange={(e) => setGenerationModel(e.target.value)}
                            disabled={isBusy}
                            className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                            style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                        >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                        </select>
                    </div>
                     <input
                        id="targetAudience"
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="Target Audience (e.g., developers)"
                        className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all self-end"
                        disabled={isBusy}
                    />
                </div>

                <div>
                    <input
                        id="useCase"
                        type="text"
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        placeholder="Primary Use Case (e.g., financial analysis)"
                        className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        disabled={isBusy}
                    />
                </div>
               <div className="flex space-x-2">
                <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A helpful bot for a recipe website"
                    className="flex-grow bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    disabled={isBusy}
                />
                <button
                    onClick={handleGenerateDetails}
                    disabled={isBusy || !aiPrompt.trim()}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all"
                >
                    {isGeneratingDetails ? 'Generating...' : 'Generate Details'}
                </button>
               </div>
               {detailsError && <p className="text-sm text-red-400">{detailsError}</p>}
            </div>}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                    <label className="block text-md font-medium text-on-surface">Model Routing Configuration</label>
                    <div className="p-4 border border-outline rounded-lg max-h-48 overflow-y-auto space-y-3">
                        {AVAILABLE_MODELS.map((model) => (
                            <div key={model.id} className="flex items-center justify-between">
                                <label htmlFor={`model-${model.id}`} className="flex items-center cursor-pointer">
                                    <input
                                        id={`model-${model.id}`}
                                        type="checkbox"
                                        checked={selectedModels.includes(model.id)}
                                        onChange={() => handleModelToggle(model.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="ml-3 text-sm font-medium text-on-surface">{model.name}</span>
                                    <span className="ml-2 text-xs text-on-surface-variant">({model.provider})</span>
                                </label>
                                {getCostBadge(model.cost)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label htmlFor="memory-mode" className="block text-md font-medium text-on-surface">Memory</label>
                       <select
                          id="memory-mode"
                          value={memoryMode}
                          onChange={(e) => setMemoryMode(e.target.value as MemoryMode)}
                          className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                          style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                        >
                          <option value="session_only">Session Only</option>
                          <option value="long_term">Long-Term</option>
                          <option value="hybrid">Hybrid</option>
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="block text-md font-medium text-on-surface">Caching</label>
                      <label htmlFor="caching-enabled" className="flex items-center p-2.5 border border-outline rounded-lg hover:bg-white/5 cursor-pointer transition-colors h-full">
                          <input
                              id="caching-enabled"
                              type="checkbox"
                              checked={cachingEnabled}
                              onChange={(e) => setCachingEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="ml-3">
                              <span className="text-sm font-medium text-on-surface">Enable Prompt Caching</span>
                          </div>
                      </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-md font-medium text-on-surface">Fine-Tuning Dataset</label>
                   <label htmlFor="finetune-file" className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-outline border-dashed rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 mb-2 text-on-surface-variant"/>
                        <p className="text-sm text-on-surface-variant"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-on-surface-variant">JSONL file only</p>
                      </div>
                      <input id="finetune-file" type="file" className="hidden" onChange={handleFileChange} accept=".jsonl" />
                  </label>
                  {finetuneDataset && <p className="text-sm text-primary">Selected file: {finetuneDataset.name}</p>}
                  {!finetuneDataset && finetuneDatasetFilename && (
                    <div className="text-sm text-yellow-400 p-2 bg-yellow-500/10 rounded-md mt-2">
                        Cloned dataset: <strong>{finetuneDatasetFilename}</strong>. Please re-upload the file if you wish to include it.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                    <label className="block text-md font-medium text-on-surface">API Access</label>
                    <label htmlFor="api-enabled" className="flex items-center p-4 border border-outline rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <input
                            id="api-enabled"
                            type="checkbox"
                            checked={apiEnabled}
                            onChange={(e) => setApiEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="ml-3">
                            <span className="text-sm font-medium text-on-surface">Enable API Access</span>
                            <p className="text-xs text-on-surface-variant">Generates an API key for this RAG upon creation.</p>
                        </div>
                    </label>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t border-outline-variant">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Generated Avatar" className="w-16 h-16 rounded-lg object-cover border-2 border-outline" />
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-tertiary flex items-center justify-center text-on-surface-variant text-xs text-center">Avatar</div>
                    )}
                    <div className="flex-grow">
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-on-surface-variant mb-1">Avatar URL</label>
                        <input
                            id="avatarUrl"
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="AI will generate this, or paste your own"
                            className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        />
                    </div>
                </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant mb-1">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="e.g., RecipeBot"
                />
              </div>

               <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-on-surface-variant mb-1">Purpose</label>
                <input
                  id="purpose"
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  list="purposes"
                  className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="e.g., Customer Support"
                />
                <datalist id="purposes">
                    {RAG_PURPOSES.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="A short description of what this RAG assistant does."
                />
              </div>

                {name && description && !isCloning && (
                    <div className="space-y-3 pt-4 border-t border-outline-variant">
                        <h4 className="text-md font-medium text-on-surface">Example Questions</h4>
                        {exampleQuestions.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-sm text-on-surface-variant">
                                {exampleQuestions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        ) : (
                            <p className="text-sm text-on-surface-variant">Generate example questions to see how users might interact with your RAG.</p>
                        )}
                        <button
                            type="button"
                            onClick={handleGenerateQuestions}
                            disabled={isBusy}
                            className="px-4 py-2 text-sm font-medium text-primary bg-primary/20 rounded-full hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isGeneratingQuestions ? 'Generating...' : 'Generate Examples'}
                        </button>
                        {questionsError && <p className="text-sm text-red-400">{questionsError}</p>}
                    </div>
                )}


              <div className="flex justify-end pt-4 space-x-3 border-t border-outline-variant">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-primary bg-primary/20 rounded-full hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-dark transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isBusy} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all">
                  {isCloning ? 'Clone RAG' : 'Create RAG'}
                </button>
              </div>
            </form>
        </div>
        {newlyGeneratedApiKey && (
          <ApiKeyModal
            apiKey={newlyGeneratedApiKey}
            onClose={() => {
              setNewlyGeneratedApiKey(null);
              onClose(); // Close the main creation form
            }}
            title="RAG API Key Generated"
            description="Your new API key has been created. Please store it securely, as you won't be able to see it again."
          />
        )}
      </div>
    </div>
  );
};

export default CreateGptForm;