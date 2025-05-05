import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { ShoppingBag, Gift, User, Loader2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/integrations/supabase/client';

const ShopPage = () => {
  const { profile, loading } = useAuth();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [expandedDesc, setExpandedDesc] = useState<{ [key: string]: boolean }>({});
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError('');
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) setProductsError('Failed to load products');
      else setProducts(data || []);
      setProductsLoading(false);
    };
    fetchProducts();
  }, []);

  // Helper for pagination numbers with ellipsis
  function getPagination(current: number, total: number) {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift('...');
    if (current + delta < total - 1) range.push('...');
    range.unshift(1);
    if (total > 1) range.push(total);
    return Array.from(new Set(range));
  }

  // Scroll to cards on page change
  useEffect(() => {
    if (cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  if (loading || productsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 text-white">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <span className="text-lg font-semibold animate-pulse">Loading...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 text-white">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-gradient-to-br from-cyan-900/80 via-blue-900/80 to-purple-900/80 border-2 border-cyan-400/30 rounded-2xl shadow-cyan-glow p-10 text-center max-w-md mx-auto backdrop-blur-2xl">
            <Gift className="mx-auto mb-4 h-10 w-10 text-cyan-300" />
            <h2 className="text-2xl font-bold mb-4 text-cyan-100">Error Loading Products</h2>
            <p className="text-cyan-100/80 text-base mb-2">{productsError}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile || profile.role !== 'student') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 text-white">
        <Navigation />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-gradient-to-br from-cyan-900/80 via-blue-900/80 to-purple-900/80 border-2 border-cyan-400/30 rounded-2xl shadow-cyan-glow p-10 text-center max-w-md mx-auto backdrop-blur-2xl">
            <Gift className="mx-auto mb-4 h-10 w-10 text-cyan-300" />
            <h2 className="text-2xl font-bold mb-4 text-cyan-100">Shop Access Restricted</h2>
            <p className="text-cyan-100/80 text-base mb-2">Only students can access the rewards shop.</p>
            <p className="text-cyan-100/60 text-sm">If you are a student, please log in with your student account.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePurchase = async (item: any) => {
    if (profile.points < item.points_required) {
      toast({
        title: 'Not enough points',
        description: `You need ${item.points_required - profile.points} more points to purchase this item.`,
        variant: 'destructive',
      });
      return;
    }

    setPurchaseLoading(true);
    try {
      // Start a transaction to ensure both operations succeed or fail together
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: profile.id,
          product_id: item.id,
          points_spent: item.points_required
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Update user's points
      const newPoints = profile.points - item.points_required;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // First close the popup
      setSelectedItem(null);
      setPurchaseLoading(false);

      // Then update local state
      profile.points = newPoints;

      // Finally show success message
      setTimeout(() => {
        toast({
          variant: "success",
          title: "🎉 Purchase Complete!",
          description: `Successfully purchased ${item.name} for ${item.points_required} points. Your new balance: ${newPoints} points`,
        });
      }, 100);

    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseLoading(false);
    toast({
        variant: "destructive",
        title: 'Purchase Failed',
        description: 'There was an error processing your purchase. Please try again.',
    });
    }
  };

  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Cool, dark, gaming-inspired background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Animated dark blue/cyan gradient background */}
        <div className="absolute inset-0 w-full h-full animate-gaming-gradient bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900 via-blue-950 to-gray-950 opacity-95" />
        {/* Glowing animated SVG blobs (blue/cyan only) */}
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <circle cx="400" cy="350" r="180" fill="url(#gaming-grad1)" className="animate-blob1 blur-3xl opacity-40" />
          <circle cx="1500" cy="250" r="140" fill="url(#gaming-grad2)" className="animate-blob2 blur-2xl opacity-30" />
          <circle cx="1000" cy="900" r="120" fill="url(#gaming-grad3)" className="animate-blob3 blur-2xl opacity-20" />
          <defs>
            <radialGradient id="gaming-grad1" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
              <stop stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#0a1626" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gaming-grad2" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gaming-grad3" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0a1626" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        {/* Subtle animated grid/circuit overlay (blue/cyan) */}
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none">
          <g className="animate-gridwave" style={{ opacity: 0.07 }}>
            {[...Array(32)].map((_, i) => (
              <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="1080" stroke="#38bdf8" strokeWidth="0.5" />
            ))}
            {[...Array(19)].map((_, i) => (
              <line key={i} x1="0" y1={i * 60} x2="1920" y2={i * 60} stroke="#0ea5e9" strokeWidth="0.5" />
            ))}
          </g>
          <style>{`
            @keyframes gaming-gradient {
              0%,100%{background-position:0% 50%}
              50%{background-position:100% 50%}
            }
            .animate-gaming-gradient{
              background-size:200% 200%;
              animation:gaming-gradient 16s ease-in-out infinite;
            }
            @keyframes gridwave { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
            .animate-gridwave{animation:gridwave 16s ease-in-out infinite;}
            @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(40px,20px) scale(1.08);} 66%{transform:translate(-30px,-15px) scale(0.95);} }
            @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-50px,30px) scale(1.05);} 66%{transform:translate(60px,-20px) scale(0.93);} }
            @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-40px) scale(1.06);} 66%{transform:translate(-45px,25px) scale(0.94);} }
            .animate-blob1{animation:blob1 18s ease-in-out infinite;}
            .animate-blob2{animation:blob2 22s ease-in-out infinite;}
            .animate-blob3{animation:blob3 20s ease-in-out infinite;}
          `}</style>
        </svg>
      </div>
      <div className="relative z-20 flex flex-col min-h-screen bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-purple-900/80 text-white">
      <Navigation />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-2 max-w-6xl">
          {/* Header: Shop Title (left) and User Profile (right) */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-10 md:mb-14 gap-6 md:gap-4 w-full">
            {/* Left: Shop Title and Subtitle */}
            <div className="flex-1 flex flex-col items-center md:items-start justify-center w-full">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-200 bg-clip-text text-transparent relative tracking-tight text-center md:text-left w-full">
                Rewards Shop
                <span className="block h-1 w-24 sm:w-32 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-300 rounded-full mt-2 sm:mt-3 absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 -bottom-3 sm:-bottom-4" />
              </h1>
              <p className="text-cyan-100/90 text-lg sm:text-xl md:text-2xl font-medium mb-1 text-center md:text-left w-full">Redeem your points for exclusive rewards!</p>
            </div>
            {/* Right: User Profile */}
            <div className="flex items-center gap-3 sm:gap-4 bg-cyan-900/60 rounded-3xl px-4 py-4 sm:px-8 sm:py-6 border-2 border-cyan-400/40 backdrop-blur-2xl relative overflow-hidden w-full max-w-xs md:max-w-none md:w-auto md:ml-6" style={{ boxShadow: 'none' }}>
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-cyan-400/10 rounded-full blur-2xl" />
              {/* Avatar with gradient border */}
              <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 p-0.5 sm:p-1 rounded-full">
                <Avatar className="h-14 w-14 sm:h-20 sm:w-20 bg-gradient-to-br from-cyan-950 via-blue-950 to-purple-950 border-2 border-cyan-400">
                  <AvatarFallback className="bg-gradient-to-tr from-cyan-700 via-blue-900 to-purple-900 text-cyan-200 text-2xl sm:text-3xl font-extrabold flex items-center justify-center">
                    {profile.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
              </Avatar>
              </div>
              <div className="flex flex-col items-end md:items-end">
                <div className="text-lg sm:text-xl font-bold text-cyan-100 mb-1 tracking-wide text-right">{profile.username}</div>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">{profile.points}</span>
                  <span className="text-cyan-200 font-semibold text-sm sm:text-base">points</span>
                </div>
              </div>
            </div>
          </div>
          {/* Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12 justify-center py-2" ref={cardsRef}>
            {paginatedProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">No products available.</div>
            ) : (
              paginatedProducts.map((item) => {
                return (
                <Card
                  key={item.id}
                    className="relative group overflow-hidden rounded-3xl w-[340px] h-[350px] mx-auto flex flex-col p-0 border-2 border-transparent bg-gradient-to-br from-cyan-900/80 via-blue-900/80 to-purple-900/80 backdrop-blur-xl transition-transform duration-300 hover:scale-105 hover:border-[3px] hover:border-cyan-400/80"
                    style={{ boxShadow: 'none', background: 'rgba(12, 24, 36, 0.65)' }}
                >
                    {/* Image Area with Points Badge Overlay */}
                    <div className="relative w-full h-[170px] bg-cyan-950 flex items-center justify-center overflow-hidden rounded-t-3xl">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                          className="w-full h-full object-cover object-center"
                          style={{ minHeight: '170px', maxHeight: '170px' }}
                      />
                    ) : (
                      <ShoppingBag className="h-16 w-16 text-cyan-400" />
                    )}
                      {/* Points Badge - floating glassy */}
                      <div className="absolute top-4 right-4 z-20">
                        <span className="backdrop-blur-md bg-gradient-to-r from-cyan-200/90 via-blue-200/80 to-cyan-100/90 text-cyan-900 font-bold px-4 py-2 rounded-full text-lg border border-cyan-300 shadow-none" style={{ boxShadow: 'none' }}>
                          {item.points_required} pts
                        </span>
                  </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between px-6 py-4">
                      <div>
                        <div className="text-xl font-bold text-cyan-100 mb-1 truncate" title={item.name}>{item.name}</div>
                        <p
                          className="text-gray-200 text-base font-medium line-clamp-2"
                          style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '2.8em' }}
                          title={item.description}
                        >
                      {item.description}
                    </p>
                      </div>
                    {item.stock !== undefined && (
                      <div className="mt-2 text-xs text-cyan-400">
                        Stock: {typeof item.stock === 'number' ? `${item.stock} left` : item.stock}
                      </div>
                    )}
                      <div className="mt-5">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                              className="w-full text-base font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-400 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl py-3 transition-all duration-200"
                          variant={profile.points >= item.points_required ? 'default' : 'outline'}
                          disabled={profile.points < item.points_required}
                          onClick={() => setSelectedItem(item)}
                              style={{ boxShadow: 'none' }}
                        >
                          {profile.points >= item.points_required ? 'Redeem' : `Need ${item.points_required - profile.points} more points`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gradient-to-br from-cyan-900 via-blue-950 to-purple-900 border border-cyan-500/50 shadow-xl max-w-md w-full p-0 rounded-2xl overflow-hidden [&>button:first-child]:hidden">
                        {/* Accessibility: Hidden DialogTitle and Description */}
                        <DialogTitle className="sr-only">Purchase Confirmation</DialogTitle>
                        <DialogDescription className="sr-only">
                          Confirm your purchase of {item.name} for {item.points_required} points.
                        </DialogDescription>
                        {/* Product Image with Gradient Overlay */}
                        <div className="relative h-64 w-full">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-900/50 to-purple-900">
                              <ShoppingBag className="w-16 h-16 text-cyan-400/80" />
                            </div>
                          )}
                          {/* Dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                          {/* Product Title on Image */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-cyan">
                              {item.name}
                            </h2>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {/* Content Section */}
                        <div className="p-6 pt-4">
                          {/* Points Display */}
                          <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/20">
                                  <Gift className="w-5 h-5 text-cyan-300" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-cyan-200">Cost</p>
                                  <p className="text-xl font-bold text-white">{item.points_required} points</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-cyan-200">Your Balance</p>
                                <p className="text-xl font-bold text-white">{profile.points} points</p>
              </div>
              </div>
              </div>
                          {/* Confirmation Message */}
                          <p className="text-center text-gray-400 text-sm my-4">
                            Are you sure you want to purchase this item?
                          </p>
                          {/* Purchase Button */}
                          <Button
                            type="button"
                            onClick={() => handlePurchase(item)}
                            disabled={purchaseLoading || profile.points < item.points_required}
                            className={`w-full py-6 text-lg font-semibold ${
                              profile.points >= item.points_required
                                ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {purchaseLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                              </div>
                            ) : profile.points >= item.points_required ? (
                              'Confirm Purchase'
                            ) : (
                              'Insufficient Points'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                      </div>
                    </div>
                </Card>
                );
              })
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              <Button
                className="bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-600 text-white border-2 border-cyan-500 font-bold px-5 py-2 rounded-full hover:bg-cyan-800 focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 transition-all duration-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              {getPagination(page, totalPages).map((p, idx) =>
                p === '...'
                  ? <span key={idx} className="px-2 text-cyan-300">...</span>
                  : <Button
                      key={p}
                      className={`px-4 py-2 rounded-full font-bold border-2 border-cyan-400/60 transition-all duration-200 ${page === p ? 'bg-cyan-400 text-cyan-900' : 'bg-transparent text-cyan-200 hover:bg-cyan-700/30'}`}
                      onClick={() => setPage(Number(p))}
                      disabled={page === p}
                      variant="ghost"
                    >
                      {p}
                    </Button>
              )}
              <Button
                className="bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-600 text-white border-2 border-cyan-500 font-bold px-5 py-2 rounded-full hover:bg-cyan-800 focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 transition-all duration-200"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
          {/* How to Earn More Points */}
          <div className="bg-cyan-900/70 p-8 rounded-3xl border-2 border-cyan-700/60 mt-16 backdrop-blur-2xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-3 bg-gradient-to-br from-cyan-950/80 via-blue-950/80 to-purple-950/80 rounded-2xl p-6 border-2 border-cyan-700/40 backdrop-blur-xl hover:border-cyan-400/70 transition-all duration-300">
              <Gift className="h-8 w-8 text-cyan-300 mb-2" />
              <h3 className="font-bold text-cyan-100 mb-1 text-lg tracking-tight">Participate in Quizzes</h3>
              <p className="text-cyan-200/90 text-sm font-medium">Join quizzes and score well to earn points. Top performers get bonus points!</p>
              </div>
            <div className="flex flex-col items-center text-center gap-3 bg-gradient-to-br from-cyan-950/80 via-blue-950/80 to-purple-950/80 rounded-2xl p-6 border-2 border-cyan-700/40 backdrop-blur-xl hover:border-cyan-400/70 transition-all duration-300">
              <Gift className="h-8 w-8 text-cyan-300 mb-2" />
              <h3 className="font-bold text-cyan-100 mb-1 text-lg tracking-tight">Help Others in the Forum</h3>
              <p className="text-cyan-200/90 text-sm font-medium">Answer questions in the forum. Get points when your answers are marked helpful.</p>
              </div>
            <div className="flex flex-col items-center text-center gap-3 bg-gradient-to-br from-cyan-950/80 via-blue-950/80 to-purple-950/80 rounded-2xl p-6 border-2 border-cyan-700/40 backdrop-blur-xl hover:border-cyan-400/70 transition-all duration-300">
              <Gift className="h-8 w-8 text-cyan-300 mb-2" />
              <h3 className="font-bold text-cyan-100 mb-1 text-lg tracking-tight">Daily Login Streaks</h3>
              <p className="text-cyan-200/90 text-sm font-medium">Login daily to maintain your streak. Longer streaks mean more bonus points!</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default ShopPage;
