import { LayoutProvider } from '../contexts/LayoutContext';
import { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <div className="print:hidden">
          <Sidebar />
        </div>
      )}
      <div className={`flex-1 flex flex-col min-h-screen ${showSidebar ? 'ml-[240px] print:ml-0' : ''}`}>
        <LayoutProvider showSidebar={showSidebar}>{children}</LayoutProvider>
      </div>
    </div>
  );
}
