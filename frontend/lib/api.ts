import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTrips = () => api.get('trips/');
export const getTripById = (id: string) => api.get(`trips/${id}/`);
export const getQuotes = () => api.get('quotes/');
export const getQuoteVariants = () => api.get('quote-variants/');

export default api;
