# 🏥 CareSync — Healthcare Appointment System

> A fully containerised microservices application for managing healthcare appointments between patients and doctors.

---

## 📋 Project Overview

CareSync is a **strict microservices** healthcare appointment system built with:

- **Frontend**: React 18 + React Router v6 (served by nginx)
- **Backend Services**: Node.js + Express.js
- **Databases**: MongoDB (one isolated instance per service)
- **Container Orchestration**: Docker Compose (Phase 1), Kubernetes (Phase 2)

---

## 🧩 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         EC2 / Host Machine                      │
│                                                                 │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐            │
│  │ Frontend │   │ auth-service │   │patient-service│            │
│  │  :3000   │   │    :4001     │   │    :4002      │            │
│  │ (nginx)  │   │  + mongo-auth│   │+mongo-patient │            │
│  └──────────┘   └──────────────┘   └──────────────┘            │
│                                                                 │
│  ┌───────────────────┐   ┌──────────────────────┐              │
│  │  doctor-service   │   │  appointment-service  │              │
│  │      :4003        │   │        :4004          │              │
│  │  + mongo-doctor   │   │  + mongo-appointment  │              │
│  └───────────────────┘   └──────────────────────┘              │
│                                                                 │
│  All services communicate on the `caresync-net` Docker bridge  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Rules:**
- ❌ No API Gateway
- ✅ Each service has its **own MongoDB** instance
- ✅ Inter-service calls use **Docker service names** (e.g. `http://auth-service:4001`)
- ✅ Frontend uses **public EC2 IP** in `REACT_APP_*` env vars (browser makes direct calls)
- ✅ JWT includes `userId`, `role`, and `email`

---

## 👥 Roles

| Role    | Registration | Login | Actions |
|---------|-------------|-------|---------|
| Patient | Self-register | ✅ | View doctors, book appointments, view own appointments |
| Doctor  | Pre-seeded   | ✅ | View assigned appointments, accept/reject |

### Pre-seeded Doctor Accounts

| Name | Email | Password | Specialization |
|------|-------|----------|----------------|
| Dr. Priya Sharma | priya.sharma@caresync.com | Doctor@123 | Cardiologist |
| Dr. Rajesh Kumar | rajesh.kumar@caresync.com | Doctor@123 | Orthopedic Surgeon |
| Dr. Anitha Menon | anitha.menon@caresync.com | Doctor@123 | Dermatologist |
| Dr. Suresh Nair | suresh.nair@caresync.com | Doctor@123 | General Physician |
| Dr. Deepa Pillai | deepa.pillai@caresync.com | Doctor@123 | Pediatrician |
| Dr. Arjun Bose | arjun.bose@caresync.com | Doctor@123 | Neurologist |

---

## 🚀 Setup & Deployment on EC2

### Prerequisites

```bash
# Install Docker & Docker Compose on EC2 (Amazon Linux 2 / Ubuntu)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# Or on Amazon Linux 2:
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose v2
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CareSync-main
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Edit `.env` and replace `<EC2_PUBLIC_IP>` with your EC2 public IP:

```env
REACT_APP_AUTH_URL=http://54.123.45.67:4001
REACT_APP_PATIENT_URL=http://54.123.45.67:4002
REACT_APP_DOCTOR_URL=http://54.123.45.67:4003
REACT_APP_APPOINTMENT_URL=http://54.123.45.67:4004
```

> ⚠️ **Important**: The `REACT_APP_*` vars are baked into the React build at Docker build time.
> They must be the **public EC2 IP** because the browser (running on your laptop/phone) calls these URLs — not the Docker container.

### 3. Open EC2 Security Group Ports

In your AWS Console → EC2 → Security Groups, open inbound TCP for:

| Port | Service |
|------|---------|
| 3000 | Frontend (React) |
| 4001 | Auth Service |
| 4002 | Patient Service |
| 4003 | Doctor Service |
| 4004 | Appointment Service |

### 4. Build and Run

```bash
docker-compose up --build
```

To run in the background:

```bash
docker-compose up --build -d
```

### 5. Access the Application

Open your browser: `http://<EC2_PUBLIC_IP>:3000`

---

## 🗺️ Port Mapping

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| Frontend (nginx) | 80 | 3000 |
| Auth Service | 4001 | 4001 |
| Patient Service | 4002 | 4002 |
| Doctor Service | 4003 | 4003 |
| Appointment Service | 4004 | 4004 |

---

## 🔄 Application Flow

### Patient Booking Flow

