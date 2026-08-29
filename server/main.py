"""
server/main.py — PookalBot FastAPI application.

Start with:
    python -m uvicorn server.main:app --reload

API docs: http://localhost:8000/docs
"""
from __future__ import annotations
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from ai.generator import ai_available
from server.models import HealthResponse
from server.routes.designs import router as designs_router
from server.routes.paths   import router as paths_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

app = FastAPI(
    title="PookalBot API",
    description="AI-powered Pookalam design generation and robot control backend.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow the frontend dev server and file:// origin ───────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "null",          # file:// origin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(designs_router)
app.include_router(paths_router)

# ── Serve the existing static frontend ───────────────────────────────────────
_static = Path(__file__).parent.parent / "web" / "static"
if _static.exists():
    app.mount("/static", StaticFiles(directory=str(_static)), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        return FileResponse(str(_static / "index.html"))


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def health() -> HealthResponse:
    """Service health check — reports AI availability."""
    available = ai_available()
    return HealthResponse(
        status="ok",
        service="pookalbot",
        ai_available=available,
        mode="ai" if available else "local_fallback",
    )
