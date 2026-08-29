"""
server/routes/designs.py — /api/designs/* endpoints.
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, HTTPException

from ai.generator import generate_designs, ai_available
from ai.models import DesignRequest, DesignCandidate
from server.models import (
    GenerateRequest, GenerateResponse, DesignOut,
    SelectRequest, SelectResponse,
)

router = APIRouter(prefix="/api/designs", tags=["designs"])

# ── In-memory state (replaced with DB in future) ──────────────────────────────
# Stores the last generated candidates and the currently selected design.
_last_candidates: list[DesignCandidate] = []
_selected_design: Optional[DesignCandidate] = None


def _to_out(d: DesignCandidate) -> DesignOut:
    return DesignOut(
        id=d.id,
        title=d.title,
        description=d.description,
        svg=d.svg,
        symmetry=d.symmetry,
        complexity=d.complexity,
        style=d.style,
        drawable=d.drawable,
        estimated_waypoints=d.estimated_waypoints,
        estimated_drawing_time_sec=d.estimated_drawing_time_sec,
        source=d.source,
    )


@router.post("/generate", response_model=GenerateResponse, summary="Generate 3 Pookalam designs")
async def generate(req: GenerateRequest) -> GenerateResponse:
    """
    Generate exactly 3 Pookalam SVG design candidates.

    Uses the AI provider if AI_API_KEY is configured; otherwise uses the
    deterministic local fallback generator.
    """
    global _last_candidates
    ai_req = DesignRequest(
        theme=req.theme,
        symmetry=req.symmetry,
        complexity=req.complexity,
        style=req.style,
    )
    candidates = generate_designs(ai_req)
    _last_candidates = candidates
    return GenerateResponse(designs=[_to_out(d) for d in candidates])


@router.post("/select", response_model=SelectResponse, summary="Select a design")
async def select_design(req: SelectRequest) -> SelectResponse:
    """Store the user's selected design for later path generation."""
    global _selected_design
    match = next((d for d in _last_candidates if d.id == req.design_id), None)
    if match is None:
        raise HTTPException(
            status_code=404,
            detail=f"Design {req.design_id!r} not found. Generate designs first.",
        )
    _selected_design = match
    return SelectResponse(
        selected_id=match.id,
        message=f"Design '{match.title}' selected.",
    )


@router.get("/current", response_model=Optional[DesignOut], summary="Get currently selected design")
async def current_design() -> Optional[DesignOut]:
    """Return the currently selected design, or null if none selected yet."""
    if _selected_design is None:
        return None
    return _to_out(_selected_design)
