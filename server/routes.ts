import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertGuideSchema, insertSubcategorySchema } from "@shared/schema";
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
      const validatedData = insertGuideSchema.parse(req.body);
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
      const validatedData = insertGuideSchema.parse(req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
