import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export default function InvoiceEditor() {
  const [invoices, setInvoices] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    registrationNumber: '',
    taxId: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    bankName: '',
    accountNumber: '',
    sortCode: '',
    iban: '',
  });
  
  const [currentInvoice, setCurrentInvoice] = useState({
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
    taxRate: 20, // Default to 20% VAT
    taxAmount: 0,
    total: 0,
    notes: 'Payment is due within 30 days. Thank you for your business.',
    status: 'unpaid', // Add status field with default 'unpaid'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Load company information and invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        
        // Fetch company information
        const companyResponse = await fetch(`/api/invoicing?action=getCompanyInfo&siteId=${siteId}`);
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          if (companyData.companyInfo) {
            setCompanyInfo(companyData.companyInfo);
          }
        }
        
        // Fetch invoices
        const invoicesResponse = await fetch(`/api/invoicing?action=getInvoices&siteId=${siteId}`);
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          setInvoices(invoicesData.invoices || []);
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        toast.error('Failed to load invoice data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate line item amount when quantity or rate changes
  const updateLineItem = (index, field, value) => {
    const updatedItems = [...currentInvoice.items];
    updatedItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setCurrentInvoice({
      ...currentInvoice,
      items: updatedItems,
    });
    
    // Recalculate totals
    calculateTotals(updatedItems);
  };
  
  // Add a new line item
  const addLineItem = () => {
    setCurrentInvoice({
      ...currentInvoice,
      items: [
        ...currentInvoice.items,
        { description: '', quantity: 1, rate: 0, amount: 0 }
      ]
    });
  };
  
  // Remove a line item
  const removeLineItem = (index) => {
    if (currentInvoice.items.length === 1) {
      toast.error('Invoice must have at least one item');
      return;
    }
    
    const updatedItems = currentInvoice.items.filter((_, i) => i !== index);
    setCurrentInvoice({
      ...currentInvoice,
      items: updatedItems
    });
    
    // Recalculate totals
    calculateTotals(updatedItems);
  };
  
  // Calculate subtotal, tax, and total
  const calculateTotals = (items = currentInvoice.items) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (currentInvoice.taxRate / 100);
    const total = subtotal + taxAmount;
    
    setCurrentInvoice({
      ...currentInvoice,
      items,
      subtotal,
      taxAmount,
      total
    });
  };
  
  // Save company information
  const saveCompanyInfo = async () => {
    try {
      const siteId = window.location.hostname.split('.')[0];
      const response = await fetch('/api/invoicing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'saveCompanyInfo',
          siteId,
          companyInfo
        })
      });
      
      if (response.ok) {
        toast.success('Company information saved');
      } else {
        toast.error('Failed to save company information');
      }
    } catch (error) {
      console.error('Error saving company info:', error);
      toast.error('Failed to save company information');
    }
  };
  
  // Save the current invoice
  const saveInvoice = async () => {
    // Basic validation
    if (!currentInvoice.client.name || !currentInvoice.invoiceNumber) {
      toast.error('Client name and invoice number are required');
      return;
    }
    
    if (currentInvoice.items.some(item => !item.description)) {
      toast.error('All line items must have a description');
      return;
    }
    
    try {
      const siteId = window.location.hostname.split('.')[0];
      const invoice = {
        ...currentInvoice,
        id: currentInvoice.id || `INV-${Date.now()}`,
        createdAt: currentInvoice.createdAt || new Date().toISOString()
      };
      
      const response = await fetch('/api/invoicing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'saveInvoice',
          siteId,
          invoice
        })
      });
      
      if (response.ok) {
        const { invoice: savedInvoice } = await response.json();
        
        // Update invoices list
        if (isEditing) {
          setInvoices(invoices.map(inv => inv.id === savedInvoice.id ? savedInvoice : inv));
        } else {
          setInvoices([...invoices, savedInvoice]);
        }
        
        toast.success('Invoice saved successfully');
        resetInvoiceForm();
      } else {
        toast.error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    }
  };
  
  // Reset the invoice form for a new invoice
  const resetInvoiceForm = () => {
    setCurrentInvoice({
      invoiceNumber: `INV-${invoices.length + 1}`,
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
      status: 'unpaid',
    });
    setIsEditing(false);
  };
  
  // Edit an existing invoice
  const editInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setIsEditing(true);
  };
  
  // Generate and download PDF
  const generatePDF = () => {
    // Check if we have necessary info
    if (!companyInfo.name || !currentInvoice.client.name) {
      toast.error('Company and client information are required');
      return;
    }
    
    try {
      const doc = new jsPDF();
      
      // Add logo if available
      // This would require additional work to load and position the logo
      
      // Add company info
      doc.setFontSize(20);
      doc.text('INVOICE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(companyInfo.name, 15, 40);
      doc.text(`${companyInfo.address}`, 15, 45);
      doc.text(`${companyInfo.city}, ${companyInfo.postalCode}`, 15, 50);
      doc.text(`${companyInfo.country}`, 15, 55);
      doc.text(`Phone: ${companyInfo.phone}`, 15, 60);
      doc.text(`Email: ${companyInfo.email}`, 15, 65);
      
      if (companyInfo.registrationNumber) {
        doc.text(`Reg No: ${companyInfo.registrationNumber}`, 15, 70);
      }
      
      if (companyInfo.taxId) {
        doc.text(`VAT/Tax ID: ${companyInfo.taxId}`, 15, 75);
      }
      
      // Add invoice details
      doc.text('Invoice To:', 140, 40);
      doc.text(currentInvoice.client.name, 140, 45);
      doc.text(`${currentInvoice.client.address || ''}`, 140, 50);
      doc.text(`${currentInvoice.client.city || ''}, ${currentInvoice.client.postalCode || ''}`, 140, 55);
      doc.text(`${currentInvoice.client.country || ''}`, 140, 60);
      doc.text(`Email: ${currentInvoice.client.email || ''}`, 140, 65);
      
      doc.text(`Invoice Number: ${currentInvoice.invoiceNumber}`, 15, 85);
      doc.text(`Issue Date: ${currentInvoice.issueDate}`, 15, 90);
      doc.text(`Due Date: ${currentInvoice.dueDate}`, 15, 95);
      
      // Add line items
      const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
      const tableRows = [];
      
      currentInvoice.items.forEach(item => {
        const itemData = [
          item.description,
          item.quantity,
          `£${item.rate.toFixed(2)}`,
          `£${item.amount.toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
      
      autoTable(doc, {
        startY: 105,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Add totals
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.text(`Subtotal: £${currentInvoice.subtotal.toFixed(2)}`, 140, finalY + 10);
      doc.text(`VAT (${currentInvoice.taxRate}%): £${currentInvoice.taxAmount.toFixed(2)}`, 140, finalY + 15);
      doc.text(`Total: £${currentInvoice.total.toFixed(2)}`, 140, finalY + 20);
      
      // Add notes
      if (currentInvoice.notes) {
        doc.text('Notes:', 15, finalY + 30);
        doc.text(currentInvoice.notes, 15, finalY + 35);
      }
      
      // Add payment information
      if (companyInfo.bankName || companyInfo.accountNumber) {
        doc.text('Payment Information:', 15, finalY + 45);
        if (companyInfo.bankName) doc.text(`Bank: ${companyInfo.bankName}`, 15, finalY + 50);
        if (companyInfo.accountNumber) doc.text(`Account Number: ${companyInfo.accountNumber}`, 15, finalY + 55);
        if (companyInfo.sortCode) doc.text(`Sort Code: ${companyInfo.sortCode}`, 15, finalY + 60);
        if (companyInfo.iban) doc.text(`IBAN: ${companyInfo.iban}`, 15, finalY + 65);
      }
      
      // Save the PDF
      doc.save(`${currentInvoice.invoiceNumber}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Invoice Management</h2>
      
      {/* Company Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Company Information</h3>
        <p className="text-sm text-gray-600 mb-4">This information will appear on your invoices</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input
              type="text"
              value={companyInfo.registrationNumber}
              onChange={(e) => setCompanyInfo({...companyInfo, registrationNumber: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VAT/Tax ID</label>
            <input
              type="text"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={companyInfo.city}
              onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={companyInfo.postalCode}
              onChange={(e) => setCompanyInfo({...companyInfo, postalCode: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={companyInfo.country}
              onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={companyInfo.phone}
              onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={companyInfo.email}
              onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-2">Payment Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={companyInfo.bankName}
                onChange={(e) => setCompanyInfo({...companyInfo, bankName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={companyInfo.accountNumber}
                onChange={(e) => setCompanyInfo({...companyInfo, accountNumber: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
              <input
                type="text"
                value={companyInfo.sortCode}
                onChange={(e) => setCompanyInfo({...companyInfo, sortCode: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input
                type="text"
                value={companyInfo.iban}
                onChange={(e) => setCompanyInfo({...companyInfo, iban: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={saveCompanyInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Company Information
          </button>
        </div>
      </div>
      
      {/* Invoice Creator */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">
          {isEditing ? `Edit Invoice ${currentInvoice.invoiceNumber}` : 'Create New Invoice'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
            <input
              type="text"
              value={currentInvoice.invoiceNumber}
              onChange={(e) => setCurrentInvoice({...currentInvoice, invoiceNumber: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={currentInvoice.issueDate}
              onChange={(e) => setCurrentInvoice({...currentInvoice, issueDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={currentInvoice.dueDate}
              onChange={(e) => setCurrentInvoice({...currentInvoice, dueDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        {/* Client Information */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Client Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={currentInvoice.client.name}
                onChange={(e) => setCurrentInvoice({
                  ...currentInvoice, 
                  client: {...currentInvoice.client, name: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
              <input
                type="email"
                value={currentInvoice.client.email}
                onChange={(e) => setCurrentInvoice({
                  ...currentInvoice, 
                  client: {...currentInvoice.client, email: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={currentInvoice.client.address}
                onChange={(e) => setCurrentInvoice({
                  ...currentInvoice, 
                  client: {...currentInvoice.client, address: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={currentInvoice.client.city}
                onChange={(e) => setCurrentInvoice({
                  ...currentInvoice, 
                  client: {...currentInvoice.client, city: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={currentInvoice.client.postalCode}
                onChange={(e) => setCurrentInvoice({
                  ...currentInvoice, 
                  client: {...currentInvoice.client, postalCode: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={currentInvoice.client.country}
                onChange={(e) => setCurrentInvoice({
                  ...currentInvoice, 
                  client: {...currentInvoice.client, country: e.target.value}
                })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        {/* Line Items */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Line Items</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
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
                {currentInvoice.items.map((item, index) => (
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
                        className="text-red-600 hover:text-red-800"
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
            className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Line Item
          </button>
          
          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>£{currentInvoice.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Tax Rate:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentInvoice.taxRate}
                    onChange={(e) => {
                      const taxRate = parseFloat(e.target.value) || 0;
                      const taxAmount = currentInvoice.subtotal * (taxRate / 100);
                      setCurrentInvoice({
                        ...currentInvoice,
                        taxRate,
                        taxAmount,
                        total: currentInvoice.subtotal + taxAmount
                      });
                    }}
                    className="w-16 p-1 border border-gray-300 rounded text-right"
                  />
                  <span className="ml-1">%</span>
                </div>
                <span>£{currentInvoice.taxAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
                <span>Total:</span>
                <span>£{currentInvoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={currentInvoice.notes}
            onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
          ></textarea>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={saveInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Update Invoice' : 'Save Invoice'}
          </button>
          
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Generate PDF
          </button>
          
          {isEditing && (
            <button
              onClick={resetInvoiceForm}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>
      
      {/* Invoice List */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Invoice History</h3>
        
        {invoices.length === 0 ? (
          <p className="text-gray-500">No invoices yet. Create your first invoice above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Invoice #</th>
                  <th className="p-2 text-left">Client</th>
                  <th className="p-2 text-left">Issue Date</th>
                  <th className="p-2 text-left">Due Date</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="p-2">{invoice.invoiceNumber}</td>
                    <td className="p-2">{invoice.client.name}</td>
                    <td className="p-2">{invoice.issueDate}</td>
                    <td className="p-2">{invoice.dueDate}</td>
                    <td className="p-2 text-right">£{invoice.total.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => editInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => {
                            setCurrentInvoice(invoice);
                            generatePDF();
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Download PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}