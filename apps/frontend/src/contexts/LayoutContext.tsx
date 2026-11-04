import { createContext, useContext, ReactNode } from 'react';

interface LayoutContextType {
  showSidebar: boolean;
}

const LayoutContext = createContext<LayoutContextType>({ showSidebar: true });

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children, showSidebar }: { children: ReactNode, showSidebar: boolean }) => {
  return (
    <LayoutContext.Provider value={{ showSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
};
