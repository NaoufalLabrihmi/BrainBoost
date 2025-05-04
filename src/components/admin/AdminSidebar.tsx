import React from 'react';
import { X, Settings, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Example avatar (replace with real admin info if available)
const adminProfile = {
  name: 'Admin',
  avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin',
};

const glass =
  'bg-gradient-to-br from-gray-950/80 via-gray-900/80 to-blue-950/80 backdrop-blur-2xl border border-gray-800 shadow-2xl';

export default function AdminSidebar({
  active,
  setActive,
  navItems,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
}) {
  // Theme toggle (optional, can be wired up)
  const [dark, setDark] = React.useState(true);
  // Collapsed state for desktop
  const [expanded, setExpanded] = React.useState(false);
  // Only show collapsed on desktop
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  // Timer for delayed collapse
  const collapseTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Handlers for hover/collapse with delay
  const handleMouseEnter = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setExpanded(true);
  };
  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setExpanded(false);
    }, 250);
  };
  React.useEffect(() => {
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  // Responsive: show as drawer on mobile
  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 transition-all duration-300 md:hidden',
          sidebarOpen ? 'visible' : 'invisible pointer-events-none'
        )}
        style={{ background: sidebarOpen ? 'rgba(20,20,40,0.55)' : 'transparent' }}
        onClick={() => setSidebarOpen(false)}
      >
        <aside
          className={cn(
            'absolute top-0 left-0 h-full w-[90vw] max-w-xs',
            glass,
            'flex flex-col py-6 px-3 gap-2 transform transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Profile */}
          <div className="flex items-center gap-3 mb-8 px-1">
            <img src={adminProfile.avatar} alt="Admin" className="w-10 h-10 rounded-full border-2 border-purple-500 shadow" />
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">{adminProfile.name}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
            <button
              className="ml-auto p-2 rounded-full hover:bg-gray-800/60 transition"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6 text-gray-300" />
            </button>
          </div>
          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 focus:outline-none border border-transparent w-full text-left relative',
                  active === item.key
                    ? 'bg-gradient-to-r from-purple-700/80 to-blue-700/80 shadow-lg border-purple-500 text-white'
                    : 'bg-gray-900/40 hover:bg-purple-800/30 text-gray-200'
                )}
                onClick={() => { setActive(item.key); setSidebarOpen(false); }}
                aria-label={item.label}
              >
                <span className={cn('flex items-center justify-center w-8 h-8 rounded-lg', active === item.key ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow' : 'bg-gray-800/60')}>{item.icon}</span>
                <span>{item.label}</span>
                {/* Animated active indicator */}
                {active === item.key && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full shadow-lg animate-pulse" />
                )}
              </button>
            ))}
          </nav>
          {/* Quick actions */}
          <div className="flex items-center mt-auto pt-6 border-t border-gray-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center px-0 py-3 rounded-xl text-lg font-bold transition-all duration-150 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-fuchsia-500 text-white hover:from-purple-800 hover:via-fuchsia-700 hover:to-fuchsia-500 focus:outline-none border-none shadow-lg group"
              aria-label="Logout"
            >
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:-translate-x-0.5 text-white drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>
      </div>
      {/* Desktop Sidebar - Collapsible */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 z-30 border-r border-gray-800/80 shadow-2xl',
          glass,
          'transition-all duration-500',
          expanded ? 'w-60 min-w-[15rem] max-w-xs px-3 py-8 gap-3' : 'w-16 min-w-[4rem] max-w-[4rem] px-2 py-6 gap-2'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setExpanded(true)}
        tabIndex={0}
        aria-label="Admin sidebar"
      >
        {/* Profile (only when expanded) */}
        {expanded && (
          <div className="flex items-center gap-3 mb-10 px-1 transition-opacity duration-500">
            <img src={adminProfile.avatar} alt="Admin" className="w-11 h-11 rounded-full border-2 border-purple-500 shadow" />
            <div>
              <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">{adminProfile.name}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
        )}
        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={cn(
                'flex items-center rounded-xl transition-all duration-200 focus:outline-none border border-transparent w-full text-left relative group',
                expanded ? 'gap-3 px-4 py-3 text-base font-semibold' : 'justify-center p-0 h-12 w-12',
                active === item.key
                  ? 'bg-gradient-to-r from-purple-700/80 to-blue-700/80 shadow-lg border-purple-500 text-white'
                  : 'bg-gray-900/40 hover:bg-purple-800/30 text-gray-200'
              )}
              onClick={() => setActive(item.key)}
              aria-label={item.label}
            >
              <span className={cn('flex items-center justify-center rounded-lg transition-all duration-500', expanded ? 'w-8 h-8' : 'w-10 h-10', active === item.key ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow' : 'bg-gray-800/60 group-hover:bg-purple-700/40')}>{item.icon}</span>
              {/* Only show label when expanded */}
              {expanded && <span className="transition-opacity duration-500">{item.label}</span>}
              {/* Animated active indicator */}
              {active === item.key && (
                <span className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full shadow-lg animate-pulse transition-opacity duration-500', expanded ? '' : 'opacity-0')}/>
              )}
            </button>
          ))}
        </nav>
        {/* Quick actions (only when expanded) */}
        {expanded && (
          <div className="flex items-center mt-auto pt-8 border-t border-gray-800 transition-opacity duration-500">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center px-0 py-3 rounded-xl text-lg font-bold transition-all duration-150 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-fuchsia-500 text-white hover:from-purple-800 hover:via-fuchsia-700 hover:to-fuchsia-500 focus:outline-none border-none shadow-lg group"
              aria-label="Logout"
            >
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:-translate-x-0.5 text-white drop-shadow-lg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
} 