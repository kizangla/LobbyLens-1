import React, { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Guide } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import QRCode from 'react-qr-code';

// Content section types
export type ContentSection = {
  id: string;
  type: 'text' | 'image' | 'video' | 'menu' | 'contact';
  content: string;
  title?: string;
};

interface GuideDetailProps {
  guide: Guide;
  onBack: () => void;
}

export default function GuideDetail({ guide, onBack }: GuideDetailProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(0);
  
  // Parse guide content sections (assuming JSON string in guide.content)
  const sections: ContentSection[] = guide.content 
    ? JSON.parse(guide.content) 
    : [{ id: '1', type: 'text', content: guide.excerpt, title: guide.title }];
  
  // Generate QR code value (could be website URL, contact info, etc.)
  const qrValue = `https://lobby-app.com/guides/${guide.id}`;
  
  // Menu items (either from guide content or defaults)
  const menuItems = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT US' },
    { id: 'food', label: 'FOOD' },
    { id: 'drinks', label: 'WINE & DRINKS' },
    { id: 'gallery', label: 'GALLERY' },
  ];

  return (
    <div className="guide-detail-container animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#b22c8b' }}>
        {guide.title}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Content carousel */}
        <div className="carousel-container">
          <Carousel className="w-full">
            <CarouselContent>
              {sections.map((section, index) => (
                <CarouselItem key={section.id}>
                  <Card className="border-none shadow-none">
                    <CardContent className="p-0">
                      {section.type === 'text' && (
                        <div className="text-content p-4">
                          {section.title && (
                            <h3 className="text-xl font-medium mb-3">{section.title}</h3>
                          )}
                          <div className="prose" 
                            dangerouslySetInnerHTML={{ __html: section.content }} 
                          />
                        </div>
                      )}
                      
                      {section.type === 'image' && (
                        <div className="image-content">
                          <img 
                            src={section.content} 
                            alt={section.title || "Image"} 
                            className="w-full h-auto object-cover rounded-md"
                          />
                          {section.title && (
                            <p className="text-sm text-gray-500 mt-2 text-center">{section.title}</p>
                          )}
                        </div>
                      )}
                      
                      {section.type === 'video' && (
                        <div className="video-content">
                          <video 
                            src={section.content}
                            controls
                            className="w-full h-auto rounded-md"
                          >
                            Your browser does not support the video tag.
                          </video>
                          {section.title && (
                            <p className="text-sm text-gray-500 mt-2 text-center">{section.title}</p>
                          )}
                        </div>
                      )}
                      
                      {section.type === 'menu' && (
                        <div className="menu-content p-4">
                          <h3 className="text-xl font-medium mb-3">{section.title || 'Menu'}</h3>
                          <div className="prose" 
                            dangerouslySetInnerHTML={{ __html: section.content }} 
                          />
                        </div>
                      )}
                      
                      {section.type === 'contact' && (
                        <div className="contact-content p-4">
                          <h3 className="text-xl font-medium mb-3">{section.title || 'Contact'}</h3>
                          <div className="prose" 
                            dangerouslySetInnerHTML={{ __html: section.content }} 
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="mr-2" />
              <CarouselNext className="ml-2" />
            </div>
          </Carousel>
        </div>
        
        {/* Right column: Menu and QR code */}
        <div className="menu-qr-container flex flex-col space-y-8">
          {/* Menu */}
          <div className="menu-container">
            <ul className="space-y-4">
              {menuItems.map(item => (
                <li key={item.id} className="text-lg font-medium">
                  <button className="hover:text-primary transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* QR Code */}
          <div className="qr-container mt-auto flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={qrValue} size={160} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {t('Scan to learn more')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Back button */}
      <div className="mt-8 text-center">
        <button 
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-full transition-colors"
        >
          {t('Back')}
        </button>
      </div>
    </div>
  );
}