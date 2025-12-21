"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
        router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
        fetchCredentials();
    }
  }, [isAuthenticated]);

  const fetchCredentials = async () => {
    try {
      const res = await api.get('/auth/credentials/');
      setClientId(res.data.client_id || '');
      setClientSecret(res.data.client_secret || '');
      setTenantId(res.data.tenant_id || '');
    } catch {
      // Ignore 404
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/auth/credentials/', {
        client_id: clientId,
        client_secret: clientSecret,
        tenant_id: tenantId
      });
      setMessage('Credentials saved successfully!');
    } catch {
      setMessage('Failed to save credentials.');
    }
  };

  if (authLoading || (!isAuthenticated && loading)) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">SharePoint Settings</h1>
          <p className="mb-4 text-gray-600">Enter your App Registration credentials here to access your SharePoint.</p>
          
          {message && (
            <div className={`p-4 rounded mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Client Secret</label>
                <input
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  required
                />
            </div>
            <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Credentials
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
