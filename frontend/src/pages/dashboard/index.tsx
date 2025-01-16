import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useRouter } from "next/router";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(""); // For displaying selected file name
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingVideoId, setProcessingVideoId] = useState<number | null>(null); // Track which video is being processed
  const [studyGuide, setStudyGuide] = useState(""); // Markdown content for study guide
  const [dropdownOpen, setDropdownOpen] = useState(false); // Toggle dropdown in sidebar
  const [user, setUser] = useState<{ username: string } | null>(null); // User details
  const [mainContentWidth, setMainContentWidth] = useState(65); // Resizable width of the main content in percentage
  const router = useRouter();

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const response = await api.get("/users/profile/", {
        headers: { Authorization: `Token ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch videos and check if a study guide exists for each video
  const fetchVideos = async () => {
    try {
      const response = await api.get("/videos/");
      const videoList = response.data;

      // Check if study guides exist for each video
      const videosWithStatus = await Promise.all(
        videoList.map(async (video: any) => {
          try {
            await api.get(`/videos/study-guides/${video.id}/`);
            return { ...video, hasStudyGuide: true }; // Add hasStudyGuide flag if study guide exists
          } catch {
            return { ...video, hasStudyGuide: false };
          }
        })
      );

      setVideos(videosWithStatus);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Initial fetch for user and videos
  useEffect(() => {
    if (token) {
      fetchUserDetails();
      fetchVideos();
    }
  }, [token]);

  // Handle video upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("No file selected.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/videos/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
      setFile(null);
      setFileName("");
      await fetchVideos(); // Refresh videos after upload
    } catch (error) {
      console.error("Error uploading video:", error);
      setMessage("Error uploading video.");
    } finally {
      setLoading(false);
    }
  };

  // Process video
  const processVideo = async (videoId: number, hasStudyGuide: boolean) => {
    if (hasStudyGuide) {
      setMessage("This video has already been processed.");
      return;
    }

    setProcessingVideoId(videoId);
    try {
      const response = await api.post(`/videos/${videoId}/process/`);
      setMessage(response.data.message);
      await fetchVideos(); // Refresh videos after processing
    } catch (error) {
      console.error("Error processing video:", error);
      setMessage("Error processing video.");
    } finally {
      setProcessingVideoId(null);
    }
  };

  // Retrieve study guide
  const retrieveStudyGuide = async (videoId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/videos/study-guides/${videoId}/`);
      setStudyGuide(response.data || "No study guide content available.");
      setMessage("Study guide loaded.");
    } catch (error) {
      console.error("Error retrieving study guide:", error);
      setStudyGuide("No study guide content available.");
    } finally {
      setLoading(false);
    }
  };

  // Handle resizing the main content and study guide columns
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = mainContentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX) / window.innerWidth * 100;
      setMainContentWidth(Math.min(Math.max(newWidth, 40), 70)); // Limit resizing between 40% and 70%
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Overlay for Processing */}
      {processingVideoId && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="spinner"></div>
          <p className="text-white mt-4 text-lg">Processing...</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between fixed h-full">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">EduVision</h1>
          </div>
          <nav className="mt-6">
            <a href="#" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
              Dashboard
            </a>
            <a href="#" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
              Settings
            </a>
          </nav>
        </div>
        <div className="p-6 border-t">
          <button
            className="flex items-center w-full text-gray-800 hover:bg-gray-200 p-2 rounded"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="bg-purple-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold mr-3">
              {user ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            <span>{user ? user.username : "Loading..."}</span>
          </button>
          {dropdownOpen && (
            <div className="mt-2 bg-white shadow-md rounded-lg">
              <a href="/dashboard/account" className="block px-4 py-2 text-gray-600 hover:bg-gray-200">
                Account
              </a>
              <button
                onClick={() => {
                  logout();
                  router.push("/auth/login");
                }}
                className="block px-4 py-2 text-gray-600 hover:bg-gray-200 w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex ml-64">
        {/* Left Column */}
        <div className="bg-white p-6 rounded-lg shadow" style={{ flex: `${mainContentWidth}%` }}>
          <h2 className="text-xl font-medium">Upload a Video</h2>
          <form onSubmit={handleUpload} className="mt-4">
            <label className="block w-full bg-blue-50 border border-blue-400 text-blue-700 py-2 px-4 rounded-md cursor-pointer hover:bg-blue-100">
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setFileName(e.target.files?.[0]?.name || "");
                }}
                className="hidden"
                disabled={loading || !!processingVideoId}
              />
              Select a File
            </label>
            {fileName && <p className="mt-2 text-gray-600">Selected: {fileName}</p>}
            <button
              type="submit"
              disabled={loading || !!processingVideoId}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-medium">Your Videos</h3>
            <ul className="mt-4 space-y-4">
              {videos.map((video: any) => (
                <li key={video.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                  <span className="text-gray-800">{video.title}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => processVideo(video.id, video.hasStudyGuide)}
                      disabled={loading || processingVideoId === video.id}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                    >
                      {processingVideoId === video.id ? "Processing..." : video.hasStudyGuide ? "Processed" : "Process"}
                    </button>
                    <button
                      onClick={() => retrieveStudyGuide(video.id)}
                      disabled={loading || !!processingVideoId}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                      View Study Guide
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          className="cursor-col-resize bg-gray-200"
          style={{ width: "5px", cursor: "col-resize" }}
          onMouseDown={handleMouseDown}
        />

        {/* Right Column */}
        <div
          className="bg-white p-6 rounded-lg shadow overflow-y-auto"
          style={{ flex: `${100 - mainContentWidth}%`, height: "calc(100vh - 48px)" }}
        >
          <h2 className="text-xl font-medium">Study Guide</h2>
          <div className="markdown mt-4">
            {studyGuide ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {studyGuide}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-500">No study guide content available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
