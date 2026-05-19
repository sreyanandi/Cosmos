import { createContext, useContext, useState, type ReactNode } from 'react';

type AppMode = 'scroll' | 'dashboard' | 'launching' | 'storytelling';
type Theme = 'dark' | 'light';

interface SpaceContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  selectedEntity: string | null;
  setSelectedEntity: (entity: string | null) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppMode] = useState<AppMode>('scroll');
  const [theme, setTheme] = useState<Theme>('dark');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  return (
    <SpaceContext.Provider value={{ appMode, setAppMode, theme, setTheme, audioEnabled, setAudioEnabled, selectedEntity, setSelectedEntity }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpaceContext() {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpaceContext must be used within a SpaceProvider');
  }
  return context;
}
