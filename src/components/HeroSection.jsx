// src/components/HeroSection.jsx

import { motion } from "framer-motion";
import { patterns } from "../patterns";

function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  primaryColor,
  backgroundPatternName,
  backgroundImage,
}) {
  const hasPattern =
    Boolean(backgroundPatternName) &&
    Boolean(patterns[backgroundPatternName]);
  const hasImage = Boolean(backgroundImage && backgroundImage.length > 0);
  const patternCss = hasPattern ? patterns[backgroundPatternName] : null;

  const baseClasses =
    "relative w-full h-[75vh] flex items-center justify-center text-center overflow-hidden";
  const photoClasses = hasImage ? "bg-cover bg-center" : "";
  const patternClasses =
    !hasImage && hasPattern
      ? `pattern-container bg-${primaryColor}-800 bg-repeat`
      : "";

  const gradientColors = ["green", "blue", "teal"];
  const gradientClasses =
    !hasImage && !hasPattern && gradientColors.includes(primaryColor)
      ? `gradient-${primaryColor}`
      : "";

  const solidClasses =
    !hasImage && !hasPattern && !gradientColors.includes(primaryColor)
      ? `bg-${primaryColor}-800`
      : "";

  return (
    <section
      id="hero"
      className={`${baseClasses} ${photoClasses} ${patternClasses} ${gradientClasses} ${solidClasses}`}
      style={{
        ...(hasImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
        ...(hasPattern ? { "--pattern-url": patternCss } : {}),
      }}
    >
      {hasImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      <div
        className="absolute inset-0 bg-repeat opacity-10"
        style={{ backgroundImage: "url('/images/noise.svg')" }}
      />
      <motion.div
        className="relative z-10 max-w-2xl px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
          {headline || "Welcome"}
        </h1>
        <p className="text-base sm:text-xl text-gray-200 mb-6">
          {subheadline || ""}
        </p>
        <motion.a
          href={ctaLink}
          className={`inline-block bg-white text-${primaryColor}-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {ctaText || "Get Started"}
        </motion.a>
      </motion.div>
    </section>
  );
}

export default HeroSection;
