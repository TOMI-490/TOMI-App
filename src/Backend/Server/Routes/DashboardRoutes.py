from fastapi import APIRouter, HTTPException
import logging

from ...Core.DTO.DashboardDTO import DashboardDTO
from ...Core.Services.DashboardService import DashboardService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize service
dashboard_service = DashboardService()

# Get aggregated dashboard data for a user
@router.get("/{user_id}", response_model=DashboardDTO)
async def getDashboardData(user_id: int):
    try:
        return dashboard_service.get_dashboard_data(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching dashboard data for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
