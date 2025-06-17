// src/components/Footer.jsx
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa'

const colorMap = {
  blue: 'bg-blue-700',
  red: 'bg-red-700',
  green: 'bg-green-700',
  pink: 'bg-pink-700',
  yellow: 'bg-yellow-700',
  purple: 'bg-purple-700',
  indigo: 'bg-indigo-700',
  gray: 'bg-gray-700'
}

const socialIcons = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok
}

function Footer({ social, primaryColor, siteTitle }) {
  const bgColor = colorMap[primaryColor] || 'bg-blue-700'
  
  // Helper function to get platform name from URL
  const getPlatformFromUrl = (url) => {
    if (!url) return null;
    const platforms = Object.keys(socialIcons);
    return platforms.find(platform => url.toLowerCase().includes(platform));
  };

  return (
    <footer className={`${bgColor} text-white py-12`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold">{siteTitle || 'Business Name'}</h3>
            <p className="mt-2 text-sm text-white text-opacity-80">© {new Date().getFullYear()} All rights reserved</p>
          </div>

          {/* Social Links */}
          {social && Object.entries(social).length > 0 && (
            <div className="flex space-x-4">
              {Object.entries(social).map(([key, url]) => {
                if (!url) return null;
                const platform = getPlatformFromUrl(url) || key;
                const IconComponent = socialIcons[platform.toLowerCase()];
                
                if (!IconComponent) return null;
                
                return (
                  <a 
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-opacity-80 transition-opacity"
                    aria-label={`Visit our ${platform} page`}
                  >
                    <IconComponent className="text-2xl" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
