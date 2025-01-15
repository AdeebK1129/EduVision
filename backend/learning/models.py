from django.db import models
from django.conf import settings

class LearningGoal(models.Model):
    """
    Model for storing learning goals.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_goals")
    goal = models.TextField()
    deadline = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Goal: {self.goal[:50]}"

class LearningPreference(models.Model):
    """
    Model for storing user learning preferences.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_preferences")
    technique = models.CharField(max_length=255)
    survey_result = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s preference: {self.technique}"

class StudyPlan(models.Model):
    """
    Model for study plans.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="study_plans")
    learning_goal = models.ForeignKey(LearningGoal, on_delete=models.SET_NULL, blank=True, null=True)
    plan_details = models.JSONField()
    test_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Study Plan for {self.user.username}"
