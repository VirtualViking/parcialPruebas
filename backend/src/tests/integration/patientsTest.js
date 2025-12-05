/**
 * Integration Tests for Patient API
 * 
 * Tests the complete request/response cycle for patient endpoints
 * Using Supertest to make HTTP requests to the Express app
 */

const request = require('supertest');
const app = require('../../app');
const dataStore = require('../../models/data');

describe('Patient API - Integration Tests', () => {
  
  // Reset data before each test
  beforeEach(() => {
    dataStore.resetData();
  });

  // ========================================
  // POST /api/patients - Register Patient
  // ========================================
  describe('POST /api/patients', () => {
    
    describe('Successful Registration', () => {
      test('should register patient with valid data', async () => {
        const patientData = {
          name: 'Juan Pérez',
          email: 'juan@email.com',
          phone: '3001234567'
        };

        const response = await request(app)
          .post('/api/patients')
          .send(patientData)
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe('Juan Pérez');
        expect(response.body.data.email).toBe('juan@email.com');
      });

      test('should normalize email to lowercase', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Test User',
            email: 'TEST@EMAIL.COM',
            phone: '1234567890'
          })
          .expect(201);

        expect(response.body.data.email).toBe('test@email.com');
      });
    });

    describe('Validation Errors (400 Bad Request)', () => {
      
      // Invalid email tests (Equivalence Partition: Invalid)
      test('should reject invalid email format', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Test User',
            email: 'invalid-email',
            phone: '1234567890'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContainEqual(
          expect.objectContaining({ field: 'email' })
        );
      });

      test('should reject email without @', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Test User',
            email: 'testemail.com',
            phone: '1234567890'
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'email')).toBe(true);
      });

      // Invalid phone tests (Boundary Value: Below minimum)
      test('should reject phone with less than 7 digits', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Test User',
            email: 'test@email.com',
            phone: '123456' // 6 digits - below boundary
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'phone')).toBe(true);
      });

      // Invalid phone tests (Boundary Value: Above maximum)
      test('should reject phone with more than 15 digits', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Test User',
            email: 'test@email.com',
            phone: '1234567890123456' // 16 digits - above boundary
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'phone')).toBe(true);
      });

      // Invalid phone tests (Equivalence Partition: Contains letters)
      test('should reject phone with letters', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Test User',
            email: 'test@email.com',
            phone: '300ABC4567'
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'phone')).toBe(true);
      });

      // Empty fields tests (Boundary Value: Empty)
      test('should reject empty name', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: '',
            email: 'test@email.com',
            phone: '1234567890'
          })
          .expect(400);

        expect(response.body.errors.some(e => e.field === 'name')).toBe(true);
      });

      test('should reject all empty fields', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: '',
            email: '',
            phone: ''
          })
          .expect(400);

        expect(response.body.errors.length).toBeGreaterThanOrEqual(3);
      });

      test('should reject missing fields', async () => {
        const response = await request(app)
          .post('/api/patients')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Duplicate Email (409 Conflict)', () => {
      test('should reject duplicate email', async () => {
        // First registration
        await request(app)
          .post('/api/patients')
          .send({
            name: 'First User',
            email: 'duplicate@email.com',
            phone: '1234567890'
          })
          .expect(201);

        // Second registration with same email
        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Second User',
            email: 'duplicate@email.com',
            phone: '0987654321'
          })
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('existe');
      });

      test('should reject duplicate email case-insensitive', async () => {
        await request(app)
          .post('/api/patients')
          .send({
            name: 'First User',
            email: 'test@email.com',
            phone: '1234567890'
          });

        const response = await request(app)
          .post('/api/patients')
          .send({
            name: 'Second User',
            email: 'TEST@EMAIL.COM',
            phone: '0987654321'
          })
          .expect(409);

        expect(response.body.success).toBe(false);
      });
    });
  });

  // ========================================
  // GET /api/patients - List Patients
  // ========================================
  describe('GET /api/patients', () => {
    
    test('should return empty array when no patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    test('should return all registered patients', async () => {
      // Create patients
      await request(app)
        .post('/api/patients')
        .send({ name: 'Patient 1', email: 'p1@test.com', phone: '1111111' });
      
      await request(app)
        .post('/api/patients')
        .send({ name: 'Patient 2', email: 'p2@test.com', phone: '2222222' });

      const response = await request(app)
        .get('/api/patients')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  // ========================================
  // GET /api/patients/:id - Get Patient by ID
  // ========================================
  describe('GET /api/patients/:id', () => {
    
    test('should return patient when exists', async () => {
      const createResponse = await request(app)
        .post('/api/patients')
        .send({ name: 'Test', email: 'test@email.com', phone: '1234567' });

      const patientId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .expect(200);

      expect(response.body.data.id).toBe(patientId);
      expect(response.body.data.name).toBe('Test');
    });

    test('should return 404 when patient not found', async () => {
      const response = await request(app)
        .get('/api/patients/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });
  });
});