# SmartShop Analytics - Sistema de Análisis de Precios de E-commerce

Sistema completo de análisis de precios de productos de diferentes marketplaces con alertas automáticas, comparación de productos y generación de reportes.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Acceso a la Aplicación](#acceso-a-la-aplicación)
- [Usuarios](#usuarios)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)

---

## ✨ Características

- 🔐 **Autenticación JWT** con roles de usuario (admin/user) y sistema de registro
- 📊 **Dashboard** con analytics en tiempo real y auto-refresh (30 seg)
- 🛍️ **Gestión de Productos** con seguimiento personalizado
- 🔄 **Comparador** de hasta 4 productos simultáneos
- 📈 **Reportes** con 4 tipos diferentes y exportación CSV
- 🔔 **Sistema de Alertas** automáticas con notificaciones en tiempo real
- 💰 **Simulador de Precios** que actualiza precios cada 2 minutos (+/- 15%)
- 🌍 **Multiidioma** (Español, Euskera, English) con selector modal
- 👨‍💼 **Panel de Administración** para gestión de productos
- ⚡ **Auto-refresh** automático en Dashboard (30s) y Alertas (30s)

---

## 🏗️ Arquitectura

### **Arquitectura de Microservicios**
```
┌─────────────┐
│   Frontend  │ (React SPA)
│  Port 8080  │
└──────┬──────┘
       │
┌──────▼──────────┐
│  API Gateway    │ (Node.js/Express)
│   Port 3000     │
└────┬────┬───┬───┘
     │    │   │
┌────▼────▼───▼──────────────────┐
│                                 │
│  ┌─────────────┐ ┌────────────┐│
│  │ Analytics   │ │Data        ││
│  │ Service     │ │Ingestion   ││
│  │ (Node.js)   │ │(Python)    ││
│  │ Port 4000   │ │Port 5001   ││
│  └──────┬──────┘ └─────┬──────┘│
│         │              │        │
│  ┌──────▼──────┐ ┌─────▼──────┐│
│  │Price        │ │            ││
│  │Simulator    │ │            ││
│  │(Node.js)    │ │            ││
│  └─────────────┘ └────────────┘│
└─────────────────────────────────┘
         │              │
    ┌────▼────┐    ┌────▼────┐
    │PostgreSQL│   │ MongoDB │
    │Port 5432│    │Port 27017│
    └─────────┘    └─────────┘
```

### **Componentes:**

1. **Frontend (React)**: SPA con routing, Nginx
2. **API Gateway**: Proxy reverso, enrutamiento de peticiones
3. **Analytics Service**: Lógica de negocio, alertas, reportes
4. **Data Ingestion**: Simulación de scraping (Python Flask)
5. **Price Simulator**: Actualización automática de precios cada 2 minutos
6. **PostgreSQL**: Usuarios, seguimiento, alertas
7. **MongoDB**: Productos, historial de precios

---

## 🛠️ Tecnologías

### **Frontend:**
- React 18
- React Router v6
- Axios
- i18next (multiidioma)
- Recharts (gráficos)
- TailwindCSS
- Lucide React (iconos)

### **Backend:**
- Node.js + Express (API Gateway, Analytics)
- Python + Flask (Data Ingestion)
- JWT (autenticación)
- bcrypt (hashing de contraseñas)
- PostgreSQL (base de datos relacional)
- MongoDB (base de datos NoSQL)

### **DevOps:**
- Docker
- Docker Compose
- Nginx

---

## 📦 Requisitos Previos

### **0) Software Necesario:**

- **Docker Desktop** (incluye Docker y Docker Compose)
  - Windows/Mac: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
  - Linux: Docker Engine + Docker Compose

- **Git** (para clonar el repositorio)
  - [https://git-scm.com/downloads](https://git-scm.com/downloads)

**NOTA**: NO necesitas instalar Node.js, Python, PostgreSQL ni MongoDB localmente. Todo se ejecuta dentro de contenedores Docker.

---

## 🚀 Instalación y Ejecución

### **1) Clonar el Repositorio:**
```bash
git clone https://github.com/TU_USUARIO/smartshop-analytics.git
cd smartshop-analytics
```

### **2) Configurar Variables de Entorno:**

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

O en Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

El archivo `.env` ya contiene valores funcionales por defecto. **Opcionalmente** puedes editar `.env` y personalizar:
- `POSTGRES_PASSWORD`: Contraseña para PostgreSQL (por defecto: `smartshop2024`)
- `JWT_SECRET`: Clave secreta para JWT (ya incluye un valor seguro)
- `NODE_ENV`: Cambia a `production` para entorno de producción

**⚠️ IMPORTANTE**: El archivo `.env` no se sube a GitHub por seguridad. Usa siempre `.env.example` como plantilla.

### **3) Levantar Todos los Servicios:**
```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- MongoDB (puerto 27017)
- API Gateway (puerto 3000)
- Analytics Service (puerto 4000)
- Data Ingestion (puerto 5001)
- Price Simulator (background worker)
- Frontend (puerto 8080)

**Primera ejecución:** Puede tardar 5-10 minutos en descargar imágenes y construir contenedores.

**Ejecuciones posteriores:** ~30 segundos.

### **4) Verificar que Todo Está Corriendo:**
```bash
docker-compose ps
```

Deberías ver todos los servicios con estado "Up".

### **5) Ver Logs (Opcional):**
```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f price-simulator

# Presiona Ctrl+C para salir
```

---

## 🌐 Acceso a la Aplicación

### **Acceder a la Aplicación Web:**

Abre tu navegador en: **http://localhost:8080**

### **Endpoints de la API:**

- Frontend: http://localhost:8080
- API Gateway: http://localhost:3000
- Analytics: http://localhost:4000
- Data Ingestion: http://localhost:5001

---

## 👥 Usuarios

### **Crear un Nuevo Usuario:**

1. Ve a: **http://localhost:8080/register**
2. Completa el formulario de registro
3. Automáticamente se te creará una cuenta de tipo **user**

### **Convertir un Usuario a Admin:**
```bash
# Acceder a PostgreSQL
docker exec -it smartshop-postgres psql -U admin -d smartshop

# Ver usuarios
SELECT id, email, name, role FROM users;

# Cambiar un usuario a admin
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';

# Salir
\q
```

**Nota:** El sistema de registro genera usuarios con role `user` por defecto. Para tener permisos de administrador, debes cambiar el role manualmente desde PostgreSQL.

---

## 🎯 Funcionalidades

### **1. Dashboard**
- Métricas en tiempo real (productos seguidos, ventas estimadas, crecimiento)
- Gráficos de distribución por marketplace y categoría
- Evolución de precios histórica (últimos 30 días)
- Top productos por precio
- Auto-refresh cada 30 segundos

### **2. Productos**
- Listado completo con búsqueda y filtros
- Seguir/Dejar de seguir productos
- Información detallada (precio, rating, reviews, stock)
- Enlaces directos a marketplaces

### **3. Comparador**
- Comparación lado a lado de productos
- Destacado de mejor valor (precio, rating, reviews)
- Comparación visual con colores

### **4. Reportes**
- **Resumen General**: Estadísticas + gráficos
- **Historial de Precios**: Evolución de precios (30 días)
- **Análisis de Ventas**: Estimaciones de ventas e ingresos
- **Comparación Top 10**: Productos más caros
- Exportación a CSV de todos los reportes

### **5. Sistema de Alertas**
- **4 tipos de alertas**:
  - 🔻 Bajada de precio (con umbral personalizable)
  - 🔺 Subida de precio (con umbral personalizable)
  - ✅ Disponible en stock
  - ❌ Sin stock
- Activar/Desactivar alertas individualmente
- Edición inline de umbrales de precio
- Notificaciones de alertas disparadas en las últimas 24h
- Auto-refresh cada 30 segundos
- Historial de cuándo se disparó cada alerta

### **6. Simulador de Precios**
- Actualización automática cada 2 minutos
- Cambio aleatorio de precios (+/- 15%)
- Revisión automática de alertas después de cada actualización
- Almacenamiento en historial de precios (MongoDB)
- Logs visibles en consola del contenedor

### **7. Panel de Administración**
- Gestión completa de productos (CRUD)
- Actualización masiva de precios
- Solo accesible para usuarios con role='admin'

### **8. Sistema Multiidioma**
- 3 idiomas: Español, Euskera, English
- Selector modal con banderas e iconos
- Cambio dinámico sin recargar página
- Persistencia en localStorage
- Todas las páginas y componentes traducidos

### **9. Autenticación y Registro**
- Sistema de registro con validación de contraseñas
- Login con JWT tokens (válidos por 7 días)
- Protección de rutas según rol (user/admin)
- Hashing de contraseñas con bcrypt
- Context API para gestión de estado global

---

## 🛑 Detener los Servicios
```bash
# Detener todos los contenedores
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA LOS DATOS)
docker-compose down -v
```

---

## 🔧 Comandos Útiles
```bash
# Reconstruir un servicio específico
docker-compose up -d --build frontend

# Reconstruir todo sin caché
docker-compose build --no-cache
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f price-simulator

# Acceder a PostgreSQL
docker exec -it smartshop-postgres psql -U admin -d smartshop

# Acceder a MongoDB
docker exec -it smartshop-mongodb mongosh smartshop

# Acceder a un contenedor
docker exec -it smartshop-analytics bash

# Reiniciar un servicio
docker-compose restart analytics

# Ver estado de todos los servicios
docker-compose ps
```

---

## 📝 Notas Importantes

- **Primera ejecución:** Los productos de ejemplo se insertan automáticamente al iniciar el servicio `data-ingestion`
- **Precios:** El simulador comienza a actualizar precios 2 minutos después de levantar los servicios
- **Alertas:** Se revisan automáticamente cada vez que el simulador actualiza precios
- **Datos persistentes:** Los datos se guardan en volúmenes de Docker. Para borrarlos usa `docker-compose down -v`
- **Desarrollo:** Puedes editar el código y reconstruir solo el servicio afectado con `--build`

---

## 👥 Autores

- Daniel Bravo - Ingeniería Informática - Universidad del País Vasco
