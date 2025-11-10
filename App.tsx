import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import ApiSettings from './components/ApiSettings';
import PricingPage from './components/PricingPage';
import ApiDetailsPage from './components/ApiDetailsPage';
import ExperimentsDashboard from './components/ExperimentsDashboard';
import VoiceDashboard from './components/VoiceDashboard';
import { RAG, Experiment, VoiceRAG } from './types';
import { AVAILABLE_MODELS } from './constants';

// Initial mock data
const initialRags: RAG[] = [
    {
      id: 'rag-1',
      name: 'DocuHelper AI',
      description: 'An AI assistant trained on our internal technical documentation to help engineers find information quickly and efficiently. It can answer questions about APIs, architecture, and best practices.',
      avatarUrl: 'https://picsum.photos/seed/tech/100/100',
      models: [AVAILABLE_MODELS[1]],
      cachingEnabled: true,
      memoryMode: 'long_term',
      apiEnabled: true,
      apiKey: 'rag_live_sk_abc123xyz789',
      purpose: 'Technical Q&A',
      documentCount: 125,
      apiCalls: 750,
      apiLimit: 1000,
      status: 'Published',
      evaluationMetrics: {
        faithfulness: 0.92,
        answerRelevancy: 0.88,
        contextPrecision: 0.95,
        contextRecall: 0.85,
        lastEvaluated: Date.now() - 86400000 * 2,
      }
    },
    {
      id: 'rag-2',
      name: 'SupportBot Pro',
      description: 'Handles common customer support queries by referencing our knowledge base of FAQs and help articles. Designed to reduce ticket volume and provide instant answers to users.',
      avatarUrl: 'https://picsum.photos/seed/support/100/100',
      models: [AVAILABLE_MODELS[0]],
      cachingEnabled: true,
      memoryMode: 'hybrid',
      apiEnabled: true,
      apiKey: 'rag_live_sk_def456uvw456',
      purpose: 'Customer Support',
      documentCount: 48,
      apiCalls: 320,
      apiLimit: 1000,
      status: 'Published',
    },
    {
      id: 'rag-3',
      name: 'Creative Writer',
      description: 'A creative partner for brainstorming and writing marketing copy, blog posts, and social media content. Uses a more creative model configuration for generating engaging text.',
      avatarUrl: 'https://picsum.photos/seed/creative/100/100',
      models: [AVAILABLE_MODELS[2]],
      cachingEnabled: false,
      memoryMode: 'session_only',
      apiEnabled: false,
      purpose: 'Creative Writing',
      documentCount: 5,
      apiCalls: 12,
      apiLimit: 1000,
      status: 'Unpublished',
    },
];

const initialVoiceRags: VoiceRAG[] = [
    {
        id: 'vrag-1',
        name: 'Order Status Bot',
        description: 'A voice-activated assistant for checking order statuses and tracking shipments.',
        avatarUrl: 'https://picsum.photos/seed/logistics/100/100',
        voice: 'kore',
        language: 'en-US',
        systemInstruction: 'You are a helpful assistant for a logistics company. You only answer questions about order status and tracking. Be concise and friendly.',
    }
];


const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [viewingRagId, setViewingRagId] = useState<string | null>(null);
  
  // App-level state for RAGs and Experiments
  const [rags, setRags] = useState<RAG[]>(() => {
    try {
        const storedRags = localStorage.getItem('rags');
        return storedRags ? JSON.parse(storedRags) : initialRags;
    } catch {
        return initialRags;
    }
  });

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [voiceRags, setVoiceRags] = useState<VoiceRAG[]>(() => {
    try {
        const storedVoiceRags = localStorage.getItem('voiceRags');
        return storedVoiceRags ? JSON.parse(storedVoiceRags) : initialVoiceRags;
    } catch {
        return initialVoiceRags;
    }
  });


  useEffect(() => {
    localStorage.setItem('rags', JSON.stringify(rags));
  }, [rags]);

  useEffect(() => {
    localStorage.setItem('voiceRags', JSON.stringify(voiceRags));
  }, [voiceRags]);


  const viewingRag = rags.find(rag => rag.id === viewingRagId);

  const renderContent = () => {
    if (viewingRag) {
      return <ApiDetailsPage rag={viewingRag} onBack={() => setViewingRagId(null)} />;
    }
    switch (activeView) {
      case 'dashboard':
        return <Dashboard rags={rags} setRags={setRags} onViewApiDetails={setViewingRagId} />;
      case 'experiments':
        return <ExperimentsDashboard experiments={experiments} setExperiments={setExperiments} rags={rags} setRags={setRags} />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'voice':
        return <VoiceDashboard voiceRags={voiceRags} setVoiceRags={setVoiceRags} />;
      case 'api':
        return <ApiSettings />;
      case 'billing':
        return <PricingPage />;
      default:
        return <Dashboard rags={rags} setRags={setRags} onViewApiDetails={setViewingRagId} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-on-surface font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setViewingRagId(null);
          setActiveView(view);
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
