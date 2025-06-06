// src/components/HeroSection.jsx

import { motion } from "framer-motion";
import { patterns } from "../patterns";

function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  primaryColor,
  backgroundPatternName, // e.g. "hexagons" or ""
  backgroundImage,       // e.g. "/images/photo.jpg" or ""
}) {
  const hasPattern =
    Boolean(backgroundPatternName) &&
    Boolean(patterns[backgroundPatternName]);
  const hasImage = Boolean(backgroundImage && backgroundImage.length > 0);
  const patternCss = hasPattern ? patterns[backgroundPatternName] : null;

  // Changed from `h-screen` to `h-[75vh]` so it's 75% of viewport height
  const baseClasses =
    "relative w-full h-[75vh] flex items-center justify-center text-center overflow-hidden";
  const photoClasses = hasImage ? "bg-cover bg-center" : "";
  const patternClasses =
    !hasImage && hasPattern
      ? `pattern-container bg-${primaryColor}-800 bg-repeat`
      : "";

  // If no image and no pattern, but primaryColor is one of these, use that gradient class:
  const gradientColors = ["green", "blue", "teal"];
  const gradientClasses =
    !hasImage && !hasPattern && gradientColors.includes(primaryColor)
      ? `gradient-${primaryColor}`
      : "";

  // Otherwise fall back to a solid color
  const solidClasses =
    !hasImage && !hasPattern && !gradientColors.includes(primaryColor)
      ? `bg-${primaryColor}-800`
      : "";

  return (
    <section
      id="hero"
      className={`${baseClasses} ${photoClasses} ${patternClasses} ${gradientClasses} ${solidClasses}`}
      style={{
        ...(hasImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : {}),
        ...(hasPattern
          ? { "--pattern-url": patternCss }
          : {}),
      }}
    >
      {/* If using a photo, overlay a dark tint */}
      {hasImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}

      {/* Noise overlay, always on top */}
      <div
        className="absolute inset-0 bg-repeat opacity-10"
        style={{
          backgroundImage: "url('/images/noise.svg')",
        }}
      />

      <motion.div
        className="relative z-10 max-w-2xl px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
          {headline || "Welcome"}
        </h1>
        <p className="text-xl text-gray-200 mb-6">{subheadline || ""}</p>
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
