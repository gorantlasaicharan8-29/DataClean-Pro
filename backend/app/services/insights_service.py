"""Rule-based AI insights engine – produces plain-English analysis."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.services.outlier_service import detect_outliers_iqr


def generate_insights(df: pd.DataFrame) -> dict[str, Any]:
    """Analyse *df* and return a list of InsightItem dicts + a summary paragraph."""
    insights: list[dict[str, str]] = []

    rows, cols = df.shape
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category", "string"]).columns.tolist()

    # ── 1. Dataset size ───────────────────────────────────────────────────
    insights.append(
        {
            "category": "summary",
            "icon": "📊",
            "message": f"Dataset contains {rows:,} rows and {cols} columns.",
            "severity": "info",
        }
    )

    # ── 2. Missing values ─────────────────────────────────────────────────
    total_missing = int(df.isna().sum().sum())
    total_cells = rows * cols
    pct = (total_missing / total_cells * 100) if total_cells else 0
    severity = "critical" if pct > 20 else "warning" if pct > 5 else "info"
    insights.append(
        {
            "category": "data_quality",
            "icon": "🔍",
            "message": f"Total missing values: {total_missing:,} ({pct:.1f}% of all cells).",
            "severity": severity,
        }
    )

    # Columns with most missing
    missing_per_col = df.isna().sum()
    worst = missing_per_col[missing_per_col > 0].sort_values(ascending=False)
    if not worst.empty:
        top_col = worst.index[0]
        insights.append(
            {
                "category": "data_quality",
                "icon": "⚠️",
                "message": (
                    f"Column '{top_col}' has the most missing values: "
                    f"{int(worst.iloc[0])} ({worst.iloc[0] / rows * 100:.1f}%)."
                ),
                "severity": "warning",
            }
        )

    # ── 3. Duplicates ─────────────────────────────────────────────────────
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        insights.append(
            {
                "category": "data_quality",
                "icon": "📋",
                "message": f"Found {dup_count} duplicate rows ({dup_count / rows * 100:.1f}% of dataset).",
                "severity": "warning",
            }
        )
    else:
        insights.append(
            {
                "category": "data_quality",
                "icon": "✅",
                "message": "No duplicate rows detected.",
                "severity": "info",
            }
        )

    # ── 4. Numeric – highest / lowest mean ────────────────────────────────
    if numeric_cols:
        means = df[numeric_cols].mean().dropna()
        if not means.empty:
            highest = means.idxmax()
            lowest = means.idxmin()
            insights.append(
                {
                    "category": "distribution",
                    "icon": "📈",
                    "message": (
                        f"Highest average: '{highest}' (mean = {means[highest]:,.2f}). "
                        f"Lowest average: '{lowest}' (mean = {means[lowest]:,.2f})."
                    ),
                    "severity": "info",
                }
            )

    # ── 5. Strong correlations ────────────────────────────────────────────
    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr()
        strong: list[str] = []
        for i, c1 in enumerate(corr.columns):
            for c2 in corr.columns[i + 1:]:
                r = corr.loc[c1, c2]
                if not np.isnan(r) and abs(r) > 0.7:
                    strong.append(f"'{c1}' & '{c2}' (r = {r:.2f})")
        if strong:
            insights.append(
                {
                    "category": "correlation",
                    "icon": "🔗",
                    "message": f"Strong correlations found: {'; '.join(strong)}.",
                    "severity": "info",
                }
            )
        else:
            insights.append(
                {
                    "category": "correlation",
                    "icon": "🔗",
                    "message": "No strong correlations (|r| > 0.7) found between numeric columns.",
                    "severity": "info",
                }
            )

    # ── 6. Outlier counts per numeric column ──────────────────────────────
    outlier_msgs: list[str] = []
    for col in numeric_cols:
        try:
            result = detect_outliers_iqr(df, col)
            cnt = result["outlier_count"]
            if cnt > 0:
                outlier_msgs.append(f"'{col}': {cnt} outliers")
        except Exception:
            pass

    if outlier_msgs:
        insights.append(
            {
                "category": "anomaly",
                "icon": "🚨",
                "message": f"Outliers detected (IQR method) – {', '.join(outlier_msgs)}.",
                "severity": "warning",
            }
        )
    else:
        insights.append(
            {
                "category": "anomaly",
                "icon": "✅",
                "message": "No outliers detected in numeric columns (IQR method).",
                "severity": "info",
            }
        )

    # ── 7. Top categories ─────────────────────────────────────────────────
    for col in categorical_cols[:3]:
        vc = df[col].value_counts()
        if not vc.empty:
            top = vc.index[0]
            insights.append(
                {
                    "category": "distribution",
                    "icon": "🏷️",
                    "message": (
                        f"Most common value in '{col}': '{top}' "
                        f"(appears {int(vc.iloc[0])} times, {vc.iloc[0] / rows * 100:.1f}%)."
                    ),
                    "severity": "info",
                }
            )

    # ── 8. Key numeric summaries ──────────────────────────────────────────
    for col in numeric_cols[:3]:
        series = df[col].dropna()
        if not series.empty:
            insights.append(
                {
                    "category": "distribution",
                    "icon": "📐",
                    "message": (
                        f"'{col}' – avg: {series.mean():,.2f}, "
                        f"min: {series.min():,.2f}, max: {series.max():,.2f}."
                    ),
                    "severity": "info",
                }
            )

    # ── 9. Memory usage ──────────────────────────────────────────────────
    mem_bytes = df.memory_usage(deep=True).sum()
    mem_mb = mem_bytes / (1024 ** 2)
    insights.append(
        {
            "category": "summary",
            "icon": "💾",
            "message": f"Dataset uses {mem_mb:.2f} MB of memory.",
            "severity": "info",
        }
    )

    # ── 10. Data-type breakdown ───────────────────────────────────────────
    dtype_counts = df.dtypes.value_counts()
    dtype_parts = [f"{str(dt)}: {cnt}" for dt, cnt in dtype_counts.items()]
    insights.append(
        {
            "category": "summary",
            "icon": "🧩",
            "message": f"Column data types – {', '.join(dtype_parts)}.",
            "severity": "info",
        }
    )

    # Guarantee at least 10 insights – pad with extra detail if needed
    if len(insights) < 10:
        if numeric_cols:
            std_vals = df[numeric_cols].std().dropna()
            if not std_vals.empty:
                most_var = std_vals.idxmax()
                insights.append(
                    {
                        "category": "distribution",
                        "icon": "📉",
                        "message": f"Most variable column: '{most_var}' (std = {std_vals[most_var]:,.2f}).",
                        "severity": "info",
                    }
                )

    # ── Summary paragraph ─────────────────────────────────────────────────
    summary = (
        f"This dataset contains {rows:,} records across {cols} columns. "
        f"There are {total_missing:,} missing values ({pct:.1f}%) and {dup_count} duplicate rows. "
        f"The dataset includes {len(numeric_cols)} numeric and {len(categorical_cols)} categorical columns. "
    )
    if outlier_msgs:
        summary += f"Outliers were detected in {len(outlier_msgs)} column(s). "
    summary += (
        "It is recommended to handle missing values and remove duplicates before "
        "proceeding with analysis or modelling."
    )

    return {"insights": insights, "summary": summary}
