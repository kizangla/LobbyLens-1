import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Crown, Mail, Phone, Globe, MapPin, User, Building2, Loader2, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Business } from '@/lib/types';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';

interface PartnerProfileProps {
  business: Business | null;
}

export default function PartnerProfile({ business }: PartnerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { logout } = usePartnerAuth();

  // Form state
  const [formData, setFormData] = useState<Partial<Business>>({
    name: business?.name || '',
    description: business?.description || '',
    email: business?.email || '',
    phone: business?.phone || '',
    website: business?.website || '',
    logoUrl: business?.logoUrl || '',
    address: business?.address || '',
    contactPerson: business?.contactPerson || '',
  });

  // Update business mutation
  const updateBusiness = useMutation({
    mutationFn: async (data: Partial<Business>) => {
      const response = await apiRequest('PUT', `/api/partner/business/${business?.id}`, data);
      return response.json();
    },
    onSuccess: (updatedBusiness) => {
      // Update session storage with new business data
      sessionStorage.setItem('partnerBusiness', JSON.stringify(updatedBusiness));
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${business?.id}`] });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully',
      });
      window.location.reload(); // Reload to reflect changes in header
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      console.error(error);
    },
  });

  if (!business) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load business profile. Please try logging in again.
        </AlertDescription>
      </Alert>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: business.name,
      description: business.description,
      email: business.email,
      phone: business.phone,
      website: business.website,
      logoUrl: business.logoUrl,
      address: business.address,
      contactPerson: business.contactPerson,
    });
    setIsEditing(false);
  };

  // Get subscription tier details
  const getSubscriptionDetails = () => {
    switch (business.subscriptionTier) {
      case 'premium':
        return {
          name: 'Premium',
          color: 'bg-amber-100 text-amber-700',
          features: [
            'Unlimited guides',
            'Unlimited ad campaigns',
            'Advanced analytics',
            'Priority support',
            'Custom branding',
            'API access',
          ],
          nextTier: null,
        };
      case 'standard':
        return {
          name: 'Standard',
          color: 'bg-blue-100 text-blue-700',
          features: [
            'Up to 50 guides',
            'Up to 10 ad campaigns',
            'Standard analytics',
            'Email support',
            'Basic customization',
          ],
          nextTier: 'premium',
        };
      default:
        return {
          name: 'Basic',
          color: 'bg-gray-100 text-gray-700',
          features: [
            'Up to 10 guides',
            'Up to 3 ad campaigns',
            'Basic analytics',
            'Community support',
          ],
          nextTier: 'standard',
        };
    }
  };

  const subscriptionDetails = getSubscriptionDetails();

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Manage your business profile and contact details
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={updateBusiness.isPending}
                  data-testid="button-save-profile"
                >
                  {updateBusiness.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <Building2 className="inline-block w-4 h-4 mr-1" />
                  Business Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  data-testid="input-business-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  <User className="inline-block w-4 h-4 mr-1" />
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="John Smith"
                  data-testid="input-contact-person"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline-block w-4 h-4 mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline-block w-4 h-4 mr-1" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1 234 567 8900"
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="inline-block w-4 h-4 mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://www.example.com"
                  data-testid="input-website"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">
                  Logo URL
                </Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://..."
                  data-testid="input-logo-url"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="address">
                <MapPin className="inline-block w-4 h-4 mr-1" />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="123 Main St, City, State 12345"
                data-testid="input-address"
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Brief description of your business..."
                rows={4}
                data-testid="textarea-description"
              />
            </div>
          </form>

          {/* Business ID and Status */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Business ID</p>
                <p className="font-mono text-sm" data-testid="text-business-id">{business.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge variant={business.isActive ? 'default' : 'secondary'}>
                  {business.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {business.expiresAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="text-sm" data-testid="text-expires">
                    {new Date(business.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Your current plan and features
              </CardDescription>
            </div>
            <Badge className={subscriptionDetails.color} data-testid="badge-subscription-tier">
              {subscriptionDetails.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Plan Features</h4>
              <ul className="space-y-2">
                {subscriptionDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {subscriptionDetails.nextTier && (
              <>
                <Separator />
                <div>
                  <Alert>
                    <Crown className="h-4 w-4" />
                    <AlertTitle>Upgrade Available</AlertTitle>
                    <AlertDescription>
                      Unlock more features by upgrading to {subscriptionDetails.nextTier === 'premium' ? 'Premium' : 'Standard'} plan
                    </AlertDescription>
                  </Alert>
                  <Button className="mt-4" data-testid="button-upgrade-plan">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to {subscriptionDetails.nextTier === 'premium' ? 'Premium' : 'Standard'}
                  </Button>
                </div>
              </>
            )}

            {!subscriptionDetails.nextTier && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Premium Member</AlertTitle>
                <AlertDescription>
                  You have access to all features and unlimited resources
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            data-testid="button-download-data"
          >
            Download My Data
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            data-testid="button-api-keys"
          >
            Manage API Keys
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={logout}
            data-testid="button-logout-account"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}