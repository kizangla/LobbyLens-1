import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Eye, Loader2, Search, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import ContentEditor from '@/components/ContentEditor';
import { Guide, InsertGuide, Category } from '@/lib/types';

interface PartnerGuidesProps {
  businessId: string;
}

export default function PartnerGuides({ businessId }: PartnerGuidesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [deleteGuideId, setDeleteGuideId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<InsertGuide> & { subtitle?: string; isActive?: boolean }>({
    id: '',
    title: '',
    subtitle: '',
    content: '',
    categoryId: '',
    isPremium: false,
    isActive: true,
    type: 'standard',
    businessId: businessId,
  });

  // Fetch partner's guides
  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: [`/api/guides/business/${businessId}`],
    enabled: !!businessId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter guides based on search
  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create guide mutation
  const createGuide = useMutation({
    mutationFn: async (guide: InsertGuide) => {
      const response = await apiRequest('POST', '/api/partner/guides', guide);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guides/business/${businessId}`] });
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
    mutationFn: async ({ id, guide }: { id: string; guide: Partial<InsertGuide> }) => {
      const response = await apiRequest('PUT', `/api/partner/guides/${id}`, guide);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guides/business/${businessId}`] });
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
      const response = await apiRequest('DELETE', `/api/partner/guides/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guides/business/${businessId}`] });
      setDeleteGuideId(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.categoryId || !formData.content) {
      toast({
        title: 'Validation Error',
        description: 'Title, Category, and Content are required',
        variant: 'destructive',
      });
      return;
    }

    const guideData: InsertGuide & { subtitle?: string; isActive?: boolean } = {
      id: formData.id || `${businessId}-${Date.now()}`,
      title: formData.title,
      excerpt: formData.subtitle || formData.title.substring(0, 100),
      subtitle: formData.subtitle || '',
      content: formData.content,
      categoryId: formData.categoryId,
      isPremium: formData.isPremium || false,
      isActive: formData.isActive ?? true,
      type: formData.type || 'standard',
      businessId: businessId,
    };

    if (editingGuide) {
      updateGuide.mutate({ id: editingGuide.id, guide: guideData });
    } else {
      createGuide.mutate(guideData);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      subtitle: '',
      content: '',
      categoryId: '',
      isPremium: false,
      isActive: true,
      type: 'standard',
      businessId: businessId,
    });
    setEditingGuide(null);
    setIsDialogOpen(false);
  };

  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide);
    setFormData({
      id: guide.id,
      title: guide.title,
      subtitle: guide.subtitle || '',
      content: guide.content,
      categoryId: guide.categoryId,
      isPremium: guide.isPremium || false,
      isActive: guide.isActive ?? true,
      type: guide.type || 'standard',
      businessId: businessId,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Guides</CardTitle>
              <CardDescription>
                Manage your business guides and sponsored content
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              data-testid="button-create-guide"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Guide
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-guides"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guides Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Impressions</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">CTR</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredGuides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No guides found matching your search' : 'No guides created yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuides.map(guide => {
                  const ctr = guide.impressions && guide.impressions > 0
                    ? ((guide.clickCount || 0) / guide.impressions * 100).toFixed(2)
                    : '0.00';
                  
                  return (
                    <TableRow key={guide.id}>
                      <TableCell data-testid={`text-guide-title-${guide.id}`}>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{guide.title}</p>
                          {guide.subtitle && (
                            <p className="text-sm text-muted-foreground truncate">
                              {guide.subtitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categories.find(c => c.id === guide.categoryId)?.name || guide.categoryId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {guide.isPremium && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-sm capitalize">
                            {guide.type || 'standard'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={guide.isActive ? 'default' : 'secondary'}>
                          {guide.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-guide-impressions-${guide.id}`}>
                        {guide.impressions || 0}
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-guide-clicks-${guide.id}`}>
                        {guide.clickCount || 0}
                      </TableCell>
                      <TableCell className="text-center" data-testid={`text-guide-ctr-${guide.id}`}>
                        {ctr}%
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`/guide/${guide.id}`, '_blank')}
                            data-testid={`button-preview-${guide.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGuide(guide)}
                            data-testid={`button-edit-guide-${guide.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteGuideId(guide.id)}
                            data-testid={`button-delete-guide-${guide.id}`}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGuide ? 'Edit Guide' : 'Create New Guide'}
            </DialogTitle>
            <DialogDescription>
              {editingGuide 
                ? 'Update the guide details below' 
                : 'Create a new guide for your business'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter guide title"
                  required
                  data-testid="input-guide-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger data-testid="select-guide-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief description"
                data-testid="input-guide-subtitle"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <ContentEditor
                initialContent={formData.content || ''}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Guide Type</Label>
                <Select 
                  value={formData.type || 'standard'} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="select-guide-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="sponsored">Sponsored</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                    data-testid="switch-guide-premium"
                  />
                  <Label htmlFor="isPremium" className="flex items-center">
                    <Crown className="mr-1 h-3 w-3 text-amber-500" />
                    Premium Content
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-guide-active"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={createGuide.isPending || updateGuide.isPending}>
                {createGuide.isPending || updateGuide.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingGuide ? 'Update' : 'Create'} Guide</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteGuideId} onOpenChange={() => setDeleteGuideId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this guide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGuideId && deleteGuide.mutate(deleteGuideId)}
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