```
1. Register  →  POST /api/auth/register  (auth-service)
2. Login     →  POST /api/auth/login     (auth-service)  → JWT token
3. View Doctors → GET /api/doctors        (doctor-service)
4. Book      →  POST /api/appointments   (appointment-service)
               └─ validates JWT via auth-service
               └─ validates doctor via doctor-service
               └─ saves with status: "pending"
5. View Appointments → GET /api/appointments/me (appointment-service)
```

### Doctor Approval Flow

```
1. Login     →  POST /api/auth/login     (auth-service)  → JWT token (role: doctor)
2. View Appointments → GET /api/appointments/doctor/mine (appointment-service)
               └─ validates JWT, resolves doctor profile by email
3. Accept    →  PATCH /api/appointments/:id/accept  → status: "confirmed"
   OR
   Reject    →  PATCH /api/appointments/:id/reject  → status: "rejected"
```

---

## 📡 API Endpoints Reference

### Auth Service (`:4001`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login (patient or doctor) |
| GET | `/api/auth/validate` | Validate JWT (inter-service) |
| GET | `/health` | Health check |

### Patient Service (`:4002`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/patients` | Create patient profile |
| GET | `/api/patients/me` | Get own profile |
| GET | `/health` | Health check |

### Doctor Service (`:4003`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/:id` | Get doctor by ID |
| GET | `/api/doctors/by-email/:email` | Get doctor by email (inter-service) |
| GET | `/health` | Health check |

### Appointment Service (`:4004`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/appointments` | Book appointment (patient) |
| GET | `/api/appointments/me` | Get patient's appointments |
| PATCH | `/api/appointments/:id/cancel` | Cancel appointment (patient) |
| GET | `/api/appointments/doctor/mine` | Get doctor's appointments |
| PATCH | `/api/appointments/:id/accept` | Accept appointment (doctor) |
| PATCH | `/api/appointments/:id/reject` | Reject appointment (doctor) |
| GET | `/health` | Health check |

---

## 🛠️ Useful Commands

```bash
# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f frontend
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Stop and remove volumes (fresh database)
docker-compose down -v

# Rebuild a single service
docker-compose up --build auth-service

# Check health of all containers
docker-compose ps
```

---

## 🔧 Troubleshooting

### Frontend shows blank page / API errors
- Ensure `.env` has correct `REACT_APP_*` with your EC2 public IP
- Rebuild frontend after any `.env` change: `docker-compose up --build frontend`
- Open browser DevTools → Network tab to see which URL is failing

### Services can't connect to MongoDB
- Check MongoDB containers are healthy: `docker-compose ps`
- Services have `restart: unless-stopped` and will retry on failure

### Doctor login not working
- Doctors are seeded on auth-service startup
- Check logs: `docker-compose logs auth-service | grep "Seeded"`

---

## 🗂️ Project Structure

```
CareSync-main/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment variable template
├── frontend/
│   ├── Dockerfile              # Multi-stage: npm ci → nginx
│   ├── nginx.conf              # SPA fallback for React Router
│   └── src/
│       ├── api/index.js        # All API calls (uses REACT_APP_* vars)
│       ├── context/AuthContext.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── DoctorsPage.jsx
│           ├── BookAppointmentPage.jsx
│           ├── AppointmentsPage.jsx
│           └── DoctorDashboardPage.jsx
└── services/
    ├── auth-service/           # Handles auth + doctor account seeding
    ├── patient-service/        # Patient profile management
    ├── doctor-service/         # Doctor profiles + seeding
    └── appointment-service/    # Booking, status management
```

---

## 🔮 Future Scope

### Phase 2 — CI/CD Pipeline

- GitHub Actions workflow for automated build & push to ECR
- Docker image tagging by git commit SHA
- Automated health-check tests post-deploy

### Phase 3 — Kubernetes

- Helm charts for each microservice
- Kubernetes Secrets for JWT and DB credentials  
- HorizontalPodAutoscaler for patient and appointment services
- Ingress controller (nginx) for unified domain routing
- Persistent Volume Claims for MongoDB
- Liveness and Readiness probes (already have `/health` endpoints)

---

## 🔐 Security Notes

- JWT tokens expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- Backend services run as non-root user inside containers
- All passwords are bcrypt-hashed (never stored plain)
- Doctors cannot self-register — accounts are pre-seeded only
- Change `JWT_SECRET` in production to a strong random string

---

*Built with ❤️ — CareSync Microservices v1.0*
