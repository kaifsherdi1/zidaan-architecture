# Real Estate Backend API

The core API service for the Real Estate Platform, built with Laravel.

## ⚙️ Setup & Installation

1.  **Install Dependencies**
    ```bash
    composer install
    ```

2.  **Environment Configuration**
    Copy `.env.example` to `.env` and configure:
    ```ini
    DB_DATABASE=real_estate
    DB_USERNAME=root
    DB_PASSWORD=
    
    REDIS_HOST=127.0.0.1
    
    FILESYSTEM_DISK=public
    ```

3.  **Database & Seeding**
    ```bash
    php artisan migrate --seed
    ```
    *Seeds default users:*
    -   Admin: `admin@example.com` / `password`
    -   Agent: `agent@example.com` / `password`
    -   User: `user@example.com` / `password`

4.  **Run Application**
    ```bash
    php artisan serve
    ```
    API will be available at `http://localhost:8000`.

5.  **Run Queue Worker (Email/PDFs)**
    ```bash
    php artisan queue:work
    ```

## 📖 API Documentation

We use **Swagger/OpenAPI** for documentation.
-   Access the UI at: `http://localhost:8000/api/documentation`
-   Regenerate docs: `php artisan l5-swagger:generate`

## 🏗️ Architecture

-   **Controllers**: Handle HTTP requests and validation.
-   **Services**: contain business logic (`BookingService`, `TransactionService`).
-   **Resources**: Transform data for API responses.
-   **Policies**: Handle authorization/RBAC.

## 🧪 Testing

Run tests using PHPUnit:
```bash
php artisan test
```
