import React from 'react';

const MemoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5m-15 3.75h1.5m15 0h1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h6m-6 3.75h6m-6 3.75h6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3c-.026.002-.052.002-.078.002s-.052 0-.078-.002M12 3c-.026.002-.052.002-.078.002s-.052 0-.078-.002m-3.672 0c.026.002.052.002.078.002s.052 0 .078-.002M15.75 21c-.026-.002-.052-.002-.078-.002s-.052 0-.078.002M12 21c-.026-.002-.052-.002-.078-.002s-.052 0-.078.002m-3.672 0c.026-.002.052-.002.078-.002s.052 0 .078.002M3 15.75c.002.026.002.052.002.078s0 .052-.002.078M3 12c.002.026.002.052.002.078s0 .052-.002.078m0-3.672c.002.026.002.052.002.078s0 .052-.002.078m18 3.672c-.002.026-.002.052-.002.078s0 .052.002.078m0-3.672c-.002.026-.002.052-.002.078s0 .052.002.078m0-3.672c-.002.026-.002.052-.002.078s0 .052.002.078" />
  </svg>
);

export default MemoryIcon;
