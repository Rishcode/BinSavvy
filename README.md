# BinSavvy

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688)](https://fastapi.tiangolo.com/)
[![YOLO](https://img.shields.io/badge/YOLO-v8-blueviolet)](https://ultralytics.com/yolo)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3.0-orange)](https://pytorch.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-orange)](https://www.jenkins.io/)

BinSavvy is a **web-based waste management system** powered by machine learning. It leverages a **YOLO model** to segment waste images, enabling efficient classification (e.g., recyclable, organic, non-recyclable) for administrative action. Built with a **Next.js** frontend, **FastAPI** backend, and containerized with **Docker**, BinSavvy uses **Jenkins** for automated CI/CD.

## 📖 Table of Contents

- [Features](#-features)
- [How It Works](#-how-it-works)
- [Technologies Used](#️-technologies-used)
- [Quick Start](#-quick-start)
- [Docker Setup](#-docker-setup)
- [Jenkins Automation](#-jenkins-automation)
- [Usage](#️-usage)
- [Model Training](#-model-training)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## ✨ Features

- **Advanced Image Segmentation**: Uses a trained YOLO model to identify and classify waste materials.
- **Interactive Web Interface**: Next.js-powered UI for seamless image uploads and result visualization.
- **Actionable Insights**: Provides administrators with segmented outputs for waste management decisions.
- **Scalable Deployment**: Dockerized for consistent, portable deployments.
- **Automated CI/CD**: Jenkins automates builds and deployments for rapid iteration.


## 🚀 How It Works

1. **Upload Images**: Users upload waste photos through the Next.js web interface.
2. **YOLO Processing**: The FastAPI backend processes images using a YOLO model for segmentation and classification.
3. **View Results**: Results are displayed on the web dashboard for administrative review.

📽️ [Watch a Demo](https://via.placeholder.com/600x300.png?text=Demo+Video)

## 🛠️ Technologies Used

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation.
- **Tailwind CSS**: Utility-first CSS framework for responsive styling.
- **TypeScript**: Type-safe JavaScript for robust frontend code.
- **Node.js**: Runtime environment for Next.js.

### Backend
- **Python**: Core language for backend logic and ML integration.
- **FastAPI**: High-performance framework for building APIs.
- **YOLO (You Only Look Once)**: ML model for object detection and segmentation.
- **PyTorch**: Deep learning framework for YOLO model training/deployment.
- **OpenCV**: Library for image processing and computer vision.
- **NumPy**: Library for numerical computations.
- **BCC (v0.1.10)**: System performance monitoring library.

### DevOps
- **Docker**: Containerization for consistent application packaging.
- **Jenkins**: Automation server for continuous integration and deployment.

## ⚡ Quick Start

Get BinSavvy running locally in minutes!

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Rishcode/BinSavvy.git
   cd BinSavvy


2. **Run with Docker**:
```bash
docker build -t binsavvy:latest .
docker run -p 3000:3000 -p 5000:5000 binsavvy:latest
```

**Access the App**:

Web Interface:
```bash
 http://localhost:3000
```
API:
```bash
 http://localhost:5000
```




🐳 Docker Setup

Ensure Docker is installed.

***Build the Docker image:***
```bash
docker build -t binsavvy:latest .
```


***Run the container:***
```bash
docker run -p 3000:3000 -p 5000:5000 binsavvy:latest
```

***Access:***
Frontend:
```bash
http://localhost:3000
```
API Docs:
```bash
http://localhost:5000/docs
```



***Docker Multi-Stage Build DetailsThe Dockerfile uses a multi-stage build:***

Stage 1: Builds the Next.js frontend using Node.js 20.  
Stage 2: Sets up the Python 3.11 backend with FastAPI, YOLO, and dependencies.  
Both services are combined in a single container, exposing ports 3000 (Next.js) and 5000 (FastAPI).


***🔄 Jenkins Automation****
Automate builds and deployments with Jenkins:

Install Jenkins and plugins (Docker Pipeline, Git).
Configure a pipeline using the Jenkinsfile in the repository.
Set up GitHub webhooks to trigger builds on code pushes.
Monitor build status in the Jenkins dashboard.

🖼️ Usage

Navigate to http://localhost:3000.
Upload waste images via the web interface.
View segmented results on the dashboard.
Access the API at http://localhost:5000 for programmatic interactions.

Sample segmentation output from the YOLO model.
🧠 Model Training
To retrain or fine-tune the YOLO model:

Prepare a labeled dataset in YOLO format (see backend/data/README.md).
Update backend/config/yolo_config.yaml.
Run the training script:python backend/scripts/train_yolo.py --config backend/config/yolo_config.yaml


```bash
📂 Project Structure
BinSavvy/
├── app/                    # Next.js pages and layouts
├── components/             # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets (images, fonts)
├── styles/                # Tailwind CSS styles
├── types/                 # TypeScript definitions
├── backend/               # FastAPI backend
│   ├── requirements.txt   # Python dependencies
│   ├── fastapi_app.py     # FastAPI application
│   └── scripts/           # Model training scripts
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Docker configuration
├── Jenkinsfile            # Jenkins pipeline
└── README.md              # Project documentation
```
***🤝 Contributing***
Contributions are welcome! To contribute:

***Fork*** the repository.
Create a branch: git checkout -b feature-branch.
Commit changes: git commit -m 'Add feature'.
Push: git push origin feature-branch.
Open a pull request.

***📬 Contact***
Questions or feedback? Open an issue on the GitHub repository or contact the maintainers.

⭐ Star this repo if BinSavvy helps you!💬 Join the discussion on GitHub Issues.```
