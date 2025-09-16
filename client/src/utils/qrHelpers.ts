// QR Code Helper Utilities

export interface QRTrackingParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  qr_id?: string;
  qr_type?: string;
  timestamp?: string;
  session_id?: string;
  entity_id?: string;
  entity_type?: string;
}

export interface QRMetadata {
  type: 'guide' | 'business' | 'event' | 'offer' | 'menu' | 'booking' | 'contact' | 'emergency';
  entityId: string;
  businessId?: string;
  categoryId?: string;
  title?: string;
  description?: string;
  validUntil?: Date;
}

export interface QRCodeData {
  url: string;
  trackingUrl: string;
  shortUrl?: string;
  metadata: QRMetadata;
  trackingParams: QRTrackingParams;
  qrId: string;
}

// Generate unique QR session ID
export function generateQRSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `qr_${timestamp}_${random}`;
}

// Build tracking URL with UTM and custom parameters
export function buildTrackingUrl(
  baseUrl: string,
  params: QRTrackingParams = {},
  metadata?: QRMetadata
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  // Add UTM parameters
  if (params.utm_source) url.searchParams.set('utm_source', params.utm_source);
  if (params.utm_medium) url.searchParams.set('utm_medium', params.utm_medium);
  if (params.utm_campaign) url.searchParams.set('utm_campaign', params.utm_campaign);
  if (params.utm_content) url.searchParams.set('utm_content', params.utm_content);
  
  // Add QR tracking parameters
  if (params.qr_id) url.searchParams.set('qr_id', params.qr_id);
  if (params.qr_type) url.searchParams.set('qr_type', params.qr_type);
  if (params.timestamp) url.searchParams.set('qr_ts', params.timestamp);
  if (params.session_id) url.searchParams.set('qr_session', params.session_id);
  if (params.entity_id) url.searchParams.set('entity_id', params.entity_id);
  if (params.entity_type) url.searchParams.set('entity_type', params.entity_type);
  
  // Add metadata if provided
  if (metadata) {
    url.searchParams.set('qr_meta_type', metadata.type);
    if (metadata.businessId) url.searchParams.set('business_id', metadata.businessId);
    if (metadata.categoryId) url.searchParams.set('category_id', metadata.categoryId);
  }
  
  return url.toString();
}

// Simple URL shortener logic (in production, use a real URL shortener service)
export function createShortUrl(longUrl: string): string {
  // For now, we'll use a hash-based approach
  // In production, integrate with a URL shortener service like Bitly or create a backend service
  const hash = btoa(longUrl).substring(0, 8).replace(/[^a-zA-Z0-9]/g, '');
  
  // Store mapping in localStorage for demo purposes
  // In production, this should be stored in a database
  const shortUrlMap = JSON.parse(localStorage.getItem('qr_short_urls') || '{}');
  shortUrlMap[hash] = longUrl;
  localStorage.setItem('qr_short_urls', JSON.stringify(shortUrlMap));
  
  return `${window.location.origin}/qr/${hash}`;
}

// Generate QR code data with all tracking information
export function generateQRCodeData(
  baseUrl: string,
  metadata: QRMetadata,
  customParams?: Partial<QRTrackingParams>
): QRCodeData {
  const qrId = generateQRSessionId();
  
  const trackingParams: QRTrackingParams = {
    utm_source: 'qr_code',
    utm_medium: metadata.type,
    utm_campaign: `${metadata.type}_${metadata.entityId}`,
    utm_content: metadata.title?.substring(0, 50),
    qr_id: qrId,
    qr_type: metadata.type,
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem('sessionId') || generateQRSessionId(),
    entity_id: metadata.entityId,
    entity_type: metadata.type,
    ...customParams
  };
  
  const trackingUrl = buildTrackingUrl(baseUrl, trackingParams, metadata);
  const shortUrl = trackingUrl.length > 100 ? createShortUrl(trackingUrl) : undefined;
  
  return {
    url: baseUrl,
    trackingUrl,
    shortUrl,
    metadata,
    trackingParams,
    qrId
  };
}

