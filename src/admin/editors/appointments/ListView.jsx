import React from 'react';
import { parseISO, addDays, format } from 'date-fns';

export default function ListView({
  appointments,
  isLoading,
  listTab = 'all', // Default to 'all' instead of 'pending'
  setListTab,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  onViewAppointment,
  onConfirmAppointment,
  onCancelAppointment
}) {
  // Filter appointments based on current filters
  const filteredAppointments = appointments.filter(appointment => {
    // First apply status filter
    if (listTab !== 'all' && appointment.status !== listTab) return false;
    
    // Then apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        appointment.customer?.name?.toLowerCase().includes(term) ||
        appointment.customer?.email?.toLowerCase().includes(term) ||
        appointment.service?.toLowerCase().includes(term) ||
        appointment.date?.includes(term) ||
        appointment.time?.includes(term) ||
        appointment.customer?.phone?.includes(term) ||
        appointment.customer?.notes?.toLowerCase().includes(term);
        
      if (!matchesSearch) return false;
    }
    
    // Then apply date filter
    const appointmentDate = parseISO(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'today':
        return format(appointmentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      case 'week': {
        const nextWeek = addDays(today, 7);
        return appointmentDate >= today && appointmentDate <= nextWeek;
      }
      case 'month': {
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        const apptMonth = appointmentDate.getMonth();
        const apptYear = appointmentDate.getFullYear();
        return apptMonth === thisMonth && apptYear === thisYear;
      }
      case 'custom': {
        const startDate = parseISO(customDateRange.start);
        const endDate = parseISO(customDateRange.end);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      }
      default:
        return true;
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-medium text-lg mb-4">Appointment List</h3>
      
      <div className="mb-6">
        {/* Scrollable tabs container */}
        <div className="relative border-b border-gray-200">
          <div className="overflow-x-auto pb-px no-scrollbar">
            <div className="flex whitespace-nowrap min-w-max">
              <button
                className={`py-2 px-4 ${listTab === 'pending' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('pending')}
              >
                Pending
                {appointments.filter(a => a.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                className={`py-2 px-4 ${listTab === 'confirmed' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={`py-2 px-4 ${listTab === 'cancelled' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('cancelled')}
              >
                Cancelled
              </button>
              <button
                className={`py-2 px-4 ${listTab === 'all' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setListTab('all')}
              >
                All Appointments
              </button>
            </div>
          </div>
          
          {/* Fade indicators for scroll */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        </div>
      </div>
      
      {/* Search input */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, service..."
          className="pl-10 pr-4 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md"
        />
      </div>
      
      {/* Date filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-700">Date Range:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 text-sm rounded ${dateFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            All Dates
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 text-sm rounded ${dateFilter === 'today' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 text-sm rounded ${dateFilter === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1 text-sm rounded ${dateFilter === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('custom')}
            className={`px-3 py-1 text-sm rounded ${dateFilter === 'custom' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
          >
            Custom Range
          </button>
        </div>
        
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">Try changing your search or filters.</p>
            </div>
          ) : (
            <>
              {/* Mobile List View */}
              <div className="lg:hidden">
                {filteredAppointments
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(appointment => (
                    <div key={appointment.id} className="bg-white shadow rounded-lg mb-4 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{appointment.customer.name}</h4>
                          <p className="text-sm text-gray-500">{appointment.customer.email}</p>
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <span className="text-xs text-gray-500 block">Date</span>
                            <span className="font-medium">{appointment.date}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Time</span>
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Service</span>
                            <span className="font-medium">{appointment.service || "General"}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Duration</span>
                            <span className="font-medium">{appointment.duration} mins</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                          <button 
                            onClick={() => onViewAppointment(appointment)} 
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded"
                          >
                            View
                          </button>
                          {appointment.status === 'pending' && (
                            <button 
                              onClick={() => onConfirmAppointment(appointment.id)} 
                              className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded"
                            >
                              Confirm
                            </button>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <button 
                              onClick={() => onCancelAppointment(appointment.id)} 
                              className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Desktop Table View - hide on mobile */}
              <div className="hidden lg:block overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map(appointment => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{appointment.customer.name}</div>
                            <div className="text-sm text-gray-500">{appointment.customer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.service || "General"}</div>
                            <div className="text-sm text-gray-500">{appointment.duration} mins</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.date}</div>
                            <div className="text-sm text-gray-500">{appointment.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => onViewAppointment(appointment)} 
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </button>
                            {appointment.status === 'pending' && (
                              <button 
                                onClick={() => onConfirmAppointment(appointment.id)} 
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                Confirm
                              </button>
                            )}
                            {appointment.status !== 'cancelled' && (
                              <button 
                                onClick={() => onCancelAppointment(appointment.id)} 
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

