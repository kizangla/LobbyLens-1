import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Maximize2 } from 'lucide-react';
import { Guide, Category } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { useAnalyticsContext } from '@/components/AnalyticsProvider';
import { ScrollDepthTracker, EngagementTimer } from '@/utils/analyticsHelpers';
import DynamicQRCode from '@/components/DynamicQRCode';
import QRCodeModal from '@/components/QRCodeModal';
import { generateQRCodeData } from '@/utils/qrHelpers';

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
  const [showQRModal, setShowQRModal] = useState(false);
  const { trackEvent, trackClick, trackView, trackScrollDepth } = useAnalyticsContext();
  const scrollDepthTrackerRef = useRef<ScrollDepthTracker | null>(null);
  const engagementTimerRef = useRef<EngagementTimer | null>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const carouselApi = useRef<any>(null);
  
  // Helper function to extract content between headers
  const extractSectionContent = (html: string, sectionTitle: string): string => {
    if (!html) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Find all h3 elements
    const headers = tempDiv.querySelectorAll('h3');
    let sectionContent = '';
    let capturing = false;
    
    for (let i = 0; i < headers.length; i++) {
      const headerText = headers[i].textContent?.toLowerCase() || '';
      const sectionTitleLower = sectionTitle.toLowerCase();
      
      // Check if this header matches our section
      if (headerText.includes(sectionTitleLower) || 
          (sectionTitleLower === 'shopping' && (headerText.includes('major stores') || headerText.includes('fashion'))) ||
          (sectionTitleLower === 'dining' && (headerText.includes('restaurant') || headerText.includes('food') || headerText.includes('cafe')))) {
        capturing = true;
        let currentElement = headers[i] as HTMLElement;
        const contentParts: string[] = [];
        
        // Include the header itself
        contentParts.push(currentElement.outerHTML);
        
        // Get all siblings until the next h3 or end
        let nextElement = currentElement.nextElementSibling;
        while (nextElement && nextElement.tagName !== 'H3') {
          contentParts.push((nextElement as HTMLElement).outerHTML);
          nextElement = nextElement.nextElementSibling;
        }
        
        sectionContent += contentParts.join('');
      }
    }
    
    return sectionContent || html; // Return full content if no specific section found
  };

  // Parse guide content sections
  let sections: ContentSection[] = [];
  
  try {
    // Try to parse as JSON first (for guides with structured content)
    if (guide.content && guide.content.trim().startsWith('[')) {
      sections = JSON.parse(guide.content);
    }
  } catch (e) {
    // Content is not JSON, treat it as plain HTML
  }
  
  // If no sections or parsing failed, parse HTML content
  if (sections.length === 0) {
    const content = guide.content || guide.excerpt;
    const contentLower = content.toLowerCase();
    
    // Detect content types and extract relevant sections
    const detectedSections: ContentSection[] = [];
    
    // Always add overview as the first section
    const overviewContent = content.split('<h3>')[0] || content; // Get content before first h3
    detectedSections.push({ 
      id: 'overview', 
      type: 'text', 
      content: overviewContent.trim() || content, 
      title: 'Overview' 
    });
    
    // Extract shopping content if present
    if (contentLower.includes('major stores') || contentLower.includes('fashion') || 
        contentLower.includes('shop') || contentLower.includes('retail')) {
      const shoppingContent = extractSectionContent(content, 'shopping');
      if (shoppingContent && shoppingContent !== content) {
        detectedSections.push({
          id: 'shopping',
          type: 'text',
          content: shoppingContent,
          title: 'Shopping Highlights'
        });
      }
    }
    
    // Extract dining content if present
    if (contentLower.includes('restaurant') || contentLower.includes('dining') || 
        contentLower.includes('food') || contentLower.includes('cafe')) {
      const diningContent = extractSectionContent(content, 'dining');
      if (diningContent && diningContent !== content) {
        detectedSections.push({
          id: 'dining',
          type: 'text',
          content: diningContent,
          title: 'Dining Options'
        });
      }
    }
    
    // Extract contact information if present
    if (contentLower.includes('phone:') || contentLower.includes('email:') || 
        contentLower.includes('address:') || contentLower.includes('contact')) {
      const contactContent = extractSectionContent(content, 'contact');
      if (contactContent && contactContent !== content) {
        detectedSections.push({
          id: 'contact',
          type: 'contact',
          content: contactContent,
          title: 'Contact Information'
        });
      }
    }
    
    // Extract entertainment/facilities if present
    if (contentLower.includes('entertainment') || contentLower.includes('facilities') || 
        contentLower.includes('cinema') || contentLower.includes('parking')) {
      const facilitiesContent = extractSectionContent(content, 'facilities');
      if (facilitiesContent && facilitiesContent !== content) {
        detectedSections.push({
          id: 'facilities',
          type: 'text',
          content: facilitiesContent,
          title: 'Facilities'
        });
      }
    }
    
    sections = detectedSections.length > 0 ? detectedSections : [{ 
      id: '1', 
      type: 'text', 
      content: content, 
      title: guide.title 
    }];
  }
  
  // Generate QR code URL with tracking parameters
  const baseUrl = `${window.location.origin}/guides/${guide.id}`;
  const qrMetadata = {
    type: 'guide' as const,
    entityId: guide.id,
    categoryId: category?.id,
    title: guide.title,
    description: guide.excerpt,
    businessId: guide.businessId ?? undefined
  };
  const qrCodeData = generateQRCodeData(baseUrl, qrMetadata, {
    utm_campaign: `guide_${guide.id}`,
    utm_content: guide.title.substring(0, 50)
  });
  const qrValue = qrCodeData.shortUrl || qrCodeData.trackingUrl;
  
  // Dynamically generate menu items based on available sections
  const menuItems = sections
    .filter(section => section.title) // Only include sections with titles
    .map(section => {
      // Create user-friendly labels for menu items
      let label = section.title || 'Section';
      
      // Format common section titles
      if (section.title === 'Overview') label = 'OVERVIEW';
      else if (section.title === 'Contact Information') label = 'CONTACT';
      else if (section.title === 'Dining Options') label = 'DINING';
      else if (section.title === 'Shopping Highlights') label = 'SHOPPING';
      else if (section.title === 'Gallery') label = 'GALLERY';
      else label = (section.title || 'Section').toUpperCase();
      
      return {
        id: section.id,
        label: label,
        sectionIndex: sections.indexOf(section)
      };
    })
    .slice(0, 6); // Limit to 6 menu items for UI consistency
  
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
  
  // Track menu clicks and navigate to section
  const handleMenuClick = useCallback((menuItem: { id: string; label: string; sectionIndex?: number }) => {
    // Navigate to the section if index is provided
    if (typeof menuItem.sectionIndex === 'number' && carouselApi.current) {
      carouselApi.current.scrollTo(menuItem.sectionIndex);
      setActiveSection(menuItem.sectionIndex);
      // Scroll to carousel section
      const carousel = document.querySelector('.carousel-container');
      if (carousel) {
        carousel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    trackClick('menu_item', menuItem.id, {
      guideId: guide.id,
      guideTitle: guide.title,
      menuLabel: menuItem.label,
      sectionIndex: menuItem.sectionIndex
    });
  }, [guide, trackClick]);
  
  // Track QR code expand
  const handleQRExpand = useCallback(() => {
    setShowQRModal(true);
    trackEvent('qr_expand_click', 'guide', guide.id, {
      guideTitle: guide.title,
      qrUrl: qrValue,
      categoryId: category?.id
    });
  }, [guide, trackEvent, qrValue, category]);
  
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
          <Carousel 
            className="w-full" 
            setApi={(api) => {
              if (api) {
                carouselApi.current = api;
                // Set up carousel API for programmatic navigation
                api.on('select', () => {
                  setActiveSection(api.selectedScrollSnap());
                });
              }
            }}
          >
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
          
          {/* Enhanced QR Code with tracking */}
          <div className="qr-container mt-auto flex flex-col items-center space-y-4">
            <DynamicQRCode
              value={qrValue}
              size={200}
              trackingId={guide.id}
              trackingType="guide"
              metadata={qrMetadata}
              instruction={t('Scan to save this guide')}
              showActions={true}
              onExpand={handleQRExpand}
              showFrame={true}
              animate={true}
              errorCorrectionLevel="H"
            />
            
            {/* Additional QR actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleQRExpand}
              className="w-full max-w-[200px]"
              data-testid="view-qr-fullscreen"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              View Fullscreen QR
            </Button>
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
      
      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={qrValue}
        title={guide.title}
        description={`${guide.excerpt.substring(0, 100)}...`}
        trackingId={guide.id}
        trackingType="guide"
        metadata={qrMetadata}
        instruction="Scan with your phone to save this guide"
        businessName={category?.name}
      />
    </div>
  );
}