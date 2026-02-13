# User Frontend App

The public-facing portal for the Real Estate Platform.

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
    Access at `http://localhost:5173`.

## 🎨 Features & Tech

-   **Framework**: React + Vite
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion (Page transitions, Hero reveal) + GSAP (Scroll triggers).
-   **State Management**: React Context (`ContextProvider.jsx`).
-   **Routing**: React Router DOM with `AnimatePresence`.

## 📂 Structure

-   `src/pages`: Main view components (Home, Properties, etc.).
-   `src/components`: Reusable UI elements (Navbar, PropertyCard).
-   `src/hooks`: Custom logic (e.g., `useScrollAnimation`).
-   `src/axios-client.js`: Configured Axios instance with interceptors.
