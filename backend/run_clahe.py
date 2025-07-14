import cv2
import numpy as np
import time
import sys
import os
import torch
import torch.nn as nn
import traceback
from torchvision import transforms
from torchvision.models import convnext_base, ConvNeXt_Base_Weights
from PIL import Image

# === Argument Parsing ===
if len(sys.argv) != 3:
    print("Usage: python run_clahe.py <input_video_path> <output_video_path>")
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

# === Resolve Paths for Docker Compatibility ===
input_path = os.path.abspath(input_path)
output_path = os.path.abspath(output_path)
model_path = os.path.abspath("app/Classifier.pt")

# === Device Setup ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# === Load Classifier Model ===
try:
    weights = ConvNeXt_Base_Weights.DEFAULT
    model = convnext_base(weights=weights)
    model.classifier[2] = nn.Linear(model.classifier[2].in_features, 1)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
except Exception as e:
    print("[ERROR] Failed to load classifier model.")
    traceback.print_exc()
    sys.exit(2)

# === Classifier Transform ===
transform = transforms.Compose([
    transforms.Resize((360, 360)),
    transforms.ToTensor()
])

# === Helper Functions ===
def apply_CLAHE_to_frame(frame):
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=10.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    merged = cv2.merge((cl, a, b))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

def classify_frame(frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img)
    input_tensor = transform(img_pil).unsqueeze(0).to(device)
    with torch.no_grad():
        output = torch.sigmoid(model(input_tensor)).item()
    return output >= 0.5  # Returns True if low-light

# === Video Processing ===
try:
    frames_to_skip = 4
    processing_size = (640, 480)

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Could not open input video: {input_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    output_fps = fps / (frames_to_skip + 1)
    output_width = processing_size[0] * 2
    output_height = processing_size[1]

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(output_path, fourcc, output_fps, (output_width, output_height))

    frame_count = 0
    processed_count = 0
    total_processing_time = 0
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % (frames_to_skip + 1) == 0:
            frame_start = time.time()
            resized_frame = cv2.resize(frame, processing_size)

            is_low_light = classify_frame(resized_frame)

            if is_low_light:
                enhanced_frame = apply_CLAHE_to_frame(resized_frame)
            else:
                enhanced_frame = resized_frame.copy()

            side_by_side = np.hstack((resized_frame, enhanced_frame))
            out.write(side_by_side)

            total_processing_time += time.time() - frame_start
            processed_count += 1

        frame_count += 1

    cap.release()
    out.release()

    elapsed_time = time.time() - start_time
    print(f"\nProcessing complete.")
    print(f"Processed frames: {processed_count}/{frame_count}")
    print(f"Total time: {elapsed_time:.2f} sec | Avg per frame: {total_processing_time/processed_count:.4f} sec")
    print(f"Output saved to: {output_path}")
    print(f"PROCESSED_COUNT={processed_count}")

except Exception as e:
    print("[ERROR] Video processing failed:")
    traceback.print_exc()
    sys.exit(2)
