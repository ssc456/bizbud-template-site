import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceNavigation from './components/invoice/InvoiceNavigation';
import CompanyInfoForm from './components/invoice/CompanyInfoForm';
import InvoiceCreator from './components/invoice/InvoiceCreator';
import InvoiceList from './components/invoice/InvoiceList';
import InvoicePreview from './components/invoice/InvoicePreview';

export default function InvoiceManager() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('invoices');
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Return to the main dashboard
  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        {/* Desktop Header */}
        <div className="hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex">
                <button 
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
                <h1 className="ml-4 text-xl font-semibold text-gray-900">Invoice Management</h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToDashboard}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                aria-label="Back to dashboard"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-lg font-medium">Invoices</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'invoices' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => { 
                  setActiveSection('invoices'); 
                  setMobileMenuOpen(false);
                }}
              >
                All Invoices
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'create-invoice' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => { 
                  setActiveSection('create-invoice'); 
                  setMobileMenuOpen(false);
                }}
              >
                Create Invoice
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === 'company-info' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => { 
                  setActiveSection('company-info'); 
                  setMobileMenuOpen(false);
                }}
              >
                Company Settings
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {!previewMode ? (
            <>
              <div className="hidden sm:block mb-6">
                <InvoiceNavigation 
                  activeSection={activeSection} 
                  setActiveSection={setActiveSection} 
                />
              </div>
              
              <div className="mt-4 sm:mt-6">
                {activeSection === 'company-info' && (
                  <CompanyInfoForm 
                    onSaved={() => setActiveSection('create-invoice')}
                  />
                )}
                
                {activeSection === 'create-invoice' && (
                  <InvoiceCreator 
                    setCurrentInvoice={setCurrentInvoice}
                    onPreview={() => setPreviewMode(true)}
                  />
                )}
                
                {activeSection === 'invoices' && (
                  <InvoiceList 
                    onSelectInvoice={(invoice) => {
                      setCurrentInvoice(invoice);
                      setPreviewMode(true);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <InvoicePreview 
              invoice={currentInvoice}
              onBack={() => setPreviewMode(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}