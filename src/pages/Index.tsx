import React, { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GraduationCap, MessageCircle, ShoppingBag, X, Sparkles, Trophy, Gift, User, Users, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SignupModal: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (username.length < 3) throw new Error('Username must be at least 3 characters long');
      if (!email || !password || !username) throw new Error('All fields are required');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, role } },
      });
      if (authError) throw authError;
      if (!authData.user?.id) throw new Error('Registration failed - no user ID returned');
      setSuccess(true);
      toast({ title: 'Account created!', description: 'Welcome! Please check your email to verify your account.' });
      setTimeout(() => { setShowModal(false); onSuccess(); }, 1200);
    } catch (error: any) {
      let errorMessage = 'An error occurred during registration';
      if (error.message?.includes('duplicate key')) errorMessage = 'This username is already taken';
      else if (error.message?.includes('Database error')) errorMessage = 'There was an issue creating your account. Please try again later.';
      else errorMessage = error.message;
      setError(errorMessage);
      toast({ title: 'Registration Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={onSuccess} aria-label="Close signup modal">
      <div className="relative w-full max-w-sm mx-auto bg-gradient-to-br from-[#0f172a]/90 via-[#0e7490]/80 to-[#0369a1]/90 rounded-3xl shadow-2xl border-2 border-cyan-400/50 px-6 py-10 flex flex-col gap-2 backdrop-blur-2xl animate-fadeIn" onClick={e => e.stopPropagation()} tabIndex={-1} style={{ boxShadow: '0 0 32px 4px #22d3ee55, 0 2px 32px 0 #0ea5e9aa' }}>
      {/* Close button */}
      <button
        type="button"
        aria-label="Close"
          className="absolute top-3 right-3 text-cyan-300 hover:text-white p-2 rounded-full bg-cyan-900/80 border-2 border-cyan-400/40 shadow focus:outline-none focus:ring-2 focus:ring-cyan-400"
        onClick={onSuccess}
      >
          <X className="w-6 h-6" />
      </button>
        {/* Mascot/Animated Icon */}
      <div className="flex justify-center mb-3">
        <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 rounded-full blur-lg opacity-60 animate-pulse"></div>
            <div className="relative bg-cyan-900 rounded-full p-3 border-2 border-cyan-400 animate-bounce">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="20" ry="16" fill="#22d3ee" opacity="0.7"/><ellipse cx="24" cy="24" rx="16" ry="12" fill="#fff" opacity="0.7"/><ellipse cx="24" cy="24" rx="10" ry="8" fill="#0ea5e9" opacity="0.8"/><ellipse cx="24" cy="24" rx="5" ry="4" fill="#fff" opacity="0.8"/></svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-center mb-2 text-cyan-100 font-['Orbitron',_sans-serif] tracking-tight drop-shadow-cyan-glow">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div className="space-y-1">
          <Label htmlFor="username" className="text-cyan-200">Username</Label>
            <div className="relative">
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
                className="bg-[#0f172a]/80 border border-cyan-700/40 text-white placeholder-cyan-400 focus:border-cyan-400 text-base rounded-xl pl-10 shadow-cyan-glow"
          />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><User className="w-5 h-5" /></span>
            </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="email" className="text-cyan-200">Email</Label>
            <div className="relative">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
                className="bg-[#0f172a]/80 border border-cyan-700/40 text-white placeholder-cyan-400 focus:border-cyan-400 text-base rounded-xl pl-10 shadow-cyan-glow"
          />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='2' y='4' width='20' height='16' rx='2' /><path d='M22 6 12 13 2 6' /></svg></span>
            </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="password" className="text-cyan-200">Password</Label>
            <div className="relative">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
                className="bg-[#0f172a]/80 border border-cyan-700/40 text-white placeholder-cyan-400 focus:border-cyan-400 text-base rounded-xl pl-10 shadow-cyan-glow"
          />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='11' width='18' height='11' rx='2' /><circle cx='12' cy='16.5' r='2.5' /><path d='M7 11V7a5 5 0 0 1 10 0v4' /></svg></span>
            </div>
        </div>
        <div className="space-y-1">
          <Label className="text-cyan-200">I am a...</Label>
          <div className="flex flex-row gap-2 justify-center mt-1">
            <button
              type="button"
                className={`flex flex-col items-center px-2 py-2 rounded-xl border-2 transition-all duration-150 w-24 ${role === 'student' ? 'border-cyan-400 bg-[#0e7490]/60 shadow-cyan-glow scale-105' : 'border-cyan-700 bg-[#0f172a] hover:border-cyan-400'}`}
              onClick={() => setRole('student')}
              aria-pressed={role === 'student'}
            >
                <GraduationCap className={`w-6 h-6 mb-1 ${role === 'student' ? 'text-cyan-300' : 'text-cyan-600'}`} />
                <span className={`font-semibold text-xs ${role === 'student' ? 'text-cyan-100' : 'text-cyan-400'}`}>Student</span>
            </button>
            <button
              type="button"
                className={`flex flex-col items-center px-2 py-2 rounded-xl border-2 transition-all duration-150 w-24 ${role === 'teacher' ? 'border-cyan-400 bg-[#0e7490]/60 shadow-cyan-glow scale-105' : 'border-cyan-700 bg-[#0f172a] hover:border-cyan-400'}`}
              onClick={() => setRole('teacher')}
              aria-pressed={role === 'teacher'}
            >
                <MessageCircle className={`w-6 h-6 mb-1 ${role === 'teacher' ? 'text-cyan-300' : 'text-cyan-600'}`} />
                <span className={`font-semibold text-xs ${role === 'teacher' ? 'text-cyan-100' : 'text-cyan-400'}`}>Teacher</span>
            </button>
          </div>
        </div>
          {error && <div className="text-red-400 text-center animate-shake font-bold mt-2 drop-shadow-cyan-glow">{error}</div>}
          {success && <div className="text-green-400 text-center animate-bounce font-bold mt-2 drop-shadow-cyan-glow">🎉 Account created! Check your email.</div>}
        <Button
          type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-400 hover:from-cyan-400 hover:to-blue-400 text-gray-900 font-extrabold text-lg rounded-full py-3 mt-2 shadow-cyan-glow animate-bounce focus:ring-2 focus:ring-cyan-400/40"
            disabled={isLoading || success}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
        <div className="text-center mt-4 text-cyan-200 text-sm">
          Already have an account?{' '}
          <span className="underline cursor-pointer text-cyan-300 hover:text-cyan-100 transition" onClick={() => { onSuccess(); setTimeout(() => (document.querySelector('button[aria-label="Log in"]') as HTMLButtonElement)?.click(), 200); }}>
            Log in!
          </span>
        </div>
      </div>
      <style>{`
        @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.5s; }
        .shadow-cyan-glow { box-shadow: 0 0 16px 2px #22d3ee55, 0 2px 16px 0 #0ea5e9aa; }
        .drop-shadow-cyan-glow { filter: drop-shadow(0 0 8px #22d3ee88); }
      `}</style>
    </div>
  );
};

const LoginModal: React.FC<{ onSuccess: () => void; showLoading: () => void }> = ({ onSuccess, showLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoading();
    setLoading(true);
    setError(null);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Success', description: 'Logged in successfully!' });
      setTimeout(() => { onSuccess(); }, 1200);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to sign in', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={onSuccess} aria-label="Close login modal">
      <div className="relative w-full max-w-sm mx-auto bg-gradient-to-br from-[#0f172a]/90 via-[#0e7490]/80 to-[#0369a1]/90 rounded-3xl shadow-2xl border-2 border-cyan-400/50 px-6 py-10 flex flex-col gap-2 backdrop-blur-2xl animate-fadeIn" onClick={e => e.stopPropagation()} tabIndex={-1} style={{ boxShadow: '0 0 32px 4px #22d3ee55, 0 2px 32px 0 #0ea5e9aa' }}>
      {/* Close button */}
      <button
        type="button"
        aria-label="Close"
          className="absolute top-3 right-3 text-cyan-300 hover:text-white p-2 rounded-full bg-cyan-900/80 border-2 border-cyan-400/40 shadow focus:outline-none focus:ring-2 focus:ring-cyan-400"
        onClick={onSuccess}
      >
          <X className="w-6 h-6" />
      </button>
        {/* Mascot/Animated Icon */}
      <div className="flex justify-center mb-3">
        <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 rounded-full blur-lg opacity-60 animate-pulse"></div>
            <div className="relative bg-cyan-900 rounded-full p-3 border-2 border-cyan-400 animate-bounce">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="20" ry="16" fill="#22d3ee" opacity="0.7"/><ellipse cx="24" cy="24" rx="16" ry="12" fill="#fff" opacity="0.7"/><ellipse cx="24" cy="24" rx="10" ry="8" fill="#0ea5e9" opacity="0.8"/><ellipse cx="24" cy="24" rx="5" ry="4" fill="#fff" opacity="0.8"/></svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-center mb-2 text-cyan-100 font-['Orbitron',_sans-serif] tracking-tight drop-shadow-cyan-glow">Sign in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div className="space-y-1">
          <Label htmlFor="login-email" className="text-cyan-200">Email</Label>
            <div className="relative">
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
                className="bg-[#0f172a]/80 border border-cyan-700/40 text-white placeholder-cyan-400 focus:border-cyan-400 text-base rounded-xl pl-10 shadow-cyan-glow"
          />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='2' y='4' width='20' height='16' rx='2' /><path d='M22 6 12 13 2 6' /></svg></span>
            </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="login-password" className="text-cyan-200">Password</Label>
            <div className="relative">
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
                className="bg-[#0f172a]/80 border border-cyan-700/40 text-white placeholder-cyan-400 focus:border-cyan-400 text-base rounded-xl pl-10 shadow-cyan-glow"
          />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><svg width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='11' width='18' height='11' rx='2' /><circle cx='12' cy='16.5' r='2.5' /><path d='M7 11V7a5 5 0 0 1 10 0v4' /></svg></span>
            </div>
        </div>
          {error && <div className="text-red-400 text-center animate-shake font-bold mt-2 drop-shadow-cyan-glow">{error}</div>}
          {success && <div className="text-green-400 text-center animate-bounce font-bold mt-2 drop-shadow-cyan-glow">🎉 Logged in! Redirecting...</div>}
        <Button
          type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 via-cyan-400 to-blue-400 hover:from-cyan-400 hover:to-blue-400 text-gray-900 font-extrabold text-lg rounded-full py-3 mt-2 shadow-cyan-glow animate-bounce focus:ring-2 focus:ring-cyan-400/40"
            disabled={loading || success}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
        <div className="text-center mt-4 text-cyan-200 text-sm">
          New here?{' '}
          <span className="underline cursor-pointer text-cyan-300 hover:text-cyan-100 transition" onClick={() => { onSuccess(); setTimeout(() => (document.querySelector('button[aria-label="Sign up"]') as HTMLButtonElement)?.click(), 200); }}>
            Sign up!
          </span>
        </div>
      </div>
      <style>{`
        @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.5s; }
        .shadow-cyan-glow { box-shadow: 0 0 16px 2px #22d3ee55, 0 2px 16px 0 #0ea5e9aa; }
        .drop-shadow-cyan-glow { filter: drop-shadow(0 0 8px #22d3ee88); }
      `}</style>
    </div>
  );
};

// Add the animation CSS directly for demo/dev
const overlayStyles = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.5s; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.animate-spin-slow { animation: spin 2s linear infinite; }
`;

const Index = () => {
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  
  // Show overlay for 1.5s after login is triggered
  const showLoading = () => {
    setShowLoadingOverlay(true);
    setTimeout(() => setShowLoadingOverlay(false), 1500);
  };

  // Add a handler for logout that resets UI and opens login modal
  const handleLogout = async () => {
    await signOut();
    setLoginOpen(true); // Show login modal after logout
    setShowLoadingOverlay(false); // Ensure overlay is hidden
  };

  // Redirect admin to dashboard_admin after login
  useEffect(() => {
    if (profile?.role === 'admin') {
      navigate('/dashboard_admin', { replace: true });
    }
  }, [profile, navigate]);

  return (
    <>
      <style>{overlayStyles}</style>
      <div className="flex flex-col min-h-screen text-white">
        {/* Loading Overlay */}
        {showLoadingOverlay && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-500 animate-fadeIn">
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center">
                <span className="absolute animate-ping w-24 h-24 rounded-full bg-cyan-600 opacity-30"></span>
                <GraduationCap className="w-20 h-20 text-cyan-400 animate-spin-slow" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-lg">Welcome back to Brain Boost!</h2>
              <p className="text-lg text-cyan-100 text-center">Empowering your learning journey...</p>
            </div>
          </div>
        )}
        {!showLoadingOverlay && (
          <>
            <Navigation />
            <main className="flex-grow">
              {/* HERO SECTION */}
              <section
                className="relative flex items-center justify-center min-h-[80vh] py-24 md:py-36 overflow-hidden"
                style={{ backgroundImage: "url('/lofi.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                {/* Subtle dreamy overlay for readability, less opacity */}
                <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(120deg, rgba(34,211,238,0.18) 0%, rgba(59,130,246,0.18) 40%, rgba(20,184,166,0.12) 100%)', backdropFilter: 'blur(4px)' }} />
                <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center">
                  {/* Animated mascot/character */}
                  <div className="mb-6 animate-bounce-slow">
                    <span className="inline-block rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-400 p-2 shadow-lg">
                      {/* Brain Boost Logo (GraduationCap) */}
                      <GraduationCap className="w-20 h-20 md:w-28 md:h-28 text-cyan-100 drop-shadow-cyan-glow" style={{ filter: 'drop-shadow(0 0 32px #22d3ee88)' }} />
                    </span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-extrabold mb-3 bg-gradient-to-r from-cyan-300 via-blue-400 to-teal-300 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-x drop-shadow-[0_4px_32px_rgba(34,211,238,0.25)] font-['Orbitron',_Montserrat,_Poppins,_sans-serif] tracking-tight animate-fadeIn">
                    Compete. <span className="text-white/90">Learn.</span> <span className="text-cyan-200">Win.</span>
                  </h1>
                  <p className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-cyan-200 via-blue-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-cyan-glow animate-slideUp font-['Orbitron',_Montserrat,_Poppins,_sans-serif] tracking-tight">
                    Welcome to Brain Boost!
                  </p>
                  <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto mb-8 animate-fadeIn font-['Inter',_Poppins,_sans-serif] text-cyan-100/95 drop-shadow-lg">
                    Turn learning into a game. Join quizzes, earn points, climb the leaderboard, and win real rewards. Compete with friends and classmates in a vibrant, fun community!
                  </p>
                  <div className="flex flex-col md:flex-row justify-center gap-4 max-w-md mx-auto animate-fadeIn mt-2">
                    {!user && (
                      <>
                        <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="lg" 
                              className="bg-cyan-500 text-white font-bold text-lg px-8 py-3 rounded-full shadow-cyan-glow hover:bg-cyan-600 hover:scale-105 transition-transform flex items-center gap-2"
                            >
                              <Star className="w-6 h-6 mr-1 animate-bounce" />
                              Join the Competition
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-transparent border-0 max-w-full p-0 flex items-center justify-center">
                            <DialogTitle className="sr-only">Sign up</DialogTitle>
                            <DialogDescription className="sr-only">Create your account to access quizzes and rewards.</DialogDescription>
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" aria-hidden="true"></div>
                            <div className="relative z-50 w-full flex items-center justify-center min-h-screen">
                              <SignupModal onSuccess={() => setSignupOpen(false)} />
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="lg" 
                              variant="outline" 
                              className="border-cyan-400 text-cyan-200 hover:bg-cyan-900/30 hover:text-white text-lg px-8 py-3 rounded-full shadow-cyan-glow"
                            >
                              Log in
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-transparent border-0 max-w-full p-0 flex items-center justify-center">
                            <DialogTitle className="sr-only">Log in</DialogTitle>
                            <DialogDescription className="sr-only">Sign in to your account to join quizzes and track your progress.</DialogDescription>
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" aria-hidden="true"></div>
                            <div className="relative z-50 w-full flex items-center justify-center min-h-screen">
                              <LoginModal onSuccess={() => setLoginOpen(false)} showLoading={showLoading} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* HOW IT WORKS SECTION */}
              <section className="py-16 md:py-20 relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30 blur-xl" />
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl animate-pulse-slow" />
                  <div className="absolute top-2/3 right-1/4 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl animate-pulse-slow delay-200" />
                  <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-blue-400/30 rounded-full blur-2xl animate-pulse-slow delay-400" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                  <h2 className="text-4xl font-bold text-center mb-14 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-cyan-glow animate-fadeIn font-['Orbitron',_sans-serif]">How It Works</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {/* Step 1 */}
                    <div className="bg-gradient-to-br from-cyan-900/90 to-blue-900/90 rounded-3xl p-8 flex flex-col items-center justify-between min-h-[320px] text-center border-4 border-cyan-400/60 shadow-none backdrop-blur-md hover:scale-[1.03] transition-transform duration-300 animate-slideUp delay-100">
                      <div className="w-16 h-16 bg-cyan-700/40 rounded-full flex items-center justify-center mb-5 animate-bounce">
                        <Sparkles className="h-9 w-9 text-cyan-200" />
                      </div>
                      <h3 className="text-2xl font-extrabold mb-2 text-cyan-100 font-['Orbitron',_sans-serif]">Join or Create Quizzes</h3>
                      <p className="text-cyan-100 text-base font-semibold">Teachers create fun quizzes. Students join with a code and compete live!</p>
                    </div>
                    {/* Step 2 */}
                    <div className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 rounded-3xl p-8 flex flex-col items-center justify-between min-h-[320px] text-center border-4 border-cyan-400/60 shadow-none backdrop-blur-md hover:scale-[1.03] transition-transform duration-300 animate-slideUp delay-200">
                      <div className="w-16 h-16 bg-blue-700/40 rounded-full flex items-center justify-center mb-5 animate-bounce">
                        <Trophy className="h-9 w-9 text-yellow-200" />
                      </div>
                      <h3 className="text-2xl font-extrabold mb-2 text-blue-100 font-['Orbitron',_sans-serif]">Compete & Earn Points</h3>
                      <p className="text-blue-100 text-base font-semibold">Answer questions, climb the leaderboard, and earn points for every correct answer.</p>
                    </div>
                    {/* Step 3 */}
                    <div className="bg-gradient-to-br from-teal-900/90 to-cyan-900/90 rounded-3xl p-8 flex flex-col items-center justify-between min-h-[320px] text-center border-4 border-cyan-400/60 shadow-none backdrop-blur-md hover:scale-[1.03] transition-transform duration-300 animate-slideUp delay-300">
                      <div className="w-16 h-16 bg-teal-700/40 rounded-full flex items-center justify-center mb-5 animate-bounce">
                        <Gift className="h-9 w-9 text-teal-200" />
                      </div>
                      <h3 className="text-2xl font-extrabold mb-2 text-teal-100 font-['Orbitron',_sans-serif]">Redeem Rewards</h3>
                      <p className="text-teal-100 text-base font-semibold">Use your points to unlock real rewards and prizes in the shop!</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* LIVE LEADERBOARD PREVIEW */}
              <section className="py-12 md:py-16 relative">
                {/* Plure glassy animated background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30 blur-xl" />
                  {/* Animated floating shapes */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl animate-pulse-slow" />
                  <div className="absolute top-2/3 right-1/4 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl animate-pulse-slow delay-200" />
                  <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-blue-400/30 rounded-full blur-2xl animate-pulse-slow delay-400" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-6 flex flex-col items-center">
                      <span className="inline-flex items-center gap-2 text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-cyan-glow animate-fadeIn font-['Orbitron',_sans-serif]">
                        <Trophy className="w-8 h-8 text-yellow-300 animate-bounce mr-2" />
                        Live Leaderboard
                      </span>
                      <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full mt-2 animate-pulse" />
                    </div>
                    <div className="relative max-w-2xl w-full mx-auto rounded-3xl bg-gradient-to-br from-cyan-900/80 to-blue-900/80 border-4 border-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 p-8 flex flex-col gap-4 shadow-2xl backdrop-blur-2xl animate-fadeIn" style={{ boxShadow: '0 0 48px 8px #a5b4fc55, 0 2px 32px 0 #818cf899' }}>
                      {/* Leaderboard entries */}
                      <div className="flex flex-col gap-4 max-h-80 overflow-y-auto animate-scroll-leaderboard custom-scrollbar relative">
                        {[{name:'Alex',points:320,icon:'🧑‍🎓',color:'bg-cyan-500'},{name:'Sam',points:290,icon:'👩‍🏫',color:'bg-blue-500'},{name:'Maya',points:260,icon:'🧑‍💻',color:'bg-purple-500'},{name:'Liam',points:220,icon:'🧑‍🔬',color:'bg-yellow-400'},{name:'Zoe',points:200,icon:'🧑‍🎤',color:'bg-pink-500'}].map((u,i)=>{
                          const percent = Math.max(20, Math.round((u.points/320)*100));
                          return (
                            <div key={u.name} className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl ${u.color} bg-opacity-30 group transition-all duration-200 hover:bg-opacity-50 shadow-cyan-glow`}> 
                              <span className="text-3xl drop-shadow-lg animate-bounce-slow">{u.icon}</span>
                              <span className="font-extrabold text-lg md:text-2xl text-white flex-1 truncate font-['Orbitron',_sans-serif]">{u.name}</span>
                              <span className="font-mono text-cyan-100 text-xl md:text-2xl font-bold">{u.points} pts</span>
                              {i===0 && <span className="absolute -left-8 top-1/2 -translate-y-1/2"><Trophy className="w-8 h-8 text-yellow-300 drop-shadow animate-bounce" /></span>}
                              {/* Animated point bar */}
                              <div className="absolute left-0 bottom-2 w-full h-2 rounded-full bg-cyan-900/40 overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r from-yellow-300 via-cyan-400 to-purple-400 animate-growBar`} style={{width: percent + '%', minWidth: '18%'}} />
                              </div>
                            </div>
                          )
                        })}
                        {/* Add glassy fade overlays for top/bottom */}
                        <div className="pointer-events-none absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-cyan-900/80 via-transparent to-transparent z-10 rounded-t-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent z-10 rounded-b-3xl" />
                      </div>
                      <div className="text-center text-cyan-100 mt-4 text-lg font-semibold flex items-center justify-center gap-2 animate-bounce">
                        <span>See your name here?</span>
                        <span className="inline-block animate-bounce"><Star className="w-6 h-6 text-yellow-300" /></span>
                        <span className="font-bold text-cyan-200">Start competing!</span>
                      </div>
                    </div>
                  </div>
                  <style>{`
                    @keyframes scroll-leaderboard { 0%{transform:translateY(0);} 100%{transform:translateY(-10px);} }
                    .animate-scroll-leaderboard{animation:scroll-leaderboard 8s ease-in-out infinite alternate;}
                    @keyframes growBar { 0%{width:0;} 100%{width:var(--bar-width);} }
                    .animate-growBar{animation:growBar 1.2s cubic-bezier(.4,2,.6,1) 1;}
                    @keyframes pulse-slow { 0%,100%{opacity:0.7;} 50%{opacity:1;} }
                    .animate-pulse-slow{animation:pulse-slow 6s ease-in-out infinite;}
                    .custom-scrollbar::-webkit-scrollbar { width: 10px; background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #22d3ee 40%, #2563eb 100%); border-radius: 8px; }
                    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #22d3ee #0f172a; }
                  `}</style>
                </div>
              </section>

              {/* TESTIMONIALS SECTION */}
              <section className="py-14 md:py-20 relative">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30 blur-xl" />
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl animate-pulse-slow" />
                  <div className="absolute top-2/3 right-1/4 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl animate-pulse-slow delay-200" />
                  <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-blue-400/30 rounded-full blur-2xl animate-pulse-slow delay-400" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                  <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-cyan-glow animate-fadeIn font-['Orbitron',_sans-serif]">What Our Users Say</h2>
                  <div className="flex gap-6 md:gap-10 overflow-x-auto md:grid md:grid-cols-3 snap-x md:snap-none pb-4 md:pb-0 items-stretch">
                    {/* Teacher Testimonial */}
                    <div className="min-w-[280px] md:min-w-0 bg-gradient-to-br from-cyan-900/70 to-blue-900/70 rounded-2xl p-7 border border-cyan-700/30 snap-center animate-fadeIn delay-100 flex flex-col flex-1 justify-between min-h-[320px] h-[320px] md:h-full shadow-none">
                      <div className="flex items-center mb-4">
                        <div className="bg-cyan-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-cyan-glow mr-3">T</div>
                        <div>
                          <h4 className="font-semibold text-cyan-100 text-lg">Emily Rodriguez</h4>
                          <p className="text-xs text-cyan-200/80">Math Teacher</p>
                        </div>
                      </div>
                      <p className="text-cyan-100 text-base font-medium leading-relaxed flex-1 flex items-center justify-center"> <span className="inline-block mr-2 animate-bounce">💬</span>"Brain Boost transformed my classroom. Interactive quizzes keep my students engaged, and the point system motivates them to participate."</p>
                    </div>
                    {/* Student Testimonial */}
                    <div className="min-w-[280px] md:min-w-0 bg-gradient-to-br from-blue-900/70 to-cyan-900/70 rounded-2xl p-7 border border-blue-700/30 snap-center animate-fadeIn delay-200 flex flex-col flex-1 justify-between min-h-[320px] h-[320px] md:h-full shadow-none">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-cyan-glow mr-3">S</div>
                        <div>
                          <h4 className="font-semibold text-blue-100 text-lg">Alex Johnson</h4>
                          <p className="text-xs text-blue-200/80">High School Student</p>
                        </div>
                      </div>
                      <p className="text-blue-100 text-base font-medium leading-relaxed flex-1 flex items-center justify-center"> <span className="inline-block mr-2 animate-bounce">🎉</span>"I love competing in quizzes and earning points! The forum helps me when I'm stuck, and I've already redeemed points for cool prizes."</p>
                    </div>
                    {/* Admin Testimonial */}
                    <div className="min-w-[280px] md:min-w-0 bg-gradient-to-br from-teal-900/70 to-cyan-900/70 rounded-2xl p-7 border border-teal-700/30 snap-center animate-fadeIn delay-300 flex flex-col flex-1 justify-between min-h-[320px] h-[320px] md:h-full shadow-none">
                      <div className="flex items-center mb-4">
                        <div className="bg-teal-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-cyan-glow mr-3">A</div>
                        <div>
                          <h4 className="font-semibold text-teal-100 text-lg">Michael Thompson</h4>
                          <p className="text-xs text-teal-200/80">School Administrator</p>
                        </div>
                      </div>
                      <p className="text-teal-100 text-base font-medium leading-relaxed flex-1 flex items-center justify-center"> <span className="inline-block mr-2 animate-bounce">🏆</span>"As an admin, I appreciate how Brain Boost gives insights into student engagement and performance while making learning fun."</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA Footer Section */}
              {!user && (
                <section className="bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 border-t-2 border-cyan-400/30 backdrop-blur-2xl py-14 md:py-20 relative">
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-purple-900/30 blur-xl" />
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl animate-pulse-slow" />
                    <div className="absolute top-2/3 right-1/4 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl animate-pulse-slow delay-200" />
                    <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-blue-400/30 rounded-full blur-2xl animate-pulse-slow delay-400" />
                  </div>
                  <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-4 md:mb-6 drop-shadow-cyan-glow animate-fadeIn flex items-center justify-center gap-3 font-['Orbitron',_sans-serif]">
                      Are You Ready to Compete, Learn, and Win?
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="#facc15"/></svg>
                    </h2>
                    <p className="text-white/90 max-w-2xl mx-auto mb-6 md:mb-8 text-lg animate-fadeIn font-['Orbitron',_sans-serif]">
                      Join Brain Boost today and experience the thrill of learning through competition. Sign up for free and start your journey to the top of the leaderboard!
                    </p>
                    <Button
                      size="lg"
                      className="mx-auto w-full max-w-xs bg-white text-cyan-500 hover:bg-gray-100 px-10 py-4 font-bold text-xl rounded-full shadow-cyan-glow animate-bounce-slow flex items-center justify-center gap-2 transition-all duration-200"
                      onClick={() => setSignupOpen(true)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block mr-2"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="#facc15"/></svg>
                      Start Competing
                    </Button>
                  </div>
                </section>
              )}
            </main>
            <footer className="w-full bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 border-t-2 border-cyan-400/30 backdrop-blur-2xl py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-6 mt-12 shadow-cyan-glow">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-['Orbitron',_sans-serif] drop-shadow-cyan-glow">Brain Boost</span>
                <span className="text-cyan-200 text-lg font-semibold">|</span>
                <span className="text-cyan-100 text-base font-medium">Gamify your learning journey</span>
              </div>
              <div className="flex items-center gap-5">
                <a href="#" className="text-cyan-300 hover:text-purple-400 transition drop-shadow-cyan-glow" aria-label="Twitter"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 12 9.482c0 .352.04.695.116 1.022C8.728 10.36 5.7 8.7 3.671 6.149a4.48 4.48 0 0 0-.607 2.256c0 1.557.793 2.933 2.002 3.74a4.48 4.48 0 0 1-2.03-.561v.057a4.48 4.48 0 0 0 3.6 4.393 4.48 4.48 0 0 1-2.025.077 4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.07a12.7 12.7 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583A9.14 9.14 0 0 0 24 4.59a8.94 8.94 0 0 1-2.58.708z" fill="currentColor"/></svg></a>
                <a href="#" className="text-cyan-300 hover:text-purple-400 transition drop-shadow-cyan-glow" aria-label="Instagram"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg></a>
                <a href="#" className="text-cyan-300 hover:text-purple-400 transition drop-shadow-cyan-glow" aria-label="Discord"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.2a.112.112 0 0 0-.12.056c-.523.927-1.104 2.13-1.513 3.084a18.36 18.36 0 0 0-5.504 0c-.41-.954-.99-2.157-1.513-3.084a.112.112 0 0 0-.12-.056A19.791 19.791 0 0 0 3.683 4.369a.105.105 0 0 0-.047.043C1.605 7.362.322 10.274.076 13.246a.115.115 0 0 0 .042.09c2.104 1.547 4.144 2.488 6.163 3.11a.112.112 0 0 0 .123-.042c.474-.65.895-1.34 1.255-2.066a.112.112 0 0 0-.062-.155c-.672-.254-1.31-.563-1.917-.927a.112.112 0 0 1-.011-.186c.129-.098.258-.197.382-.297a.112.112 0 0 1 .114-.013c4.016 1.84 8.36 1.84 12.344 0a.112.112 0 0 1 .115.012c.124.1.253.199.382.297a.112.112 0 0 1-.011.186c-.607.364-1.245.673-1.917.927a.112.112 0 0 0-.062.155c.36.726.78 1.416 1.255 2.066a.112.112 0 0 0 .123.042c2.02-.622 4.06-1.563 6.163-3.11a.115.115 0 0 0 .042-.09c-.246-2.972-1.529-5.884-3.56-8.834a.105.105 0 0 0-.047-.043zM8.02 15.331c-1.01 0-1.84-.924-1.84-2.06 0-1.137.818-2.06 1.84-2.06 1.025 0 1.85.93 1.84 2.06 0 1.136-.818 2.06-1.84 2.06zm7.96 0c-1.01 0-1.84-.924-1.84-2.06 0-1.137.818-2.06 1.84-2.06 1.025 0 1.85.93 1.84 2.06 0 1.136-.818 2.06-1.84 2.06z" fill="currentColor"/></svg></a>
              </div>
              <div className="text-cyan-400 text-xs mt-2 md:mt-0">© {new Date().getFullYear()} Brain Boost. All rights reserved.</div>
            </footer>
          </>
        )}
      </div>
    </>
  );
};

export default Index;
