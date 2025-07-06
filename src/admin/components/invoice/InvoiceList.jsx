import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function InvoiceList({ onSelectInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/invoicing?action=getInvoices&siteId=${siteId}`);
        
        if (response.ok) {
          const { invoices } = await response.json();
          setInvoices(invoices || []);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      invoice.client?.name?.toLowerCase().includes(searchLower) ||
      invoice.client?.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search invoices by number, client name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        {invoices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No invoices yet. Create your first invoice to see it here.</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No invoices match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Invoice #</th>
                  <th className="p-2 text-left">Client</th>
                  <th className="p-2 text-left hidden sm:table-cell">Date</th>
                  <th className="p-2 text-right hidden md:table-cell">Amount</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="p-2 font-medium">{invoice.invoiceNumber}</td>
                    <td className="p-2">
                      <div>{invoice.client.name}</div>
                      <div className="text-xs text-gray-500">{invoice.client.email}</div>
                    </td>
                    <td className="p-2 hidden sm:table-cell">
                      <div>{invoice.issueDate}</div>
                      <div className="text-xs text-gray-500">Due: {invoice.dueDate}</div>
                    </td>
                    <td className="p-2 text-right hidden md:table-cell">£{invoice.total.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => onSelectInvoice(invoice)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View
                      </button>
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