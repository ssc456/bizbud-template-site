function Header({ siteTitle, logoUrl, config, primaryColor }) {
  const navLinks = [
    { id: 'about', label: 'About', enabled: config.showAbout },
    { id: 'services', label: 'Services', enabled: config.showServices },
    { id: 'features', label: 'Features', enabled: config.showFeatures },
    { id: 'testimonials', label: 'Testimonials', enabled: config.showTestimonials },
    { id: 'faq', label: 'FAQ', enabled: config.showFAQ },
    { id: 'contact', label: 'Contact', enabled: config.showContact }
  ];

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-4">
          <img src={logoUrl} alt="Logo" className="h-20 w-auto max-h-24" />
          <h1 className="text-3xl font-bold">{siteTitle}</h1>
        </div>
        <nav className="space-x-6">
          {navLinks.map(
            (link) =>
              link.enabled && (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`text-gray-600 hover:text-${primaryColor}-600 transition text-base`}
                >
                  {link.label}
                </a>
              )
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
