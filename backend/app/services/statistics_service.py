"""Comprehensive statistical analysis for a DataFrame."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


def _safe(val: Any) -> Any:
    """Coerce numpy/pandas types to JSON-safe Python natives."""
    if val is None:
        return None
    if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return round(float(val), 4)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    return val


def get_full_statistics(df: pd.DataFrame) -> dict[str, Any]:
    """Return per-column stats and a correlation matrix."""

    columns_stats: list[dict[str, Any]] = []

    for col in df.columns:
        series = df[col]
        base: dict[str, Any] = {
            "name": col,
            "dtype": str(series.dtype),
            "missing": int(series.isna().sum()),
            "unique": int(series.nunique()),
        }

        if pd.api.types.is_numeric_dtype(series):
            desc = series.describe()
            mode_vals = series.mode()
            base.update(
                {
                    "mean": _safe(series.mean()),
                    "median": _safe(series.median()),
                    "mode": _safe(mode_vals.iloc[0]) if not mode_vals.empty else None,
                    "std": _safe(series.std()),
                    "variance": _safe(series.var()),
                    "min": _safe(series.min()),
                    "max": _safe(series.max()),
                    "q1": _safe(desc.get("25%")),
                    "q3": _safe(desc.get("75%")),
                    "skewness": _safe(series.skew()),
                    "kurtosis": _safe(series.kurtosis()),
                }
            )
        else:
            mode_vals = series.mode()
            top = series.value_counts().head(10).to_dict()
            base.update(
                {
                    "mode": _safe(mode_vals.iloc[0]) if not mode_vals.empty else None,
                    "unique_count": int(series.nunique()),
                    "top_values": {str(k): int(v) for k, v in top.items()},
                }
            )

        columns_stats.append(base)

    # Correlation matrix
    numeric_df = df.select_dtypes(include="number")
    if not numeric_df.empty:
        corr = numeric_df.corr()
        # Replace NaN with None for JSON
        corr_dict: dict[str, dict[str, float | None]] = {}
        for row in corr.index:
            corr_dict[str(row)] = {
                str(c): _safe(corr.loc[row, c]) for c in corr.columns
            }
    else:
        corr_dict = {}

    return {
        "columns": columns_stats,
        "correlation_matrix": corr_dict,
        "shape": [len(df), len(df.columns)],
    }
