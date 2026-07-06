from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import ICPCAmbassadorApplication
from ..serializers import ICPCAmbassadorApplicationSerializer


class ApplicationListView(APIView):

    """List applications, optionally filtered by approval_status."""

    def get(self, request):

        applications = ICPCAmbassadorApplication.objects.all()

        approval_status = request.query_params.get("approval_status")
        if approval_status is not None:
            valid_choices = ICPCAmbassadorApplication.ApprovalStatus.values
            if approval_status not in valid_choices:
                return Response(
                    {"detail": f"approval_status must be one of {valid_choices}."}, status=400
                )
            applications = applications.filter(approval_status=approval_status)

        serializer = ICPCAmbassadorApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class ApplicationApprovalView(APIView):
    """Set approval_status on a single application."""

    def patch(self, request, pk):
        application = get_object_or_404(ICPCAmbassadorApplication, pk=pk)

        approval_status = request.data.get("approval_status")
        valid_choices = ICPCAmbassadorApplication.ApprovalStatus.values
        if approval_status not in valid_choices:
            return Response(
                {"detail": f"approval_status must be one of {valid_choices}."}, status=400
            )

        application.approval_status = approval_status
        application.save(update_fields=["approval_status"])

        return Response(ICPCAmbassadorApplicationSerializer(application).data)
