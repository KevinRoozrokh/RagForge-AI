import React, { useState } from 'react';
import { RAG, EvaluationMetrics } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import KeyIcon from './icons/KeyIcon';
import CopyIcon from './icons/CopyIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import PythonIcon from './icons/PythonIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import TargetIcon from './icons/TargetIcon';
import FilterIcon from './icons/FilterIcon';
import MagnifyingGlassIcon from './icons/SearchIcon';
import SparklesIcon from './icons/SparklesIcon';

type Tab = 'api' | 'evaluation' | 'usage';

interface ApiDetailsPageProps {
  rag: RAG;
  onBack: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode, lang?: string }> = ({ children, lang = 'bash' }) => (
    <pre className="bg-background p-4 rounded-lg border border-outline-variant text-sm text-on-surface-variant overflow-x-auto">
      <code className={`language-${lang}`}>{children}</code>
    </pre>
);

const RadialProgress: React.FC<{ progress: number; size?: number; strokeWidth?: number; }> = ({ progress, size = 60, strokeWidth = 6 }) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;

    const getColor = () => {
        if (progress >= 0.9) return 'text-green-400';
        if (progress >= 0.75) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-outline"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={center}
                    cy={center}
                />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-500 ${getColor()}`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={center}
                    cy={center}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getColor()}`}>
                {Math.round(progress * 100)}
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ icon: React.ReactNode; title: string; score: number; description: string; }> = ({ icon, title, score, description }) => (
    <div className="bg-surface/50 p-4 rounded-lg flex items-center space-x-4 border border-outline-variant hover:border-outline transition-colors">
        <RadialProgress progress={score} />
        <div>
            <div className="flex items-center space-x-2">
                {icon}
                <h4 className="font-medium text-on-surface">{title}</h4>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{description}</p>
        </div>
        <div className="ml-auto text-2xl font-mono text-on-surface pl-2">{score.toFixed(3)}</div>
    </div>
);


const ApiDetailsPage: React.FC<ApiDetailsPageProps> = ({ rag, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('api');
  const [isCopied, setIsCopied] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<EvaluationMetrics | undefined>(rag.evaluationMetrics);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const usageCost = (rag.apiCalls * 0.00005).toFixed(2);
  
  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
        // Simulate new, slightly different metrics
        setCurrentMetrics({
            faithfulness: Math.min(0.99, Math.random() * 0.1 + 0.89),
            answerRelevancy: Math.min(0.99, Math.random() * 0.1 + 0.88),
            contextPrecision: Math.min(0.99, Math.random() * 0.15 + 0.84),
            contextRecall: Math.min(0.99, Math.random() * 0.12 + 0.86),
            lastEvaluated: Date.now(),
        });
        setIsEvaluating(false);
    }, 3000); // Simulate a 3-second evaluation job
  };

  const pythonQueryExample = `
# Make sure to install the RAGForge SDK:
# pip install ragforge-sdk

from ragforge import RAGForgeClient

# Use your API key
client = RAGForgeClient(api_key="${rag.apiKey || 'YOUR_API_KEY'}")

response = client.query(
  agent_id="${rag.id}",
  prompt="What are the key benefits of using this product?"
)

print(response.answer)`;

const pythonEvalExample = `
from ragforge import RAGForgeClient

client = RAGForgeClient(api_key="${rag.apiKey || 'YOUR_API_KEY'}")

# This triggers an asynchronous evaluation job.
# You can check the status via the dashboard or API.
evaluation_job = client.evaluations.run(
  agent_id="${rag.id}",
  dataset="default_benchmark_v1" # or your custom dataset
)

print(f"Started evaluation job: {evaluation_job.id}")`;

