// src/pages/Chat.jsx
import React, { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";

export default function ChatPage() {
  const { userId } = useParams();
  const otherUserId = userId; // jisko message karna hai

  const storedUser = localStorage.getItem("user");

  const currentUserId = storedUser ? JSON.parse(storedUser)._id : null; // logged in user ka ID (adjust as needed)
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId || !otherUserId) return;
      try {
        const res = await fetch(
          `http://localhost:5001/get-messages?user1=${currentUserId}&user2=${otherUserId}`
        );
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          console.log("Fetched messages:", data.messages);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 1000); // auto refresh
    return () => clearInterval(interval);
  }, [currentUserId, otherUserId]);

  const sendMessage = async () => {
  if (!text.trim()) return;

  const newMessage = {
    senderId: currentUserId,
    receiverId: otherUserId,
    content: text,
    createdAt: new Date().toISOString(), // Temporary timestamp
  };

  // 🔥 Show message instantly
  setMessages((prev) => [...prev, newMessage]);
  setText("");

  try {
    const res = await fetch("http://localhost:5001/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessage),
    });

    const data = await res.json();
    console.log("Send response:", data);
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  return (
    <div className="container py-5">
      <h4 className="mb-4 fw-bold">Chat</h4>

      <div
        className="border rounded p-3 mb-3"
        style={{ height: "400px", overflowY: "auto", backgroundColor: "#f8f9fa" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 p-2 rounded ${
              msg.senderId === currentUserId ? "bg-primary text-white text-end" : "bg-light"
            }`}
            style={{ maxWidth: "70%", marginLeft: msg.senderId === currentUserId ? "auto" : 0 }}
          >
            {msg.content}
            <div className="small text-muted mt-1" style={{ fontSize: "0.7rem" }}>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="btn btn-success">
          Send
        </button>
      </div>
    </div>
  );
}
