import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function AppointmentsSection() {
  const [step, setStep] = useState(1); // 1: date, 2: time, 3: details, 4: confirmation
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Extract site ID
  const siteId = window.location.hostname.split('.')[0];
  
  // Month view state
  const [viewMonth, setViewMonth] = useState(() => {
    const current = new Date();
    return { year: current.getFullYear(), month: current.getMonth() + 1 };
  });
  
  // Service types state
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  // Fetch available dates for the current month
  useEffect(() => {
    const fetchAvailableDates = async (year, month) => {
      try {
        const response = await fetch(`/api/appointments?action=availability&siteId=${siteId}&year=${year}&month=${month}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableDates(data.availableDates);
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
        setError('Failed to load available dates');
      }
    };
    
    fetchAvailableDates(viewMonth.year, viewMonth.month);
  }, [viewMonth]);
  
  // Fetch available times when a date is selected
useEffect(() => {
  if (!selectedDate) return;
  
  const fetchAvailableTimes = async () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const response = await fetch(`/api/appointments?action=availability&siteId=${siteId}&date=${formattedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTimes(data.availableSlots);
        
        // Handle durations from API
        if (data.durations && data.durations.length > 0) {
          setSelectedDuration(data.durations[0].value);
        }
        
        // Handle service types from API
        if (data.serviceTypes && data.serviceTypes.length > 0) {
          setServiceTypes(data.serviceTypes);
          setSelectedService(data.serviceTypes[0].id);
        } else {
          // Default if none are returned
          setServiceTypes([{ id: 'general', name: 'General Appointment', enabled: true }]);
          setSelectedService('general');
        }
      }
    } catch (error) {
      console.error('Error fetching available times:', error);
      setError('Failed to load available times');
    }
  };
  
  fetchAvailableTimes();
}, [selectedDate]);
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/appointments?action=book&siteId=${siteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          duration: selectedDuration,
          service: serviceTypes.find(s => s.id === selectedService)?.name || 'General Appointment',
          serviceId: selectedService,
          customer: formData
        })
      });
      
      if (response.ok) {
        setSuccess(true);
        setStep(4);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="appointments" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Book an Appointment</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8">
              {['Select Date', 'Select Time', 'Your Details', 'Confirmation'].map((label, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step > i + 1 ? 'bg-green-500 text-white' : 
                    step === i + 1 ? 'bg-blue-600 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm mt-1 ${
                    step >= i + 1 ? 'text-gray-800' : 'text-gray-400'
                  }`}>{label}</span>
                </div>
              ))}
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => {
                  const newMonth = viewMonth.month === 1 
                    ? { year: viewMonth.year - 1, month: 12 }
                    : { year: viewMonth.year, month: viewMonth.month - 1 };
                  setViewMonth(newMonth);
                }}
                className="p-2 border rounded"
              >
                ← Previous Month
              </button>
              
              <h3 className="text-lg font-medium">
                {new Date(viewMonth.year, viewMonth.month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h3>
              
              <button 
                onClick={() => {
                  const newMonth = viewMonth.month === 12 
                    ? { year: viewMonth.year + 1, month: 1 }
                    : { year: viewMonth.year, month: viewMonth.month + 1 };
                  setViewMonth(newMonth);
                }}
                className="p-2 border rounded"
              >
                Next Month →
              </button>
            </div>
            
            {/* Step 1: Date Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-medium">Select a Date</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableDates.map((date) => {
                    const dateObj = new Date(date);
                    return (
                      <button
                        key={date}
                        className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={() => handleDateSelect(dateObj)}
                      >
                        <div className="font-medium">{format(dateObj, 'EEE')}</div>
                        <div className="text-xl">{format(dateObj, 'd')}</div>
                        <div className="text-sm text-gray-500">{format(dateObj, 'MMM')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Step 2: Time Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Select a Time</h3>
                  <button 
                    className="text-blue-600 text-sm"
                    onClick={() => setStep(1)}
                  >
                    ← Change date
                  </button>
                </div>
                
                <p className="text-gray-600">
                  Available times for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableTimes.map((slot) => (
                    <button
                      key={slot.time}
                      className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => handleTimeSelect(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3: Customer Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Your Details</h3>
                  <button 
                    className="text-blue-600 text-sm"
                    onClick={() => setStep(2)}
                  >
                    ← Change time
                  </button>
                </div>
                
                <p className="text-gray-600">
                  Booking for {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes or Special Requests
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {serviceTypes.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors flex justify-center"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : 'Book Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Step 4: Confirmation */}
            {step === 4 && success && (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Appointment Request Submitted</h3>
                <div className="text-gray-600 mb-6 max-w-md mx-auto">
                  <p className="mb-3">
                    We've received your appointment request for {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}.
                  </p>
                  <p className="mb-3">
                    <strong>Please note:</strong> This is a request only. You'll receive a confirmation email when your appointment is approved.
                  </p>
                  <p>
                    A confirmation email has been sent to <span className="font-medium">{formData.email}</span>.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setSelectedDuration(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      notes: ''
                    });
                    setSuccess(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Book Another Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}