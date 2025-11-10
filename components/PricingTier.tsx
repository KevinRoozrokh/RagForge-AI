import React from 'react';
import { Tier } from '../types';

interface PricingTierProps {
  tier: Tier;
}

const CheckIcon: React.FC = () => (
    <svg className="flex-shrink-0 h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);

const PricingTier: React.FC<PricingTierProps> = ({ tier }) => {
  const isPopular = tier.isPopular;
  
  return (
    <div className={`relative flex flex-col bg-surface rounded-2xl shadow-lg border-2 ${isPopular ? 'border-primary-dark' : 'border-outline-variant'}`}>
      {isPopular && (
        <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
          <span className="px-4 py-1 text-sm font-semibold tracking-wide text-primary-dark uppercase bg-primary-light rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="flex-1 p-8">
        <h3 className="text-2xl font-medium text-on-surface">{tier.name}</h3>
        {tier.isCurrent && (
             <p className="mt-2 text-sm text-primary">Current Plan</p>
        )}
        <p className="mt-4 text-on-surface-variant">{tier.description}</p>
        <div className="mt-6 flex items-baseline text-on-surface">
          <span className="text-5xl font-bold tracking-tight">{tier.price}</span>
          <span className="ml-1 text-xl font-semibold text-on-surface-variant">{tier.pricePeriod}</span>
        </div>

        <ul role="list" className="mt-8 space-y-4">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon />
              <span className="ml-3 text-base text-on-surface-variant">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-8 pt-0">
        <button
          disabled={tier.isCurrent}
          className={`w-full px-6 py-3 text-base font-medium rounded-full transition-colors duration-200 ${
            tier.isCurrent
              ? 'bg-surface text-on-surface-variant cursor-not-allowed border border-outline'
              : isPopular
              ? 'bg-primary text-background hover:bg-primary-light'
              : 'bg-primary/20 text-primary hover:bg-primary/30'
          }`}
        >
          {tier.isCurrent ? 'Your Plan' : 'Choose Plan'}
        </button>
      </div>
    </div>
  );
};

export default PricingTier;