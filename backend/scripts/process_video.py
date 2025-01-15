import os
import ffmpeg
import whisper
from django.conf import settings

# Directory Setup
AUDIO_DIR = os.path.join(settings.MEDIA_ROOT, "audio")
TRANSCRIPT_DIR = os.path.join(settings.MEDIA_ROOT, "transcripts")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TRANSCRIPT_DIR, exist_ok=True)

# 1. Extract Audio from Video
def extract_audio(video_path, audio_output_path):
    """
    Extracts audio from the input video file.
    """
    print("Extracting audio...")
    ffmpeg.input(video_path).output(audio_output_path, ac=1, ar=16000).run(overwrite_output=True)
    print(f"Audio saved to {audio_output_path}")

# 2. Transcribe Audio
def transcribe_audio(audio_path, transcript_output_path):
    """
    Transcribes audio into text using Whisper and saves the transcript with timestamps.
    """
    print("Transcribing audio...")
    model = whisper.load_model("base")  # Load Whisper model
    result = model.transcribe(audio_path)

    # Save transcript with timestamps
    with open(transcript_output_path, "w") as f:
        for segment in result["segments"]:
            start = segment["start"]
            end = segment["end"]
            text = segment["text"]
            f.write(f"[{start:.2f} - {end:.2f}] {text}\n")
    print(f"Transcript saved to {transcript_output_path}")

# Main Processing Function
def process_video(video_path):
    """
    Main function to process the video: extract audio and transcribe it.
    """
    print(f"Processing video: {video_path}")
    # Paths
    audio_path = os.path.join(AUDIO_DIR, "lecture_audio.wav")
    transcript_path = os.path.join(TRANSCRIPT_DIR, "transcript.txt")

    # Step 1: Extract audio
    extract_audio(video_path, audio_path)
    
    # Step 2: Transcribe audio
    transcribe_audio(audio_path, transcript_path)
    return transcript_path  # Return the transcript path

