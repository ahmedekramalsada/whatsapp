"use client";

import { useState } from 'react';
import { Layout } from 'lucide-react';
import TemplateSelector from './TemplateSelector';

export default function ChatInput({ conversationId, phoneNumber }: { conversationId: string, phoneNumber: string }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || !conversationId) return;
    setLoading(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
          conversationId: conversationId
        })
      });
      setMessage('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendTemplate = async (template: any, variables: string[]) => {
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages/templates/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          templateName: template.name,
          language: template.language,
          variables: variables,
          conversationId: conversationId
        })
      });
      setShowTemplates(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-t bg-card flex flex-col gap-3">
      {showTemplates && (
        <TemplateSelector 
          onSelect={sendTemplate} 
          onClose={() => setShowTemplates(false)} 
        />
      )}
      
      <div className="flex gap-2">
        <button
          onClick={() => setShowTemplates(true)}
          className="p-2 hover:bg-muted rounded-full transition-colors text-primary border border-primary/20"
          title="Send Template"
        >
          <Layout className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          className="flex-1 bg-muted px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
