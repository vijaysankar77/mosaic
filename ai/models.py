"""
ai/models.py — shared Pydantic models for the AI design generation layer.
"""
from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


SymmetryOrder = Literal[4, 6, 8, 10, 12]
ComplexityLevel = Literal["simple", "medium", "detailed"]
DesignStyle = Literal["traditional", "floral", "geometric", "modern", "festival", "minimal"]


class DesignRequest(BaseModel):
    theme: str = Field(..., min_length=1, max_length=300, description="User theme description")
    symmetry: SymmetryOrder = Field(8, description="Rotational symmetry order")
    complexity: ComplexityLevel = Field("simple", description="Design complexity")
    style: DesignStyle = Field("traditional", description="Visual style")


class DesignCandidate(BaseModel):
    id: str
    title: str
    description: str
    theme: str
    symmetry: int
    complexity: str
    style: str
    svg: str                              # Full inline SVG string
    drawable: bool = True                 # Passes SVG validation
    validation_errors: List[str] = []
    estimated_waypoints: int = 0
    estimated_drawing_time_sec: int = 0
    source: str = "local_fallback"        # "ai" | "local_fallback"
