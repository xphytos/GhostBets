
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  DollarSign, 
  Activity, 
  Users, 
  ArrowRight,
  Star
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  const handleSignupClick = () => {
    navigate('/login?tab=register');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <div className="flex items-center">
            <span className="text-xl font-bold ghost-gradient bg-clip-text text-transparent">
              GhostBets
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLoginClick}>Log in</Button>
            <Button onClick={handleSignupClick}>Sign up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold ghost-gradient bg-clip-text text-transparent">
                The Future of Fantasy Betting is Here
              </h1>
              <p className="text-xl text-muted-foreground">
                GhostBets offers a revolutionary platform for sports enthusiasts to test their knowledge, make predictions, and win big.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={handleSignupClick}>
                  Create Free Account <ArrowRight className="ml-2" size={18} />
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/how-to-bet')}>
                  Learn How It Works
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-30 blur"></div>
              <div className="relative ghost-card p-6 aspect-square max-w-md mx-auto flex items-center justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="GhostBets Platform Preview" 
                  className="rounded-md max-w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose GhostBets?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform offers a unique blend of fantasy sports and betting, giving you the ultimate control over your experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Trophy} 
              title="Competitive Leagues" 
              description="Join private or public leagues and compete against friends or the world."
            />
            <FeatureCard 
              icon={Activity} 
              title="Live Updates" 
              description="Get real-time scores and betting odds updates as games progress."
            />
            <FeatureCard 
              icon={DollarSign} 
              title="Daily Rewards" 
              description="Earn free betting credits just by logging in daily and participating."
            />
            <FeatureCard 
              icon={Users} 
              title="Community" 
              description="Connect with other bettors, share strategies, and learn from the best."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our community of bettors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="GhostBets completely changed how I enjoy sports. The platform is intuitive and the community is amazing."
              name="Alex Johnson"
              title="Sports Enthusiast"
            />
            <TestimonialCard 
              quote="I've tried other fantasy betting sites, but nothing compares to the real-time updates and user experience of GhostBets."
              name="Sarah Thompson"
              title="Fantasy League Champion"
            />
            <TestimonialCard 
              quote="The daily rewards keep me coming back, and I've actually learned a lot about smart betting from the community guides."
              name="Michael Chen"
              title="Casual Bettor"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Future of Betting?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your free account today and receive 500 bonus credits to start your betting journey.
          </p>
          <Button size="lg" className="px-8" onClick={handleSignupClick}>
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold ghost-gradient bg-clip-text text-transparent">
                GhostBets
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                © 2024 GhostBets. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-background border border-border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const TestimonialCard = ({ quote, name, title }) => {
  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex text-amber-400 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <p className="italic mb-4">"{quote}"</p>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

export default LandingPage;
