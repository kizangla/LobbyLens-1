import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Edit, Trash2, Pause, Play, Loader2, DollarSign, CalendarIcon, Crown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AdCampaign, InsertAdCampaign, Category } from '@/lib/types';

interface PartnerCampaignsProps {
  businessId: string;
  subscriptionTier: string;
}

function DatePicker({
  date,
  onChange,
  placeholder = "Select date",
  disabled = false
}: {
  date?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function PartnerCampaigns({ businessId, subscriptionTier }: PartnerCampaignsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<number | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<InsertAdCampaign>>({
    businessId: businessId,
    campaignName: '',
    adType: 'homepage_a4',
    categoryId: '',
    mediaUrl: '',
    mediaType: 'image',
    targetUrl: '',
    isActive: true,
    priority: 0,
    dailyBudget: 0,
    totalBudget: 0,
    startDate: undefined,
    endDate: undefined
  });

  // Fetch partner's campaigns
  const { data: campaigns = [], isLoading } = useQuery<AdCampaign[]>({
    queryKey: [`/api/ad-campaigns/business/${businessId}`],
    enabled: !!businessId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get campaign limits based on tier
  const getCampaignLimits = () => {
    switch (subscriptionTier) {
      case 'premium':
        return { max: -1, label: 'Unlimited' };
      case 'standard':
        return { max: 10, label: '10 campaigns' };
      default:
        return { max: 3, label: '3 campaigns' };
    }
  };

  const limits = getCampaignLimits();
  const canCreateMore = limits.max === -1 || campaigns.length < limits.max;

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (campaign: InsertAdCampaign) => {
      const response = await apiRequest('POST', '/api/partner/ad-campaigns', campaign);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ad-campaigns/business/${businessId}`] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update campaign mutation
  const updateCampaign = useMutation({
    mutationFn: async ({ id, campaign }: { id: number; campaign: Partial<InsertAdCampaign> }) => {
      const response = await apiRequest('PUT', `/api/partner/ad-campaigns/${id}`, campaign);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ad-campaigns/business/${businessId}`] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Campaign updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update campaign',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Toggle campaign status
  const toggleCampaignStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/partner/ad-campaigns/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ad-campaigns/business/${businessId}`] });
      toast({
        title: 'Success',
        description: 'Campaign status updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/partner/ad-campaigns/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ad-campaigns/business/${businessId}`] });
      setDeleteCampaignId(null);
      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campaignName || !formData.adType || !formData.mediaUrl) {
      toast({
        title: 'Validation Error',
        description: 'Campaign name, ad type, and media URL are required',
        variant: 'destructive',
      });
      return;
    }

    const campaignData: InsertAdCampaign = {
      businessId: businessId,
      campaignName: formData.campaignName,
      adType: formData.adType,
      categoryId: formData.categoryId,
      mediaUrl: formData.mediaUrl,
      mediaType: formData.mediaType || 'image',
      targetUrl: formData.targetUrl,
      isActive: formData.isActive ?? true,
      priority: formData.priority || 0,
      dailyBudget: formData.dailyBudget || 0,
      totalBudget: formData.totalBudget || 0,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    if (editingCampaign) {
      updateCampaign.mutate({ id: editingCampaign.id, campaign: campaignData });
    } else {
      createCampaign.mutate(campaignData);
    }
  };

  const resetForm = () => {
    setFormData({
      businessId: businessId,
      campaignName: '',
      adType: 'homepage_a4',
      categoryId: '',
      mediaUrl: '',
      mediaType: 'image',
      targetUrl: '',
      isActive: true,
      priority: 0,
      dailyBudget: 0,
      totalBudget: 0,
      startDate: undefined,
      endDate: undefined
    });
    setEditingCampaign(null);
    setIsDialogOpen(false);
  };

  const handleEditCampaign = (campaign: AdCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      businessId: businessId,
      campaignName: campaign.campaignName,
      adType: campaign.adType,
      categoryId: campaign.categoryId || '',
      mediaUrl: campaign.mediaUrl,
      mediaType: campaign.mediaType || 'image',
      targetUrl: campaign.targetUrl || '',
      isActive: campaign.isActive ?? true,
      priority: campaign.priority || 0,
      dailyBudget: campaign.dailyBudget || 0,
      totalBudget: campaign.totalBudget || 0,
      startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
      endDate: campaign.endDate ? new Date(campaign.endDate) : undefined
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Campaign Limits Alert */}
      {!canCreateMore && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Campaign Limit Reached</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              You've reached the maximum of {limits.label} for your {subscriptionTier} plan.
              Upgrade to create more campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ad Campaigns</CardTitle>
              <CardDescription>
                Manage your advertising campaigns ({campaigns.length}/{limits.max === -1 ? '∞' : limits.max})
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              disabled={!canCreateMore}
              data-testid="button-create-campaign"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Impressions</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">CTR</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No campaigns created yet
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map(campaign => {
                  const ctr = campaign.impressions && campaign.impressions > 0
                    ? ((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2)
                    : '0.00';
                  
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell data-testid={`text-campaign-name-${campaign.id}`}>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{campaign.campaignName}</p>
                          {campaign.targetUrl && (
                            <p className="text-xs text-muted-foreground truncate">
                              {campaign.targetUrl}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.adType}</Badge>
                      </TableCell>
                      <TableCell>
                        {campaign.categoryId ? (
                          <Badge variant="outline">
                            {categories.find(c => c.id === campaign.categoryId)?.name || campaign.categoryId}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">All</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                          {campaign.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-campaign-impressions-${campaign.id}`}>
                        {campaign.impressions || 0}
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-campaign-clicks-${campaign.id}`}>
                        {campaign.clicks || 0}
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-campaign-ctr-${campaign.id}`}>
                        {ctr}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {campaign.dailyBudget || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCampaignStatus.mutate({ 
                              id: campaign.id, 
                              isActive: !campaign.isActive 
                            })}
                            data-testid={`button-toggle-${campaign.id}`}
                          >
                            {campaign.isActive ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCampaign(campaign)}
                            data-testid={`button-edit-campaign-${campaign.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteCampaignId(campaign.id)}
                            data-testid={`button-delete-campaign-${campaign.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign 
                ? 'Update the campaign details below' 
                : 'Create a new advertising campaign'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input
                  id="campaignName"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="Summer Sale Campaign"
                  required
                  data-testid="input-campaign-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adType">Ad Type *</Label>
                <Select 
                  value={formData.adType} 
                  onValueChange={(value) => setFormData({ ...formData, adType: value })}
                >
                  <SelectTrigger data-testid="select-ad-type">
                    <SelectValue placeholder="Select ad type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage_a4">Homepage A4</SelectItem>
                    <SelectItem value="homepage_premium">Homepage Premium</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Target Category</Label>
                <Select 
                  value={formData.categoryId || ''} 
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type</Label>
                <Select 
                  value={formData.mediaType || 'image'} 
                  onValueChange={(value) => setFormData({ ...formData, mediaType: value })}
                >
                  <SelectTrigger data-testid="select-media-type">
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Media URL *</Label>
              <Input
                id="mediaUrl"
                value={formData.mediaUrl || ''}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                placeholder="https://example.com/ad-image.jpg"
                required
                data-testid="input-media-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                value={formData.targetUrl || ''}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                placeholder="https://yourbusiness.com/landing-page"
                data-testid="input-target-url"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                <Input
                  id="dailyBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.dailyBudget || 0}
                  onChange={(e) => setFormData({ ...formData, dailyBudget: parseFloat(e.target.value) })}
                  data-testid="input-daily-budget"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBudget">Total Budget ($)</Label>
                <Input
                  id="totalBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalBudget || 0}
                  onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) })}
                  data-testid="input-total-budget"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority || 0}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  data-testid="input-priority"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={formData.startDate instanceof Date ? formData.startDate : undefined}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={formData.endDate instanceof Date ? formData.endDate : undefined}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  placeholder="Select end date"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-campaign-active"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCampaign.isPending || updateCampaign.isPending}>
                {createCampaign.isPending || updateCampaign.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingCampaign ? 'Update' : 'Create'} Campaign</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? All associated metrics will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCampaignId && deleteCampaign.mutate(deleteCampaignId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}