export interface Model {
  id: string;
  name: string;
  provider: string;
  cost: string;
}

export type MemoryMode = 'session_only' | 'long_term' | 'hybrid';

export interface EvaluationMetrics {
  faithfulness: number;
  answerRelevancy: number;
  contextPrecision: number;
  contextRecall: number;
  lastEvaluated: number;
}

export interface RAG {
  id: string;
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
  documentCount: number;
  apiCalls: number;
  apiLimit: number;
  status: 'Published' | 'Unpublished';
  experimentId?: string;
  evaluationMetrics?: EvaluationMetrics;
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string;
}

export interface KnowledgeFile {
  name: string;
  type: string;
  size: number;
  dateAdded: number;
}

export interface Tier {
  name: string;
  isCurrent?: boolean;
  description: string;
  price: string;
  pricePeriod: string;
  features: string[];
  isPopular?: boolean;
}

export interface VoiceRAG {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  voice: string;
  language: string;
  systemInstruction: string;
}

export interface AnalysisCriterion {
  name: string;
  scoreA: number;
  scoreB: number;
  reasoning: string;
}

export interface ExperimentAnalysis {
  overallScore: number;
  winner: 'A' | 'B';
  summary: string;
  criteria: AnalysisCriterion[];
  lastAnalyzed: number;
}

export interface Experiment {
  id: string;
  name: string;
  status: 'Running' | 'Completed';
  variantA_ragId: string;
  variantB_ragId: string;
  primaryMetric: keyof Omit<EvaluationMetrics, 'lastEvaluated'>;
  startDate: number;
  analysis?: ExperimentAnalysis;
}
