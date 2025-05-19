import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Search, ArrowLeft, SunIcon } from 'lucide-react';
import { useAppContext } from '@/App';

interface HeaderProps {
  onBackClick?: () => void;
  showBackButton?: boolean;
  onSearch?: (query: string) => void;
}

export default function Header({ onBackClick, showBackButton, onSearch }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage } = useAppContext();
  
  // Clock updater
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Format time as HH:MM
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (onSearch && query.length >= 2) {
      onSearch(query);
    }
  };

  return (
    <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-poppins font-semibold">Oceanview Resort</h1>
        
        {showBackButton && (
          <Button 
            variant="ghost" 
            className="rounded-full bg-white/20 hover:bg-white/30"
            onClick={onBackClick}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Search bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search guides..."
            className="w-64 rounded-full bg-white/20 focus:bg-white/30 border-none text-white placeholder:text-white/70"
            value={searchQuery}
            onChange={handleSearchInput}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/70" />
        </div>
        
        {/* Weather widget */}
        <div className="flex items-center">
          <SunIcon className="h-5 w-5 mr-1" />
          <span>28°C</span>
        </div>
        
        {/* Clock */}
        <div>{formattedTime}</div>
        
        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 h-8 px-2">
              <span>{language.toUpperCase()}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('fr')}>Français</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
