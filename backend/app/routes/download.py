from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from app.models.schemas import ChartRequest
from app.services.visualization_service import generate_chart
import app.main
import io

router = APIRouter()

@router.get("/download/{session_id}/csv")
def download_csv(session_id: str):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=cleaned_data.csv"
    return response

@router.get("/download/{session_id}/excel")
def download_excel(session_id: str):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    stream = io.BytesIO()
    df.to_excel(stream, index=False)
    return Response(content=stream.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename=cleaned_data.xlsx"})

@router.post("/download/{session_id}/chart")
def download_chart(session_id: str, request: ChartRequest):
    # Generating image from Plotly json requires kaleido
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    
    import plotly.io as pio
    import plotly.graph_objects as go
    
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
    
    fig = go.Figure(chart_json)
    img_bytes = pio.to_image(fig, format='png', width=request.width, height=request.height)
    return Response(content=img_bytes, media_type="image/png", headers={"Content-Disposition": f"attachment; filename=chart.png"})
