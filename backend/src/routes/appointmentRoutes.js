const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { validateAppointmentMiddleware } = require('../middlewares/validators');

// POST /api/appointments - Create new appointment
router.post('/', validateAppointmentMiddleware, appointmentController.createAppointment);

// GET /api/appointments - Get all appointments
router.get('/', appointmentController.getAppointments);

// GET /api/appointments/available - Get available slots
router.get('/available', appointmentController.getAvailableSlots);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;