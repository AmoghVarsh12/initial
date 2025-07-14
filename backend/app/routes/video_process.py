from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from app.services.processor import process_video_file
import os

# Create a router object
router = APIRouter()

@router.post("/process_video/")
async def process_video(
    file: UploadFile = File(...),
    method: str = Form(...)
):
    """
    Accepts a video file and a processing method.
    Runs the appropriate ML script and returns the output video.
    """

    # Save the uploaded video temporarily
    input_path = f"uploaded_videos/{file.filename}"
    with open(input_path, "wb") as buffer:
        buffer.write(await file.read())

    # Call processing logic
    output_path = process_video_file(input_path, method)

    # Check if processing was successful
    if os.path.exists(output_path):
        return FileResponse(
            output_path,
            media_type='video/mp4',
            filename=os.path.basename(output_path)
        )
    else:
        return {"status": "error", "message": "Video processing failed or invalid method selected."}