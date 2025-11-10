import React, { useState } from 'react';
import { Experiment, RAG, AnalysisCriterion } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import SparklesIcon from './icons/SparklesIcon';

interface ExperimentCardProps {
    experiment: Experiment;
    variantARag?: RAG;
    variantBRag?: RAG;
    onAnalyze: (experimentId: string) => Promise<void>;
}

const VariantDisplay: React.FC<{ rag?: RAG; label: string }> = ({ rag, label }) => {
    if (!rag) {
        return <div className="flex-1 p-4 bg-background rounded-lg text-center text-on-surface-variant border border-outline">RAG not found</div>;
    }
    return (
        <div className="flex-1 p-4 bg-background rounded-lg border border-outline">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{label}</p>
            <div className="flex items-center space-x-3">
                <img src={rag.avatarUrl} alt={rag.name} className="w-10 h-10 rounded-md object-cover" />
                <div>
                    <h4 className="font-medium text-on-surface">{rag.name}</h4>
                    <p className="text-xs text-secondary truncate" title={rag.models.map(m => m.name).join(', ')}>{rag.models.map(m => m.name).join(', ')}</p>
                </div>
            </div>
        </div>
    );
};

const AnalysisCriterionRow: React.FC<{ criterion: AnalysisCriterion }> = ({ criterion }) => {
    const scoreAColor = criterion.scoreA > criterion.scoreB ? 'text-green-400' : 'text-on-surface';
    const scoreBColor = criterion.scoreB > criterion.scoreA ? 'text-green-400' : 'text-on-surface';
    return (
        <div className="py-3 border-b border-outline-variant last:border-b-0">
            <div className="flex justify-between items-center">
                <div className="w-1/4 font-medium text-on-surface">{criterion.name}</div>
                <div className={`w-1/4 text-center font-mono ${scoreAColor}`}>{criterion.scoreA}</div>
                <div className={`w-1/4 text-center font-mono ${scoreBColor}`}>{criterion.scoreB}</div>
                <div className="w-1/4 text-right text-xs text-on-surface-variant italic">
                   "{criterion.reasoning}"
                </div>
            </div>
        </div>
    );
};


const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment, variantARag, variantBRag, onAnalyze }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { id, name, status, primaryMetric, analysis } = experiment;

    const getMetricDisplayName = (metric: string) => {
        return metric.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    const handleAnalyzeClick = async () => {
        setIsAnalyzing(true);
        await onAnalyze(id);
        setIsAnalyzing(false);
    };

    const winnerColor = analysis?.winner === 'A' ? 'text-blue-400' : 'text-green-400';
    const scorePercentage = analysis ? (analysis.overallScore / 100) * 100 : 50;


    return (
        <div className="bg-surface rounded-2xl shadow-lg border border-outline-variant p-6 transition-all hover:border-outline">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                <div>
                    <h3 className="text-xl font-medium text-on-surface">{name}</h3>
                    <p className="text-sm text-on-surface-variant">
                        Primary Metric: <span className="font-semibold text-primary">{getMetricDisplayName(primaryMetric)}</span>
                    </p>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        status === 'Running' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                        {status}
                    </span>
                    {status === 'Running' && !analysis && (
                         <button 
                            onClick={handleAnalyzeClick}
                            disabled={isAnalyzing}
                            className="flex items-center justify-center px-3 py-1 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-tertiary disabled:cursor-not-allowed transition-all"
                         >
                            <SparklesIcon className="w-4 h-4 mr-1.5" />
                            {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <VariantDisplay rag={variantARag} label="Variant A (Baseline)" />
                <div className="text-on-surface-variant font-bold text-lg p-2">VS</div>
                <VariantDisplay rag={variantBRag} label="Variant B (Challenger)" />
            </div>

            {isAnalyzing && (
                 <div className="mt-6 text-center py-8">
                    <p className="text-primary animate-pulse">Gemini is analyzing the variants...</p>
                 </div>
            )}

            {analysis && (
                <div className="mt-6 pt-6 border-t border-outline-variant animate-fade-in">
                    <h4 className="text-lg font-medium text-on-surface text-center">Analysis Results</h4>
                    <p className="text-xs text-on-surface-variant text-center mb-4">Analyzed on {new Date(analysis.lastAnalyzed).toLocaleString()}</p>
                    
                    <div className="bg-background p-4 rounded-lg border border-outline">
                        <div className="text-center mb-3">
                            <span className="font-bold text-3xl" style={{color: `hsl(${(scorePercentage * 1.2)}, 70%, 60%)`}}>{analysis.overallScore}</span>
                            <span className="text-on-surface-variant">/100</span>
                            <p className="text-sm font-medium">Overall Score</p>
                        </div>
                        <div className="w-full bg-blue-500/30 rounded-full h-4 relative">
                            <div className="bg-green-500/40 h-4 rounded-full" style={{ width: `${scorePercentage}%` }}></div>
                            <div className="absolute top-0 left-0 h-4 text-xs font-bold text-white pl-2 flex items-center">A</div>
                             <div className="absolute top-0 right-0 h-4 text-xs font-bold text-white pr-2 flex items-center">B</div>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-on-surface-variant">
                                Recommended Winner: 
                                <span className={`font-bold ml-1 ${winnerColor}`}>
                                    Variant {analysis.winner}
                                </span>
                            </p>
                             <p className="mt-2 text-sm text-on-surface-variant max-w-2xl mx-auto">{analysis.summary}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-on-surface-variant px-4 py-2">
                           <div className="w-1/4">Criterion</div>
                           <div className="w-1/4 text-center">Variant A</div>
                           <div className="w-1/4 text-center">Variant B</div>
                           <div className="w-1/4 text-right">Reasoning</div>
                        </div>
                        <div className="bg-background rounded-lg border border-outline divide-y divide-outline-variant px-4">
                            {analysis.criteria.map(c => <AnalysisCriterionRow key={c.name} criterion={c}/>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExperimentCard;
