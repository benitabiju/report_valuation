"""
Report repository - database operations for reports
"""

from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from app.db.session import db, reports, original_files, ai_extracted_content, final_reports
from app.models.report import ReportStatus


class ReportRepository:
    
    @staticmethod
    def create_report(
        report_name: str,
        bank_name: str,
        user_id: str,
        created_by: str
        ) -> dict:
        """Create a new report"""
        now = datetime.utcnow()
        doc = {
            "report_name": report_name,
            "bank_name": bank_name,
            "user_id": ObjectId(user_id),
            "report_status": ReportStatus.INITIALISING.value,
            "created_by": ObjectId(created_by),
            "updated_by": ObjectId(created_by),
            "created_at": now,
            "updated_at": now
        }
        result = reports.insert_one(doc)
        return ReportRepository.get_by_id(str(result.inserted_id))
    
    @staticmethod
    def get_by_id(report_id: str) -> Optional[dict]:
        """Get report by ID"""
        try:
            report = reports.find_one({"_id": ObjectId(report_id)})
            if report:
                report["id"] = str(report["_id"])
                report["user_id"] = str(report["user_id"])
                if "created_by" in report:
                    report["created_by"] = str(report["created_by"])
                if "updated_by" in report:
                    report["updated_by"] = str(report["updated_by"])
                del report["_id"]
            return report
        except:
            return None
    
    @staticmethod
    def get_all(user_id: str = None) -> list:
        query = {}
        if user_id:
            query["user_id"] = ObjectId(user_id)

        result = []
        for report in reports.find(query):
            report_id = str(report["_id"])
            files = OriginalFileRepository.get_by_report(report_id)
            print(f"DEBUG: Report {report.get('report_name')} (ID: {report_id}), files count: {len(files)}")
            
            item = {
                "id": report_id,
                "report_name": report.get("report_name"),
                "bank_name": report.get("bank_name"),
                "report_status": report.get("report_status"),
                "user_id": str(report.get("user_id")),
                "created_at": report.get("created_at"),
                "updated_at": report.get("updated_at"),
                "files": files
            }
            result.append(item)

        return result
        
    @staticmethod
    def update_name(report_id: str, report_name: str, updated_by: str) -> Optional[dict]:
        """Update report name"""
        try:
            reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {
                "report_name": report_name,
                "updated_by": ObjectId(updated_by),
                "updated_at": datetime.utcnow()
            }}
            )
            return ReportRepository.get_by_id(report_id)
        except:
            return None
    
    @staticmethod
    def exists_by_name(report_name: str, user_id: str = None) -> bool:
        """Check if a report name already exists"""
        query = {"report_name": report_name}
        if user_id:
            query["user_id"] = ObjectId(user_id)

        return reports.count_documents(query) > 0

    @staticmethod
    def delete(report_id: str) -> bool:
        """Delete a report and all related data"""
        oid = ObjectId(report_id)
        # Delete related data
        original_files.delete_many({"report_id": oid})
        ai_extracted_content.delete_many({"report_id": oid})
        final_reports.delete_many({"report_id": oid})
        # Delete report
        result = reports.delete_one({"_id": oid})
        return result.deleted_count > 0
        
    @staticmethod
    def update_status(report_id: str, status: str) -> bool:
        result = reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {
                "report_status": status,
                "updated_at": datetime.utcnow()
            }}
        )
        return result.modified_count > 0

class OriginalFileRepository:
    
    @staticmethod
    def create(report_id: str, file_name: str, file_type: str, 
               file_path: str, created_by: str, file_size_mb: float = None) -> dict:
        """Create an original file record"""
        now = datetime.utcnow()
        doc = {
            "report_id": ObjectId(report_id),
            "file_name": file_name,
            "file_type": file_type,
            "file_path": file_path,
            "file_size_mb": file_size_mb,
            "created_by": ObjectId(created_by),
            "updated_by": ObjectId(created_by),
            "created_at": now,
            "updated_at": now
        }
        result = original_files.insert_one(doc)
        return OriginalFileRepository.get_by_id(str(result.inserted_id))
    
    @staticmethod
    def get_by_id(file_id: str) -> Optional[dict]:
        """Get file by ID"""
        try:
            file = original_files.find_one({"_id": ObjectId(file_id)})
            if file:
                file["id"] = str(file["_id"])
                file["report_id"] = str(file["report_id"])
                if "created_by" in file:
                    file["created_by"] = str(file["created_by"])
                if "updated_by" in file:
                    file["updated_by"] = str(file["updated_by"])
                del file["_id"]
            return file
        except:
            return None
    
    @staticmethod
    def update_path(file_id: str, file_path: str, updated_by: str) -> Optional[dict]:
        """Update file path"""
        original_files.update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {
                "file_path": file_path,
                "updated_by": ObjectId(updated_by),
                "updated_at": datetime.utcnow()
            }}
        )
        return OriginalFileRepository.get_by_id(file_id)
    
    @staticmethod
    def get_by_report(report_id: str) -> List[dict]:
        """Get all files for a report"""
        result = []
        for file in original_files.find({"report_id": ObjectId(report_id)}):
            file["id"] = str(file["_id"])
            file["report_id"] = str(file["report_id"])
            if "created_by" in file:
                file["created_by"] = str(file["created_by"])
            if "updated_by" in file:
                file["updated_by"] = str(file["updated_by"])
            del file["_id"]
            result.append(file)
        return result
    
    @staticmethod
    def delete(file_id: str) -> bool:
        """Delete a document record"""
        try:
            result = original_files.delete_one(
            {"_id": ObjectId(file_id)}
            )
            return result.deleted_count > 0
        except:
            return False
        
    @staticmethod
    def update_file_content(file_id: str, content: str, updated_by: str) -> bool:
        result = original_files.update_one(
            {"_id": ObjectId(file_id)},
            {"$set": {
                "file_content": content,
                "updated_by": ObjectId(updated_by),
                "updated_at": datetime.utcnow()
            }}
        )
        return result.modified_count > 0


class AIExtractedContentRepository:
    
    @staticmethod
    def save_analysis(report_id: str, content: str, created_by: str = None) -> dict:
        """Save AI analysis result"""
        doc = {
            "report_id": ObjectId(report_id),
            "ai_report_content": content,
            "created_at": datetime.utcnow()
        }
        # Upsert - if analysis already exists for report, replace it? 
        # Or store history? For now, we'll just insert new. 
        # Actually to keep it simple let's delete old one first if we want 1-to-1
        ai_extracted_content.delete_many({"report_id": ObjectId(report_id)})
        
        result = ai_extracted_content.insert_one(doc)
        return {
            "id": str(result.inserted_id),
            "report_id": report_id,
            "ai_report_content": content
        }

    @staticmethod
    def get_by_report(report_id: str) -> Optional[dict]:
        """Get analysis by report ID"""
        try:
            doc = ai_extracted_content.find_one({"report_id": ObjectId(report_id)})
            if doc:
                doc["id"] = str(doc["_id"])
                doc["report_id"] = str(doc["report_id"])
                del doc["_id"]
            return doc
        except:
            return None