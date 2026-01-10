'use client';

import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  // Enable global keyboard shortcuts
  useKeyboardShortcuts({ enabled: true });

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

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />
    </div>
  );
}
