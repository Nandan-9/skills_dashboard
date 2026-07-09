from rest_framework.response import Response
from rest_framework.views import APIView

from filehandler.models import StudentDriveFolder

from ..models import ICPCAmbassadorApplication


class ExportDataView(APIView):
    """Flat export of application data for the frontend table.

    Returns Reference ID, Name, Email, Phone, Gender, State, College,
    Approve status and Drive folder link for every application, optionally
    filtered by approval_status.
    """

    def get(self, request):
        applications = ICPCAmbassadorApplication.objects.all().order_by("college_name", "full_name")

        approval_status = request.query_params.get("approval_status")
        if approval_status is not None:
            valid_choices = ICPCAmbassadorApplication.ApprovalStatus.values
            if approval_status not in valid_choices:
                return Response(
                    {"detail": f"approval_status must be one of {valid_choices}."}, status=400
                )
            applications = applications.filter(approval_status=approval_status)

        folder_links = dict(
            StudentDriveFolder.objects.filter(
                student_id__in=applications.values_list("reference_id", flat=True)
            ).values_list("student_id", "folder_link")
        )

        results = [
            {
                "reference_id": application.reference_id,
                "name": application.full_name,
                "email": application.email,
                "phone": application.phone_number,
                "gender": application.get_gender_display(),
                "state": application.state,
                "college": application.college_name,
                "approve": application.approval_status,
                "drive_folder_link": folder_links.get(application.reference_id),
            }
            for application in applications
        ]

        return Response({"results": results}, status=200)
