FROM python:3.12-slim

# System deps (OCR + PDF)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-tam \
    poppler-utils \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app ./app

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]