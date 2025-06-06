import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

function Header({ siteTitle, logoUrl, config, primaryColor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);

  // Once the user scrolls down 20px, we switch header to solid white
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 20);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  const navLinks = [
    { id: "about", label: "About", enabled: config.showAbout },
    { id: "services", label: "Services", enabled: config.showServices },
    { id: "features", label: "Features", enabled: config.showFeatures },
    { id: "testimonials", label: "Testimonials", enabled: config.showTestimonials },
    { id: "faq", label: "FAQ", enabled: config.showFAQ },
    { id: "contact", label: "Contact", enabled: config.showContact },
  ];

  // If scrolled === false, we want a semi-transparent green overlay (so text remains white on green).
  // Once scrolled === true, swap to a solid white header.
  const headerBgClass = scrolled
    ? "bg-white shadow-md"                        // after scroll, solid white
    : `bg-${primaryColor}-800 bg-opacity-90`;      // at top, dark-green overlay

  return (
    <header className={`${headerBgClass} fixed w-full top-0 z-50 transition-colors`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-4">
          <img src={logoUrl} alt="Logo" className="h-16 w-auto max-h-20" />
          <h1 className={`text-2xl font-bold hidden sm:block ${scrolled ? "text-gray-900" : "text-white"}`}>
            {siteTitle}
          </h1>
        </div>

        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <XMarkIcon className={`h-6 w-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
            ) : (
              <Bars3Icon className={`h-6 w-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
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
                  className={`transition text-base ${
                    scrolled
                      ? `text-gray-600 hover:text-${primaryColor}-600`
                      : `text-white hover:text-${primaryColor}-300`
                  }`}
                >
                  {link.label}
                </a>
              )
          )}
        </nav>
      </div>

      {menuOpen && (
        <div className="sm:hidden px-6 pb-4 bg-white shadow-md">
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
