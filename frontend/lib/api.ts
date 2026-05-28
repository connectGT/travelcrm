import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TripSearchParams {
  status?: string;
  [key: string]: unknown;
}

export const getTrips = (params?: TripSearchParams) => api.get('trips/', { params });
export const getTripById = (id: string | number) => api.get(`trips/${id}/`);
export const getTrip = (id: number) => api.get(`trips/${id}/`);
export const getQuotes = () => api.get('quotes/');
export const getQuote = (quoteId: number) => api.get(`quotes/${quoteId}/`);
export const updateQuote = (quoteId: number, data: Record<string, unknown>) => api.patch(`quotes/${quoteId}/`, data);
export const getQuoteVariants = () => api.get('quote-variants/');
export const getSuggestedQuotes = (tripId: number) => api.get(`trips/${tripId}/suggested-quotes/`);
export const cloneQuote = (tripId: number, quoteId: number) => api.post(`trips/${tripId}/clone-quote/${quoteId}/`);


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

export interface RawLeadSearchParams {
  status?: string;
  [key: string]: unknown;
}

export const getRawLeads = (params?: RawLeadSearchParams) => api.get('raw-leads/', { params });
export const markLeadSeen = (leadId: number) => api.patch(`raw-leads/${leadId}/mark_seen/`, {});


export interface LeadConversionData {
  query_source?: string;
  reference_id?: string;
  sales_team_id?: number;
  tags?: number[];
  destinations?: string;
  start_date?: string | null;
  nights?: number;
  adults?: number;
  children_ages?: string;
  foc?: number;
  salutation?: string;
  guest_name?: string;
  guest_phone?: string;
  notes?: string;
}

export const convertLead = (leadId: number, data: LeadConversionData) =>
  api.post(`raw-leads/${leadId}/convert/`, data);

export default api;
