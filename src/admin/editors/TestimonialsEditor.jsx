import { useState } from 'react';
import FormField from '../components/FormField';
import ImageUploader from '../components/ImageUploader';

function TestimonialsEditor({ clientData, setClientData }) {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(null);

  const handleSectionChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        [field]: value
      }
    }));
  };

  const handleQuoteChange = (index, field, value) => {
    const updatedQuotes = [...clientData.testimonials.quotes];
    updatedQuotes[index] = {
      ...updatedQuotes[index],
      [field]: value
    };
    
    setClientData(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        quotes: updatedQuotes
      }
    }));
  };

  const addQuote = () => {
    const newQuote = {
      name: "New Testimonial",
      quote: "What this person said about your business",
      image: ""
    };
    
    setClientData(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        quotes: [...prev.testimonials.quotes, newQuote]
      }
    }));
    
    setActiveQuoteIndex(clientData.testimonials.quotes.length);
  };

  const removeQuote = (index) => {
    const updatedQuotes = [...clientData.testimonials.quotes];
    updatedQuotes.splice(index, 1);
    
    setClientData(prev => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        quotes: updatedQuotes
      }
    }));
    
    if (activeQuoteIndex === index) {
      setActiveQuoteIndex(null);
    } else if (activeQuoteIndex > index) {
      setActiveQuoteIndex(activeQuoteIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Testimonials Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Testimonials Settings</h2>
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="testimonials-title"
            type="text"
            value={clientData.testimonials?.title || ''}
            onChange={(e) => handleSectionChange('title', e.target.value)}
          />
        </div>
      </div>

      {/* Testimonials Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Testimonials</h2>
          <button
            onClick={addQuote}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Testimonial
          </button>
        </div>

        {clientData.testimonials?.quotes?.length > 0 ? (
          <div className="space-y-4">
            {/* List of quotes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clientData.testimonials.quotes.map((quote, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuoteIndex(activeQuoteIndex === index ? null : index)}
                  className={`p-3 text-left border ${
                    activeQuoteIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } rounded-md`}
                >
                  <div className="flex items-center mb-2">
                    {quote.image ? (
                      <img
                        src={quote.image}
                        alt={quote.name}
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23f0f0f0'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                    )}
                    <span className="font-medium">{quote.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{quote.quote}</p>
                </button>
              ))}
            </div>

            {/* Active quote editor */}
            {activeQuoteIndex !== null && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    Editing Testimonial {activeQuoteIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeQuote(activeQuoteIndex)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Name"
                    id={`quote-${activeQuoteIndex}-name`}
                    type="text"
                    value={clientData.testimonials.quotes[activeQuoteIndex].name || ''}
                    onChange={(e) => handleQuoteChange(activeQuoteIndex, 'name', e.target.value)}
                  />

                  <FormField
                    label="Testimonial"
                    id={`quote-${activeQuoteIndex}-quote`}
                    type="textarea"
                    rows={4}
                    value={clientData.testimonials.quotes[activeQuoteIndex].quote || ''}
                    onChange={(e) => handleQuoteChange(activeQuoteIndex, 'quote', e.target.value)}
                  />

                  <ImageUploader
                    label="Person's Photo"
                    value={clientData.testimonials.quotes[activeQuoteIndex].image || ''}
                    onChange={(value) => handleQuoteChange(activeQuoteIndex, 'image', value)}
                    helpText="Upload a photo (recommended: square image, at least 100x100px)"
                    height="h-32"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No testimonials added yet. Click 'Add Testimonial' to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestimonialsEditor