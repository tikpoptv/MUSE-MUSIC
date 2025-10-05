'use client';

import { ReactNode } from 'react';

interface SetupLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
}

export default function SetupLayout({ children, isLoading = false }: SetupLayoutProps) {
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden" 
        style={{ 
          backgroundImage: 'url(/login-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff'
        }}
      >
        <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
          boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '480px',
          height: '700px'
        }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading setup status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/login-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
        boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '480px',
        height: '700px'
      }}>
        {children}
      </div>
    </div>
  );
}
