
import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import SidebarAd from '../ads/SidebarAd';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className={cn(
          "flex-1 overflow-auto p-4 md:p-6 pt-20 md:pt-24",
          sidebarOpen ? "md:ml-64" : "md:ml-16",
          "transition-[margin] duration-300"
        )}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {children}
            </div>
            
            {/* Sidebar ad - only visible on larger screens */}
            {!isMobile && (
              <div className="lg:w-64 hidden lg:block">
                <SidebarAd slot="1357924680" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
