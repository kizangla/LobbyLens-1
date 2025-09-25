import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ContentEditor from '@/components/ContentEditor';
import { ScreensaverSettings } from '@/components/ScreensaverSettings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarIcon, 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  FolderOpen,
  FileText,
  Building,
  TrendingUp,
  Layers,
  BarChart,
  Settings,
  ArrowLeft,
  Grid3X3
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Category, 
  Guide, 
  InsertCategory, 
  InsertGuide, 
  Subcategory,
  Business,
  InsertBusiness,
  AdCampaign,
  InsertAdCampaign,
  AnalyticsEvent
} from '@/lib/types';

// Define InsertSubcategory interface
interface InsertSubcategory extends Subcategory {}

// DatePicker component
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
          data-testid="button-date-picker"
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

// Partners Management Component
function PartnersManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const { toast } = useToast();

  // Business form state
  const [formData, setFormData] = useState<Partial<InsertBusiness>>({
    id: '',
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    address: '',
    contactPerson: '',
    subscriptionTier: 'basic',
    isActive: true,
    expiresAt: undefined
  });

  // Fetch all businesses
  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });

  // Fetch ad campaigns and guides counts
  const { data: adCampaigns = [] } = useQuery<AdCampaign[]>({
    queryKey: ['/api/ad-campaigns'],
  });

  const { data: guides = [] } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });

  // Get counts for each business
  const getBusinessCounts = (businessId: string) => {
    const campaignCount = adCampaigns.filter(c => c.businessId === businessId).length;
    const guideCount = guides.filter(g => g.businessId === businessId).length;
    return { campaigns: campaignCount, guides: guideCount };
  };

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = filterTier === 'all' || business.subscriptionTier === filterTier;
      return matchesSearch && matchesTier;
    });
  }, [businesses, searchTerm, filterTier]);

  // Create business mutation
  const createBusiness = useMutation({
    mutationFn: async (business: InsertBusiness) => {
      const response = await apiRequest('POST', '/api/businesses', business);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Business partner created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create business partner',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update business mutation
  const updateBusiness = useMutation({
    mutationFn: async ({ id, business }: { id: string; business: Partial<InsertBusiness> }) => {
      const response = await apiRequest('PUT', `/api/businesses/${id}`, business);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Business partner updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update business partner',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete business mutation
  const deleteBusiness = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/businesses/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ad-campaigns'] });
      toast({
        title: 'Success',
        description: 'Business partner deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete business partner',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<InsertBusiness>) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'ID, Name and Email are required fields',
        variant: 'destructive',
      });
      return;
    }

    const businessData: InsertBusiness = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      logoUrl: formData.logoUrl,
      address: formData.address,
      contactPerson: formData.contactPerson,
      subscriptionTier: formData.subscriptionTier || 'basic',
      isActive: formData.isActive ?? true,
      expiresAt: formData.expiresAt
    };

    if (editingBusiness) {
      updateBusiness.mutate({ id: editingBusiness.id, business: businessData });
    } else {
      createBusiness.mutate(businessData);
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      logoUrl: '',
      address: '',
      contactPerson: '',
      subscriptionTier: 'basic',
      isActive: true,
      expiresAt: undefined
    });
    setEditingBusiness(null);
    setIsAdding(false);
  };

  // Set up edit mode
  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      id: business.id,
      name: business.name,
      description: business.description,
      email: business.email,
      phone: business.phone,
      website: business.website,
      logoUrl: business.logoUrl,
      address: business.address,
      contactPerson: business.contactPerson,
      subscriptionTier: business.subscriptionTier || 'basic',
      isActive: business.isActive ?? true,
      expiresAt: business.expiresAt ? new Date(business.expiresAt) : undefined
    });
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Business Partners</h2>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "secondary" : "default"}
          data-testid="button-add-partner"
        >
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Partner</>}
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-partners"
          />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-48" data-testid="select-filter-tier">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isAdding && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingBusiness ? 'Edit Business Partner' : 'Add New Business Partner'}</CardTitle>
            <CardDescription>
              {editingBusiness 
                ? 'Update the business partner details below' 
                : 'Fill in the details to add a new business partner'
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="id" className="text-sm font-medium">ID (unique identifier)</label>
                  <Input 
                    id="id" 
                    name="id" 
                    value={formData.id} 
                    onChange={handleInputChange}
                    placeholder="acme-corp"
                    disabled={!!editingBusiness}
                    data-testid="input-partner-id"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Business Name *</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="Acme Corporation"
                    data-testid="input-partner-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email *</label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    placeholder="contact@acme.com"
                    data-testid="input-partner-email"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleInputChange}
                    placeholder="+1 234 567 8900"
                    data-testid="input-partner-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input 
                    id="website" 
                    name="website" 
                    value={formData.website || ''} 
                    onChange={handleInputChange}
                    placeholder="https://www.acme.com"
                    data-testid="input-partner-website"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactPerson" className="text-sm font-medium">Contact Person</label>
                  <Input 
                    id="contactPerson" 
                    name="contactPerson" 
                    value={formData.contactPerson || ''} 
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    data-testid="input-partner-contact"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address || ''} 
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State 12345"
                  data-testid="input-partner-address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleInputChange}
                  placeholder="Brief description of the business..."
                  rows={3}
                  data-testid="textarea-partner-description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="logoUrl" className="text-sm font-medium">Logo URL</label>
                  <Input 
                    id="logoUrl" 
                    name="logoUrl" 
                    value={formData.logoUrl || ''} 
                    onChange={handleInputChange}
                    placeholder="https://..."
                    data-testid="input-partner-logo"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subscriptionTier" className="text-sm font-medium">Subscription Tier</label>
                  <Select 
                    value={formData.subscriptionTier || 'basic'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertBusiness>) => ({ ...prev, subscriptionTier: value }))}
                  >
                    <SelectTrigger data-testid="select-partner-tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="expiresAt" className="text-sm font-medium">Expires At</label>
                  <DatePicker
                    date={formData.expiresAt instanceof Date ? formData.expiresAt : undefined}
                    onChange={(date) => setFormData((prev: Partial<InsertBusiness>) => ({ ...prev, expiresAt: date }))}
                    placeholder="Select expiry date"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData((prev: Partial<InsertBusiness>) => ({ ...prev, isActive: checked }))}
                  data-testid="switch-partner-active"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={resetForm} data-testid="button-cancel">Cancel</Button>
              <Button type="submit" data-testid="button-save-partner">
                {createBusiness.isPending || updateBusiness.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>{editingBusiness ? 'Update' : 'Create'} Partner</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Guides</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredBusinesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No business partners found
                </TableCell>
              </TableRow>
            ) : (
              filteredBusinesses.map(business => {
                const counts = getBusinessCounts(business.id);
                return (
                  <TableRow key={business.id}>
                    <TableCell data-testid={`text-partner-name-${business.id}`}>
                      <div>
                        <p className="font-medium">{business.name}</p>
                        {business.contactPerson && (
                          <p className="text-sm text-muted-foreground">{business.contactPerson}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-partner-email-${business.id}`}>{business.email}</TableCell>
                    <TableCell data-testid={`text-partner-phone-${business.id}`}>{business.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={business.subscriptionTier === 'premium' ? 'default' : 'secondary'}>
                        {business.subscriptionTier}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-partner-guides-${business.id}`}>{counts.guides}</TableCell>
                    <TableCell data-testid={`text-partner-campaigns-${business.id}`}>{counts.campaigns}</TableCell>
                    <TableCell>
                      <Badge variant={business.isActive ? 'default' : 'secondary'}>
                        {business.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditBusiness(business)}
                          data-testid={`button-edit-${business.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              data-testid={`button-delete-${business.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Business Partner</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{business.name}"? This will also delete all associated guides and ad campaigns. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteBusiness.mutate(business.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Ad Campaigns Management Component
function AdCampaignsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  // Campaign form state
  const [formData, setFormData] = useState<Partial<InsertAdCampaign>>({
    businessId: '',
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

  // Fetch all data
  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: campaigns = [], isLoading } = useQuery<AdCampaign[]>({
    queryKey: ['/api/ad-campaigns'],
  });

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesBusiness = filterBusiness === 'all' || campaign.businessId === filterBusiness;
      const matchesType = filterType === 'all' || campaign.adType === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && campaign.isActive) ||
        (filterStatus === 'inactive' && !campaign.isActive);
      return matchesBusiness && matchesType && matchesStatus;
    });
  }, [campaigns, filterBusiness, filterType, filterStatus]);

  // Calculate CTR
  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  // Get business name
  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown';
  };

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (campaign: InsertAdCampaign) => {
      const response = await apiRequest('POST', '/api/ad-campaigns', campaign);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ad-campaigns'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Ad campaign created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create ad campaign',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Update campaign mutation
  const updateCampaign = useMutation({
    mutationFn: async ({ id, campaign }: { id: number; campaign: Partial<InsertAdCampaign> }) => {
      const response = await apiRequest('PUT', `/api/ad-campaigns/${id}`, campaign);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ad-campaigns'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Ad campaign updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update ad campaign',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/ad-campaigns/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ad-campaigns'] });
      toast({
        title: 'Success',
        description: 'Ad campaign deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete ad campaign',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<InsertAdCampaign>) => ({ 
      ...prev, 
      [name]: ['priority', 'dailyBudget', 'totalBudget'].includes(name) 
        ? parseInt(value) || 0 
        : value 
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessId || !formData.campaignName || !formData.mediaUrl) {
      toast({
        title: 'Validation Error',
        description: 'Business, Campaign Name and Media URL are required fields',
        variant: 'destructive',
      });
      return;
    }

    const campaignData = {
      businessId: formData.businessId!,
      campaignName: formData.campaignName!,
      adType: formData.adType!,
      categoryId: formData.categoryId || null,
      mediaUrl: formData.mediaUrl!,
      mediaType: formData.mediaType || 'image',
      targetUrl: formData.targetUrl || null,
      isActive: formData.isActive ?? true,
      priority: formData.priority || 0,
      dailyBudget: formData.dailyBudget || null,
      totalBudget: formData.totalBudget || null,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null
    } as InsertAdCampaign;

    if (editingCampaign) {
      updateCampaign.mutate({ id: editingCampaign.id, campaign: campaignData });
    } else {
      createCampaign.mutate(campaignData);
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      businessId: '',
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
    setIsAdding(false);
  };

  // Set up edit mode
  const handleEditCampaign = (campaign: AdCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      businessId: campaign.businessId,
      campaignName: campaign.campaignName,
      adType: campaign.adType,
      categoryId: campaign.categoryId || '',
      mediaUrl: campaign.mediaUrl,
      mediaType: campaign.mediaType || 'image',
      targetUrl: campaign.targetUrl || '',
      isActive: campaign.isActive,
      priority: campaign.priority || 0,
      dailyBudget: campaign.dailyBudget || 0,
      totalBudget: campaign.totalBudget || 0,
      startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
      endDate: campaign.endDate ? new Date(campaign.endDate) : undefined
    });
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ad Campaigns</h2>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "secondary" : "default"}
          disabled={businesses.length === 0}
          data-testid="button-add-campaign"
        >
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Campaign</>}
        </Button>
      </div>

      {businesses.length === 0 && !isLoading && (
        <div className="text-center py-8 mb-6">
          <p className="text-muted-foreground">Please create at least one business partner before adding campaigns.</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex gap-4 mb-6">
        <Select value={filterBusiness} onValueChange={setFilterBusiness}>
          <SelectTrigger className="w-48" data-testid="select-filter-business">
            <SelectValue placeholder="Filter by business" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Businesses</SelectItem>
            {businesses.filter(business => business.id && business.id !== '').map(business => (
              <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48" data-testid="select-filter-type">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fullscreen">Fullscreen</SelectItem>
            <SelectItem value="homepage_a4">Homepage A4</SelectItem>
            <SelectItem value="category_a4">Category A4</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isAdding && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingCampaign ? 'Edit Ad Campaign' : 'Add New Ad Campaign'}</CardTitle>
            <CardDescription>
              {editingCampaign 
                ? 'Update the ad campaign details below' 
                : 'Fill in the details to create a new ad campaign'
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="businessId" className="text-sm font-medium">Business *</label>
                  <Select 
                    value={formData.businessId} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertAdCampaign>) => ({ ...prev, businessId: value }))}
                  >
                    <SelectTrigger data-testid="select-campaign-business">
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.filter(business => business.id && business.id !== '').map(business => (
                        <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="campaignName" className="text-sm font-medium">Campaign Name *</label>
                  <Input 
                    id="campaignName" 
                    name="campaignName" 
                    value={formData.campaignName} 
                    onChange={handleInputChange}
                    placeholder="Summer Sale 2024"
                    data-testid="input-campaign-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="adType" className="text-sm font-medium">Ad Type *</label>
                  <Select 
                    value={formData.adType} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertAdCampaign>) => ({ ...prev, adType: value }))}
                  >
                    <SelectTrigger data-testid="select-campaign-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                      <SelectItem value="homepage_a4">Homepage A4</SelectItem>
                      <SelectItem value="category_a4">Category A4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">Category (optional)</label>
                  <Select 
                    value={formData.categoryId || 'none'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertAdCampaign>) => ({ ...prev, categoryId: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger data-testid="select-campaign-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.filter(category => category.id && category.id !== '').map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                  <Input 
                    id="priority" 
                    name="priority"
                    type="number" 
                    value={formData.priority ?? 0} 
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    data-testid="input-campaign-priority"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="mediaUrl" className="text-sm font-medium">Media URL *</label>
                  <Input 
                    id="mediaUrl" 
                    name="mediaUrl" 
                    value={formData.mediaUrl} 
                    onChange={handleInputChange}
                    placeholder="https://..."
                    data-testid="input-campaign-media"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="targetUrl" className="text-sm font-medium">Target URL</label>
                  <Input 
                    id="targetUrl" 
                    name="targetUrl" 
                    value={formData.targetUrl || ''} 
                    onChange={handleInputChange}
                    placeholder="https://..."
                    data-testid="input-campaign-target"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="dailyBudget" className="text-sm font-medium">Daily Budget ($)</label>
                  <Input 
                    id="dailyBudget" 
                    name="dailyBudget"
                    type="number" 
                    value={formData.dailyBudget ?? 0} 
                    onChange={handleInputChange}
                    placeholder="100"
                    min="0"
                    data-testid="input-campaign-daily-budget"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="totalBudget" className="text-sm font-medium">Total Budget ($)</label>
                  <Input 
                    id="totalBudget" 
                    name="totalBudget"
                    type="number" 
                    value={formData.totalBudget ?? 0} 
                    onChange={handleInputChange}
                    placeholder="1000"
                    min="0"
                    data-testid="input-campaign-total-budget"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                  <DatePicker
                    date={formData.startDate instanceof Date ? formData.startDate : undefined}
                    onChange={(date) => setFormData((prev: Partial<InsertAdCampaign>) => ({ ...prev, startDate: date }))}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                  <DatePicker
                    date={formData.endDate instanceof Date ? formData.endDate : undefined}
                    onChange={(date) => setFormData((prev: Partial<InsertAdCampaign>) => ({ ...prev, endDate: date }))}
                    placeholder="Select end date"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData((prev: Partial<InsertAdCampaign>) => ({ ...prev, isActive: checked }))}
                  data-testid="switch-campaign-active"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
              <Button type="submit" data-testid="button-save-campaign">
                {createCampaign.isPending || updateCampaign.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>{editingCampaign ? 'Update' : 'Create'} Campaign</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Impressions</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                  No ad campaigns found
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell data-testid={`text-campaign-name-${campaign.id}`}>{campaign.campaignName}</TableCell>
                  <TableCell data-testid={`text-campaign-business-${campaign.id}`}>{getBusinessName(campaign.businessId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.adType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-campaign-impressions-${campaign.id}`}>{campaign.impressions || 0}</TableCell>
                  <TableCell data-testid={`text-campaign-clicks-${campaign.id}`}>{campaign.clicks || 0}</TableCell>
                  <TableCell data-testid={`text-campaign-ctr-${campaign.id}`}>
                    {calculateCTR(campaign.impressions || 0, campaign.clicks || 0)}
                  </TableCell>
                  <TableCell>
                    {campaign.totalBudget ? `$${campaign.totalBudget}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCampaign(campaign)}
                        data-testid={`button-edit-campaign-${campaign.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-delete-campaign-${campaign.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Ad Campaign</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{campaign.campaignName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteCampaign.mutate(campaign.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
    queryFn: async () => {
      // Since we don't have a dashboard endpoint, let's aggregate from existing data
      const [eventsResponse, campaignsResponse, guidesResponse] = await Promise.all([
        fetch('/api/analytics/events', { credentials: 'include' }),
        fetch('/api/ad-campaigns', { credentials: 'include' }),
        fetch('/api/guides', { credentials: 'include' })
      ]);

      const events: AnalyticsEvent[] = await eventsResponse.json();
      const campaigns: AdCampaign[] = await campaignsResponse.json();
      const guides: Guide[] = await guidesResponse.json();

      // Calculate summary metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayEvents = events.filter((e: AnalyticsEvent) => 
        new Date(e.createdAt!) >= today
      );

      const impressionsToday = todayEvents.filter((e: AnalyticsEvent) => 
        e.eventType === 'impression'
      ).length;

      const clicksToday = todayEvents.filter((e: AnalyticsEvent) => 
        e.eventType === 'click'
      ).length;

      const activeCampaigns = campaigns.filter((c: AdCampaign) => c.isActive).length;

      // Calculate 7-day trend
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayEvents = events.filter((e: AnalyticsEvent) => {
          const eventDate = new Date(e.createdAt!);
          return eventDate >= date && eventDate < nextDate;
        });

        last7Days.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          impressions: dayEvents.filter((e: AnalyticsEvent) => e.eventType === 'impression').length,
          clicks: dayEvents.filter((e: AnalyticsEvent) => e.eventType === 'click').length
        });
      }

      // Top performing campaigns
      const campaignPerformance = campaigns.map((c: AdCampaign) => ({
        ...c,
        ctr: (c.impressions || 0) > 0 ? ((c.clicks || 0) / (c.impressions || 0)) * 100 : 0
      })).sort((a: any, b: any) => b.ctr - a.ctr).slice(0, 5);

      // Top performing guides
      const guidePerformance = guides
        .sort((a: Guide, b: Guide) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 5);

      return {
        impressionsToday,
        clicksToday,
        averageCTR: impressionsToday > 0 ? (clicksToday / impressionsToday) * 100 : 0,
        activeCampaigns,
        last7Days,
        topCampaigns: campaignPerformance,
        topGuides: guidePerformance
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = analyticsData || {
    impressionsToday: 0,
    clicksToday: 0,
    averageCTR: 0,
    activeCampaigns: 0,
    last7Days: [],
    topCampaigns: [],
    topGuides: []
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Impressions Today
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-impressions-today">{data.impressionsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clicks Today
            </CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-clicks-today">{data.clicksToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average CTR
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-average-ctr">{data.averageCTR.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-campaigns">{data.activeCampaigns}</div>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Impressions & Clicks (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#8884d8" name="Impressions" />
              <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns (by CTR)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Impressions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No campaigns data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topCampaigns.map((campaign: any) => (
                    <TableRow key={campaign.id}>
                      <TableCell data-testid={`text-top-campaign-${campaign.id}`}>{campaign.campaignName}</TableCell>
                      <TableCell data-testid={`text-top-campaign-ctr-${campaign.id}`}>{campaign.ctr.toFixed(2)}%</TableCell>
                      <TableCell data-testid={`text-top-campaign-impressions-${campaign.id}`}>{campaign.impressions || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Guides (by Views)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guide</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topGuides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No guides data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topGuides.map((guide: Guide) => (
                    <TableRow key={guide.id}>
                      <TableCell data-testid={`text-top-guide-${guide.id}`}>{guide.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{guide.type || 'resort'}</Badge>
                      </TableCell>
                      <TableCell data-testid={`text-top-guide-views-${guide.id}`}>{guide.impressions || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Categories Manager Component
function CategoriesManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Category form state
  const [formData, setFormData] = useState<Partial<InsertCategory>>({
    id: '',
    name: '',
    description: '',
    color: '#000000',
    imageUrl: ''
  });

  // Fetch all categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (category: InsertCategory) => {
      const response = await apiRequest('POST', '/api/categories', category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: InsertCategory }) => {
      const response = await apiRequest('PUT', `/api/categories/${id}`, category);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    },
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    },
  });

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<InsertCategory>) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.description || !formData.color || !formData.imageUrl) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }
    
    const categoryData = formData as InsertCategory;
    
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, category: categoryData });
    } else {
      createCategory.mutate(categoryData);
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      color: '#000000',
      imageUrl: ''
    });
    setEditingCategory(null);
    setIsAdding(false);
  };

  // Set up edit mode
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      imageUrl: category.imageUrl
    });
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "default"}>
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Category</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
            <CardDescription>
              {editingCategory 
                ? 'Update the category details below' 
                : 'Fill in the details to create a new category'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="id" className="text-sm font-medium">ID (used in URLs)</label>
                  <Input 
                    id="id" 
                    name="id" 
                    value={formData.id} 
                    onChange={handleInputChange} 
                    placeholder="dining" 
                    disabled={!!editingCategory}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Dining" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Category description..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                  <Input id="color" name="color" type="color" value={formData.color} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium">Image URL</label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 bg-gray-50 border-t border-gray-200">
              <Button 
                variant="outline" 
                type="button" 
                onClick={resetForm}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
              >
                {(createCategory.isPending || updateCategory.isPending) ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                  editingCategory ? 'Update Category' : 'Create Category'
                }
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Description</TableHead>
              <TableHead className="font-semibold text-gray-700">Color</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No categories found</TableCell>
              </TableRow>
            ) : (
              categories.map(category => (
                <TableRow key={category.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-gray-600">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{category.id}</code>
                  </TableCell>
                  <TableCell className="text-gray-600">{category.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg shadow-sm border border-gray-200" style={{ backgroundColor: category.color }} />
                      <span className="text-xs text-muted-foreground">{category.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete "{category.name}"? This will also delete all guides in this category.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCategory.mutate(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Subcategories Manager Component
function SubcategoriesManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const { toast } = useToast();

  // Subcategory form state
  const [formData, setFormData] = useState<Partial<InsertSubcategory>>({
    id: '',
    name: '',
    categoryId: '',
    description: '',
    color: '#000000',
    order: 1
  });

  // Fetch all data
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories = [], isLoading } = useQuery<Subcategory[]>({
    queryKey: ['/api/subcategories'],
  });

  // Create subcategory mutation
  const createSubcategory = useMutation({
    mutationFn: async (subcategory: InsertSubcategory) => {
      const response = await apiRequest('POST', '/api/subcategories', subcategory);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Subcategory created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create subcategory',
        variant: 'destructive',
      });
    },
  });

  // Update subcategory mutation
  const updateSubcategory = useMutation({
    mutationFn: async ({ id, subcategory }: { id: string; subcategory: InsertSubcategory }) => {
      const response = await apiRequest('PUT', `/api/subcategories/${id}`, subcategory);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Subcategory updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update subcategory',
        variant: 'destructive',
      });
    },
  });

  // Delete subcategory mutation
  const deleteSubcategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/subcategories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subcategories'] });
      toast({
        title: 'Success',
        description: 'Subcategory deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete subcategory',
        variant: 'destructive',
      });
    },
  });

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<InsertSubcategory>) => ({ 
      ...prev, 
      [name]: name === 'order' ? parseInt(value) || 1 : value 
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'ID, Name and Category are required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const subcategoryData = formData as InsertSubcategory;
    
    if (editingSubcategory) {
      updateSubcategory.mutate({ id: editingSubcategory.id, subcategory: subcategoryData });
    } else {
      createSubcategory.mutate(subcategoryData);
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      categoryId: '',
      description: '',
      color: '#000000',
      order: 1
    });
    setEditingSubcategory(null);
    setIsAdding(false);
  };

  // Set up edit mode
  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      id: subcategory.id,
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      description: subcategory.description || '',
      color: subcategory.color,
      order: subcategory.order || 1
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Subcategories</h2>
            <p className="text-sm text-gray-500 mt-1">Organize your categories with subcategories</p>
          </div>
          <Button 
            onClick={() => setIsAdding(!isAdding)} 
            variant={isAdding ? "secondary" : "default"} 
            disabled={categories.length === 0}
            className={!isAdding ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg" : ""}
          >
            {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Subcategory</>}
          </Button>
        </div>
      </div>

      {categories.length === 0 && !isLoading && (
        <div className="text-center py-8 mb-6">
          <p className="text-muted-foreground">Please create at least one category before adding subcategories.</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="mb-8 shadow-xl border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1" />
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
            </CardTitle>
            <CardDescription>
              {editingSubcategory 
                ? 'Update the subcategory details below' 
                : 'Fill in the details to create a new subcategory'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="id" className="text-sm font-medium">ID (used in URLs)</label>
                  <Input 
                    id="id" 
                    name="id" 
                    value={formData.id} 
                    onChange={handleInputChange} 
                    placeholder="fine-dining" 
                    disabled={!!editingSubcategory}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">Category</label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData((prev: Partial<InsertSubcategory>) => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(category => category.id && category.id !== '').map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Fine Dining" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="order" className="text-sm font-medium">Display Order</label>
                  <Input id="order" name="order" type="number" value={formData.order} onChange={handleInputChange} min="1" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Subcategory description..." rows={2} />
              </div>
              <div className="space-y-2">
                <label htmlFor="color" className="text-sm font-medium">Color</label>
                <Input id="color" name="color" type="color" value={formData.color} onChange={handleInputChange} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 bg-gray-50 border-t border-gray-200">
              <Button 
                variant="outline" 
                type="button" 
                onClick={resetForm}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
              >
                {(createSubcategory.isPending || updateSubcategory.isPending) ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                  editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'
                }
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Description</TableHead>
              <TableHead className="font-semibold text-gray-700">Order</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : subcategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No subcategories found</TableCell>
              </TableRow>
            ) : (
              subcategories.map(subcategory => (
                <TableRow key={subcategory.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{subcategory.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryName(subcategory.categoryId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{subcategory.id}</code>
                  </TableCell>
                  <TableCell className="text-gray-600">{subcategory.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{subcategory.order || 1}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditSubcategory(subcategory)}
                        className="hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete "{subcategory.name}"?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSubcategory.mutate(subcategory.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Updated Guides Manager with new fields
function GuidesManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [content, setContent] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();
  
  // Guide form state  
  const [formData, setFormData] = useState<Partial<InsertGuide>>({
    id: '',
    categoryId: '',
    subcategoryId: '',
    title: '',
    excerpt: '',
    order: 1,
    type: 'resort',
    businessId: null,
    isPremium: false,
    adTier: null,
    validUntil: null
  });
  
  // Fetch all data
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ['/api/subcategories'],
  });

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });
  
  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });

  // Filter guides by type
  const filteredGuides = useMemo(() => {
    if (filterType === 'all') return guides;
    return guides.filter(guide => guide.type === filterType);
  }, [guides, filterType]);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Get subcategory name by ID
  const getSubcategoryName = (subcategoryId: string | null) => {
    if (!subcategoryId) return '-';
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown';
  };

  // Get business name
  const getBusinessName = (businessId: string | null) => {
    if (!businessId) return '-';
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown';
  };

  // Get subcategories for selected category
  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(s => s.categoryId === categoryId);
  };
  
  // Create guide mutation
  const createGuide = useMutation({
    mutationFn: async (guide: InsertGuide) => {
      const response = await apiRequest('POST', '/api/guides', guide);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Guide created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create guide',
        variant: 'destructive',
      });
      console.error(error);
    },
  });
  
  // Update guide mutation
  const updateGuide = useMutation({
    mutationFn: async ({ id, guide }: { id: string; guide: InsertGuide }) => {
      const response = await apiRequest('PUT', `/api/guides/${id}`, guide);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Guide updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update guide',
        variant: 'destructive',
      });
      console.error(error);
    },
  });
  
  // Delete guide mutation
  const deleteGuide = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/guides/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: 'Success',
        description: 'Guide deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete guide',
        variant: 'destructive',
      });
      console.error(error);
    },
  });
  
  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<InsertGuide>) => ({ 
      ...prev, 
      [name]: name === 'order' ? parseInt(value) || 0 : value 
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.categoryId || !formData.title || !formData.excerpt || !content) {
      toast({
        title: 'Validation Error',
        description: 'ID, Category, Title, Excerpt and Content are required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const guideData = {
      id: formData.id!,
      categoryId: formData.categoryId!,
      subcategoryId: formData.subcategoryId || null,
      title: formData.title!,
      excerpt: formData.excerpt!,
      content: content,
      order: formData.order || 1,
      type: formData.type || 'resort',
      businessId: formData.businessId || null,
      isPremium: formData.isPremium || false,
      adTier: formData.adTier || null,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : null
    } as InsertGuide;
    
    if (editingGuide) {
      updateGuide.mutate({ id: editingGuide.id, guide: guideData });
    } else {
      createGuide.mutate(guideData);
    }
  };
  
  // Reset form state
  const resetForm = () => {
    setFormData({
      id: '',
      categoryId: '',
      subcategoryId: '',
      title: '',
      excerpt: '',
      order: 1,
      type: 'resort',
      businessId: null,
      isPremium: false,
      adTier: null,
      validUntil: null
    });
    setContent('');
    setEditingGuide(null);
    setIsAdding(false);
  };
  
  // Set up edit mode
  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide);
    setFormData({
      id: guide.id,
      categoryId: guide.categoryId,
      subcategoryId: guide.subcategoryId,
      title: guide.title,
      excerpt: guide.excerpt,
      order: guide.order || 1,
      type: guide.type || 'resort',
      businessId: guide.businessId,
      isPremium: guide.isPremium || false,
      adTier: guide.adTier,
      validUntil: guide.validUntil
    });
    setContent(guide.content);
    setIsAdding(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Guides</h2>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48" data-testid="select-filter-guide-type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="sponsored">Sponsored</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setIsAdding(!isAdding)} 
            variant={isAdding ? "secondary" : "default"}
            disabled={categories.length === 0}
            data-testid="button-add-guide"
          >
            {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Guide</>}
          </Button>
        </div>
      </div>
      
      {categories.length === 0 && !isLoading && (
        <div className="text-center py-8 mb-6">
          <p className="text-muted-foreground">Please create at least one category before adding guides.</p>
        </div>
      )}
      
      {isAdding && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingGuide ? 'Edit Guide' : 'Add New Guide'}</CardTitle>
            <CardDescription>
              {editingGuide 
                ? 'Update the guide details below' 
                : 'Fill in the details to create a new guide'
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="id" className="text-sm font-medium">ID (used in URLs, no spaces)</label>
                  <Input 
                    id="id" 
                    name="id" 
                    value={formData.id} 
                    onChange={handleInputChange}
                    placeholder="getting-started-guide"
                    disabled={!!editingGuide}
                    data-testid="input-guide-id"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">Category *</label>
                  <Select 
                    value={formData.categoryId || 'none'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, categoryId: value === 'none' ? '' : value, subcategoryId: '' }))}
                  >
                    <SelectTrigger data-testid="select-guide-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a category</SelectItem>
                      {categories.filter(category => category.id && category.id !== '').map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="subcategoryId" className="text-sm font-medium">Subcategory</label>
                  <Select 
                    value={formData.subcategoryId || 'none'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, subcategoryId: value === 'none' ? null : value }))}
                    disabled={!formData.categoryId}
                  >
                    <SelectTrigger data-testid="select-guide-subcategory">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {formData.categoryId && getSubcategoriesForCategory(formData.categoryId).filter(subcategory => subcategory.id && subcategory.id !== '').map(subcategory => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Type</label>
                  <Select 
                    value={formData.type || 'resort'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-guide-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="order" className="text-sm font-medium">Display Order</label>
                  <Input 
                    id="order" 
                    name="order" 
                    type="number"
                    value={formData.order?.toString() || "1"} 
                    onChange={handleInputChange}
                    min="1"
                    data-testid="input-guide-order"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="businessId" className="text-sm font-medium">Business (optional)</label>
                  <Select 
                    value={formData.businessId || 'none'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, businessId: value === 'none' ? null : value }))}
                  >
                    <SelectTrigger data-testid="select-guide-business">
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {businesses.filter(business => business.id && business.id !== '').map(business => (
                        <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="adTier" className="text-sm font-medium">Ad Tier</label>
                  <Select 
                    value={formData.adTier || 'none'} 
                    onValueChange={(value) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, adTier: value === 'none' ? null : value }))}
                  >
                    <SelectTrigger data-testid="select-guide-ad-tier">
                      <SelectValue placeholder="Select ad tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title *</label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange}
                  placeholder="Getting Started Guide"
                  data-testid="input-guide-title"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="excerpt" className="text-sm font-medium">Excerpt *</label>
                <Textarea 
                  id="excerpt" 
                  name="excerpt" 
                  value={formData.excerpt} 
                  onChange={handleInputChange}
                  placeholder="A brief description of this guide..."
                  rows={2}
                  data-testid="textarea-guide-excerpt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="validUntil" className="text-sm font-medium">Valid Until</label>
                  <DatePicker
                    date={formData.validUntil ? new Date(formData.validUntil) : undefined}
                    onChange={(date) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, validUntil: date ? date.toISOString() : null }))}
                    placeholder="Select expiry date"
                  />
                </div>
                <div className="flex items-center space-x-2 self-end pb-2">
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium ?? false}
                    onCheckedChange={(checked) => setFormData((prev: Partial<InsertGuide>) => ({ ...prev, isPremium: checked }))}
                    data-testid="switch-guide-premium"
                  />
                  <label
                    htmlFor="isPremium"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Premium Guide
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <ContentEditor
                  initialContent={content}
                  onChange={setContent}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
              <Button type="submit" data-testid="button-save-guide">
                {createGuide.isPending || updateGuide.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>{editingGuide ? 'Update' : 'Create'} Guide</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredGuides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No guides found
                </TableCell>
              </TableRow>
            ) : (
              filteredGuides.map(guide => (
                <TableRow key={guide.id}>
                  <TableCell data-testid={`text-guide-title-${guide.id}`}>{guide.title}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={guide.type === 'partner' ? 'default' : guide.type === 'sponsored' ? 'secondary' : 'outline'}
                      data-testid={`badge-guide-type-${guide.id}`}
                    >
                      {guide.type || 'resort'}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-guide-category-${guide.id}`}>{getCategoryName(guide.categoryId)}</TableCell>
                  <TableCell data-testid={`text-guide-subcategory-${guide.id}`}>{getSubcategoryName(guide.subcategoryId ?? null)}</TableCell>
                  <TableCell data-testid={`text-guide-business-${guide.id}`}>{getBusinessName(guide.businessId ?? null)}</TableCell>
                  <TableCell>
                    {guide.isPremium && <Badge variant="default">Premium</Badge>}
                  </TableCell>
                  <TableCell data-testid={`text-guide-order-${guide.id}`}>{guide.order || 1}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditGuide(guide)}
                        data-testid={`button-edit-guide-${guide.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-delete-guide-${guide.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Guide</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{guide.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteGuide.mutate(guide.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Main Admin Panel Component
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('categories');
  const { toast } = useToast();
  
  // Quick stats
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ['/api/categories'] });
  const { data: guides = [] } = useQuery<Guide[]>({ queryKey: ['/api/guides'] });
  const { data: businesses = [] } = useQuery<Business[]>({ queryKey: ['/api/businesses'] });
  const { data: adCampaigns = [] } = useQuery<AdCampaign[]>({ queryKey: ['/api/ad-campaigns'] });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container py-8">
        {/* Modern Header with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Manage your resort guide platform</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-6 py-3 border border-blue-100">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
                  <p className="text-xs text-gray-600">Categories</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-6 py-3 border border-purple-100">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{guides.length}</p>
                  <p className="text-xs text-gray-600">Guides</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-6 py-3 border border-green-100">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{businesses.length}</p>
                  <p className="text-xs text-gray-600">Partners</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl px-6 py-3 border border-orange-100">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {adCampaigns.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-xs text-gray-600">Active Ads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <Tabs defaultValue="categories" onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid w-full grid-cols-7 bg-white/80 backdrop-blur-xl p-2 rounded-xl shadow-lg border border-gray-100">
          <TabsTrigger 
            value="categories" 
            data-testid="tab-categories"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="subcategories" 
            data-testid="tab-subcategories"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <Layers className="w-4 h-4 mr-2" />
            Subcategories
          </TabsTrigger>
          <TabsTrigger 
            value="guides" 
            data-testid="tab-guides"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger 
            value="partners" 
            data-testid="tab-partners"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <Building className="w-4 h-4 mr-2" />
            Partners
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            data-testid="tab-campaigns"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            data-testid="tab-analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="screensaver" 
            data-testid="tab-screensaver"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Screensaver
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
        
        <TabsContent value="subcategories">
          <SubcategoriesManager />
        </TabsContent>
        
        <TabsContent value="guides">
          <GuidesManager />
        </TabsContent>

        <TabsContent value="partners">
          <PartnersManager />
        </TabsContent>

        <TabsContent value="campaigns">
          <AdCampaignsManager />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="screensaver">
          <ScreensaverSettings />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}