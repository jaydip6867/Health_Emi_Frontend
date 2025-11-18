export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healtheasy-o25g.onrender.com';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;
export const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'health-emi';
export const DEFAULT_PAGE_LIMIT = Number(process.env.REACT_APP_DEFAULT_PAGE_LIMIT) || 12;

export const STORAGE_KEYS = {
  PATIENT: process.env.REACT_APP_STORAGE_KEY_PATIENT || 'PatientLogin',
  DOCTOR: process.env.REACT_APP_STORAGE_KEY_DOCTOR || 'healthdoctor',
  AMBULANCE: process.env.REACT_APP_STORAGE_KEY_AMBULANCE || 'healthambulance',
};
