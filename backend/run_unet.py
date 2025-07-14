import cv2
import torch
import numpy as np
import torch.nn as nn
from torchvision import transforms
from unet_model import UNet
from torchvision.models import convnext_base, ConvNeXt_Base_Weights
import time
import sys
from PIL import Image

# === Argument Parsing ===
if len(sys.argv) != 3:
    print("Usage: python run_unet_classifier.py <input_video_path> <output_video_path>")
    exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

# === Config ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
frame_skip = 4

# === Load UNet Model ===
model = UNet().to(device)
model.load_state_dict(torch.load("unet_model_30k_v1.pth", map_location=device))
model.eval()

# === Load Classifier ===
weights = ConvNeXt_Base_Weights.DEFAULT
classifier = convnext_base(weights=weights)
classifier.classifier[2] = torch.nn.Linear(classifier.classifier[2].in_features, 1)
classifier.load_state_dict(torch.load("Classifier.pt", map_location=device))
classifier = classifier.to(device)
classifier.eval()

classifier_transform = transforms.Compose([
    transforms.Resize((360, 360)),
    transforms.ToTensor()
])

def classify_frame(frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img)
    input_tensor = classifier_transform(img_pil).unsqueeze(0).to(device)
    with torch.no_grad():
        output = torch.sigmoid(classifier(input_tensor)).item()
    return output >= 0.5  # True = Low-light frame

# === Preprocessing ===
transform = transforms.Compose([
    transforms.ToTensor()
])

def tensor_to_image(tensor):
    img = tensor.detach().cpu().numpy()
    img = np.transpose(img, (1, 2, 0))
    img = (img * 255).clip(0, 255).astype(np.uint8)
    return img

# === Video Setup ===
cap = cv2.VideoCapture(input_path)
if not cap.isOpened():
    print(f"Error: Couldn't open video: {input_path}")
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter(output_path, fourcc, fps // (frame_skip + 1), (width * 2, height))

frame_index = 0
frame_count = 0
enhanced_frames = 0
start_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    if frame_index % (frame_skip + 1) != 0:
        frame_index += 1
        continue

    original = frame.copy()

    # === Step 1: Classify frame ===
    is_low_light = classify_frame(original)

    if is_low_light:
        input_img = cv2.resize(frame, (512, 512))
        input_tensor = transform(input_img).unsqueeze(0).to(device)

        with torch.no_grad():
            output_tensor = model(input_tensor)[0]

        output_img = tensor_to_image(output_tensor)
        output_img = cv2.resize(output_img, (original.shape[1], original.shape[0]))
        enhanced_frames += 1
    else:
        output_img = original  # Skip UNet for well-lit frames

    # === Save Side-by-Side ===
    side_by_side = np.concatenate((original, output_img), axis=1)
    out.write(side_by_side)

    frame_count += 1
    frame_index += 1

cap.release()
out.release()

elapsed_time = time.time() - start_time

# === Summary ===
print("UNet + Classifier Processing complete.")
print(f"Frames processed: {frame_count}")
print(f"Frames classified as low-light (enhanced): {enhanced_frames}")
print(f"Time taken: {elapsed_time:.2f} sec | Avg/frame: {elapsed_time / frame_count:.4f} sec")
print(f"Output saved to: {output_path}")
print(f"PROCESSED_COUNT={enhanced_frames}")  # Important for logging