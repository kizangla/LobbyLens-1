import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, FileText, Megaphone, BarChart3, User } from 'lucide-react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import PartnerLogin from '@/components/partner/PartnerLogin';
import PartnerDashboard from '@/components/partner/PartnerDashboard';
import PartnerGuides from '@/components/partner/PartnerGuides';
import PartnerCampaigns from '@/components/partner/PartnerCampaigns';
import PartnerAnalytics from '@/components/partner/PartnerAnalytics';
import PartnerProfile from '@/components/partner/PartnerProfile';

export default function PartnerPortal() {
  const { isAuthenticated, isLoading, business, logout } = usePartnerAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/partner');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PartnerLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {business?.logoUrl ? (
                <img 
                  src={business.logoUrl} 
                  alt={business.name} 
                  className="h-10 w-10 rounded-full object-cover"
                  data-testid="img-partner-logo"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {business?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold" data-testid="text-partner-name">
                  {business?.name} Partner Portal
                </h1>
                <p className="text-sm text-muted-foreground">
                  {business?.subscriptionTier && (
                    <span className="capitalize">{business.subscriptionTier} Plan</span>
                  )}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="guides" data-testid="tab-guides">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">My Guides</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="tab-campaigns">
              <Megaphone className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ad Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PartnerDashboard business={business} />
          </TabsContent>

          <TabsContent value="guides">
            <PartnerGuides businessId={business?.id || ''} />
          </TabsContent>

          <TabsContent value="campaigns">
            <PartnerCampaigns businessId={business?.id || ''} subscriptionTier={business?.subscriptionTier || 'basic'} />
          </TabsContent>

          <TabsContent value="analytics">
            <PartnerAnalytics businessId={business?.id || ''} />
          </TabsContent>

          <TabsContent value="profile">
            <PartnerProfile business={business} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}