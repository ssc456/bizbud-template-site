import * as DefaultHero from '../components/HeroSection';
import * as DefaultAbout from '../components/AboutSection';
import * as DefaultServices from '../components/ServicesSection';
import * as DefaultFeatures from '../components/FeaturesSection';
import * as DefaultGallery from '../components/GallerySection';
import * as DefaultTestimonials from '../components/TestimonialsSection';
import * as DefaultFAQ from '../components/FAQSection';
import * as DefaultContact from '../components/ContactSection';

// Import modern theme components
import * as ModernHero from './modern/HeroSection';
import * as ModernAbout from './modern/AboutSection';
import * as ModernServices from './modern/ServicesSection';
import * as ModernFeatures from './modern/FeaturesSection';
import * as ModernGallery from './modern/GallerySection';
import * as ModernTestimonials from './modern/TestimonialsSection';
import * as ModernFAQ from './modern/FAQSection';
import * as ModernContact from './modern/ContactSection';

// Theme definitions
const themes = {
  default: {
    name: 'Default',
    components: {
      HeroSection: DefaultHero.default,
      AboutSection: DefaultAbout.default,
      ServicesSection: DefaultServices.default,
      FeaturesSection: DefaultFeatures.default,
      GallerySection: DefaultGallery.default,
      TestimonialsSection: DefaultTestimonials.default,
      FAQSection: DefaultFAQ.default,
      ContactSection: DefaultContact.default
    }
  },
  modern: {
    name: 'Modern',
    components: {
      HeroSection: ModernHero.default,
      AboutSection: ModernAbout.default,
      ServicesSection: ModernServices.default,
      FeaturesSection: ModernFeatures.default, 
      GallerySection: ModernGallery.default,
      TestimonialsSection: ModernTestimonials.default,
      FAQSection: ModernFAQ.default,
      ContactSection: ModernContact.default
    }
  }
  // Add more themes here
};

// Component factory function that returns the appropriate themed component
export const getThemedComponent = (componentName, themeName = 'default') => {
  // Ensure theme exists, fallback to default
  const theme = themes[themeName] || themes.default;
  
  // Return the themed component or fallback to default if not found
  return theme.components[componentName] || themes.default.components[componentName];
};

// Export the available theme names for selection
export const availableThemes = Object.keys(themes);

// Export the theme definitions
export default themes;