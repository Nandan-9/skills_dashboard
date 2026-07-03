from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ICPCAmbassadorApplicationSerializer
from .services.sheet_sync import get_filtered_applications, run_full_sync


class SyncView(APIView):
    """Single endpoint for the whole pipeline: sync sheet 1 -> update from cleanup sheet -> filter by email.

    GET returns the current filtered result without re-running the pipeline.
    POST runs the full pipeline and then returns the same filtered result.
    """

    def get(self, request):
        return self._filtered_response()

    def post(self, request):
        if request.headers.get("X-Sync-Key") != settings.SHEET_SYNC_API_KEY:
            return Response({"detail": "Forbidden"}, status=403)

        try:
            run_full_sync()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=500)

        return self._filtered_response()

    def _filtered_response(self):
        serializer = ICPCAmbassadorApplicationSerializer(get_filtered_applications(), many=True)
        return Response(serializer.data, status=200)
