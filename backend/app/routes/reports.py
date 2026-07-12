from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.schemas import ReportRequest
from app.services.report_service import generate_pdf_report, generate_docx_report, generate_html_report
from app.services.insights_service import generate_insights
from app.services.statistics_service import get_full_statistics
import app.main

router = APIRouter()

@router.post("/reports/{session_id}/generate")
def generate_report(session_id: str, request: ReportRequest):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    original_df = session["original_df"]
    filename = session["filename"]
    
    insights = generate_insights(df)
    stats = get_full_statistics(df)
    
    charts_data = {} # Skipping charts generation for now to simplify
    
    try:
        if request.format.lower() == 'pdf':
            pdf_bytes = generate_pdf_report(df, original_df, insights, stats, charts_data, filename)
            return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=report_{session_id}.pdf"})
        elif request.format.lower() == 'docx':
            docx_bytes = generate_docx_report(df, original_df, insights, stats, filename)
            return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename=report_{session_id}.docx"})
        elif request.format.lower() == 'html':
            html_content = generate_html_report(df, original_df, insights, stats, filename)
            return Response(content=html_content, media_type="text/html", headers={"Content-Disposition": f"attachment; filename=report_{session_id}.html"})
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
