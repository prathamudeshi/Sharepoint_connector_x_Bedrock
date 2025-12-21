"use client";

import React, { useState } from 'react';
import api from '../lib/api';
import { FileText, Database, ChevronRight, ChevronLeft, Loader2, Folder, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FileItem {
  name: string;
  id: string;
  webUrl: string;
  type?: 'file' | 'folder';
  downloadUrl?: string; // Optional
}

interface SidebarProps {
  onFileSelect: (items: FileItem[]) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ onFileSelect, isOpen, toggleSidebar }: SidebarProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Store full objects
  const [selectedItems, setSelectedItems] = useState<FileItem[]>([]);
  
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<{id: string | null, name: string}[]>([]);

  const fetchFiles = async (folderId: string | null = null) => {
    setLoading(true);
    try {
      const url = folderId ? `/sharepoint/files?folder_id=${folderId}` : '/sharepoint/files';
      const res = await api.get(url);
      setFiles(res.data.files || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: FileItem) => {
      setFolderHistory([...folderHistory, { id: currentFolderId, name: folder.name }]); 
      setCurrentFolderId(folder.id);
      fetchFiles(folder.id);
  };

  const handleBack = () => {
      if (folderHistory.length === 0) return;
      const newHistory = [...folderHistory];
      const prev = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolderId(prev?.id || null);
      fetchFiles(prev?.id || null);
  };

  const handleSelect = (item: FileItem) => {
    let newSelected;
    const isSelected = selectedItems.some(f => f.id === item.id);
    
    if (isSelected) {
      newSelected = selectedItems.filter(f => f.id !== item.id);
    } else {
      newSelected = [...selectedItems, item];
    }
    setSelectedItems(newSelected);
    // Propagate to parent (we need to update the parent interface to accept objects ideally, 
    // but for now passing names might break things if we don't update parent.
    // Let's assume onFileSelect expects FileItem[] now, we will update types in next steps)
    onFileSelect(newSelected); 
  };

  return (
    <div className={clsx(
      "fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 z-10 flex flex-col",
      isOpen ? "w-80" : "w-0 overflow-hidden"
    )}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Database size={20} className="text-blue-600"/> SharePoint
        </h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* Navigation Controls */}
        <div className="flex gap-2 mb-4">
             {folderHistory.length > 0 && (
                 <button onClick={handleBack} className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                     <ArrowLeft size={16} />
                 </button>
             )}
            <button 
                onClick={() => fetchFiles(currentFolderId)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (folderHistory.length > 0 ? "Refesh Folder" : "Connect & List Files")}
            </button>
        </div>

        <div className="space-y-2">
          {files.map(item => {
            const isSelected = selectedItems.some(f => f.id === item.id);
            return (
            <div 
              key={item.id} 
              className={twMerge(
                "p-3 rounded-md border cursor-pointer hover:bg-gray-100 transition flex items-center gap-2",
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}
              onClick={() => item.type === 'folder' ? handleFolderClick(item) : handleSelect(item)}
            >
              {item.type === 'folder' ? (
                  <Folder size={16} className="text-yellow-500 fill-yellow-500" />
              ) : (
                  <FileText size={16} className="text-gray-500" />
              )}
              <span className="text-sm truncate flex-1 text-left">{item.name}</span>
              {item.type === 'folder' && <ChevronRight size={14} className="text-gray-400"/>}
            </div>
            );
          })}
          {!loading && files.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-8 px-4">
              <p className="font-medium mb-2">No files found.</p>
              <p>Please upload files to your <b>OneDrive for Business / My Files</b> folder to see them here.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        Selected: {selectedItems.length} files
      </div>
    </div>
  );
}
