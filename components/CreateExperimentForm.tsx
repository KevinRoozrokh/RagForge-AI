import React, { useState } from 'react';
import { RAG, Experiment, EvaluationMetrics, Model } from '../types';
import XIcon from './icons/XIcon';
import CloneIcon from './icons/CloneIcon';
import { EXPERIMENT_MODELS, RAG_PURPOSES, AVAILABLE_MODELS } from '../constants';

interface CreateExperimentFormProps {
  onClose: () => void;
  onCreate: (newExperiment: Experiment, challengerRag: RAG) => void;
  existingRags: RAG[];
}

const CreateExperimentForm: React.FC<CreateExperimentFormProps> = ({ onClose, onCreate, existingRags }) => {
    const [name, setName] = useState('');
    const [baselineRagId, setBaselineRagId] = useState<string>('');
    const [challengerModelId, setChallengerModelId] = useState<string>(EXPERIMENT_MODELS[0].id);
    const [purpose, setPurpose] = useState('');
    const [primaryMetric, setPrimaryMetric] = useState<keyof Omit<EvaluationMetrics, 'lastEvaluated'>>('answerRelevancy');

    const availableRags = existingRags.filter(rag => !rag.experimentId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const baselineRag = existingRags.find(r => r.id === baselineRagId);
        if (!name.trim() || !baselineRag || !purpose.trim()) {
            alert("Please fill all fields, select a baseline RAG, and define a purpose.");
            return;
        }

        const experimentId = `exp-${Date.now()}`;
        const challengerModel = AVAILABLE_MODELS.find(m => m.id === challengerModelId);
        if (!challengerModel) {
            alert("Selected challenger model not found.");
            return;
        }

        const challengerRag: RAG = {
            ...baselineRag,
            id: `rag-clone-${Date.now()}`,
            name: `${baselineRag.name} (Challenger)`,
            models: [challengerModel],
            purpose: purpose,
            apiCalls: 0,
            experimentId: experimentId,
            apiKey: `rag_live_sk_${[...Array(30)].map(() => Math.random().toString(36)[2]).join('')}`
        };

        const newExperiment: Experiment = {
            id: experimentId,
            name,
            status: 'Running',
            variantA_ragId: baselineRag.id,
            variantB_ragId: challengerRag.id,
            primaryMetric,
            startDate: Date.now(),
        };

        onCreate(newExperiment, challengerRag);
    };

    const metricOptions: { id: keyof Omit<EvaluationMetrics, 'lastEvaluated'>, name: string }[] = [
        { id: 'answerRelevancy', name: 'Answer Relevancy' },
        { id: 'faithfulness', name: 'Faithfulness' },
        { id: 'contextPrecision', name: 'Context Precision' },
        { id: 'contextRecall', name: 'Context Recall' },
    ];
    
    const selectStyles = {
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" aria-modal="true">
            <div className="relative w-full max-w-xl bg-surface rounded-3xl shadow-xl border border-outline-variant m-4 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                    <h2 className="text-xl font-medium text-on-surface">Create New Experiment</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-white/10 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="exp-name" className="block text-sm font-medium text-on-surface-variant mb-1">Experiment Name</label>
                        <input id="exp-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Caching Performance Test" className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
                    </div>
                    <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-on-surface-variant mb-1">Experiment Purpose</label>
                        <input
                        id="purpose"
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                        list="purposes"
                        className="w-full bg-surface border border-outline text-on-surface rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        placeholder="e.g., Technical Q&A"
                        />
                        <datalist id="purposes">
                            {RAG_PURPOSES.map(p => <option key={p} value={p} />)}
                        </datalist>
                    </div>

                    <div>
                        <label htmlFor="baseline-rag" className="block text-sm font-medium text-on-surface-variant mb-1">Baseline RAG (Variant A)</label>
                        <select id="baseline-rag" value={baselineRagId} onChange={(e) => setBaselineRagId(e.target.value)} required className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none" style={selectStyles}>
                            <option value="" disabled>Select a RAG to test</option>
                            {availableRags.map(rag => <option key={rag.id} value={rag.id}>{rag.name}</option>)}
                        </select>
                        {availableRags.length === 0 && <p className="text-xs text-yellow-400 mt-2">All available RAGs are already in an experiment. Create a new RAG to start an experiment.</p>}
                    </div>

                    <div className="p-4 bg-background rounded-lg border border-outline-variant">
                        <div className="flex items-start space-x-3">
                            <CloneIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-medium text-on-surface">Challenger RAG (Variant B)</h4>
                                <p className="text-sm text-on-surface-variant mb-2">A challenger will be automatically created by cloning the baseline. Select a different underlying model to test against.</p>
                                <select id="challenger-model" value={challengerModelId} onChange={(e) => setChallengerModelId(e.target.value)} required className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none" style={selectStyles}>
                                    {EXPERIMENT_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="primary-metric" className="block text-sm font-medium text-on-surface-variant mb-1">Primary Metric</label>
                        <select id="primary-metric" value={primaryMetric} onChange={(e) => setPrimaryMetric(e.target.value as any)} required className="w-full bg-surface border border-outline text-on-surface rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none" style={selectStyles}>
                           {metricOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3 border-t border-outline-variant">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-primary bg-primary/20 rounded-full hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-dark transition-all">Cancel</button>
                        <button type="submit" disabled={!baselineRagId} className="px-4 py-2 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all">Start Experiment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateExperimentForm;
