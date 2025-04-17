
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center pt-12 text-center">
        <h1 className="text-9xl font-bold ghost-gradient bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-bold mt-6 mb-2">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sportsbook">Browse Sportsbook</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;
