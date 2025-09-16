# Overview

This is a modern lobby application designed for large displays in hotel/resort environments. The system provides an interactive guide platform where guests can browse categorized content including hotel information, city guides, restaurant menus, activities, and local business listings. The application features a React frontend with Node.js/Express backend, PostgreSQL database with Drizzle ORM, and includes comprehensive analytics, advertising capabilities, and offline PWA functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Components**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **PWA Support**: Service worker implementation for offline functionality and app installation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API endpoints with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL session storage with connect-pg-simple
- **File Structure**: Modular routes and storage abstraction layer

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Core Entities**:
  - Categories and subcategories for content organization
  - Guides with rich content support (JSON-based content sections)
  - Businesses for partner/advertiser management
  - Ad campaigns and slots for monetization
  - Analytics events for usage tracking
  - User sessions for engagement analysis

## Content Management
- **Rich Content Editor**: Custom content editor supporting multiple section types (text, images, videos, menus, contact info)
- **Content Storage**: JSON-based content sections stored in guide records
- **Media Support**: Image and file upload capabilities for guide content
- **Multi-language Ready**: i18n infrastructure prepared for localization

## Analytics & Tracking
- **Event Tracking**: Comprehensive analytics system tracking views, clicks, impressions, and engagement
- **User Behavior**: Session memory, navigation paths, and user preference tracking
- **QR Code Analytics**: Advanced QR code generation with tracking and scan probability estimation
- **Performance Metrics**: Scroll depth tracking, engagement timers, and interaction analytics

## Advertising Platform
- **Ad Campaign Management**: Full CRUD operations for advertising campaigns
- **Slot-based Placement**: Strategic ad placement throughout the application
- **Impression/Click Tracking**: Real-time ad performance monitoring
- **Business Integration**: Partner portal for business account management
- **Revenue Optimization**: Premium guide placement and sponsored content support

## Offline & PWA Features
- **Service Worker**: Comprehensive caching strategy for offline functionality
- **App Installation**: Progressive Web App with manifest configuration
- **Offline Fallback**: Dedicated offline page with cached content access
- **Background Sync**: Queued analytics and interaction tracking when offline

## Touch & Display Optimization
- **Large Screen Design**: Optimized for lobby kiosks and large displays
- **Touch Interaction**: Touch-friendly interface with appropriate hit targets
- **Idle Detection**: Screensaver mode with configurable timeout and ad rotation
- **Responsive Design**: Adaptive layout supporting various screen sizes

## Security & Performance
- **Input Validation**: Zod schema validation for all API inputs
- **Error Handling**: Comprehensive error boundaries and API error management
- **Caching Strategy**: React Query with stale-while-revalidate pattern
- **Performance Monitoring**: Bundle optimization and runtime error tracking via Replit plugins

# External Dependencies

## Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **UI Framework**: Radix UI component primitives
- **Styling**: Tailwind CSS framework
- **State Management**: TanStack React Query
- **Build Tool**: Vite with React plugin

## Third-party Services
- **Weather API**: OpenWeather API integration for lobby weather display
- **Analytics**: Custom analytics implementation with event tracking
- **QR Code Generation**: React QR Code library for dynamic code generation
- **Session Storage**: PostgreSQL-based session management

## Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Production build optimization
- **PostCSS**: CSS processing with Tailwind integration
- **Hot Module Replacement**: Development experience via Vite HMR

## Hosting & Deployment
- **Platform**: Replit deployment with integrated development environment
- **CDN**: Static asset serving via Vite build output
- **Environment**: Node.js runtime with ES modules support
- **Monitoring**: Replit cartographer for development insights