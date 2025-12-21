"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Database } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { username, logout } = useAuth();

  return (
    <nav className="bg-white shadow z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">SharePoint Connector</span>
            </Link>
            {onToggleSidebar && (
                <button 
                  onClick={onToggleSidebar}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition border border-blue-200"
                >
                    <Database size={18} />
                    <span className="text-sm font-medium">My Files</span>
                </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-gray-700">{username}</span>
             <button
               onClick={logout}
               className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
             >
               Logout
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
