"""Application configuration constants."""

MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
UPLOAD_DIR: str = "uploads"
ALLOWED_EXTENSIONS: list[str] = [".csv", ".xlsx", ".xls"]
