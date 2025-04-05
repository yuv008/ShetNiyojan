# ShetNiyojan

ShetNiyojan is an Agricultural Project Management System that helps farmers and agricultural organizations manage their projects efficiently.

## Project Structure

The project is divided into two main parts:

### Frontend
- Built with React + TypeScript + Vite
- Uses Shadcn UI components
- Located in the `Frontend` directory

### Backend
- Built with Django REST Framework
- Provides RESTful API endpoints
- Located in the `Backend` directory

## Getting Started

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Features
- User Authentication
- Task Management
- Project Tracking
- User Management
- Admin Dashboard

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## API Endpoints

- `/api/tasks/` - Task CRUD operations
- `/api/users/` - User list (read-only)
- `/api/auth/` - Authentication endpoints
- `/admin/` - Admin panel

## Authentication

This API uses Django REST Framework's session authentication and basic authentication.
You can authenticate:
1. Via the browsable API at `/api/auth/login/`
2. Using Basic Authentication for API requests 