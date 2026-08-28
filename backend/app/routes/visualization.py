from fastapi import APIRouter, HTTPException
from app.models.schemas import ChartRequest, ChartResponse
from app.services.visualization_service import generate_chart
import app.main

router = APIRouter()

@router.post("/visualize/{session_id}", response_model=ChartResponse)
def visualize_data(session_id: str, request: ChartRequest):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]

    try:
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")

    return ChartResponse(
        chart_json=chart_json,
        chart_type=request.chart_type
    )
