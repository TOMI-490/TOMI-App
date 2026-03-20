from pydantic import BaseModel


class EvolutionNodeEntity(BaseModel):
    evolution_node_id: int
    avatar_id: int
    name: str
    stage: str          # 'baby', 'teen', or 'adult'
    level_required: int


class EvolutionEdgeEntity(BaseModel):
    evolution_edge_id: int
    parent_node_id: int
    child_node_id: int
