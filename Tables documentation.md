# Documentación de Tablas de la Base de Datos

Este documento describe la estructura de las tablas utilizadas en la base de datos del sistema **Control TKS**.

> **Nota:** Para consultar los endpoints de la API asociados a cada tabla, revisa el archivo `API_endpoints_documentacion.md`. En cada sección de tabla encontrarás el nombre exacto para buscar los endpoints correspondientes en ese archivo.

---

## Índice de Tablas

- [api_keys](#tabla-api_keys)
- [dealers](#tabla-dealers)
- [inventory](#tabla-inventory)
- [locations_directory](#tabla-locations_directory)
- [permissions](#tabla-permissions)
- [profiles](#tabla-profiles)
- [roles](#tabla-roles)
- [vin_lists](#tabla-vin_lists)
- [work_sessions](#tabla-work_sessions)

---

## Tabla: `api_keys`

**Descripción:**
Almacena las llaves de API utilizadas para acceder a los servicios del sistema.

| Columna      | Tipo de Dato             | Nulo | Predeterminado               | Llave Primaria | Descripción                     | Relación |
| ------------ | ------------------------ | ---- | ---------------------------- | -------------- | ------------------------------- | -------- |
| id           | uuid                     | NO   | uuid_generate_v4()           | Sí             | Identificador único de la llave |          |
| key          | text                     | NO   | null                         | No             | Valor de la llave API           |          |
| name         | text                     | NO   | null                         | No             | Nombre descriptivo de la llave  |          |
| is_active    | boolean                  | Sí   | true                         | No             | Indica si la llave está activa  |          |
| created_at   | timestamp with time zone | NO   | timezone('utc'::text, now()) | No             | Fecha de creación de la llave   |          |
| last_used_at | timestamp with time zone | Sí   | null                         | No             | Última vez que se usó la llave  |          |
| created_by   | uuid                     | Sí   | null                         | No             | Usuario que creó la llave       |          |

---

## Tabla: `dealers`

**Descripción:**
Almacena información sobre los concesionarios registrados en el sistema.

| Columna    | Tipo de Dato      | Nulo | Predeterminado    | Llave Primaria | Descripción                           | Relación |
| ---------- | ----------------- | ---- | ----------------- | -------------- | ------------------------------------- | -------- |
| id         | uuid              | NO   | gen_random_uuid() | Sí             | Identificador único del concesionario |          |
| created_at | timestamp with tz | NO   | now()             | No             | Fecha de creación del registro        |          |
| convenio   | text              | NO   | ''                | No             | Nombre del convenio asociado          |          |
| remotas    | boolean           | NO   | null              | No             | Indica si es una sucursal remota      |          |
| zona       | text              | Sí   | null              | No             | Zona geográfica                       |          |
| agencia    | text              | Sí   | null              | No             | Nombre de la agencia                  |          |
| grupo      | text              | Sí   | null              | No             | Grupo empresarial                     |          |
| marca      | text              | Sí   | null              | No             | Marca de vehículos                    |          |
| direccion  | text              | Sí   | null              | No             | Dirección física                      |          |
| ciudad     | text              | Sí   | null              | No             | Ciudad                                |          |
| estado     | text              | Sí   | null              | No             | Estado                                |          |
| telefono   | numeric           | Sí   | null              | No             | Teléfono de contacto                  |          |
| cliente    | text              | Sí   | null              | No             | Nombre del cliente principal          |          |
| matriz     | boolean           | NO   | null              | No             | Indica si es la matriz                |          |
| latitud    | double precision  | Sí   | null              | No             | Latitud geográfica                    |          |
| longitud   | double precision  | Sí   | null              | No             | Longitud geográfica                   |          |

---

## Tabla: `inventory`

**Descripción:**
Registra los activos y equipos en inventario.

| Columna        | Tipo de Dato | Nulo | Predeterminado    | Llave Primaria | Descripción                    | Relación |
| -------------- | ------------ | ---- | ----------------- | -------------- | ------------------------------ | -------- |
| id             | uuid         | NO   | gen_random_uuid() | Sí             | Identificador único del activo |          |
| asset_id       | text         | Sí   | null              | No             | Identificador del activo       |          |
| asset_type     | text         | Sí   | null              | No             | Tipo de activo                 |          |
| equipment_name | text         | Sí   | null              | No             | Nombre del equipo              |          |
| model          | text         | Sí   | null              | No             | Modelo del equipo              |          |
| serial_number  | text         | Sí   | null              | No             | Número de serie                |          |
| system_id      | text         | Sí   | null              | No             | Identificador de sistema       |          |
| previous_owner | text         | Sí   | null              | No             | Propietario anterior           |          |
| current_owner  | text         | Sí   | null              | No             | Propietario actual             |          |
| location       | text         | Sí   | null              | No             | Ubicación                      |          |
| department     | text         | Sí   | null              | No             | Departamento                   |          |
| status         | text         | Sí   | null              | No             | Estado del activo              |          |
| condition      | text         | Sí   | null              | No             | Condición del activo           |          |
| notes          | text         | Sí   | null              | No             | Notas adicionales              |          |
| purchase_type  | text         | Sí   | null              | No             | Tipo de compra                 |          |
| photo_url      | text         | Sí   | null              | No             | URL de la foto del activo      |          |

---

## Tabla: `locations_directory`

**Descripción:**
Directorio de ubicaciones asociadas a los concesionarios y clientes.

| Columna              | Tipo de Dato             | Nulo | Predeterminado | Llave Primaria | Descripción                                                            | Relación |
| -------------------- | ------------------------ | ---- | -------------- | -------------- | ---------------------------------------------------------------------- | -------- |
| id                   | bigint                   | NO   | null           | Sí             | Identificador único de la ubicación                                    |          |
| created_at           | timestamp with time zone | NO   | now()          | No             | Fecha de creación del registro                                         |          |
| convenio             | text                     | Sí   | null           | No             | Nombre del convenio asociado                                           |          |
| agencia              | text                     | Sí   | null           | No             | Nombre de la agencia                                                   |          |
| direccion            | text                     | Sí   | null           | No             | Dirección física                                                       |          |
| ciudad               | text                     | Sí   | null           | No             | Ciudad                                                                 |          |
| estado               | text                     | Sí   | null           | No             | Estado                                                                 |          |
| cp                   | text                     | Sí   | null           | No             | Código postal                                                          |          |
| cliente              | text                     | Sí   | null           | No             | Nombre del cliente principal                                           |          |
| es_matriz            | boolean                  | NO   | false          | No             | Indica si es la ubicación principal del concesionario                  |          |
| location_coordinates | jsonb                    | Sí   | null           | No             | Coordenadas de la ubicación (formato JSON, ej: {"lat":..., "lng":...}) |          |

---

## Tabla: `permissions`

**Descripción:**
Define los permisos asignados a los roles de usuario.

| Columna         | Tipo de Dato | Nulo | Predeterminado                          | Llave Primaria | Descripción                     | Relación |
| --------------- | ------------ | ---- | --------------------------------------- | -------------- | ------------------------------- | -------- |
| id              | integer      | NO   | nextval('permissions_id_seq'::regclass) | Sí             | Identificador único del permiso |          |
| role_id         | integer      | NO   | null                                    | No             | Rol asociado al permiso         | roles.id |
| permission_name | text         | NO   | null                                    | No             | Nombre del permiso              |          |

---

## Tabla: `profiles`

**Descripción:**
Contiene la información de los usuarios registrados.

| Columna                  | Tipo de Dato      | Nulo | Predeterminado | Llave Primaria | Descripción                                            | Relación |
| ------------------------ | ----------------- | ---- | -------------- | -------------- | ------------------------------------------------------ | -------- |
| id                       | uuid              | NO   | auth.uid()     | Sí             | Identificador único del usuario                        |          |
| full_name                | text              | NO   | null           | No             | Nombre completo del usuario                            |          |
| email                    | character varying | NO   | null           | No             | Correo electrónico                                     |          |
| profile_picture          | text              | Sí   | null           | No             | URL de la foto de perfil                               |          |
| roles                    | integer           | Sí   | null           | No             | Rol asignado al usuario                                | roles.id |
| home_address             | text              | Sí   | null           | No             | Dirección de domicilio del usuario                     |          |
| home_address_coordinates | text              | Sí   | null           | No             | Coordenadas del domicilio (formato texto, ej: lat,lng) |          |

---

## Tabla: `roles`

**Descripción:**
Define los diferentes roles de usuario en el sistema.

| Columna   | Tipo de Dato | Nulo | Predeterminado | Llave Primaria | Descripción                 | Relación |
| --------- | ------------ | ---- | -------------- | -------------- | --------------------------- | -------- |
| id        | integer      | NO   | null           | Sí             | Identificador único del rol |          |
| role_name | text         | NO   | null           | No             | Nombre del rol              |          |

---

## Tabla: `vin_lists`

**Descripción:**
Almacena listas de VINs (números de identificación de vehículos) asociadas a convenios.

| Columna    | Tipo de Dato             | Nulo | Predeterminado | Llave Primaria | Descripción                     | Relación |
| ---------- | ------------------------ | ---- | -------------- | -------------- | ------------------------------- | -------- |
| id         | bigint                   | NO   | null           | Sí             | Identificador único de la lista |          |
| created_at | timestamp with time zone | NO   | now()          | No             | Fecha de creación de la lista   |          |
| convenio   | text                     | Sí   | null           | No             | Nombre del convenio asociado    |          |
| inventario | ARRAY                    | Sí   | '{}'::text[]   | No             | Lista de VINs                   |          |

---

## Tabla: `work_sessions`

**Descripción:**
Registra los horarios de entrada y salida de los usuarios.

| Columna            | Tipo de Dato             | Nulo | Predeterminado    | Llave Primaria | Descripción                         | Relación    |
| ------------------ | ------------------------ | ---- | ----------------- | -------------- | ----------------------------------- | ----------- |
| id                 | uuid                     | NO   | gen_random_uuid() | Sí             | Identificador único de la sesión    |             |
| profile_id         | uuid                     | NO   | null              | No             | Usuario asociado a la sesión        | profiles.id |
| check_in           | timestamp with time zone | NO   | null              | No             | Fecha y hora de entrada             |             |
| check_in_location  | jsonb                    | NO   | null              | No             | Ubicación de entrada (formato JSON) |             |
| check_out          | timestamp with time zone | Sí   | null              | No             | Fecha y hora de salida              |             |
| check_out_location | jsonb                    | Sí   | null              | No             | Ubicación de salida (formato JSON)  |             |
| total_hours        | text                     | Sí   | null              | No             | Total de horas trabajadas           |             |
| created_at         | timestamp with time zone | NO   | null              | No             | Fecha de creación del registro      |             |
| check_in_address   | text                     | Sí   | null              | No             | Dirección de entrada                |             |
| check_out_address  | text                     | Sí   | null              | No             | Dirección de salida                 |             |

---
