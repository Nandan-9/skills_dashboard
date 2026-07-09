import os

from django.conf import settings

from config.models import ICPCAmbassadorApplication

from .file_handler import (
    get_next_sequential_filename,
    get_or_create_file_entry,
    get_or_create_folder_record,
)
from .folder_access import grant_folder_access


def upload_file_to_reference_ids(service, file_obj, reference_ids):
    """Upload a single file into each reference_id's Drive folder.

    Mirrors the per-file loop in BulkFileUploadView, but reuses the same
    uploaded file for every reference_id instead of pairing one file per id.
    """
    # Callers may pass either the bare sheet-row number (e.g. "42") or the
    # full reference_id (e.g. "Main_Sheet-42"); normalize to the stored form
    # (see sheet_sync.sync_applications_sheet).
    normalized_reference_ids = [
        f"{settings.GOOGLE_SHEET_WORKSHEET}-{reference_id}"
        if str(reference_id).isdigit()
        else reference_id
        for reference_id in reference_ids
    ]

    students_by_reference_id = {
        student.reference_id: student
        for student in ICPCAmbassadorApplication.objects.filter(
            reference_id__in=normalized_reference_ids
        )
    }

    results = []
    for reference_id in normalized_reference_ids:
        try:
            student = students_by_reference_id.get(reference_id)
            if student is None or student.approval_status != ICPCAmbassadorApplication.ApprovalStatus.APPROVE:
                results.append(
                    {
                        "filename": file_obj.name,
                        "reference_id": reference_id,
                        "error": "Student not found or not approved.",
                    }
                )
                continue

            try:
                folder_record, created = get_or_create_folder_record(
                    service, reference_id, student.full_name
                )
            except LookupError as exc:
                results.append(
                    {"filename": file_obj.name, "reference_id": reference_id, "error": str(exc)}
                )
                continue

            access_warning = None
            if created and student.email and not settings.DEBUG:
                try:
                    grant_folder_access(service, folder_record.drive_folder_id, student.email)
                except Exception as exc:
                    access_warning = str(exc)

            file_obj.seek(0)
            extension = os.path.splitext(file_obj.name)[1]
            drive_filename = get_next_sequential_filename(folder_record, file_obj.content_type, extension)

            entry, overwritten = get_or_create_file_entry(
                service, folder_record, drive_filename, file_obj, file_obj.content_type, file_obj.size
            )

            result = {
                "filename": file_obj.name,
                "drive_filename": drive_filename,
                "reference_id": reference_id,
                "folder_id": folder_record.drive_folder_id,
                "file_id": entry.drive_file_id,
                "webViewLink": entry.file_link,
                "overwritten": overwritten,
            }
            if access_warning:
                result["access_warning"] = access_warning

            results.append(result)
        except Exception as exc:
            results.append({"filename": file_obj.name, "reference_id": reference_id, "error": str(exc)})

    return results
