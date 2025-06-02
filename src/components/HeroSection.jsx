function HeroSection({ headline, subheadline, ctaText }) {
    return (
      <section className="bg-blue-600 text-white text-center py-16 px-4">
        <h1 className="text-4xl font-bold">{headline}</h1>
        <p className="mt-4 text-xl">{subheadline}</p>
        <button className="mt-6 bg-white text-blue-600 font-semibold px-6 py-2 rounded shadow hover:bg-blue-100 transition">
          {ctaText}
        </button>
      </section>
    );
  }
  
  export default HeroSection;
  