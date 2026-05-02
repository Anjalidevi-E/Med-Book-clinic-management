# 🏥 MedBook – Doctor Appointment Booking System

A full-stack clinic management system built with React, Node.js/Express, and MongoDB.

---

## 📁 Project Structure

```
doctor-booking/
├── backend/                   # Node.js + Express REST API
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   └── appointmentRoutes.js
│   ├── seed.js                # Sample data seeder
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env                   # Environment config
│
└── frontend/                  # React SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.js
    │   │   ├── Modal.js
    │   │   ├── Toast.js
    │   │   ├── ProtectedRoute.js
    │   │   ├── FormComponents.js
    │   │   ├── PatientForm.js
    │   │   └── AppointmentForm.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── hooks/
    │   │   └── useToast.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── PatientsPage.js
    │   │   └── AppointmentsPage.js
    │   ├── utils/
    │   │   └── api.js         # Axios API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .env
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn**

---

## 🚀 Setup Instructions

### 1. Clone / extract the project

```bash
cd doctor-booking
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure environment:**

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/doctor_booking
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

> For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

**Seed the database with sample data:**

```bash
npm run seed
```

This creates:
- 1 admin user: `admin@clinic.com` / `admin123`
- 5 sample patients
- 5 sample appointments

**Start the backend:**

```bash
npm run dev       # development (with nodemon)
# or
npm start         # production
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

**Configure environment:**

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start the frontend:**

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Login Credentials

| Email              | Password  | Role  |
|--------------------|-----------|-------|
| admin@clinic.com   | admin123  | admin |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register new user   |
| POST   | /api/auth/login     | Login               |
| GET    | /api/auth/me        | Get current user    |

### Patients
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | /api/patients       | List all (search, filter, paginate) |
| POST   | /api/patients       | Create patient           |
| GET    | /api/patients/:id   | Get single patient       |
| PUT    | /api/patients/:id   | Update patient           |
| DELETE | /api/patients/:id   | Soft-delete patient      |

### Appointments
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | /api/appointments                     | List all (search, filter)    |
| POST   | /api/appointments                     | Book appointment             |
| GET    | /api/appointments/:id                 | Get single appointment       |
| PUT    | /api/appointments/:id                 | Update appointment           |
| DELETE | /api/appointments/:id                 | Delete appointment           |
| PATCH  | /api/appointments/:id/cancel          | Cancel appointment           |
| GET    | /api/appointments/patient/:patientId  | Get by patient               |
| GET    | /api/appointments/stats/dashboard     | Dashboard statistics         |

---

## ✅ Features

- **JWT Authentication** — login/logout with protected routes
- **Patient CRUD** — add, view, edit, soft-delete patients
- **Appointment CRUD** — book, update, cancel, delete appointments
- **Double-booking prevention** — same doctor cannot be booked twice at the same time
- **Search & filter** — by name, status, date, gender
- **Pagination** — server-side for both patients and appointments
- **Dashboard stats** — live counts and upcoming appointments
- **Toast notifications** — success/error/warning feedback
- **MVC architecture** — models, controllers, routes separated cleanly
- **Global error handling** — consistent error responses across all endpoints

---

## 🧪 Sample API Calls (curl)

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'

# Get all patients (with token)
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Book an appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": "PATIENT_ID",
    "doctorName": "Dr. John Smith",
    "specialty": "Cardiology",
    "date": "2026-05-10",
    "time": "10:00",
    "reason": "Chest pain evaluation",
    "fee": 500
  }'
```

---

## 🛠️ Key Design Decisions

1. **Soft delete for patients** — deactivates record instead of hard delete, preserving appointment history
2. **Double-booking guard** — Mongoose `pre('save')` middleware checks for same doctor/date/time conflicts
3. **JWT on all routes** — every API endpoint (except auth) requires a valid token
4. **Populate on appointments** — patient details are populated server-side to avoid N+1 queries
5. **Pagination server-side** — scalable from day one; frontend only renders current page
6. **Separate frontend .env** — `REACT_APP_API_URL` makes it easy to point to staging/production

---

## 📦 Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React 18, React Router 6, Axios |
| Backend   | Node.js, Express.js     |
| Database  | MongoDB + Mongoose ODM  |
| Auth      | JWT + bcryptjs          |
| Logging   | Morgan                  |
