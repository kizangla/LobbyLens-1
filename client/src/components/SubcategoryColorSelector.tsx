import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/types';

interface SubcategoryColorSelectorProps {
  color: string;
  categoryId: string;
  categories: Category[];
  onChange: (color: string) => void;
}

export default function SubcategoryColorSelector({
  color,
  categoryId,
  categories,
  onChange
}: SubcategoryColorSelectorProps) {
  const [colorValue, setColorValue] = useState(color || '#ffffff');
  
  // Update internal state when props change
  useEffect(() => {
    setColorValue(color || '#ffffff');
  }, [color]);
  
  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColorValue(newColor);
    onChange(newColor);
  };
  
  // Get parent category color if available
  const parentCategory = categories.find(c => c.id === categoryId);
  const parentColor = parentCategory?.color || '#ffffff';
  
  // Use parent category color
  const useParentColor = () => {
    if (parentCategory) {
      setColorValue(parentColor);
      onChange(parentColor);
    }
  };
  
  return (
    <div className="space-y-2">
      <label htmlFor="color" className="text-sm font-medium">Color (optional)</label>
      <div className="space-y-2">
        {categoryId && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Parent category color:</span>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: parentColor }}
            />
            <Button 
              variant="outline" 
              size="sm"
              type="button"
              onClick={useParentColor}
            >
              Use Parent Color
            </Button>
          </div>
        )}
        <div className="flex space-x-2">
          <Input 
            id="color" 
            name="color" 
            type="color"
            value={colorValue} 
            onChange={handleColorChange}
            className="w-12 h-10 p-1"
          />
          <Input 
            name="color-text"
            value={colorValue} 
            onChange={handleColorChange}
            className="flex-1"
            placeholder="#ffffff"
          />
        </div>
      </div>
    </div>
  );
}