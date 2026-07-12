"""Outlier detection and removal using IQR and Z-score methods with Plotly visuals."""

from __future__ import annotations

import json
from typing import Any

import numpy as np
import pandas as pd
import plotly.graph_objects as go


# ── Detection ─────────────────────────────────────────────────────────────────

def detect_outliers_iqr(
    df: pd.DataFrame,
    column: str,
    threshold: float = 1.5,
) -> dict[str, Any]:
    """Detect outliers using the Interquartile Range method."""
    series = df[column].dropna()
    q1 = float(series.quantile(0.25))
    q3 = float(series.quantile(0.75))
    iqr = q3 - q1
    lower = q1 - threshold * iqr
    upper = q3 + threshold * iqr

    mask = (df[column] < lower) | (df[column] > upper)
    outlier_indices = df.index[mask & df[column].notna()].tolist()

    return {
        "outlier_indices": [int(i) for i in outlier_indices],
        "outlier_count": len(outlier_indices),
        "q1": round(q1, 4),
        "q3": round(q3, 4),
        "iqr": round(iqr, 4),
        "lower_bound": round(lower, 4),
        "upper_bound": round(upper, 4),
    }


def detect_outliers_zscore(
    df: pd.DataFrame,
    column: str,
    threshold: float = 3.0,
) -> dict[str, Any]:
    """Detect outliers using the Z-score method."""
    series = df[column].dropna()
    mean = float(series.mean())
    std = float(series.std())

    if std == 0:
        return {
            "outlier_indices": [],
            "outlier_count": 0,
            "mean": round(mean, 4),
            "std": 0.0,
            "threshold": threshold,
        }

    z_scores = ((df[column] - mean) / std).abs()
    mask = z_scores > threshold
    outlier_indices = df.index[mask & df[column].notna()].tolist()

    return {
        "outlier_indices": [int(i) for i in outlier_indices],
        "outlier_count": len(outlier_indices),
        "mean": round(mean, 4),
        "std": round(std, 4),
        "threshold": threshold,
    }


# ── Plotly visuals ────────────────────────────────────────────────────────────

def generate_box_plot(df: pd.DataFrame, column: str) -> dict[str, Any]:
    """Return a Plotly box-plot figure dict for *column*."""
    series = df[column].dropna()

    fig = go.Figure()
    fig.add_trace(
        go.Box(
            y=series,
            name=column,
            boxmean="sd",
            marker=dict(color="#636EFA", outliercolor="#EF553B", size=6),
            line=dict(color="#636EFA"),
        )
    )
    fig.update_layout(
        title=dict(text=f"Box Plot – {column}", font=dict(size=16)),
        yaxis_title=column,
        template="plotly_white",
        height=450,
        width=600,
        showlegend=False,
    )
    return json.loads(fig.to_json())


def generate_distribution_plot(
    df: pd.DataFrame,
    column: str,
    outlier_indices: list[int],
) -> dict[str, Any]:
    """Return a Plotly histogram+scatter overlay highlighting outliers."""
    series = df[column].dropna()
    outlier_values = df.loc[
        [i for i in outlier_indices if i in df.index], column
    ].dropna()

    fig = go.Figure()

    # Histogram
    fig.add_trace(
        go.Histogram(
            x=series,
            name="Distribution",
            marker_color="#636EFA",
            opacity=0.7,
            nbinsx=30,
        )
    )

    # Outlier markers on the x-axis
    if len(outlier_values) > 0:
        fig.add_trace(
            go.Scatter(
                x=outlier_values,
                y=[0] * len(outlier_values),
                mode="markers",
                name="Outliers",
                marker=dict(color="#EF553B", size=10, symbol="x"),
            )
        )

    fig.update_layout(
        title=dict(text=f"Distribution – {column}", font=dict(size=16)),
        xaxis_title=column,
        yaxis_title="Frequency",
        template="plotly_white",
        height=450,
        width=700,
        barmode="overlay",
    )
    return json.loads(fig.to_json())


# ── Removal ───────────────────────────────────────────────────────────────────

def remove_outliers(
    df: pd.DataFrame, outlier_indices: list[int]
) -> pd.DataFrame:
    """Drop rows at the given indices and return a new DataFrame."""
    valid = [i for i in outlier_indices if i in df.index]
    return df.drop(index=valid).reset_index(drop=True)
