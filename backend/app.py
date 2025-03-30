from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import io
from PIL import Image
import traceback
import os
import cv2
import numpy as np
import tempfile
import uuid
from ultralytics import YOLO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes and origins

# Check if model files exist
waste_model_path = os.environ.get('YOLO_MODEL_PATH', 'best.pt')
drone_model_path = os.environ.get('DRONE_MODEL_PATH', 'best2.pt')

waste_model_exists = os.path.exists(waste_model_path)
drone_model_exists = os.path.exists(drone_model_path)

# Load the YOLO models
waste_model = None
drone_model = None

if waste_model_exists:
    try:
        waste_model = YOLO(waste_model_path)
        print(f"Waste model loaded successfully from {waste_model_path}")
    except Exception as e:
        print(f"Error loading waste model: {e}")
        traceback.print_exc()
else:
    print(f"Waste model file not found at {waste_model_path}")

if drone_model_exists:
    try:
        drone_model = YOLO(drone_model_path)
        print(f"Drone model loaded successfully from {drone_model_path}")
    except Exception as e:
        print(f"Error loading drone model: {e}")
        traceback.print_exc()
else:
    print(f"Drone model file not found at {drone_model_path}")

@app.route('/detect', methods=['POST'])
def detect():
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({"error": "No file provided in the request"}), 400
    
    # Get parameters
    file = request.files['file']
    model_id = request.form.get('model', 'yolo')
    media_type = request.form.get('media_type', 'image')
    confidence = float(request.form.get('confidence', 0.25))
    
    print(f"Received request: model={model_id}, media_type={media_type}, confidence={confidence}, file={file.filename}")
    
    # Select the appropriate model
    if model_id == 'yolo':
        model = waste_model
        model_path = waste_model_path
    elif model_id == 'best2':
        model = drone_model
        model_path = drone_model_path
    else:
        return jsonify({"error": f"Unknown model: {model_id}"}), 400
    
    # Check if model is loaded
    if model is None:
        return jsonify({
            "error": f"Model not loaded. Check if the model file exists at {model_path} and the model can be loaded correctly."
        }), 500
    
    try:
        # Process based on media type
        if media_type == 'image':
            return process_image(file, model, confidence)
        elif media_type == 'video':
            return process_video(file, model, confidence)
        else:
            return jsonify({"error": f"Unsupported media type: {media_type}"}), 400
            
    except Exception as e:
        print(f"Error processing file: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def process_image(image_file, model, confidence_threshold=0.25):
    try:
        # Open and validate the image
        try:
            img = Image.open(image_file.stream)
            img.verify()  # Verify that it's a valid image
            img = Image.open(image_file.stream)  # Reopen after verify
        except Exception as e:
            print(f"Invalid image: {e}")
            return jsonify({"error": f"Invalid image: {str(e)}"}), 400
        
        # Get image dimensions for density calculation
        img_width, img_height = img.size
        img_area = img_width * img_height
        
        # Start timing
        start_time = time.time()
        
        # Run inference with YOLOv8
        results = model(img, conf=confidence_threshold)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Process results
        detections = []
        class_counts = {}
        total_waste_area = 0
        
        # Convert YOLOv8 results to JSON-serializable format
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                # Get confidence
                conf = box.conf[0].item()
                # Get class
                cls = int(box.cls[0].item())
                # Get class name
                class_name = model.names[cls]
                
                # Calculate box area for density
                box_width = x2 - x1
                box_height = y2 - y1
                box_area = box_width * box_height
                total_waste_area += box_area
                
                # Update class counts
                if class_name in class_counts:
                    class_counts[class_name] += 1
                else:
                    class_counts[class_name] = 1
                
                detections.append({
                    "box": [float(x1), float(y1), float(x2 - x1), float(y2 - y1)],
                    "class_name": class_name,
                    "confidence": float(conf)
                })
        
        # Calculate waste density (percentage of image covered by waste)
        waste_density = (total_waste_area / img_area) * 100 if img_area > 0 else 0
        
        response_data = {
            "detections": detections,
            "processing_time": processing_time,
            "class_counts": class_counts,
            "waste_density": waste_density
        }
        
        print(f"Processed image with {len(detections)} detections in {processing_time:.2f}s, waste density: {waste_density:.2f}%")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error processing image: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def process_video(video_file, model, confidence_threshold=0.25):
    try:
        # Save the uploaded video to a temporary file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}.mp4")
        video_file.save(temp_path)
        
        # Open the video file
        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            return jsonify({"error": "Could not open video file"}), 400
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        frame_area = frame_width * frame_height
        
        print(f"Video properties: {frame_count} frames at {fps} FPS, dimensions: {frame_width}x{frame_height}")
        
        # Process a sample of frames (e.g., every 30th frame)
        sample_interval = max(1, int(frame_count / 10))  # Process ~10 frames
        frames_to_process = list(range(0, frame_count, sample_interval))
        
        # Start timing
        start_time = time.time()
        
        all_detections = []
        class_counts = {}
        total_waste_area = 0
        frames_processed = 0
        
        for frame_idx in frames_to_process:
            # Set the frame position
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            
            if not ret:
                continue
                
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_pil = Image.fromarray(frame_rgb)
            
            # Run inference with YOLOv8
            results = model(frame_pil, conf=confidence_threshold)
            
            frame_waste_area = 0
            
            # Process results for this frame
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    # Get confidence
                    conf = box.conf[0].item()
                    # Get class
                    cls = int(box.cls[0].item())
                    # Get class name
                    class_name = model.names[cls]
                    
                    # Calculate box area for density
                    box_width = x2 - x1
                    box_height = y2 - y1
                    box_area = box_width * box_height
                    frame_waste_area += box_area
                    
                    # Update class counts
                    if class_name in class_counts:
                        class_counts[class_name] += 1
                    else:
                        class_counts[class_name] = 1
                    
                    all_detections.append({
                        "box": [float(x1), float(y1), float(x2 - x1), float(y2 - y1)],
                        "class_name": class_name,
                        "confidence": float(conf),
                        "frame": frame_idx
                    })
            
            total_waste_area += frame_waste_area
            frames_processed += 1
        
        # Clean up
        cap.release()
        os.remove(temp_path)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Calculate average waste density across processed frames
        avg_waste_density = (total_waste_area / (frame_area * frames_processed)) * 100 if frames_processed > 0 else 0
        
        # Prepare response
        response_data = {
            "detections": all_detections,
            "processing_time": processing_time,
            "class_counts": class_counts,
            "waste_density": avg_waste_density,
            "frame_count": frame_count,
            "fps": fps
        }
        
        print(f"Processed video with {len(all_detections)} detections across {len(frames_to_process)} frames in {processing_time:.2f}s, avg waste density: {avg_waste_density:.2f}%")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error processing video: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Add a simple health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "models": {
            "waste": {
                "loaded": waste_model is not None,
                "path": waste_model_path,
                "exists": waste_model_exists
            },
            "drone": {
                "loaded": drone_model is not None,
                "path": drone_model_path,
                "exists": drone_model_exists
            }
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"Starting Flask server on {host}:{port}, debug={debug}")
    app.run(host=host, port=port, debug=debug)

