const dataStore = require('../models/data');

// Register a new patient
const registerPatient = (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if email already exists
    const existingPatient = dataStore.getPatientByEmail(email);
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un paciente registrado con este email'
      });
    }

    // Create patient
    const patient = dataStore.createPatient({ name, email, phone });

    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar paciente',
      error: error.message
    });
  }
};

// Get all patients
const getPatients = (req, res) => {
  try {
    const patients = dataStore.getPatients();
    res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
};

// Get patient by ID
const getPatientById = (req, res) => {
  try {
    const { id } = req.params;
    const patient = dataStore.getPatientById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente',
      error: error.message
    });
  }
};

module.exports = {
  registerPatient,
  getPatients,
  getPatientById
};