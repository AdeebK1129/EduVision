from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.core.exceptions import ValidationError
from django.http import FileResponse
from .models import Video, StudyGuide
from scripts.process_video import process_video
from scripts.generate_study_guide import generate_study_guide
import os
import logging

logger = logging.getLogger(__name__)

# Validation helper
def validate_file(file):
    valid_mime_types = ['video/mp4', 'audio/mpeg', 'audio/wav']
    max_file_size = 100 * 1024 * 1024  # 100 MB

    if file.content_type not in valid_mime_types:
        raise ValidationError("Invalid file type. Only MP4, MP3, and WAV files are allowed.")
    if file.size > max_file_size:
        raise ValidationError("File size exceeds the 100 MB limit.")

class VideoUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        title = request.data.get("title", None)
        description = request.data.get("description", "")

        if not file:
            return Response({"error": "A file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_file(file)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if not title:
            title = file.name

        video = Video.objects.create(
            user=request.user,
            title=title,
            description=description,
            file_path=file
        )
        return Response(
            {
                "message": "Video uploaded successfully.",
                "video_id": video.id,
                "title": video.title,
                "description": video.description,
                "file_path": video.file_path.url
            },
            status=status.HTTP_201_CREATED
        )

class ProcessVideoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, video_id, *args, **kwargs):
        try:
            video = Video.objects.get(id=video_id, user=request.user)

            if video.processed:
                return Response({"message": "This video has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

            transcript_path = process_video(video.file_path.path)

            if not os.path.exists(transcript_path):
                return Response({"error": "Transcript generation failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            study_guide_path = os.path.join(settings.MEDIA_ROOT, f"study_guides/{video.title}_study_guide.md")
            generate_study_guide(transcript_path, study_guide_path)

            if not os.path.exists(study_guide_path):
                return Response({"error": "Study guide generation failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            study_guide = StudyGuide.objects.create(video=video, guide_path=study_guide_path)

            video.processed = True
            video.save()

            return Response({
                "message": "Study guide generated successfully.",
                "study_guide_id": study_guide.id,
                "study_guide_url": study_guide.guide_path.url
            }, status=status.HTTP_200_OK)
        except Video.DoesNotExist:
            return Response({"error": "Video not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error processing video {video_id}: {str(e)}")
            return Response({"error": "An unexpected error occurred while processing the video."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserVideoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Lists all videos uploaded by the authenticated user.
        """
        videos = Video.objects.filter(user=request.user)
        data = [
            {
                "id": video.id,
                "title": video.title,
                "description": video.description,
                "file_path": video.file_path.url,
                "processed": video.processed,
                "upload_date": video.upload_date,
            }
            for video in videos
        ]
        return Response(data, status=status.HTTP_200_OK)

class RetrieveStudyGuideView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, study_guide_id, *args, **kwargs):
        try:
            study_guide = StudyGuide.objects.get(id=study_guide_id, video__user=request.user)
            return FileResponse(open(study_guide.guide_path.path, "rb"), content_type="text/markdown")
        except StudyGuide.DoesNotExist:
            return Response({"error": "Study guide not found."}, status=status.HTTP_404_NOT_FOUND)
        except FileNotFoundError:
            return Response({"error": "Study guide file not found on the server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error retrieving study guide {study_guide_id}: {str(e)}")
            return Response({"error": "An unexpected error occurred while retrieving the study guide."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteStudyGuideView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, study_guide_id):
        try:
            study_guide = StudyGuide.objects.get(id=study_guide_id, video__user=request.user)
            study_guide_path = study_guide.guide_path.path

            if os.path.exists(study_guide_path):
                os.remove(study_guide_path)

            study_guide.delete()
            return Response({"message": "Study guide deleted successfully."}, status=status.HTTP_200_OK)
        except StudyGuide.DoesNotExist:
            return Response({"error": "Study guide not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting study guide {study_guide_id}: {str(e)}")
            return Response({"error": "An unexpected error occurred while deleting the study guide."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VideoDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, video_id):
        try:
            video = Video.objects.get(id=video_id, user=request.user)

            if os.path.exists(video.file_path.path):
                os.remove(video.file_path.path)

            video.delete()
            return Response({"message": "Video deleted successfully."}, status=status.HTTP_200_OK)
        except Video.DoesNotExist:
            return Response({"error": "Video not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting video {video_id}: {str(e)}")
            return Response({"error": "An unexpected error occurred while deleting the video."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
