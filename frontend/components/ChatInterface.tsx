"use client";

import React, { useState, useRef, useEffect } from 'react';
import api from '../lib/api';
import { Send, Upload, User, Bot, Paperclip, Database } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';

import { FileItem } from './Sidebar';

interface ChatInterfaceProps {
  selectedFiles: FileItem[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatInterface({ selectedFiles, isSidebarOpen, toggleSidebar }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Convert internal history format if needed, or send as is
      const res = await api.post('/message', {
        message: userMsg.content,
        history: messages,
        context_files: selectedFiles 
      });

      const botMsg: Message = { role: 'model', content: res.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: Message = { role: 'model', content: "Sorry, I encountered an error." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={clsx(
      "flex-1 flex flex-col h-screen transition-all duration-300",
      isSidebarOpen ? "ml-80" : "ml-0"
    )}>
      {/* Header */}
      <header className="h-16 border-b border-gray-200 flex items-center px-6 justify-between bg-white z-10">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Gemini Clone
            </h1>
        </div>
        <div className="text-sm text-gray-500">
             {selectedFiles.length > 0 ? `${selectedFiles.length} files attached` : "No files attached"}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-20 text-gray-400">
              <h2 className="text-2xl font-medium mb-2 text-gray-700">Welcome, User</h2>
              <p>Start a conversation or connect SharePoint to ask questions about your documents.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={clsx("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-gray-200" : "bg-blue-100"
              )}>
                {msg.role === 'user' ? <User size={16}/> : <Bot size={16} className="text-blue-600"/>}
              </div>
              <div className={clsx(
                "p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed",
                msg.role === 'user' ? "bg-gray-100 text-gray-900" : "bg-transparent text-gray-800"
              )}>
                {msg.role === 'model' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                    msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 animate-pulse">
                     <Bot size={16} className="text-blue-600"/>
                 </div>
                 <div className="p-4 text-gray-400 text-sm">Thinking...</div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-gray-100 rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600">
                <Upload size={20}/>
            </button>
            <input 
              type="text" 
              placeholder="Ask anything..." 
              className="flex-1 bg-transparent border-none focus:outline-none px-4 text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form> 
          <div className="text-center text-xs text-gray-400 mt-2">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </div>
        </div>
      </div>
    </div>
  );
}
