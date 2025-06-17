import { useState } from 'react'
import FormField from '../components/FormField'

function FAQEditor({ clientData, setClientData }) {
  const [activeItemIndex, setActiveItemIndex] = useState(null);

  const handleSectionChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...clientData.faq.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    setClientData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: updatedItems
      }
    }));
  };

  const addItem = () => {
    const newItem = {
      question: "New Question",
      answer: "Answer to the question."
    };
    
    setClientData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: [...prev.faq.items, newItem]
      }
    }));
    
    setActiveItemIndex(clientData.faq.items.length);
  };

  const removeItem = (index) => {
    const updatedItems = [...clientData.faq.items];
    updatedItems.splice(index, 1);
    
    setClientData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        items: updatedItems
      }
    }));
    
    if (activeItemIndex === index) {
      setActiveItemIndex(null);
    } else if (activeItemIndex > index) {
      setActiveItemIndex(activeItemIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">FAQ Section</h2>
        <div className="space-y-4">
          <FormField
            label="Section Title"
            id="faq-title"
            type="text"
            value={clientData.faq?.title || ''}
            onChange={(e) => handleSectionChange('title', e.target.value)}
          />
        </div>
      </div>

      {/* FAQ Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Questions & Answers</h2>
          <button
            onClick={addItem}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Question
          </button>
        </div>

        {clientData.faq?.items?.length > 0 ? (
          <div className="space-y-4">
            {/* List of FAQs */}
            <div className="flex flex-wrap gap-2">
              {clientData.faq.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveItemIndex(activeItemIndex === index ? null : index)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    activeItemIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {item.question.length > 30 
                    ? `${item.question.substring(0, 30)}...` 
                    : item.question || `Question ${index + 1}`}
                </button>
              ))}
            </div>

            {/* Active FAQ editor */}
            {activeItemIndex !== null && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    Editing Question {activeItemIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeItem(activeItemIndex)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Question"
                    id={`faq-${activeItemIndex}-question`}
                    type="text"
                    value={clientData.faq.items[activeItemIndex].question || ''}
                    onChange={(e) => handleItemChange(activeItemIndex, 'question', e.target.value)}
                  />

                  <FormField
                    label="Answer"
                    id={`faq-${activeItemIndex}-answer`}
                    type="textarea"
                    value={clientData.faq.items[activeItemIndex].answer || ''}
                    onChange={(e) => handleItemChange(activeItemIndex, 'answer', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No questions added yet. Click 'Add Question' to create your first FAQ item.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQEditor