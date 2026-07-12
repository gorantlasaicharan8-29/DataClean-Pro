from fastapi import APIRouter
from app.models.schemas import InsightsResponse
from app.services.insights_service import generate_insights
import app.main

router = APIRouter()

@router.get("/insights/{session_id}", response_model=InsightsResponse)
def get_insights_route(session_id: str):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    insights_data = generate_insights(df)
    return insights_data
