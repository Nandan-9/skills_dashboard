from django.urls import path

from .views import BulkFileUploadView, StudentFolderView

urlpatterns = [
    path("folders/", StudentFolderView.as_view()),
    path("bulk-upload/", BulkFileUploadView.as_view()),
]
