from fastapi import APIRouter
from app.models.schemas import PreviewResponse
from app.services.data_service import get_preview, get_column_stats, get_dataset_info
import app.main

router = APIRouter()

@router.get("/preview/{session_id}", response_model=PreviewResponse)
def preview_dataset(session_id: str, type: str = "cleaned"):
    session = app.main.get_session(session_id)
    df = session["original_df"] if type == "raw" else session["cleaned_df"]
    preview_data = get_preview(df)
    preview_data["info"] = get_dataset_info(df)
    return preview_data

@router.get("/preview/{session_id}/columns")
def get_columns_info(session_id: str, type: str = "cleaned"):
    session = app.main.get_session(session_id)
    df = session["original_df"] if type == "raw" else session["cleaned_df"]
    columns = [get_column_stats(df, col) for col in df.columns]
    return {"columns": columns}
