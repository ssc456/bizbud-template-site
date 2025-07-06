import React from 'react';

export default function InvoiceNavigation({ activeSection, setActiveSection }) {
  const navItems = [
    { id: 'company-info', label: 'Company Information' },
    { id: 'create-invoice', label: 'Create Invoice' },
    { id: 'invoices', label: 'Invoice History' }
  ];
  
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeSection === item.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}