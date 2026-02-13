# Admin Dashboard App

The management interface for Admins and Agents.

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create `.env` file:
    ```ini
    VITE_API_BASE_URL=http://localhost:8000/api
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5174` (port may vary).

## 📊 Features & Tech

-   **Framework**: React + Vite
-   **Charts**: Recharts (Revenue, Property Distribution).
-   **Data Management**: Tables with sorting, filtering, and pagination.
-   **RBAC**: Sidebar and Routes protected by user role (Admin vs Agent).

## 📂 Structure

-   `src/layouts`: `DefaultLayout` (Sidebar + Header) vs `GuestLayout` (Login).
-   `src/views`: Dashboard pages (Properties, Bookings, Users).
-   `src/components`: UI components (Sidebar, KPI Cards).
