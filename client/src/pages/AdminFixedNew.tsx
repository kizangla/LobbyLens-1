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
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Category, Guide, InsertCategory, InsertGuide, Subcategory } from '@/lib/types';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('categories');
  const { toast } = useToast();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <Tabs defaultValue="categories" onValueChange={setActiveTab}>
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
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  
  // Category form state
  const [formData, setFormData] = useState<Partial<InsertCategory>>({
    id: '',
    name: '',
    description: '',
    color: '#3b82f6',
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
      });
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
        description: 'Failed to create category',
        variant: 'destructive',
      });
      console.error(error);
    },
  });
  
  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: InsertCategory }) => {
      return apiRequest(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
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
        description: 'Failed to update category',
        variant: 'destructive',
      });
      console.error(error);
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
        description: 'Failed to delete category',
        variant: 'destructive',
      });
      console.error(error);
    },
  });
  
  // Input change handler
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
      color: '#3b82f6',
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
                    placeholder="city-guide"
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
                    placeholder="City Guide"
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
                  placeholder="A guide to exploring the city"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                  <div className="flex space-x-2">
                    <Input 
                      id="color" 
                      name="color" 
                      type="color"
                      value={formData.color} 
                      onChange={handleInputChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      name="color"
                      value={formData.color} 
                      onChange={handleInputChange}
                      className="flex-1"
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
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
              <Button type="submit">
                {createCategory.isPending || updateCategory.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <>{editingCategory ? 'Update' : 'Create'} Category</>
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
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Actions</TableHead>
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
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GuidesManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
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
  
  console.log("Current guides:", guides);
  
  // Fetch all subcategories
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<Subcategory[]>({
    queryKey: ['/api/subcategories'],
  });
  
  console.log("Loaded subcategories:", subcategories);
  
  // Organize subcategories by categoryId for easier selection
  const subcategoriesByCategory = useMemo(() => {
    const result: Record<string, Subcategory[]> = {};
    
    // Debug what subcategories we have
    console.log("Current subcategories:", subcategories);
    
    subcategories.forEach((subcategory) => {
      if (!result[subcategory.categoryId]) {
        result[subcategory.categoryId] = [];
      }
      result[subcategory.categoryId].push(subcategory);
    });
    
    // Also add subcategories to alternative category ID formats
    // This handles cases where 'fb-guide' and 'f&b-guide' might be different
    Object.keys(result).forEach(categoryId => {
      // For fb-guide, also add to f&b-guide and vice versa
      if (categoryId === 'fb-guide') {
        result['f&b-guide'] = result[categoryId];
      } else if (categoryId === 'f&b-guide') {
        result['fb-guide'] = result[categoryId];
      }
    });
    
    console.log("Organized subcategories:", result);
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
      return apiRequest(`/api/guides/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guide),
      });
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
      return apiRequest(`/api/guides/${id}`, {
        method: 'DELETE',
      });
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
  };
  
  // Handle content change from the editor
  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
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
              <div className="space-y-4">
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
                
                <div className="grid grid-cols-2 gap-4">
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
                      {formData.categoryId && subcategoriesByCategory[formData.categoryId]?.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                    {!formData.categoryId && (
                      <p className="text-xs text-muted-foreground mt-1">Please select a category first</p>
                    )}
                  </div>
                </div>
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
                  <label htmlFor="excerpt" className="text-sm font-medium">Excerpt/Summary</label>
                  <Textarea 
                    id="excerpt" 
                    name="excerpt" 
                    value={formData.excerpt} 
                    onChange={handleInputChange}
                    placeholder="Brief description of the guide content"
                    rows={1}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Content</label>
                <ContentEditor 
                  initialContent={formData.content} 
                  onChange={handleContentChange} 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
              <Button type="submit">
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
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : guides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No guides found
                </TableCell>
              </TableRow>
            ) : (
              guides.map(guide => (
                <TableRow key={guide.id}>
                  <TableCell>{guide.id}</TableCell>
                  <TableCell className="max-w-xs truncate">{guide.title}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}