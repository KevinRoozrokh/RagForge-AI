import React from 'react';

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12.75a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-6 0v1.5a3 3 0 0 0 3 3Z"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75v2.25"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 21h6"
    />
  </svg>
);

export default MicrophoneIcon;
