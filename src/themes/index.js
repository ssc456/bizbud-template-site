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

// Import minimalist theme components
import * as MinimalistHero from './minimalist/HeroSection';
import * as MinimalistAbout from './minimalist/AboutSection';
import * as MinimalistServices from './minimalist/ServicesSection';
import * as MinimalistFeatures from './minimalist/FeaturesSection';
import * as MinimalistGallery from './minimalist/GallerySection';
import * as MinimalistTestimonials from './minimalist/TestimonialsSection';
import * as MinimalistFAQ from './minimalist/FAQSection';
import * as MinimalistContact from './minimalist/ContactSection';

// Import gradient theme components
import * as GradientHero from './gradient/HeroSection';
import * as GradientAbout from './gradient/AboutSection';
import * as GradientServices from './gradient/ServicesSection';
import * as GradientFeatures from './gradient/FeaturesSection';
import * as GradientGallery from './gradient/GallerySection';
import * as GradientTestimonials from './gradient/TestimonialsSection';
import * as GradientFAQ from './gradient/FAQSection';
import * as GradientContact from './gradient/ContactSection';


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
  },
  minimalist: {
    name: 'Minimalist',
    components: {
      HeroSection: MinimalistHero.default,
      AboutSection: MinimalistAbout.default,
      ServicesSection: MinimalistServices.default,
      FeaturesSection: MinimalistFeatures.default,
      GallerySection: MinimalistGallery.default,
      TestimonialsSection: MinimalistTestimonials.default,
      FAQSection: MinimalistFAQ.default,
      ContactSection: MinimalistContact.default
    }
  },
  gradient: {
    name: 'Gradient',
    components: {
      HeroSection: GradientHero.default,
      AboutSection: GradientAbout.default,
      ServicesSection: GradientServices.default,
      FeaturesSection: GradientFeatures.default,
      GallerySection: GradientGallery.default,
      TestimonialsSection: GradientTestimonials.default,
      FAQSection: GradientFAQ.default,
      ContactSection: GradientContact.default
    }
  }
  // Add more themes here
};

// Component factory function that returns the appropriate themed component
export const getThemedComponent = (componentName, themeName = 'default') => {
  // Ensure theme exists, fallback to default
  const theme = themes[themeName] || themes.default;
  const FallbackComponent = themes.default.components[componentName];
  
  // Return themed component or fallback to default
  return theme.components[componentName] || FallbackComponent;
};

export const getThemes = () => {
  return Object.entries(themes).map(([id, theme]) => ({
    id,
    name: theme.name,
  }));
};

// Export the available theme names for selection
export const availableThemes = Object.keys(themes);

// Export the theme definitions
export default themes;