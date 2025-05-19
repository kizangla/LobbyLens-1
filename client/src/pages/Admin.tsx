import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ContentEditor from '@/components/ContentEditor';
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Category, Guide, InsertCategory, InsertGuide, Subcategory } from '@/lib/types';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('categories');
  const { toast } = useToast();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-8">Admin Panel</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
        
        <TabsContent value="guides">
          <GuidesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoriesManager() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  
  // Category form state
  const [formData, setFormData] = useState<Partial<InsertCategory>>({
    id: '',
    name: '',
    description: '',
    color: '#f5c6aa',
    imageUrl: ''
  });
  
  // Fetch all categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (category: InsertCategory) => {
      return apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      } as RequestInit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create category: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: InsertCategory }) => {
      return apiRequest(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      } as RequestInit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update category: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/categories/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete category: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    // Convert to proper InsertCategory
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
      color: '#f5c6aa',
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
  
  // Handle category deletion with confirmation
  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all guides in this category.')) {
      deleteCategory.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "secondary" : "default"}
        >
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
                : 'Fill in the details to create a new category'
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
                    placeholder="hotel-guide"
                    disabled={!!editingCategory}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="Hotel Guide"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  placeholder="Essential information about hotel services and facilities"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="color" 
                      name="color" 
                      type="color"
                      value={formData.color} 
                      onChange={handleInputChange}
                      className="w-12 h-10"
                    />
                    <Input 
                      name="color" 
                      value={formData.color} 
                      onChange={handleInputChange}
                      placeholder="#f5c6aa"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium">Image URL</label>
                  <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No categories found. Create your first category!</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function GuidesManager() {
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  
  // Guide form state
  const [formData, setFormData] = useState<Partial<InsertGuide>>({
    id: '',
    categoryId: '',
    subcategoryId: '',
    title: '',
    excerpt: '',
    content: '',
    order: 1
  });
  
  // Fetch all categories for the dropdown
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch all guides
  const { data: guides = [], isLoading: guidesLoading } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });
  
  // Fetch all subcategories
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<Subcategory[]>({
    queryKey: ['/api/subcategories'],
  });
  
  // Organize subcategories by categoryId for easier selection
  const subcategoriesByCategory = useMemo(() => {
    const result: Record<string, Subcategory[]> = {};
    
    subcategories.forEach((subcategory) => {
      if (!result[subcategory.categoryId]) {
        result[subcategory.categoryId] = [];
      }
      result[subcategory.categoryId].push(subcategory);
    });
    
    return result;
  }, [subcategories]);
  
  // Create guide mutation
  const createGuide = useMutation({
    mutationFn: async (guide: InsertGuide) => {
      return apiRequest('/api/guides', {
        method: 'POST',
        body: JSON.stringify(guide),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Guide created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create guide: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update guide mutation
  const updateGuide = useMutation({
    mutationFn: async ({ id, guide }: { id: string; guide: InsertGuide }) => {
      return apiRequest(`/api/guides/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guide),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      resetForm();
      toast({
        title: 'Success',
        description: 'Guide updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update guide: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete guide mutation
  const deleteGuide = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/guides/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: 'Success',
        description: 'Guide deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete guide: ${error}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.categoryId || !formData.title || !formData.excerpt || !formData.content) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert to proper InsertGuide
    const guideData = formData as InsertGuide;
    
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
      content: '',
      order: 1
    });
    setEditingGuide(null);
    setIsAdding(false);
  };
  
  // Set up edit mode
  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide);
    setFormData({
      id: guide.id,
      categoryId: guide.categoryId,
      subcategoryId: guide.subcategoryId || '',
      title: guide.title,
      excerpt: guide.excerpt,
      content: guide.content,
      order: guide.order || 1
    });
    setIsAdding(true);
  };
  
  // Handle guide deletion with confirmation
  const handleDeleteGuide = (id: string) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      deleteGuide.mutate(id);
    }
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Determine if loading
  const isLoading = categoriesLoading || guidesLoading;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Guides</h2>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "secondary" : "default"}
          disabled={categories.length === 0}
        >
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Guide</>}
        </Button>
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
                    placeholder="wifi-access"
                    disabled={!!editingGuide}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="categoryId" className="text-sm font-medium">Category</label>
                  <select 
                    id="categoryId" 
                    name="categoryId" 
                    value={formData.categoryId} 
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subcategoryId" className="text-sm font-medium">Subcategory</label>
                <select 
                  id="subcategoryId" 
                  name="subcategoryId" 
                  value={formData.subcategoryId || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  disabled={!formData.categoryId}
                >
                  <option value="">Select a subcategory</option>
                  {formData.categoryId && (
                    <>
                      {/* Using hardcoded subcategories from our application */}
                      {subcategoriesByCategory[formData.categoryId]?.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {!formData.categoryId && (
                  <p className="text-xs text-muted-foreground mt-1">Please select a category first</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange}
                    placeholder="WiFi Access"
                  />
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
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="excerpt" className="text-sm font-medium">Excerpt/Summary</label>
                <Textarea 
                  id="excerpt" 
                  name="excerpt" 
                  value={formData.excerpt} 
                  onChange={handleInputChange}
                  placeholder="Brief description of the guide content"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Content</label>
                <div className="border rounded-md">
                  <ContentEditor
                    initialContent={formData.content}
                    onChange={(content) => {
                      setFormData(prev => ({
                        ...prev,
                        content
                      }));
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Design your guide with multiple content sections. The left column will display as a carousel, 
                  and the right column will show a menu and QR code.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={createGuide.isPending || updateGuide.isPending}
              >
                {(createGuide.isPending || updateGuide.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingGuide ? 'Update Guide' : 'Create Guide'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No guides found. Create your first guide!</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">{guide.id}</TableCell>
                  <TableCell>{guide.title}</TableCell>
                  <TableCell>{getCategoryName(guide.categoryId)}</TableCell>
                  <TableCell>{guide.order || 1}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditGuide(guide)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteGuide(guide.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}