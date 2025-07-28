// src/components/Header.jsx
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'; // Add Link import

function Header({ siteTitle, logoUrl, config, primaryColor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { id: 'about', label: 'About', enabled: config.showAbout },
    { id: 'services', label: 'Services', enabled: config.showServices },
    { id: 'features', label: 'Features', enabled: config.showFeatures },
    { id: 'gallery', label: 'Gallery', enabled: config.showGallery },
    { id: 'testimonials', label: 'Testimonials', enabled: config.showTestimonials },
    { id: 'faq', label: 'FAQ', enabled: config.showFAQ },
    { id: 'contact', label: 'Contact', enabled: config.showContact }
  ]

  const colorClasses = {
    pink: { bg: 'bg-pink-600', text: 'text-pink-600', hover: 'hover:text-pink-600' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:text-purple-600' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', hover: 'hover:text-blue-600' },
    green: { bg: 'bg-green-600', text: 'text-green-600', hover: 'hover:text-green-600' },
    red: { bg: 'bg-red-600', text: 'text-red-600', hover: 'hover:text-red-600' },
    yellow: { bg: 'bg-amber-600', text: 'text-amber-600', hover: 'hover:text-amber-600' }
  }[primaryColor] ?? { bg: 'bg-pink-600', text: 'text-pink-600', hover: 'hover:text-pink-600' }

  const handleNavClick = (e, id) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }

  // Check if we're on a page that needs dark text from the start
  const isWhiteBackgroundPage = location.pathname === '/upgrade' || 
                               location.pathname === '/book-appointment' || 
                               location.pathname.includes('/upgrade-success');
  
  // Force "scrolled" styling on white background pages or minimalist theme
  const shouldUseScrolledStyle = scrolled || isWhiteBackgroundPage || (config.theme === 'minimalist');

  // Update the Book Now button logic
  const renderBookButton = () => {
    if (config.showAppointments) {
      // Use Link for navigation to booking page when appointments are enabled
      return (
        <Link 
          to="/book-appointment"
          className={`px-6 py-2 rounded-full font-medium hover:scale-105 transition-all ${shouldUseScrolledStyle ? `${colorClasses.bg} text-white hover:opacity-90` : 'bg-white text-gray-900 hover:bg-gray-100'}`}
        >
          Book Now
        </Link>
      );
    } else {
      // Fall back to contact section if appointments are not enabled
      return (
        <a 
          href="#contact" 
          onClick={e => handleNavClick(e, 'contact')} 
          className={`px-6 py-2 rounded-full font-medium hover:scale-105 transition-all ${shouldUseScrolledStyle ? `${colorClasses.bg} text-white hover:opacity-90` : 'bg-white text-gray-900 hover:bg-gray-100'}`}
        >
          Contact Us
        </a>
      );
    }
  };

  return (
    <>
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        shouldUseScrolledStyle ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            {/* Logo and title */}
            <div className='flex items-center space-x-3'>
              <Link to="/" className="flex items-center space-x-3">
                {logoUrl && <img src={logoUrl} alt='Logo' className='h-10 w-auto sm:h-12 rounded-lg shadow-sm' onError={e => (e.target.style.display = 'none')} />}
                <h1 className={`text-xl sm:text-2xl font-bold ${shouldUseScrolledStyle ? 'text-gray-900' : 'text-white'}`}>{siteTitle}</h1>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className='hidden lg:flex items-center space-x-8'>
              {navLinks.map(l => l.enabled && (
                <a key={l.id} href={`#${l.id}`} onClick={e => handleNavClick(e, l.id)} className={`text-sm font-medium transition-all hover:scale-105 ${shouldUseScrolledStyle ? `text-gray-700 ${colorClasses.hover}` : 'text-white hover:text-gray-200'}`}>
                  {l.label}
                </a>
              ))}
              {renderBookButton()}
            </nav>
            
            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className={`lg:hidden p-2 rounded-lg ${shouldUseScrolledStyle ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile navigation */}
      {menuOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={() => setMenuOpen(false)} />
          <div className='absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100'>
            <nav className='px-4 py-6 space-y-4'>
              {navLinks.map(l => l.enabled && (
                <a key={l.id} href={`#${l.id}`} onClick={e => handleNavClick(e, l.id)} className={`block py-3 text-lg font-medium text-gray-700 ${colorClasses.hover}`}>
                  {l.label}
                </a>
              ))}
              
              {/* Mobile Book Now button - update to use Link */}
              {config.showAppointments ? (
                <Link 
                  to="/book-appointment"
                  onClick={() => setMenuOpen(false)}
                  className={`block w-full text-center py-3 mt-6 rounded-xl font-medium ${colorClasses.bg} text-white hover:opacity-90`}
                >
                  Book Now
                </Link>
              ) : (
                <a 
                  href="#contact" 
                  onClick={e => handleNavClick(e, 'contact')} 
                  className={`block w-full text-center py-3 mt-6 rounded-xl font-medium ${colorClasses.bg} text-white hover:opacity-90`}
                >
                  Contact Us
                </a>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Header
