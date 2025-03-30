import requests
import argparse
import os
import sys
from PIL import Image
import io

def test_health(url):
    """Test the health endpoint"""
    try:
        response = requests.get(f"{url}/health")
        response.raise_for_status()
        print("Health check response:")
        print(response.json())
        return True
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_detection(url, image_path, model="yolo", media_type="image", confidence=0.25):
    """Test the detection endpoint with an image or video"""
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return False
    
    try:
        # Send the file to the API
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f)}
            data = {
                'model': model, 
                'media_type': media_type,
                'confidence': str(confidence)
            }
            
            print(f"Sending request to {url}/detect")
            print(f"Parameters: model={model}, media_type={media_type}, confidence={confidence}")
            
            response = requests.post(f"{url}/detect", files=files, data=data)
        
        # Check the response
        if response.status_code == 200:
            result = response.json()
            print("\nDetection successful!")
            print(f"Processing time: {result.get('processing_time', 'N/A')}s")
            print(f"Detections: {len(result.get('detections', []))}")
            print(f"Class counts: {result.get('class_counts', {})}")
            if 'waste_density' in result:
                print(f"Waste density: {result.get('waste_density', 'N/A')}%")
            return True
        else:
            print(f"Detection failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Detection test failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Test the detection API")
    parser.add_argument("--url", default="http://localhost:5000", help="API base URL")
    parser.add_argument("--file", help="Path to test image or video")
    parser.add_argument("--model", default="yolo", choices=["yolo", "best2"], help="Model to use")
    parser.add_argument("--type", default="image", choices=["image", "video"], help="Media type")
    parser.add_argument("--confidence", type=float, default=0.25, help="Confidence threshold (0.0-1.0)")
    args = parser.parse_args()
    
    print(f"Testing API at {args.url}")
    
    # Test health endpoint
    if not test_health(args.url):
        print("Health check failed, exiting")
        sys.exit(1)
    
    # Test detection endpoint if file provided
    if args.file:
        if not test_detection(args.url, args.file, args.model, args.type, args.confidence):
            print("Detection test failed")
            sys.exit(1)
    else:
        print("\nNo test file provided. To test detection, use --file argument.")
    
    print("\nAll tests passed!")

if __name__ == "__main__":
    main()

