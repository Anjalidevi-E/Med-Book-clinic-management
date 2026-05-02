import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// ── Patients ──────────────────────────────────────────────────────────────────
export const getPatients = (params) => API.get('/patients', { params });
export const getPatient = (id) => API.get(`/patients/${id}`);
export const createPatient = (data) => API.post('/patients', data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// ── Appointments ──────────────────────────────────────────────────────────────
export const getAppointments = (params) => API.get('/appointments', { params });
export const getAppointment = (id) => API.get(`/appointments/${id}`);
export const getAppointmentsByPatient = (patientId) => API.get(`/appointments/patient/${patientId}`);
export const createAppointment = (data) => API.post('/appointments', data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const cancelAppointment = (id) => API.patch(`/appointments/${id}/cancel`);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);
export const getDashboardStats = () => API.get('/appointments/stats/dashboard');

export default API;
