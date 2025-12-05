# Sistema de Reserva de Citas Médicas

Sistema completo de gestión de citas médicas compuesto por una API REST (Express.js) y un frontend básico (HTML/CSS/JS).

## Estructura del Proyecto

```
medical-appointments-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores de la API
│   │   ├── routes/           # Rutas de la API
│   │   ├── models/           # Modelos de datos
│   │   ├── middlewares/      # Middlewares (validación)
│   │   ├── tests/
│   │   │   ├── unit/         # Pruebas unitarias
│   │   │   └── integration/  # Pruebas de integración
│   │   ├── app.js            # Configuración de Express
│   │   └── server.js         # Punto de entrada
│   └── config/
├── frontend/
│   ├── css/                  # Estilos
│   ├── js/                   # Scripts del cliente
│   └── index.html            # Página principal
├── tests/
│   └── selenium/             # Pruebas E2E con Selenium
├── .github/
│   └── workflows/            # GitHub Actions
└── docs/
    └── TEST_CASES.md         # Documentación de casos de prueba
```

## Características

### API REST
- **POST /api/patients** - Registrar paciente (validación de email y teléfono)
- **GET /api/patients** - Listar pacientes
- **GET /api/doctors** - Listar doctores disponibles
- **POST /api/appointments** - Crear cita médica
- **GET /api/appointments** - Listar citas
- **GET /api/appointments/available** - Listar horarios disponibles
- **DELETE /api/appointments/:id** - Cancelar cita

### Frontend
- Formulario de registro de paciente
- Formulario para agendar cita (selección de doctor, fecha, hora)
- Vista de citas agendadas con opción de cancelar

## Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd medical-appointments-system

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Ejecución de Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test:unit

# Ejecutar pruebas de integración
npm run test:integration

# Ejecutar pruebas de Selenium
npm run test:selenium

# Ejecutar todas las pruebas
npm run test:all
```

## CI/CD

El proyecto incluye un workflow de GitHub Actions que:
1. Ejecuta todas las pruebas automáticamente
2. Si todas pasan, imprime "OK"

## Tecnologías

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Testing**: Jest, Supertest, Selenium WebDriver
- **CI/CD**: GitHub Actions
