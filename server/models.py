"""
server/models.py — request/response Pydantic models for the API layer.
These are separate from ai/models.py to keep the layers independent.
"""
from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    theme: str = Field(..., min_length=1, max_length=300)
    symmetry: Literal[4, 6, 8, 10, 12] = 8
    complexity: Literal["simple", "medium", "detailed"] = "simple"
    style: Literal["traditional", "floral", "geometric", "modern", "festival", "minimal"] = "traditional"


class DesignOut(BaseModel):
    id: str
    title: str
    description: str
    svg: str
    symmetry: int
    complexity: str
    style: str
    drawable: bool
    estimated_waypoints: int
    estimated_drawing_time_sec: int
    source: str


class GenerateResponse(BaseModel):
    designs: List[DesignOut]


class SelectRequest(BaseModel):
    design_id: str


class SelectResponse(BaseModel):
    selected_id: str
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str
    ai_available: bool
    mode: Literal["ai", "local_fallback"]
