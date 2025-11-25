# 🛒 SmartShop Analytics v1

Sistema completo de análisis y seguimiento de precios de e-commerce construido con arquitectura de microservicios.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Comandos Disponibles](#-comandos-disponibles)
- [Accesos y Credenciales](#-accesos-y-credenciales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

- 🔐 **Sistema de autenticación** con roles (Admin/Usuario)
- 📊 **Dashboard analítico** con gráficos y estadísticas
- 💰 **Seguimiento de precios** con historial temporal
- 🔔 **Sistema de alertas** configurables
- 📦 **Gestión de productos** desde panel de administración
- 📈 **Comparador de productos** entre diferentes marketplaces
- 📑 **Generación de reportes** detallados
- 🗄️ **Interfaces gráficas** para gestión de bases de datos

## 🏗️ Arquitectura

### Microservicios

- **API Gateway** (Node.js + Express) - Puerto 3000
- **Analytics Service** (Node.js + Express) - Puerto 4000
- **Data Ingestion Service** (Python + Flask) - Puerto 5001

### Bases de Datos

- **PostgreSQL** - Usuarios, alertas, productos trackeados (Puerto 5433)
- **MongoDB** - Productos, historial de precios, reviews (Puerto 27017)
- **ElasticSearch** - Búsqueda y indexación (Puerto 9200)

### Frontend

- **React** con Tailwind CSS (Puerto 8080)

### Herramientas de Gestión

- **pgAdmin** - Interfaz para PostgreSQL (Puerto 5050)
- **Mongo Express** - Interfaz para MongoDB (Puerto 8081)

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Git**
- Al menos **4GB de RAM libre**
- Al menos **5GB de espacio en disco**

### Verificar instalación de Docker
```bash
docker --version
docker-compose --version
```

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/smartshop-analytics-v1.git
cd smartshop-analytics-v1
```

### 2. Configurar variables de entorno (opcional)

Si deseas cambiar las credenciales o configuraciones:
```bash
cp .env.example .env
nano .env
```

### 3. Construir e iniciar todos los servicios
```bash
make start
```

O si no tienes `make`:
```bash
docker-compose up -d --build
```

### 4. Esperar a que todos los servicios estén listos
```bash
make status
```

Deberías ver 9 contenedores en estado "Up".

### 5. Crear usuarios iniciales

Si es la primera vez que ejecutas el proyecto:
```bash
make setup
```

Esto creará:
- Usuario administrador: `admin@smartshop.com` / `password123`
- Usuario normal: `user@smartshop.com` / `password123`

### 6. Acceder a la aplicación

Abre tu navegador en: **http://localhost:8080**

¡Listo! 🎉

## 💻 Uso

### Inicio de sesión

1. Ve a http://localhost:8080
2. Inicia sesión con:
   - **Admin**: `admin@smartshop.com` / `password123`
   - **Usuario**: `user@smartshop.com` / `password123`

### Panel de Administración (Solo Admin)

1. Inicia sesión como admin
2. Ve a la sección "Admin" en el menú
3. Desde aquí puedes:
   - ➕ Añadir nuevos productos
   - 💰 Actualizar precios
   - 🗑️ Eliminar productos

### Funcionalidades para todos los usuarios

- 📊 **Dashboard**: Visualiza estadísticas generales
- 📦 **Productos**: Lista y búsqueda de productos
- 📈 **Comparador**: Compara precios entre productos
- 📑 **Reportes**: Genera reportes analíticos
- 🔔 **Alertas**: Configura alertas de precio

## 📝 Comandos Disponibles

Si instalaste el Makefile:

| Comando | Descripción |
|---------|-------------|
| `make help` | Mostrar todos los comandos |
| `make start` | Iniciar todo el sistema |
| `make stop` | Parar todo el sistema |
| `make restart` | Reiniciar todos los servicios |
| `make rebuild` | Reconstruir desde cero |
| `make status` | Ver estado de los servicios |
| `make logs` | Ver logs en tiempo real |
| `make urls` | Mostrar todas las URLs de acceso |
| `make setup` | Crear usuarios iniciales |
| `make clean` | Limpiar todo (⚠️ elimina datos) |

### Sin Makefile
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Reconstruir
docker-compose up -d --build
```

## 🔑 Accesos y Credenciales

### Aplicación Web

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|------------|
| Frontend | http://localhost:8080 | admin@smartshop.com | password123 |
| Frontend | http://localhost:8080 | user@smartshop.com | password123 |
| API Gateway | http://localhost:3000 | - | - |

### Herramientas de Gestión

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|------------|
| pgAdmin | http://localhost:5050 | admin@smartshop.com | admin123 |
| Mongo Express | http://localhost:8081 | admin | admin123 |

### Conectar pgAdmin a PostgreSQL

1. Ve a http://localhost:5050
2. Login con: `admin@smartshop.com` / `admin123`
3. Click derecho en "Servers" → "Register" → "Server"
4. **Pestaña General**:
   - Name: `SmartShop PostgreSQL`
5. **Pestaña Connection**:
   - Host: `postgres`
   - Port: `5432`
   - Database: `smartshop`
   - Username: `admin`
   - Password: `admin123`
   - ✅ Save password
6. Click "Save"

## 📁 Estructura del Proyecto
```
smartshop-analytics-v1/
├── api-gateway/              # API Gateway (Node.js)
│   ├── src/
│   │   ├── index.js
│   │   └── routes/
│   ├── package.json
│   └── Dockerfile
├── services/
│   ├── analytics/            # Servicio de Analytics (Node.js)
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/
│   │   │   │   ├── admin.js
│   │   │   │   └── auth.js
│   │   │   └── middleware/
│   │   │       └── auth.js
│   │   ├── package.json
│   │   └── Dockerfile
│   └── data-ingestion/       # Servicio de ingestión (Python)
│       ├── app.py
│       ├── config.py
│       ├── requirements.txt
│       └── Dockerfile
├── frontend/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Admin.js
│   │   │   └── ...
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── databases/                # Scripts de inicialización
│   ├── postgres/
│   │   └── init.sql
│   └── mongodb/
│       └── init.js
├── docker-compose.yml        # Configuración de Docker Compose
├── Makefile                  # Comandos útiles
├── .env                      # Variables de entorno
└── README.md                 # Este archivo
```

## 🔧 Desarrollo

### Modificar el código

1. **Frontend**:
```bash
   cd frontend/src
   # Edita los archivos que necesites
   make rebuild  # Reconstruir
```

2. **Backend (Analytics/API Gateway)**:
```bash
   cd services/analytics/src  # o api-gateway/src
   # Edita los archivos que necesites
   docker-compose restart analytics  # o api-gateway
```

3. **Python (Data Ingestion)**:
```bash
   cd services/data-ingestion
   # Edita los archivos que necesites
   docker-compose restart data-ingestion
```

### Añadir nuevas dependencias

**Node.js**:
```bash
docker-compose exec analytics npm install nombre-paquete
# o
docker-compose exec api-gateway npm install nombre-paquete
```

**Python**:
```bash
# Añadir a requirements.txt
docker-compose restart data-ingestion
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f analytics
docker-compose logs -f api-gateway
docker-compose logs -f data-ingestion
docker-compose logs -f frontend
```

### Acceder a la base de datos

**PostgreSQL**:
```bash
docker exec -it smartshop-postgres psql -U admin -d smartshop
```

Comandos útiles en psql:
```sql
\dt                  -- Ver tablas
\d users            -- Estructura de tabla users
SELECT * FROM users; -- Ver usuarios
\q                  -- Salir
```

**MongoDB**:
```bash
docker exec -it smartshop-mongodb mongosh smartshop
```

Comandos útiles en mongosh:
```javascript
show collections              // Ver colecciones
db.products.find().pretty()  // Ver productos
db.products.countDocuments() // Contar productos
exit                         // Salir
```

## 🐛 Troubleshooting

### Los contenedores no inician
```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs analytics
```

### Puerto ya en uso

Si algún puerto está ocupado (ej: 8080, 3000, 5432):

1. **Opción 1**: Cambiar el puerto en `docker-compose.yml`
2. **Opción 2**: Detener el proceso que usa ese puerto
```bash
# macOS/Linux - Ver qué usa el puerto 8080
lsof -i :8080

# Matar el proceso
kill -9 [PID]
```

### Error de permisos
```bash
# Dar permisos al Makefile
chmod +x Makefile

# Dar permisos a scripts
chmod +x *.sh
```

### Contenedores sin memoria

Si Docker se queda sin memoria:
```bash
# Limpiar imágenes y contenedores no usados
docker system prune -a

# Aumentar memoria en Docker Desktop
# Docker Desktop → Preferences → Resources → Memory
```

### Base de datos corrupta
```bash
# Eliminar volúmenes y empezar de cero
make clean
make start
make setup
```

### Frontend no carga
```bash
# Reconstruir frontend
docker-compose up -d --build frontend

# Ver logs
docker-compose logs -f frontend
```

### Error "Network smartshop-network not found"
```bash
# Recrear la red
docker network create smartshop-network

# Reiniciar todo
make restart
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Daniel - [@tu-twitter](https://twitter.com/tu-twitter)

Link del Proyecto: [https://github.com/tu-usuario/smartshop-analytics-v1](https://github.com/tu-usuario/smartshop-analytics-v1)

---

⭐️ Si te ha gustado este proyecto, no olvides darle una estrella en GitHub