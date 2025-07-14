import subprocess
import os
import time
import cv2
import psutil
import GPUtil

METHOD = "Low Light Enhancement"

from app.utils.db_logger import log_run

def get_system_usage():
    """Returns current CPU and GPU usage in percentage."""
    cpu = psutil.cpu_percent()
    gpus = GPUtil.getGPUs()
    gpu = gpus[0].load * 100 if gpus else None
    return cpu, gpu

def get_video_metadata(video_path):
    """Returns video duration, resolution, fps, and frame count."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 0, "Unknown", 0, 0

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps if fps else 0
    resolution = f"{width}x{height}"

    cap.release()
    return duration, resolution, fps, frame_count

def process_video_file(input_path: str, method: str, user: str = "unknown_user") -> str:
    """
    Processes the input video using the selected method and logs execution details.

    Args:
        input_path (str): Path to the uploaded input video file.
        method (str): Processing method - 'clahe', 'unet', or 'unet_selective'.
        user (str): Username or identifier for the user running the process.

    Returns:
        str: Path to the processed output video, or empty string if failed.
    """

    filename = os.path.basename(input_path)
    output_path = f"processed_videos/processed_{method}_{filename}"
    error = None
    processed_count = 0  # Default in case of failure

    try:
        if method.lower() == "clahe":
            cmd = ["python", "app/run_clahe.py", input_path, output_path]
            model_used = "CLAHE"
        elif method.lower() == "unet":
            cmd = ["python", "app/run_unet.py", input_path, output_path]
            model_used = "UNet"
        else:
            method = "unet"
            print(f"[ERROR] Invalid method selected: choosing UNet as default {method}")
            output_path = f"processed_videos/processed_{method}_{filename}"
            cmd = ["python", "app/run_unet.py", input_path, output_path]
            model_used = "UNet (fallback)"

        print(f"[INFO] Running command: {' '.join(cmd)}")

        start_time = time.time()
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        end_time = time.time()

        output_lines = result.stdout.splitlines()
        for line in output_lines:
            if line.startswith("PROCESSED_COUNT="):
                processed_count = int(line.split("=")[1])
                break

        if os.path.exists(output_path):
            total_time = end_time - start_time
            duration, resolution, fps, frame_count = get_video_metadata(input_path)
            avg_delay_per_frame = total_time / frame_count if frame_count else 0
            cpu_usage, gpu_usage = get_system_usage()
            device = "GPU" if gpu_usage is not None else "CPU"

            log_run(
                process=METHOD,
                model_used=model_used,
                video_duration=duration,
                resolution=resolution,
                fps=fps,
                total_frames=frame_count,
                processed_frames=processed_count,
                total_time=total_time,
                avg_delay_per_frame=avg_delay_per_frame,
                device=device,
                cpu_usage=cpu_usage,
                gpu_usage=gpu_usage,
                input_file=input_path,
                output_file=output_path,
                error=error
            )

            return output_path
        else:
            print(f"[ERROR] Output video not found at: {output_path}")
            error = "Output file missing."

    except subprocess.CalledProcessError as e:
        error = str(e)
        print(f"[ERROR] Video processing failed: {error}")

    # Log failure
    duration, resolution, fps, frame_count = get_video_metadata(input_path)
    avg_delay_per_frame = 0
    cpu_usage, gpu_usage = get_system_usage()
    device = "GPU" if gpu_usage is not None else "CPU"

    log_run(
        process=method,
        model_used=model_used,
        video_duration=duration,
        resolution=resolution,
        fps=fps,
        total_frames=frame_count,
        processed_frames=0,
        total_time=0,
        avg_delay_per_frame=avg_delay_per_frame,
        device=device,
        cpu_usage=cpu_usage,
        gpu_usage=gpu_usage,
        input_file=input_path,
        output_file=output_path,
        error=error
    )

    return ""
