#!/bin/bash

# TOMI Backend Server Startup Script
# This script starts the FastAPI backend server with the correct configuration

echo "🚀 Starting TOMI Backend Server..."
echo ""

# Navigate to the src directory
cd "$(dirname "$0")/.." || exit 1

# Check if virtual environment exists
if [ -d "../.venv" ]; then
    echo "✓ Activating virtual environment..."
    source ../.venv/bin/activate
else
    echo "⚠️  Warning: Virtual environment not found at ../.venv"
    echo "   The server will use the system Python installation"
fi

# Check if required packages are installed
echo "✓ Checking dependencies..."
python3 -c "import fastapi, uvicorn, pydantic" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: Required packages not installed"
    echo "   Run: pip install fastapi uvicorn 'pydantic[email]'"
    exit 1
fi

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")
echo "✓ Starting server on http://0.0.0.0:8000"
echo "✓ API Documentation: http://localhost:8000/api/docs"
echo "✓ Accessible from mobile: http://$LOCAL_IP:8000"
echo ""
echo "Press CTRL+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the server
uvicorn Backend.Server.program:app --host 0.0.0.0 --port 8000 --reload
