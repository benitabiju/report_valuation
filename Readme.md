# Tamil Land Document Translator - Full Stack Application

This application translates Tamil land documents to English using OCR and AI. It consists of a FastAPI backend and a React frontend.

## Project Structure

```
.
├── tamil-translator-api/    # FastAPI backend
│   ├── src/
│   │   ├── main.py          # API endpoints
│   │   ├── services.py      # Processing service
│   │   ├── ocr_service.py   # OCR extraction
│   │   ├── translation_service.py  # AI translation
│   │   └── config.py        # Configuration
│   └── requirements.txt
│
└── web_app/                 # React frontend
    ├── src/
    │   ├── components/      # React components
    │   ├── services/        # API service layer
    │   └── config/          # Configuration
    └── package.json
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- OpenAI API Key
- Tesseract OCR installed

### Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
brew install tesseract-lang  # For Tamil language support
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-tam
```

## Backend Setup

### 1. Navigate to backend directory
```bash
cd tamil-translator-api
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

### 5. Run the backend
```bash
# From tamil-translator-api directory
python -m src.main

# Or using uvicorn
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd web_app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

The default configuration points to `http://localhost:8000`. Modify if needed.

### 4. Run the frontend
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Running the Full Application

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd tamil-translator-api
source venv/bin/activate
python -m src.main
```

**Terminal 2 - Frontend:**
```bash
cd web_app
npm run dev
```

### Option 2: Using a Process Manager

Create a simple bash script `start.sh`:
```bash
#!/bin/bash

# Start backend in background
cd tamil-translator-api
source venv/bin/activate
python -m src.main &
BACKEND_PID=$!

# Start frontend
cd ../web_app
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
```

## Features

### Backend API
- ✅ PDF and image OCR extraction
- ✅ Tamil to English translation
- ✅ Legal text simplification
- ✅ Real-time progress via Server-Sent Events (SSE)
- ✅ Comprehensive error handling
- ✅ Health check endpoint
- ✅ API documentation

### Frontend
- ✅ Drag-and-drop file upload
- ✅ Multiple file processing
- ✅ Real-time progress updates
- ✅ SSE integration
- ✅ Error handling and display
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS

## API Endpoints

### POST `/api/v1/process`
Upload and process a document
- **Input:** Multipart form data with PDF file
- **Output:** Document ID and SSE endpoint

### GET `/api/v1/stream/{document_id}`
Server-Sent Events stream for real-time updates
- **Output:** Event stream with processing status

### GET `/api/v1/status/{document_id}`
Get current processing status

### GET `/health`
Health check endpoint

## Usage

1. **Start both backend and frontend** (see instructions above)
2. **Open the application** at `http://localhost:5173`
3. **Upload PDF documents:** Drag and drop or click to select
4. **Watch real-time processing:** OCR → Translation → Simplification
5. **Review extracted metadata:** Edit fields as needed
6. **Create report:** Finalize the processed document

## Environment Variables

### Backend (`.env`)
```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
TESSERACT_LANG=tam
HOST=0.0.0.0
PORT=8000
DEBUG=True
MAX_FILE_SIZE_MB=50
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

### Backend Issues

**Problem:** `OpenAI API key not configured`
- **Solution:** Add your OpenAI API key to `.env` file

**Problem:** `Tesseract not found`
- **Solution:** Install Tesseract OCR (see Prerequisites)

**Problem:** `CORS errors`
- **Solution:** Check `ALLOWED_ORIGINS` in backend `.env`

### Frontend Issues

**Problem:** `API connection failed`
- **Solution:** Ensure backend is running on `http://localhost:8000`

**Problem:** `SSE not working`
- **Solution:** Check browser console for errors, ensure CORS is configured

## Development

### Backend Development
```bash
cd tamil-translator-api
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd web_app
npm run dev
```



## Production Deployment

### Backend
```bash
pip install gunicorn
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
npm run build
# Serve the dist/ directory with nginx or similar
```

---

## Database Seeds (Initial Data)

Seeds are used to populate the database with initial data such as users or default records.

### When to run seeds
- Run seeds **only once**
- Make sure the database is running before running seeds

---

### Running Seeds (Local)

1. Start MongoDB (Docker or local)

If using Docker:
```bash
docker compose up mongodb
```
2. Navigate to backend directory:
```bash
cd tamil-translator-api
```
3.Run the seed script:
```
python src/seeds.py
```

## License

MIT

## Support

For issues or questions, please check the documentation or create an issue in the repository.
