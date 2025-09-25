import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema, 
  insertGuideSchema, 
  insertSubcategorySchema,
  insertBusinessSchema,
  insertAdCampaignSchema,
  insertAdSlotSchema,
  insertAnalyticsEventSchema,
  insertUserSessionSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get a specific category
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get guides for a specific category
  app.get("/api/categories/:id/guides", async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const guides = await storage.getGuidesByCategoryId(req.params.id);
      res.json({
        ...category,
        guides
      });
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });
  
  // Get all subcategories
  app.get("/api/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getAllSubcategories();
      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });
  
  // Create a new subcategory
  app.post("/api/subcategories", async (req, res) => {
    try {
      const validatedData = insertSubcategorySchema.parse(req.body);
      const newSubcategory = await storage.createSubcategory(validatedData);
      res.status(201).json(newSubcategory);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating subcategory:", error);
      res.status(500).json({ message: "Failed to create subcategory" });
    }
  });
  
  // Update a subcategory
  app.put("/api/subcategories/:id", async (req, res) => {
    try {
      const validatedData = insertSubcategorySchema.parse(req.body);
      const updatedSubcategory = await storage.updateSubcategory(req.params.id, validatedData);
      if (!updatedSubcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      res.json(updatedSubcategory);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating subcategory:", error);
      res.status(500).json({ message: "Failed to update subcategory" });
    }
  });
  
  // Delete a subcategory
  app.delete("/api/subcategories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubcategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      res.status(500).json({ message: "Failed to delete subcategory" });
    }
  });
  
  // Get subcategories for a specific category
  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const subcategories = await storage.getSubcategoriesByCategoryId(req.params.id);
      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  // Get all guides (for admin panel)
  app.get("/api/guides", async (req, res) => {
    try {
      // Since we don't have a method to get all guides, we'll get them by categories
      const categories = await storage.getAllCategories();
      const allGuides = [];

      for (const category of categories) {
        const guides = await storage.getGuidesByCategoryId(category.id);
        allGuides.push(...guides);
      }

      res.json(allGuides);
    } catch (error) {
      console.error("Error fetching all guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  // Get a specific guide
  app.get("/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuideById(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  // Search guides
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const results = await storage.searchGuides(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching guides:", error);
      res.status(500).json({ message: "Failed to search guides" });
    }
  });

  // Create a new category (admin access)
  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Create a new guide (admin access)
  app.post("/api/guides", async (req, res) => {
    try {
      // Convert date strings to Date objects if present
      const dataToValidate = {
        ...req.body,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null
      };
      const validatedData = insertGuideSchema.parse(dataToValidate);
      const newGuide = await storage.createGuide(validatedData);
      res.status(201).json(newGuide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating guide:", error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  // Update a category (admin access)
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const updatedCategory = await storage.updateCategory(req.params.id, validatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Update a guide (admin access)
  app.put("/api/guides/:id", async (req, res) => {
    try {
      // Convert date strings to Date objects if present
      const dataToValidate = {
        ...req.body,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null
      };
      const validatedData = insertGuideSchema.parse(dataToValidate);
      const updatedGuide = await storage.updateGuide(req.params.id, validatedData);
      if (!updatedGuide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(updatedGuide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating guide:", error);
      res.status(500).json({ message: "Failed to update guide" });
    }
  });

  // Delete a category (admin access)
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Delete a guide (admin access)
  app.delete("/api/guides/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGuide(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting guide:", error);
      res.status(500).json({ message: "Failed to delete guide" });
    }
  });
  
  // Weather API endpoint
  app.get("/api/weather", async (req, res) => {
    try {
      const lat = req.query.lat || "-31.9523"; // Default to Perth, Australia
      const lon = req.query.lon || "115.8613";
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "Weather API key not configured" });
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // ===============================
  // BUSINESS ROUTES
  // ===============================
  
  // Get all businesses (with optional tier filter)
  app.get("/api/businesses", async (req, res) => {
    try {
      const { tier } = req.query;
      
      if (tier && typeof tier === 'string') {
        const businesses = await storage.getBusinessesByTier(tier);
        return res.json(businesses);
      }
      
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  
  // Get business by ID
  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });
  
  // Create new business
  app.post("/api/businesses", async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.parse(req.body);
      const newBusiness = await storage.createBusiness(validatedData);
      res.status(201).json(newBusiness);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });
  
  // Update business
  app.put("/api/businesses/:id", async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.partial().parse(req.body);
      const updatedBusiness = await storage.updateBusiness(req.params.id, validatedData);
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(updatedBusiness);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });
  
  // Delete business
  app.delete("/api/businesses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBusiness(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Failed to delete business" });
    }
  });
  
  // Get all guides for a specific business
  app.get("/api/businesses/:id/guides", async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      const guides = await storage.getPartnerGuides(req.params.id);
      res.json({
        business,
        guides
      });
    } catch (error) {
      console.error("Error fetching business guides:", error);
      res.status(500).json({ message: "Failed to fetch business guides" });
    }
  });
  
  // ===============================
  // AD CAMPAIGN ROUTES
  // ===============================
  
  // Get all ad campaigns (with optional filters)
  app.get("/api/ad-campaigns", async (req, res) => {
    try {
      const { active, businessId } = req.query;
      
      if (active === 'true') {
        const campaigns = await storage.getActiveAdCampaigns();
        return res.json(campaigns);
      }
      
      if (businessId && typeof businessId === 'string') {
        const campaigns = await storage.getAdCampaignsByBusiness(businessId);
        return res.json(campaigns);
      }
      
      // Get all campaigns (we don't have a getAllAdCampaigns method, so get from businesses)
      const businesses = await storage.getAllBusinesses();
      const allCampaigns = [];
      
      for (const business of businesses) {
        const campaigns = await storage.getAdCampaignsByBusiness(business.id);
        allCampaigns.push(...campaigns);
      }
      
      res.json(allCampaigns);
    } catch (error) {
      console.error("Error fetching ad campaigns:", error);
      res.status(500).json({ message: "Failed to fetch ad campaigns" });
    }
  });
  
  // Get ad campaign by ID
  app.get("/api/ad-campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getAdCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching ad campaign:", error);
      res.status(500).json({ message: "Failed to fetch ad campaign" });
    }
  });
  
  // Create new ad campaign
  app.post("/api/ad-campaigns", async (req, res) => {
    try {
      // Convert date strings to Date objects if present
      const dataToValidate = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      const validatedData = insertAdCampaignSchema.parse(dataToValidate);
      const newCampaign = await storage.createAdCampaign(validatedData);
      res.status(201).json(newCampaign);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating ad campaign:", error);
      res.status(500).json({ message: "Failed to create ad campaign" });
    }
  });
  
  // Update ad campaign
  app.put("/api/ad-campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Convert date strings to Date objects if present
      const dataToValidate = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : req.body.startDate,
        endDate: req.body.endDate ? new Date(req.body.endDate) : req.body.endDate
      };
      const validatedData = insertAdCampaignSchema.partial().parse(dataToValidate);
      const updatedCampaign = await storage.updateAdCampaign(id, validatedData);
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating ad campaign:", error);
      res.status(500).json({ message: "Failed to update ad campaign" });
    }
  });
  
  // Delete ad campaign
  app.delete("/api/ad-campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAdCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting ad campaign:", error);
      res.status(500).json({ message: "Failed to delete ad campaign" });
    }
  });
  
  // Increment impression count
  app.post("/api/ad-campaigns/:id/impression", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getAdCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      
      // Increment impression count
      await storage.incrementAdImpressions(id);
      
      // Track analytics event
      await storage.createAnalyticsEvent({
        eventType: "impression",
        entityType: "ad",
        entityId: id.toString(),
        sessionId: req.body.sessionId,
        metadata: {
          campaignName: campaign.campaignName,
          businessId: campaign.businessId,
          adType: campaign.adType
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing ad impression:", error);
      res.status(500).json({ message: "Failed to increment ad impression" });
    }
  });
  
  // Increment click count
  app.post("/api/ad-campaigns/:id/click", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getAdCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: "Ad campaign not found" });
      }
      
      // Increment click count
      await storage.incrementAdClicks(id);
      
      // Track analytics event
      await storage.createAnalyticsEvent({
        eventType: "click",
        entityType: "ad",
        entityId: id.toString(),
        sessionId: req.body.sessionId,
        metadata: {
          campaignName: campaign.campaignName,
          businessId: campaign.businessId,
          adType: campaign.adType,
          targetUrl: campaign.targetUrl
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing ad click:", error);
      res.status(500).json({ message: "Failed to increment ad click" });
    }
  });
  
  // ===============================
  // AD SLOT ROUTES
  // ===============================
  
  // Get all ad slots (with optional active filter)
  app.get("/api/ad-slots", async (req, res) => {
    try {
      const { active } = req.query;
      
      if (active === 'true') {
        const slots = await storage.getActiveAdSlots();
        return res.json(slots);
      }
      
      // Get all slots (we don't have a getAllAdSlots method, so get active and inactive)
      const activeSlots = await storage.getActiveAdSlots();
      res.json(activeSlots);
    } catch (error) {
      console.error("Error fetching ad slots:", error);
      res.status(500).json({ message: "Failed to fetch ad slots" });
    }
  });
  
  // Get ad slot by ID
  app.get("/api/ad-slots/:id", async (req, res) => {
    try {
      const slot = await storage.getAdSlotById(req.params.id);
      if (!slot) {
        return res.status(404).json({ message: "Ad slot not found" });
      }
      res.json(slot);
    } catch (error) {
      console.error("Error fetching ad slot:", error);
      res.status(500).json({ message: "Failed to fetch ad slot" });
    }
  });
  
  // Create new ad slot
  app.post("/api/ad-slots", async (req, res) => {
    try {
      const validatedData = insertAdSlotSchema.parse(req.body);
      const newSlot = await storage.createAdSlot(validatedData);
      res.status(201).json(newSlot);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating ad slot:", error);
      res.status(500).json({ message: "Failed to create ad slot" });
    }
  });
  
  // Update ad slot
  app.put("/api/ad-slots/:id", async (req, res) => {
    try {
      const validatedData = insertAdSlotSchema.partial().parse(req.body);
      const updatedSlot = await storage.updateAdSlot(req.params.id, validatedData);
      if (!updatedSlot) {
        return res.status(404).json({ message: "Ad slot not found" });
      }
      res.json(updatedSlot);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating ad slot:", error);
      res.status(500).json({ message: "Failed to update ad slot" });
    }
  });
  
  // Delete ad slot
  app.delete("/api/ad-slots/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAdSlot(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Ad slot not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting ad slot:", error);
      res.status(500).json({ message: "Failed to delete ad slot" });
    }
  });
  
  // Get active campaigns for a specific slot
  app.get("/api/ad-slots/:id/campaigns", async (req, res) => {
    try {
      const slot = await storage.getAdSlotById(req.params.id);
      if (!slot) {
        return res.status(404).json({ message: "Ad slot not found" });
      }
      
      // Get active campaigns that match the slot type
      const activeCampaigns = await storage.getActiveAdCampaigns();
      const matchingCampaigns = activeCampaigns.filter(campaign => {
        // Match by ad type and optionally by category
        if (campaign.adType !== slot.slotType) {
          return false;
        }
        if (slot.categoryId && campaign.categoryId && campaign.categoryId !== slot.categoryId) {
          return false;
        }
        return true;
      });
      
      res.json({
        slot,
        campaigns: matchingCampaigns
      });
    } catch (error) {
      console.error("Error fetching slot campaigns:", error);
      res.status(500).json({ message: "Failed to fetch slot campaigns" });
    }
  });
  
  // ===============================
  // ANALYTICS ROUTES
  // ===============================
  
  // Create analytics event
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const validatedData = insertAnalyticsEventSchema.parse(req.body);
      const newEvent = await storage.createAnalyticsEvent(validatedData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating analytics event:", error);
      res.status(500).json({ message: "Failed to create analytics event" });
    }
  });
  
  // Get analytics events with filters
  app.get("/api/analytics/events", async (req, res) => {
    try {
      const { eventType, entityType, entityId, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (eventType) filters.eventType = eventType as string;
      if (entityType) filters.entityType = entityType as string;
      if (entityId) filters.entityId = entityId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const events = await storage.getAnalyticsEvents(filters);
      res.json(events);
    } catch (error) {
      console.error("Error fetching analytics events:", error);
      res.status(500).json({ message: "Failed to fetch analytics events" });
    }
  });
  
  // Get analytics summary for an entity
  app.get("/api/analytics/summary/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const summary = await storage.getAnalyticsSummary(entityType, entityId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });
  
  // Get overall dashboard metrics
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      // Get all events
      const events = await storage.getAnalyticsEvents(filters);
      
      // Calculate metrics by date
      const metricsByDate: Record<string, { impressions: number; clicks: number; views: number }> = {};
      
      events.forEach(event => {
        const date = event.createdAt ? new Date(event.createdAt).toISOString().split('T')[0] : 'unknown';
        
        if (!metricsByDate[date]) {
          metricsByDate[date] = { impressions: 0, clicks: 0, views: 0 };
        }
        
        switch (event.eventType) {
          case 'impression':
            metricsByDate[date].impressions++;
            break;
          case 'click':
            metricsByDate[date].clicks++;
            break;
          case 'view':
            metricsByDate[date].views++;
            break;
        }
      });
      
      // Calculate totals
      const totals = {
        impressions: 0,
        clicks: 0,
        views: 0,
        ctr: 0
      };
      
      Object.values(metricsByDate).forEach(metrics => {
        totals.impressions += metrics.impressions;
        totals.clicks += metrics.clicks;
        totals.views += metrics.views;
      });
      
      totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      
      res.json({
        totals,
        byDate: Object.entries(metricsByDate).map(([date, metrics]) => ({
          date,
          ...metrics,
          ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
        })).sort((a, b) => a.date.localeCompare(b.date))
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  
  // ===============================
  // SESSION ROUTES
  // ===============================
  
  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertUserSessionSchema.parse(req.body);
      const newSession = await storage.createSession(validatedData);
      res.status(201).json(newSession);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });
  
  // Get session by ID
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSessionById(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });
  
  // Update session data
  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const updatedSession = await storage.updateSession(req.params.id, req.body.sessionData);
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });
  
  // Clean up old sessions
  app.delete("/api/sessions/cleanup", async (req, res) => {
    try {
      const { olderThan } = req.query;
      const date = olderThan ? new Date(olderThan as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days old
      
      const deletedCount = await storage.cleanupOldSessions(date);
      res.json({ success: true, deletedCount });
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
      res.status(500).json({ message: "Failed to clean up sessions" });
    }
  });
  
  // ===============================
  // ENHANCED GUIDE ROUTES
  // ===============================
  
  // Get guides by business
  app.get("/api/guides/partner/:businessId", async (req, res) => {
    try {
      const guides = await storage.getPartnerGuides(req.params.businessId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching partner guides:", error);
      res.status(500).json({ message: "Failed to fetch partner guides" });
    }
  });
  
  // Get guides by type
  app.get("/api/guides/type/:type", async (req, res) => {
    try {
      const validTypes = ['resort', 'partner', 'sponsored'];
      if (!validTypes.includes(req.params.type)) {
        return res.status(400).json({ message: "Invalid guide type. Must be one of: resort, partner, sponsored" });
      }
      
      const guides = await storage.getGuidesByType(req.params.type);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides by type:", error);
      res.status(500).json({ message: "Failed to fetch guides by type" });
    }
  });
  
  // Increment guide impressions
  app.post("/api/guides/:id/impression", async (req, res) => {
    try {
      const guide = await storage.getGuideById(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      // Increment impression count
      await storage.incrementGuideImpressions(req.params.id);
      
      // Track analytics event
      await storage.createAnalyticsEvent({
        eventType: "impression",
        entityType: "guide",
        entityId: req.params.id,
        sessionId: req.body.sessionId,
        metadata: {
          guideTitle: guide.title,
          categoryId: guide.categoryId,
          subcategoryId: guide.subcategoryId,
          type: guide.type,
          businessId: guide.businessId
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing guide impression:", error);
      res.status(500).json({ message: "Failed to increment guide impression" });
    }
  });
  
  // Increment guide clicks
  app.post("/api/guides/:id/click", async (req, res) => {
    try {
      const guide = await storage.getGuideById(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      // Increment click count
      await storage.incrementGuideClicks(req.params.id);
      
      // Track analytics event
      await storage.createAnalyticsEvent({
        eventType: "click",
        entityType: "guide",
        entityId: req.params.id,
        sessionId: req.body.sessionId,
        metadata: {
          guideTitle: guide.title,
          categoryId: guide.categoryId,
          subcategoryId: guide.subcategoryId,
          type: guide.type,
          businessId: guide.businessId
        }
      });
      
      // Get and return updated analytics
      const analytics = await storage.getGuideAnalytics(req.params.id);
      res.json({ success: true, analytics });
    } catch (error) {
      console.error("Error incrementing guide click:", error);
      res.status(500).json({ message: "Failed to increment guide click" });
    }
  });

  // ================== PARTNER PORTAL ROUTES ==================
  
  // Partner login (email-based auth for MVP)
  app.post("/api/partner/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Find business by email
      const businesses = await storage.getAllBusinesses();
      const business = businesses.find(b => b.email.toLowerCase() === email.toLowerCase());
      
      if (!business) {
        return res.status(401).json({ error: "Business not found with this email" });
      }
      
      if (!business.isActive) {
        return res.status(403).json({ error: "Business account is inactive" });
      }
      
      res.json({ business });
    } catch (error) {
      console.error("Error during partner login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get partner's guides
  app.get("/api/guides/business/:businessId", async (req, res) => {
    try {
      const guides = await storage.getPartnerGuides(req.params.businessId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching partner guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  // Create partner guide
  app.post("/api/partner/guides", async (req, res) => {
    try {
      const validatedData = insertGuideSchema.parse(req.body);
      
      // Ensure the guide belongs to the business making the request
      if (!validatedData.businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }
      
      const newGuide = await storage.createGuide(validatedData);
      res.status(201).json(newGuide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating partner guide:", error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  // Update partner guide
  app.put("/api/partner/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuideById(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      // Verify the guide belongs to the business
      if (guide.businessId !== req.body.businessId) {
        return res.status(403).json({ message: "Unauthorized to edit this guide" });
      }
      
      const validatedData = insertGuideSchema.parse(req.body);
      const updatedGuide = await storage.updateGuide(req.params.id, validatedData);
      res.json(updatedGuide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating partner guide:", error);
      res.status(500).json({ message: "Failed to update guide" });
    }
  });

  // Delete partner guide
  app.delete("/api/partner/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuideById(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      const deleted = await storage.deleteGuide(req.params.id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting partner guide:", error);
      res.status(500).json({ message: "Failed to delete guide" });
    }
  });

  // Get partner's ad campaigns
  app.get("/api/ad-campaigns/business/:businessId", async (req, res) => {
    try {
      const campaigns = await storage.getAdCampaignsByBusiness(req.params.businessId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching partner campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Create partner ad campaign
  app.post("/api/partner/ad-campaigns", async (req, res) => {
    try {
      // Convert date strings to Date objects if present
      const dataToValidate = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      const validatedData = insertAdCampaignSchema.parse(dataToValidate);
      
      if (!validatedData.businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }
      
      const newCampaign = await storage.createAdCampaign(validatedData);
      res.status(201).json(newCampaign);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating partner campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Update partner ad campaign
  app.put("/api/partner/ad-campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getAdCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Verify the campaign belongs to the business
      if (campaign.businessId !== req.body.businessId) {
        return res.status(403).json({ message: "Unauthorized to edit this campaign" });
      }
      
      const validatedData = insertAdCampaignSchema.partial().parse(req.body);
      const updatedCampaign = await storage.updateAdCampaign(campaignId, validatedData);
      res.json(updatedCampaign);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error updating partner campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Toggle campaign status
  app.put("/api/partner/ad-campaigns/:id/status", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const campaign = await storage.getAdCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const updatedCampaign = await storage.updateAdCampaign(campaignId, { isActive });
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error toggling campaign status:", error);
      res.status(500).json({ message: "Failed to update campaign status" });
    }
  });

  // Delete partner ad campaign
  app.delete("/api/partner/ad-campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getAdCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const deleted = await storage.deleteAdCampaign(campaignId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting partner campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Get partner analytics
  app.get("/api/analytics/business/:businessId", async (req, res) => {
    try {
      const { start, end } = req.query;
      
      let filters: any = {
        entityType: undefined,
        entityId: undefined,
        startDate: start ? new Date(start as string) : undefined,
        endDate: end ? new Date(end as string) : undefined
      };
      
      // Get all guides and campaigns for this business
      const guides = await storage.getPartnerGuides(req.params.businessId);
      const campaigns = await storage.getAdCampaignsByBusiness(req.params.businessId);
      
      // Get analytics for all partner content
      const guideIds = guides.map(g => g.id);
      const campaignIds = campaigns.map(c => c.id.toString());
      
      // Fetch analytics events
      const allEvents: any[] = [];
      
      // Get guide analytics
      for (const guideId of guideIds) {
        const events = await storage.getAnalyticsEvents({
          ...filters,
          entityType: 'guide',
          entityId: guideId
        });
        allEvents.push(...events);
      }
      
      // Get campaign analytics
      for (const campaignId of campaignIds) {
        const events = await storage.getAnalyticsEvents({
          ...filters,
          entityType: 'ad_campaign',
          entityId: campaignId
        });
        allEvents.push(...events);
      }
      
      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching partner analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Update partner business profile
  app.put("/api/partner/business/:id", async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Only allow updating certain fields
      const allowedFields = ['name', 'description', 'phone', 'website', 'logoUrl', 'address', 'contactPerson'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      // Keep the email unchanged for security
      updateData.email = business.email;
      
      const updatedBusiness = await storage.updateBusiness(req.params.id, updateData);
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating partner business:", error);
      res.status(500).json({ message: "Failed to update business profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
