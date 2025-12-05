const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { validatePatientMiddleware } = require('../middlewares/validators');

// POST /api/patients - Register new patient
router.post('/', validatePatientMiddleware, patientController.registerPatient);

// GET /api/patients - Get all patients
router.get('/', patientController.getPatients);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', patientController.getPatientById);

module.exports = router;