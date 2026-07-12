"""Data helper utilities – dataset info, column stats, preview generation."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


def _safe(val: Any) -> Any:
    """Convert numpy/pandas scalars to native Python types for JSON safety."""
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return round(float(val), 4)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, (pd.Timestamp,)):
        return val.isoformat()
    return val


def get_dataset_info(df: pd.DataFrame) -> dict[str, Any]:
    """Return high-level metadata about the DataFrame."""
    memory = df.memory_usage(deep=True).sum()
    if memory < 1024:
        mem_str = f"{memory} B"
    elif memory < 1024 ** 2:
        mem_str = f"{memory / 1024:.1f} KB"
    else:
        mem_str = f"{memory / (1024 ** 2):.2f} MB"

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "missing_values": int(df.isna().sum().sum()),
        "duplicates": int(df.duplicated().sum()),
        "memory_usage": mem_str,
        "shape": [len(df), len(df.columns)],
        "dtypes": {col: str(df[col].dtype) for col in df.columns},
        "columns_list": list(df.columns),
    }


def get_column_stats(df: pd.DataFrame, column_name: str) -> dict[str, Any]:
    """Return detailed statistics for a single column."""
    col = df[column_name]
    stats: dict[str, Any] = {
        "name": column_name,
        "dtype": str(col.dtype),
        "missing": int(col.isna().sum()),
        "unique": int(col.nunique()),
    }

    if pd.api.types.is_numeric_dtype(col):
        desc = col.describe()
        stats.update(
            {
                "mean": _safe(col.mean()),
                "median": _safe(col.median()),
                "mode": _safe(col.mode().iloc[0]) if not col.mode().empty else None,
                "min": _safe(col.min()),
                "max": _safe(col.max()),
                "std": _safe(col.std()),
                "variance": _safe(col.var()),
                "q1": _safe(desc.get("25%")),
                "q3": _safe(desc.get("75%")),
                "skewness": _safe(col.skew()),
                "kurtosis": _safe(col.kurtosis()),
            }
        )
    else:
        mode_val = col.mode()
        top = col.value_counts().head(10).to_dict()
        stats.update(
            {
                "mode": _safe(mode_val.iloc[0]) if not mode_val.empty else None,
                "min": None,
                "max": None,
                "top_values": {str(k): int(v) for k, v in top.items()},
            }
        )

    return stats


def get_preview(df: pd.DataFrame, n: int = 20) -> dict[str, list[dict[str, Any]]]:
    """Return the first and last *n* rows as serialisable dicts."""
    head_df = df.head(n).copy()
    tail_df = df.tail(n).copy()

    # Replace NaN/NaT with None for JSON
    head_df = head_df.where(head_df.notna(), None)
    tail_df = tail_df.where(tail_df.notna(), None)

    return {
        "head": head_df.to_dict(orient="records"),
        "tail": tail_df.to_dict(orient="records"),
    }
