from django.db import models


class StudentDriveFolder(models.Model):
    """One row per student's bulk-created Drive folder."""
    student_id = models.CharField(max_length=64, unique=True, db_index=True)  # holds reference_id
    drive_folder_id = models.CharField(max_length=128, unique=True)
    folder_link = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["student_id"])]

    def __str__(self):
        return f"Folder({self.student_id})"


class DriveFileEntry(models.Model):
    """One row per file uploaded into a student's folder."""
    folder = models.ForeignKey(StudentDriveFolder, on_delete=models.CASCADE, related_name="files")
    drive_file_id = models.CharField(max_length=128, unique=True)
    file_name = models.CharField(max_length=255)
    file_link = models.URLField()
    download_link = models.URLField(blank=True, null=True)
    mime_type = models.CharField(max_length=128, blank=True)
    size_bytes = models.BigIntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["folder", "file_name"], name="unique_file_per_folder")
        ]

    def __str__(self):
        return f"{self.file_name} ({self.folder.student_id})"
