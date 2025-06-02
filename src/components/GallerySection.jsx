function GallerySection({ title, images, primaryColor }) {
  return (
    <section id="gallery" className="bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className={`text-3xl font-bold mb-10 text-${primaryColor}-700`}>{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((src, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-md">
              <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
