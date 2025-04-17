
import React from 'react';
import { Link } from 'react-router-dom';

interface ComingSoonPageProps {
  title: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4 ghost-gradient bg-clip-text text-transparent">{title}</h1>
      <p className="text-xl mb-8 text-center">This feature is coming soon!</p>
      <Link to="/" className="text-accent hover:text-accent-foreground underline">
        Return to Home
      </Link>
    </div>
  );
};

export default ComingSoonPage;
