'use client';

import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300'
        )}
      >
        {children}
      </main>
    </div>
  );
}
