import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import { format, isBefore } from 'date-fns';

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

  // Format currency with thousand separators
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: `Invoice ${invoice.invoiceNumber}`,
        subject: `Invoice for ${invoice.client.name}`,
        creator: companyInfo.name || 'Invoice System'
      });
      
      // Add company info - positioned at the top left
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('FROM:', 15, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(companyInfo.name || '', 15, 26);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(companyInfo.address || '', 15, 31);
      doc.text(`${companyInfo.city || ''}, ${companyInfo.postalCode || ''}`, 15, 36);
      doc.text(companyInfo.country || '', 15, 41);
      doc.text(`Phone: ${companyInfo.phone || ''}`, 15, 46);
      doc.text(`Email: ${companyInfo.email || ''}`, 15, 51);
      
      if (companyInfo.registrationNumber) {
        doc.text(`Reg No: ${companyInfo.registrationNumber}`, 15, 56);
      }
      
      if (companyInfo.taxId) {
        doc.text(`VAT/Tax ID: ${companyInfo.taxId}`, 15, 61);
      }
      
      // Add client info - positioned at the top right
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('BILL TO:', 140, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(invoice.client.name, 140, 26);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(invoice.client.address || '', 140, 31);
      doc.text(`${invoice.client.city || ''}, ${invoice.client.postalCode || ''}`, 140, 36);
      doc.text(invoice.client.country || '', 140, 41);
      doc.text(`Email: ${invoice.client.email || ''}`, 140, 46);
      
      // Add invoice header - large and centered
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, 'bold');
      doc.text('INVOICE', 105, 75, { align: 'center' });
      
      // Add invoice details below the header
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const yPos = 85;
      doc.text('INVOICE NUMBER:', 70, yPos);
      doc.text('ISSUE DATE:', 70, yPos + 6);
      doc.text('DUE DATE:', 70, yPos + 12);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(invoice.invoiceNumber, 140, yPos);
      doc.text(invoice.issueDate, 140, yPos + 6);
      doc.text(invoice.dueDate, 140, yPos + 12);
      doc.setFont(undefined, 'normal');
      
      // Add line items with improved styling
      const tableColumn = ["Item Description", "Quantity", "Rate", "Amount"];
      const tableRows = [];
      
      invoice.items.forEach(item => {
        const itemData = [
          item.description,
          item.quantity,
          formatCurrency(item.rate),
          formatCurrency(item.amount)
        ];
        tableRows.push(itemData);
      });
      
      // Add some space before the table
      const startY = 105;
      
      autoTable(doc, {
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [60, 60, 60], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left' 
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right', cellWidth: 35 },
          3: { halign: 'right', cellWidth: 35 }
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
      
      // Get the final Y position after the table is rendered
      const finalY = doc.lastAutoTable.finalY;
      
      // Add totals section with professional styling
      const totalsX = 130;
      let currentY = finalY + 10;
      
      // Add subtotal
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Subtotal:', totalsX, currentY);
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(invoice.subtotal), 195, currentY, { align: 'right' });
      
      // Add tax
      currentY += 6;
      doc.setTextColor(80, 80, 80);
      doc.text(`VAT (${invoice.taxRate}%):`, totalsX, currentY);
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(invoice.taxAmount), 195, currentY, { align: 'right' });
      
      // Add total
      currentY += 8;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Total:', totalsX, currentY);
      doc.text(formatCurrency(invoice.total), 195, currentY, { align: 'right' });
      
      // Add notes
      if (invoice.notes) {
        currentY += 20;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('Notes:', 15, currentY);
        doc.setFont(undefined, 'normal');
        
        // Split notes into multiple lines if needed
        const splitNotes = doc.splitTextToSize(invoice.notes, 180);
        doc.text(splitNotes, 15, currentY + 6);
        currentY += 6 + (splitNotes.length * 5);
      }
      
      // Add payment information
      if (companyInfo.bankName || companyInfo.accountNumber) {
        currentY += 15;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('Payment Information:', 15, currentY);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        currentY += 6;
        if (companyInfo.bankName) {
          doc.text(`Bank: ${companyInfo.bankName}`, 15, currentY);
          currentY += 5;
        }
        
        if (companyInfo.accountNumber) {
          doc.text(`Account Number: ${companyInfo.accountNumber}`, 15, currentY);
          currentY += 5;
        }
        
        if (companyInfo.sortCode) {
          doc.text(`Sort Code: ${companyInfo.sortCode}`, 15, currentY);
          currentY += 5;
        }
        
        if (companyInfo.iban) {
          doc.text(`IBAN: ${companyInfo.iban}`, 15, currentY);
        }
      }
      
      // Add a footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy')} | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }
      
      // Save the PDF with invoice number in filename
      doc.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Render the web preview with the improved design
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
      
      {/* Preview content with improved styling */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Invoice header with professional styling */}
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide text-gray-800">INVOICE</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* From section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">From:</h3>
            <div className="text-gray-800 font-semibold text-lg mb-1">{companyInfo.name}</div>
            <div className="text-gray-600">{companyInfo.address}</div>
            <div className="text-gray-600">{companyInfo.city}, {companyInfo.postalCode}</div>
            <div className="text-gray-600">{companyInfo.country}</div>
            <div className="text-gray-600 mt-2">{companyInfo.phone}</div>
            <div className="text-gray-600">{companyInfo.email}</div>
            {companyInfo.taxId && (
              <div className="text-gray-600 mt-2">VAT/Tax ID: {companyInfo.taxId}</div>
            )}
          </div>
          
          {/* Bill to section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill to:</h3>
            <div className="text-gray-800 font-semibold text-lg mb-1">{invoice.client.name}</div>
            {invoice.client.address && <div className="text-gray-600">{invoice.client.address}</div>}
            {(invoice.client.city || invoice.client.postalCode) && (
              <div className="text-gray-600">{invoice.client.city}, {invoice.client.postalCode}</div>
            )}
            {invoice.client.country && <div className="text-gray-600">{invoice.client.country}</div>}
            {invoice.client.email && <div className="text-gray-600 mt-2">{invoice.client.email}</div>}
          </div>
        </div>
        
        {/* Invoice details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8 flex flex-wrap justify-between">
          <div className="mb-3 md:mb-0">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Number</div>
            <div className="text-gray-800 font-semibold">{invoice.invoiceNumber}</div>
          </div>
          <div className="mb-3 md:mb-0">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Issue Date</div>
            <div className="text-gray-800">{invoice.issueDate}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</div>
            <div className="text-gray-800">{invoice.dueDate}</div>
          </div>
          
          {/* Status Badge */}
          {invoice.status && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</div>
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                invoice.status === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : invoice.status === 'partially-paid'
                  ? 'bg-blue-100 text-blue-800'
                  : isBefore(new Date(), new Date(invoice.dueDate))
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {invoice.status === 'paid' ? 'Paid' : 
                 invoice.status === 'partially-paid' ? 'Partially Paid' : 
                 isBefore(new Date(), new Date(invoice.dueDate)) ? 'Unpaid' : 'Overdue'}
                {invoice.paidDate && invoice.status === 'paid' && 
                  <span className="ml-2 text-xs">on {invoice.paidDate}</span>}
              </span>
            </div>
          )}
        </div>
        
        {/* Invoice items with better styling */}
        <div className="mb-8 overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="text-sm text-gray-900">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">{formatCurrency(item.rate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals with better styling */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-3">
            <div className="flex justify-between border-b pb-3">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm text-gray-900 font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-sm text-gray-600">VAT ({invoice.taxRate}%):</span>
              <span className="text-sm text-gray-900 font-medium">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-base text-gray-800 font-semibold">Total:</span>
              <span className="text-base text-gray-900 font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
            <p className="text-gray-600 whitespace-pre-wrap text-sm">{invoice.notes}</p>
          </div>
        )}
        
        {/* Payment info */}
        {(companyInfo.bankName || companyInfo.accountNumber) && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Information:</h3>
            {companyInfo.bankName && <div className="text-gray-600 text-sm">Bank: {companyInfo.bankName}</div>}
            {companyInfo.accountNumber && <div className="text-gray-600 text-sm">Account Number: {companyInfo.accountNumber}</div>}
            {companyInfo.sortCode && <div className="text-gray-600 text-sm">Sort Code: {companyInfo.sortCode}</div>}
            {companyInfo.iban && <div className="text-gray-600 text-sm">IBAN: {companyInfo.iban}</div>}
          </div>
        )}
      </div>
    </div>
  );
}