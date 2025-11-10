import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 1 1 9 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 0 0 9 0ZM12 14.25v4.5m-4.5-4.5v4.5m9-4.5v4.5M9 7.5l1.5-1.5M15 7.5l-1.5-1.5M12 6.75v-1.5m0 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.75A2.25 2.25 0 0 0 4.5 6v1.5M15 3.75h2.25A2.25 2.25 0 0 1 19.5 6v1.5" />
  </svg>
);

export default TrophyIcon;
