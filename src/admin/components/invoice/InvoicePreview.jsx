import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';

export default function InvoicePreview({ invoice, onBack }) {
  const [companyInfo, setCompanyInfo] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/invoicing?action=getCompanyInfo&siteId=${siteId}`);
        
        if (response.ok) {
          const data = await response.json();
          setCompanyInfo(data.companyInfo || {});
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
        toast.error('Failed to load company information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyInfo();
  }, []);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add company info
      doc.setFontSize(20);
      doc.text('INVOICE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(companyInfo.name || '', 15, 40);
      doc.text(companyInfo.address || '', 15, 45);
      doc.text(`${companyInfo.city || ''}, ${companyInfo.postalCode || ''}`, 15, 50);
      doc.text(companyInfo.country || '', 15, 55);
      doc.text(`Phone: ${companyInfo.phone || ''}`, 15, 60);
      doc.text(`Email: ${companyInfo.email || ''}`, 15, 65);
      
      if (companyInfo.registrationNumber) {
        doc.text(`Reg No: ${companyInfo.registrationNumber}`, 15, 70);
      }
      
      if (companyInfo.taxId) {
        doc.text(`VAT/Tax ID: ${companyInfo.taxId}`, 15, 75);
      }
      
      // Add invoice details
      doc.text('Invoice To:', 140, 40);
      doc.text(invoice.client.name, 140, 45);
      doc.text(invoice.client.address || '', 140, 50);
      doc.text(`${invoice.client.city || ''}, ${invoice.client.postalCode || ''}`, 140, 55);
      doc.text(invoice.client.country || '', 140, 60);
      doc.text(`Email: ${invoice.client.email || ''}`, 140, 65);
      
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 15, 85);
      doc.text(`Issue Date: ${invoice.issueDate}`, 15, 90);
      doc.text(`Due Date: ${invoice.dueDate}`, 15, 95);
      
      // Add line items
      const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
      const tableRows = [];
      
      invoice.items.forEach(item => {
        const itemData = [
          item.description,
          item.quantity,
          `£${item.rate.toFixed(2)}`,
          `£${item.amount.toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
      
      doc.autoTable({
        startY: 105,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Add totals
      const finalY = doc.autoTable.previous.finalY || 150;
      doc.text(`Subtotal: £${invoice.subtotal.toFixed(2)}`, 140, finalY + 10);
      doc.text(`VAT (${invoice.taxRate}%): £${invoice.taxAmount.toFixed(2)}`, 140, finalY + 15);
      doc.text(`Total: £${invoice.total.toFixed(2)}`, 140, finalY + 20);
      
      // Add notes
      if (invoice.notes) {
        doc.text('Notes:', 15, finalY + 30);
        doc.text(invoice.notes, 15, finalY + 35);
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
      doc.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with actions */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Invoice Preview</h2>
        
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Editor
          </button>
          
          <button
            onClick={generatePDF}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download PDF
          </button>
        </div>
      </div>
      
      {/* Preview content */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Invoice header */}
        <div className="flex flex-col md:flex-row md:justify-between mb-10">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">INVOICE</h2>
            <p className="text-gray-600">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-gray-800 mb-1"><span className="font-semibold">Issue Date:</span> {invoice.issueDate}</div>
            <div className="text-gray-800"><span className="font-semibold">Due Date:</span> {invoice.dueDate}</div>
          </div>
        </div>
        
        {/* Company and client info */}
        <div className="flex flex-col md:flex-row justify-between mb-10">
          <div className="mb-6 md:mb-0">
            <h3 className="text-gray-800 font-semibold mb-2">From:</h3>
            <div className="text-gray-600">{companyInfo.name}</div>
            <div className="text-gray-600">{companyInfo.address}</div>
            <div className="text-gray-600">{companyInfo.city}, {companyInfo.postalCode}</div>
            <div className="text-gray-600">{companyInfo.country}</div>
            <div className="text-gray-600 mt-2">{companyInfo.email}</div>
            <div className="text-gray-600">{companyInfo.phone}</div>
            {companyInfo.taxId && (
              <div className="text-gray-600 mt-2">VAT/Tax ID: {companyInfo.taxId}</div>
            )}
          </div>
          <div className="mb-6 md:mb-0">
            <h3 className="text-gray-800 font-semibold mb-2">To:</h3>
            <div className="text-gray-600">{invoice.client.name}</div>
            {invoice.client.address && <div className="text-gray-600">{invoice.client.address}</div>}
            {(invoice.client.city || invoice.client.postalCode) && (
              <div className="text-gray-600">{invoice.client.city}, {invoice.client.postalCode}</div>
            )}
            {invoice.client.country && <div className="text-gray-600">{invoice.client.country}</div>}
            {invoice.client.email && <div className="text-gray-600 mt-2">{invoice.client.email}</div>}
          </div>
        </div>
        
        {/* Invoice items */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">£{item.rate.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">£{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right font-semibold">Subtotal</td>
                <td className="px-4 py-3 text-right">£{invoice.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right font-semibold">VAT ({invoice.taxRate}%)</td>
                <td className="px-4 py-3 text-right">£{invoice.taxAmount.toFixed(2)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan="3" className="px-4 py-3 text-right">Total</td>
                <td className="px-4 py-3 text-right">£{invoice.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="text-gray-800 font-semibold mb-2">Notes:</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        
        {/* Payment info */}
        {(companyInfo.bankName || companyInfo.accountNumber) && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-gray-800 font-semibold mb-2">Payment Information:</h3>
            {companyInfo.bankName && <div className="text-gray-600">Bank: {companyInfo.bankName}</div>}
            {companyInfo.accountNumber && <div className="text-gray-600">Account Number: {companyInfo.accountNumber}</div>}
            {companyInfo.sortCode && <div className="text-gray-600">Sort Code: {companyInfo.sortCode}</div>}
            {companyInfo.iban && <div className="text-gray-600">IBAN: {companyInfo.iban}</div>}
          </div>
        )}
      </div>
    </div>
  );
}