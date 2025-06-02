import { useEffect, useState } from "react";
import content from "./content/content.json";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";

function App() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    setSiteContent(content);
  }, []);

  if (!siteContent) return null;

  return (
    <main>
      <Header siteTitle={siteContent.siteTitle} logoUrl={siteContent.logoUrl} />
      <HeroSection {...siteContent.hero} />
      <AboutSection {...siteContent.about} />
      <ContactSection {...siteContent.contact} />
    </main>
  );
}

export default App;
