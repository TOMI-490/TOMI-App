
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from contextlib import asynccontextmanager
from typing import Optional



#Import routers 




# Import database connection
from ..Infrastructure.Supabase.db_connection import supabase

# Configure logging 
