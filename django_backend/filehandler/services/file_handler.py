from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build

FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"


def get_drive_service():
    credentials = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_SERVICE_ACCOUNT_FILE, scopes=settings.SCOPES
    )
    return build("drive", "v3", credentials=credentials)


def find_folder(service, name, parent_id):
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
