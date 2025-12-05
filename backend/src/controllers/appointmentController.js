const dataStore = require('../models/data');

// Create a new appointment
const createAppointment = (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    // Verify patient exists
    const patient = dataStore.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Verify doctor exists
    const doctor = dataStore.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    // Verify time slot is valid
    if (!dataStore.timeSlots.includes(time)) {
      return res.status(400).json({
        success: false,
        message: 'Horario no válido'
      });
    }

    // Check slot availability
    if (!dataStore.isSlotAvailable(doctorId, date, time)) {
      return res.status(409).json({
        success: false,
        message: 'El horario seleccionado ya está ocupado'
      });
    }

    // Create appointment
    const appointment = dataStore.createAppointment({ patientId, doctorId, date, time });

    res.status(201).json({
      success: true,
      message: 'Cita agendada exitosamente',
      data: {
        ...appointment,
        patient: { id: patient.id, name: patient.name },
        doctor: { id: doctor.id, name: doctor.name, specialty: doctor.specialty }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear cita',
      error: error.message
    });
  }
};

// Get all appointments
const getAppointments = (req, res) => {
  try {
    const appointments = dataStore.getAppointments();
    
    // Enrich with patient and doctor info
    const enrichedAppointments = appointments.map(apt => {
      const patient = dataStore.getPatientById(apt.patientId);
      const doctor = dataStore.getDoctorById(apt.doctorId);
      return {
        ...apt,
        patient: patient ? { id: patient.id, name: patient.name } : null,
        doctor: doctor ? { id: doctor.id, name: doctor.name, specialty: doctor.specialty } : null
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedAppointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas',
      error: error.message
    });
  }
};

// Get available slots for a doctor on a specific date
const getAvailableSlots = (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere doctorId y date'
      });
    }

    // Verify doctor exists
    const doctor = dataStore.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor no encontrado'
      });
    }

    const availableSlots = dataStore.getAvailableSlots(doctorId, date);

    res.status(200).json({
      success: true,
      data: {
        doctor: { id: doctor.id, name: doctor.name },
        date,
        availableSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios disponibles',
      error: error.message
    });
  }
};

// Cancel an appointment
const cancelAppointment = (req, res) => {
  try {
    const { id } = req.params;

    const appointment = dataStore.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'La cita ya fue cancelada'
      });
    }

    const cancelledAppointment = dataStore.cancelAppointment(id);

    res.status(200).json({
      success: true,
      message: 'Cita cancelada exitosamente',
      data: cancelledAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar cita',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = (req, res) => {
  try {
    const { id } = req.params;
    const appointment = dataStore.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    const patient = dataStore.getPatientById(appointment.patientId);
    const doctor = dataStore.getDoctorById(appointment.doctorId);

    res.status(200).json({
      success: true,
      data: {
        ...appointment,
        patient: patient ? { id: patient.id, name: patient.name } : null,
        doctor: doctor ? { id: doctor.id, name: doctor.name, specialty: doctor.specialty } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener cita',
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAvailableSlots,
  cancelAppointment,
  getAppointmentById
};