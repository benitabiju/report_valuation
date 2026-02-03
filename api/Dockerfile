FROM python:3.12-slim

# ---- system deps ----
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-tam \
    poppler-utils \
    libgl1 \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ---- env vars ----
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata
ENV TESSERACT_PATH=/usr/bin/tesseract

# ---- workdir ----
WORKDIR /app

# ---- install python deps ----
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- copy app ----
COPY . .

# ---- expose ----
EXPOSE 8000

# ---- run ----
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
