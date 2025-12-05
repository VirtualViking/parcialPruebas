// Main Application Module
document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentPatient = null;
  let doctors = [];
  let appointments = [];
  let appointmentToCancel = null;

  // DOM Elements
  const elements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    
    // Patient Form
    patientForm: document.getElementById('patient-form'),
    patientName: document.getElementById('patient-name'),
    patientEmail: document.getElementById('patient-email'),
    patientPhone: document.getElementById('patient-phone'),
    registerBtn: document.getElementById('register-btn'),
    patientInfo: document.getElementById('patient-info'),
    registeredName: document.getElementById('registered-name'),
    registeredEmail: document.getElementById('registered-email'),
    registeredPhone: document.getElementById('registered-phone'),
    goToAppointment: document.getElementById('go-to-appointment'),
    
    // Appointment Form
    appointmentForm: document.getElementById('appointment-form'),
    selectPatient: document.getElementById('select-patient'),
    selectDoctor: document.getElementById('select-doctor'),
    appointmentDate: document.getElementById('appointment-date'),
    selectTime: document.getElementById('select-time'),
    appointmentBtn: document.getElementById('appointment-btn'),
    appointmentConfirmation: document.getElementById('appointment-confirmation'),
    confirmedDoctor: document.getElementById('confirmed-doctor'),
    confirmedDate: document.getElementById('confirmed-date'),
    confirmedTime: document.getElementById('confirmed-time'),
    goToList: document.getElementById('go-to-list'),
    
    // Appointments List
    noAppointments: document.getElementById('no-appointments'),
    appointmentsList: document.getElementById('appointments-list'),
    goToSchedule: document.getElementById('go-to-schedule'),
    refreshAppointments: document.getElementById('refresh-appointments'),
    
    // Modal
    cancelModal: document.getElementById('cancel-modal'),
    modalCancel: document.getElementById('modal-cancel'),
    modalConfirm: document.getElementById('modal-confirm'),
    
    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // Initialize
  init();

  async function init() {
    setupEventListeners();
    setMinDate();
    await loadDoctors();
    await loadPatients();
    await loadAppointments();
  }

  // Event Listeners
  function setupEventListeners() {
    // Tab navigation
    elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Patient form
    elements.patientForm.addEventListener('submit', handlePatientSubmit);
    elements.goToAppointment.addEventListener('click', () => switchTab('appointment'));

    // Real-time validation for patient form
    elements.patientName.addEventListener('blur', () => validateField('name'));
    elements.patientEmail.addEventListener('blur', () => validateField('email'));
    elements.patientPhone.addEventListener('blur', () => validateField('phone'));

    // Appointment form
    elements.appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    elements.selectDoctor.addEventListener('change', handleDoctorDateChange);
    elements.appointmentDate.addEventListener('change', handleDoctorDateChange);
    elements.goToList.addEventListener('click', () => switchTab('list'));
    elements.goToSchedule.addEventListener('click', () => switchTab('appointment'));

    // Refresh appointments
    elements.refreshAppointments.addEventListener('click', loadAppointments);

    // Modal
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', confirmCancel);
    elements.cancelModal.addEventListener('click', (e) => {
      if (e.target === elements.cancelModal) closeModal();
    });
  }

  // Tab Navigation
  function switchTab(tabId) {
    elements.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    elements.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });

    // Refresh data when switching to list
    if (tabId === 'list') {
      loadAppointments();
    }
  }

  // Set minimum date for appointment
  function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.appointmentDate.min = today;
    elements.appointmentDate.value = today;
  }

  // Load Doctors
  async function loadDoctors() {
    try {
      const response = await api.doctors.getAll();
      doctors = response.data;
      populateDoctorSelect();
    } catch (error) {
      showToast('Error al cargar doctores', 'error');
    }
  }

  function populateDoctorSelect() {
    elements.selectDoctor.innerHTML = '<option value="">-- Seleccione un doctor --</option>';
    doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.id;
      option.textContent = `${doctor.name} - ${doctor.specialty}`;
      elements.selectDoctor.appendChild(option);
    });
  }

  // Load Patients
  async function loadPatients() {
    try {
      const response = await api.patients.getAll();
      populatePatientSelect(response.data);
    } catch (error) {
      showToast('Error al cargar pacientes', 'error');
    }
  }

  function populatePatientSelect(patients) {
    elements.selectPatient.innerHTML = '<option value="">-- Seleccione un paciente --</option>';
    patients.forEach(patient => {
      const option = document.createElement('option');
      option.value = patient.id;
      option.textContent = `${patient.name} (${patient.email})`;
      elements.selectPatient.appendChild(option);
    });

    // Auto-select current patient if exists
    if (currentPatient) {
      elements.selectPatient.value = currentPatient.id;
    }
  }

  // Load Appointments
  async function loadAppointments() {
    try {
      const response = await api.appointments.getAll();
      appointments = response.data;
      renderAppointments();
    } catch (error) {
      showToast('Error al cargar citas', 'error');
    }
  }

  function renderAppointments() {
    if (appointments.length === 0) {
      elements.noAppointments.classList.remove('hidden');
      elements.appointmentsList.innerHTML = '';
      return;
    }

    elements.noAppointments.classList.add('hidden');
    elements.appointmentsList.innerHTML = appointments.map(apt => `
      <div class="appointment-card" data-id="${apt.id}">
        <div class="appointment-info">
          <h4>${apt.doctor?.name || 'Doctor'}</h4>
          <p class="specialty">${apt.doctor?.specialty || ''}</p>
          <p>Paciente: ${apt.patient?.name || 'N/A'}</p>
        </div>
        <div class="appointment-datetime">
          <div class="date">${formatDate(apt.date)}</div>
          <div class="time">${apt.time}</div>
        </div>
        <button class="btn-cancel" onclick="app.openCancelModal('${apt.id}')">
          Cancelar
        </button>
      </div>
    `).join('');
  }

  // Handle Patient Submit
  async function handlePatientSubmit(e) {
    e.preventDefault();
    
    const data = {
      name: elements.patientName.value.trim(),
      email: elements.patientEmail.value.trim(),
      phone: elements.patientPhone.value.trim()
    };

    // Validate
    const validationResult = validation.validatePatientForm(data);
    
    if (!validationResult.isValid) {
      showValidationErrors(validationResult.errors, 'patient');
      return;
    }

    // Clear errors and submit
    validation.clearFormErrors('patient-form');
    elements.registerBtn.disabled = true;
    elements.registerBtn.textContent = 'Registrando...';

    try {
      const response = await api.patients.register(data);
      currentPatient = response.data;
      
      // Show success
      elements.registeredName.textContent = currentPatient.name;
      elements.registeredEmail.textContent = currentPatient.email;
      elements.registeredPhone.textContent = currentPatient.phone;
      elements.patientInfo.classList.remove('hidden');
      
      // Reset form
      elements.patientForm.reset();
      
      // Reload patients list
      await loadPatients();
      
      showToast('Paciente registrado exitosamente', 'success');
    } catch (error) {
      if (error.status === 409) {
        showToast('Ya existe un paciente con este email', 'error');
        validation.showFieldError('patient-email', 'email-error', 'Este email ya está registrado');
      } else if (error.errors && error.errors.length > 0) {
        showServerValidationErrors(error.errors, 'patient');
      } else {
        showToast(error.message || 'Error al registrar paciente', 'error');
      }
    } finally {
      elements.registerBtn.disabled = false;
      elements.registerBtn.textContent = 'Registrar Paciente';
    }
  }

  // Handle Doctor/Date Change
  async function handleDoctorDateChange() {
    const doctorId = elements.selectDoctor.value;
    const date = elements.appointmentDate.value;

    if (!doctorId || !date) {
      elements.selectTime.disabled = true;
      elements.selectTime.innerHTML = '<option value="">-- Primero seleccione doctor y fecha --</option>';
      return;
    }

    try {
      const response = await api.appointments.getAvailable(doctorId, date);
      const slots = response.data.availableSlots;
      
      elements.selectTime.disabled = false;
      elements.selectTime.innerHTML = '<option value="">-- Seleccione una hora --</option>';
      
      if (slots.length === 0) {
        elements.selectTime.innerHTML = '<option value="">No hay horarios disponibles</option>';
        elements.selectTime.disabled = true;
      } else {
        slots.forEach(slot => {
          const option = document.createElement('option');
          option.value = slot;
          option.textContent = slot;
          elements.selectTime.appendChild(option);
        });
      }
    } catch (error) {
      showToast('Error al cargar horarios', 'error');
    }
  }

  // Handle Appointment Submit
  async function handleAppointmentSubmit(e) {
    e.preventDefault();

    const data = {
      patientId: elements.selectPatient.value,
      doctorId: elements.selectDoctor.value,
      date: elements.appointmentDate.value,
      time: elements.selectTime.value
    };

    // Validate
    const validationResult = validation.validateAppointmentForm(data);
    
    if (!validationResult.isValid) {
      showValidationErrors(validationResult.errors, 'appointment');
      return;
    }

    // Clear errors and submit
    validation.clearFormErrors('appointment-form');
    elements.appointmentBtn.disabled = true;
    elements.appointmentBtn.textContent = 'Agendando...';

    try {
      const response = await api.appointments.create(data);
      const apt = response.data;
      
      // Show confirmation
      elements.confirmedDoctor.textContent = apt.doctor.name;
      elements.confirmedDate.textContent = formatDate(apt.date);
      elements.confirmedTime.textContent = apt.time;
      elements.appointmentConfirmation.classList.remove('hidden');
      
      // Reset form
      elements.appointmentForm.reset();
      elements.selectTime.disabled = true;
      setMinDate();
      
      // Reload appointments
      await loadAppointments();
      
      showToast('Cita agendada exitosamente', 'success');
    } catch (error) {
      if (error.status === 409) {
        showToast('Este horario ya no está disponible', 'error');
        handleDoctorDateChange(); // Refresh available slots
      } else {
        showToast(error.message || 'Error al agendar cita', 'error');
      }
    } finally {
      elements.appointmentBtn.disabled = false;
      elements.appointmentBtn.textContent = 'Agendar Cita';
    }
  }

  // Cancel Appointment
  function openCancelModal(appointmentId) {
    appointmentToCancel = appointmentId;
    elements.cancelModal.classList.remove('hidden');
  }

  function closeModal() {
    appointmentToCancel = null;
    elements.cancelModal.classList.add('hidden');
  }

  async function confirmCancel() {
    if (!appointmentToCancel) return;

    try {
      await api.appointments.cancel(appointmentToCancel);
      showToast('Cita cancelada exitosamente', 'success');
      await loadAppointments();
    } catch (error) {
      showToast(error.message || 'Error al cancelar cita', 'error');
    } finally {
      closeModal();
    }
  }

  // Field Validation
  function validateField(field) {
    const value = elements[`patient${field.charAt(0).toUpperCase() + field.slice(1)}`]?.value.trim();
    const errorId = `${field}-error`;
    const fieldId = `patient-${field}`;
    
    let isValid = false;
    let errorMessage = '';

    switch (field) {
      case 'name':
        isValid = validation.isValidName(value);
        errorMessage = 'El nombre es requerido';
        break;
      case 'email':
        isValid = validation.isValidEmail(value);
        errorMessage = 'Ingrese un email válido';
        break;
      case 'phone':
        isValid = validation.isValidPhone(value);
        errorMessage = 'El teléfono debe tener entre 7 y 15 dígitos';
        break;
    }

    if (isValid) {
      validation.clearFieldError(fieldId, errorId);
      validation.showFieldSuccess(fieldId);
    } else if (value) {
      validation.showFieldError(fieldId, errorId, errorMessage);
    }
  }

  // Show Validation Errors
  function showValidationErrors(errors, formType) {
    const prefix = formType === 'patient' ? 'patient-' : '';
    const errorIdMap = {
      name: 'name-error',
      email: 'email-error',
      phone: 'phone-error',
      patientId: 'patient-select-error',
      doctorId: 'doctor-error',
      date: 'date-error',
      time: 'time-error'
    };

    const fieldIdMap = {
      name: 'patient-name',
      email: 'patient-email',
      phone: 'patient-phone',
      patientId: 'select-patient',
      doctorId: 'select-doctor',
      date: 'appointment-date',
      time: 'select-time'
    };

    Object.entries(errors).forEach(([field, message]) => {
      validation.showFieldError(fieldIdMap[field], errorIdMap[field], message);
    });
  }

  function showServerValidationErrors(errors, formType) {
    errors.forEach(error => {
      const errorIdMap = {
        name: 'name-error',
        email: 'email-error',
        phone: 'phone-error'
      };
      const fieldIdMap = {
        name: 'patient-name',
        email: 'patient-email',
        phone: 'patient-phone'
      };
      
      if (errorIdMap[error.field]) {
        validation.showFieldError(fieldIdMap[error.field], errorIdMap[error.field], error.message);
      }
    });
  }

  // Toast Notifications
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Utility Functions
  function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
  }

  // Expose functions for HTML onclick handlers
  window.app = {
    openCancelModal,
    switchTab
  };
});