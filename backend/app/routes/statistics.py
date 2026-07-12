from fastapi import APIRouter
from app.models.schemas import StatisticsResponse
from app.services.statistics_service import get_full_statistics
import app.main

router = APIRouter()

@router.get("/statistics/{session_id}", response_model=StatisticsResponse)
def get_statistics(session_id: str):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    stats_data = get_full_statistics(df)
    return stats_data
