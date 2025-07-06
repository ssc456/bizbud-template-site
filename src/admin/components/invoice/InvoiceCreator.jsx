import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function InvoiceCreator({ setCurrentInvoice, onPreview }) {
  const [loading, setLoading] = useState(false);
  const [companyInfoExists, setCompanyInfoExists] = useState(false);
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    client: {
      name: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
    items: [
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    subtotal: 0,
    taxRate: 20,
    taxAmount: 0,
    total: 0,
    notes: 'Payment is due within 30 days. Thank you for your business.',
  });
  
  // Check if company info exists on component mount
  useEffect(() => {
    const checkCompanyInfo = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/invoicing?action=getCompanyInfo&siteId=${siteId}`);
        
        if (response.ok) {
          const { companyInfo } = await response.json();
          // Check if essential company info exists
          setCompanyInfoExists(companyInfo && companyInfo.name && companyInfo.address);
        }
      } catch (error) {
        console.error('Error checking company info:', error);
      }
    };
    
    checkCompanyInfo();
  }, []);

  // Generate a new invoice number
  useEffect(() => {
    const generateInvoiceNumber = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/invoicing?action=getInvoices&siteId=${siteId}`);
        
        if (response.ok) {
          const { invoices } = await response.json();
          setInvoice(prev => ({
            ...prev,
            invoiceNumber: `INV-${String((invoices?.length || 0) + 1).padStart(3, '0')}`
          }));
        }
      } catch (error) {
        console.error('Error generating invoice number:', error);
      }
    };
    
    generateInvoiceNumber();
  }, []);

  // Calculate totals when items change
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total: subtotal + taxAmount
    }));
  };

  // Update a line item
  const updateLineItem = (index, field, value) => {
    const items = [...invoice.items];
    items[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    
    setInvoice(prev => ({ ...prev, items }));
    calculateTotals(items);
  };

  // Add a new line item
  const addLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', quantity: 1, rate: 0, amount: 0 }
      ]
    }));
  };

  // Remove a line item
  const removeLineItem = (index) => {
    if (invoice.items.length === 1) {
      toast.error('Invoice must have at least one item');
      return;
    }
    
    const items = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items }));
    calculateTotals(items);
  };

  // Handle form submission
  const handleSaveInvoice = async () => {
    // Basic validation
    if (!invoice.client.name) {
      toast.error('Client name is required');
      return;
    }
    
    if (invoice.items.some(item => !item.description)) {
      toast.error('All line items must have a description');
      return;
    }
    
    try {
      setLoading(true);
      const siteId = window.location.hostname.split('.')[0];
      const invoiceData = {
        ...invoice,
        id: `INV-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch('/api/invoicing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveInvoice',
          siteId,
          invoice: invoiceData
        })
      });
      
      if (response.ok) {
        const { invoice: savedInvoice } = await response.json();
        toast.success('Invoice created successfully');
        setCurrentInvoice(savedInvoice);
        onPreview();
      } else {
        toast.error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  // Preview the invoice without saving
  const handlePreviewInvoice = () => {
    // Basic validation
    if (!invoice.client.name) {
      toast.error('Client name is required');
      return;
    }
    
    if (invoice.items.some(item => !item.description)) {
      toast.error('All line items must have a description');
      return;
    }
    
    setCurrentInvoice({
      ...invoice,
      id: `DRAFT-${Date.now()}`,
      isDraft: true
    });
    onPreview();
  };

  if (!companyInfoExists) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You need to complete your company information before creating invoices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
        
        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={(e) => setInvoice({...invoice, issueDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        {/* Client Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Client Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name*</label>
              <input
                type="text"
                value={invoice.client.name}
                onChange={(e) => setInvoice({
                  ...invoice, 
                  client: {...invoice.client, name: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
              <input
                type="email"
                value={invoice.client.email}
                onChange={(e) => setInvoice({
                  ...invoice, 
                  client: {...invoice.client, email: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={invoice.client.address}
                onChange={(e) => setInvoice({
                  ...invoice, 
                  client: {...invoice.client, address: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={invoice.client.city}
                  onChange={(e) => setInvoice({
                    ...invoice, 
                    client: {...invoice.client, city: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={invoice.client.postalCode}
                  onChange={(e) => setInvoice({
                    ...invoice, 
                    client: {...invoice.client, postalCode: e.target.value}
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={invoice.client.country}
                onChange={(e) => setInvoice({
                  ...invoice, 
                  client: {...invoice.client, country: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        {/* Line Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Invoice Items</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Rate (£)</th>
                  <th className="p-2 text-right">Amount (£)</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-right"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">
                      £{item.amount.toFixed(2)}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            onClick={addLineItem}
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Line Item
          </button>
          
          {/* Totals - Makes smart use of space on mobile */}
          <div className="mt-4 flex flex-col md:flex-row md:justify-end">
            <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>£{invoice.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Tax Rate:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.taxRate}
                    onChange={(e) => {
                      const taxRate = parseFloat(e.target.value) || 0;
                      const taxAmount = invoice.subtotal * (taxRate / 100);
                      setInvoice({
                        ...invoice,
                        taxRate,
                        taxAmount,
                        total: invoice.subtotal + taxAmount
                      });
                    }}
                    className="w-16 p-1 border border-gray-300 rounded text-right"
                  />
                  <span className="ml-1">%</span>
                </div>
                <span>£{invoice.taxAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
                <span>Total:</span>
                <span>£{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({...invoice, notes: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-end gap-3 rounded-b-lg">
        <button
          onClick={handlePreviewInvoice}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Preview Invoice
        </button>
        
        <button
          onClick={handleSaveInvoice}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create & Preview Invoice'}
        </button>
      </div>
    </div>
  );
}