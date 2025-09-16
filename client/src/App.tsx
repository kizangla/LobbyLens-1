import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminPanel from "@/pages/AdminFixedNew";
import PartnerPortal from "@/pages/PartnerPortal";
import { ScreensaverMode } from "@/components/ScreensaverMode";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import { loadScreensaverSettings, updateScreensaverStats, loadScreensaverStats } from "@/utils/screensaverHelpers";

// App context for theme and language preferences
import { useState, createContext, useContext, ReactNode, useEffect, useCallback } from "react";

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const AppContext = createContext<AppContextType>({
  language: "en",
  setLanguage: () => {},
});

export const useAppContext = () => useContext(AppContext);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState("en");

  return (
    <AppContext.Provider value={{ language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/partner" component={PartnerPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScreensaverWrapper() {
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [screensaverSettings, setScreensaverSettings] = useState(loadScreensaverSettings);
  const [location] = useLocation();

  // Load settings on mount and listen for changes
  useEffect(() => {
    const handleSettingsChange = () => {
      setScreensaverSettings(loadScreensaverSettings());
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleSettingsChange);
    
    // Listen for preview events from admin panel
    const handlePreview = () => {
      if (location.startsWith('/admin')) {
        setIsScreensaverActive(true);
      }
    };
    
    window.addEventListener('screensaver:preview', handlePreview);
    
    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('screensaver:preview', handlePreview);
    };
  }, [location]);

  // Idle detection callbacks
  const handleIdle = useCallback(() => {
    setIsScreensaverActive(true);
    updateScreensaverStats({
      totalActivations: loadScreensaverStats().totalActivations + 1,
      lastActivation: new Date().toISOString()
    });
  }, []);

  const handleActive = useCallback(() => {
    setIsScreensaverActive(false);
  }, []);

  const handleScreensaverExit = useCallback(() => {
    setIsScreensaverActive(false);
  }, []);

  // Use idle detection hook with settings
  const { isIdle } = useIdleDetection({
    timeout: screensaverSettings.idleTimeout,
    onIdle: handleIdle,
    onActive: handleActive,
    enabled: screensaverSettings.enabled,
    excludePaths: ['/admin', '/partner']
  });

  return (
    <ScreensaverMode
      isActive={isScreensaverActive}
      onExit={handleScreensaverExit}
      rotationInterval={screensaverSettings.rotationInterval}
      enabled={screensaverSettings.enabled}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AnalyticsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ScreensaverWrapper />
          </TooltipProvider>
        </AnalyticsProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
