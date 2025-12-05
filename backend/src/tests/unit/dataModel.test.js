
const dataStore = require('../../models/data');

describe('Data Model - Unit Tests', () => {
  
  // Reset data before each test
  beforeEach(() => {
    dataStore.resetData();
  });

  describe('Patient Operations', () => {
    
    describe('createPatient', () => {
      test('should create patient with valid data', () => {
        const patientData = {
          name: 'Juan Pérez',
          email: 'juan@email.com',
          phone: '3001234567'
        };
        
        const patient = dataStore.createPatient(patientData);
        
        expect(patient).toHaveProperty('id');
        expect(patient.name).toBe('Juan Pérez');
        expect(patient.email).toBe('juan@email.com');
        expect(patient.phone).toBe('3001234567');
        expect(patient).toHaveProperty('createdAt');
      });

      test('should convert email to lowercase', () => {
        const patient = dataStore.createPatient({
          name: 'Test',
          email: 'TEST@EMAIL.COM',
          phone: '1234567'
        });
        
        expect(patient.email).toBe('test@email.com');
      });

      test('should generate unique IDs for each patient', () => {
        const patient1 = dataStore.createPatient({
          name: 'Patient 1',
          email: 'p1@email.com',
          phone: '1111111'
        });
        
        const patient2 = dataStore.createPatient({
          name: 'Patient 2',
          email: 'p2@email.com',
          phone: '2222222'
        });
        
        expect(patient1.id).not.toBe(patient2.id);
      });
    });

    describe('getPatients', () => {
      test('should return empty array when no patients', () => {
        const patients = dataStore.getPatients();
        expect(patients).toEqual([]);
      });

      test('should return all created patients', () => {
        dataStore.createPatient({ name: 'P1', email: 'p1@test.com', phone: '1111111' });
        dataStore.createPatient({ name: 'P2', email: 'p2@test.com', phone: '2222222' });
        
        const patients = dataStore.getPatients();
        expect(patients).toHaveLength(2);
      });
    });

    describe('getPatientById', () => {
      test('should return patient when exists', () => {
        const created = dataStore.createPatient({
          name: 'Test',
          email: 'test@email.com',
          phone: '1234567'
        });
        
        const found = dataStore.getPatientById(created.id);
        expect(found).toEqual(created);
      });

      test('should return undefined when not exists', () => {
        const found = dataStore.getPatientById('non-existent-id');
        expect(found).toBeUndefined();
      });
    });

    describe('getPatientByEmail', () => {
      test('should find patient by email (case insensitive)', () => {
        dataStore.createPatient({
          name: 'Test',
          email: 'test@email.com',
          phone: '1234567'
        });
        
        const found = dataStore.getPatientByEmail('TEST@EMAIL.COM');
        expect(found).toBeDefined();
        expect(found.name).toBe('Test');
      });

      test('should return undefined when email not found', () => {
        const found = dataStore.getPatientByEmail('notfound@email.com');
        expect(found).toBeUndefined();
      });
    });
  });

  describe('Doctor Operations', () => {
    
    describe('getDoctors', () => {
      test('should return pre-loaded doctors', () => {
        const doctors = dataStore.getDoctors();
        expect(doctors.length).toBeGreaterThan(0);
        expect(doctors[0]).toHaveProperty('id');
        expect(doctors[0]).toHaveProperty('name');
        expect(doctors[0]).toHaveProperty('specialty');
      });
    });

    describe('getDoctorById', () => {
      test('should return doctor when exists', () => {
        const doctors = dataStore.getDoctors();
        const found = dataStore.getDoctorById(doctors[0].id);
        expect(found).toBeDefined();
        expect(found.id).toBe(doctors[0].id);
      });

      test('should return undefined when not exists', () => {
        const found = dataStore.getDoctorById('non-existent');
        expect(found).toBeUndefined();
      });
    });
  });

  describe('Appointment Operations', () => {
    let patient;
    let doctor;

    beforeEach(() => {
      patient = dataStore.createPatient({
        name: 'Test Patient',
        email: 'patient@test.com',
        phone: '1234567890'
      });
      doctor = dataStore.getDoctors()[0];
    });

    describe('createAppointment', () => {
      test('should create appointment with valid data', () => {
        const appointmentData = {
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '09:00'
        };
        
        const appointment = dataStore.createAppointment(appointmentData);
        
        expect(appointment).toHaveProperty('id');
        expect(appointment.patientId).toBe(patient.id);
        expect(appointment.doctorId).toBe(doctor.id);
        expect(appointment.date).toBe('2025-12-20');
        expect(appointment.time).toBe('09:00');
        expect(appointment.status).toBe('scheduled');
      });
    });

    describe('getAppointments', () => {
      test('should return only non-cancelled appointments', () => {
        const apt1 = dataStore.createAppointment({
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '09:00'
        });
        
        dataStore.createAppointment({
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '10:00'
        });
        
        dataStore.cancelAppointment(apt1.id);
        
        const appointments = dataStore.getAppointments();
        expect(appointments).toHaveLength(1);
        expect(appointments[0].time).toBe('10:00');
      });
    });

    describe('cancelAppointment', () => {
      test('should mark appointment as cancelled', () => {
        const appointment = dataStore.createAppointment({
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '09:00'
        });
        
        const cancelled = dataStore.cancelAppointment(appointment.id);
        
        expect(cancelled.status).toBe('cancelled');
        expect(cancelled).toHaveProperty('cancelledAt');
      });

      test('should return null for non-existent appointment', () => {
        const result = dataStore.cancelAppointment('non-existent');
        expect(result).toBeNull();
      });
    });

    describe('isSlotAvailable', () => {
      test('should return true for available slot', () => {
        const available = dataStore.isSlotAvailable(doctor.id, '2025-12-20', '09:00');
        expect(available).toBe(true);
      });

      test('should return false for booked slot', () => {
        dataStore.createAppointment({
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '09:00'
        });
        
        const available = dataStore.isSlotAvailable(doctor.id, '2025-12-20', '09:00');
        expect(available).toBe(false);
      });

      test('should return true for cancelled slot', () => {
        const appointment = dataStore.createAppointment({
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '09:00'
        });
        
        dataStore.cancelAppointment(appointment.id);
        
        const available = dataStore.isSlotAvailable(doctor.id, '2025-12-20', '09:00');
        expect(available).toBe(true);
      });
    });

    describe('getAvailableSlots', () => {
      test('should return all slots when none booked', () => {
        const slots = dataStore.getAvailableSlots(doctor.id, '2025-12-20');
        expect(slots).toEqual(dataStore.timeSlots);
      });

      test('should exclude booked slots', () => {
        dataStore.createAppointment({
          patientId: patient.id,
          doctorId: doctor.id,
          date: '2025-12-20',
          time: '09:00'
        });
        
        const slots = dataStore.getAvailableSlots(doctor.id, '2025-12-20');
        expect(slots).not.toContain('09:00');
        expect(slots.length).toBe(dataStore.timeSlots.length - 1);
      });
    });
  });

  describe('resetData', () => {
    test('should clear all patients and appointments', () => {
      dataStore.createPatient({ name: 'Test', email: 't@t.com', phone: '1234567' });
      
      const patient = dataStore.getPatients()[0];
      const doctor = dataStore.getDoctors()[0];
      
      dataStore.createAppointment({
        patientId: patient.id,
        doctorId: doctor.id,
        date: '2025-12-20',
        time: '09:00'
      });
      
      dataStore.resetData();
      
      expect(dataStore.getPatients()).toHaveLength(0);
      expect(dataStore.getAppointments()).toHaveLength(0);
      // Doctors should still exist (pre-loaded)
      expect(dataStore.getDoctors().length).toBeGreaterThan(0);
    });
  });
});