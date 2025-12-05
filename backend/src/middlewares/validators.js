// Validation utilities and middleware

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation: 7-15 digits only
const phoneRegex = /^\d{7,15}$/;

// Validation functions
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return emailRegex.test(email.trim());
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 1;
};

const validateDate = (date) => {
  if (!date || typeof date !== 'string') return false;
  // Format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return parsedDate >= today && !isNaN(parsedDate.getTime());
};

const validateTime = (time, validSlots) => {
  if (!time || typeof time !== 'string') return false;
  return validSlots.includes(time);
};

// Validation middleware for patient registration
const validatePatientMiddleware = (req, res, next) => {
  const { name, email, phone } = req.body;
  const errors = [];

  if (!validateName(name)) {
    errors.push({ field: 'name', message: 'El nombre es requerido' });
  }

  if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  }

  if (!validatePhone(phone)) {
    errors.push({ field: 'phone', message: 'El teléfono debe tener entre 7 y 15 dígitos' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación',
      errors 
    });
  }

  next();
};

// Validation middleware for appointment creation
const validateAppointmentMiddleware = (req, res, next) => {
  const { patientId, doctorId, date, time } = req.body;
  const errors = [];

  if (!patientId || typeof patientId !== 'string') {
    errors.push({ field: 'patientId', message: 'El ID del paciente es requerido' });
  }

  if (!doctorId || typeof doctorId !== 'string') {
    errors.push({ field: 'doctorId', message: 'El ID del doctor es requerido' });
  }

  if (!validateDate(date)) {
    errors.push({ field: 'date', message: 'La fecha no es válida o es anterior a hoy' });
  }

  if (!time || typeof time !== 'string') {
    errors.push({ field: 'time', message: 'La hora es requerida' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Errores de validación',
      errors 
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePhone,
  validateName,
  validateDate,
  validateTime,
  validatePatientMiddleware,
  validateAppointmentMiddleware
};