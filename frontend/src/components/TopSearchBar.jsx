import React, { useState, useEffect } from 'react';
import './TopSearchBar.css';

const TopSearchBar = () => {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const roles = ['All', 'Business Owner', 'Co-Founder', 'Investor', 'Freelancer/Worker'];
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = currentUser._id || '';
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/search-users');
        const data = await response.json();
        setAllUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filteredUsers = allUsers.filter(user => {
      const matchesQuery =
        (user.username?.toLowerCase().includes(query.toLowerCase()) ||
        user.firstname?.toLowerCase().includes(query.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(query.toLowerCase()));

      const matchesRole =
      roleFilter === 'All' || user.role === roleFilter;

      const isNotCurrentUser = user._id !== currentUserId;

      return matchesQuery && matchesRole && isNotCurrentUser;
    });

    setSuggestions(filteredUsers);
  }, [query, roleFilter, allUsers]);

  const highlightMatch = (text) => {
    if (!text || !query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="highlight">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="top-search-bar">
      <div className="search-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search users by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State - More visible now */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading users...</span>
        </div>
      )}

      {/* Suggestions */}
      {!loading && query && (
        <div className="suggestions-container">
          {suggestions.length > 0 ? (
            <ul className="suggestion-list">
              {suggestions.map((user) => (
                <li key={user._id} className="suggestion-item">
                  <div className="user-info">
                    {user.profileImage && (
                      <img
                        src={`http://localhost:5001${user.profileImage}`}
                        alt="Profile"
                        className="profile-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                    )}
                    <div className="text-info">
                      <div className="name">
                        {highlightMatch(user.firstname || '')} {highlightMatch(user.lastname || '')}
                      </div>
                      <div className="username">@{highlightMatch(user.username || '')}</div>
                      <div className="role-badge">{user.role}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">
              <i className="fas fa-user-slash"></i>
              <span>No matching users found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopSearchBar;