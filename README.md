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

### Aplicación Web

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
---

⭐️ Si te ha gustado este proyecto, no olvides darle una estrella en GitHub
