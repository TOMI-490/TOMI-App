# TOMI Backend Server

FastAPI backend for the TOMI fitness application.

## Quick Start

### Start the Server

```bash
cd src/Backend
./start_server.sh
```

The server will be available at:
- **Local**: http://localhost:8000
- **Mobile**: http://192.168.2.27:8000 (on same WiFi network)
- **API Docs**: http://localhost:8000/api/docs

### Alternative Start Methods

#### From src directory:
```bash
cd src
source ../.venv/bin/activate
uvicorn Backend.Server.program:app --host 0.0.0.0 --port 8000 --reload
```

#### Using Python:
```bash
cd src
python3 -m Backend.Server.program
```

## Environment Setup

### 1. Install Dependencies

```bash
cd /path/to/TOMI-App
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Or install manually:
```bash
pip install fastapi uvicorn 'pydantic[email]' python-dotenv supabase
```

### 2. Configure Environment Variables

Create a `.env` file in the `src` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

## Project Structure

```
Backend/
├── Core/
│   ├── Entity/      # Database entities
│   └── DTO/         # Data Transfer Objects
├── Infrastructure/
│   ├── Repository/  # Database repositories
│   └── Supabase/    # Supabase connection
└── Server/
    ├── program.py   # Main FastAPI application
    └── Routes/      # API route handlers
```

## API Endpoints

### User Management
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### Health Check
- `GET /api/health` - Server health status

For full API documentation, visit http://localhost:8000/api/docs when the server is running.

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process
kill -9 $(lsof -ti:8000)
```

### Module Not Found Error
Make sure you're running from the `src` directory:
```bash
cd src
uvicorn Backend.Server.program:app --reload
```

### Cannot Connect from Mobile
1. Ensure both devices are on the same WiFi network
2. Update your IP in `TOMI/app.json` if it changed
3. Check firewall settings allow port 8000
