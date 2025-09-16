import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { AdCampaign } from '@shared/schema';

// Hook for fetching active ad campaigns
export function useActiveAdCampaigns(slotType?: string, categoryId?: string) {
  return useQuery<AdCampaign[]>({
    queryKey: ['/api/ad-campaigns', { slotType, categoryId, active: true }],
    queryFn: async () => {
      const params = new URLSearchParams({ active: 'true' });
      if (slotType) params.append('slotType', slotType);
      if (categoryId) params.append('categoryId', categoryId);
      
      const response = await fetch(`/api/ad-campaigns?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ad campaigns');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Hook for fetching ad campaigns by slot
export function useAdCampaignsBySlot(slotId: string) {
  return useQuery<AdCampaign[]>({
    queryKey: ['/api/ad-slots', slotId, 'campaigns'],
    queryFn: async () => {
      const response = await fetch(`/api/ad-slots/${slotId}/campaigns`);
      if (!response.ok) {
        throw new Error('Failed to fetch ad campaigns for slot');
      }
      return response.json();
    },
    enabled: !!slotId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for fetching a single ad campaign by ID
export function useAdCampaignById(id: number | undefined) {
  return useQuery<AdCampaign>({
    queryKey: ['/api/ad-campaigns', id],
    queryFn: async () => {
      const response = await fetch(`/api/ad-campaigns/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ad campaign');
      }
      return response.json();
    },
    enabled: id !== undefined,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for tracking ad impressions
export function useTrackImpression() {
  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest('POST', `/api/ad-campaigns/${campaignId}/impression`);
      return response.json();
    },
    onSuccess: (data, campaignId) => {
      // Optionally invalidate the campaign cache to get updated impression count
      queryClient.invalidateQueries({
        queryKey: ['/api/ad-campaigns', campaignId],
      });
    },
    onError: (error) => {
      // Log error but don't break the app
      console.error('Failed to track impression:', error);
    },
  });
}

// Hook for tracking ad clicks
export function useTrackClick() {
  return useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest('POST', `/api/ad-campaigns/${campaignId}/click`);
      return response.json();
    },
    onSuccess: (data, campaignId) => {
      // Optionally invalidate the campaign cache to get updated click count
      queryClient.invalidateQueries({
        queryKey: ['/api/ad-campaigns', campaignId],
      });
    },
    onError: (error) => {
      // Log error but don't break the app
      console.error('Failed to track click:', error);
    },
  });
}

// Hook for tracking guide clicks
export function useTrackGuideClick() {
  return useMutation({
    mutationFn: async (guideId: string) => {
      const response = await apiRequest('POST', `/api/guides/${guideId}/click`);
      return response.json();
    },
    onSuccess: (data, guideId) => {
      // Optionally invalidate the guide cache to get updated click count
      queryClient.invalidateQueries({
        queryKey: ['/api/guides', guideId],
      });
    },
    onError: (error) => {
      // Log error but don't break the app
      console.error('Failed to track guide click:', error);
    },
  });
}

// Utility function to rotate through campaigns
export function useAdRotation(campaigns: AdCampaign[] | undefined, intervalMs: number = 8000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (!campaigns || campaigns.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [campaigns, intervalMs]);

  const currentCampaign = campaigns?.[currentIndex];
  const nextCampaign = campaigns?.[(currentIndex + 1) % (campaigns?.length || 1)];

  return {
    currentCampaign,
    nextCampaign,
    currentIndex,
    totalCampaigns: campaigns?.length || 0,
  };
}