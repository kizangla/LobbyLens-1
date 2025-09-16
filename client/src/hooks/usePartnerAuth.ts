import { useState, useEffect } from 'react';
import { Business } from '@/lib/types';

interface PartnerAuthState {
  isAuthenticated: boolean;
  business: Business | null;
  isLoading: boolean;
}

export function usePartnerAuth() {
  const [authState, setAuthState] = useState<PartnerAuthState>({
    isAuthenticated: false,
    business: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check if partner is logged in
    const storedBusinessId = sessionStorage.getItem('partnerBusinessId');
    const storedBusiness = sessionStorage.getItem('partnerBusiness');

    if (storedBusinessId && storedBusiness) {
      try {
        const business = JSON.parse(storedBusiness);
        setAuthState({
          isAuthenticated: true,
          business,
          isLoading: false,
        });
      } catch {
        setAuthState({
          isAuthenticated: false,
          business: null,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        business: null,
        isLoading: false,
      });
    }
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/partner/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.business) {
        sessionStorage.setItem('partnerBusinessId', data.business.id);
        sessionStorage.setItem('partnerBusiness', JSON.stringify(data.business));
        setAuthState({
          isAuthenticated: true,
          business: data.business,
          isLoading: false,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('partnerBusinessId');
    sessionStorage.removeItem('partnerBusiness');
    setAuthState({
      isAuthenticated: false,
      business: null,
      isLoading: false,
    });
  };

  const getBusinessId = (): string | null => {
    return sessionStorage.getItem('partnerBusinessId');
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    business: authState.business,
    isLoading: authState.isLoading,
    login,
    logout,
    getBusinessId,
  };
}