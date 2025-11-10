import React from 'react';

const MicroscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6.82-6.82a4.5 4.5 0 0 0-6.364-6.364L3 21m12-12a4.5 4.5 0 0 0-6.364-6.364m6.364 6.364-3.182-3.182" />
  </svg>
);

export default MicroscopeIcon;
