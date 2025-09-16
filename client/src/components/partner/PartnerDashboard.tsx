import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, TrendingUp, FileText, Megaphone, Plus, Crown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Business, Guide, AdCampaign, AnalyticsEvent } from '@/lib/types';

interface PartnerDashboardProps {
  business: Business | null;
}

export default function PartnerDashboard({ business }: PartnerDashboardProps) {
  if (!business) return null;

  // Fetch partner's guides
  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: [`/api/guides/business/${business.id}`],
    enabled: !!business.id,
  });

  // Fetch partner's campaigns
  const { data: campaigns = [] } = useQuery<AdCampaign[]>({
    queryKey: [`/api/ad-campaigns/business/${business.id}`],
    enabled: !!business.id,
  });

  // Fetch analytics for the last 7 days
  const { data: analytics = [] } = useQuery<AnalyticsEvent[]>({
    queryKey: [`/api/analytics/business/${business.id}`, { days: 7 }],
    enabled: !!business.id,
  });

  // Calculate metrics
  const totalImpressions = analytics.filter(e => e.eventType === 'impression').length;
  const totalClicks = analytics.filter(e => e.eventType === 'click').length;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const activeGuides = guides.filter(g => g.isActive ?? true).length;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  // Prepare chart data for last 7 days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAnalytics = analytics.filter(e => {
      const eventDate = e.createdAt ? format(new Date(e.createdAt), 'yyyy-MM-dd') : '';
      return eventDate === dateStr;
    });

    chartData.push({
      date: format(date, 'MMM dd'),
      impressions: dayAnalytics.filter(e => e.eventType === 'impression').length,
      clicks: dayAnalytics.filter(e => e.eventType === 'click').length,
    });
  }

  // Get subscription tier limits
  const getTierLimits = () => {
    switch (business.subscriptionTier) {
      case 'premium':
        return { guides: 'Unlimited', campaigns: 'Unlimited', analytics: 'Advanced' };
      case 'standard':
        return { guides: '50', campaigns: '10', analytics: 'Standard' };
      default:
        return { guides: '10', campaigns: '3', analytics: 'Basic' };
    }
  };

  const limits = getTierLimits();

  return (
    <div className="space-y-6">
      {/* Tier Info Banner */}
      {business.subscriptionTier !== 'premium' && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg">Upgrade Your Plan</CardTitle>
              </div>
              <Badge className="bg-amber-100 text-amber-700">
                {business.subscriptionTier} Plan
              </Badge>
            </div>
            <CardDescription className="text-amber-700">
              Unlock more features and reach more customers with a higher tier plan.
              Current limits: {limits.guides} guides, {limits.campaigns} campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold" data-testid="text-total-impressions">
                {totalImpressions.toLocaleString()}
              </div>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold" data-testid="text-total-clicks">
                {totalClicks.toLocaleString()}
              </div>
              <MousePointer className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Click-Through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold" data-testid="text-ctr">
                {ctr}%
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average CTR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                <span data-testid="text-active-guides">{activeGuides}</span> / 
                <span data-testid="text-active-campaigns"> {activeCampaigns}</span>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Guides / Campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Impressions and clicks over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="impressions"
                stackId="1"
                stroke="#3b82f6"
                fill="#93bbfc"
                name="Impressions"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stackId="1"
                stroke="#10b981"
                fill="#86efac"
                name="Clicks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" data-testid="button-create-guide">
              <Plus className="mr-2 h-4 w-4" />
              Create New Guide
            </Button>
            <Button className="w-full justify-start" variant="outline" data-testid="button-create-campaign">
              <Megaphone className="mr-2 h-4 w-4" />
              Create Ad Campaign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {guides.slice(0, 3).map(guide => (
                <div key={guide.id} className="flex items-center justify-between py-1">
                  <span className="truncate flex-1" data-testid={`text-recent-guide-${guide.id}`}>
                    {guide.title}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {guide.impressions || 0} views
                  </Badge>
                </div>
              ))}
              {guides.length === 0 && (
                <p className="text-muted-foreground">No guides created yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}