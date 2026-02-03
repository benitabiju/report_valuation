"""
Document processing API routes
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import StreamingResponse
import os
import logging
from typing import List
from datetime import datetime

from app.models.report import DocumentRequest
from app.services.report_service import DocumentProcessingService
from app.repositories.report_repo import ReportRepository, OriginalFileRepository
from app.core.config import config
from app.api.v1.dependencies import get_current_user


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Documents"])

processing_service = DocumentProcessingService()


@router.post("/process")
async def process_document(
  file: UploadFile = File(...),
  client_name: str = Form(...),
  report_id: str = Form(...),
  current_user: dict = Depends(get_current_user),
):
  """Upload and process a document under an existing report"""
  try:
    # Validate report
    report = ReportRepository.get_by_id(report_id)
    if not report:
      raise HTTPException(
        status_code=404,
        detail="Report not found"
      )

    if (
      report["user_id"] != current_user["id"]
      and "admin" not in current_user.get("roles", [])
    ):
      raise HTTPException(
        status_code=403,
        detail="Access denied"
      )

    # Validate file type
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in config.SUPPORTED_FILE_TYPES:
      raise HTTPException(
        status_code=400,
        detail=f"Unsupported file type. Supported: {', '.join(config.SUPPORTED_FILE_TYPES)}"
      )

    content = await file.read()
    now = datetime.utcnow()
    year = str(now.year)
    month = now.strftime("%b").lower()
    safe_client = client_name.strip().replace(" ", "_").lower()
    file_size_mb = len(content) / (1024 * 1024)

    # Create document record under existing report
    file_doc = OriginalFileRepository.create(
      report_id=report_id,
      file_name=file.filename,
      file_type=file_ext,
      file_path=None,
      created_by=current_user["id"],
      file_size_mb=file_size_mb
    )
    document_id = file_doc["id"]

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_ROOT = os.path.join(BASE_DIR, "..", "..", "..", "uploads")

    upload_dir = os.path.join(
      UPLOAD_ROOT,
      year,
      month,
      safe_client
    )
    os.makedirs(upload_dir, exist_ok=True)

    safe_name = f"{document_id}.{file_ext}"
    file_path = os.path.join(upload_dir, safe_name)

    with open(file_path, "wb") as f:
      f.write(content)

    OriginalFileRepository.update_path(
      document_id,
      file_path,
      current_user["id"]
    )

    request = DocumentRequest(
      file_path=file_path,
      file_type="pdf" if file_ext == "pdf" else "image"
    )

    await processing_service.process_document(
      request,
      document_id
    )

    return {
      "success": True,
      "document_id": document_id,
      "report_id": report_id,
      "message": "Document processing started",
      "sse_endpoint": f"/api/v1/stream/{document_id}",
      "file_name": file.filename,
      "file_path": file_path
    }

  except HTTPException:
    raise
  except Exception as e:
    logger.error(
      f"Error processing document: {str(e)}",
      exc_info=True
    )
    raise HTTPException(
      status_code=500,
      detail="Internal server error"
    )

@router.post("/documents/process-multiple")
async def process_multiple_documents(
    files: List[UploadFile] = File(...),
    client_name: str = Form(...),
    report_id: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload and process multiple documents (max 5)"""
    try:
        if not files:
            raise HTTPException(
                status_code=400,
                detail="No files uploaded"
            )

        if len(files) > 5:
            raise HTTPException(
                status_code=400,
                detail="Maximum 5 documents allowed"
            )

        # Validate report
        report = ReportRepository.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Report not found"
            )

        if (
            report["user_id"] != current_user["id"]
            and "admin" not in current_user.get("roles", [])
        ):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        now = datetime.utcnow()
        year = str(now.year)
        month = now.strftime("%b").lower()
        safe_client = client_name.strip().replace(" ", "_").lower()

        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        UPLOAD_ROOT = os.path.join(BASE_DIR, "..", "..", "..", "uploads")

        upload_dir = os.path.join(
            UPLOAD_ROOT,
            year,
            month,
            safe_client
        )
        os.makedirs(upload_dir, exist_ok=True)

        uploaded_documents = []

        for file in files:
            file_ext = file.filename.split(".")[-1].lower()
            if file_ext not in config.SUPPORTED_FILE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {file.filename}"
                )

            content = await file.read()
            file_size_mb = len(content) / (1024 * 1024)

            # Create DB record
            file_doc = OriginalFileRepository.create(
                report_id=report_id,
                file_name=file.filename,
                file_type=file_ext,
                file_path=None,
                created_by=current_user["id"],
                file_size_mb=file_size_mb
            )

            document_id = file_doc["id"]
            file_path = os.path.join(
                upload_dir,
                f"{document_id}.{file_ext}"
            )

            with open(file_path, "wb") as f:
                f.write(content)

            OriginalFileRepository.update_path(
                document_id,
                file_path,
                current_user["id"]
            )

            request = DocumentRequest(
                file_path=file_path,
                file_type="pdf" if file_ext == "pdf" else "image"
            )

            await processing_service.process_document(
                request,
                document_id
            )

            uploaded_documents.append({
                "document_id": document_id,
                "report_id": report_id,
                "file_name": file.filename,
                "file_path": file_path,
                "sse_endpoint": f"/api/v1/stream/{document_id}"
            })

        return {
            "success": True,
            "report_id": report_id,
            "documents": uploaded_documents
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error processing multiple documents: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to process documents"
        )


