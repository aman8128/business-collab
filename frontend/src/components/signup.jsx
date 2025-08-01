import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import LocationInput from "./LocationInput";

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function Signup() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    lookingforwho : "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    phone:"",
    fullAddress: "",
    company: "",
    companiesinvested: "",
    role: "Business Owner",
    skillsets: [],
    companiesworked: "",
    agree: false,
    wantinvestment: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const roles = ["Business Owner", "Co-Founder", "Investor", "Freelancer/Worker"];
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const extractCityStateCountry = (address) => {
    if (!address) return '';
    try {
      const parts = address.split(',');
      const relevantParts = parts.slice(0, 3);
      return relevantParts.map(part => part.trim()).join(', ');
    } catch (e) {
      return address;
    }
  };

  useEffect(() => {
    if (window.google && window.google.maps && locationInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ["(regions)"],
          fields: ["address_components", "formatted_address"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.formatted_address) return;

        const fullAddress = place.formatted_address;
        const location = extractCityStateCountry(fullAddress);
        
        setFormData(prev => ({
          ...prev,
          location,
          fullAddress
        }));
      });
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (formData.username.trim().length >= 3) {
      checkUsernameAvailability(formData.username);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  const checkUsernameAvailability = async (username) => {
    const trimmedUsername = username.trim();
    setUsernameChecking(true);
    
    try {
      const response = await axios.get(`http://localhost:5001/check-username`, {
        params: { username: trimmedUsername },
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.data && typeof response.data.exists !== 'undefined') {
        setUsernameAvailable(!response.data.exists);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      toast.error("Error checking username availability");
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
    
    if (name === "username") {
      setUsernameAvailable(null);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const [error, setError] = useState("");
  const [user, setUser] = useState(null);


  const handleLogin = async (credentialResponse) => {
    try {
      // yeh token backend ko bhejna hai, jise backend verify karega
      const token = credentialResponse.credential;

      // backend ko provider aur token send karo
      const res = await axios.post('http://localhost:5001/social-login', {
        provider: "google",
        token: token
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error saving user:", error.response?.data || error.message);
    }
  };

const handleSocialLogin = async (provider, token) => {
  setLoading(true);
  setError("");
  try {
    const res = await fetch("http://localhost:5001/social-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, token }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      toast.success("Signup successful!", {
        onClose: () => window.location.href = "/",
      });
    } else {
      setError(data.message || "Login failed");
    }
  } catch {
    setError("Error connecting to server");
  } finally {
    setLoading(false);
  }
};


  const handleRoleSelect = (role) => {
    setFormData({
      firstname: "",
      lookingforwho: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      location: "",
      phone:"",
      fullAddress: "",
      company: "",
      companiesinvested: "",
      role: role,
      skillsets: [],
      companiesworked: "",
      agree: false,
      wantinvestment: "",
    });
  };

  const validateForm = () => {
    const {
      firstname,

      lastname,
      username,
      email,
      password,
      confirmPassword,
      location,
      phone,
      agree,
    } = formData;

    if (!firstname || !lastname) {
      toast.info("Please enter your name.");
      return false;
    }

    if (!username || username.length < 3) {
      toast.info("Username must be at least 3 characters long.");
      return false;
    }

    if (usernameAvailable === false) {
      toast.info("Username is already taken. Please choose another one.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.info("Please enter a valid email address.");
      return false;
    }

    if (!password || password.length < 6) {
      toast.info("Password must be at least 6 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.info("Passwords do not match.");
      return false;
    }

    if (!location) {
      toast.info("Please enter your location.");
      return false;
    }

    if(!phone){
      toast.info("Please enter your phone number.")
      return false
    }
    
    if(phone.length > 10 || phone.length < 10){
      toast.error("Please enter valid phone number.")
      return false
    }
    if (!agree) {
      toast.info("Please accept the terms to continue.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const {
      firstname,
      lastname,
      username,
      email,
      password,
      location,
      phone,
      fullAddress,
      role,
      company,
      lookingforwho,
      companiesinvested,
      skillsets,
      companiesworked,
      wantinvestment,
    } = formData;

    const getIndianTime = () => {
      return new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    };

    let payload = { 
      firstname, 
      lastname,
      username,
      email, 
      password, 
      location, 
      phone,
      role, 
      lookingforwho,
      fullAddress, 
      signupDate: getIndianTime(),
      lastupdated: getIndianTime()
    };

    // Only include role-specific fields
    if (role === "Business Owner") {
      payload.company = company;
    } else if (role === "Investor") {
      payload.companiesinvested = companiesinvested;
    } else if (role === "Freelancer/Worker") {
      payload.skillsets = skillsets;
      payload.companiesworked = companiesworked;
    } else if (role === "Co-Founder") {
      payload.wantinvestment = wantinvestment;
    }

    console.log("Form Data:", formData);
    setLoading(true);

    if (role !== "Freelancer/Worker") {
      delete payload.skillsets;
      delete payload.companiesworked;
    }
    
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Signup successful!", {
          onClose: () => {
            window.location.href = "/login";
          }
        });
      } else {
        toast.error(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while signing up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="shadow p-5 rounded mb-2" style={{ maxWidth: "750px", width: "100%" }}>
        <h2 className="text-center pb-3">Create Your Account</h2>
        <hr />
        <div className="mb-3">
          <label className="form-label">I am a:</label>
          <div className="d-flex flex-wrap gap-4" role="group">
            {roles.map((role) => (
              <button
                type="button"
                key={role}
                className={`btn custom-btn-size ${formData.role === role ? "btn-secondary" : "btn-outline-secondary"}`}
                onClick={() => handleRoleSelect(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">First Name :</label>
              <input
                type="text"
                name="firstname"
                className="form-control"
                placeholder="Enter first name"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Last Name :</label>
              <input
                type="text"
                name="lastname"
                className="form-control"
                placeholder="Enter last name"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Username :</label>
              <div className="position-relative">
                <input
                  type="text"
                  name="username"
                  className={`form-control ${usernameAvailable === false ? 'is-invalid' : ''} ${usernameAvailable === true ? 'is-valid' : ''}`}
                  placeholder="Enter username (min 3 chars)"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                />
                {usernameChecking && (
                  <div className="position-absolute end-0 top-0 mt-2 me-2">
                    <div className="spinner-border spinner-border-sm text-secondary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {usernameAvailable === false && (
                  <div className="invalid-feedback">Username is already taken</div>
                )}
                {usernameAvailable === true && (
                  <div className="valid-feedback">Username is available</div>
                )}
              </div>
            </div>
            <div className="col">
              <label className="form-label">Email address :</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="form-text">We'll never share your email.</div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Password :</label>
              <div className="input-group password">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  placeholder="Password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <span
                  className="input-group-text"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </span>
              </div>
            </div>

            <div className="col">
              <label className="form-label">Confirm Password :</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span
                  className="input-group-text"
                  onClick={toggleConfirmPasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </span>
              </div>
            </div>
          </div>

            <div className="mb-3 position-relative">
              <label className="form-label">Location :</label>
              <LocationInput
                value={formData.location}
                onChange={(val) => setFormData((prev) => ({ ...prev, location: val }))}
              />
            </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Phone Number :</label>
              <input
                type="number"
                name="phone"
                className="form-control"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Looking For :</label>
              <input
                type="text"
                name="lookingforwho"
                className="form-control"
                placeholder="Describe what are you looking for"
                value={formData.lookingforwho}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.role === "Business Owner" && (
            <div className="mb-3">
              <label className="form-label">Enter company Name :</label>
              <input
                type="text"
                name="company"
                className="form-control"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.role === "Investor" && (
            <div className="mb-3">
              <label className="form-label">Companies you have invested in (if any) :</label>
              <input
                type="text"
                name="companiesinvested"
                className="form-control"
                placeholder="Enter companies/StartUps name"
                value={formData.companiesinvested}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.role === "Freelancer/Worker" && (
            <div className="row mb-3">
              <div className="col">
                <label className="form-label">Skillsets :</label>
                <input
                  type="text"
                  name="skillsets"
                  className="form-control"
                  placeholder="Enter Skills (comma separated)"
                  value={formData.skillsets.join(', ')}
                  onChange={(e) => {
                    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
                    setFormData(prev => ({ ...prev, skillsets: skillsArray }));
                  }}
                />
              </div>
              <div className="col">
                <label className="form-label">Companies worked at :</label>
                <input
                  type="text"
                  name="companiesworked"
                  className="form-control"
                  placeholder="Enter company names"
                  value={formData.companiesworked}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {formData.role === "Co-Founder" && (
            <div className="mb-3">
              <label className="form-label">Company you want investment for (if any) :</label>
              <input
                type="text"
                name="wantinvestment"
                className="form-control"
                placeholder="Enter company name"
                value={formData.wantinvestment}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input border border-1 border-primary"
              id="termsCheck"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />
            <label className="form-check-label ms-2" htmlFor="termsCheck">
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading || usernameAvailable === false}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating your account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">Already have an account? <a href="/login">Login</a></p>
          </div>

          <div className="text-center mt-3">
            <p className="mb-0">Or sign up with:</p>
            <div className="d-flex justify-content-center gap-3 mt-2">
                <GoogleLogin
                  onSuccess={handleLogin}
                  onError={() => console.log('Google Login Failed')}
                />
              <button
                className="btn btn-outline-primary"
                onClick={() => handleSocialLogin("facebook", "facebook_token_here")}
              >
                <i className="bi bi-facebook"></i> GitHub
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover={false}
        draggable
      />
    </div>
  );
}

export default Signup;