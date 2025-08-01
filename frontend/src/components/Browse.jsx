import React, { useEffect, useState } from "react";
import { Container, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Browse() {
  const [opportunities, setOpportunities] = useState([]);
  const [filter, setFilter] = useState("All");
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeOppIndex, setActiveOppIndex] = useState(-1);
  const [activeUserIndex, setActiveUserIndex] = useState(-1);
  const [showOppSuggestions, setShowOppSuggestions] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch("http://localhost:5001/browse-opportunities");
        const data = await res.json();

        if (data.success) {
          setOpportunities(data.opportunities);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching opportunities:", err);
      }
    };

    fetchOpportunities();
  }, []);

  const filters = ["All", "Co-Founder", "Investor", "Business Owner", "Freelancer/Worker"];

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesFilter = filter === "All" || opp.role === filter;
    
    const oppSearch = opportunitySearch.toLowerCase();
    const matchesOppSearch =
      opp.title?.toLowerCase().includes(oppSearch) ||
      opp.description?.toLowerCase().includes(oppSearch) ||
      opp.role?.toLowerCase().includes(oppSearch) ||
      (Array.isArray(opp.skillsRequired) &&
        opp.skillsRequired.some(skill =>
          skill.toLowerCase().includes(oppSearch)
      ));

    const user = opp.userId || {};
    const matchesUserSearch =
      user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.location?.toLowerCase().includes(userSearch.toLowerCase());

    return matchesFilter && matchesOppSearch && matchesUserSearch;
  });

  const opportunitySuggestions = [
    ...new Set(opportunities.map((o) => o.title).filter(Boolean)),
  ].filter((title) => title?.toLowerCase().includes(opportunitySearch.toLowerCase()));

  const userSuggestions = [
    ...new Set(
      opportunities.flatMap((opp) => {
        const user = opp.userId || {};
        return [user.username || "", user.location || ""].filter(Boolean);
      })
    ),
  ].filter((text) => text.toLowerCase().includes(userSearch.toLowerCase()));

  const handleKeyDown = (e, type) => {
    if (type === "opportunity") {
      if (e.key === "ArrowDown") {
        setActiveOppIndex((prev) => Math.min(prev + 1, opportunitySuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        setActiveOppIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && activeOppIndex >= 0) {
        setOpportunitySearch(opportunitySuggestions[activeOppIndex]);
        setActiveOppIndex(-1);
        setShowOppSuggestions(false);
      }
    } else if (type === "user") {
      if (e.key === "ArrowDown") {
        setActiveUserIndex((prev) => Math.min(prev + 1, userSuggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        setActiveUserIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && activeUserIndex >= 0) {
        setUserSearch(userSuggestions[activeUserIndex]);
        setActiveUserIndex(-1);
        setShowUserSuggestions(false);
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-dark">Browse Opportunities</h2>

      <div className="row g-3 mb-3">
        {/* Search by opportunity */}
        <div className="col-md-6 position-relative">
          <input
            type="text"
            value={opportunitySearch}
            onChange={(e) => {
              setOpportunitySearch(e.target.value);
              setActiveOppIndex(-1);
              setShowOppSuggestions(true);
            }}
            onFocus={() => setShowOppSuggestions(true)}
            onBlur={() => setTimeout(() => setShowOppSuggestions(false), 200)}
            onKeyDown={(e) => handleKeyDown(e, "opportunity")}
            className="form-control"
            placeholder="Search by opportunity title or description"
            style={{ 
              backgroundColor: '#fff',
              borderRadius: '8px',
              color: '#495057',
              padding: '10px 15px'
            }}
          />
          {opportunitySearch && showOppSuggestions && opportunitySuggestions.length > 0 && (
            <ul className="list-group position-absolute w-100 z-3 shadow" style={{ 
              top: "100%", 
              maxHeight: "200px", 
              overflowY: "auto",
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              {opportunitySuggestions.slice(0, 5).map((suggestion, i) => (
                <li
                  key={i}
                  className={`list-group-item list-group-item-action suggestion-item ${activeOppIndex === i ? "active" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpportunitySearch(suggestion);
                    setActiveOppIndex(-1);
                    setShowOppSuggestions(false);
                  }}
                  style={{ 
                    cursor: "pointer",
                    backgroundColor: activeOppIndex === i ? '#e9ecef' : '#fff',
                    ':hover': {
                      backgroundColor: '#e9ecef'
                    },
                    color: '#212529',
                    border: "none",
                    padding: '10px 15px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search by user */}
        <div className="col-md-6 position-relative">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setActiveUserIndex(-1);
              setShowUserSuggestions(true);
            }}
            onFocus={() => setShowUserSuggestions(true)}
            onBlur={() => setTimeout(() => setShowUserSuggestions(false), 200)}
            onKeyDown={(e) => handleKeyDown(e, "user")}
            className="form-control"
            placeholder="Search by user name or location"
            style={{ 
              backgroundColor: '#fff',
              borderRadius: '8px',
              color: '#495057',
              padding: '10px 15px'
            }}
          />
          {userSearch && showUserSuggestions && userSuggestions.length > 0 && (
            <ul className="list-group position-absolute w-100 z-3 shadow" style={{ 
              top: "100%", 
              maxHeight: "200px", 
              overflowY: "auto",
              borderRadius: '8px',
              backgroundColor: '#fff',
              ':hover': {
                backgroundColor: '#e9ecef'
              }
            }}>
              {userSuggestions.slice(0, 10).map((name, i) => (
                <li
                  key={i}
                  className={`list-group-item list-group-item-action ${activeUserIndex === i ? "active" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setUserSearch(name);
                    setActiveUserIndex(-1);
                    setShowUserSuggestions(false);
                  }}
                  style={{ 
                    cursor: "pointer",
                    backgroundColor: activeUserIndex === i ? '#e9ecef' : '#fff',
                    ':hover': {
                      backgroundColor: '#e9ecef'
                    },
                    color: 'black',
                    border: "none",
                    padding: '10px 15px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap justify-content-center mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm rounded-pill m-1 ${
              filter === f ? "btn-success" : "btn-outline-success"
            }`}
            style={{
              padding: '8px 16px',
              fontWeight: '600'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="row">
        {filteredOpportunities.length === 0 ? (
          <div className="text-center text-muted py-4" style={{ fontSize: '1.2rem' }}>
            No matching opportunities found.
          </div>
        ) : (
          filteredOpportunities.map((opp, idx) => (
            <div className="col-lg-4 col-md-6 mb-4" key={idx}>
              <div className="card h-100 shadow-sm" style={{ 
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#fff'
              }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold text-dark">{opp.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">
                    {opp.userId?.firstname} {opp.userId?.lastname}
                  </h6>
                  <h6 className="card-subtitle mb-2 text-muted">
                    @{opp.userId?.username} •
                    <Badge
                      bg={
                        opp.role === "Business Owner"
                          ? "primary"
                          : opp.role === "Investor"
                          ? "success"
                          : opp.role === "Co-Founder"
                          ? "warning"
                          : opp.role === "Freelancer/Worker"
                          ? "info"
                          : "secondary"
                      }
                      className="mt-2 ms-2"
                      style={{ fontSize: '0.8rem' }}
                    >
                      {opp.role || "Member"}
                    </Badge>
                  </h6>
                  <p className="text-muted small">
                    Posted on {new Date(opp.createdAt).toLocaleDateString()}
                  </p>
                  <p className="card-text text-dark">{opp.description}</p>

                  {opp.skillsRequired?.length > 0 && (
                    <div className="mb-2">
                      <h6 className="fw-semibold text-dark">Skills Required:</h6>
                      <ul className="mb-0 ps-3 text-dark">
                        {opp.skillsRequired.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent border-0 d-flex justify-content-between gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={() => navigate(`/public-profile/${opp.userId._id}`)}
                    style={{ borderRadius: '8px' }}
                  >
                    Profile
                  </button>
                  <button 
                    className="btn btn-primary btn-sm w-100"
                    style={{ borderRadius: '8px' }}
                    onClick={() => navigate(`/chat/${opp.userId._id}`)}
                  >
                    Message
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm w-100"
                    style={{ borderRadius: '8px' }}
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}