import React from 'react';

const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 3-3 3m6-6 3 3-3 3" />
  </svg>
);

export default CodeIcon;
