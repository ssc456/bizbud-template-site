// src/components/Header.jsx
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

function Header({ siteTitle, logoUrl, config, primaryColor }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
    green: { bg: 'bg-green-600', text: 'text-green-600', hover: 'hover:text-green-600' }
  }[primaryColor] ?? colorClasses.pink

  const handleNavClick = (e, id) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  }

  return (
    <>
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <div className='flex items-center space-x-3'>
              {logoUrl && <img src={logoUrl} alt='Logo' className='h-10 w-auto sm:h-12 rounded-lg shadow-sm' onError={e => (e.target.style.display = 'none')} />}
              <h1 className={`text-xl sm:text-2xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>{siteTitle}</h1>
            </div>
            <nav className='hidden lg:flex items-center space-x-8'>
              {navLinks.map(l => l.enabled && (
                <a key={l.id} href={`#${l.id}`} onClick={e => handleNavClick(e, l.id)} className={`text-sm font-medium transition-all hover:scale-105 ${scrolled ? `text-gray-700 ${colorClasses.hover}` : 'text-white hover:text-gray-200'}`}>
                  {l.label}
                </a>
              ))}
              <a href='#contact' onClick={e => handleNavClick(e, 'contact')} className={`px-6 py-2 rounded-full font-medium hover:scale-105 transition-all ${scrolled ? `${colorClasses.bg} text-white hover:opacity-90` : 'bg-white text-gray-900 hover:bg-gray-100'}`}>
                Book Now
              </a>
            </nav>
            <button onClick={() => setMenuOpen(!menuOpen)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
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
              <a href='#contact' onClick={e => handleNavClick(e, 'contact')} className={`block w-full text-center py-3 mt-6 rounded-xl font-medium ${colorClasses.bg} text-white hover:opacity-90`}>
                Book Now
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
