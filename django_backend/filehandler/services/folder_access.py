def grant_folder_access(service, folder_id, email, role="reader"):
    """Share folder_id with email, giving them the given Drive permission role.

    role is one of Drive's permission roles: "reader", "writer", "commenter", "owner".
    Returns the created permission resource.
    """
    body = {"type": "user", "role": role, "emailAddress": email}
    return service.permissions().create(
        fileId=folder_id,
        body=body,
        supportsAllDrives=True,
        sendNotificationEmail=False,
        fields="id, role, emailAddress",
    ).execute()


def revoke_folder_access(service, folder_id, email):
    """Remove email's access to folder_id, if any. Returns True if a permission was removed."""
    permission_id = _find_permission_id(service, folder_id, email)
    if permission_id is None:
        return False

    service.permissions().delete(
        fileId=folder_id, permissionId=permission_id, supportsAllDrives=True
    ).execute()
    return True


def _find_permission_id(service, folder_id, email):
    response = service.permissions().list(
        fileId=folder_id,
        supportsAllDrives=True,
        fields="permissions(id, emailAddress)",
    ).execute()
    for permission in response.get("permissions", []):
        if permission.get("emailAddress", "").lower() == email.lower():
            return permission["id"]
    return None


def list_folder_access(service, folder_id):
    """Return the list of user permissions (email + role) currently set on folder_id."""
    response = service.permissions().list(
        fileId=folder_id,
        supportsAllDrives=True,
        fields="permissions(id, emailAddress, role, type)",
    ).execute()
    return [p for p in response.get("permissions", []) if p.get("type") == "user"]
