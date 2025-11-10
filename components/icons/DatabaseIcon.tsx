import React from 'react';

const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v1.5a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 7.5V6Zm0 6A2.25 2.25 0 0 1 6 9.75h12A2.25 2.25 0 0 1 20.25 12v1.5a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 13.5V12Zm0 6A2.25 2.25 0 0 1 6 15.75h12A2.25 2.25 0 0 1 20.25 18v1.5a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 19.5V18Z" />
  </svg>
);

export default DatabaseIcon;
