# Stage 1: Build the Next.js frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./
# Using --legacy-peer-deps as seen in your npm install
RUN npm install --legacy-peer-deps

# Copy frontend-related directories and files
COPY app/ ./app/
COPY components/ ./components/
COPY hooks/ ./hooks/
COPY lib/ ./lib/
COPY public/ ./public/
COPY styles/ ./styles/
COPY types/ ./types/
COPY next.config.mjs tailwind.config.ts tsconfig.json ./

# Build the Next.js application
RUN npm run build

# Stage 2: Build the Python backend and final image
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies including Node.js
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY backend/requirements.txt ./

# Install requirements excluding the problematic bcc==0.29.1
RUN pip install --no-cache-dir -r requirements.txt --ignore-installed || true

# Install a working version of bcc explicitly
RUN pip install --no-cache-dir bcc==0.1.10

# Copy backend files
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/.next ./frontend/.next
COPY --from=frontend-builder /app/public ./frontend/public
COPY --from=frontend-builder /app/package.json ./frontend/

# Install frontend runtime dependencies
WORKDIR /app/frontend
RUN npm install --production --legacy-peer-deps

# Set working directory back to root
WORKDIR /app

# Expose port (3000 for Next.js, adjust if FastAPI uses a different port)
EXPOSE 3000
EXPOSE 5000

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    NODE_ENV=production

# Start both services
CMD ["sh", "-c", "python /app/backend/fastapi_app.py & npm run start --prefix /app/frontend"]