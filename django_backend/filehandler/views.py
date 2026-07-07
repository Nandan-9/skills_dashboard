import os

from django.conf import settings
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from config.models import ICPCAmbassadorApplication

from .models import StudentDriveFolder
from .services.file_handler import (
    get_drive_service,
    get_or_create_file_entry,
    get_or_create_folder_record,
)


class StudentFolderView(APIView):
    """Create (or fetch) Drive folders named '{full_name}_{reference_id}' for one or more students.

    Accepts either {"reference_id": "..."} or {"reference_ids": ["...", "..."]}.
    """

    def get(self, request):
        folders = StudentDriveFolder.objects.order_by("-created_at")
        results = [
            {
                "student_id": folder.student_id,
                "drive_folder_id": folder.drive_folder_id,
                "folder_link": folder.folder_link,
                "created_at": folder.created_at,
            }
            for folder in folders
        ]
        return Response({"results": results}, status=200)

    def post(self, request):
        reference_ids = request.data.get("reference_ids")
        if reference_ids is None:
            reference_id = request.data.get("reference_id")
            reference_ids = [reference_id] if reference_id else []

        if not reference_ids:
            return Response({"detail": "reference_id or reference_ids is required."}, status=400)

        try:
            service = get_drive_service()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        students_by_reference_id = {
            student.reference_id: student
            for student in ICPCAmbassadorApplication.objects.filter(reference_id__in=reference_ids)
        }

        results = []
        for reference_id in reference_ids:
            student = students_by_reference_id.get(reference_id)
            if student is None:
                results.append({"reference_id": reference_id, "error": "Student not found."})
                continue

            if student.approval_status != ICPCAmbassadorApplication.ApprovalStatus.APPROVE:
                results.append(
                    {"reference_id": reference_id, "error": "Student is not approved."}
                )
                continue

            try:
                folder_record = get_or_create_folder_record(
                    service, student.reference_id, student.full_name
                )
            except Exception as exc:
                results.append({"reference_id": reference_id, "error": str(exc)})
                continue

            results.append(
                {
                    "reference_id": reference_id,
                    "id": folder_record.drive_folder_id,
                    "webViewLink": folder_record.folder_link,
                }
            )

        return Response({"results": results}, status=200)


class BulkFileUploadView(APIView):
    """Bulk-upload files named '{reference_id}.{ext}' into each student's Drive folder.

    Accepts multipart form data with one or more files under the "files" field.
    """

    parser_classes = [MultiPartParser]

    def post(self, request):
        files = request.FILES.getlist("files")
        if not files:
            return Response({"detail": "No files were provided under 'files'."}, status=400)

        try:
            service = get_drive_service()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        results = []
        for file in files:
            raw_reference_id = os.path.splitext(file.name)[0].strip()
            # Files are named after the bare sheet-row number the uploader sees
            # (e.g. "42.pdf"), but reference_id is stored as "{worksheet}-{n}"
            # (see sheet_sync.sync_applications_sheet), so rebuild that form here.
            reference_id = (
                f"{settings.GOOGLE_SHEET_WORKSHEET}-{raw_reference_id}"
                if raw_reference_id.isdigit()
                else raw_reference_id
            )

            try:
                student = ICPCAmbassadorApplication.objects.filter(reference_id=reference_id).first()
                if student is None or student.approval_status != ICPCAmbassadorApplication.ApprovalStatus.APPROVE:
                    results.append(
                        {
                            "filename": file.name,
                            "reference_id": reference_id,
                            "error": "Student not found or not approved.",
                        }
                    )
                    continue

                try:
                    folder_record = get_or_create_folder_record(service, reference_id, student.full_name)
                except LookupError as exc:
                    results.append(
                        {"filename": file.name, "reference_id": reference_id, "error": str(exc)}
                    )
                    continue

                entry, overwritten = get_or_create_file_entry(
                    service, folder_record, file.name, file, file.content_type, file.size
                )

                results.append(
                    {
                        "filename": file.name,
                        "reference_id": reference_id,
                        "folder_id": folder_record.drive_folder_id,
                        "file_id": entry.drive_file_id,
                        "webViewLink": entry.file_link,
                        "overwritten": overwritten,
                    }
                )
            except Exception as exc:
                results.append({"filename": file.name, "reference_id": reference_id, "error": str(exc)})

        return Response({"results": results}, status=200)
