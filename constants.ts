import { Tier, Model } from './types';

export const AVAILABLE_MODELS: Model[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', cost: 'Free' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', cost: '$0.50/M tokens' },
  { id: 'gemini-pro', name: 'Gemini Pro (Legacy)', provider: 'Google', cost: '$0.25/M tokens' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', cost: '$3.00/M tokens' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', cost: '$5.00/M tokens' },
];

export const EXPERIMENT_MODELS: Model[] = AVAILABLE_MODELS.filter(m => m.id !== 'gemini-pro');

export const RAG_PURPOSES: string[] = [
    'Customer Support',
    'Technical Q&A',
    'Internal Knowledge Base',
    'Document Summarization',
    'Financial Analysis',
    'Creative Writing',
    'Code Generation'
];

export const TIERS: Tier[] = [
  {
    name: 'Free',
    isCurrent: true,
    description: 'For individuals and small projects getting started.',
    price: '$0',
    pricePeriod: '/ month',
    features: [
      '1 RAG assistant',
      '1,000 API calls/month',
      '10MB knowledge base',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    description: 'For professionals and teams who need more power.',
    price: '$20',
    pricePeriod: '/ month',
    features: [
      '10 RAG assistants',
      '50,000 API calls/month',
      '1GB knowledge base',
      'A/B Testing Experiments',
      'Email support',
    ],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with advanced needs.',
    price: 'Contact Us',
    pricePeriod: '',
    features: [
      'Unlimited RAGs',
      'Custom API rate limits',
      'Unlimited knowledge base',
      'SSO & advanced security',
      'Dedicated support',
    ],
  },
];

export const AVAILABLE_VOICES = [
  { id: 'zephyr', name: 'Zephyr (Friendly, Male)' },
  { id: 'kore', name: 'Kore (Professional, Female)' },
  { id: 'puck', name: 'Puck (Playful, Male)' },
  { id: 'charon', name: 'Charon (Deep, Male)' },
  { id: 'fenrir', name: 'Fenrir (Authoritative, Male)' },
];

export const AVAILABLE_LANGUAGES = [
  { id: 'en-US', name: 'English (US)' },
  { id: 'en-GB', name: 'English (UK)' },
  { id: 'es-ES', name: 'Spanish' },
  { id: 'fr-FR', name: 'French' },
  { id: 'de-DE', name: 'German' },
  { id: 'ja-JP', name: 'Japanese' },
];
