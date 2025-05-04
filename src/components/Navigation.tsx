import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { GraduationCap, MessageCircle, User, Plus, Key, Menu, X, ShoppingBag, Receipt } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'react-hot-toast';
import { JoinQuizDialog } from '@/components/quiz/JoinQuizDialog';
import { PurchaseStatusBadge } from './admin/PurchaseStatusBadge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StudentPurchaseDropdown } from './StudentPurchaseDropdown';

// Helper to get initials from user metadata
function getUserInitials(user) {
  const meta = user?.user_metadata || {};
  const name = meta.full_name || meta.name || meta.username || user.email || '';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() || '';
  return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
}

// Helper to get display name from user metadata
function getUserDisplayName(user) {
  const meta = user?.user_metadata || {};
  return meta.full_name || meta.name || meta.username || user.email || '';
}

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJoinQuizOpen, setIsJoinQuizOpen] = useState(false);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
  const { user, profile, signOut, initialized, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfessor = profile?.role === 'teacher' || profile?.role === 'admin';
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  useEffect(() => {
    if (!initialized || !profile) {
      checkAuth();
    }
  }, [initialized, profile, checkAuth]);

  useEffect(() => {
    if (profile?.role === 'student') {
      setPurchasesLoading(true);
      supabase
        .from('purchases')
        .select(`id, status, points_spent, created_at, products:products!purchases_product_id_fkey(name, image_url)`)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          setPurchasesLoading(false);
          if (!error && data) setPurchases(data);
        });
    }
  }, [profile]);

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { replace: true });
  };

  // Show loading state if not initialized or profile not loaded
  if (!initialized || !profile) {
    return (
      <header className="relative bg-[#0a101a] sticky top-0 z-50">
        <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 animate-gradient-x drop-shadow-xl" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-700 via-blue-700 to-teal-700 animate-bounce-slow">
                <GraduationCap className="h-7 w-7 text-cyan-300" />
              </div>
              <span className="text-2xl font-serif font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight animate-fadeIn">
                Brain Boost
              </span>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.7s; }
          @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
          .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease-in-out infinite; }
        `}</style>
      </header>
    );
  }

  // Nav item helper
  const navItemClass = (active: boolean) =>
    `relative px-6 py-2.5 rounded-full font-extrabold text-cyan-100 text-base bg-gradient-to-r from-cyan-800 via-blue-900 to-cyan-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 ${
      active ? 'ring-2 ring-cyan-400/80' : 'hover:ring-2 hover:ring-cyan-400/60'
    }`;

  // Mobile nav item helper
  const mobileNavItemClass = (active: boolean) =>
    `flex items-center gap-3 px-6 py-4 rounded-full text-lg font-extrabold text-cyan-100 bg-gradient-to-r from-cyan-800 via-blue-900 to-cyan-900 transition-all duration-200 border-2 border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 ${
      active ? 'ring-2 ring-cyan-400' : 'hover:ring-2 hover:ring-cyan-400/60'
    }`;

  return (
    <>
      <header className="relative bg-[#0a101a] sticky top-0 z-50">
        <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 animate-gradient-x drop-shadow-xl" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group" 
              onClick={handleLogoClick}
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-700 via-blue-700 to-teal-700 animate-bounce-slow">
                <GraduationCap className="h-7 w-7 text-cyan-300" />
              </div>
              <span className="text-2xl font-serif font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent tracking-tight animate-fadeIn">
                Brain Boost
              </span>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  {isProfessor ? (
                    <>
                      <Link to="/quizzes" className={navItemClass(location.pathname === '/quizzes')}>
                        Quizzes
                      </Link>
                      <Link to="/create-quiz" className={navItemClass(location.pathname === '/create-quiz')}>
                        Create Quiz
                      </Link>
                    </>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className={navItemClass(location.pathname === '/join-quiz') + ' flex items-center gap-2'}
                      onClick={() => setIsJoinQuizOpen(true)}
                    >
                      <Key className="mr-2 h-5 w-5" />
                      Join Quiz
                    </Button>
                  )}
                  {profile?.role === 'student' && (
                    <Link to="/shop" className={navItemClass(location.pathname === '/shop')}>
                      Shop
                  </Link>
                  )}
                  {profile?.role === 'student' && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className={navItemClass(location.pathname === '/purchases') + ' flex items-center gap-2'}
                        onClick={() => setShowPurchases((v) => !v)}
                        aria-label="My Purchases"
                      >
                        <Receipt className="w-5 h-5" />
                        My Purchases
                        {purchases.filter(p => p.status === 'pending').length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs rounded-full px-1.5 py-0.5 border-2 border-white animate-pulse">
                            {purchases.filter(p => p.status === 'pending').length}
                          </span>
                        )}
                      </Button>
                      {showPurchases && (
                        <div className="absolute left-0 top-full mt-2 z-50 w-[22rem] max-w-[95vw]">
                        <StudentPurchaseDropdown
                          purchases={purchases}
                          loading={purchasesLoading}
                          onClose={() => setShowPurchases(false)}
                            isMobile={false}
                        />
                        </div>
                      )}
                    </div>
                  )}
                  <Link to="/forum" className={navItemClass(location.pathname === '/forum')}>
                    Forum
                  </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                        className="relative h-11 w-11 rounded-full bg-gradient-to-tr from-cyan-900 via-blue-900 to-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 flex items-center justify-center p-0 border-2 border-cyan-700"
                        >
                        <Avatar className="h-11 w-11 border-2 border-cyan-400">
                              {user.user_metadata.avatar_url ? (
                            <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-teal-400 text-white text-2xl font-extrabold">
                                  {getUserInitials(user)}
                            </AvatarFallback>
                              )}
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-[#0a101a] border border-cyan-700 p-0 rounded-2xl mt-2 overflow-hidden" align="end" forceMount>
                      <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400" />
                      <div className="flex flex-col items-center gap-1 px-2 pt-3 pb-3">
                        <div className="text-lg font-extrabold text-cyan-100 text-center truncate w-full">{getUserDisplayName(user)}</div>
                          <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide ${profile?.role === 'student' ? 'bg-cyan-800/60 text-cyan-200' : profile?.role === 'teacher' ? 'bg-blue-800/60 text-blue-200' : 'bg-teal-800/60 text-teal-200'}`}>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}</span>
                          {profile?.role === 'student' && (
                          <span className="mt-1 text-sm font-bold text-yellow-300 bg-yellow-900/30 rounded-full px-3 py-0.5">Points: {profile?.points ?? 0}</span>
                          )}
                        </div>
                        <DropdownMenuSeparator className="my-2 bg-cyan-800/40" />
                        <DropdownMenuItem
                          className="rounded-xl px-4 py-3 font-bold text-red-400 hover:bg-red-900/60 hover:text-white transition-all duration-200 flex items-center gap-3 cursor-pointer"
                          onClick={handleSignOut}
                        >
                          <X className="w-5 h-5" />
                          <span>Sign out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className={navItemClass(location.pathname === '/login')}>
                    Login
                  </Link>
                  <Link to="/register" className={navItemClass(location.pathname === '/register')}>
                    Register
                  </Link>
                </div>
              )}
            </nav>
            {/* Mobile Purchases Icon and Menu Button (side by side, no extra margin) */}
            <div className="md:hidden flex items-center gap-1">
              {user && profile?.role === 'student' && (
                <button
                  className="relative p-2 rounded-full bg-gradient-to-tr from-cyan-900 via-blue-900 to-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/80"
                  onClick={() => setIsPurchasesOpen(true)}
                  aria-label="My Purchases"
                >
                  <Receipt className="h-6 w-6 text-cyan-200" />
                  {purchases.filter(p => p.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs rounded-full px-1.5 py-0.5 border-2 border-white animate-pulse">
                      {purchases.filter(p => p.status === 'pending').length}
                    </span>
                  )}
                </button>
              )}
              {/* Mobile Menu Button */}
              <button
                className="p-2 rounded-full bg-gradient-to-tr from-cyan-900 via-blue-900 to-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-400/80"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-cyan-200" />
                ) : (
                  <Menu className="h-6 w-6 text-cyan-200" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu overlay" />
            {/* Side Drawer */}
            <nav className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs bg-[#101624] shadow-xl flex flex-col py-8 px-4 gap-2 transition-transform duration-300 transform translate-x-0">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-cyan-900 text-cyan-200 border border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" strokeWidth={2.2} />
              </button>
              <div className="flex flex-col gap-2 mt-12">
              {user ? (
                  <>
                  {isProfessor ? (
                    <>
                        <Link to="/quizzes" className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/quizzes' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`} onClick={() => setIsMobileMenuOpen(false)}>
                          <GraduationCap className="w-5 h-5" /> Quizzes
                      </Link>
                        <Link to="/create-quiz" className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/create-quiz' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`} onClick={() => setIsMobileMenuOpen(false)}>
                          <Plus className="w-5 h-5" /> Create Quiz
                      </Link>
                    </>
                  ) : (
                    <button 
                        className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/join-quiz' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`}
                        onClick={() => { setIsJoinQuizOpen(true); setIsMobileMenuOpen(false); }}
                    >
                        <Key className="w-5 h-5" /> Join Quiz
                    </button>
                  )}
                  {profile?.role === 'student' && (
                      <Link to="/shop" className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/shop' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`} onClick={() => setIsMobileMenuOpen(false)}>
                        <ShoppingBag className="w-5 h-5" /> Shop
                  </Link>
                  )}
                    <Link to="/forum" className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/forum' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`} onClick={() => setIsMobileMenuOpen(false)}>
                      <MessageCircle className="w-5 h-5" /> Forum
                  </Link>
                  <button
                    onClick={handleSignOut}
                      className="flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base border-2 border-red-400 bg-gradient-to-r from-red-900 via-red-800 to-cyan-900 text-red-200 shadow-red-glow transition-all duration-200 mt-4 focus:ring-2 focus:ring-red-400/60"
                  >
                      <X className="w-5 h-5" /> Sign out
                  </button>
                  </>
              ) : (
                  <>
                    <Link to="/login" className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/login' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`} onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-5 h-5" /> Login
                  </Link>
                    <Link to="/register" className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${location.pathname === '/register' ? 'border-2 border-cyan-400 bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-900 text-cyan-100 shadow-cyan-glow' : 'border border-cyan-800 bg-[#162032] text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/40'}`} onClick={() => setIsMobileMenuOpen(false)}>
                      <Plus className="w-5 h-5" /> Register
                  </Link>
                  </>
                )}
                </div>
          </nav>
          </>
        )}
      </header>
      {/* Purchases Modal for mobile (and can be used for desktop if needed) */}
      {isPurchasesOpen && (
        <StudentPurchaseDropdown
          purchases={purchases}
          loading={purchasesLoading}
          onClose={() => setIsPurchasesOpen(false)}
          isMobile={true}
        />
      )}
      <JoinQuizDialog 
        isOpen={isJoinQuizOpen} 
        onClose={() => setIsJoinQuizOpen(false)} 
      />
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.7s; }
        @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease-in-out infinite; }
      `}</style>
    </>
  );
}
