# 🏥 CareSync — Microservices Healthcare Appointment System

A production-ready, microservices-based healthcare appointment management system built with:
- **React** (Frontend)
- **Node.js + Express** (Backend Services)
- **MongoDB** (Isolated per service)
- **Docker + Docker Compose** (Containerization & Orchestration)

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CareSync
```

### 2. Configure Environment Variables

The `.env` file at the root is pre-configured for Docker Compose. Review and update secrets:

```bash
# Edit root .env (especially JWT_SECRET)
nano .env
```

> ⚠️ **Important**: Change `JWT_SECRET` to a strong random value before deploying.

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

That's it! The following services will be available:

| Service              | URL                         |
|----------------------|-----------------------------|
| 🌐 Frontend          | http://localhost:3000        |
| 🔐 Auth Service      | http://localhost:4001        |
| 🏥 Patient Service   | http://localhost:4002        |
| 👨‍⚕️ Doctor Service   | http://localhost:4003        |
| 📅 Appointment Service | http://localhost:4004      |

### 4. Stop Services

```bash
docker-compose down

# Remove volumes (clears all data):
docker-compose down -v
```

---

## 🏗️ Architecture Design

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CareSync System                          │
│                                                                 │
│  ┌──────────────┐    REST API calls (Axios)                    │
│  │   Frontend   │──────────────────────────────┐               │
│  │   (React)    │                              │               │
│  │   Port 3000  │                              │               │
│  └──────────────┘                              ▼               │
│         │              ┌─────────────────────────────────┐     │
│         │              │      API Layer (Services)        │     │
│         │              │                                  │     │
│         │              │ ┌──────────┐  ┌──────────────┐  │     │
│         └──────────────▶ │   Auth   │  │   Patient    │  │     │
│                       │  │ :4001    │  │   :4002      │  │     │
│                       │  └────┬─────┘  └──────┬───────┘  │     │
│                       │       │ JWT            │          │     │
│                       │       │ Validation     │          │     │
│                       │  ┌────▼─────┐  ┌──────▼───────┐  │     │
│                       │  │  Doctor  │  │ Appointment  │  │     │
│                       │  │  :4003   │◀─│   :4004      │  │     │
│                       │  └──────────┘  └──────────────┘  │     │
│                       └─────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  MongoDB Layer (Isolated)             │      │
│  │  ┌───────────┐ ┌────────────┐ ┌──────────┐ ┌──────┐ │      │
│  │  │ mongo-auth│ │mongo-patient│ │mongo-doc │ │mongo │ │      │
│  │  │           │ │            │ │          │ │-appt │ │      │
│  │  └───────────┘ └────────────┘ └──────────┘ └──────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| `frontend` | 3000 | — | React SPA served via nginx |
| `auth-service` | 4001 | `mongo-auth` | JWT register/login, token validation |
| `patient-service` | 4002 | `mongo-patient` | Patient profile CRUD |
| `doctor-service` | 4003 | `mongo-doctor` | Doctor management |
| `appointment-service` | 4004 | `mongo-appointment` | Booking, inter-service validation |

### Database Isolation

Each service has its **own dedicated MongoDB container**. No service can access another service's database. Communication between services happens **only through REST APIs**.

```
auth-service      → mongo-auth      (auth-db)
patient-service   → mongo-patient   (patient-db)
doctor-service    → mongo-doctor    (doctor-db)
appointment-service → mongo-appointment (appointment-db)
```

---

## 🔄 Traffic Flow

### Login Flow

```
1. User submits email + password on Frontend
2. Frontend → POST /api/auth/login (Auth Service :4001)
3. Auth Service validates credentials against mongo-auth
4. Auth Service generates JWT token and returns it
5. Frontend stores token in localStorage
6. All subsequent requests include "Authorization: Bearer <token>"
```

### Appointment Booking Flow

```
1. User selects a doctor and submits appointment form on Frontend
2. Frontend → POST /api/appointments (Appointment Service :4004)
   Headers: { Authorization: Bearer <token> }
   Body: { doctorId, appointmentDate, timeSlot, reason }

3. Appointment Service → GET /api/auth/validate (Auth Service :4001)
   Validates the JWT token and retrieves user details

