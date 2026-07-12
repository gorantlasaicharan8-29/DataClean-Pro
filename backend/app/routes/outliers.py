from fastapi import APIRouter
from app.models.schemas import OutlierRequest, OutlierResponse
from app.services.outlier_service import detect_outliers_iqr, detect_outliers_zscore, generate_box_plot, generate_distribution_plot, remove_outliers
import app.main

router = APIRouter()

@router.post("/outliers/{session_id}/detect", response_model=OutlierResponse)
def detect_outliers(session_id: str, request: OutlierRequest):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    
    if request.method.lower() == 'iqr':
        res = detect_outliers_iqr(df, request.column, request.threshold)
    else:
        res = detect_outliers_zscore(df, request.column, request.threshold)
        
    box_plot_data = generate_box_plot(df, request.column)
    dist_plot_data = generate_distribution_plot(df, request.column, res["outlier_indices"])
    
    return OutlierResponse(
        column=request.column,
        method=request.method,
        outlier_count=res["outlier_count"],
        outlier_indices=res["outlier_indices"],
        box_plot_data=box_plot_data,
        distribution_data=dist_plot_data,
        stats={k: v for k, v in res.items() if k not in ["outlier_count", "outlier_indices"]}
    )

@router.post("/outliers/{session_id}/remove")
def remove_outliers_route(session_id: str, request: OutlierRequest):
    session = app.main.get_session(session_id)
    df = session["cleaned_df"]
    
    if request.method.lower() == 'iqr':
        res = detect_outliers_iqr(df, request.column, request.threshold)
    else:
        res = detect_outliers_zscore(df, request.column, request.threshold)
        
    cleaned_df = remove_outliers(df, res["outlier_indices"])
    session["cleaned_df"] = cleaned_df
    
    return {
        "removed_count": res["outlier_count"],
        "new_row_count": len(cleaned_df)
    }
