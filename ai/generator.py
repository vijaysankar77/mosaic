"""
ai/generator.py — AI provider abstraction for Pookalam design generation.

Priority
--------
1. If AI_API_KEY is set → try external AI (Cohere generate endpoint).
2. On any failure, or if key is absent → fall back to local SVG generator.

The frontend never receives the API key.
Provider-specific code is isolated in _cohere_generate().
"""
from __future__ import annotations
import json
import logging
import os
import uuid
from typing import List

import httpx

from .models import DesignCandidate, DesignRequest
from .svg_generator import generate_local_svgs
from .svg_validator import validate_svg, estimate_waypoints, estimate_drawing_time

log = logging.getLogger(__name__)

# ── Titles / descriptions for the three design slots ─────────────────────────
_SLOT_META = [
    ("Petal Ring",  "Lotus-petal ring radiating from a central disc — a classic Onam motif."),
    ("Mandala",     "Layered mandala rings with diamond accents drawn in polar symmetry."),
    ("Star Burst",  "Geometric star with overlapping petal arcs — bold and precise."),
]


# ── Local fallback (always works, no network) ─────────────────────────────────

def _local_fallback(request: DesignRequest) -> List[DesignCandidate]:
    """Generate 3 candidates using the deterministic local SVG generator."""
    svgs = generate_local_svgs(
        n=request.symmetry,
        complexity=request.complexity,
        style=request.style,
        theme=request.theme,
    )
    candidates = []
    for svg, (title, desc) in zip(svgs, _SLOT_META):
        errors = validate_svg(svg)
        wps    = estimate_waypoints(svg, request.symmetry)
        dt     = estimate_drawing_time(wps)
        candidates.append(DesignCandidate(
            id=str(uuid.uuid4()),
            title=title,
            description=desc,
            theme=request.theme,
            symmetry=request.symmetry,
            complexity=request.complexity,
            style=request.style,
            svg=svg,
            drawable=len(errors) == 0,
            validation_errors=errors,
            estimated_waypoints=wps,
            estimated_drawing_time_sec=dt,
            source="local_fallback",
        ))
    return candidates


# ── Cohere AI provider ────────────────────────────────────────────────────────

def _cohere_generate(request: DesignRequest, api_key: str) -> List[DesignCandidate]:
    """
    Ask Cohere to describe three Pookalam SVG designs, then build the actual
    SVGs locally using those descriptions to influence motif selection.

    We use Cohere's /v2/chat endpoint to get creative titles + descriptions,
    then feed those back into the local SVG generator with enhanced theme strings.
    This keeps SVG generation deterministic while the AI influences the narrative.
    """
    prompt = (
        f"You are a Pookalam (Kerala floral art) design assistant. "
        f"The user wants 3 distinct Pookalam designs with:\n"
        f"Theme: {request.theme}\n"
        f"Symmetry: {request.symmetry}-fold\n"
        f"Complexity: {request.complexity}\n"
        f"Style: {request.style}\n\n"
        f"Return ONLY a JSON array of exactly 3 objects, each with keys: "
        f'"title" (≤6 words) and "description" (1 sentence). '
        f"No markdown, no extra text."
    )

    resp = httpx.post(
        "https://api.cohere.com/v2/chat",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "command-r-plus",
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=15.0,
    )
    resp.raise_for_status()

    raw_text: str = resp.json()["message"]["content"][0]["text"].strip()
    # Strip markdown fences if present
    if raw_text.startswith("```"):
        raw_text = "\n".join(raw_text.split("\n")[1:-1])

    ai_meta = json.loads(raw_text)  # list of {title, description}

    # Generate the actual SVGs using the local generator but with AI-informed themes
    enriched_themes = [
        f"{request.theme} {item.get('title', '')} {item.get('description', '')}"
        for item in ai_meta
    ]
    svgs = [
        generate_local_svgs(request.symmetry, request.complexity, request.style, t)[i]
        for i, t in enumerate(enriched_themes)
    ]

    candidates = []
    for svg, item in zip(svgs, ai_meta):
        errors = validate_svg(svg)
        wps    = estimate_waypoints(svg, request.symmetry)
        dt     = estimate_drawing_time(wps)
        candidates.append(DesignCandidate(
            id=str(uuid.uuid4()),
            title=item.get("title", "AI Design"),
            description=item.get("description", ""),
            theme=request.theme,
            symmetry=request.symmetry,
            complexity=request.complexity,
            style=request.style,
            svg=svg,
            drawable=len(errors) == 0,
            validation_errors=errors,
            estimated_waypoints=wps,
            estimated_drawing_time_sec=dt,
            source="ai",
        ))
    return candidates


# ── Public entry point ────────────────────────────────────────────────────────

def generate_designs(request: DesignRequest) -> List[DesignCandidate]:
    """
    Generate 3 Pookalam design candidates.

    Uses Cohere AI if AI_API_KEY is set; otherwise uses the local fallback.
    Falls back to local on any network or parsing error.
    """
    api_key = os.environ.get("AI_API_KEY", "").strip()

    if api_key:
        try:
            log.info("Using Cohere AI generator")
            return _cohere_generate(request, api_key)
        except Exception as exc:
            log.warning("AI generation failed (%s) — using local fallback", exc)

    log.info("Using local_fallback generator")
    return _local_fallback(request)


def ai_available() -> bool:
    """Return True if an API key is configured."""
    return bool(os.environ.get("AI_API_KEY", "").strip())
