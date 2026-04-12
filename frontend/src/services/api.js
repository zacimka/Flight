import axios from 'axios';

/** Backend mounts all routes under `/api` (see backend/app.js). Accept env as origin-only or full API root. */
export function resolveApiBaseURL() {
  // If an explicit env variable is given (set in Render Dashboard), use it
  const env = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (env && env !== 'undefined' && env !== 'null') {
    return env.endsWith('/api') ? env : `${env}/api`;
  }

  // Relative path works for both Proxy (Dev) and Same-Domain serving (Production)
  return '/api';
}

const API = axios.create({ baseURL: resolveApiBaseURL(), timeout: 30000 });

export const register = (payload) => API.post('/auth/register', payload);
export const login = (payload) => API.post('/auth/login', payload);
export const searchFlights = (payload) => API.post('/duffel/search-flights', payload);
export const searchAirports = (q) => API.get('/duffel/airports', { params: { q } });
export const createPaymentIntent = (payload) => API.post('/payments/create', payload);
export const createBooking = (payload, token) => API.post('/bookings', payload, { headers: { Authorization: `Bearer ${token}` } });
export const confirmBookingPayment = (payload, token) => API.post('/bookings/confirm-payment', payload, { headers: { Authorization: `Bearer ${token}` } });
export const getBookings = (token) => API.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
export const getAllBookingsAdmin = (token) => API.get('/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
export const updateBookingStatus = (id, payload, token) => API.patch(`/admin/bookings/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
export const getRevenue = (token) => API.get('/admin/revenue', { headers: { Authorization: `Bearer ${token}` } });
export const setMarkup = (payload, token) => API.post('/admin/markup', payload, { headers: { Authorization: `Bearer ${token}` } });
export const refundBooking = (bookingId, token) => API.post(`/admin/bookings/${bookingId}/refund`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const getAdminStats = (token) => API.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
export const submitContactMessage = (payload) => API.post('/contact', payload);

// ── Duffel endpoints ──────────────────────────────────────────────────────
export const duffelSearchFlights = (payload) => API.post('/duffel/search-flights', payload);
export const getDuffelPriceCheck = (payload) => API.post('/duffel/price-check', payload);
export const getDuffelOffer = (id) => API.get(`/duffel/offer/${id}`);
export const getDuffelClientKey = () => API.get('/duffel/client-key');
export const createDuffelBooking = (payload, token) =>
  API.post('/duffel/create-booking', payload, { headers: { Authorization: `Bearer ${token}` } });
export const createDuffelPaymentIntent = (payload, token) =>
  API.post('/duffel/create-payment-intent', payload, { headers: { Authorization: `Bearer ${token}` } });
export const confirmDuffelBooking = (payload, token) =>
  API.post('/duffel/confirm-booking', payload, { headers: { Authorization: `Bearer ${token}` } });

// Orders & post-booking
export const getDuffelOrder = (orderId, token) =>
  API.get(`/duffel/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
export const getOrderServices = (orderId, token) =>
  API.get(`/duffel/orders/${orderId}/services`, { headers: { Authorization: `Bearer ${token}` } });
export const addOrderServices = (orderId, payload, token) =>
  API.post(`/duffel/orders/${orderId}/services`, payload, { headers: { Authorization: `Bearer ${token}` } });

// Cancellation
export const createCancellationQuote = (payload, token) =>
  API.post('/duffel/cancellation-quote', payload, { headers: { Authorization: `Bearer ${token}` } });
export const confirmCancellation = (cancellationId, token) =>
  API.post(`/duffel/cancellations/${cancellationId}/confirm`, {}, { headers: { Authorization: `Bearer ${token}` } });

// Function to fetch PDF as blob
export const getBookingPDF = (id, token) => API.get(`/bookings/${id}/pdf`, {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob'
});
