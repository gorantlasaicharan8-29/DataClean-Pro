"""Chart generation service – 12 chart types powered by Plotly."""

from __future__ import annotations

import json
from typing import Any

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.figure_factory as ff
import plotly.graph_objects as go


# ── Colour palette shorthand ─────────────────────────────────────────────────

_THEMES = {
    "plotly": "plotly",
    "plotly_dark": "plotly_dark",
    "ggplot2": "ggplot2",
    "seaborn": "seaborn",
    "simple_white": "simple_white",
}


def _template(theme: str) -> str:
    return _THEMES.get(theme, "plotly")


def _base_layout(title: str, template: str, width: int, height: int) -> dict:
    return dict(
        title=dict(text=title, font=dict(size=18)),
        template=template,
        width=width,
        height=height,
        margin=dict(l=60, r=30, t=60, b=60),
    )


# ── Individual chart builders ─────────────────────────────────────────────────

def _bar(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if y and y in df.columns and pd.api.types.is_numeric_dtype(df[y]):
        fig = px.bar(df, x=x, y=y, title=title, template=tmpl, width=w, height=h)
    else:
        counts = df[x].value_counts().reset_index()
        counts.columns = [x, "count"]
        fig = px.bar(counts, x=x, y="count", title=title or f"Bar Chart – {x}", template=tmpl, width=w, height=h)
    return fig


def _line(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if y and y in df.columns:
        fig = px.line(df.sort_values(x), x=x, y=y, title=title or f"Line Chart – {x} vs {y}", template=tmpl, width=w, height=h)
    else:
        fig = px.line(df.reset_index(), x="index", y=x, title=title or f"Line Chart – {x}", template=tmpl, width=w, height=h)
    return fig


def _pie(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    counts = df[x].value_counts().reset_index()
    counts.columns = [x, "count"]
    fig = px.pie(counts, names=x, values="count", title=title or f"Pie Chart – {x}", template=tmpl, width=w, height=h)
    fig.update_traces(textposition="inside", textinfo="percent+label")
    return fig


def _histogram(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    fig = px.histogram(df, x=x, title=title or f"Histogram – {x}", template=tmpl, width=w, height=h, nbins=30)
    fig.update_layout(yaxis_title="Frequency")
    return fig


def _scatter(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if not y or y not in df.columns:
        y = x
    fig = px.scatter(df, x=x, y=y, title=title or f"Scatter – {x} vs {y}", template=tmpl, width=w, height=h, opacity=0.7)
    return fig


def _box(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if y and y in df.columns and pd.api.types.is_numeric_dtype(df[y]):
        fig = px.box(df, x=x, y=y, title=title or f"Box Plot – {y} by {x}", template=tmpl, width=w, height=h)
    else:
        fig = px.box(df, y=x, title=title or f"Box Plot – {x}", template=tmpl, width=w, height=h)
    return fig


def _count(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    counts = df[x].value_counts().reset_index()
    counts.columns = [x, "count"]
    fig = px.bar(
        counts.sort_values("count", ascending=False),
        x=x, y="count",
        title=title or f"Count Plot – {x}",
        template=tmpl, width=w, height=h,
        color=x,
    )
    return fig


def _violin(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if y and y in df.columns and pd.api.types.is_numeric_dtype(df[y]):
        fig = px.violin(df, x=x, y=y, box=True, title=title or f"Violin – {y} by {x}", template=tmpl, width=w, height=h)
    else:
        fig = px.violin(df, y=x, box=True, title=title or f"Violin – {x}", template=tmpl, width=w, height=h)
    return fig


def _heatmap(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    numeric = df.select_dtypes(include="number")
    if numeric.empty:
        fig = go.Figure()
        fig.update_layout(title="No numeric columns for heatmap", template=tmpl, width=w, height=h)
        return fig

    corr = numeric.corr()
    fig = go.Figure(
        data=go.Heatmap(
            z=corr.values,
            x=corr.columns.tolist(),
            y=corr.index.tolist(),
            colorscale="RdBu_r",
            zmin=-1, zmax=1,
            text=np.round(corr.values, 2),
            texttemplate="%{text}",
            hovertemplate="x: %{x}<br>y: %{y}<br>correlation: %{z:.3f}<extra></extra>",
        )
    )
    fig.update_layout(
        title=dict(text=title or "Correlation Heatmap", font=dict(size=18)),
        template=tmpl, width=max(w, 600), height=max(h, 500),
    )
    return fig


def _pair(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    numeric_cols = df.select_dtypes(include="number").columns.tolist()[:5]
    if len(numeric_cols) < 2:
        fig = go.Figure()
        fig.update_layout(title="Need ≥ 2 numeric columns for pair plot", template=tmpl, width=w, height=h)
        return fig

    fig = px.scatter_matrix(
        df[numeric_cols],
        dimensions=numeric_cols,
        title=title or "Pair Plot",
        template=tmpl,
        width=max(w, 800),
        height=max(h, 800),
    )
    fig.update_traces(diagonal_visible=True, marker=dict(size=3, opacity=0.5))
    return fig


def _area(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if y and y in df.columns:
        fig = px.area(df.sort_values(x), x=x, y=y, title=title or f"Area Chart – {x} vs {y}", template=tmpl, width=w, height=h)
    else:
        fig = px.area(df.reset_index().sort_values("index"), x="index", y=x, title=title or f"Area Chart – {x}", template=tmpl, width=w, height=h)
    return fig


def _bubble(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    if not y or y not in df.columns:
        y = x

    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    # Pick a size column – first numeric that isn't x or y
    size_col = next((c for c in numeric_cols if c not in (x, y)), None)

    if size_col:
        temp = df[[x, y, size_col]].dropna()
        size_vals = temp[size_col].abs()
        # Normalise size to avoid tiny/huge bubbles
        if size_vals.max() > 0:
            size_vals = (size_vals / size_vals.max()) * 40 + 5
        fig = px.scatter(
            temp, x=x, y=y, size=size_vals, size_max=50,
            title=title or f"Bubble Chart – {x} vs {y} (size: {size_col})",
            template=tmpl, width=w, height=h,
        )
    else:
        fig = px.scatter(
            df, x=x, y=y, title=title or f"Bubble Chart – {x} vs {y}",
            template=tmpl, width=w, height=h,
        )
    return fig


# ── Dashboard Overview Builders ───────────────────────────────────────────────

def _column_types(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    counts = df.dtypes.astype(str).value_counts().reset_index()
    counts.columns = ["Type", "Count"]
    fig = px.pie(counts, names="Type", values="Count", title=title or "Column Types Distribution", template=tmpl, width=w, height=h)
    fig.update_traces(textposition="inside", textinfo="percent+label")
    return fig


def _missing_values(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    missing = df.isna().sum().reset_index()
    missing.columns = ["Column", "Missing"]
    missing = missing[missing["Missing"] > 0]
    if missing.empty:
        fig = go.Figure()
        fig.update_layout(title="No missing values!", template=tmpl, width=w, height=h)
        return fig
    fig = px.bar(missing.sort_values("Missing", ascending=False), x="Column", y="Missing", title=title or "Missing Values per Column", template=tmpl, width=w, height=h)
    return fig


def _top_categories(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    cat_cols = df.select_dtypes(include=["object", "category", "string"]).columns
    if not len(cat_cols):
        fig = go.Figure()
        fig.update_layout(title="No categorical columns", template=tmpl, width=w, height=h)
        return fig
    
    col = cat_cols[0]
    counts = df[col].value_counts().head(10).reset_index()
    counts.columns = [col, "count"]
    fig = px.bar(counts, x=col, y="count", title=title or f"Top Categories in '{col}'", template=tmpl, width=w, height=h)
    return fig


def _numeric_distribution(df: pd.DataFrame, x: str, y: str | None, title: str, tmpl: str, w: int, h: int) -> go.Figure:
    num_cols = df.select_dtypes(include="number").columns
    if not len(num_cols):
        fig = go.Figure()
        fig.update_layout(title="No numeric columns", template=tmpl, width=w, height=h)
        return fig
    
    col = num_cols[0]
    fig = px.histogram(df, x=col, title=title or f"Numeric Distribution ('{col}')", template=tmpl, width=w, height=h)
    return fig


# ── Dispatcher ────────────────────────────────────────────────────────────────

_BUILDERS: dict[str, Any] = {
    "bar": _bar,
    "line": _line,
    "pie": _pie,
    "histogram": _histogram,
    "scatter": _scatter,
    "box": _box,
    "count": _count,
    "violin": _violin,
    "heatmap": _heatmap,
    "pair": _pair,
    "area": _area,
    "bubble": _bubble,
    "column_types": _column_types,
    "missing_values": _missing_values,
    "top_categories": _top_categories,
    "numeric_distribution": _numeric_distribution,
}


def generate_chart(
    df: pd.DataFrame,
    chart_type: str,
    x_col: str,
    y_col: str | None = None,
    title: str = "",
    color_theme: str = "plotly",
    width: int = 800,
    height: int = 500,
) -> dict[str, Any]:
    """Build the requested chart and return the Plotly figure as a dict."""
    tmpl = _template(color_theme)
    builder = _BUILDERS.get(chart_type)
    if builder is None:
        raise ValueError(f"Unsupported chart type: {chart_type}")

    # Chart types that do NOT need x_col
    NO_X_REQUIRED = {"heatmap", "pair", "column_types", "missing_values", "top_categories", "numeric_distribution"}
    if chart_type not in NO_X_REQUIRED and not x_col:
        raise ValueError(f"Chart type '{chart_type}' requires an X-axis column.")
    if x_col and x_col not in df.columns:
        raise ValueError(f"Column '{x_col}' not found in the dataset.")

    fig = builder(df, x_col, y_col, title, tmpl, width, height)
    return json.loads(fig.to_json())

