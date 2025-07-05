import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AppointmentsSection from '../components/AppointmentsSection';

export default function BookAppointment() {
  const [loading, setLoading] = useState(true);
  const [appointmentsEnabled, setAppointmentsEnabled] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/client-data?siteId=${siteId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.config?.showAppointments) {
            setAppointmentsEnabled(true);
          } else {
            // Redirect if appointments not enabled
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking appointment config:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [navigate]);
  
  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }
  
  if (!appointmentsEnabled) {
    return <div className="py-12 text-center">Appointment booking is not available.</div>;
  }

  return (
    <Layout>
      <div className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-3">Book Your Appointment</h1>
          <p className="text-lg text-center text-gray-600 mb-12">
            Schedule a time that works for you
          </p>
          
          <div className="max-w-4xl mx-auto">
            <AppointmentsSection standalone={true} />
          </div>
        </div>
      </div>
    </Layout>
  );
}