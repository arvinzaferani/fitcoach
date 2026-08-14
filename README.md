حتماً. برای **FitCoach** پیشنهاد می‌کنم README بیشتر شبیه معرفی یک محصول واقعی باشه تا صرفاً لیست تکنولوژی‌ها. این نسخه برای GitHub مناسبه و می‌تونی مستقیم جایگزین README فعلی کنی:

# 🏋️ FitCoach

A fitness management platform designed to connect **coaches and athletes**, making it easier to create flexible workout programs, manage training sessions, and track progress over time.

> **Persian-first & RTL** fitness platform built with a modern full-stack architecture.

---

## ✨ Overview

FitCoach provides a complete workflow for **Athletes, Coaches, and Administrators**.

### 🧑‍🏫 Coaches

* Create and manage workout programs
* Define flexible exercises and workout structures
* Configure sets, reps, duration, rest time, and other exercise details
* Assign programs to athletes
* Manage coach–athlete relationships
* Track athlete performance and progress

### 🏃 Athletes

* View assigned workout programs
* Follow daily workouts
* Record completed exercises and sets
* Track body metrics and training progress
* Review their workout history

### 🛠️ Admin Panel

* Manage users
* Manage coaches and athletes
* Manage the platform structure
* Monitor and manage the overall system

---

## 🧩 Flexible Workout System

One of the main focuses of FitCoach is providing a **flexible exercise and workout definition system**.

Instead of forcing coaches into a fixed workout structure, exercises can be configured with different parameters depending on the training requirements.

For example:

* Sets
* Repetitions
* Duration
* Rest time
* Exercise-specific parameters
* Workout ordering
* Custom exercise configurations

This makes the system suitable for different coaching styles and training methodologies.

---

## 🏗️ Architecture

FitCoach is built as a full-stack application with a separated frontend and backend.

```text
┌──────────────────────┐
│      Web Client      │
│   Next.js + React    │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│       Backend        │
│        NestJS        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
│        Prisma        │
└──────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* NestJS
* TypeScript
* Prisma
* PostgreSQL

### Authentication & Authorization

* JWT authentication
* Role-based access control
* Separate Admin, Coach, and Athlete workflows

---

## 📁 Project Structure

```text
fitcoach/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workouts/
│   │   ├── exercises/
│   │   └── ...
│   └── prisma/
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* PostgreSQL

### Clone the repository

```bash
git clone https://github.com/arvinzaferani/fitcoach.git

cd fitcoach
```

### Install dependencies

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

### Environment Variables

Create the required `.env` files based on the provided environment examples.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fitcoach"

JWT_SECRET="your-secret"
```

### Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

### Run the application

Backend:

```bash
npm run start:dev
```

Frontend:

```bash
npm run dev
```

The application should now be available locally.

---

## 🌍 Persian & RTL

FitCoach was designed with a **Persian-first approach**, including RTL layouts and Persian user experience considerations.

Rather than adding RTL support at the end of development, the interface and components were designed with RTL usage in mind from the beginning.

---

## 📸 Screenshots

> Screenshots and product previews will be added here.

### Athlete Dashboard

*Add screenshot here*

### Coach Dashboard

*Add screenshot here*

### Workout Builder

*Add screenshot here*

### Admin Panel

*Add screenshot here*

---

## 🗺️ Roadmap

Some ideas for future iterations:

* [ ] More advanced progress analytics
* [ ] Exercise media library
* [ ] Workout templates
* [ ] Coach–athlete messaging
* [ ] Notifications
* [ ] Mobile/PWA experience
* [ ] More advanced workout customization

---

## 🎯 Project Goals

FitCoach was built as a practical full-stack product to explore:

* Designing a multi-role application
* Building flexible workout data models
* Implementing role-based access control
* Designing coach–athlete workflows
* Building reusable frontend components
* Working with relational data using Prisma and PostgreSQL
* Creating a Persian-first RTL experience

---

## 👨‍💻 Author

**Arvin Zaferani**

Frontend Developer focused on building scalable and user-focused web applications.

* GitHub: [https://github.com/arvinzaferani](https://github.com/arvinzaferani)
* LinkedIn: [https://www.linkedin.com/in/a-zaferani](https://www.linkedin.com/in/a-zaferani)

---

## 📄 License

This project is currently for educational and portfolio purposes.
