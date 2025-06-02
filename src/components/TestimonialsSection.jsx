function TestimonialsSection({ title, quotes, primaryColor }) {
  return (
    <section id="testimonials" className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((t, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-lg shadow text-left relative">
              <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full mb-3" />
              <p className="text-gray-700 italic mb-4">“{t.quote}”</p>
              <p className="text-gray-900 font-semibold">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
