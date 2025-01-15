from django.db import models
from django.conf import settings

class Video(models.Model):
    """
    Model for uploaded videos.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file_path = models.FileField(upload_to="videos/")
    upload_date = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class StudyGuide(models.Model):
    """
    Model for study guides associated with a video.
    """
    video = models.OneToOneField(Video, on_delete=models.CASCADE, related_name="study_guide")
    guide_path = models.FileField(upload_to="study_guides/", max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Study Guide for {self.video.title}"
