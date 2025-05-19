import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Search, ArrowLeft, SunIcon, CloudRainIcon, CloudIcon, CloudLightningIcon } from 'lucide-react';
import { useAppContext } from '@/App';
import { useWeather } from '@/lib/weatherService';
import { useTranslation } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';

interface HeaderProps {
  onBackClick?: () => void;
  showBackButton?: boolean;
  onSearch?: (query: string) => void;
}

export default function Header({ onBackClick, showBackButton, onSearch }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage } = useAppContext();
  const weather = useWeather();
  const { t } = useTranslation();
  
  // Clock updater
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Format time as HH:MM based on current language
  const formattedTime = time.toLocaleTimeString(language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (onSearch && query.length >= 2) {
      onSearch(query);
    }
  };
  
  // Get weather icon based on OpenWeatherMap icon code
  const getWeatherIcon = (iconCode: string) => {
    if (!iconCode) return <SunIcon className="h-5 w-5" />;
    
    // First two characters determine the weather condition
    const condition = iconCode.substring(0, 2);
    
    switch (condition) {
      case '01': // Clear sky
        return <SunIcon className="h-5 w-5" />;
      case '02': // Few clouds
      case '03': // Scattered clouds
      case '04': // Broken clouds
        return <CloudIcon className="h-5 w-5" />;
      case '09': // Shower rain
      case '10': // Rain
        return <CloudRainIcon className="h-5 w-5" />;
      case '11': // Thunderstorm
        return <CloudLightningIcon className="h-5 w-5" />;
      default:
        return <SunIcon className="h-5 w-5" />;
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
            <span>{t('back')}</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Search bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder={t('search')}
            className="w-64 rounded-full bg-white/20 focus:bg-white/30 border-none text-white placeholder:text-white/70"
            value={searchQuery}
            onChange={handleSearchInput}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/70" />
        </div>
        
        {/* Weather widget */}
        <div className="flex items-center gap-1 min-w-[70px]">
          {weather.loading ? (
            <Skeleton className="h-8 w-16 bg-white/20" />
          ) : weather.error ? (
            <div className="flex items-center">
              <SunIcon className="h-5 w-5 mr-1" />
              <span>--°C</span>
            </div>
          ) : (
            <>
              {getWeatherIcon(weather.icon)}
              <span className="ml-1">{weather.temperature}°C</span>
            </>
          )}
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
