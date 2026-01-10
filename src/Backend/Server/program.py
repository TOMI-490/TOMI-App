
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn
import sys
from pathlib import Path

# Add project root to python path
projectRoot = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(projectRoot))


#Import routers 
from .Routes.AvatarRoutes import router as AvatarRouter
from .Routes.BadgeRoutes import router as BadgeRouter
from .Routes.CommunityRoutes import router as CommunityRouter
from .Routes.DashboardRoutes import router as DashboardRouter
from .Routes.FriendRoutes import router as FriendRouter
from .Routes.FriendStatusRoutes import router as FriendStatusRouter
from .Routes.GamificationRoutes import router as GamificationRouter
from .Routes.GoalRoutes import router as GoalRouter
from .Routes.GoalStatusRoutes import router as GoalStatusRouter
from .Routes.GoalTypeRoutes import router as GoalTypeRouter
from .Routes.HistoryRoutes import router as HistoryRouter
from .Routes.LeaderboardRoutes import router as LeaderboardRouter
from .Routes.NotificationRoutes import router as NotificationRouter
from .Routes.ProfileRoutes import router as ProfileRouter
from .Routes.StreakRoutes import router as StreakRouter
from .Routes.UserAvatarRoutes import router as UserAvatarRouter
from .Routes.UserRoutes import router as UserRouter
from .Routes.WatchDeviceRoutes import router as WatchDeviceRouter
from .Routes.WorkoutRoutes import router as WorkoutRouter
from .Routes.WorkoutTypeRoutes import router as WorkoutTypeRouter



# Import database connection
from ..Infrastructure.Supabase.db_connection import connection

# Configure logging 
logging.basicConfig(level=logging.INFO, format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)

# Security scheme for HTTP Bearer authentication
security = HTTPBearer()

# Lifespan event handler 
@asynccontextmanager
async def lifespan(app: FastAPI):
    
    # Startup actions 
    logger.info("Starting up the Backend Server...")
    health = connection.health_check()
    logger.info(f"Supabase Health Check: {health}")
    logger.info("API Documentation available at: http://127.0.0.1:8000/api/docs")
    yield
    
    # Shutdown actions
    logger.info("Shutting down the Backend Server...")
    connection.disconnect()
    

# Initialize FastAPI app
app = FastAPI(
   title = "TOMI-Backend",
   description = "Backend server for TOMI application",
   version = "1.0.0",
   lifespan=lifespan,
   docs_url ="/api/docs", # Swagger UI
   redoc_url = "/api/redoc", # ReDoc UI
   openapi_url="/api/openapi.json"
)
    
# Configure CORS middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)


class MobileResponse: 
    
    @staticmethod 
    def success (data=None, message = "Success", code = 200):
        return {
            "success": True,
            "code": code,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @staticmethod 
    def error (message = "Error", code = 400, errors = None):
        return {
            "success": False,
            "code": code,
            "message": message,
            "errors": errors,
            "timestamp": datetime.utcnow().isoformat()
        }


# endpoint to check root status
@app.get("/")
async def root():
    return MobileResponse.success(
        data = {
            "status": "Backend server is running",
            "version": "1.0.0"
        }, message= "Backend server is running"
    )


# endpoint to check health
@app.get("/health")
async def healthCheck():
    health = connection.health_check()
    return MobileResponse.success(
        data = {
            "apiStatus": "healthy",
            "database": health
        }
    )

# API Version information
@app.get("/api/v1/version")
async def apiVersion():
    return MobileResponse.success(
        data = {
            "apiVersion": "1.0.0",
            "minMobileAppVersion": "1.0.0",
            "latestMobileAppVersion": "1.0.0",
            "forceUpdate": False
        }
    )
    
# Registers routers with the app
app.include_router(AvatarRouter, prefix="/api/v1/avatars", tags=["Avatars"])
app.include_router(BadgeRouter, prefix="/api/v1/badges", tags=["Badges"])
app.include_router(CommunityRouter, prefix="/api/v1/community", tags=["Community"])
app.include_router(DashboardRouter, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(FriendRouter, prefix="/api/v1/friends", tags=["Friends"])
app.include_router(FriendStatusRouter, prefix="/api/v1/friendStatus", tags=["Friend Status"])
app.include_router(GamificationRouter, prefix="/api/v1/gamification", tags=["Gamification"])
app.include_router(GoalRouter, prefix="/api/v1/goals", tags=["Goals"])
app.include_router(GoalStatusRouter, prefix="/api/v1/goalStatus", tags=["Goal Status"])
app.include_router(GoalTypeRouter, prefix="/api/v1/goalTypes", tags=["Goal Types"])
app.include_router(HistoryRouter, prefix="/api/v1/history", tags=["History"])
app.include_router(LeaderboardRouter, prefix="/api/v1/leaderboards", tags=["Leaderboards"])
app.include_router(NotificationRouter, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(ProfileRouter, prefix="/api/v1/profiles", tags=["Profiles"])
app.include_router(StreakRouter, prefix="/api/v1/streaks", tags=["Streaks"])
app.include_router(UserAvatarRouter, prefix="/api/v1/userAvatars", tags=["User Avatars"])
app.include_router(UserRouter, prefix="/api/v1/users", tags=["Users"])
app.include_router(WatchDeviceRouter, prefix="/api/v1/watchDevices", tags=["Watch Devices"])
app.include_router(WorkoutRouter, prefix="/api/v1/workouts", tags=["Workouts"])
app.include_router(WorkoutTypeRouter, prefix="/api/v1/workoutTypes", tags=["Workout Types"])

    
# Global exception handler
@app.exception_handler(HTTPException)
async def httpExceptionHandler(request, exc: HTTPException):
    logger.error(f"HTTP Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=MobileResponse.error(message=exc.detail, code=exc.status_code)
    )
    
@app.exception_handler(Exception)
async def generalExceptionHandler(request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=MobileResponse.error(message="Internal Server Error", code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    )


if __name__ == "__main__":
    # Use 0.0.0.0 to allow connections from mobile devices on the same network
    uvicorn.run("src.Backend.Server.program:app", host="0.0.0.0", port=8000, log_level="info", reload=True)

    
    
