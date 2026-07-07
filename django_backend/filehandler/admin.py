from django.contrib import admin

from .models import DriveFileEntry, StudentDriveFolder

admin.site.register(StudentDriveFolder)
admin.site.register(DriveFileEntry)
