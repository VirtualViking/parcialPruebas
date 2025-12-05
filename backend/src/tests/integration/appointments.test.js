/**
 * Integration Tests for Appointments API
 * 
 * Tests the complete request/response cycle for appointment endpoints
 * Including creation, listing, availability check, and cancellation
 */

const request = require('supertest');
const app = require('../../app');
const dataStore = require('../../models/data');

describe('Appointments API - Integration Tests', () => {
  let patient;
  let doctor;

  // Setup before each test
  beforeEach(async () => {
    dataStore.resetData();
    
    // Create a test patient
    const patientResponse = await request(app)
      .post('/api/patients')
      .send({
        name: 'Test Patient',
        email: 'patient@test.com',
        phone: '1234567890'
      });
    patient = patientResponse.body.data;

    // Get first doctor
    const doctorsResponse = await request(app).get('/api/doctors');
    doctor = doctorsResponse.body.data[0];
  });

  // Helper to get a valid future date
  const getFutureDate = (daysAhead = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  };

  // ========================================
  // POST /api/appointments - Create Appointment
  // ========================================
  describe('POST /api/appointments', () => {
    
    describe('Successful Creation', () => {
      test('should create appointment with valid data', async () => {
        const appointmentData = {
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        };

        const response = await request(app)
          .post('/api/appointments')
          .send(appointmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.status).toBe('scheduled');
        expect(response.body.data.patient.name).toBe('Test Patient');
        expect(response.body.data.doctor.name).toBe(doctor.name);
      });
    });

    describe('Validation Errors (400 Bad Request)', () => {
      
      test('should reject missing patientId', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({
            doctorId: doctor.id,
            date: getFutureDate(),
            time: '09:00'
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'patientId')).toBe(true);
      });

      test('should reject missing doctorId', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({
            patientId: patient.id,
            date: getFutureDate(),
            time: '09:00'
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'doctorId')).toBe(true);
      });

      test('should reject past date', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        const pastDateStr = pastDate.toISOString().split('T')[0];

        const response = await request(app)
          .post('/api/appointments')
          .send({
            patientId: patient.id,
            doctorId: doctor.id,
            date: pastDateStr,
            time: '09:00'
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'date')).toBe(true);
      });

      test('should reject missing time', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({
            patientId: patient.id,
            doctorId: doctor.id,
            date: getFutureDate()
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'time')).toBe(true);
      });
    });

    describe('Not Found Errors (404)', () => {
      
      test('should reject non-existent patient', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({
            patientId: 'non-existent-patient',
            doctorId: doctor.id,
            date: getFutureDate(),
            time: '09:00'
          })
          .expect(404);

        expect(response.body.message).toContain('Paciente');
      });

      test('should reject non-existent doctor', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({
            patientId: patient.id,
            doctorId: 'non-existent-doctor',
            date: getFutureDate(),
            time: '09:00'
          })
          .expect(404);

        expect(response.body.message).toContain('Doctor');
      });
    });

    describe('Conflict Errors (409)', () => {
      
      test('should reject duplicate appointment (same doctor, date, time)', async () => {
        const appointmentData = {
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        };

        // First appointment
        await request(app)
          .post('/api/appointments')
          .send(appointmentData)
          .expect(201);

        // Create another patient for second attempt
        const patient2Response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Second Patient',
            email: 'patient2@test.com',
            phone: '0987654321'
          });

        // Second appointment at same time
        const response = await request(app)
          .post('/api/appointments')
          .send({
            ...appointmentData,
            patientId: patient2Response.body.data.id
          })
          .expect(409);

        expect(response.body.message).toContain('ocupado');
      });
    });

    describe('Invalid Time Slot (400)', () => {
      
      test('should reject invalid time slot', async () => {
        const response = await request(app)
          .post('/api/appointments')
          .send({
            patientId: patient.id,
            doctorId: doctor.id,
            date: getFutureDate(),
            time: '13:00' // Not a valid slot
          })
          .expect(400);

        expect(response.body.message).toContain('Horario');
      });
    });
  });

  // ========================================
  // GET /api/appointments - List Appointments
  // ========================================
  describe('GET /api/appointments', () => {
    
    test('should return empty array when no appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    test('should return all scheduled appointments', async () => {
      // Create appointments
      await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        });

      await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '10:00'
        });

      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });

    test('should not return cancelled appointments', async () => {
      // Create appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        });

      // Cancel it
      await request(app)
        .delete(`/api/appointments/${createResponse.body.data.id}`);

      // List should be empty
      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });

    test('should include patient and doctor info in response', async () => {
      await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        });

      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.body.data[0].patient).toHaveProperty('name');
      expect(response.body.data[0].doctor).toHaveProperty('name');
      expect(response.body.data[0].doctor).toHaveProperty('specialty');
    });
  });

  // ========================================
  // GET /api/appointments/available - Available Slots
  // ========================================
  describe('GET /api/appointments/available', () => {
    
    test('should return all slots when none booked', async () => {
      const response = await request(app)
        .get('/api/appointments/available')
        .query({ doctorId: doctor.id, date: getFutureDate() })
        .expect(200);

      expect(response.body.data.availableSlots.length).toBeGreaterThan(0);
    });

    test('should exclude booked slots', async () => {
      const testDate = getFutureDate();
      
      // Book a slot
      await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: testDate,
          time: '09:00'
        });

      const response = await request(app)
        .get('/api/appointments/available')
        .query({ doctorId: doctor.id, date: testDate })
        .expect(200);

      expect(response.body.data.availableSlots).not.toContain('09:00');
    });

    test('should require doctorId parameter', async () => {
      const response = await request(app)
        .get('/api/appointments/available')
        .query({ date: getFutureDate() })
        .expect(400);

      expect(response.body.message).toContain('doctorId');
    });

    test('should require date parameter', async () => {
      const response = await request(app)
        .get('/api/appointments/available')
        .query({ doctorId: doctor.id })
        .expect(400);

      expect(response.body.message).toContain('date');
    });

    test('should return 404 for non-existent doctor', async () => {
      const response = await request(app)
        .get('/api/appointments/available')
        .query({ doctorId: 'fake-id', date: getFutureDate() })
        .expect(404);

      expect(response.body.message).toContain('Doctor');
    });
  });

  // ========================================
  // DELETE /api/appointments/:id - Cancel Appointment
  // ========================================
  describe('DELETE /api/appointments/:id', () => {
    
    test('should cancel existing appointment', async () => {
      // Create appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        });

      const appointmentId = createResponse.body.data.id;

      // Cancel it
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    test('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .delete('/api/appointments/non-existent-id')
        .expect(404);

      expect(response.body.message).toContain('no encontrada');
    });

    test('should return 400 when cancelling already cancelled appointment', async () => {
      // Create appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        });

      const appointmentId = createResponse.body.data.id;

      // Cancel first time
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(200);

      // Try to cancel again
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .expect(400);

      expect(response.body.message).toContain('ya fue cancelada');
    });

    test('should free up the time slot after cancellation', async () => {
      const testDate = getFutureDate();
      
      // Create appointment
      const createResponse = await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: testDate,
          time: '09:00'
        });

      // Cancel it
      await request(app)
        .delete(`/api/appointments/${createResponse.body.data.id}`);

      // Check slot is available again
      const response = await request(app)
        .get('/api/appointments/available')
        .query({ doctorId: doctor.id, date: testDate });

      expect(response.body.data.availableSlots).toContain('09:00');
    });
  });

  // ========================================
  // GET /api/appointments/:id - Get Appointment by ID
  // ========================================
  describe('GET /api/appointments/:id', () => {
    
    test('should return appointment details', async () => {
      const createResponse = await request(app)
        .post('/api/appointments')
        .send({
          patientId: patient.id,
          doctorId: doctor.id,
          date: getFutureDate(),
          time: '09:00'
        });

      const response = await request(app)
        .get(`/api/appointments/${createResponse.body.data.id}`)
        .expect(200);

      expect(response.body.data.patient.name).toBe('Test Patient');
      expect(response.body.data.doctor.name).toBe(doctor.name);
    });

    test('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/non-existent')
        .expect(404);

      expect(response.body.message).toContain('no encontrada');
    });
  });
});