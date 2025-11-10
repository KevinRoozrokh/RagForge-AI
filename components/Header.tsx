import React from 'react';
import HamburgerIcon from './icons/HamburgerIcon';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex-shrink-0 bg-surface/30 backdrop-blur-lg border-b border-outline-variant">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Hamburger Menu Button - visible on mobile */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-full text-on-surface-variant hover:bg-white/10"
          aria-label="Open sidebar"
        >
          <HamburgerIcon className="w-6 h-6" />
        </button>
        
        {/* Spacer to push profile button to the right on mobile */}
        <div className="md:hidden"></div>

        <div className="flex items-center">
          <div className="relative">
            <button className="flex items-center space-x-3 focus:outline-none p-2 rounded-full hover:bg-surface transition-colors">
              <span className="text-sm font-medium text-on-surface-variant hidden sm:inline">Jane Doe</span>
              <img
                className="h-8 w-8 rounded-full"
                src="https://picsum.photos/seed/user/100/100"
                alt="User avatar"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;