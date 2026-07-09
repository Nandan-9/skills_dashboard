from django.urls import path

from .views import BulkFileUploadView, StudentFolderView, FolderAccessView, UploadToManyView

urlpatterns = [
    path("folders/", StudentFolderView.as_view()),
    path("bulk-upload/", BulkFileUploadView.as_view()),
    path("folder-access/", FolderAccessView.as_view()),
    path("upload-to-many/", UploadToManyView.as_view()),

]
