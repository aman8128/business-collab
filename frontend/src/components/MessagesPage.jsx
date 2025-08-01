// ✅ 1. MessagesPage.jsx
// Show all users who have chatted with logged-in user

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser)._id : null;

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`http://localhost:5001/recent-chats/${currentUserId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.chats)) {
            setConversations(data.chats);
        } else {
            setConversations([]);
        }

      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    if (currentUserId) fetchConversations();
  }, [currentUserId]);

  return (
    <div className="container py-5">
      <h4 className="fw-bold mb-4">Messages</h4>
      {conversations.map((conv, i) => (
        <div
          key={i}
          onClick={() => navigate(`/chat/${conv.userId}`)}
          className="d-flex align-items-center border p-2 mb-2 rounded cursor-pointer"
          style={{ cursor: "pointer" }}
        >
          <img
            src={`http://localhost:5001${conv.profileImage}`}
            alt="Profile"
            className="rounded-circle me-3"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
          <div>
            <div>
                <span className="fw-bold me-1">{conv.firstname}</span>
                <span className="text-muted">@{conv.name}</span>
            </div>
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                {conv.lastMessage}
            </div>
            </div>

        </div>
      ))}
    </div>
  );
}
