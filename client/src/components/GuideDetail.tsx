import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Guide, Category } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { useAnalyticsContext } from '@/components/AnalyticsProvider';
import { ScrollDepthTracker, EngagementTimer } from '@/utils/analyticsHelpers';
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
  category?: Category;
  onBack: () => void;
}

export default function GuideDetail({ guide, category, onBack }: GuideDetailProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(0);
  const { trackEvent, trackClick, trackView, trackScrollDepth } = useAnalyticsContext();
  const scrollDepthTrackerRef = useRef<ScrollDepthTracker | null>(null);
  const engagementTimerRef = useRef<EngagementTimer | null>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Initialize tracking on mount
  useEffect(() => {
    // Track initial guide view
    trackView('guide_content', guide.id, {
      guideTitle: guide.title,
      guideType: guide.type,
      categoryId: category?.id,
      categoryName: category?.name,
      sectionCount: sections.length,
      hasQRCode: true
    });
    
    // Initialize scroll depth tracking
    scrollDepthTrackerRef.current = new ScrollDepthTracker((depth) => {
      trackScrollDepth('guide_content', guide.id, depth);
    });
    
    // Initialize engagement timer
    engagementTimerRef.current = new EngagementTimer();
    
    // Handle scroll events
    const handleScroll = () => {
      if (contentContainerRef.current && scrollDepthTrackerRef.current) {
        scrollDepthTrackerRef.current.updateScrollDepth(contentContainerRef.current);
      }
    };
    
    const container = contentContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      
      // Track final engagement time
      if (engagementTimerRef.current) {
        const engagementTime = engagementTimerRef.current.getEngagementTime();
        trackEvent('content_engagement', 'guide', guide.id, {
          engagementTime,
          maxScrollDepth: scrollDepthTrackerRef.current?.getMaxDepth() || 0,
          sectionsViewed: activeSection + 1,
          totalSections: sections.length
        });
        
        engagementTimerRef.current.destroy();
      }
    };
  }, [guide, category, sections.length, trackView, trackEvent, trackScrollDepth]);
  
  // Track carousel section changes
  const handleCarouselChange = useCallback((index: number) => {
    if (index !== activeSection) {
      const previousSection = sections[activeSection];
      const newSection = sections[index];
      
      // Track section view
      trackEvent('carousel_navigate', 'guide_section', newSection.id, {
        guideId: guide.id,
        guideTitle: guide.title,
        fromSection: previousSection?.type,
        toSection: newSection.type,
        sectionIndex: index,
        sectionTitle: newSection.title
      });
      
      setActiveSection(index);
    }
  }, [activeSection, sections, guide, trackEvent]);
  
  // Track menu clicks
  const handleMenuClick = useCallback((menuItem: { id: string; label: string }) => {
    trackClick('menu_item', menuItem.id, {
      guideId: guide.id,
      guideTitle: guide.title,
      menuLabel: menuItem.label
    });
  }, [guide, trackClick]);
  
  // Track QR code interactions
  const handleQRInteraction = useCallback(() => {
    trackEvent('qr_code_view', 'guide', guide.id, {
      guideTitle: guide.title,
      qrUrl: qrValue
    });
  }, [guide, trackEvent, qrValue]);
  
  // Track back button click
  const handleBack = useCallback(() => {
    trackClick('back_button', 'guide_detail', {
      guideId: guide.id,
      guideTitle: guide.title
    });
    onBack();
  }, [guide, trackClick, onBack]);

  return (
    <div 
      ref={contentContainerRef}
      className="guide-detail-container animate-in fade-in slide-in-from-bottom-4 duration-500"
      data-testid="guide-detail"
      data-analytics-guide={guide.id}
    >
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
                        <div className="text-content p-4" data-section-type="text">
                          {section.title && (
                            <h3 className="text-xl font-medium mb-3">{section.title}</h3>
                          )}
                          <div className="prose" 
                            dangerouslySetInnerHTML={{ __html: section.content }} 
                          />
                        </div>
                      )}
                      
                      {section.type === 'image' && (
                        <div className="image-content" data-section-type="image">
                          <img 
                            src={section.content} 
                            alt={section.title || "Image"} 
                            className="w-full h-auto object-cover rounded-md"
                            onLoad={() => trackEvent('image_load', 'guide_section', section.id, {
                              guideId: guide.id,
                              imageTitle: section.title
                            })}
                          />
                          {section.title && (
                            <p className="text-sm text-gray-500 mt-2 text-center">{section.title}</p>
                          )}
                        </div>
                      )}
                      
                      {section.type === 'video' && (
                        <div className="video-content" data-section-type="video">
                          <video 
                            src={section.content}
                            controls
                            className="w-full h-auto rounded-md"
                            onPlay={() => trackEvent('video_play', 'guide_section', section.id, {
                              guideId: guide.id,
                              videoTitle: section.title
                            })}
                            onPause={() => trackEvent('video_pause', 'guide_section', section.id, {
                              guideId: guide.id
                            })}
                          >
                            Your browser does not support the video tag.
                          </video>
                          {section.title && (
                            <p className="text-sm text-gray-500 mt-2 text-center">{section.title}</p>
                          )}
                        </div>
                      )}
                      
                      {section.type === 'menu' && (
                        <div className="menu-content p-4" data-section-type="menu">
                          <h3 className="text-xl font-medium mb-3">{section.title || 'Menu'}</h3>
                          <div className="prose" 
                            dangerouslySetInnerHTML={{ __html: section.content }} 
                          />
                        </div>
                      )}
                      
                      {section.type === 'contact' && (
                        <div className="contact-content p-4" data-section-type="contact">
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
              <CarouselPrevious 
                className="mr-2" 
                onClick={() => trackEvent('carousel_prev', 'guide', guide.id)}
                data-testid="carousel-prev"
              />
              <CarouselNext 
                className="ml-2"
                onClick={() => trackEvent('carousel_next', 'guide', guide.id)}
                data-testid="carousel-next"
              />
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
                  <button 
                    className="hover:text-primary transition-colors"
                    onClick={() => handleMenuClick(item)}
                    data-testid={`menu-item-${item.id}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* QR Code */}
          <div 
            className="qr-container mt-auto flex flex-col items-center"
            onMouseEnter={handleQRInteraction}
            data-testid="qr-code-container"
          >
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
          onClick={handleBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-full transition-colors"
          data-testid="back-button"
        >
          {t('Back')}
        </button>
      </div>
    </div>
  );
}