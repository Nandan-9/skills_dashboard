from django.urls import path

from .views import ApplicationListView, SyncCleanupSheetView, SyncSheetView

urlpatterns = [
    path("sync-sheet/", SyncSheetView.as_view()),
    path("sync-cleanup-sheet/", SyncCleanupSheetView.as_view()),
    path("applications/", ApplicationListView.as_view()),
]
