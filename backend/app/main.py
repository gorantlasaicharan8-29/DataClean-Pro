from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import pandas as pd

app = FastAPI(title='DataClean Pro API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:3000'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage
sessions: Dict[str, Dict[str, Any]] = {}

def get_session(session_id: str) -> Dict[str, Any]:
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]

# Import routers here to avoid circular imports if they rely on main
from app.routes.auth import router as auth_router
from app.routes.upload import router as upload_router
from app.routes.preview import router as preview_router
from app.routes.cleaning import router as cleaning_router
from app.routes.outliers import router as outliers_router
from app.routes.visualization import router as visualization_router
from app.routes.statistics import router as statistics_router
from app.routes.insights import router as insights_router
from app.routes.reports import router as reports_router
from app.routes.download import router as download_router

app.include_router(auth_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(preview_router, prefix="/api")
app.include_router(cleaning_router, prefix="/api")
app.include_router(outliers_router, prefix="/api")
app.include_router(visualization_router, prefix="/api")
app.include_router(statistics_router, prefix="/api")
app.include_router(insights_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(download_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to DataClean Pro API"}
