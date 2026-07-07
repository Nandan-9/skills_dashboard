from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

from config.models import ICPCAmbassadorApplication

from ..models import StudentDriveFolder
from ..services.file_handler import get_drive_service, get_or_create_folder_record
from ..services.folder_access import grant_folder_access


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
                folder_record, created = get_or_create_folder_record(
                    service, student.reference_id, student.full_name
                )
            except Exception as exc:
                results.append({"reference_id": reference_id, "error": str(exc)})
                continue

            result = {
                "reference_id": reference_id,
                "id": folder_record.drive_folder_id,
                "webViewLink": folder_record.folder_link,
            }

            if created and student.email and not settings.DEBUG:
                try:
                    grant_folder_access(service, folder_record.drive_folder_id, student.email)
                except Exception as exc:
                    result["access_warning"] = str(exc)

            results.append(result)

        return Response({"results": results}, status=200)
