import { AdCampaign } from '@/lib/types';

interface ScreensaverSettings {
  enabled: boolean;
  idleTimeout: number; // milliseconds
  rotationInterval: number; // milliseconds
  showClock: boolean;
  showWeather: boolean;
  enabledCampaigns: string[]; // Campaign IDs
  transitionEffect: 'fade' | 'slide' | 'zoom';
}

// Default screensaver settings
export const DEFAULT_SCREENSAVER_SETTINGS: ScreensaverSettings = {
  enabled: true,
  idleTimeout: 60000, // 1 minute
  rotationInterval: 10000, // 10 seconds
  showClock: true,
  showWeather: false,
  enabledCampaigns: [],
  transitionEffect: 'fade'
};

// Storage key for screensaver settings
const SCREENSAVER_SETTINGS_KEY = 'screensaver_settings';
const SCREENSAVER_STATS_KEY = 'screensaver_stats';

/**
 * Load screensaver settings from localStorage
 */
export function loadScreensaverSettings(): ScreensaverSettings {
  try {
    const stored = localStorage.getItem(SCREENSAVER_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SCREENSAVER_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading screensaver settings:', error);
  }
  return DEFAULT_SCREENSAVER_SETTINGS;
}

/**
 * Save screensaver settings to localStorage
 */
export function saveScreensaverSettings(settings: ScreensaverSettings): void {
  try {
    localStorage.setItem(SCREENSAVER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving screensaver settings:', error);
  }
}

/**
 * Filter campaigns based on screensaver settings
 */
export function filterCampaignsForScreensaver(
  campaigns: AdCampaign[],
  settings: ScreensaverSettings
): AdCampaign[] {
  if (!settings.enabledCampaigns.length) {
    // If no specific campaigns selected, use all active fullscreen campaigns
    return campaigns.filter(c => c.isActive && c.adType === 'fullscreen');
  }
  
  // Filter to only enabled campaigns
  return campaigns.filter(
    c => c.isActive && 
         c.adType === 'fullscreen' &&
         settings.enabledCampaigns.includes(String(c.id))
  );
}

/**
 * Ad rotation algorithm with weighted selection
 */
export class AdRotationManager {
  private campaigns: AdCampaign[] = [];
  private lastShownId: string | null = null;
  private history: string[] = [];
  private maxHistorySize = 5;

  constructor(campaigns: AdCampaign[]) {
    this.setCampaigns(campaigns);
  }

  setCampaigns(campaigns: AdCampaign[]): void {
    this.campaigns = campaigns;
  }

  /**
   * Get next ad with weighted selection based on priority
   */
  getNextAd(): AdCampaign | null {
    if (!this.campaigns.length) return null;
    
    // Single campaign - just return it
    if (this.campaigns.length === 1) {
      return this.campaigns[0];
    }

    // Filter out recently shown ads to avoid repetition
    const availableCampaigns = this.campaigns.filter(
      c => !this.history.slice(-Math.min(2, this.campaigns.length - 1)).includes(String(c.id))
    );

    // If all have been shown recently, reset
    const candidates = availableCampaigns.length > 0 ? availableCampaigns : this.campaigns;

    // Create weighted pool based on priority
    const weightedPool: AdCampaign[] = [];
    candidates.forEach(campaign => {
      const weight = Math.max(1, campaign.priority || 1);
      for (let i = 0; i < weight; i++) {
        weightedPool.push(campaign);
      }
    });

    // Random selection from weighted pool
    const selected = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    
    // Update history
    if (selected) {
      this.lastShownId = String(selected.id);
      this.history.push(String(selected.id));
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    }

    return selected;
  }

  /**
   * Reset rotation state
   */
  reset(): void {
    this.lastShownId = null;
    this.history = [];
  }
}

/**
 * Preload media for smooth transitions
 */
export async function preloadMedia(url: string, type: 'image' | 'video' = 'image'): Promise<void> {
  if (!url) return;

  if (type === 'image') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  } else {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.oncanplaythrough = () => resolve();
      video.onerror = reject;
      video.src = url;
    });
  }
}

/**
 * Batch preload multiple media items
 */
export async function preloadAdMedia(campaigns: AdCampaign[]): Promise<void> {
  const preloadPromises = campaigns
    .filter(c => c.mediaUrl)
    .slice(0, 3) // Preload only first 3 to avoid excessive memory usage
    .map(c => preloadMedia(c.mediaUrl, c.mediaType as 'image' | 'video').catch(() => {}));
  
  await Promise.all(preloadPromises);
}

/**
 * Format duration for display
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Track screensaver statistics
 */
interface ScreensaverStats {
  totalActivations: number;
  totalDuration: number; // milliseconds
  totalAdsShown: number;
  lastActivation?: string; // ISO date string
  exitMethods: {
    click: number;
    touch: number;
    keyboard: number;
    mouse: number;
    other: number;
  };
}

const DEFAULT_STATS: ScreensaverStats = {
  totalActivations: 0,
  totalDuration: 0,
  totalAdsShown: 0,
  exitMethods: {
    click: 0,
    touch: 0,
    keyboard: 0,
    mouse: 0,
    other: 0
  }
};

/**
 * Load screensaver statistics
 */
export function loadScreensaverStats(): ScreensaverStats {
  try {
    const stored = localStorage.getItem(SCREENSAVER_STATS_KEY);
    if (stored) {
      return { ...DEFAULT_STATS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading screensaver stats:', error);
  }
  return DEFAULT_STATS;
}

/**
 * Update screensaver statistics
 */
export function updateScreensaverStats(update: Partial<ScreensaverStats>): void {
  try {
    const current = loadScreensaverStats();
    const updated = {
      ...current,
      ...update,
      exitMethods: {
        ...current.exitMethods,
        ...(update.exitMethods || {})
      }
    };
    localStorage.setItem(SCREENSAVER_STATS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving screensaver stats:', error);
  }
}

/**
 * Prevent screen dimming during screensaver
 */
export class WakeLockManager {
  private wakeLock: any = null;

  async requestWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('Screen wake lock acquired');
        
        // Re-acquire on visibility change
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
      } catch (error) {
        console.error('Failed to acquire wake lock:', error);
      }
    }
  }

  releaseWakeLock(): void {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
      console.log('Screen wake lock released');
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = async () => {
    if (this.wakeLock && document.visibilityState === 'visible') {
      await this.requestWakeLock();
    }
  };
}

/**
 * Calculate optimal rotation interval based on campaigns
 */
export function calculateOptimalRotationInterval(
  campaigns: AdCampaign[],
  minInterval = 8000,
  maxInterval = 15000
): number {
  if (!campaigns.length) return minInterval;
  
  // More campaigns = shorter intervals
  const campaignCount = campaigns.length;
  if (campaignCount <= 2) return maxInterval;
  if (campaignCount <= 5) return 12000;
  if (campaignCount <= 10) return 10000;
  return minInterval;
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 ||
         (navigator as any).msMaxTouchPoints > 0;
}

/**
 * Get exit method message
 */
export function getExitMessage(): string {
  if (isTouchDevice()) {
    return 'Touch anywhere to continue';
  }
  return 'Move mouse or press any key to continue';
}