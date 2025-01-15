from django.urls import path
from .views import (
    VideoUploadView,
    ProcessVideoView,
    RetrieveStudyGuideView,
    DeleteStudyGuideView,
    UserVideoListView,
    VideoDeleteView,
)

urlpatterns = [
    path('upload/', VideoUploadView.as_view(), name='video-upload'),
    path('<int:video_id>/process/', ProcessVideoView.as_view(), name='video-process'),
    path('study-guides/<int:study_guide_id>/', RetrieveStudyGuideView.as_view(), name='study-guide-retrieve'),
    path('study-guides/<int:study_guide_id>/delete/', DeleteStudyGuideView.as_view(), name='study-guide-delete'),
    path('', UserVideoListView.as_view(), name='user-videos'),
    path('<int:video_id>/', VideoDeleteView.as_view(), name='video-delete'),
]
