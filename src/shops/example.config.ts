import type { ShopConfig } from '../shop.config.types';

const config: ShopConfig = {
  name: 'My Shop',
  tagline: 'Curated goods, thoughtfully sourced.',
  description: 'A small retail space bringing unique products to our community.',
  location: 'Somewhere beautiful',
  colors: {
    primary: '#4a6741',
    accent: '#c4956a',
    bg: '#faf8f5',
    text: '#2c2c2c',
    muted: '#7a7a7a',
  },
  landing: {
    heroTitle: 'Welcome',
    heroSubtitle: 'Curated goods, thoughtfully sourced.',
    sections: [
      {
        title: 'Our Story',
        body: 'We believe in quality over quantity, bringing you carefully selected products from artisans and growers we trust.',
      },
    ],
  },
};

export default config;
