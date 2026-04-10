"use client";

import { useEffect, useState } from 'react';
import { getSocket } from '../../lib/socket';
import ChatInput from './ChatInput';
import ContactSidebar from './ContactSidebar';
import { FileText, Image as ImageIcon, Video, Music, AlertCircle, Check, CheckCheck, PanelRight } from 'lucide-react';
import { MessageType, MessageStatus } from '@prisma/client';

export default function ChatWindow({ conversation }: { conversation: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [contactUpdateKey, setContactUpdateKey] = useState(0); // For forcing sidebar refresh

  useEffect(() => {
    if (!conversation) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/conversations/${conversation.id}/messages`);
        const data = await res.json();
        setMessages(data);
      } catch (e) {
        console.error('Error fetching messages:', e);
      }
    };

    fetchMessages();

    const socket = getSocket();
    socket.emit('join_conversation', conversation.id);

    const messageHandler = (newMessage: any) => {
      setMessages(prev => {
        // Check if message already exists (e.g. status update from pending to sent)
        const index = prev.findIndex(m => m.id === newMessage.id);
        if (index !== -1) {
          const newMsgs = [...prev];
          newMsgs[index] = newMessage;
          return newMsgs;
        }
        return [...prev, newMessage];
      });
    };

    socket.on('new_message', messageHandler);

    return () => {
      socket.off('new_message', messageHandler);
    };
  }, [conversation]);

  if (!conversation) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10">Select a conversation to start chatting</div>;
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-muted/10 relative overflow-hidden">
        <div className="p-4 border-b bg-card shadow-sm z-10 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3 shadow-inner">
              {conversation.phone_number.substring(0, 2)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{conversation.phone_number}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-semibold text-green-600 dark:text-green-500 uppercase tracking-wider">24-hour window open</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-zinc-400'}`}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] lg:max-w-[60%] rounded-2xl px-4 py-3 shadow-md border transition-all ${
                msg.from_me 
                  ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 rounded-tl-sm'
                } ${msg.status === MessageStatus.PENDING ? 'opacity-70 scale-[0.98]' : 'scale-100'}`}
              >
                {/* Media Rendering */}
                {msg.media_url && (
                  <div className="mb-2 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    {msg.type === MessageType.IMAGE && (
                        <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${msg.media_url}`} alt="Media" className="max-w-full hover:scale-105 transition-transform cursor-pointer" />
                    )}
                    {msg.type === MessageType.VIDEO && (
                        <video src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${msg.media_url}`} controls className="max-w-full" />
                    )}
                    {(msg.type === MessageType.DOCUMENT || msg.type === MessageType.AUDIO) && (
                        <div className="p-4 flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            {msg.type === MessageType.DOCUMENT ? <FileText className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">Media File</p>
                            <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${msg.media_url}`} target="_blank" className="text-[10px] underline opacity-80 hover:opacity-100">Download</a>
                          </div>
                        </div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                {msg.message_text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>}

                {/* Metadata / Interactive Rendering */}
                {msg.metadata && typeof msg.metadata === 'object' && (
                  <div className="mt-3 pt-3 border-t border-white/20 dark:border-zinc-800 space-y-2">
                    <p className="text-[10px] font-bold uppercase opacity-60">Interactive Response</p>
                    <div className="bg-white/10 dark:bg-zinc-800 p-2 rounded-lg text-xs italic">
                      {JSON.stringify(msg.metadata)}
                    </div>
                  </div>
                )}

                {/* Status & Timestamp */}
                <div className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] uppercase font-bold tracking-tighter ${msg.from_me ? 'text-indigo-200' : 'text-zinc-400'}`}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  
                  {msg.from_me && (
                    <span className="ml-1">
                      {msg.status === MessageStatus.PENDING && <div className="w-2 h-2 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                      {msg.status === MessageStatus.FAILED && <AlertCircle className="w-3 h-3 text-red-400" />}
                      {msg.status === MessageStatus.SENT && <Check className="w-3 h-3" />}
                      {msg.status === MessageStatus.DELIVERED && <CheckCheck className="w-3 h-3 opacity-60" />}
                      {msg.status === MessageStatus.READ && <CheckCheck className="w-3 h-3 text-blue-400" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <ChatInput conversationId={conversation.id} phoneNumber={conversation.phone_number} />
      </div>

      {/* Sidebar Area */}
      {showSidebar && (
        <ContactSidebar 
          key={`${conversation.contact_id}-${contactUpdateKey}`} 
          contactId={conversation.contact_id} 
          onUpdate={() => setContactUpdateKey(k => k + 1)}
        />
      )}
    </div>
  );
}
