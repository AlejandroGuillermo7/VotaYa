<div align="center">

# VotaYa

### Sistema Web de Gestión y Control de Votaciones

**Materia:** Programación Web

**Integrantes:**
- Enríquez Rodríguez Alejandro Guillermo
- Gómez Roblero Ángel Jahir

</div>

# Descripción del proyecto

**VotaYa** es una plataforma web que permite crear, administrar y participar en votaciones de forma segura, rápida y organizada.

El sistema permite que cualquier usuario registrado pueda crear una votación, definir sus fechas de inicio y finalización, agregar opciones de voto y compartirla con otros participantes.

Los usuarios pueden emitir su voto una sola vez y consultar los resultados mediante gráficas. Dependiendo de la configuración de cada votación, el voto puede ser anónimo o identificado.

# Problemática que resuelve

Actualmente, muchas votaciones se realizan mediante formularios o métodos manuales que no garantizan un control adecuado sobre los participantes, la confidencialidad del voto o la autenticidad de los resultados.

VotaYa busca ofrecer una solución donde las votaciones sean más seguras y organizadas, evitando votos duplicados, permitiendo controlar quién puede participar y mostrando los resultados de manera clara mediante estadísticas y gráficas.

# Módulos principales

## Usuario

Guarda los datos de las personas registradas y permite gestionar su cuenta, iniciar sesión, editar su perfil y recuperar su contraseña.

## Votación

Permite crear, editar, publicar y cerrar votaciones, además de configurar fechas, privacidad y reglas de participación.

## Opción de votación

Guarda las respuestas, candidatos o alternativas disponibles dentro de cada votación.

## Voto

Almacena la opción seleccionada por cada participante. Dependiendo de la configuración, el voto puede ser anónimo o identificado.

## Categoría

Permite clasificar las votaciones según su tema, por ejemplo: tecnología, educación, deportes o entretenimiento.

# Roles del sistema

## Administrador

Gestiona los usuarios, las votaciones y el funcionamiento general de la plataforma.

## Usuario registrado

Puede crear y administrar sus propias votaciones, editar su perfil, participar en otras votaciones y consultar resultados.

## Visitante

Puede participar en votaciones públicas cuando la configuración lo permita, pero no puede crear votaciones.

# Tecnologías utilizadas

- Java
- Spring Boot
- Spring Security
- JWT
- React
- Vite
- MySQL
- HTML
- CSS
- JavaScript
- Git
- GitHub
- Bruno
- Twilio
- Google OAuth

# Funciones principales

- Registro de usuarios.
- Inicio de sesión con correo y contraseña.
- Inicio de sesión con Google.
- Autenticación mediante JWT.
- Edición de perfil.
- Recuperación de contraseña por WhatsApp.
- Creación de votaciones.
- Edición de votaciones.
- Configuración de fechas y reglas.
- Votaciones públicas y privadas.
- Votos anónimos o identificados.
- Selección única o múltiple.
- Visualización de resultados mediante gráficas.
- Administración de usuarios.
- Pruebas de la API con Bruno.

# Base de datos

La base de datos utiliza MySQL y contiene tablas relacionadas para almacenar usuarios, categorías, votaciones, opciones, votos, participaciones, comentarios, invitaciones, tokens de recuperación y auditoría.

Entre las tablas principales se encuentran:

- usuario
- categoria
- votacion
- opcion_votacion
- voto
- voto_opcion
- participacion
- invitacion_votacion
- comentario
- token_recuperacion
- auditoria

# Instalación del proyecto

## Clonar el repositorio

```bash
git clone https://github.com/AlejandroGuillermo7/VotaYa.git
```

## Backend

Entrar a la carpeta del backend:

```bash
cd votaya-backend
```

Ejecutar:

```bash
mvn clean spring-boot:run
```

El backend se ejecuta en:

```text
http://localhost:8080
```

## Frontend

Entrar a la carpeta del frontend:

```bash
cd votaya-frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm run dev
```

# Credenciales de prueba

## Administrador

```text
Correo: pendiente
Contraseña: pendiente
```

## Usuario

```text
Correo: pendiente
Contraseña: pendiente
```

# API

URL base de la API:

```text
https://votaya.com.mx/api
```

Algunos endpoints principales son:

```text
POST /api/auth/registro
POST /api/auth/login
GET /api/usuarios/perfil
PUT /api/usuarios/perfil
POST /api/votaciones
PUT /api/votaciones/{id}
GET /api/votaciones
GET /api/votaciones/{id}
POST /api/recuperacion/solicitar
POST /api/recuperacion/restablecer
```

Las rutas protegidas requieren un token JWT en el encabezado:

```text
Authorization: Bearer TOKEN
```

# Pruebas con Bruno

La API fue probada utilizando Bruno.

Las pruebas incluyen:

- Registro.
- Inicio de sesión.
- Obtención de token JWT.
- Consulta de perfil.
- Edición de perfil.
- Creación de votación.
- Edición de votación.
- Peticiones protegidas.
- Casos de error.

La colección de Bruno se encuentra dentro del repositorio en la carpeta:

```text
bruno-votaya
```

# Despliegue

El proyecto se encuentra desplegado en una VPS.

Sitio web:

```text
https://votaya.com.mx
```

URL base de la API:

```text
https://votaya.com.mx/api
```

# Integrantes

Enríquez Rodríguez Alejandro Guillermo

Gómez Roblero Ángel Jahir

# Enlaces

## Repositorio de GitHub

https://github.com/AlejandroGuillermo7/VotaYa

## GitHub Projects

https://github.com/users/AlejandroGuillermo7/projects/1/views/1

## Proyecto desplegado

https://votaya.com.mx

## Prototipo de Figma

https://www.figma.com/design/cR3nfCHOgHstbR6BejilUn/Sin-t%C3%ADtulo?node-id=0-1&t=GAFbIwEOJnfqkMnD-0