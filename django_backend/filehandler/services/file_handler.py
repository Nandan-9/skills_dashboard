from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from ..models import DriveFileEntry, StudentDriveFolder

FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"


def _escape_query_value(value):
    return value.replace("\\", "\\\\").replace("'", "\\'")


def get_drive_service():
    credentials = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_SERVICE_ACCOUNT_FILE, scopes=settings.SCOPES
    )
    return build("drive", "v3", credentials=credentials)


def find_folder(service, name, parent_id):
    name = _escape_query_value(name)
    query = (
        f"name = '{name}' "
        f"and '{parent_id}' in parents "
        f"and mimeType = '{FOLDER_MIME_TYPE}' "
        "and trashed = false"
    )
    response = service.files().list(
        q=query,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        fields="files(id, name, webViewLink)",
    ).execute()
    files = response.get("files", [])
    return files[0] if files else None


def create_folder(service, name, parent_id):
    body = {"name": name, "mimeType": FOLDER_MIME_TYPE, "parents": [parent_id]}
    return service.files().create(
        body=body, supportsAllDrives=True, fields="id, name, webViewLink"
    ).execute()


def get_or_create_student_folder(service, full_name, reference_id):
    folder_name = f"{full_name}_{reference_id}"
    parent_id = settings.GOOGLE_DRIVE_PARENT_FOLDER_ID

    existing = find_folder(service, folder_name, parent_id)
    if existing is not None:
        return existing, False

    return create_folder(service, folder_name, parent_id), True


def find_folder_by_reference_id(service, reference_id, parent_id):
    reference_id = _escape_query_value(reference_id)
    query = (
        f"name contains '{reference_id}' "
        f"and '{parent_id}' in parents "
        f"and mimeType = '{FOLDER_MIME_TYPE}' "
        "and trashed = false"
    )
    response = service.files().list(
        q=query,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        fields="files(id, name, webViewLink)",
    ).execute()
    files = response.get("files", [])
    return files[0] if files else None


def find_file_in_folder(service, filename, folder_id):
    filename = _escape_query_value(filename)
    query = f"name = '{filename}' and '{folder_id}' in parents and trashed = false"
    response = service.files().list(
        q=query,
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        fields="files(id, name, webViewLink, webContentLink)",
    ).execute()
    files = response.get("files", [])
    return files[0] if files else None


def upload_file(service, filename, file_obj, content_type, folder_id, existing_file_id=None):
    media_body = MediaIoBaseUpload(file_obj, mimetype=content_type, resumable=True)
    fields = "id, name, webViewLink, webContentLink"

    if existing_file_id:
        return service.files().update(
            fileId=existing_file_id,
            media_body=media_body,
            supportsAllDrives=True,
            fields=fields,
        ).execute()

    body = {"name": filename, "parents": [folder_id]}
    return service.files().create(
        body=body, media_body=media_body, supportsAllDrives=True, fields=fields
    ).execute()


def get_or_create_folder_record(service, reference_id, full_name=None):
    """Return a StudentDriveFolder row for reference_id, using the local cache first."""
    existing = StudentDriveFolder.objects.filter(student_id=reference_id).first()
    if existing is not None:
        return existing

    parent_id = settings.GOOGLE_DRIVE_PARENT_FOLDER_ID
    drive_folder = find_folder_by_reference_id(service, reference_id, parent_id)
    if drive_folder is not None:
        return StudentDriveFolder.objects.create(
            student_id=reference_id,
            drive_folder_id=drive_folder["id"],
            folder_link=drive_folder.get("webViewLink", ""),
        )

    if full_name:
        drive_folder, _created = get_or_create_student_folder(service, full_name, reference_id)
        return StudentDriveFolder.objects.create(
            student_id=reference_id,
            drive_folder_id=drive_folder["id"],
            folder_link=drive_folder.get("webViewLink", ""),
        )

    raise LookupError(f"No folder or student found for reference_id '{reference_id}'.")


def get_or_create_file_entry(service, folder_record, filename, file_obj, content_type, size_bytes):
    """Upload filename into folder_record's Drive folder, overwriting if it already exists."""
    existing_entry = DriveFileEntry.objects.filter(folder=folder_record, file_name=filename).first()
    existing_file_id = existing_entry.drive_file_id if existing_entry else None

    if existing_file_id is None:
        drive_file = find_file_in_folder(service, filename, folder_record.drive_folder_id)
        if drive_file is not None:
            existing_file_id = drive_file["id"]

    result = upload_file(
        service, filename, file_obj, content_type, folder_record.drive_folder_id, existing_file_id
    )

    entry, _created = DriveFileEntry.objects.update_or_create(
        folder=folder_record,
        file_name=filename,
        defaults={
            "drive_file_id": result["id"],
            "file_link": result.get("webViewLink", ""),
            "download_link": result.get("webContentLink"),
            "mime_type": content_type or "",
            "size_bytes": size_bytes,
        },
    )
    return entry, existing_file_id is not None
