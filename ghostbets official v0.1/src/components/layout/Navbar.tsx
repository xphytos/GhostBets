
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);

  // Fetch user balance
  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      return;
    }
    
    try {
      // Get user balance directly from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user balance:", error);
        return;
      }
      
      if (data) {
        // Ensure we're getting a number and not a string
        const balanceValue = typeof data.balance === 'number' 
          ? data.balance 
          : parseFloat(data.balance as any) || 0;
          
        console.log("Loaded user balance:", balanceValue, "type:", typeof balanceValue);
        setBalance(balanceValue);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Subscribe to changes in the profiles table to update balance in real-time
    if (user) {
      const channel = supabase
        .channel('profile-balance-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('Profile updated in Navbar:', payload);
            if (payload.new && (payload.new as any).balance !== undefined) {
              // Ensure we're getting a number and not a string
              const updatedBalance = typeof (payload.new as any).balance === 'number' 
                ? (payload.new as any).balance 
                : parseFloat((payload.new as any).balance as any) || 0;
                
              console.log("Updated balance from realtime:", updatedBalance);
              setBalance(updatedBalance);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section with logo and toggle */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen && isMobile ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold ghost-gradient bg-clip-text text-transparent">
              GhostBets
            </span>
          </Link>
        </div>
        
        {/* Right section with coins and user */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:block">
              <div className="ghost-card py-1 px-3 text-sm">
                <span className="text-muted-foreground">Coins:</span>{" "}
                <span className="font-medium text-success">{balance.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/my-bets">My Bets</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              {!user ? (
                <DropdownMenuItem asChild>
                  <Link to="/login">Login</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/rewards">Daily Rewards</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
