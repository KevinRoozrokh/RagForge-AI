import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';
import { generateRagDetails } from '../services/geminiService';
import { AVAILABLE_VOICES, AVAILABLE_LANGUAGES } from '../constants';
import { VoiceRAG } from '../types';

interface CreateVoiceRagFormProps {
  onClose: () => void;
  onCreate: (ragData: Omit<VoiceRAG, 'id'>) => void;
}

const CreateVoiceRagForm: React.FC<CreateVoiceRagFormProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState(AVAILABLE_LANGUAGES[0].id);
  const [systemInstruction, setSystemInstruction] = useState('You are a friendly and helpful assistant.');

  const handleGenerateDetails = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const details = await generateRagDetails(aiPrompt, 'gemini-2.5-flash', '', '');
      setName(details.name);
      setDescription(details.description);
      setAvatarUrl(details.avatarUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      alert("Please fill out the name and description.");
      return;
    }
    onCreate({ 
      name, 
      description, 
      avatarUrl, 
      voice: selectedVoice,
      language: selectedLanguage,
      systemInstruction,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" aria-modal="true">
      <div className="relative w-full max-w-xl bg-surface rounded-3xl shadow-xl border border-outline-variant m-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-xl font-medium text-on-surface">Create New Voice AI</h2>
          <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-white/10 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="max-h-[80vh] overflow-y-auto">
            <div className="p-6 space-y-4 bg-primary/5">
               <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-medium text-on-surface">Start with AI</h3>
               </div>
               <p className="text-sm text-on-surface-variant">Describe the voice assistant you want to build.</p>
               <div className="flex space-x-2">
                <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A cheerful weather bot"
                    className="flex-grow bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    disabled={isGenerating}
                />
                <button
                    onClick={handleGenerateDetails}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all"
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
               </div>
               {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Generated Avatar" className="w-16 h-16 rounded-lg object-cover border-2 border-outline" />
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-tertiary flex items-center justify-center text-on-surface-variant text-xs text-center">Avatar</div>
                    )}
                    <div className="flex-grow">
                        <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant mb-1">Name</label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                          placeholder="AI-Generated Name"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={2}
                      className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                      placeholder="A short description of what this voice assistant does."
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-on-surface-variant mb-1">Voice</label>
                        <select
                            id="voice"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                            style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                        >
                           {AVAILABLE_VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-on-surface-variant mb-1">Language</label>
                        <select
                            id="language"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                            style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                        >
                            {AVAILABLE_LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="systemInstruction" className="block text-sm font-medium text-on-surface-variant mb-1">System Instruction</label>
                    <textarea
                      id="systemInstruction"
                      value={systemInstruction}
                      onChange={(e) => setSystemInstruction(e.target.value)}
                      rows={3}
                      className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                      placeholder="Define the assistant's personality and instructions."
                    />
                </div>

              <div className="flex justify-end pt-4 space-x-3 border-t border-outline-variant">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-primary bg-primary/20 rounded-full hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-dark transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isGenerating} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all">
                  Create Voice AI
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVoiceRagForm;
