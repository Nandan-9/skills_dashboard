from django.urls import path

from .views import StudentFolderView

urlpatterns = [
    path("folders/", StudentFolderView.as_view()),
]
