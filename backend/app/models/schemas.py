"""Pydantic v2 schemas for all API request/response types."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class UserInfo(BaseModel):
    name: str
    email: str
    avatar: str


class LoginResponse(BaseModel):
    token: str
    user: UserInfo


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    session_id: str
    filename: str
    rows: int
    columns: int
    file_size: int
    upload_time: str


# ── Preview / Dataset info ────────────────────────────────────────────────────

class DatasetInfo(BaseModel):
    rows: int
    columns: int
    missing_values: int
    duplicates: int
    memory_usage: str
    shape: list[int]
    dtypes: dict[str, str]
    columns_list: list[str]


class PreviewResponse(BaseModel):
    head: list[dict[str, Any]]
    tail: list[dict[str, Any]]
    info: DatasetInfo


# ── Column statistics ─────────────────────────────────────────────────────────

class ColumnStats(BaseModel):
    name: str
    dtype: str
    missing: int
    unique: int
    mean: float | None = None
    median: float | None = None
    mode: Any | None = None
    min: Any | None = None
    max: Any | None = None
    std: float | None = None
    variance: float | None = None
    q1: float | None = None
    q3: float | None = None
    skewness: float | None = None
    kurtosis: float | None = None
    top_values: dict[str, int] | None = None


# ── Cleaning ──────────────────────────────────────────────────────────────────

class CleaningRequest(BaseModel):
    operations: list[dict[str, Any]]


class CleaningSummary(BaseModel):
    missing_per_column: dict[str, int]
    total_missing: int
    duplicates: int
    data_type_issues: list[str]
    rows: int
    columns: int


class CleaningResponse(BaseModel):
    rows_before: int
    rows_after: int
    cols_before: int
    cols_after: int
    missing_before: int
    missing_after: int
    duplicates_removed: int
    operations_applied: list[str]
    cleaning_percentage: float


# ── Outliers ──────────────────────────────────────────────────────────────────

class OutlierRequest(BaseModel):
    column: str
    method: str = "iqr"
    threshold: float = 1.5


class OutlierResponse(BaseModel):
    column: str
    method: str
    outlier_count: int
    outlier_indices: list[int]
    box_plot_data: dict[str, Any]
    distribution_data: dict[str, Any]
    stats: dict[str, Any]


class OutlierRemoveResponse(BaseModel):
    column: str
    method: str
    outliers_removed: int
    rows_before: int
    rows_after: int


# ── Visualization ─────────────────────────────────────────────────────────────

class ChartRequest(BaseModel):
    chart_type: str
    x_column: str = ""
    y_column: str | None = None
    title: str = ""
    color_theme: str = "plotly"
    width: int = 800
    height: int = 500


class ChartResponse(BaseModel):
    chart_json: dict[str, Any]
    chart_type: str


# ── Statistics ────────────────────────────────────────────────────────────────

class StatisticsResponse(BaseModel):
    columns: list[ColumnStats]
    correlation_matrix: dict[str, Any]
    shape: list[int]


# ── Insights ──────────────────────────────────────────────────────────────────

class InsightItem(BaseModel):
    category: str
    icon: str
    message: str
    severity: str


class InsightsResponse(BaseModel):
    insights: list[InsightItem]
    summary: str


# ── Reports ───────────────────────────────────────────────────────────────────

class ReportRequest(BaseModel):
    format: str = Field(default="pdf", description="pdf, docx, or html")
    sections: list[str] = Field(
        default_factory=lambda: [
            "summary",
            "cleaning",
            "statistics",
            "insights",
        ]
    )
