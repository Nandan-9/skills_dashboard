import os

from django.conf import settings
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from ..services.file_handler import (
    get_drive_service,
)

from ..services.folder_access import (
    grant_folder_access,
    list_folder_access,
    revoke_folder_access,
)




class FolderAccessView(APIView):

    def get(self, request):
        folder_id = request.query_params.get("folder_id")

        if not folder_id:
            return Response({"detail": "folder_id is required."}, status=400)

        try:
            service = get_drive_service()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        try:
            permissions = list_folder_access(service=service, folder_id=folder_id)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        return Response(permissions, status=200)

    def post(self, request):

        folder_id = request.data.get("folder_id")
        email = request.data.get("email")
        role = request.data.get("role",None)

        if not folder_id or not email:
            return Response(
                {"detail": "reference_id or email is required."}, status=400
            )
        try:
            service = get_drive_service()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        try:
            if role:
                response = grant_folder_access(
                    service=service, folder_id=folder_id, email=email, role=role
                )
            else:
                response = grant_folder_access(
                    service=service, folder_id=folder_id, email=email
                )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        return Response(response, status=200)

    def delete(self, request):

        folder_id = request.data.get("folder_id")
        email = request.data.get("email")

        if not folder_id or not email:
            return Response(
                {"detail": "folder_id and email are required."}, status=400
            )

        try:
            service = get_drive_service()
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        try:
            revoked = revoke_folder_access(
                service=service, folder_id=folder_id, email=email
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=502)

        if not revoked:
            return Response(
                {"detail": "No matching permission found for that email."}, status=404
            )

        return Response({"detail": "Access revoked."}, status=200)

