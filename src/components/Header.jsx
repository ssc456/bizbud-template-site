import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

function Header({ siteTitle, logoUrl, config, primaryColor }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <img src={logoUrl} alt="Logo" className="h-16 w-auto max-h-20" />
          <h1 className="text-2xl font-bold hidden sm:block">{siteTitle}</h1>
        </div>

        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        <nav className="hidden sm:flex space-x-6">
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

      {menuOpen && (
        <div className="sm:hidden px-6 pb-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map(
              (link) =>
                link.enabled && (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className={`text-gray-600 hover:text-${primaryColor}-600 transition text-base`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
