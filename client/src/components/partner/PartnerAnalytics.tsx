import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Minus, Eye, MousePointer, Target, DollarSign } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Guide, AdCampaign, AnalyticsEvent } from '@/lib/types';

interface PartnerAnalyticsProps {
  businessId: string;
}

export default function PartnerAnalytics({ businessId }: PartnerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [contentType, setContentType] = useState('all');

  // Calculate date range based on selection
  const getDateRange = () => {
    const end = endOfDay(new Date());
    let start;
    switch (timeRange) {
      case '1d':
        start = startOfDay(new Date());
        break;
      case '7d':
        start = startOfDay(subDays(new Date(), 7));
        break;
      case '30d':
        start = startOfDay(subDays(new Date(), 30));
        break;
      case '90d':
        start = startOfDay(subDays(new Date(), 90));
        break;
      default:
        start = startOfDay(subDays(new Date(), 7));
    }
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Fetch analytics data
  const { data: analytics = [] } = useQuery<AnalyticsEvent[]>({
    queryKey: [`/api/analytics/business/${businessId}`, { start, end }],
    enabled: !!businessId,
  });

  // Fetch content data
  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: [`/api/guides/business/${businessId}`],
    enabled: !!businessId,
  });

  const { data: campaigns = [] } = useQuery<AdCampaign[]>({
    queryKey: [`/api/ad-campaigns/business/${businessId}`],
    enabled: !!businessId,
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const impressions = analytics.filter(e => e.eventType === 'impression').length;
    const clicks = analytics.filter(e => e.eventType === 'click').length;
    const views = analytics.filter(e => e.eventType === 'view').length;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    // Calculate previous period for comparison
    const prevStart = subDays(start, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const prevAnalytics = analytics.filter(e => {
      const eventDate = e.createdAt ? new Date(e.createdAt) : new Date();
      return eventDate >= prevStart && eventDate < start;
    });

    const prevImpressions = prevAnalytics.filter(e => e.eventType === 'impression').length;
    const prevClicks = prevAnalytics.filter(e => e.eventType === 'click').length;

    const impressionChange = prevImpressions > 0 
      ? ((impressions - prevImpressions) / prevImpressions) * 100 
      : 100;
    const clickChange = prevClicks > 0 
      ? ((clicks - prevClicks) / prevClicks) * 100 
      : 100;

    return {
      impressions,
      clicks,
      views,
      ctr,
      impressionChange,
      clickChange,
    };
  }, [analytics, start, end]);

  // Prepare timeline chart data
  const timelineData = useMemo(() => {
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = startOfDay(subDays(end, days - i - 1));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayAnalytics = analytics.filter(e => {
        const eventDate = e.createdAt ? format(new Date(e.createdAt), 'yyyy-MM-dd') : '';
        return eventDate === dateStr;
      });

      data.push({
        date: format(date, 'MMM dd'),
        impressions: dayAnalytics.filter(e => e.eventType === 'impression').length,
        clicks: dayAnalytics.filter(e => e.eventType === 'click').length,
        views: dayAnalytics.filter(e => e.eventType === 'view').length,
      });
    }
    
    return data;
  }, [analytics, start, end]);

  // Top performing content
  const topContent = useMemo(() => {
    const contentMetrics: Array<{
      id: string;
      name: string;
      type: string;
      impressions: number;
      clicks: number;
      ctr: number;
    }> = [];

    if (contentType === 'all' || contentType === 'guides') {
      guides.forEach(guide => {
        const guideAnalytics = analytics.filter(
          e => e.entityType === 'guide' && e.entityId === guide.id
        );
        const impressions = guideAnalytics.filter(e => e.eventType === 'impression').length;
        const clicks = guideAnalytics.filter(e => e.eventType === 'click').length;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        contentMetrics.push({
          id: guide.id,
          name: guide.title,
          type: 'Guide',
          impressions,
          clicks,
          ctr,
        });
      });
    }

    if (contentType === 'all' || contentType === 'campaigns') {
      campaigns.forEach(campaign => {
        const campaignAnalytics = analytics.filter(
          e => e.entityType === 'ad_campaign' && e.entityId === campaign.id.toString()
        );
        const impressions = campaignAnalytics.filter(e => e.eventType === 'impression').length;
        const clicks = campaignAnalytics.filter(e => e.eventType === 'click').length;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

        contentMetrics.push({
          id: campaign.id.toString(),
          name: campaign.campaignName,
          type: 'Campaign',
          impressions,
          clicks,
          ctr,
        });
      });
    }

    return contentMetrics.sort((a, b) => b.impressions - a.impressions).slice(0, 10);
  }, [analytics, guides, campaigns, contentType]);

  // Pie chart data for content distribution
  const distributionData = useMemo(() => {
    const guideImpressions = analytics.filter(
      e => e.entityType === 'guide' && e.eventType === 'impression'
    ).length;
    const campaignImpressions = analytics.filter(
      e => e.entityType === 'ad_campaign' && e.eventType === 'impression'
    ).length;

    return [
      { name: 'Guides', value: guideImpressions, color: '#3b82f6' },
      { name: 'Campaigns', value: campaignImpressions, color: '#10b981' },
    ];
  }, [analytics]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Impressions', 'Clicks', 'Views', 'CTR'];
    const rows = timelineData.map(row => [
      row.date,
      row.impressions,
      row.clicks,
      row.views,
      row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(2) : '0.00',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${businessId}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed performance metrics for your content
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32" data-testid="select-time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold" data-testid="text-analytics-impressions">
                  {metrics.impressions.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  {getChangeIcon(metrics.impressionChange)}
                  <span className={`ml-1 ${
                    metrics.impressionChange > 0 ? 'text-green-500' : 
                    metrics.impressionChange < 0 ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {Math.abs(metrics.impressionChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
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
              <div>
                <div className="text-2xl font-bold" data-testid="text-analytics-clicks">
                  {metrics.clicks.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  {getChangeIcon(metrics.clickChange)}
                  <span className={`ml-1 ${
                    metrics.clickChange > 0 ? 'text-green-500' : 
                    metrics.clickChange < 0 ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {Math.abs(metrics.clickChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <MousePointer className="h-5 w-5 text-muted-foreground" />
            </div>
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
              <div className="text-2xl font-bold" data-testid="text-analytics-ctr">
                {metrics.ctr.toFixed(2)}%
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold" data-testid="text-analytics-views">
                {metrics.views.toLocaleString()}
              </div>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Daily metrics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="impressions" 
                stroke="#3b82f6" 
                name="Impressions"
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#10b981" 
                name="Clicks"
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#f59e0b" 
                name="Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Impressions by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Performing Content</CardTitle>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="w-32" data-testid="select-content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="guides">Guides Only</SelectItem>
                  <SelectItem value="campaigns">Campaigns Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topContent.slice(0, 5).map(content => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium truncate max-w-xs" data-testid={`text-content-name-${content.id}`}>
                      {content.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{content.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right" data-testid={`text-content-impressions-${content.id}`}>
                      {content.impressions}
                    </TableCell>
                    <TableCell className="text-right" data-testid={`text-content-ctr-${content.id}`}>
                      {content.ctr.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
                {topContent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No data available for selected period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}