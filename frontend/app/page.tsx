"use client";

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import Sidebar, { FileItem } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading || !isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex flex-col h-screen bg-white text-gray-900 overflow-hidden font-sans">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onFileSelect={setSelectedFiles}
      />
      <ChatInterface 
        selectedFiles={selectedFiles}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      </div>
    </main>
  );
}
