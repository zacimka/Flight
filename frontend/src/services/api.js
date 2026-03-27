import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const register = (payload) => API.post('/auth/register', payload);
export const login = (payload) => API.post('/auth/login', payload);
export const searchFlights = (payload) => API.post('/flights/search', payload);
export const searchAirports = (q) => API.get('/airports/search', { params: { q } });
export const createPaymentIntent = (payload) => API.post('/payments/create', payload);
export const createBooking = (payload, token) => API.post('/bookings', payload, { headers: { Authorization: `Bearer ${token}` } });
export const confirmBookingPayment = (payload, token) => API.post('/bookings/confirm-payment', payload, { headers: { Authorization: `Bearer ${token}` } });
export const getBookings = (token) => API.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
export const getAllBookingsAdmin = (token) => API.get('/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
export const updateBookingStatus = (id, payload, token) => API.patch(`/admin/bookings/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
export const getRevenue = (token) => API.get('/admin/revenue', { headers: { Authorization: `Bearer ${token}` } });
export const setMarkup = (payload, token) => API.post('/admin/markup', payload, { headers: { Authorization: `Bearer ${token}` } });
export const refundBooking = (bookingId, token) => API.post(`/admin/bookings/${bookingId}/refund`, {}, { headers: { Authorization: `Bearer ${token}` } });

// Function to fetch PDF as blob
export const getBookingPDF = (id, token) => API.get(`/bookings/${id}/pdf`, { 
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob' 
});
