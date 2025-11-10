import React from 'react';
import { TIERS } from '../constants';
import PricingTier from './PricingTier';

const PricingPage: React.FC = () => {
  return (
    <div className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-sans font-medium text-on-surface sm:text-5xl">
            Choose the right plan for you
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            Flexible pricing for projects of all sizes.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <PricingTier key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;