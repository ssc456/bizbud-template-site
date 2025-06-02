function Header({ siteTitle, logoUrl }) {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-3">
          <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-bold">{siteTitle}</h1>
        </div>
        <nav className="space-x-4">
          <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
          <a href="#services" className="text-gray-600 hover:text-blue-600">Services</a>
          <a href="#testimonials" className="text-gray-600 hover:text-blue-600">Testimonials</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