const pythonLogFeedbackExample = `
from ragforge import RAGForgeClient, Feedback

client = RAGForgeClient(api_key="${rag.apiKey || 'YOUR_API_KEY'}")

# Example: Query a RAG that is part of an experiment
response = client.query(
  agent_id="${rag.id}",
  prompt="What are the side effects of ibuprofen?"
)

print(response.answer)

# Log user feedback to help determine the winning variant
# In a real app, this would be triggered by a user action (e.g., thumbs up/down button)
client.experiments.log_interaction(
  interaction_id=response.interaction_id,
  feedback=Feedback.THUMBS_UP
)

print("Feedback logged for A/B test.")`;

  const renderContent = () => {
    switch (activeTab) {
        case 'api': return (
            <div className="space-y-8 animate-fade-in">
                 <div className="bg-surface rounded-lg border border-outline-variant p-6">
                    <div className="flex items-center mb-4">
                        <KeyIcon className="w-6 h-6 mr-3 text-primary" />
                        <h2 className="text-xl font-medium text-on-surface">API Key</h2>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-4">Use this key in your application to authenticate requests.</p>
                    <div className="flex items-center space-x-2 bg-background p-3 rounded-lg border border-outline">
                        <span className="flex-grow font-mono text-sm text-on-surface-variant truncate">{rag.apiKey || 'API not enabled for this RAG'}</span>
                        {rag.apiKey && <button
                            onClick={() => handleCopy(rag.apiKey!)}
                            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-on-surface-variant bg-tertiary hover:bg-outline rounded-md transition-colors"
                        >
                            <CopyIcon className="w-4 h-4" />
                            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                        </button>}
                    </div>
                </div>
                <div className="bg-surface rounded-lg border border-outline-variant p-6">
                    <div className="flex items-center mb-4">
                        <PythonIcon className="w-6 h-6 mr-3" />
                        <h2 className="text-xl font-medium text-on-surface">Python SDK</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium text-on-surface">Querying the RAG</h3>
                            <p className="text-sm text-on-surface-variant mt-1 mb-3">Send a prompt and get a generated response.</p>
                            <CodeBlock lang="python">{pythonQueryExample}</CodeBlock>
                        </div>
                         <div>
                            <h3 className="font-medium text-on-surface">Running Evaluations</h3>
                            <p className="text-sm text-on-surface-variant mt-1 mb-3">Programmatically trigger a new performance evaluation.</p>
                            <CodeBlock lang="python">{pythonEvalExample}</CodeBlock>
                        </div>
                        {rag.experimentId && (
                           <div>
                                <h3 className="font-medium text-on-surface">Logging Experiment Feedback</h3>
                                <p className="text-sm text-on-surface-variant mt-1 mb-3">Programmatically log user feedback for A/B testing.</p>
                                <CodeBlock lang="python">{pythonLogFeedbackExample}</CodeBlock>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
        case 'evaluation': return (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-surface rounded-lg border border-outline-variant p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-medium text-on-surface">Performance Evaluation</h2>
                            <p className="mt-1 text-sm text-on-surface-variant">Monitor the performance of your RAG assistant with automated metrics.</p>
                        </div>
                        <button
                            onClick={handleRunEvaluation}
                            disabled={isEvaluating}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isEvaluating ? 'Evaluating...' : 'Run New Evaluation'}
                        </button>
                    </div>

                    {currentMetrics ? (
                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MetricCard icon={<ShieldCheckIcon className="w-5 h-5 text-secondary" />} title="Faithfulness" score={currentMetrics.faithfulness} description="Factually consistent with the retrieved context." />
                                <MetricCard icon={<TargetIcon className="w-5 h-5 text-secondary" />} title="Answer Relevancy" score={currentMetrics.answerRelevancy} description="Measures how relevant the answer is to the prompt." />
                                <MetricCard icon={<FilterIcon className="w-5 h-5 text-secondary" />} title="Context Precision" score={currentMetrics.contextPrecision} description="Signal-to-noise ratio of the retrieved context." />
                                <MetricCard icon={<MagnifyingGlassIcon className="w-5 h-5 text-secondary" />} title="Context Recall" score={currentMetrics.contextRecall} description="Ability to retrieve all relevant information." />
                            </div>
                            <p className="text-xs text-on-surface-variant text-center pt-2">Last evaluated: {new Date(currentMetrics.lastEvaluated).toLocaleString()}</p>
                        </div>
                    ) : (
                        <div className="mt-6 text-center py-10 border-2 border-dashed border-outline-variant rounded-lg">
                            <p className="text-on-surface-variant">No evaluation data available.</p>
                            <p className="text-xs text-tertiary mt-1">Run an evaluation to see performance metrics.</p>
                        </div>
                    )}
                </div>
            </div>
        );
        case 'usage': return (
            <div className="space-y-8 animate-fade-in">
                 <div className="bg-surface rounded-lg border border-outline-variant p-6">
                    <div className="flex items-center mb-4">
                        <ChartBarIcon className="w-6 h-6 mr-3 text-primary" />
                        <h2 className="text-xl font-medium text-on-surface">Usage & Configuration</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm text-on-surface-variant">
                                <span>API Calls</span>
                                <span>{rag.apiCalls.toLocaleString()} / {rag.apiLimit.toLocaleString()}</span>
                            </div>
                             <div className="w-full bg-outline rounded-full h-2 mt-1">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${(rag.apiCalls / rag.apiLimit) * 100}%` }}></div>
                            </div>
                        </div>
                         <div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-on-surface-variant">Estimated Cost</span>
                                <span className="text-lg font-medium text-on-surface">${usageCost}</span>
                            </div>
                            <p className="text-xs text-tertiary mt-1">Based on current usage this month.</p>
                         </div>
                         <div className="border-t border-outline-variant !mt-8 pt-6">
                             <ul className="text-sm space-y-3">
                                <li className="flex justify-between"><span className="text-on-surface-variant">Memory Mode:</span><span className="font-medium text-on-surface">{rag.memoryMode.replace('_', ' ')}</span></li>
                                <li className="flex justify-between"><span className="text-on-surface-variant">Caching:</span><span className={`font-medium ${rag.cachingEnabled ? 'text-green-400' : 'text-red-400'}`}>{rag.cachingEnabled ? 'Enabled' : 'Disabled'}</span></li>
                                <li className="flex justify-between"><span className="text-on-surface-variant">Fine-Tuning:</span><span className="font-medium text-on-surface truncate" title={rag.finetuneDataset}>{rag.finetuneDataset || 'None'}</span></li>
                            </ul>
                         </div>
                    </div>
                </div>
            </div>
        );
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-primary hover:text-primary-light mb-4">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to My RAGs
        </button>
        <div className="flex items-center space-x-4">
            <img src={rag.avatarUrl} alt={rag.name} className="w-16 h-16 rounded-lg object-cover border-2 border-outline" />
            <div>
                <h1 className="text-3xl sm:text-4xl font-sans font-medium text-on-surface">{rag.name}</h1>
                <p className="mt-1 text-on-surface-variant">Manage API access, monitor usage, and evaluate performance.</p>
            </div>
        </div>
      </div>
      
      <div className="border-b border-outline-variant mb-6">
        <nav className="flex space-x-4 sm:space-x-6" aria-label="Tabs">
            {(['api', 'evaluation', 'usage'] as Tab[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                        activeTab === tab 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline'
                    }`}
                >
                    {tab === 'api' ? 'API Access' : tab}
                </button>
            ))}
        </nav>
      </div>
      
      {renderContent()}

    </div>
  );
};

export default ApiDetailsPage;