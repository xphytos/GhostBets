
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL
        const token = searchParams.get('token') || '';
        const type = searchParams.get('type') || '';
        
        if (!token || !type) {
          setStatus('error');
          setErrorMessage('Missing confirmation parameters');
          return;
        }

        // Process the confirmation
        if (type === 'email_change' || type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === 'signup' ? 'signup' : 'email_change',
          });

          if (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setErrorMessage(error.message);
          } else {
            setStatus('success');
          }
        } else {
          setStatus('error');
          setErrorMessage('Invalid confirmation type');
        }
      } catch (error) {
        console.error('Unexpected error during verification:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const goToLogin = () => {
    // Direct users to the landing page after login
    window.location.href = 'https://ghostbets.net/landing';
  };

  const goToHome = () => {
    // Direct users to the landing page after verification
    window.location.href = 'https://ghostbets.net/landing';
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-[380px] shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verifying your email</CardTitle>
            <CardDescription>Please wait while we verify your email address</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-[380px] shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
            <CardDescription>{errorMessage || 'There was a problem verifying your email'}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-4">
            <XCircle className="h-16 w-16 text-red-500" />
            <p className="text-center text-sm text-gray-500">
              The verification link may have expired or is invalid. Please try signing in or request a new verification email.
            </p>
            <Button onClick={goToLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
          <CardDescription>Your email has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 py-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <p className="text-center text-sm text-gray-500">
            Thank you for verifying your email address. You can now access all features of the application.
          </p>
          <Button onClick={goToHome} className="w-full">
            Continue to App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
