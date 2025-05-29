# Issue #01: Project Setup and Infrastructure

## Title
Set up Laravel Backend and React Frontend Infrastructure

## Priority
**Critical** - Must be completed first

## Estimated Time
4-6 hours

## Description
Create the basic project structure with Laravel backend and React frontend, including development environment setup, dependency management, and basic configuration.

## Acceptance Criteria
- [x] Laravel 10+ backend project initialized
- [x] React 18+ with TypeScript frontend project initialized  
- [x] Development environment configured with proper tooling
- [x] Version control setup with proper gitignore
- [x] Basic project documentation updated

## Implementation Details

### Backend Setup (Laravel)
```bash
# Initialize Laravel project
composer create-project laravel/laravel backend
cd backend

# Install required packages
composer require spatie/laravel-permission
composer require spatie/laravel-activitylog
composer require maatwebsite/excel
composer require laravel/sanctum

# Development dependencies
composer require --dev pestphp/pest
composer require --dev pestphp/pest-plugin-laravel
```

### Frontend Setup (React + TypeScript)
```bash
# Initialize React project with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install @tanstack/react-query
npm install react-router-dom
npm install @headlessui/react
npm install @heroicons/react
npm install react-hook-form
npm install @hookform/resolvers
npm install yup
npm install axios
npm install react-hot-toast
npm install @tailwindcss/forms

# Development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npm install -D vitest @testing-library/react
```

### Configuration Files

#### Backend - .env Configuration
```env
APP_NAME="Banrimkwae Resort Management"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=banrimkwae_resort
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DRIVER=database
```

#### Frontend - vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

#### Frontend - tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'resort-blue': '#2E86AB',
        'forest-green': '#A23B72',
        'warm-orange': '#F18F01',
        'sunset-red': '#C73E1D',
        'dark-charcoal': '#2D3748',
        'medium-gray': '#4A5568',
        'light-gray': '#E2E8F0',
        'off-white': '#F7FAFC',
      },
      fontFamily: {
        'sans': ['Inter', 'Arial', 'sans-serif'],
        'thai': ['Sarabun', 'Arial Unicode MS', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

## Testing Criteria
- Laravel serves successfully on localhost:8000
- React application serves successfully on localhost:3000
- All dependencies install without errors
- Basic routing works in both applications

## Dependencies
None (First task)

## Related Issues
- #02: Authentication System
- #03: Database Schema Design
- #04: Design System Implementation

## Files to Create/Modify
- `backend/` - Laravel project structure
- `frontend/` - React project structure
- `README.md` - Project documentation
- `.gitignore` - Version control exclusions
