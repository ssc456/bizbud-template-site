function HeroSection({ headline, subheadline, ctaText, ctaLink, primaryColor }) {
  return (
    <section id="hero" className={`bg-${primaryColor}-600 text-white py-32 px-6 text-center`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{headline || "Welcome"}</h1>
        <p className="text-xl mb-6">{subheadline || "We help businesses grow online."}</p>
        <a
          href={ctaLink}
          className={`inline-block bg-white text-${primaryColor}-600 font-bold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 transition`}
        >
          {ctaText || "Get Started"}
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
