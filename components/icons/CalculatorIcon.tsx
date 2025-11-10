import React from 'react';

const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-4.5-2.25V18m-4.5-2.25V18m13.5 0H5.25A2.25 2.25 0 0 1 3 15.75V8.25A2.25 2.25 0 0 1 5.25 6H10.5M15.75 15.75h.008v.008h-.008V15.75Zm.008 0H15.75m-4.5 0h.008v.008h-.008V15.75Zm.008 0H11.25m-4.5 0h.008v.008H6.75V15.75Zm.008 0H6.75m10.5-9h-4.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75Z" />
  </svg>
);

export default CalculatorIcon;
