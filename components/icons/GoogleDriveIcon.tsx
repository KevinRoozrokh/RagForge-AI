import React from 'react';

const GoogleDriveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path fill="#3777e3" d="M14.65 12.35L17.5 17.5h-5.85L8.8 12.35l2.9-5.1h5.85z"/>
    <path fill="#3777e3" d="m15.5 12.7-2.6 4.5h-5.25L4.5 12.7l2.6-4.5h5.25z" opacity=".5"/>
    <path fill="#3777e3" d="m11.15 2.3-5.8 10.05L2.5 7.25l5.8-10.1z" opacity=".5"/>
    <path fill="#fcc934" d="m12 12.7-2.9 5.1-2.85-5.1h5.75"/>
    <path fill="#34a853" d="M19.5 7.25 16.65 12.4 11.1 2.25 13.95 2.25z"/>
    <path fill="#ea4335" d="M9.35 21.75 12.2 16.65 6.4 16.65z"/>
  </svg>
);

export default GoogleDriveIcon;
