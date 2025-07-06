import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

export default function InvoiceList({ onSelectInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Format currency with thousand separators
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/invoicing?action=getInvoices&siteId=${siteId}`);
        
        if (response.ok) {
          const { invoices } = await response.json();
          // Ensure all invoices have a status (for backward compatibility)
          const updatedInvoices = (invoices || []).map(invoice => ({
            ...invoice,
            status: invoice.status || 'unpaid'
          }));
          setInvoices(updatedInvoices);
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

  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      const siteId = window.location.hostname.split('.')[0];
      const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoiceToUpdate) return;
      
      const updatedInvoice = {
        ...invoiceToUpdate,
        status: newStatus,
        paidDate: newStatus === 'paid' ? format(new Date(), 'yyyy-MM-dd') : null
      };
      
      const response = await fetch('/api/invoicing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveInvoice',
          siteId,
          invoice: updatedInvoice
        })
      });
      
      if (response.ok) {
        // Update local state
        setInvoices(invoices.map(inv => 
          inv.id === invoiceId ? updatedInvoice : inv
        ));
        
        toast.success(`Invoice marked as ${newStatus}`);
      } else {
        toast.error('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    }
  };
  
  // Filter invoices based on search term, status and date
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      invoice.client?.name?.toLowerCase().includes(searchLower) ||
      invoice.client?.email?.toLowerCase().includes(searchLower)
    );
    
    // Status filtering
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    
    if (dateFilter === 'overdue') {
      matchesDate = isBefore(dueDate, today) && invoice.status !== 'paid';
    } else if (dateFilter === 'due-this-week') {
      const oneWeekFromNow = addDays(today, 7);
      matchesDate = isBefore(dueDate, oneWeekFromNow) && 
                    !isBefore(dueDate, today) && 
                    invoice.status !== 'paid';
    } else if (dateFilter === 'paid-last-30') {
      const thirtyDaysAgo = addDays(today, -30);
      matchesDate = invoice.status === 'paid' && 
                    (invoice.paidDate && isAfter(new Date(invoice.paidDate), thirtyDaysAgo));
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let valueA, valueB;
    
    if (sortBy === 'dueDate' || sortBy === 'issueDate' || sortBy === 'paidDate') {
      valueA = new Date(a[sortBy] || '2099-12-31');
      valueB = new Date(b[sortBy] || '2099-12-31');
    } else if (sortBy === 'total') {
      valueA = a.total || 0;
      valueB = b.total || 0;
    } else {
      valueA = a.invoiceNumber || '';
      valueB = b.invoiceNumber || '';
    }
    
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partially-paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Check if invoice is overdue
  const isInvoiceOverdue = (invoice) => {
    if (invoice.status === 'paid') return false;
    return isBefore(new Date(invoice.dueDate), new Date());
  };

  // Calculate summary data for the dashboard
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const overdueTotal = invoices
    .filter(inv => inv.status !== 'paid' && isBefore(new Date(inv.dueDate), new Date()))
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const overdueCount = invoices
    .filter(inv => inv.status !== 'paid' && isBefore(new Date(inv.dueDate), new Date())).length;
  
  const dueThisWeekTotal = invoices
    .filter(inv => {
      if (inv.status === 'paid') return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      const nextWeek = addDays(today, 7);
      return isAfter(dueDate, today) && isBefore(dueDate, nextWeek);
    })
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const paidLast30DaysTotal = invoices
    .filter(inv => {
      if (inv.status !== 'paid') return false;
      const paidDate = inv.paidDate ? new Date(inv.paidDate) : null;
      if (!paidDate) return false;
      const thirtyDaysAgo = addDays(new Date(), -30);
      return isAfter(paidDate, thirtyDaysAgo);
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.status-dropdown-container')) {
        // Close all dropdowns when clicking outside
        setInvoices(prev => prev.map(inv => ({
          ...inv,
          showDropdown: false
        })));
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <h2 className="text-xl font-semibold mb-6">Invoice Management</h2>
        
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Outstanding</div>
            <div className="mt-1 text-2xl font-semibold">
              {formatCurrency(totalOutstanding)}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Overdue</div>
            <div className="mt-1 text-2xl font-semibold text-red-600">
              {formatCurrency(overdueTotal)}
            </div>
            <div className="text-sm text-gray-500">
              {overdueCount} invoice{overdueCount !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Due This Week</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">
              {formatCurrency(dueThisWeekTotal)}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Paid (Last 30 Days)</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">
              {formatCurrency(paidLast30DaysTotal)}
            </div>
          </div>
        </div>
        
        {/* Filtering and Sorting Controls - Improved alignment */}
        <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by number, client name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partially-paid">Partially Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            {/* Time Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="all">All Time</option>
                <option value="overdue">Overdue</option>
                <option value="due-this-week">Due This Week</option>
                <option value="paid-last-30">Paid in Last 30 Days</option>
              </select>
            </div>
          </div>
          
          {/* Sorting */}
          <div className="flex items-center border-t border-gray-200 pt-3">
            <span className="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mr-2 p-1.5 border border-gray-300 rounded"
            >
              <option value="dueDate">Due Date</option>
              <option value="issueDate">Issue Date</option>
              <option value="invoiceNumber">Invoice Number</option>
              <option value="total">Amount</option>
              <option value="paidDate">Date Paid</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-100 flex items-center"
              title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {sortOrder === 'asc' ? (
                <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Invoice Table */}
        {invoices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first invoice.</p>
          </div>
        ) : sortedInvoices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matching invoices</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Amount</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInvoices.map((invoice) => {
                  // Determine if overdue
                  const displayStatus = isInvoiceOverdue(invoice) && invoice.status === 'unpaid' 
                    ? 'overdue' 
                    : invoice.status;
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{invoice.client.name}</div>
                        {invoice.client.email && (
                          <div className="text-xs text-gray-500">{invoice.client.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">Issue: {invoice.issueDate}</div>
                        <div className="text-xs text-gray-500">Due: {invoice.dueDate}</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap hidden md:table-cell text-sm text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(displayStatus)}`}>
                          {displayStatus === 'overdue' ? 'Overdue' : 
                           displayStatus === 'paid' ? 'Paid' : 
                           displayStatus === 'partially-paid' ? 'Partially Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onSelectInvoice(invoice)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            View
                          </button>
                          
                          <div className="relative">
                            <button 
                              onClick={() => {
                                // Toggle the dropdown for this specific invoice
                                setInvoices(invoices.map(inv => ({
                                  ...inv,
                                  showDropdown: inv.id === invoice.id ? !inv.showDropdown : false
                                })))
                              }}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                            >
                              Status
                              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            {invoice.showDropdown && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                                <div className="py-1">
                                  <button 
                                    onClick={() => {
                                      updateInvoiceStatus(invoice.id, 'paid');
                                      // Close dropdown after selection
                                      setInvoices(invoices.map(inv => ({
                                        ...inv,
                                        showDropdown: false
                                      })))
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Mark as Paid
                                  </button>
                                  <button 
                                    onClick={() => {
                                      updateInvoiceStatus(invoice.id, 'partially-paid');
                                      // Close dropdown after selection
                                      setInvoices(invoices.map(inv => ({
                                        ...inv,
                                        showDropdown: false
                                      })))
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Mark as Partially Paid
                                  </button>
                                  <button 
                                    onClick={() => {
                                      updateInvoiceStatus(invoice.id, 'unpaid');
                                      // Close dropdown after selection
                                      setInvoices(invoices.map(inv => ({
                                        ...inv,
                                        showDropdown: false
                                      })))
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Mark as Unpaid
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}