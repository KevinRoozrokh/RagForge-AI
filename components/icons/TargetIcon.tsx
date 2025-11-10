import React from 'react';

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a17.953 17.953 0 0 1-2.213-9.161 17.953 17.953 0 0 1 9.162 2.213m-9.162-2.213a17.953 17.953 0 0 1-2.213 9.162 17.953 17.953 0 0 1 9.161-2.213m-6.948 0a11.953 11.953 0 0 1-5.173 8.342 11.953 11.953 0 0 1 8.342-5.173m-8.342 5.173a11.953 11.953 0 0 1-5.173-8.342 11.953 11.953 0 0 1 8.342 5.173" />
  </svg>
);

export default TargetIcon;