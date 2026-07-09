import json

from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from ..services.file_handler import get_drive_service
from ..services.multi_reference_upload import upload_file_to_reference_ids


class UploadToManyView(APIView):
    """Upload a single file into multiple students' Drive folders.

    Accepts multipart form data with one "file" field and a "reference_ids"
    field containing a JSON-encoded array of reference_id strings.
    """

    parser_classes = [MultiPartParser]

    def post(self, request):
        file_obj = request.FILES.get("file")
        if file_obj is None:
            return Response({"detail": "No file was provided under 'file'."}, status=400)

        raw_reference_ids = request.data.get("reference_ids")
        if not raw_reference_ids:
            return Response({"detail": "reference_ids is required."}, status=400)

        try:
            reference_ids = json.loads(raw_reference_ids)
            print(reference_ids)
        except (TypeError, ValueError):
            return Response({"detail": "reference_ids must be a JSON array."}, status=400)

        if not isinstance(reference_ids, list) or not reference_ids:
            return Response({"detail": "reference_ids must be a non-empty array."}, status=400)

        try:
            service = get_drive_service()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        results = upload_file_to_reference_ids(service, file_obj, reference_ids)
        return Response({"results": results}, status=200)
