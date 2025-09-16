import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { AdCampaign } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

interface ScreensaverModeProps {
  isActive: boolean;
  onExit: () => void;
  rotationInterval?: number; // milliseconds between ad changes
  enabled?: boolean;
}

export function ScreensaverMode({
  isActive,
  onExit,
  rotationInterval = 10000, // Default 10 seconds
  enabled = true
}: ScreensaverModeProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasInteracted, setHasInteracted] = useState(false);
  const rotationTimerRef = useRef<NodeJS.Timeout>();
  const clockTimerRef = useRef<NodeJS.Timeout>();
  const impressionTrackedRef = useRef<Set<string>>(new Set());
  const lastAdIdRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Fetch active fullscreen ad campaigns
  const { data: campaigns = [] } = useQuery<AdCampaign[]>({
    queryKey: ['/api/ad-campaigns', { active: true, adType: 'fullscreen' }],
    queryFn: async () => {
      const response = await fetch('/api/ad-campaigns?active=true&adType=fullscreen');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
    enabled: isActive && enabled
  });

  // Track ad impression
  const trackImpression = useMutation({
    mutationFn: async (adId: string) => {
      const response = await apiRequest('POST', '/api/analytics/event', {
        eventType: 'screensaver_impression',
        entityType: 'ad',
        entityId: adId,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: rotationInterval
        }
      });
      return response.json();
    },
    onError: (error) => {
      console.error('Failed to track screensaver impression:', error);
    }
  });

  // Track screensaver activation
  const trackScreensaverActivation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/analytics/event', {
        eventType: 'screensaver_activated',
        entityType: 'screensaver',
        entityId: 'main',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
      return response.json();
    }
  });

  // Track screensaver exit
  const trackScreensaverExit = useMutation({
    mutationFn: async (exitMethod: string) => {
      const response = await apiRequest('POST', '/api/analytics/event', {
        eventType: 'screensaver_exit',
        entityType: 'screensaver',
        entityId: 'main',
        metadata: {
          exitMethod,
          duration: impressionTrackedRef.current.size * rotationInterval,
          adsShown: impressionTrackedRef.current.size,
          timestamp: new Date().toISOString()
        }
      });
      return response.json();
    }
  });

  // Get next ad with rotation logic
  const getNextAd = useCallback(() => {
    if (!campaigns || campaigns.length === 0) return null;

    // If only one ad, return it
    if (campaigns.length === 1) return campaigns[0];

    // Filter out the last shown ad to avoid repetition
    const availableAds = campaigns.filter(ad => String(ad.id) !== lastAdIdRef.current);
    
    // If all ads have been filtered (shouldn't happen), use all
    const adsToChooseFrom = availableAds.length > 0 ? availableAds : campaigns;

    // Weight selection by priority
    const weightedSelection = adsToChooseFrom.reduce((acc, ad) => {
      const weight = (ad.priority || 0) + 1; // Ensure at least weight of 1
      for (let i = 0; i < weight; i++) {
        acc.push(ad);
      }
      return acc;
    }, [] as AdCampaign[]);

    // Random selection from weighted array
    const selectedAd = weightedSelection[Math.floor(Math.random() * weightedSelection.length)];
    lastAdIdRef.current = String(selectedAd.id);
    
    return selectedAd;
  }, [campaigns]);

  // Handle exit interaction
  const handleExit = useCallback((exitMethod: string) => {
    if (!hasInteracted) {
      setHasInteracted(true);
      trackScreensaverExit.mutate(exitMethod);
      onExit();
    }
  }, [hasInteracted, onExit, trackScreensaverExit]);

  // Update current time
  useEffect(() => {
    if (isActive) {
      const updateClock = () => setCurrentTime(new Date());
      clockTimerRef.current = setInterval(updateClock, 1000);
      return () => {
        if (clockTimerRef.current) clearInterval(clockTimerRef.current);
      };
    }
  }, [isActive]);

  // Handle ad rotation
  useEffect(() => {
    if (isActive && campaigns.length > 0) {
      // Track activation
      if (impressionTrackedRef.current.size === 0) {
        trackScreensaverActivation.mutate();
      }

      const rotateAd = () => {
        const nextAd = getNextAd();
        if (nextAd && !impressionTrackedRef.current.has(String(nextAd.id))) {
          impressionTrackedRef.current.add(String(nextAd.id));
          trackImpression.mutate(String(nextAd.id));
        }
        setCurrentAdIndex((prev) => (prev + 1) % Math.max(1, campaigns.length));
      };

      // Initial ad tracking
      const firstAd = getNextAd();
      if (firstAd && !impressionTrackedRef.current.has(String(firstAd.id))) {
        impressionTrackedRef.current.add(String(firstAd.id));
        trackImpression.mutate(String(firstAd.id));
      }

      // Set up rotation timer
      rotationTimerRef.current = setInterval(rotateAd, rotationInterval);

      return () => {
        if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
      };
    }
  }, [isActive, campaigns, rotationInterval, getNextAd, trackImpression, trackScreensaverActivation]);

  // Reset state when deactivated
  useEffect(() => {
    if (!isActive) {
      setCurrentAdIndex(0);
      setHasInteracted(false);
      impressionTrackedRef.current.clear();
      lastAdIdRef.current = null;
    }
  }, [isActive]);

  // Handle keyboard exit
  useEffect(() => {
    if (isActive) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleExit('keyboard');
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isActive, handleExit]);

  if (!isActive || !enabled) return null;

  const currentAd = campaigns[currentAdIndex % campaigns.length];

  return (
    <AnimatePresence>
      <motion.div
        data-testid="screensaver"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black z-[9999] overflow-hidden"
        onClick={() => handleExit('click')}
        onTouchStart={() => handleExit('touch')}
        onMouseMove={() => handleExit('mouse')}
      >
        {/* Main content area */}
        <div className="relative w-full h-full">
          {/* Ad display */}
          {campaigns.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAd?.id || 'no-ad'}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1.05,
                  transition: {
                    opacity: { duration: 0.8 },
                    scale: { duration: rotationInterval / 1000, ease: "linear" }
                  }
                }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {currentAd?.mediaType === 'video' ? (
                  <video
                    src={currentAd.mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : currentAd?.mediaUrl ? (
                  <div 
                    className="w-full h-full bg-center bg-cover bg-no-repeat"
                    style={{ 
                      backgroundImage: `url(${currentAd.mediaUrl})`,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-900 to-purple-900">
                    <div className="text-white text-center">
                      <h2 className="text-4xl font-bold mb-4">{currentAd?.campaignName || 'Welcome'}</h2>
                      {currentAd?.targetUrl && (
                        <p className="text-xl opacity-80">Visit: {currentAd.targetUrl}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white text-center p-12"
              >
                <h1 className="text-6xl font-bold mb-8">Welcome to Paradise Resort</h1>
                <p className="text-2xl opacity-90">Your perfect getaway awaits</p>
              </motion.div>
            </div>
          )}

          {/* Overlay elements */}
          {/* Clock widget */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-8 right-8 text-white bg-black/30 backdrop-blur-md rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8" />
              <div>
                <div className="text-4xl font-bold tabular-nums">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="text-lg opacity-80">
                  {format(currentTime, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resort logo watermark */}
          <div className="absolute top-8 left-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white bg-white/10 backdrop-blur-md rounded-xl px-6 py-4"
            >
              <h2 className="text-2xl font-bold">Paradise Resort</h2>
              <p className="text-sm opacity-80">Your Dream Destination</p>
            </motion.div>
          </div>

          {/* Touch to continue message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center"
          >
            <div className="bg-black/40 backdrop-blur-md rounded-full px-8 py-4">
              <p className="text-lg font-medium">Touch anywhere to continue</p>
              <p className="text-sm opacity-70">ESC to exit</p>
            </div>
          </motion.div>

          {/* Ad indicator dots */}
          {campaigns.length > 1 && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-2">
              {campaigns.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: index === currentAdIndex % campaigns.length ? 1.2 : 0.8,
                    opacity: index === currentAdIndex % campaigns.length ? 1 : 0.5
                  }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}