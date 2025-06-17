import { useState } from 'react'
import FormField from '../components/FormField'

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
      name: "New Client",
      quote: "Enter the testimonial text here",
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
      {/* Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Testimonials Section</h2>
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

      {/* Quotes */}
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
            <div className="flex flex-wrap gap-2">
              {clientData.testimonials.quotes.map((quote, index) => (
                <button
                  key={index}
                  onClick={() => setActiveQuoteIndex(activeQuoteIndex === index ? null : index)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeQuoteIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {quote.name || `Testimonial ${index + 1}`}
                </button>
              ))}
            </div>

            {/* Active quote editor */}
            {activeQuoteIndex !== null && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    Editing: {clientData.testimonials.quotes[activeQuoteIndex].name || `Testimonial ${activeQuoteIndex + 1}`}
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
                    label="Client Name"
                    id={`quote-${activeQuoteIndex}-name`}
                    type="text"
                    value={clientData.testimonials.quotes[activeQuoteIndex].name || ''}
                    onChange={(e) => handleQuoteChange(activeQuoteIndex, 'name', e.target.value)}
                  />

                  <FormField
                    label="Testimonial"
                    id={`quote-${activeQuoteIndex}-quote`}
                    type="textarea"
                    value={clientData.testimonials.quotes[activeQuoteIndex].quote || ''}
                    onChange={(e) => handleQuoteChange(activeQuoteIndex, 'quote', e.target.value)}
                    rows={4}
                  />

                  <FormField
                    label="Profile Image URL"
                    id={`quote-${activeQuoteIndex}-image`}
                    type="text"
                    value={clientData.testimonials.quotes[activeQuoteIndex].image || ''}
                    onChange={(e) => handleQuoteChange(activeQuoteIndex, 'image', e.target.value)}
                    helpText="URL to profile picture (can be blank)"
                  />
                  
                  {/* Preview */}
                  {clientData.testimonials.quotes[activeQuoteIndex].image && (
                    <div className="flex items-center mt-2">
                      <div className="mr-3">
                        <img 
                          src={clientData.testimonials.quotes[activeQuoteIndex].image} 
                          alt={clientData.testimonials.quotes[activeQuoteIndex].name}
                          className="w-12 h-12 rounded-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://via.placeholder.com/100?text=Error";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{clientData.testimonials.quotes[activeQuoteIndex].name}</p>
                        <p className="text-sm text-gray-600">Image preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No testimonials added yet. Click 'Add Testimonial' to create your first testimonial.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestimonialsEditor