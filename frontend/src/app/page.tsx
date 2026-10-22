"use client";

import { useState } from "react";
import ChatList from "@/components/chat/ChatList";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Home() {
  const [activeConversation, setActiveConversation] = useState<any>(null);

  // In real implementation you pass the entire object from DB instead of mock wrapper
  const handleSelectConv = (conv: any) => {
    setActiveConversation(conv);
  }

  return (
    <main className="flex w-full h-screen bg-background text-foreground overflow-hidden">
      <ChatList onSelectConversation={handleSelectConv} />
      <ChatWindow conversation={activeConversation} />
    </main>
  );
}
