"use client";

import { MessageSquare, BarChart3, Settings, Moon, Sun, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navItems = [
    { name: 'Chats', href: '/', icon: MessageSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body className="antialiased min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex overflow-hidden">
        {/* Persistent Premium Sidebar */}
        <aside className="w-20 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-8 gap-10 bg-zinc-50 dark:bg-zinc-950 z-50">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M21 11.5C21 16.7467 16.7467 21 11.5 21C6.25329 21 2 16.7467 2 11.5C2 6.25329 6.25329 2 11.5 2C16.7467 2 21 6.25329 21 11.5Z" stroke="currentColor" strokeWidth="2.5" />
              <path d="M11.5 7V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M8.5 10H14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <nav className="flex-1 flex flex-col gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`p-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' 
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button className="p-3 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-colors relative">
               <Bell className="w-6 h-6" />
               <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-50 dark:border-zinc-950"></span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
