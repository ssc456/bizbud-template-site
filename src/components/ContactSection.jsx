// src/components/ContactSection.jsx
import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

function ContactSection({ title, description, email, phone, address, primaryColor, clientData }) {
  // Add form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the site ID from the URL (e.g., example.entrynets.com -> example)
      const hostname = window.location.hostname;
      let siteId = hostname.split('.')[0];
      
      // If on localhost, use a default or from env
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        siteId = import.meta.env.VITE_SITE_ID || 'demo';
      }
      
      const response = await fetch(`/api/contact?siteId=${siteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Success
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id='contact' className='bg-gray-50 py-20 px-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-12'>
          <EnvelopeIcon className={`h-10 w-10 mx-auto mb-4 text-${primaryColor}-500`} />
          <h2 className='text-3xl font-bold mb-4'>{title}</h2>
          <p className='text-gray-700 mb-6 max-w-2xl mx-auto'>{description}</p>
        </div>
        
        {/* Contact Form */}
        <div className='bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto'>
          <form onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
              <div>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Your name'
                />
              </div>
              
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Your email'
                />
              </div>
            </div>
            
            <div className='mb-4'>
              <label htmlFor='subject' className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
              <input
                type='text'
                id='subject'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Subject'
              />
            </div>
            
            <div className='mb-4'>
              <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
              <textarea
                id='message'
                name='message'
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Your message'
              />
            </div>
            
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-full text-white bg-${primaryColor}-500 hover:bg-${primaryColor}-600 transition font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Contact Information */}
        {(email || phone || address) && (
          <div className='mt-8 text-center'>
            <div className='flex flex-wrap justify-center gap-6 mt-4'>
              {email && (
                <a href={`mailto:${email}`} className='flex items-center text-gray-700 hover:text-blue-600'>
                  <span className={`mr-2 text-${primaryColor}-500`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  {email}
                </a>
              )}
              
              {phone && (
                <a href={`tel:${phone}`} className='flex items-center text-gray-700 hover:text-blue-600'>
                  <span className={`mr-2 text-${primaryColor}-500`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </span>
                  {phone}
                </a>
              )}
              
              {address && (
                <div className='flex items-center text-gray-700'>
                  <span className={`mr-2 text-${primaryColor}-500`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  {address}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ContactSection;
