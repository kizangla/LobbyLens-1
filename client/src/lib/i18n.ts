// Simple internationalization (i18n) implementation
import { useAppContext } from '@/App';

// Translation dictionaries
const translations = {
  en: {
    // General
    back: 'Back',
    search: 'Search guides...',
    continue: 'Continue',
    continueReading: 'Continue where you left off',
    recentlyViewed: 'Recently Viewed',
    frequentlyUsed: 'Frequently Used',
    restaurantMenu: 'Restaurant Menu',
    todaysEvents: "Today's Events",
    callReception: 'Call Reception',
    resortMap: 'Resort Map',
    needHelp: 'Need Help?',
    
    // Categories
    categories: {
      title: 'Welcome to Oceanview Resort',
      subtitle: 'Explore our services and facilities',
      empty: 'No categories available',
    },
    
    // Guides
    guides: {
      back_to_categories: 'Back to Categories',
      empty: 'No guides available in this category',
    },
    
    // Weather
    weather: {
      error: 'Weather unavailable',
    },
    
    // Admin
    admin: {
      title: 'Admin Panel',
      categories: 'Categories',
      guides: 'Guides',
      add_category: 'Add Category',
      add_guide: 'Add Guide',
      edit_category: 'Edit Category',
      edit_guide: 'Edit Guide',
      create_category: 'Create Category',
      create_guide: 'Create Guide',
      update_category: 'Update Category',
      update_guide: 'Update Guide',
      cancel: 'Cancel',
      delete_confirm: 'Are you sure you want to delete this?',
      validation_error: 'Validation Error',
      all_fields_required: 'All fields are required',
      success: 'Success',
      error: 'Error',
      category_created: 'Category created successfully',
      category_updated: 'Category updated successfully',
      category_deleted: 'Category deleted successfully',
      guide_created: 'Guide created successfully',
      guide_updated: 'Guide updated successfully',
      guide_deleted: 'Guide deleted successfully',
    }
  },
  
  es: {
    // General
    back: 'Volver',
    search: 'Buscar guías...',
    continue: 'Continuar',
    continueReading: 'Continuar donde lo dejaste',
    recentlyViewed: 'Vistos Recientemente',
    frequentlyUsed: 'Usados Frecuentemente',
    restaurantMenu: 'Menú del Restaurante',
    todaysEvents: 'Eventos de Hoy',
    callReception: 'Llamar a Recepción',
    resortMap: 'Mapa del Resort',
    needHelp: '¿Necesitas Ayuda?',
    
    // Categories
    categories: {
      title: 'Bienvenido a Oceanview Resort',
      subtitle: 'Explore nuestros servicios e instalaciones',
      empty: 'No hay categorías disponibles',
    },
    
    // Guides
    guides: {
      back_to_categories: 'Volver a Categorías',
      empty: 'No hay guías disponibles en esta categoría',
    },
    
    // Weather
    weather: {
      error: 'Clima no disponible',
    },
    
    // Admin
    admin: {
      title: 'Panel de Administración',
      categories: 'Categorías',
      guides: 'Guías',
      add_category: 'Agregar Categoría',
      add_guide: 'Agregar Guía',
      edit_category: 'Editar Categoría',
      edit_guide: 'Editar Guía',
      create_category: 'Crear Categoría',
      create_guide: 'Crear Guía',
      update_category: 'Actualizar Categoría',
      update_guide: 'Actualizar Guía',
      cancel: 'Cancelar',
      delete_confirm: '¿Estás seguro de que quieres eliminar esto?',
      validation_error: 'Error de Validación',
      all_fields_required: 'Todos los campos son requeridos',
      success: 'Éxito',
      error: 'Error',
      category_created: 'Categoría creada exitosamente',
      category_updated: 'Categoría actualizada exitosamente',
      category_deleted: 'Categoría eliminada exitosamente',
      guide_created: 'Guía creada exitosamente',
      guide_updated: 'Guía actualizada exitosamente',
      guide_deleted: 'Guía eliminada exitosamente',
    }
  },
  
  fr: {
    // General
    back: 'Retour',
    search: 'Rechercher des guides...',
    continue: 'Continuer',
    continueReading: 'Continuer où vous vous êtes arrêté',
    recentlyViewed: 'Récemment consultés',
    frequentlyUsed: 'Fréquemment utilisés',
    restaurantMenu: 'Menu du Restaurant',
    todaysEvents: 'Événements du Jour',
    callReception: 'Appeler la Réception',
    resortMap: 'Plan du Resort',
    needHelp: 'Besoin d\'aide?',
    
    // Categories
    categories: {
      title: 'Bienvenue à Oceanview Resort',
      subtitle: 'Explorez nos services et installations',
      empty: 'Aucune catégorie disponible',
    },
    
    // Guides
    guides: {
      back_to_categories: 'Retour aux Catégories',
      empty: 'Aucun guide disponible dans cette catégorie',
    },
    
    // Weather
    weather: {
      error: 'Météo indisponible',
    },
    
    // Admin
    admin: {
      title: 'Panneau d\'Administration',
      categories: 'Catégories',
      guides: 'Guides',
      add_category: 'Ajouter une Catégorie',
      add_guide: 'Ajouter un Guide',
      edit_category: 'Modifier la Catégorie',
      edit_guide: 'Modifier le Guide',
      create_category: 'Créer une Catégorie',
      create_guide: 'Créer un Guide',
      update_category: 'Mettre à jour la Catégorie',
      update_guide: 'Mettre à jour le Guide',
      cancel: 'Annuler',
      delete_confirm: 'Êtes-vous sûr de vouloir supprimer ceci?',
      validation_error: 'Erreur de Validation',
      all_fields_required: 'Tous les champs sont obligatoires',
      success: 'Succès',
      error: 'Erreur',
      category_created: 'Catégorie créée avec succès',
      category_updated: 'Catégorie mise à jour avec succès',
      category_deleted: 'Catégorie supprimée avec succès',
      guide_created: 'Guide créé avec succès',
      guide_updated: 'Guide mis à jour avec succès',
      guide_deleted: 'Guide supprimé avec succès',
    }
  }
};

// Hook for using translations
export function useTranslation() {
  const { language } = useAppContext();
  
  // Get the appropriate translation dictionary based on the selected language
  const t = (key: string, fallback?: string): string => {
    // Split the key by dots to navigate nested objects
    const keys = key.split('.');
    
    // Start with the full translation dictionary for the current language
    // Default to English if the selected language is not available
    let current: any = translations[language as keyof typeof translations] || translations.en;
    
    // Navigate through the nested objects
    for (const k of keys) {
      if (current[k] === undefined) {
        // If the key doesn't exist, return the fallback or the key itself
        return fallback || key;
      }
      current = current[k];
    }
    
    // If we've reached a non-object value, return it
    // Otherwise, return the fallback or key
    return typeof current === 'string' ? current : fallback || key;
  };
  
  return { t };
}