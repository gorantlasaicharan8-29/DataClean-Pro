from fastapi import APIRouter
from app.models.schemas import ChartRequest, ChartResponse
from app.services.visualization_service import generate_chart
import app.main

router = APIRouter()

@router.post("/visualize/{session_id}", response_model=ChartResponse)
def visualize_data(session_id: str, request: ChartRequest):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    
    chart_json = generate_chart(
        df=df,
        chart_type=request.chart_type,
        x_col=request.x_column,
        y_col=request.y_column,
        title=request.title,
        color_theme=request.color_theme,
        width=request.width,
        height=request.height
    )
    
    return ChartResponse(
        chart_json=chart_json,
        chart_type=request.chart_type
    )
