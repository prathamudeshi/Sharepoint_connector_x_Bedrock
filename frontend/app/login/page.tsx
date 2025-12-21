"use client";

import React, { useState } from 'react';
import api from '@/lib/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMsLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const redirectUri = window.location.origin + '/auth/callback';
      const res = await api.get(`/auth/ms-url/?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (res.data.url) {
          window.location.href = res.data.url;
      } else {
          setError("Failed to get login URL.");
      }
    } catch (err) {
      setError("Failed to initialize login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your SharePoint files</p>
        </div>
        
        {error && <div className="text-red-500">{error}</div>}

        <button
          onClick={handleMsLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#2F2F2F] hover:bg-black md:py-4 md:text-lg md:px-10 transition-colors"
        >
          {loading ? 'Redirecting...' : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#F25022" d="M1 1H10V10H1V1Z"/>
                    <path fill="#7FBA00" d="M12 1H21V10H12V1Z"/>
                    <path fill="#00A4EF" d="M1 12H10V21H1V12Z"/>
                    <path fill="#FFB900" d="M12 12H21V21H12V12Z"/>
                </svg>
                Sign in with Microsoft
            </>
          )}
        </button>
      </div>
    </div>
  );
}
