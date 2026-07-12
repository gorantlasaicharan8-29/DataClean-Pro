"""Data-cleaning operations – auto clean and individual operation handlers."""

from __future__ import annotations

import re
from typing import Any

import numpy as np
import pandas as pd


# ── Individual operation functions ────────────────────────────────────────────

def remove_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    before = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    removed = before - len(df)
    return df, f"Removed {removed} duplicate rows"


def remove_empty_rows(df: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    before = len(df)
    df = df.dropna(how="all").reset_index(drop=True)
    removed = before - len(df)
    return df, f"Removed {removed} completely empty rows"


def fill_missing(
    df: pd.DataFrame,
    column: str,
    strategy: str = "median",
    custom_value: Any = None,
) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    missing_before = int(df[column].isna().sum())
    if missing_before == 0:
        return df, f"No missing values in '{column}'"

    if strategy == "mean":
        fill_val = df[column].mean()
        df[column] = df[column].fillna(fill_val)
    elif strategy == "median":
        fill_val = df[column].median()
        df[column] = df[column].fillna(fill_val)
    elif strategy == "mode":
        mode_vals = df[column].mode()
        fill_val = mode_vals.iloc[0] if not mode_vals.empty else None
        if fill_val is not None:
            df[column] = df[column].fillna(fill_val)
    elif strategy == "custom":
        fill_val = custom_value
        df[column] = df[column].fillna(custom_value)
    else:
        return df, f"Unknown strategy '{strategy}'"

    return df, f"Filled {missing_before} missing values in '{column}' using {strategy}"


def drop_missing_rows(df: pd.DataFrame, column: str) -> tuple[pd.DataFrame, str]:
    before = len(df)
    df = df.dropna(subset=[column]).reset_index(drop=True)
    removed = before - len(df)
    return df, f"Dropped {removed} rows with missing '{column}'"


def convert_dtype(
    df: pd.DataFrame, column: str, target_type: str
) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    try:
        if target_type in ("int", "int64"):
            df[column] = pd.to_numeric(df[column], errors="coerce").astype("Int64")
        elif target_type in ("float", "float64"):
            df[column] = pd.to_numeric(df[column], errors="coerce")
        elif target_type in ("str", "string", "object"):
            df[column] = df[column].astype(str)
        elif target_type in ("datetime", "date"):
            df[column] = pd.to_datetime(df[column], errors="coerce")
        elif target_type in ("category",):
            df[column] = df[column].astype("category")
        elif target_type in ("bool", "boolean"):
            df[column] = df[column].astype(bool)
        else:
            df[column] = df[column].astype(target_type)
    except Exception as exc:
        return df, f"Failed to convert '{column}' to {target_type}: {exc}"
    return df, f"Converted '{column}' to {target_type}"


def rename_column(
    df: pd.DataFrame, old_name: str, new_name: str
) -> tuple[pd.DataFrame, str]:
    df = df.rename(columns={old_name: new_name})
    return df, f"Renamed column '{old_name}' → '{new_name}'"


def drop_column(df: pd.DataFrame, column: str) -> tuple[pd.DataFrame, str]:
    df = df.drop(columns=[column])
    return df, f"Dropped column '{column}'"


def trim_whitespace(df: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    count = 0
    for col in df.select_dtypes(include=["object", "string"]).columns:
        original = df[col].copy()
        df[col] = df[col].str.strip()
        count += int((original != df[col]).sum())
    return df, f"Trimmed whitespace in {count} cell(s)"


def to_lowercase(df: pd.DataFrame, column: str) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    df[column] = df[column].astype(str).str.lower()
    return df, f"Converted '{column}' to lowercase"


def to_uppercase(df: pd.DataFrame, column: str) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    df[column] = df[column].astype(str).str.upper()
    return df, f"Converted '{column}' to uppercase"


def remove_special_chars(df: pd.DataFrame, column: str) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    df[column] = df[column].astype(str).apply(
        lambda x: re.sub(r"[^a-zA-Z0-9\s]", "", x)
    )
    return df, f"Removed special characters from '{column}'"


def drop_null_columns(
    df: pd.DataFrame, threshold: float = 0.5
) -> tuple[pd.DataFrame, str]:
    before = len(df.columns)
    null_ratio = df.isna().mean()
    cols_to_drop = null_ratio[null_ratio > threshold].index.tolist()
    df = df.drop(columns=cols_to_drop)
    dropped = before - len(df.columns)
    return df, f"Dropped {dropped} column(s) exceeding {threshold*100:.0f}% null threshold"


def normalize_column_names(df: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    df = df.copy()
    new_cols: dict[str, str] = {}
    for col in df.columns:
        cleaned = col.strip().lower()
        cleaned = re.sub(r"\s+", "_", cleaned)
        cleaned = re.sub(r"[^a-z0-9_]", "", cleaned)
        new_cols[col] = cleaned
    df = df.rename(columns=new_cols)
    return df, "Normalized column names to snake_case"


# ── Operation dispatcher ─────────────────────────────────────────────────────

def apply_operation(
    df: pd.DataFrame, operation: dict[str, Any]
) -> tuple[pd.DataFrame, str]:
    """Apply a single cleaning operation and return (new_df, description)."""
    op_type = operation.get("type", "")

    match op_type:
        case "remove_duplicates":
            return remove_duplicates(df)
        case "remove_empty_rows":
            return remove_empty_rows(df)
        case "fill_missing":
            return fill_missing(
                df,
                column=operation["column"],
                strategy=operation.get("strategy", "median"),
                custom_value=operation.get("custom_value"),
            )
        case "drop_missing_rows":
            return drop_missing_rows(df, column=operation["column"])
        case "convert_dtype":
            return convert_dtype(
                df,
                column=operation["column"],
                target_type=operation["target_type"],
            )
        case "rename_column":
            return rename_column(
                df,
                old_name=operation["old_name"],
                new_name=operation["new_name"],
            )
        case "drop_column":
            return drop_column(df, column=operation["column"])
        case "trim_whitespace":
            return trim_whitespace(df)
        case "to_lowercase":
            return to_lowercase(df, column=operation["column"])
        case "to_uppercase":
            return to_uppercase(df, column=operation["column"])
        case "remove_special_chars":
            return remove_special_chars(df, column=operation["column"])
        case "drop_null_columns":
            return drop_null_columns(
                df, threshold=operation.get("threshold", 0.5)
            )
        case "normalize_column_names":
            return normalize_column_names(df)
        case _:
            return df, f"Unknown operation: {op_type}"


# ── Auto-clean pipeline ──────────────────────────────────────────────────────

def auto_clean(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """Run the default auto-cleaning pipeline and return (cleaned_df, log)."""
    log: list[str] = []

    # 1. Remove exact duplicates
    df, msg = remove_duplicates(df)
    log.append(msg)

    # 2. Trim whitespace
    df, msg = trim_whitespace(df)
    log.append(msg)

    # 3. Normalize column names
    df, msg = normalize_column_names(df)
    log.append(msg)

    # 4. Fill missing: median for numeric, mode for categorical
    for col in df.columns:
        if df[col].isna().sum() == 0:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            df, msg = fill_missing(df, col, strategy="median")
        else:
            df, msg = fill_missing(df, col, strategy="mode")
        log.append(msg)

    return df, log
