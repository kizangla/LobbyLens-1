import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Monitor, 
  Play, 
  Settings, 
  Clock, 
  BarChart3,
  Save,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  loadScreensaverSettings,
  saveScreensaverSettings,
  loadScreensaverStats,
  formatDuration,
  DEFAULT_SCREENSAVER_SETTINGS
} from '@/utils/screensaverHelpers';
import { AdCampaign, Business } from '@/lib/types';

interface ScreensaverSettingsProps {
  onPreview?: () => void;
}

export function ScreensaverSettings({ onPreview }: ScreensaverSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => loadScreensaverSettings());
  const [stats] = useState(() => loadScreensaverStats());
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch ad campaigns
  const { data: campaigns = [] } = useQuery<AdCampaign[]>({
    queryKey: ['/api/ad-campaigns'],
  });

  // Fetch businesses
  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });

  // Filter fullscreen campaigns
  const fullscreenCampaigns = campaigns.filter(c => c.adType === 'fullscreen' && c.isActive);

  // Get business name for campaign
  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown';
  };

  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Handle campaign selection
  const handleCampaignToggle = (campaignId: string) => {
    setSettings(prev => {
      const enabledCampaigns = prev.enabledCampaigns.includes(campaignId)
        ? prev.enabledCampaigns.filter(id => id !== campaignId)
        : [...prev.enabledCampaigns, campaignId];
      
      return { ...prev, enabledCampaigns };
    });
    setHasChanges(true);
  };

  // Select all campaigns
  const selectAllCampaigns = () => {
    setSettings(prev => ({
      ...prev,
      enabledCampaigns: fullscreenCampaigns.map(c => String(c.id))
    }));
    setHasChanges(true);
  };

  // Deselect all campaigns
  const deselectAllCampaigns = () => {
    setSettings(prev => ({
      ...prev,
      enabledCampaigns: []
    }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = () => {
    saveScreensaverSettings(settings);
    setHasChanges(false);
    toast({
      title: 'Settings Saved',
      description: 'Screensaver settings have been updated successfully.',
    });
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings(DEFAULT_SCREENSAVER_SETTINGS);
    setHasChanges(true);
    toast({
      title: 'Settings Reset',
      description: 'Screensaver settings have been reset to defaults.',
    });
  };

  // Test screensaver
  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else {
      // Trigger screensaver preview by dispatching custom event
      window.dispatchEvent(new CustomEvent('screensaver:preview'));
    }
    toast({
      title: 'Screensaver Preview',
      description: 'Launching screensaver preview mode...',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Monitor className="h-6 w-6" />
          Screensaver Settings
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
            data-testid="button-reset-settings"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges}
            data-testid="button-save-settings"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Eye className="h-4 w-4 mr-2" />
            Ad Campaigns
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>
                Configure when and how the screensaver activates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled" className="text-base">Enable Screensaver</Label>
                  <p className="text-sm text-muted-foreground">
                    Activate screensaver mode when the display is idle
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                  data-testid="switch-screensaver-enabled"
                />
              </div>

              {/* Idle Timeout */}
              <div className="space-y-2">
                <Label htmlFor="idleTimeout">Idle Timeout</Label>
                <Select
                  value={String(settings.idleTimeout)}
                  onValueChange={(value) => handleSettingChange('idleTimeout', parseInt(value))}
                >
                  <SelectTrigger id="idleTimeout" data-testid="select-idle-timeout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="120000">2 minutes</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                    <SelectItem value="600000">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Time of inactivity before screensaver activates
                </p>
              </div>

              {/* Rotation Interval */}
              <div className="space-y-2">
                <Label htmlFor="rotationInterval">Ad Rotation Speed</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="rotationInterval"
                    min={5000}
                    max={30000}
                    step={1000}
                    value={[settings.rotationInterval]}
                    onValueChange={(value) => handleSettingChange('rotationInterval', value[0])}
                    className="flex-1"
                    data-testid="slider-rotation-interval"
                  />
                  <span className="text-sm font-medium w-16">
                    {(settings.rotationInterval / 1000).toFixed(0)}s
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Time each ad is displayed before rotating
                </p>
              </div>

              {/* Transition Effect */}
              <div className="space-y-2">
                <Label htmlFor="transitionEffect">Transition Effect</Label>
                <Select
                  value={settings.transitionEffect}
                  onValueChange={(value) => handleSettingChange('transitionEffect', value)}
                >
                  <SelectTrigger id="transitionEffect" data-testid="select-transition-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showClock"
                    checked={settings.showClock}
                    onCheckedChange={(checked) => handleSettingChange('showClock', checked)}
                    data-testid="checkbox-show-clock"
                  />
                  <Label htmlFor="showClock" className="cursor-pointer">
                    Show clock overlay
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showWeather"
                    checked={settings.showWeather}
                    onCheckedChange={(checked) => handleSettingChange('showWeather', checked)}
                    data-testid="checkbox-show-weather"
                  />
                  <Label htmlFor="showWeather" className="cursor-pointer">
                    Show weather widget
                  </Label>
                </div>
              </div>

              {/* Preview Button */}
              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={handlePreview}
                  disabled={!settings.enabled}
                  data-testid="button-preview-screensaver"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Preview Screensaver
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Ad Campaigns</CardTitle>
              <CardDescription>
                Choose which fullscreen ad campaigns to display in the screensaver.
                {fullscreenCampaigns.length === 0 && (
                  <span className="block mt-2 text-yellow-600">
                    No fullscreen ad campaigns are currently active.
                  </span>
                )}
              </CardDescription>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllCampaigns}
                  disabled={fullscreenCampaigns.length === 0}
                  data-testid="button-select-all"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deselectAllCampaigns}
                  disabled={fullscreenCampaigns.length === 0}
                  data-testid="button-deselect-all"
                >
                  Deselect All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fullscreenCampaigns.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No fullscreen ad campaigns available. Create one in the Ad Campaigns section.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {fullscreenCampaigns.map(campaign => (
                      <div 
                        key={campaign.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            id={`campaign-${campaign.id}`}
                            checked={settings.enabledCampaigns.includes(String(campaign.id))}
                            onCheckedChange={() => handleCampaignToggle(String(campaign.id))}
                            data-testid={`checkbox-campaign-${campaign.id}`}
                          />
                          <Label 
                            htmlFor={`campaign-${campaign.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div>
                              <p className="font-medium">{campaign.campaignName}</p>
                              <p className="text-sm text-muted-foreground">
                                {getBusinessName(campaign.businessId || '')}
                              </p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Priority: {campaign.priority || 0}
                          </Badge>
                          {campaign.mediaType === 'video' && (
                            <Badge variant="secondary">Video</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>
                    {settings.enabledCampaigns.length} of {fullscreenCampaigns.length}
                  </strong>{' '}
                  campaigns selected
                  {settings.enabledCampaigns.length === 0 && fullscreenCampaigns.length > 0 && (
                    <span className="block mt-1 text-yellow-600">
                      All fullscreen ads will be shown when no specific campaigns are selected
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Screensaver Statistics</CardTitle>
              <CardDescription>
                View performance metrics and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Activations</p>
                  <p className="text-2xl font-bold" data-testid="text-total-activations">
                    {stats.totalActivations}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                  <p className="text-2xl font-bold" data-testid="text-total-duration">
                    {formatDuration(stats.totalDuration)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Ads Shown</p>
                  <p className="text-2xl font-bold" data-testid="text-total-ads">
                    {stats.totalAdsShown}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Last Activation</p>
                  <p className="text-2xl font-bold" data-testid="text-last-activation">
                    {stats.lastActivation 
                      ? new Date(stats.lastActivation).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              {/* Exit Methods */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Exit Methods</h4>
                <div className="space-y-2">
                  {Object.entries(stats.exitMethods).map(([method, count]) => (
                    <div key={method} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{method}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}