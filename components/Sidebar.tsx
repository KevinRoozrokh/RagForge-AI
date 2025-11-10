import React from 'react';
import Logo from './icons/Logo';
import DashboardIcon from './icons/DashboardIcon';
import DocumentIcon from './icons/DocumentIcon';
import ApiIcon from './icons/ApiIcon';
import BillingIcon from './icons/BillingIcon';
import WaveformIcon from './icons/WaveformIcon';
import ExperimentIcon from './icons/ExperimentIcon';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {

  const navItems = [
    { id: 'dashboard', label: 'My RAGs', icon: DashboardIcon },
    { id: 'experiments', label: 'Experiments', icon: ExperimentIcon },
    { id: 'knowledge', label: 'Knowledge Base', icon: DocumentIcon },
    { id: 'voice', label: 'Voice AI', icon: WaveformIcon },
    { id: 'api', label: 'API Keys', icon: ApiIcon },
    { id: 'billing', label: 'Billing', icon: BillingIcon },
  ];

  const handleItemClick = (view: string) => {
    setActiveView(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface flex flex-col border-r border-outline-variant
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center justify-center px-4 border-b border-outline-variant">
          <Logo className="h-10 w-auto text-primary" />
          <span className="ml-3 text-xl font-medium text-on-surface">RAGForge</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-on-surface-variant hover:bg-white/10 hover:text-on-surface'
                }`}
              >
                <Icon className="w-6 h-6 mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-outline-variant">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
              <h4 className="font-semibold text-on-surface">Upgrade to Pro</h4>
              <p className="mt-1 text-xs text-on-surface-variant">Unlock more powerful features and higher limits.</p>
              <button 
                  onClick={() => handleItemClick('billing')}
                  className="mt-3 w-full px-3 py-2 text-xs font-medium text-background bg-primary rounded-md hover:bg-primary-light transition-colors"
              >
                  Upgrade Plan
              </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;