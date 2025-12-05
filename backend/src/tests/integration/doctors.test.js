
const request = require('supertest');
const app = require('../../app');

describe('Doctors API - Integration Tests', () => {

  describe('GET /api/doctors', () => {
    
    test('should return list of doctors', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return doctors with required fields', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .expect(200);

      const doctor = response.body.data[0];
      expect(doctor).toHaveProperty('id');
      expect(doctor).toHaveProperty('name');
      expect(doctor).toHaveProperty('specialty');
    });
  });

  describe('GET /api/doctors/:id', () => {
    
    test('should return doctor when exists', async () => {
      // First get list to get a valid ID
      const listResponse = await request(app).get('/api/doctors');
      const doctorId = listResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/doctors/${doctorId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(doctorId);
    });

    test('should return 404 for non-existent doctor', async () => {
      const response = await request(app)
        .get('/api/doctors/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });
  });

  describe('GET /api/health', () => {
    
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API is running');
    });
  });

  describe('404 Handler', () => {
    
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });
  });
});