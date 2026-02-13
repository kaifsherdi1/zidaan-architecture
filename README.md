# Real Estate Management Platform

A comprehensive full-stack solution for managing real estate properties, agents, bookings, and transactions.

## Overview

This platform consists of three main applications:
1.  **User App (`frontend-user`)**: A public-facing portal for customers to browse properties, view details, and book viewings. Built with React, Tailwind, and Framer Motion.
2.  **Admin Dashboard (`frontend-dashboard`)**: A management interface for admins and agents to handle properties, users, bookings, and transactions. Built with React and Recharts.
3.  **Backend (`backend`)**: A robust REST API powered by Laravel, handling authentication, data management, emails, and PDF generation.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Axios.
-   **Backend**: Laravel 10, MySQL, Redis.
-   **Tools**: Swagger (API Docs), Recharts (Analytics), DomPDF (Invoicing).

## Quick Start

### Prerequisites
-   Node.js (v18+) & NPM
-   PHP (v8.1+) & Composer
-   MySQL Server
-   Redis Server

### 1. Setup Backend
```bash
cd backend
cp .env.example .env  # Configure DB and Redis credentials
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Setup User App
```bash
cd frontend-user
npm install
npm run dev
```

### 3. Setup Admin Dashboard
```bash
cd frontend-dashboard
npm install
npm run dev
```

## Documentation

Detailed guides for each component:
-   [Backend Guide](./backend/README.md)
-   [User App Guide](./frontend-user/README.md)
-   [Admin Dashboard Guide](./frontend-dashboard/README.md)
-   [API Documentation](http://localhost:8000/api/documentation) (Swagger)

##  Key Features

-   **Role-Based Access**: Distinct flows for Admins, Agents, and Users.
-   **Booking System**: Complete workflow from request to approval.
-   **Financials**: Transaction tracking with auto-generated PDF invoices.
-   **Animations**: Premium feel with GSAP and Framer Motion.
