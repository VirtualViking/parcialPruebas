const dataStore = require('../models/data');

// Get all doctors
const getDoctors = (req, res) => {
  try {
    const doctors = dataStore.getDoctors();
    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctores',
      error: error.message
    });
  }
};

// Get doctor by ID
const getDoctorById = (req, res) => {
  try {
    const { id } = req.params;
    const doctor = dataStore.getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener doctor',
      error: error.message
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById
};