// Generate deep link URLs for mobile apps
export function generateDeepLink(
  type: string,
  entityId: string,
  additionalParams?: Record<string, string>
): string {
  // Example deep link format: lobbyapp://type/entityId?param=value
  const scheme = 'lobbyapp';
  const path = `${type}/${entityId}`;
  
  const url = new URL(`${scheme}://${path}`);
  
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

// Generate vCard format for contact QR codes
export function generateVCard(contact: {
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  address?: string;
  website?: string;
}): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    contact.organization ? `ORG:${contact.organization}` : '',
    contact.title ? `TITLE:${contact.title}` : '',
    contact.phone ? `TEL:${contact.phone}` : '',
    contact.email ? `EMAIL:${contact.email}` : '',
    contact.address ? `ADR:;;${contact.address}` : '',
    contact.website ? `URL:${contact.website}` : '',
    'END:VCARD'
  ].filter(line => line).join('\n');
  
  return vcard;
}

// Generate calendar event format for booking QR codes
export function generateCalendarEvent(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  organizer?: string;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    event.organizer ? `ORGANIZER:${event.organizer}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line).join('\n');
  
  return ics;
}

// Generate WiFi connection QR code
export function generateWiFiQR(network: {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}): string {
  // WiFi QR format: WIFI:T:WPA;S:network;P:password;H:hidden;
  const { ssid, password, encryption, hidden = false } = network;
  return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};`;
}

// Format phone number for tel: URL
export function formatPhoneForQR(phone: string): string {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleaned}`;
}

// Format email for mailto: URL
export function formatEmailForQR(
  email: string,
  subject?: string,
  body?: string
): string {
  let url = `mailto:${email}`;
  const params = [];
  
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  return url;
}

// Parse QR tracking parameters from URL
export function parseQRTrackingParams(url: string): QRTrackingParams {
  const urlObj = new URL(url);
  const params: QRTrackingParams = {};
  
  // Extract UTM parameters
  if (urlObj.searchParams.has('utm_source')) {
    params.utm_source = urlObj.searchParams.get('utm_source') || undefined;
  }
  if (urlObj.searchParams.has('utm_medium')) {
    params.utm_medium = urlObj.searchParams.get('utm_medium') || undefined;
  }
  if (urlObj.searchParams.has('utm_campaign')) {
    params.utm_campaign = urlObj.searchParams.get('utm_campaign') || undefined;
  }
  if (urlObj.searchParams.has('utm_content')) {
    params.utm_content = urlObj.searchParams.get('utm_content') || undefined;
  }
  
  // Extract QR-specific parameters
  if (urlObj.searchParams.has('qr_id')) {
    params.qr_id = urlObj.searchParams.get('qr_id') || undefined;
  }
  if (urlObj.searchParams.has('qr_type')) {
    params.qr_type = urlObj.searchParams.get('qr_type') || undefined;
  }
  if (urlObj.searchParams.has('qr_ts')) {
    params.timestamp = urlObj.searchParams.get('qr_ts') || undefined;
  }
  if (urlObj.searchParams.has('qr_session')) {
    params.session_id = urlObj.searchParams.get('qr_session') || undefined;
  }
  if (urlObj.searchParams.has('entity_id')) {
    params.entity_id = urlObj.searchParams.get('entity_id') || undefined;
  }
  if (urlObj.searchParams.has('entity_type')) {
    params.entity_type = urlObj.searchParams.get('entity_type') || undefined;
  }
  
  return params;
}

// Estimate QR scan probability based on engagement metrics
export function estimateScanProbability(metrics: {
  impressionDuration: number; // milliseconds
  viewportPercentage: number; // 0-100
  userInteraction: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}): number {
  let probability = 0;
  
  // Base probability from impression duration
  if (metrics.impressionDuration > 5000) {
    probability += 0.3; // 30% for >5 seconds
  } else if (metrics.impressionDuration > 2000) {
    probability += 0.15; // 15% for 2-5 seconds
  } else if (metrics.impressionDuration > 500) {
    probability += 0.05; // 5% for 0.5-2 seconds
  }
  
  // Adjust for viewport percentage
  if (metrics.viewportPercentage > 80) {
    probability += 0.2; // 20% for mostly visible
  } else if (metrics.viewportPercentage > 50) {
    probability += 0.1; // 10% for half visible
  }
  
  // Bonus for user interaction
  if (metrics.userInteraction) {
    probability += 0.25; // 25% for click/hover
  }
  
  // Device type adjustment
  if (metrics.deviceType === 'mobile') {
    probability *= 1.5; // Mobile users more likely to scan
  } else if (metrics.deviceType === 'tablet') {
    probability *= 1.2; // Tablets slightly more likely
  }
  
  // Cap at 95% maximum
  return Math.min(probability, 0.95);
}