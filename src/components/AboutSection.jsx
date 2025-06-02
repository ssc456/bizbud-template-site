function AboutSection({ title, text }) {
    return (
      <section className="py-12 px-6 bg-gray-50 text-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-4 text-lg">{text}</p>
        </div>
      </section>
    );
  }
  
  export default AboutSection;
  