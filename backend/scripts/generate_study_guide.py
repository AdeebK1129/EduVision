import os
from openai import OpenAI
from dotenv import load_dotenv
from django.conf import settings

load_dotenv()

# Paths
TRANSCRIPT_PATH = os.path.join(settings.MEDIA_ROOT, "transcripts/transcript.txt")
RESULTS_DIR = os.path.join(settings.MEDIA_ROOT, "study_guides")
STUDY_GUIDE_PATH = os.path.join(RESULTS_DIR, "study_guide.md")
os.makedirs(RESULTS_DIR, exist_ok=True)

# OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please set it in the .env file.")
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_study_guide(transcript_path, output_path):
    with open(transcript_path, "r") as f:
        transcript = f.read()

    if not transcript.strip():
        raise ValueError("Transcript file is empty. Cannot generate study guide.")

    prompt = (
        "You are an expert educator tasked with creating a comprehensive study guide based on the provided transcript. "
        "The study guide should include:\n"
        "- Clear explanations of all topics covered.\n"
        "- Examples, diagrams (if applicable), or code snippets to clarify concepts.\n"
        "- Recommendations for external resources (e.g., articles, videos, documentation) for deeper learning.\n"
        "- A summary section that provides an overview of the lecture.\n\n"
        f"Lecture Transcript:\n{transcript}"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        temperature=0.7,
    )
    study_guide = response.choices[0].message.content.strip()

    with open(output_path, "w") as f:
        f.write("# Study Guide\n\n")
        f.write(study_guide)

    return output_path

