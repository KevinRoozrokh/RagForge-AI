import React, { useState } from 'react';
import PlusIcon from './icons/PlusIcon';
import { Experiment, RAG } from '../types';
import CreateExperimentForm from './CreateExperimentForm';
import ExperimentCard from './ExperimentCard';
import { analyzeExperimentVariants } from '../services/geminiService';

interface ExperimentsDashboardProps {
  experiments: Experiment[];
  setExperiments: React.Dispatch<React.SetStateAction<Experiment[]>>;
  rags: RAG[];
  setRags: React.Dispatch<React.SetStateAction<RAG[]>>;
}

const ExperimentsDashboard: React.FC<ExperimentsDashboardProps> = ({ experiments, setExperiments, rags, setRags }) => {
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);

  const findRagById = (id: string) => rags.find(r => r.id === id);

  const handleExperimentCreated = (newExperiment: Experiment, challengerRag: RAG) => {
      setExperiments(prev => [newExperiment, ...prev]);
      setRags(prev => {
          // Add the new challenger RAG
          const withChallenger = [challengerRag, ...prev];
          // Update the baseline RAG to include the experiment ID
          return withChallenger.map(rag =>
              rag.id === newExperiment.variantA_ragId ? { ...rag, experimentId: newExperiment.id } : rag
          );
      });
      setCreateFormVisible(false);
  };

  const handleAnalyzeExperiment = async (experimentId: string) => {
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (!experiment) return;

    const variantA = findRagById(experiment.variantA_ragId);
    const variantB = findRagById(experiment.variantB_ragId);

    if (!variantA || !variantB) {
        alert("Could not find both RAG variants for analysis.");
        return;
    }

    try {
        const analysisResult = await analyzeExperimentVariants(variantA, variantB);
        setExperiments(prev => 
            prev.map(exp => 
                exp.id === experimentId ? { ...exp, analysis: analysisResult } : exp
            )
        );
    } catch (error) {
        console.error("Analysis failed:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred during analysis.");
    }
  };


  return (
    <div className="relative h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-sans font-medium text-on-surface">A/B Testing Experiments</h1>
            <p className="mt-2 text-on-surface-variant">Compare RAG configurations to find the best performance.</p>
        </div>

        {experiments.length > 0 ? (
            <div className="space-y-6">
                {experiments.map((exp) => (
                    <ExperimentCard
                        key={exp.id}
                        experiment={exp}
                        variantARag={findRagById(exp.variantA_ragId)}
                        variantBRag={findRagById(exp.variantB_ragId)}
                        onAnalyze={handleAnalyzeExperiment}
                    />
                ))}
            </div>
        ) : (
             <div className="text-center py-20 bg-surface/50 rounded-2xl border-2 border-dashed border-outline-variant">
                <h3 className="text-xl font-medium text-on-surface">No Experiments Running</h3>
                <p className="mt-2 text-on-surface-variant">Create an experiment to compare RAGs and optimize performance.</p>
            </div>
        )}

      </div>
      <button
        onClick={() => setCreateFormVisible(true)}
        className="fixed bottom-8 right-8 flex items-center justify-center w-16 h-16 bg-primary-light text-primary-dark rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary"
        aria-label="Create New Experiment"
        >
        <PlusIcon className="w-8 h-8" />
      </button>
      {isCreateFormVisible && (
        <CreateExperimentForm
            onClose={() => setCreateFormVisible(false)}
            onCreate={handleExperimentCreated}
            existingRags={rags}
        />
      )}
    </div>
  );
};

export default ExperimentsDashboard;
