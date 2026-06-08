/**
 * RetailOS — Shop Configuration Types
 */
export interface ShopConfig {
  name: string;
  tagline?: string;
  description?: string;
  location?: string;
  // Branding
  colors: {
    primary: string;    // Main brand color (hex)
    accent?: string;    // Accent/highlight color (hex)
    bg: string;         // Background color (hex)
    text: string;       // Primary text color (hex)
    muted: string;      // Muted/secondary text color (hex)
  };
  // Public landing page content
  landing: {
    heroTitle: string;
    heroSubtitle?: string;
    sections?: Array<{
      title: string;
      subtitle?: string;
      body: string;
      image?: string;  // Path to section image (relative to public/)
      gallery?: string[];  // Additional images for the section
    }>;
    heroImage?: string;  // Hero background/banner image
  };
  // Contact / social
  contact?: {
    email?: string;
    instagram?: string;
    phone?: string;
  };
}
