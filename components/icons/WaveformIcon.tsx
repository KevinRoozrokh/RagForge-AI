import React from 'react';

const WaveformIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h.007v.007H3.75V12zm3.75 0h.007v.007H7.5V12zm3.75 0h.007v.007h-.007V12zm3.75 0h.007v.007h-.007V12zm3.75 0h.007v.007h-.007V12zm3.75 0h.007v.007h-.007V12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c0-3.313 2.687-6 6-6s6 2.687 6 6-2.687 6-6 6-6-2.687-6-6zm18 0c0-3.313-2.687-6-6-6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 3.313-2.687 6-6 6" />
  </svg>
);

export default WaveformIcon;
