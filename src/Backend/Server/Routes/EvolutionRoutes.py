from fastapi import APIRouter, HTTPException, Query
import logging

from ...Core.DTO.EvolutionDTO import (
    EvolutionStateResponseDTO,
    EvolveRequestDTO,
    EvolveResponseDTO,
)
from ...Core.Services.EvolutionService import EvolutionService

logger = logging.getLogger(__name__)
router = APIRouter()
evolutionService = EvolutionService()


@router.get("/state", response_model=EvolutionStateResponseDTO)
async def getEvolutionState(user_id: int = Query(..., alias="user_id", gt=0)):
    """
    Return the user's current evolution node, stage, level,
    whether they are eligible to evolve, and the available options.
    """
    try:
        return evolutionService.get_evolution_state(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting evolution state for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evolve", response_model=EvolveResponseDTO)
async def evolveAvatar(request: EvolveRequestDTO):
    """
    Evolve the user's avatar to a new form.
    Validates the edge exists and level requirement is met.
    """
    try:
        result = evolutionService.evolve(request.user_id, request.target_node_id)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evolving avatar for user {request.user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
