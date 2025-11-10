import React from 'react';

const ExperimentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.252 0 .487.02.718.057m-2.856 2.856c.435.23.92.383 1.428.488M4.938 12.375c-.32.223-.59.48-.797.75M12.75 12.375c-.32.223-.59.48-.797.75m-4.5-4.5c.435.23.92.383 1.428.488M15.062 12.375c-.32.223-.59.48-.797.75m1.343-4.125c.435.23.92.383 1.428.488M5.938 14.5c-.207-.27-.477-.527-.797-.75m10.312 0c-.32.223-.59.48-.797.75M12 21.75a2.25 2.25 0 0 1-2.25-2.25v-5.25a2.25 2.25 0 0 1 2.25-2.25h.5a2.25 2.25 0 0 1 2.25 2.25v5.25a2.25 2.25 0 0 1-2.25 2.25h-.5Z" />
  </svg>
);

export default ExperimentIcon;