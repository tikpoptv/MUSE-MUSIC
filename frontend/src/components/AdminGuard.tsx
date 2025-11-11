'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

interface AdminGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AdminGuard({ 
  children, 
  redirectTo = '/'
}: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!authService.isAuthenticated()) {
        toast.error('Please login first');
        router.push('/login');
        setIsLoading(false);
        return;
      }

      try {
        const isAdmin = await authService.checkAdminStatus();

        if (!isAdmin) {
          toast.error('You do not have permission to access this page');
          router.push(redirectTo);
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch {
        toast.error('Failed to verify admin status');
        router.push(redirectTo);
        setIsLoading(false);
      }
    };

    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

