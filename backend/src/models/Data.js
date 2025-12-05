// In-memory data store
const { v4: uuidv4 } = require('uuid');

// Data stores
const patients = [];
const appointments = [];

// Pre-loaded doctors
const doctors = [
  { id: '1', name: 'Dr. María García', specialty: 'Medicina General' },
  { id: '2', name: 'Dr. Carlos Rodríguez', specialty: 'Pediatría' },
  { id: '3', name: 'Dr. Ana Martínez', specialty: 'Cardiología' },
  { id: '4', name: 'Dr. Luis Hernández', specialty: 'Dermatología' }
];

// Available time slots
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

// Patient functions
const createPatient = (patientData) => {
  const patient = {
    id: uuidv4(),
    name: patientData.name,
    email: patientData.email.toLowerCase(),
    phone: patientData.phone,
    createdAt: new Date().toISOString()
  };
  patients.push(patient);
  return patient;
};

const getPatients = () => [...patients];

const getPatientById = (id) => patients.find(p => p.id === id);

const getPatientByEmail = (email) => patients.find(p => p.email === email.toLowerCase());

// Appointment functions
const createAppointment = (appointmentData) => {
  const appointment = {
    id: uuidv4(),
    patientId: appointmentData.patientId,
    doctorId: appointmentData.doctorId,
    date: appointmentData.date,
    time: appointmentData.time,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  appointments.push(appointment);
  return appointment;
};

const getAppointments = () => [...appointments].filter(a => a.status !== 'cancelled');

const getAppointmentById = (id) => appointments.find(a => a.id === id);

const getAppointmentsByPatient = (patientId) => 
  appointments.filter(a => a.patientId === patientId && a.status !== 'cancelled');

const getAppointmentsByDoctor = (doctorId) => 
  appointments.filter(a => a.doctorId === doctorId && a.status !== 'cancelled');

const cancelAppointment = (id) => {
  const appointment = appointments.find(a => a.id === id);
  if (appointment) {
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date().toISOString();
    return appointment;
  }
  return null;
};

const isSlotAvailable = (doctorId, date, time) => {
  return !appointments.some(
    a => a.doctorId === doctorId && 
         a.date === date && 
         a.time === time && 
         a.status !== 'cancelled'
  );
};

const getAvailableSlots = (doctorId, date) => {
  const bookedSlots = appointments
    .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
    .map(a => a.time);
  
  return timeSlots.filter(slot => !bookedSlots.includes(slot));
};

// Doctor functions
const getDoctors = () => [...doctors];

const getDoctorById = (id) => doctors.find(d => d.id === id);

// Reset function for testing
const resetData = () => {
  patients.length = 0;
  appointments.length = 0;
};

module.exports = {
  // Patient
  createPatient,
  getPatients,
  getPatientById,
  getPatientByEmail,
  // Appointment
  createAppointment,
  getAppointments,
  getAppointmentById,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  cancelAppointment,
  isSlotAvailable,
  getAvailableSlots,
  // Doctor
  getDoctors,
  getDoctorById,
  // Utils
  timeSlots,
  resetData
};