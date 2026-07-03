from django.urls import path

from .views import SyncView, CollegeStudentsView, ApplicationListView, ApplicationApprovalView

urlpatterns = [
    path("sync/", SyncView.as_view()),
    path("colleges/students/", CollegeStudentsView.as_view()),
    path("applications/", ApplicationListView.as_view()),
    path("applications/<int:pk>/approval/", ApplicationApprovalView.as_view()),
]
