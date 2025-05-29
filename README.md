# Banrimkwae Resort Management System

A comprehensive resort management system built with Laravel backend and React frontend.

## Project Structure

```
├── backend/           # Laravel 12+ API backend
├── frontend/          # React 18+ TypeScript frontend
├── docs/              # Project documentation
├── config/            # Configuration files
└── database/          # Database files and backups
```

## Quick Start

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```

## Development Servers

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3001

## Tech Stack

### Backend
- Laravel 12+
- MariaDB Database
- Laravel Sanctum (Authentication)
- Spatie Laravel Permission (Role Management)
- Spatie Laravel ActivityLog (Activity Logging)
- Maatwebsite Excel (Export/Import)

### Frontend
- React 18+
- TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Query (Data Fetching)
- React Router (Routing)
- React Hook Form (Forms)
- Headless UI (Components)

## Project Status

- ✅ **Phase 1 Issue #01**: Project Setup and Infrastructure - **COMPLETED**
- 🚧 **Phase 1 Issue #02**: Authentication System - In Progress
- ⏳ **Phase 1 Issue #03**: Database Schema Design - Pending
- ⏳ **Phase 1 Issue #04**: Design System Implementation - Pending

## Documentation

See the `docs/` folder for detailed documentation on each phase of development.
