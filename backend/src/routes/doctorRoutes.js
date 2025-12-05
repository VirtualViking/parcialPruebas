const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// GET /api/doctors - Get all doctors
router.get('/', doctorController.getDoctors);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

module.exports = router;