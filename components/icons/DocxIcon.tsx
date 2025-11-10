import React from 'react';

const DocxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 9 3H5.625Z" />
    <path d="M12 11.25a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5H12Z" />
    <path d="M12 15a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5H12Z" />
    <path d="M7.5 11.25a.75.75 0 0 0 0 1.5H9a.75.75 0 0 0 0-1.5H7.5Z" />
    <path d="M7.5 15a.75.75 0 0 0 0 1.5H9a.75.75 0 0 0 0-1.5H7.5Z" />
  </svg>
);

export default DocxIcon;
