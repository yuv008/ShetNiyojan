# ShetNiyojan Backend

This is the Django REST Framework backend for the ShetNiyojan project.

## Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```

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

## Models

### Task
- title: CharField
- description: TextField
- status: CharField (pending, in_progress, completed)
- created_at: DateTimeField
- updated_at: DateTimeField
- due_date: DateTimeField
- assigned_to: ForeignKey to User
- created_by: ForeignKey to User

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
```

### Applying Migrations
```bash
python manage.py migrate
``` 