import { Link } from 'react-router-dom';

export default function Dashboard({ clientData }) {
  const sections = [
    { id: 'general', label: 'General Settings', path: '/admin/dashboard/general', icon: '⚙️' },
    { id: 'hero', label: 'Hero Section', path: '/admin/dashboard/hero', icon: '🏆' },
    { id: 'about', label: 'About Section', path: '/admin/dashboard/about', icon: 'ℹ️' },
    { id: 'services', label: 'Services Section', path: '/admin/dashboard/services', icon: '🛠️' },
    { id: 'features', label: 'Features Section', path: '/admin/dashboard/features', icon: '✨' },
    { id: 'gallery', label: 'Gallery Section', path: '/admin/dashboard/gallery', icon: '🖼️' },
    { id: 'testimonials', label: 'Testimonials Section', path: '/admin/dashboard/testimonials', icon: '💬' },
    { id: 'faq', label: 'FAQ Section', path: '/admin/dashboard/faq', icon: '❓' },
    { id: 'contact', label: 'Contact Section', path: '/admin/dashboard/contact', icon: '📞' },
    { id: 'social', label: 'Social Media', path: '/admin/dashboard/social', icon: '📱' },
    { id: 'config', label: 'Display Settings', path: '/admin/dashboard/config', icon: '🎨' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Admin Panel</h2>
        <p className="text-gray-600 mb-4">
          This interface allows you to edit your website content and see a live preview of your changes.
          Click any section below to begin editing.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{clientData.services?.items?.length || 0}</div>
            <div className="text-gray-500 mt-1">Services</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{clientData.testimonials?.quotes?.length || 0}</div>
            <div className="text-gray-500 mt-1">Testimonials</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{clientData.gallery?.images?.length || 0}</div>
            <div className="text-gray-500 mt-1">Gallery Images</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Edit Content</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link 
              key={section.id} 
              to={section.path}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="text-2xl mb-2">{section.icon}</div>
              <div className="text-center">{section.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}