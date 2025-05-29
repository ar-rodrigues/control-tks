# Documentación de Endpoints de la API

Este archivo complementa la documentación de tablas (`Tables documentation.md`). Aquí encontrarás los endpoints REST disponibles para cada recurso, con referencias directas a las tablas de la base de datos.

> **Nota:** Si necesitas conocer la estructura de las tablas, consulta el archivo `Tables documentation.md`.

---

## Índice de Recursos y Tablas Relacionadas

- [api_keys](#api_keys)
- [dealers](#dealers)
- [inventory](#inventory)
- [locations_directory](#locations_directory)
- [permissions](#permissions)
- [profiles](#profiles)
- [roles](#roles)
- [vin_lists](#vin_lists)
- [work_sessions](#work_sessions)

---

## api_keys (Tabla: `api_keys`)

- `GET /api/api-keys` — Listar todas las llaves (solo admin)
- `POST /api/api-keys` — Crear una nueva llave (solo admin)
- `GET /api/api-keys/:id` — Obtener una llave por ID (solo admin)
- `PATCH /api/api-keys/:id` — Actualizar una llave (solo admin)
- `DELETE /api/api-keys/:id` — Eliminar una llave (solo admin)

---

## dealers (Tabla: `dealers`)

- `GET /api/dealers` — Listar todos los concesionarios
- `GET /api/dealers/:id` — Obtener un concesionario por ID
- `POST /api/dealers` — Crear un nuevo concesionario
- `PUT /api/dealers/:id` — Actualizar un concesionario
- `DELETE /api/dealers/:id` — Eliminar un concesionario
- `GET /api/dealers/zonas` — Listar zonas de concesionarios
- `GET /api/dealers/estados` — Listar estados de concesionarios
- `GET /api/dealers/clientes` — Listar clientes de concesionarios

---

## inventory (Tabla: `inventory`)

_(Actualmente no hay endpoints directos para esta tabla)_

---

## locations_directory (Tabla: `locations_directory`)

> **Actualización:** Esta tabla ahora incluye los campos `es_matriz` y `location_coordinates` (ahora de tipo `jsonb`). Consulta `Tables documentation.md` para la estructura completa.

- `GET /api/locations-directory` — Listar todas las ubicaciones
- `POST /api/locations-directory` — Crear una nueva ubicación
- `GET /api/locations-directory/:id` — Obtener una ubicación por ID
- `PUT /api/locations-directory/:id` — Actualizar una ubicación
- `DELETE /api/locations-directory/:id` — Eliminar una ubicación
- `GET /api/location/by-cp` — Obtener coordenadas a partir de un código postal (nuevo endpoint)

### Función Edge y Variables de Entorno

Se ha añadido una función edge en la base de datos que utiliza las siguientes variables de entorno:

- `WEBSITE_URL`
- `LOCATION_API_KEY`

Estas variables son necesarias para el correcto funcionamiento de la función de geolocalización.

---

## permissions (Tabla: `permissions`)

_(Actualmente no hay endpoints directos para esta tabla)_

---

## profiles (Tabla: `profiles`)

> **Actualización:** Esta tabla ahora incluye los campos `home_address` y `home_address_coordinates`. Consulta `Tables documentation.md` para la estructura completa.

- `GET /api/users` — Listar todos los usuarios
- `POST /api/users` — Crear un nuevo usuario
- `GET /api/users/:id` — Obtener un usuario por ID
- `PUT /api/users/:id` — Actualizar un usuario
- `DELETE /api/users/:id` — Eliminar un usuario

---

## roles (Tabla: `roles`)

- `GET /api/roles` — Listar todos los roles
- `POST /api/roles` — Crear un nuevo rol
- `PUT /api/roles` — Actualizar un rol
- `DELETE /api/roles` — Eliminar un rol

---

## vin_lists (Tabla: `vin_lists`)

- `GET /api/vin-lists` — Listar todas las listas de VIN
- `POST /api/vin-lists` — Crear una nueva lista de VIN (solo admin)
- `GET /api/vin-lists/:id` — Obtener una lista de VIN por ID
- `PUT /api/vin-lists/:id` — Actualizar una lista de VIN
- `DELETE /api/vin-lists/:id` — Eliminar una lista de VIN

---

## work_sessions (Tabla: `work_sessions`)

- `GET /api/work-sessions` — Listar sesiones de trabajo
- `POST /api/work-sessions` — Crear una nueva sesión de trabajo
- `GET /api/work-sessions/:id` — Obtener una sesión por ID
- `PUT /api/work-sessions/:id` — Actualizar una sesión
- `DELETE /api/work-sessions/:id` — Eliminar una sesión
- `GET /api/work-sessions/admin` — Endpoints administrativos para sesiones

---
