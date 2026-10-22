"use client";

import { useEffect, useState } from 'react';
import { getSocket } from '../../lib/socket';
import { Plus, X, Check, Search, Tag } from 'lucide-react';

export default function ChatList({ onSelectConversation }: { onSelectConversation: (conv: any) => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const startNewChat = async () => {
    if (!newPhoneNumber.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: newPhoneNumber })
      });
      const data = await res.json();
      if (data.id) {
        // Add to local state if not already there
        if (!conversations.find(c => c.id === data.id)) {
          setConversations(prev => [data, ...prev]);
        }
        onSelectConversation(data);
        setShowNewChat(false);
        setNewPhoneNumber('');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error starting chat: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/conversations`);
        const data = await res.json();
        setConversations(data);
      } catch (e) {
        console.error('Error fetching conversations:', e);
      }
    };

    fetchConversations();

    const socket = getSocket();
    socket.connect();

    socket.on('new_message_global', (message) => {
      // Re-order or highlight conversations here
      console.log('Global message received', message);
    });

    return () => {
      socket.off('new_message_global');
    };
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const query = searchQuery.toLowerCase();
    return (
      conv.phone_number.toLowerCase().includes(query) ||
      (conv.name && conv.name.toLowerCase().includes(query)) ||
      (conv.labels && conv.labels.some((l: string) => l.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="w-1/3 border-r h-screen overflow-y-auto bg-card flex flex-col">
      <div className="p-6 border-b bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Chats</h2>
          <button 
            onClick={() => setShowNewChat(!showNewChat)}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            {showNewChat ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        <div className="relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
           <input 
             type="text"
             className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
             placeholder="Search number, name or label..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {showNewChat && (
        <div className="p-4 border-b bg-muted/10 animate-in slide-in-from-top duration-200">
          <div className="flex gap-2">
            <input 
              autoFocus
              className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter Phone (e.g. 2010...)"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startNewChat()}
            />
            <button 
              disabled={loading}
              onClick={startNewChat}
              className="bg-primary text-primary-foreground p-2 rounded-lg disabled:opacity-50"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center mt-10">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.id} 
              className="p-4 rounded-2xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all mb-1 group"
              onClick={() => onSelectConversation(conv)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {conv.name || conv.phone_number}
                </div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                  {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
              
              <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-relaxed mb-2">
                {conv.last_message || 'No messages yet'}
              </div>

              {conv.labels && conv.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {conv.labels.map((l: string) => (
                    <span key={l} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
