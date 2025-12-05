// API Communication Module
const API_BASE_URL = '/api';

const api = {
  // Generic fetch wrapper
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw { 
          status: response.status, 
          message: data.message || 'Error en la solicitud',
          errors: data.errors || []
        };
      }
      
      return data;
    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw { 
        status: 500, 
        message: 'Error de conexión con el servidor' 
      };
    }
  },

  // Patient endpoints
  patients: {
    async register(patientData) {
      return api.request('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData)
      });
    },

    async getAll() {
      return api.request('/patients');
    },

    async getById(id) {
      return api.request(`/patients/${id}`);
    }
  },

  // Doctor endpoints
  doctors: {
    async getAll() {
      return api.request('/doctors');
    },

    async getById(id) {
      return api.request(`/doctors/${id}`);
    }
  },

  // Appointment endpoints
  appointments: {
    async create(appointmentData) {
      return api.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
    },

    async getAll() {
      return api.request('/appointments');
    },

    async getById(id) {
      return api.request(`/appointments/${id}`);
    },

    async getAvailable(doctorId, date) {
      return api.request(`/appointments/available?doctorId=${doctorId}&date=${date}`);
    },

    async cancel(id) {
      return api.request(`/appointments/${id}`, {
        method: 'DELETE'
      });
    }
  }
};

// Export for use in other modules
window.api = api;