4. Appointment Service → GET /api/doctors/:id (Doctor Service :4003)
   Validates that the selected doctor exists

5. Appointment Service saves appointment to mongo-appointment
6. Success response returned to Frontend
7. Frontend redirects to /appointments page
```

---

## 📁 Project Structure

```
CareSync/
├── docker-compose.yml          # Orchestrates all 9 containers
├── .env                        # Root environment variables
├── .env.example                # Template for environment variables
├── README.md                   # This file
│
├── frontend/                   # React SPA
│   ├── Dockerfile              # Multi-stage: Node build + nginx serve
│   ├── nginx.conf              # SPA routing + caching + security headers
│   ├── .env / .env.example
│   └── src/
│       ├── api/index.js        # Centralized Axios API layer
│       ├── context/AuthContext.jsx
│       ├── components/Navbar.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── DoctorsPage.jsx
│           ├── BookAppointmentPage.jsx
│           └── AppointmentsPage.jsx
│
└── services/
    ├── auth-service/           # JWT authentication
    │   ├── Dockerfile          # Multi-stage, non-root user
    │   ├── .env / .env.example
    │   └── src/
    │       ├── server.js
    │       ├── config/db.js
    │       ├── models/User.js
    │       ├── routes/authRoutes.js
    │       └── controllers/authController.js
    │
    ├── patient-service/        # Patient profile management
    │   └── src/
    │       ├── models/Patient.js
    │       ├── middleware/authMiddleware.js
    │       └── controllers/patientController.js
    │
    ├── doctor-service/         # Doctor directory
    │   └── src/
    │       ├── models/Doctor.js
    │       └── controllers/doctorController.js
    │
    └── appointment-service/    # Booking + inter-service communication
        └── src/
            ├── models/Appointment.js
            ├── services/interService.js   ← Axios calls to Auth + Doctor
            └── controllers/appointmentController.js
```

---

## 🔐 API Reference

### Auth Service (`:4001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/validate` | Validate JWT (inter-service) |
| GET | `/health` | Health check |

### Patient Service (`:4002`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/patients` | ✅ | Create profile |
| GET | `/api/patients/me` | ✅ | Get my profile |
| GET | `/api/patients/:id` | ❌ | Get by ID (internal) |

### Doctor Service (`:4003`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/doctors` | ✅ | Add doctor |
| GET | `/api/doctors` | ❌ | List doctors |
| GET | `/api/doctors/:id` | ❌ | Get doctor |

### Appointment Service (`:4004`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/appointments` | ✅ | Book appointment |
| GET | `/api/appointments/me` | ✅ | My appointments |
| GET | `/api/appointments/all` | ✅ Admin | All appointments |
| PATCH | `/api/appointments/:id/cancel` | ✅ | Cancel |

---

## 🐳 Docker Details

- All services use **multi-stage builds** (builder + production stages)
- All services run as **non-root users** (`appuser`)
- Base image: `node:20-alpine` (minimal footprint)
- Frontend served via `nginx:1.25-alpine`
- MongoDB `7` with named volumes for persistence
- All services communicate over the `caresync-net` bridge network

---

## 🚀 Kubernetes & CI/CD Ready

- Each service has its own `Dockerfile` — independent deployment
- All configuration via environment variables — Kubernetes ConfigMaps/Secrets ready
- No hardcoded values anywhere
- Stateless application servers — horizontal scaling ready
- Health check endpoints (`/health`) on every service — readiness/liveness probe ready

---

## 🛠️ Development (without Docker)

```bash
# Start each service individually
cd services/auth-service && npm install && npm run dev
cd services/patient-service && npm install && npm run dev
cd services/doctor-service && npm install && npm run dev
cd services/appointment-service && npm install && npm run dev
cd frontend && npm install && npm start
```

Update `.env` files to use `localhost` MongoDB URIs when running locally without Docker.

---

## 🔒 Security Considerations

- JWT tokens expire (configurable via `JWT_EXPIRES_IN`)
- Passwords hashed with bcrypt (10 rounds)
- Security headers in nginx (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Non-root Docker containers
- No secrets hardcoded anywhere

---

*Built with ❤️ as a production-ready microservices reference architecture.*
