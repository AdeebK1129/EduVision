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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [studyGuide, setStudyGuide] = useState(""); // To store markdown content
  const [dropdownOpen, setDropdownOpen] = useState(false); // For account dropdown
  const [user, setUser] = useState<{ username: string } | null>(null); // For user details
  const router = useRouter();

  // Fetch logged-in user details
  const fetchUserDetails = async () => {
    try {
      const response = await api.get("/users/profile/", {
        headers: { Authorization: `Token ${token}` },
      });
      setUser(response.data); // Assuming `response.data` contains the user object
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await api.get("/videos/");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserDetails(); // Fetch user details on token availability
      fetchVideos();
    }
  }, [token]);

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
      setFile(null); // Clear file input
      await fetchVideos(); // Refresh video list
    } catch (error) {
      console.error("Error uploading video:", error);
      setMessage("Error uploading video.");
    } finally {
      setLoading(false);
    }
  };

  const processVideo = async (videoId: number) => {
    setLoading(true);
    try {
      const response = await api.post(`/videos/${videoId}/process/`);
      setMessage(response.data.message);
      await fetchVideos(); // Refresh video list
    } catch (error) {
      console.error("Error processing video:", error);
      setMessage("Error processing video.");
    } finally {
      setLoading(false);
    }
  };

  const retrieveStudyGuide = async (videoId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/videos/study-guides/${videoId}/`);
      if (response.data) {
        setStudyGuide(response.data); // Set markdown content
        setMessage("Study guide loaded.");
      } else {
        setStudyGuide("No study guide content available.");
      }
    } catch (error) {
      console.error("Error retrieving study guide:", error);
      setMessage("Error retrieving study guide.");
      setStudyGuide("No study guide content available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
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
        {/* Account Section */}
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
              <a
                href="/dashboard/account"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-200"
              >
                Account
              </a>
              <button
                onClick={() => {
                  logout();
                  router.push("/auth/login"); // Redirect to login page
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
      <main className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-medium">Upload a Video</h2>
            <form onSubmit={handleUpload} className="mt-4">
              <label className="block w-full bg-blue-50 border border-blue-400 text-blue-700 py-2 px-4 rounded-md cursor-pointer hover:bg-blue-100">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={loading}
                />
                Select a File
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium">Your Videos</h3>
              <ul className="mt-4 space-y-4">
                {videos.map((video: any) => (
                  <li
                    key={video.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
                  >
                    <span className="text-gray-800">{video.title}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => processVideo(video.id)}
                        disabled={loading}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                      >
                        Process
                      </button>
                      <button
                        onClick={() => retrieveStudyGuide(video.id)}
                        disabled={loading}
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

          <div className="col-span-1 bg-white p-6 rounded-lg shadow">
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
