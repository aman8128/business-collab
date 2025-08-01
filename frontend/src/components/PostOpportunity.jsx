import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PostOpportunity = () => {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const payload = {
        userId: user?._id,
        role,
        title: formData.title || `${role} Opportunity`, // fallback title
        description: formData.description || "No description provided.",
      };

      // Add role-specific fields
      if (role === "Business Owner") {
        payload.investmentNeeded = formData.investment;
      } else if (role === "Co-Founder") {
        payload.skillsRequired = formData.skills.split(",").map(s => s.trim());
        payload.companyStage = formData.companyStage;
      } else if (role === "Investor") {
        payload.investmentRange = formData.amount;
      } else if (role === "Freelancer/Worker") {
        payload.skillsRequired = formData.skills.split(",").map(s => s.trim());
      }

      await axios.post('http://localhost:5001/post-opportunity', payload);
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error("Post failed:", err);
      alert("Error posting opportunity.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Post an Opportunity</h2>

      <div className="mb-3">
        <label className="form-label">Select Your Role</label>
        <select className="form-select" value={role} onChange={handleRoleChange}>
          <option value="">Choose...</option>
          <option value="Business Owner">Business Owner</option>
          <option value="Co-Founder">Co-Founder</option>
          <option value="Investor">Investor</option>
          <option value="Freelancer/Worker">Freelancer/Worker</option>
        </select>
      </div>

      {role && (
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            type="text"
            name="title"
            placeholder="Opportunity Title"
            onChange={handleChange}
            required
          />

          <textarea
            className="form-control mb-2"
            name="description"
            placeholder="Opportunity Description"
            onChange={handleChange}
            required
          />

          {role === 'Business Owner' && (
            <input className="form-control mb-2" type="number" name="investment" placeholder="Investment Needed (₹)" onChange={handleChange} required />
          )}

          {role === 'Co-Founder' && (
            <>
              <input className="form-control mb-2" type="text" name="companyStage" placeholder="Company Stage (e.g. MVP, Revenue)" onChange={handleChange} required />
              <input className="form-control mb-2" type="text" name="skills" placeholder="Required Skills (comma-separated)" onChange={handleChange} required />
            </>
          )}

          {role === 'Investor' && (
            <input className="form-control mb-2" type="text" name="amount" placeholder="Investment Range (e.g. 5L-10L)" onChange={handleChange} required />
          )}

          {role === 'Freelancer/Worker' && (
            <>
              <input className="form-control mb-2" type="text" name="skills" placeholder="Required Skills (comma-separated)" onChange={handleChange} required />
              <input className="form-control mb-2" type="text" name="pay" placeholder="Expected Pay (optional)" onChange={handleChange} />
            </>
          )}

          <button type="submit" className="btn btn-primary mt-2">Post Opportunity</button>
        </form>
      )}
      <ToastContainer/>
    </div>
  );
};

export default PostOpportunity;