@router.post("/process-from-path")
async def process_document_from_path(request: DocumentRequest):
  """Process document from file path"""
  raise HTTPException(
    status_code=501,
    detail="Not implemented yet"
  )


@router.get("/stream/{document_id}")
async def stream_document_updates(document_id: str):
  """SSE stream for document processing updates"""
  try:
    logger.info(
      f"SSE stream requested for document: {document_id}"
    )
    return StreamingResponse(
      processing_service.get_sse_stream(document_id),
      media_type="text/event-stream",
      headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    )
  except Exception as e:
    logger.error(
      f"Error streaming updates: {str(e)}",
      exc_info=True
    )
    raise HTTPException(
      status_code=500,
      detail=f"Streaming error: {str(e)}"
    )


@router.get("/status/{document_id}")
async def get_document_status(document_id: str):
  """Get current status of document processing"""
  file_doc = OriginalFileRepository.get_by_id(document_id)
  if not file_doc:
    raise HTTPException(
      status_code=404,
      detail="Document not found"
    )

  return {
    "success": True,
    "document_id": document_id,
    "status": "processing"
  }

@router.delete("/documents/{document_id}")
async def delete_document(
  document_id: str,
  current_user: dict = Depends(get_current_user)
):
  """Delete a document"""
  try:
    file_doc = OriginalFileRepository.get_by_id(document_id)
    if not file_doc:
      raise HTTPException(
        status_code=404,
        detail="Document not found"
      )

    # Access check
    if (
      str(file_doc.get("created_by")) != current_user["id"]
      and "admin" not in current_user.get("roles", [])
    ):
      raise HTTPException(
        status_code=403,
        detail="Access denied"
      )

    # Delete file from storage if exists
    file_path = file_doc.get("file_path")
    if file_path and os.path.exists(file_path):
      try:
        os.remove(file_path)
      except Exception as e:
        logger.error(
          f"Failed to delete file from storage: {file_path}",
          exc_info=True
        )
        raise HTTPException(
          status_code=500,
          detail="Failed to delete document file"
        )

    # Delete DB record
    success = OriginalFileRepository.delete(document_id)
    if not success:
      raise HTTPException(
        status_code=500,
        detail="Failed to delete document"
      )

    return {
      "success": True,
      "message": "Document deleted successfully"
    }

  except HTTPException:
    raise
  except Exception as e:
    logger.error(
      f"Error deleting document: {str(e)}",
      exc_info=True
    )
    raise HTTPException(
      status_code=500,
      detail="Failed to delete document"
    )