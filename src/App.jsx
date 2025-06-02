import { useEffect, useState } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";

function App() {
  const [content, setContent] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/client.json").then((r) => r.json()),
      fetch("/config.json").then((r) => r.json())
    ])
      .then(([client, cfg]) => {
        setContent(client);
        setConfig(cfg);
      })
      .catch(console.error);
  }, []);

  if (!content || !config) return null;

  return (
    <main>
      <Header siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      {config.showHero && <HeroSection {...content.hero} primaryColor={config.primaryColor}/>}
      {config.showAbout && <AboutSection {...content.about} primaryColor={config.primaryColor}/>}
      {config.showServices && <ServicesSection {...content.services} primaryColor={config.primaryColor}/>}
      {config.showTestimonials && <TestimonialsSection {...content.testimonials} primaryColor={config.primaryColor}/>}
      {config.showContact && <ContactSection {...content.contact} primaryColor={config.primaryColor}/>}
    </main>
  );
}

export default App;
