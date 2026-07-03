from django.urls import path

from .views import SyncView, CollegeStudentsView

urlpatterns = [
    path("sync/", SyncView.as_view()),
    path("colleges/students/", CollegeStudentsView.as_view()),
]
