import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { useRouter } from "next/router";

const Account = () => {
  const { token, logout } = useAuth();
  const [user, setUser] = useState({ username: "", email: "" });
  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
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

    if (token) fetchUserDetails();
  }, [token]);

  const handleUpdateProfile = async () => {
    try {
      const response = await api.patch(
        "/users/profile/",
        { username: newUsername },
        { headers: { Authorization: `Token ${token}` } }
      );
      setUser(response.data);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile.");
    }
  };

  const handleChangePassword = async () => {
    try {
      await api.post(
        "/users/change-password/",
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage("Password changed successfully.");
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("Error changing password.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post(
        "/users/logout/",
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">EduVision</h1>
          </div>
          <nav className="mt-6">
            <a
              onClick={() => router.push("/dashboard")}
              className="block py-2 px-4 text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              Back to Dashboard
            </a>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">My Account</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold">Username</h3>
            <p>{user.username}</p>
            <input
              type="text"
              placeholder="Update Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
            <button
              onClick={handleUpdateProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              Update Username
            </button>
          </div>

          <div>
            <h3 className="font-bold">Email</h3>
            <p>{user.email}</p>
          </div>

          <div>
            <h3 className="font-bold">Change Password</h3>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
            <button
              onClick={handleChangePassword}
              className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            >
              Change Password
            </button>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
        {message && <p className="mt-4 text-blue-600">{message}</p>}
      </main>
    </div>
  );
};

export default Account;
