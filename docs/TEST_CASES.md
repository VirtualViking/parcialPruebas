# Documentación de Casos de Prueba

## Técnicas de Selección de Datos de Prueba

### 1. Particiones de Equivalencia

Dividimos los datos de entrada en clases de equivalencia donde todos los valores de una clase deberían comportarse de manera similar.

#### Email
| Clase | Ejemplos | Esperado |
|-------|----------|----------|
| Válido | juan@email.com, test@domain.org | Aceptado |
| Sin @ | juanemail.com | Rechazado |
| Sin dominio | juan@ | Rechazado |
| Sin usuario | @email.com | Rechazado |
| Vacío | "" | Rechazado |

#### Teléfono
| Clase | Ejemplos | Esperado |
|-------|----------|----------|
| Válido (10 dígitos) | 3001234567 | Aceptado |
| Válido (7 dígitos) | 1234567 | Aceptado |
| Muy corto (<7) | 123456 | Rechazado |
| Muy largo (>15) | 12345678901234567 | Rechazado |
| Con letras | 300ABC4567 | Rechazado |
| Vacío | "" | Rechazado |

### 2. Valores Límite

Probamos en los límites de las particiones de equivalencia.

#### Longitud del Teléfono
| Valor | Longitud | Esperado |
|-------|----------|----------|
| 123456 | 6 | Rechazado (límite inferior -1) |
| 1234567 | 7 | Aceptado (límite inferior) |
| 12345678 | 8 | Aceptado (dentro del rango) |
| 123456789012345 | 15 | Aceptado (límite superior) |
| 1234567890123456 | 16 | Rechazado (límite superior +1) |

#### Nombre
| Valor | Longitud | Esperado |
|-------|----------|----------|
| "" | 0 | Rechazado |
| "A" | 1 | Aceptado (mínimo) |
| "Juan" | 4 | Aceptado (típico) |

### 3. Datos Válidos e Inválidos

#### Registro de Paciente

**Datos Válidos:**
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@email.com",
  "phone": "3001234567"
}
```

**Datos Inválidos - Email:**
```json
{
  "name": "Juan Pérez",
  "email": "email-invalido",
  "phone": "3001234567"
}
```

**Datos Inválidos - Teléfono:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "abc123"
}
```

**Datos Inválidos - Campos Vacíos:**
```json
{
  "name": "",
  "email": "",
  "phone": ""
}
```

## Casos de Prueba Implementados

### Pruebas Unitarias

#### 1. Validación de Email (validators.test.js)
| ID | Caso | Entrada | Esperado | Técnica |
|----|------|---------|----------|---------|
| U01 | Email válido simple | test@email.com | true | Partición válida |
| U02 | Email válido con subdominios | user@sub.domain.com | true | Partición válida |
| U03 | Email sin @ | testemail.com | false | Partición inválida |
| U04 | Email sin dominio | test@ | false | Partición inválida |
| U05 | Email vacío | "" | false | Valor límite |
| U06 | Email con espacios | "test @email.com" | false | Partición inválida |

#### 2. Validación de Teléfono (validators.test.js)
| ID | Caso | Entrada | Esperado | Técnica |
|----|------|---------|----------|---------|
| U07 | Teléfono 10 dígitos | 3001234567 | true | Partición válida |
| U08 | Teléfono 7 dígitos | 1234567 | true | Valor límite inferior |
| U09 | Teléfono 15 dígitos | 123456789012345 | true | Valor límite superior |
| U10 | Teléfono 6 dígitos | 123456 | false | Límite inferior -1 |
| U11 | Teléfono 16 dígitos | 1234567890123456 | false | Límite superior +1 |
| U12 | Teléfono con letras | 300ABC4567 | false | Partición inválida |
| U13 | Teléfono vacío | "" | false | Valor límite |

#### 3. Controlador de Pacientes (patientController.test.js)
| ID | Caso | Descripción | Técnica |
|----|------|-------------|---------|
| U14 | Crear paciente válido | Todos los campos correctos | Partición válida |
| U15 | Rechazar email inválido | Email mal formado | Partición inválida |
| U16 | Rechazar teléfono inválido | Teléfono con letras | Partición inválida |
| U17 | Rechazar campos vacíos | Nombre vacío | Valor límite |

### Pruebas de Integración (API)

#### 4. Endpoints de Pacientes (patients.test.js)
| ID | Caso | Método | Esperado | Técnica |
|----|------|--------|----------|---------|
| I01 | Registrar paciente | POST /api/patients | 201 Created | Flujo exitoso |
| I02 | Listar pacientes | GET /api/patients | 200 OK | Flujo exitoso |
| I03 | Email duplicado | POST /api/patients | 409 Conflict | Caso borde |
| I04 | Validación fallida | POST /api/patients | 400 Bad Request | Partición inválida |

#### 5. Endpoints de Citas (appointments.test.js)
| ID | Caso | Método | Esperado | Técnica |
|----|------|--------|----------|---------|
| I05 | Crear cita | POST /api/appointments | 201 Created | Flujo exitoso |
| I06 | Listar citas | GET /api/appointments | 200 OK | Flujo exitoso |
| I07 | Cancelar cita | DELETE /api/appointments/:id | 200 OK | Flujo exitoso |
| I08 | Cancelar inexistente | DELETE /api/appointments/:id | 404 Not Found | Caso borde |
| I09 | Cita duplicada | POST /api/appointments | 409 Conflict | Caso borde |

### Pruebas E2E con Selenium

#### 6. Flujo Completo de Usuario (e2e.test.js)
| ID | Caso | Descripción | Técnica |
|----|------|-------------|---------|
| E01 | Registro exitoso | Completar formulario con datos válidos | Flujo exitoso |
| E02 | Agendar cita exitosa | Seleccionar doctor, fecha y hora | Flujo exitoso |
| E03 | Cancelar cita | Click en botón cancelar | Flujo exitoso |
| E04 | Validación email frontend | Mostrar error por email inválido | Partición inválida |
| E05 | Validación campos vacíos | Mostrar error por campos requeridos | Valor límite |
| E06 | Flujo completo | Registro → Agendar → Cancelar | Integración E2E |

## Justificación de Selección

### ¿Por qué estas técnicas?

1. **Particiones de Equivalencia**: Reducen el número de casos de prueba manteniendo buena cobertura. Un valor de cada clase representa a todos los demás de esa clase.

2. **Valores Límite**: Los errores suelen ocurrir en los límites. Probar exactamente en el límite y justo fuera detecta errores comunes de "off-by-one".

3. **Datos Válidos e Inválidos**: Aseguran que el sistema acepta lo correcto y rechaza lo incorrecto.

### Cobertura

| Área | Casos | Cobertura |
|------|-------|-----------|
| Validación de entrada | 13 | Alta |
| Lógica de negocio | 9 | Media-Alta |
| Integración API | 9 | Alta |
| E2E | 6 | Media |
| **Total** | **37** | **Alta** |

## Matriz de Trazabilidad

| Requisito | Casos de Prueba |
|-----------|-----------------|
| Validar email | U01-U06, I04, E04 |
| Validar teléfono | U07-U13, I04 |
| Registrar paciente | U14-U17, I01-I04, E01, E05 |
| Crear cita | I05, I09, E02 |
| Listar citas | I06 |
| Cancelar cita | I07-I08, E03 |
| Flujo completo | E06 |
