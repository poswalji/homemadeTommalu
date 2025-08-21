import React, { useState, useEffect } from "react";
import ProfileModal from "./ProfileModal";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://backend-tommalu.onrender.com/api/auth/verify-token", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <h1>Welcome, {user?.name || "Guest"}</h1>
      <button onClick={() => setIsModalOpen(true)}>Edit Profile</button>

      {isModalOpen && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={user}
          onUpdateProfile={(updatedUser) => setUser(updatedUser)} // parent state update
        />
      )}
    </div>
  );
};

export default Dashboard;
