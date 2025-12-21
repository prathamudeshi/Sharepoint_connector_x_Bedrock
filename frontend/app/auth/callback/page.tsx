"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Authenticating with Microsoft...');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
        handleAuth(code);
    } else {
        setError('No authorization code found.');
    }
  }, [searchParams]);

  const handleAuth = async (code: string) => {
    try {
        const redirectUri = window.location.origin + '/auth/callback';
        const res = await api.post('/auth/callback/', {
            code: code,
            redirect_uri: redirectUri
        });
        
        login(res.data.token, res.data.username);
    } catch (err: any) {
        setStatus('');
        setError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  if (error) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
              <div className="text-red-600 text-xl font-bold mb-4">Login Failed</div>
              <p className="text-gray-700">{error}</p>
              <button onClick={() => router.push('/login')} className="mt-4 text-indigo-600 hover:underline">Return to Login</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl font-semibold text-gray-700 animate-pulse">
        {status}
      </div>
    </div>
  );
}
