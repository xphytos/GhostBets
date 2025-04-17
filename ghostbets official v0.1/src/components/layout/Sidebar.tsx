import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Target, 
  Calendar, 
  ShoppingBag, 
  Settings, 
  LogIn,
  ClipboardList,
  Radio,
  Gift,
  Crown,
  Dices,
  Users,
  HelpCircle,
  X,
  Menu,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, onClick }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active 
          ? "bg-accent text-accent-foreground" 
          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const closeSidebarIfMobile = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 pt-16 flex flex-col bg-sidebar border-r border-border transition-all duration-300",
          open ? "w-64" : "w-16"
        )}
      >
        {/* Desktop Minimize Button - Moved higher up */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-14 w-8 h-8 rounded-full border shadow-md bg-background hidden md:flex"
            onClick={() => setOpen(!open)}
          >
            {open ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </Button>
        )}

        {/* Mobile Close Button */}
        <div className="px-3 py-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto py-4 px-3">
          <div className="space-y-1">
            <NavItem
              to="/"
              icon={Home}
              label={open ? "Home" : ""}
              active={location.pathname === '/'}
              onClick={closeSidebarIfMobile}
            />
            <NavItem
              to="/sportsbook"
              icon={ClipboardList}
              label={open ? "Sportsbook" : ""}
              active={location.pathname === '/sportsbook'}
              onClick={closeSidebarIfMobile}
            />
            <NavItem
              to="/leagues"
              icon={Trophy}
              label={open ? "Leagues" : ""}
              active={location.pathname === '/leagues'}
              onClick={closeSidebarIfMobile}
            />
            <NavItem
              to="/pick6"
              icon={Target}
              label={open ? "Pick 6" : ""}
              active={location.pathname === '/pick6'}
              onClick={closeSidebarIfMobile}
            />
            <NavItem
              to="/events"
              icon={Calendar}
              label={open ? "Events" : ""}
              active={location.pathname === '/events'}
              onClick={closeSidebarIfMobile}
            />
            <NavItem
              to="/live"
              icon={Radio}
              label={open ? "Live In-Game" : ""}
              active={location.pathname === '/live'}
              onClick={closeSidebarIfMobile}
            />
          </div>
          
          <div className="mt-6 pt-6 border-t border-border/60">
            {open && (
              <h3 className="px-3 mb-2 text-xs uppercase text-muted-foreground">
                Account
              </h3>
            )}
            <div className="space-y-1">
              <NavItem
                to="/my-bets"
                icon={ClipboardList}
                label={open ? "My Bets" : ""}
                active={location.pathname === '/my-bets'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/rewards"
                icon={Gift}
                label={open ? "Daily Rewards" : ""}
                active={location.pathname === '/rewards'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/vip"
                icon={Crown}
                label={open ? "VIP" : ""}
                active={location.pathname === '/vip'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/casino"
                icon={Dices}
                label={open ? "Casino" : ""}
                active={location.pathname === '/casino'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/social"
                icon={Users}
                label={open ? "Social" : ""}
                active={location.pathname === '/social'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/shop"
                icon={ShoppingBag}
                label={open ? "Shop" : ""}
                active={location.pathname === '/shop'}
                onClick={closeSidebarIfMobile}
              />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border/60">
            <div className="space-y-1">
              <NavItem
                to="/how-to-bet"
                icon={HelpCircle}
                label={open ? "How to Bet" : ""}
                active={location.pathname === '/how-to-bet'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/settings"
                icon={Settings}
                label={open ? "Settings" : ""}
                active={location.pathname === '/settings'}
                onClick={closeSidebarIfMobile}
              />
              <NavItem
                to="/login"
                icon={LogIn}
                label={open ? "Login" : ""}
                active={location.pathname === '/login'}
                onClick={closeSidebarIfMobile}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
