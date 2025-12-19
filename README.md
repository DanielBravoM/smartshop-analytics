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
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)

---

## ✨ Características

- 🔐 **Autenticación JWT** con roles de usuario (admin/user)
- 📊 **Dashboard** con analytics en tiempo real
- 🛍️ **Gestión de Productos** con seguimiento personalizado
- 🔄 **Comparador** de hasta 4 productos simultáneos
- 📈 **Reportes** con 4 tipos diferentes y exportación CSV
- 🔔 **Sistema de Alertas** automáticas (4 tipos)
- 💰 **Simulador de Precios** que actualiza precios cada 2 minutos
- 🌍 **Multiidioma** (Español, Euskera, English)
- 👨‍💼 **Panel de Administración** para gestión de productos
- ⚡ **Auto-refresh** en Dashboard y Alertas

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
```

---

## 🌐 Acceso a la Aplicación

### **4) Acceder a la Parte Cliente:**

Abre tu navegador en: **http://localhost:8080**

### **Usuarios de Prueba:**

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Admin | admin@smartshop.com | admin123 | admin |
| Usuario | user@smartshop.com | user123 | user |

### **Endpoints de la API:**

- Frontend: http://localhost:8080
- API Gateway: http://localhost:3000
- Analytics: http://localhost:4000
- Data Ingestion: http://localhost:5001

---

## 🎯 Funcionalidades

### **1. Dashboard**
- Métricas en tiempo real (productos seguidos, reviews)
- Gráficos de distribución por marketplace y categoría
- Evolución de precios histórica
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
  - 🔻 Bajada de precio (con umbral)
  - 🔺 Subida de precio (con umbral)
  - ✅ Disponible en stock
  - ❌ Sin stock
- Activar/Desactivar alertas
- Edición inline de umbrales
- Notificaciones de alertas disparadas
- Auto-refresh cada 30 segundos

### **6. Simulador de Precios**
- Actualización automática cada 2 minutos
- Cambio aleatorio de precios (+/- 15%)
- Revisión automática de alertas
- Almacenamiento en historial

### **7. Panel de Administración**
- Gestión completa de productos (CRUD)
- Actualización masiva de precios
- Solo accesible para administradores

### **8. Sistema Multiidioma**
- Español, Euskera, English
- Cambio dinámico sin recargar
- Todas las páginas traducidas

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

# Ver logs en tiempo real
docker-compose logs -f price-simulator

# Acceder a un contenedor
docker exec -it smartshop-analytics bash

# Reiniciar un servicio
docker-compose restart analytics
```

---

## 👥 Autores

- Daniel Bravo - Ingeniería Informática - Universidad del País Vasco

---
