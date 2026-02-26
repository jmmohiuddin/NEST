# NEEST — National Entrepreneurship Ecosystem Support Tool

A full-stack MERN web application that connects startups, mentors, students, and administrators within a university-level entrepreneurship ecosystem.

![NEEST](https://img.shields.io/badge/Stack-MERN-blue) ![PWA](https://img.shields.io/badge/PWA-Enabled-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 Features

- **Startup Directory** — Browse, search, and filter startups by industry, stage, and more
- **Mentor Directory** — Find mentors by specialization, availability, and rating
- **Events Module** — Discover bootcamps, hackathons, seminars; register and manage your events
- **Resource Booking** — Book meeting rooms, workspaces, equipment, and mentor sessions
- **Intelligent Matchmaking** — AI-weighted scoring to match startups with ideal mentors
- **Admin Panel** — Full dashboard with analytics, user management, and approval workflows
- **Role-Based Access** — Four roles: Student, Startup Founder, Mentor, Admin
- **JWT Authentication** — Secure auth with token-based sessions
- **PWA Support** — Installable, offline-capable progressive web app
- **Responsive Design** — Mobile-first with Tailwind CSS

---

## 🏗️ Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion   |
| Backend    | Node.js, Express.js                           |
| Database   | MongoDB, Mongoose                             |
| Auth       | JWT, bcrypt                                   |
| Charts     | Recharts                                      |
| PWA        | vite-plugin-pwa, Workbox                      |

---

## 📁 Project Structure

```
NEEST/
├── client/                   # React Frontend
│   ├── public/               # Static assets & PWA icons
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── common/       # Navbar, Footer, Sidebar, Modal, etc.
│       │   └── layouts/      # PublicLayout, DashboardLayout
│       ├── context/          # AuthContext (global auth state)
│       ├── pages/
│       │   ├── public/       # Home, Startup/Mentor dirs, Events, Auth
│       │   └── protected/    # Dashboard, Profile, Admin, Bookings
│       ├── services/         # Axios API service layer
│       ├── App.jsx           # Router configuration
│       └── main.jsx          # Entry point
│
├── server/                   # Express Backend
│   ├── config/               # Database connection
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth, roles, rate limiting, upload
│   ├── models/               # Mongoose schemas (7 models)
│   ├── routes/               # API route definitions
│   ├── seed/                 # Database seeder
│   └── services/             # Matchmaking & notification services
│
└── package.json              # Root scripts
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18
- **MongoDB** ≥ 6 (local or Atlas)
- **npm** or **yarn**

---

## 🛠️ Getting Started

### 1. Clone & Install

```bash
git clone <repo-url> NEEST
cd NEEST

# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/neest
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database (Optional)

```bash
cd server
node seed/seed.js
```

This creates sample users, startups, mentors, and events. Test accounts will be printed to the console.

### 4. Run Development Servers

```bash
# From root directory — starts both servers concurrently
npm run dev
```

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:5000        |
| API Base | http://localhost:5000/api    |

---

## 🧪 Test Accounts (after seeding)

| Role            | Email                | Password     |
| --------------- | -------------------- | ------------ |
| Admin           | admin@neest.in       | Admin@123    |
| Startup Founder | aarav@startup.com    | Founder@123  |
| Startup Founder | priya@startup.com    | Founder@123  |
| Mentor          | rajesh@mentor.com    | Mentor@123   |
| Mentor          | sneha@mentor.com     | Mentor@123   |
| Student         | vikram@student.com   | Student@123  |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | /api/auth/register   | Register new user    |
| POST   | /api/auth/login      | Login & get token    |
| GET    | /api/auth/me         | Get current user     |
| PUT    | /api/auth/profile    | Update profile       |

### Startups
| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | /api/startups            | List (search/filter)     |
| POST   | /api/startups            | Create (founder only)    |
| GET    | /api/startups/:id        | Get by ID or slug        |
| PUT    | /api/startups/:id        | Update (owner/admin)     |
| GET    | /api/startups/me/startup | Get my startup           |

### Mentors
| Method | Endpoint                 | Description              |
| ------ | ------------------------ | ------------------------ |
| GET    | /api/mentors             | List (search/filter)     |
| POST   | /api/mentors             | Create profile           |
| GET    | /api/mentors/:id         | Get mentor               |
| PUT    | /api/mentors/profile     | Update my profile        |
| POST   | /api/mentors/:id/rate    | Rate a mentor            |

### Events
| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | /api/events                 | List events            |
| POST   | /api/events                 | Create event           |
| POST   | /api/events/:id/register    | Register for event     |
| DELETE | /api/events/:id/register    | Cancel registration    |
| GET    | /api/events/my/registered   | My registrations       |

### Admin
| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | /api/admin/dashboard          | Dashboard stats       |
| GET    | /api/admin/analytics          | Platform analytics    |
| GET    | /api/admin/users              | All users             |
| GET    | /api/admin/pending            | Pending approvals     |
| PUT    | /api/admin/startups/:id/status| Update startup status |
| PUT    | /api/admin/mentors/:id/status | Update mentor status  |

### Matchmaking
| Method | Endpoint                                    | Description       |
| ------ | ------------------------------------------- | ----------------- |
| GET    | /api/matchmaking/startup/:id/mentor-matches | Mentor matches    |
| GET    | /api/matchmaking/mentor/:id/startup-matches | Startup matches   |

---

## 🚢 Production Deployment

### Build Frontend
```bash
cd client
npm run build
```

The `dist/` folder is served by Express automatically in production mode.

### Run in Production
```bash
cd server
NODE_ENV=production node server.js
```

### Deployment Checklist
- [ ] Set strong `JWT_SECRET` in production
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Set `CLIENT_URL` to production domain
- [ ] Enable HTTPS
- [ ] Configure rate limiting for production load
- [ ] Set up PM2 or similar process manager
- [ ] Configure environment-specific CORS origins

---

## 📄 License

MIT © NEEST Team
#   N E S T  
 