from rest_framework.response import Response
from rest_framework.views import APIView

from config.models import ICPCAmbassadorApplication

from .services.file_handler import get_drive_service, get_or_create_student_folder


class StudentFolderView(APIView):
    """Create (or fetch) Drive folders named '{full_name}_{reference_id}' for one or more students.

    Accepts either {"reference_id": "..."} or {"reference_ids": ["...", "..."]}.
    """

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

            try:
                folder, created = get_or_create_student_folder(
                    service, student.full_name, student.reference_id
                )
            except Exception as exc:
                results.append({"reference_id": reference_id, "error": str(exc)})
                continue

            results.append(
                {
                    "reference_id": reference_id,
                    "id": folder["id"],
                    "name": folder["name"],
                    "webViewLink": folder.get("webViewLink"),
                    "created": created,
                }
            )

        return Response({"results": results}, status=200)
