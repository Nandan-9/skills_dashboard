from django.urls import path

from .views import ApplicationListView, SyncSheetView

urlpatterns = [
    path("sync-sheet/", SyncSheetView.as_view()),
    path("applications/", ApplicationListView.as_view()),
]
