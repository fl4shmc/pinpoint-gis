# Pinpoint GIS

Pinpoint GIS is a full-stack geospatial web application for authenticated location management.  
Users can register/login, browse map markers, filter by category, add new locations, and mark favorites.

## Tech Stack

- Frontend: React + TypeScript, Vite, React Router, Axios, React-Leaflet
- Backend: ASP.NET Core Web API (.NET 10), JWT Authentication, EF Core
- Database: PostgreSQL 15 + PostGIS image (containerized)
- Infra: Docker, Docker Compose, Nginx (frontend container)
- Testing: xUnit (backend), Jest + Testing Library (frontend)

## Core Features

- User registration and login with JWT token issuance
- Protected location APIs
- Interactive map (OpenStreetMap tiles + marker popups)
- Sidebar/list and map selection synchronization
- Category-based filtering (`All`, `Commercial`, `Residential`)
- Create location with validation (name, description, lat/lng, category, status)
- Per-user favorite toggling for locations
- Startup migration + seed flow for initial data

## Architecture

### Backend (`backend/PinpointGis.Api`)

- Layered architecture:
  - `Controllers`: HTTP endpoints and request/response orchestration
  - `Services`: application/business logic (`AuthService`, `LocationService`)
  - `Repositories`: data access abstractions over EF Core
  - `Data`: `AppDbContext`, migrations, seed/init services
  - `Contracts`: API DTOs and validation attributes
  - `Models`: persistence entities
- Dependency Injection is used throughout (`Program.cs`) with interface-driven services/repositories.
- Authentication/authorization pattern:
  - JWT Bearer middleware validates tokens
  - `[Authorize]` guards protected controllers
  - user id is read from claims for per-user operations (favorites)
- Database initialization pattern:
  - retry-aware startup initialization
  - migration baseline compatibility handling for legacy DB state
  - automatic EF migrations + seed locations on boot

### Frontend (`frontend/src`)

- Feature-oriented structure:
  - `features/auth`: auth context/provider, route guard, API/auth storage
  - `features/locations`: map, sidebar, details panel, forms, hooks, feature API
  - `pages`: route-level screens (`LoginPage`, `RegisterPage`, `MapPage`)
  - `services`: shared API client + environment config
- Patterns in use:
  - Context pattern for authentication session state (`AuthProvider`)
  - Custom hooks for UI/business flow decomposition (`useLocations`, `useCreateLocation`, `useToggleFavorite`, `useLocationSelection`)
  - Service abstraction for HTTP clients (`apiClient`, feature APIs)
- SPA routing with protected route wrapper (`RequireAuth`).

### Database

- Engine: PostgreSQL (via PostGIS image)
- Main tables:
  - `Users`
  - `Locations`
  - `FavoriteLocations` (unique user/location pair for favorites)
- EF Core manages schema changes (`Data/Migrations`) and runtime migration application.
- Seed data is added only when the `Locations` table is empty.

## Repository Structure

```text
backend/
  PinpointGis.Api/
    Configuration/
    Contracts/
    Controllers/
    Data/
    Extensions/
    Mappers/
    Models/
    Repositories/
    Services/
  PinpointGis.Tests/
frontend/
  src/
    components/
    features/
    pages/
    services/
docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker Desktop (recommended path)
- Or local toolchain:
  - .NET SDK 10
  - Node.js 22+
  - PostgreSQL 15+

## Run with Docker (Recommended)

From the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8080](http://localhost:8080)
- Database: `localhost:5432`

The compose setup wires backend and database automatically and builds the frontend with `VITE_API_BASE_URL=http://localhost:8080/api`.

## Run Locally (Without Full Docker)

### 1) Start database

Use local PostgreSQL or run only DB via Docker:

```bash
docker compose up -d database
```

### 2) Start backend

```bash
dotnet run --project backend/PinpointGis.Api
```

Default dev URL from launch settings: `http://localhost:5185`.

### 3) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Set API base URL for local frontend if needed:

```bash
# Windows PowerShell
$env:VITE_API_BASE_URL="http://localhost:5185/api"
```

## Configuration

Key backend settings:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key`
- `Jwt__ExpirationMinutes`

Key frontend setting:

- `VITE_API_BASE_URL`

`docker-compose.yml` already provides working defaults for local development.

## API Reference

Base URL: `/api`

- `POST /auth/register` - create user and return JWT
- `POST /auth/login` - authenticate and return JWT
- `GET /locations` - list locations with `isFavorite` (requires JWT)
- `POST /locations` - create location (requires JWT)
- `POST /locations/{id}/favorite` - set favorite status (requires JWT)

## Migrations and Data Seeding

- Migrations are stored in `backend/PinpointGis.Api/Data/Migrations`.
- Startup flow applies pending migrations automatically.
- Seed locations are inserted only when no locations exist.
- Create a new migration:

```bash
dotnet ef migrations add <MigrationName> --project backend/PinpointGis.Api --output-dir Data/Migrations
```

## Testing

Backend:

```bash
dotnet test backend/PinpointGis.Tests
```

Frontend:

```bash
cd frontend
npm test
```

## Notes

- Passwords are hashed using `IPasswordHasher<UserAccount>`.
- Auth token and user email are stored in browser local storage.
- Current CORS configuration is permissive (`AllowAnyOrigin/AllowAnyHeader/AllowAnyMethod`) for development convenience.
- Frontend production image is served through Nginx with SPA fallback (`try_files ... /index.html`).
