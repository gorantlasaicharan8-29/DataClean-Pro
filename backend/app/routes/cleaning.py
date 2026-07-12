from fastapi import APIRouter
from app.models.schemas import CleaningRequest, CleaningResponse
from app.services.cleaning_service import auto_clean, apply_operation
import app.main
import pandas as pd

router = APIRouter()

@router.get("/cleaning/{session_id}/summary")
def get_cleaning_summary(session_id: str):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    missing = df.isnull().sum().to_dict()
    duplicates = int(df.duplicated().sum())
    return {
        "missing_per_column": missing,
        "duplicates": duplicates,
        "total_missing": sum(missing.values())
    }

@router.post("/cleaning/{session_id}/auto", response_model=CleaningResponse)
def auto_clean_dataset(session_id: str):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    
    rows_before = len(df)
    cols_before = len(df.columns)
    missing_before = int(df.isnull().sum().sum())
    
    cleaned_df, ops_log = auto_clean(df)
    
    session["cleaned_df"] = cleaned_df
    
    rows_after = len(cleaned_df)
    cols_after = len(cleaned_df.columns)
    missing_after = int(cleaned_df.isnull().sum().sum())
    
    percentage = 100.0 if missing_before == 0 else ((missing_before - missing_after) / missing_before) * 100
    
    return CleaningResponse(
        rows_before=rows_before,
        rows_after=rows_after,
        cols_before=cols_before,
        cols_after=cols_after,
        missing_before=missing_before,
        missing_after=missing_after,
        duplicates_removed=rows_before - rows_after,
        operations_applied=ops_log,
        cleaning_percentage=percentage
    )

@router.post("/cleaning/{session_id}/apply", response_model=CleaningResponse)
def apply_cleaning_operations(session_id: str, request: CleaningRequest):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    
    rows_before = len(df)
    cols_before = len(df.columns)
    missing_before = int(df.isnull().sum().sum())
    
    ops_log = []
    current_df = df.copy()
    
    for op in request.operations:
        current_df, desc = apply_operation(current_df, op)
        ops_log.append(desc)
        
    session["cleaned_df"] = current_df
    
    rows_after = len(current_df)
    cols_after = len(current_df.columns)
    missing_after = int(current_df.isnull().sum().sum())
    
    percentage = 100.0 if missing_before == 0 else ((missing_before - missing_after) / missing_before) * 100
    
    return CleaningResponse(
        rows_before=rows_before,
        rows_after=rows_after,
        cols_before=cols_before,
        cols_after=cols_after,
        missing_before=missing_before,
        missing_after=missing_after,
        duplicates_removed=rows_before - rows_after, # Simplified
        operations_applied=ops_log,
        cleaning_percentage=percentage
    )
