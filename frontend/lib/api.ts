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

// Tags API
export const getTags = () => api.get('tags/');
export const createTag = (data: { name: string; color: string }) => api.post('tags/', data);

// Trips Follow-ups and actions
export const saveFollowUp = (tripId: number, data: { tags: number[]; note: string; due_date: string }) => 
  api.post(`trips/${tripId}/followups/`, data);

export const assignAgent = (tripId: number, agentId: number) => 
  api.patch(`trips/${tripId}/assign/`, { agent_id: agentId });

export const archiveTrip = (tripId: number) => 
  api.patch(`trips/${tripId}/archive/`, {});

export const convertLead = (leadId: number, data: any) =>
  api.post(`leads/${leadId}/convert/`, data);

export default api;
