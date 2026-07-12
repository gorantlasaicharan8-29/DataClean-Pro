import os
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
import aiofiles
from app.models.schemas import UploadResponse
from app.config import MAX_UPLOAD_SIZE, UPLOAD_DIR, ALLOWED_EXTENSIONS
from app.services.data_service import get_dataset_info
from app.sample_data import generate_sample_dataset
import app.main

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file extension")
    
    file_id = str(uuid.uuid4())
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    
    file_size = 0
    async with aiofiles.open(file_path, 'wb') as out_file:
        while content := await file.read(1024 * 1024):  # 1MB chunks
            file_size += len(content)
            if file_size > MAX_UPLOAD_SIZE:
                raise HTTPException(status_code=413, detail="File too large")
            await out_file.write(content)
    
    try:
        if ext == '.csv':
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    session_id = str(uuid.uuid4())
    import datetime
    upload_time = datetime.datetime.now().isoformat()
    
    app.main.sessions[session_id] = {
        "original_df": df.copy(),
        "cleaned_df": df.copy(),
        "filename": file.filename,
        "upload_time": upload_time
    }
    
    info = get_dataset_info(df)
    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        rows=info['rows'],
        columns=info['columns'],
        file_size=file_size,
        upload_time=upload_time
    )

@router.post("/sample-data", response_model=UploadResponse)
def load_sample_data():
    df = generate_sample_dataset()
    session_id = str(uuid.uuid4())
    import datetime
    upload_time = datetime.datetime.now().isoformat()
    
    app.main.sessions[session_id] = {
        "original_df": df.copy(),
        "cleaned_df": df.copy(),
        "filename": "sample_employee_data.csv",
        "upload_time": upload_time
    }
    
    info = get_dataset_info(df)
    return UploadResponse(
        session_id=session_id,
        filename="sample_employee_data.csv",
        rows=info['rows'],
        columns=info['columns'],
        file_size=0,
        upload_time=upload_time
    )
