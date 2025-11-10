import React from 'react';

const PdfIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 9 3H5.625ZM12.75 3a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V9a.75.75 0 0 0 1.5 0V6.75h2.25a.75.75 0 0 0 0-1.5H12.75V3Z" clipRule="evenodd" />
    <path d="M14.25 10.5a.75.75 0 0 0-1.5 0v4.879l-1.22-1.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V10.5Z" />
  </svg>
);

export default PdfIcon;
