# Spanish MMA - Frontend

> Base de datos y portal informativo del panorama de las Artes Marciales Mixtas (MMA) en España.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat&logo=tailwind-css)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel)

## Descripción

Spanish MMA es una plataforma completa que centraliza información sobre el panorama del MMA en España. El proyecto incluye listados de peleadores, promotoras, eventos y noticias, junto con un panel de administración para la gestión de contenidos.

## Características

### Público
- Listado y búsqueda de peleadores con estadísticas y récords
- Directorio de promotoras de MMA
- Calendario y detalles de eventos
- Sección de noticias
- Perfiles detallados con biografía e historial de combates

### Administración
- Panel de gestión protegido con autenticación JWT
- CRUD completo de peleadores, promotoras, eventos y noticias
- Gestión de imágenes y contenido multimedia
- Interfaz responsive para desktop y móvil

## Tech Stack

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Estilos | Tailwind CSS 3.4 |
| Routing | React Router DOM 7 |
| HTTP Client | Axios |
| Analytics | React GA4 |
| SEO | React Helmet Async |
| Iconos | React Icons |

## Estructura del Proyecto

```
src/
├── admin/              # Panel de administración
│   ├── AdminLayout.jsx
│   ├── AdminFighters.jsx
│   ├── AdminCompanies.jsx
│   ├── AdminEvents.jsx
│   └── AdminNews.jsx
├── components/         # Componentes de la app
│   ├── Layout.jsx
│   ├── Header.jsx
│   ├── HomePage.jsx
│   ├── FighterList.jsx
│   ├── FighterDetail.jsx
│   ├── CompanyList.jsx
│   ├── CompanyDetail.jsx
│   ├── EventList.jsx
│   ├── EventDetail.jsx
│   ├── NewsDetail.jsx
│   ├── Login.jsx
│   ├── ProtectedRoute.jsx
│   └── *FormModal.jsx
├── hooks/              # Custom hooks
│   ├── useAuth.js
│   ├── useFetchFighters.js
│   ├── useFetchEvents.js
│   ├── useFetchCompanies.js
│   └── useFetchNews.js
├── services/           # Capa de servicios
│   └── api.js
├── utils/              # Utilidades compartidas
│   └── helpers.js
├── App.jsx             # Configuración de rutas
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales y custom CSS
```

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_BACKEND_URL=http://localhost:3001
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | URL del backend API | `http://localhost:3001` |

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/dvaldi7/Spanish-MMA-frontend.git
cd Spanish-MMA-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con hot reload |
| `npm run build` | Compila el proyecto para producción |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta el linter ESLint |

## Rutas

### Rutas Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Página principal |
| `/peleadores` | Listado de luchadores |
| `/peleadores/:slug` | Perfil de luchador |
| `/promotoras` | Listado de promotoras |
| `/promotoras/:slug` | Detalle de promotora |
| `/eventos` | Listado de eventos |
| `/eventos/:slug` | Detalle de evento |
| `/news/:slug` | Detalle de noticia |
| `/login` | Página de login |

### Rutas de Administración
| Ruta | Descripción |
|------|-------------|
| `/admin` | Panel principal (Noticias) |
| `/admin/fighters` | Gestión de peleadores |
| `/admin/companies` | Gestión de promotoras |
| `/admin/events` | Gestión de eventos |
| `/admin/news` | Gestión de noticias |

## Arquitectura

### Autenticación
El sistema utiliza tokens JWT almacenados en `localStorage`. El hook `useAuth` gestiona el estado de sesión y la verificación del token. Las rutas protegidas se manejan mediante el componente `ProtectedRoute`.

### Fetching de Datos
Los datos se obtienen a través de custom hooks (`useFetchFighters`, `useFetchEvents`, etc.) que encapsulan la lógica de paginación, búsqueda y manejo de estados (loading, error).

### API Client
El cliente de Axios (`src/services/api.js`) incluye:
- Interceptor de requests para inyección automática del token JWT
- Interceptor de responses para manejo de sesiones expiradas (401)

## SEO

El proyecto implementa SEO on-page mediante `react-helmet-async`:
- Títulos dinámicos por página
- Meta descriptions optimizadas
- Open Graph para redes sociales
- Keywords relevantes

## Deploy

El proyecto está configurado para despliegue en Vercel. El archivo `vercel.json` contiene la configuración de rutas para SPA.

## Licencia

Proyecto de código abierto desarrollado como parte del programa académico de ILERNA.
