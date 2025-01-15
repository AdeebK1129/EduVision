from rest_framework import serializers
from .models import Video, StudyGuide


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'user', 'title', 'description', 'file_path', 'upload_date', 'processed']
        read_only_fields = ['id', 'upload_date', 'processed']

    def create(self, validated_data):
        return Video.objects.create(**validated_data)


class StudyGuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGuide
        fields = ['id', 'video', 'guide_path', 'created_at']
        read_only_fields = ['id', 'created_at']
