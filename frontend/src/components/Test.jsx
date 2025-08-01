import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './test.css'

const SignupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    role: '',
    location: '',
    lookingforwho: '',
    skillsets: []
  });
  const [otp, setOtp] = useState({
    emailOtp: '',
    phoneOtp: ''
  });
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    setOtp({
      ...otp,
      [name]: value
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!otp.emailOtp) newErrors.emailOtp = 'Email OTP is required';
    if (!otp.phoneOtp) newErrors.phoneOtp = 'Phone OTP is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.firstname) newErrors.firstname = 'First name is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmailOtp = async () => {
    if (!formData.email) {
      setErrors({...errors, email: 'Email is required'});
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/send-email-otp', {
        email: formData.email
      });
      setMessage('Email OTP sent successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to send email OTP');
      console.error('Email OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOtp = async () => {
    if (!formData.phone) {
      setErrors({...errors, phone: 'Phone is required'});
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/send-sms-otp', {
        phoneNumber: formData.phone
      });
      console.log('Mock SMS OTP sent (check server console for OTP)');
      setMessage('Phone OTP sent successfully (mock service)');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to send phone OTP');
      console.error('Phone OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/verify-otp', {
        identifier: formData.email,
        otp: otp.emailOtp
      });

      if (response.data.success) {
        setVerificationStatus({...verificationStatus, emailVerified: true});
        setMessage('Email verified successfully');
      } else {
        setMessage(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      setMessage('Error verifying email OTP');
      console.error('Verify email error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5001/verify-otp', {
        identifier: formData.phone,
        otp: otp.phoneOtp
      });

      if (response.data.success) {
        setVerificationStatus({...verificationStatus, phoneVerified: true});
        setMessage('Phone verified successfully');
      } else {
        setMessage(response.data.message || 'Phone verification failed');
      }
    } catch (error) {
      setMessage('Error verifying phone OTP');
      console.error('Verify phone error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/signup', {
        ...formData,
        emailVerified: true,
        phoneVerified: true
      });

      if (response.data.success) {
        setMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(response.data.message || 'Signup failed');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating account');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
    setMessage('');
  };

  const prevStep = () => {
    setStep(step - 1);
    setMessage('');
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step">
            <h3>Step 1: Verify Your Email and Phone</h3>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={verificationStatus.emailVerified}
              />
              {errors.email && <span className="error">{errors.email}</span>}
              {!verificationStatus.emailVerified && (
                <div className="otp-actions">
                  <button type="button" onClick={sendEmailOtp} disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={verificationStatus.phoneVerified}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
              {!verificationStatus.phoneVerified && (
                <div className="otp-actions">
                  <button type="button" onClick={sendPhoneOtp} disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={nextStep} disabled={!formData.email || !formData.phone}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h3>Step 2: Enter Verification Codes</h3>
            
            {!verificationStatus.emailVerified && (
              <div className="form-group">
                <label>Email OTP</label>
                <input
                  type="text"
                  name="emailOtp"
                  value={otp.emailOtp}
                  onChange={handleOtpChange}
                  maxLength="6"
                />
                {errors.emailOtp && <span className="error">{errors.emailOtp}</span>}
                <div className="otp-actions">
                  <button type="button" onClick={verifyEmailOtp} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <button type="button" onClick={sendEmailOtp} disabled={loading}>
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {!verificationStatus.phoneVerified && (
              <div className="form-group">
                <label>Phone OTP</label>
                <input
                  type="text"
                  name="phoneOtp"
                  value={otp.phoneOtp}
                  onChange={handleOtpChange}
                  maxLength="6"
                />
                {errors.phoneOtp && <span className="error">{errors.phoneOtp}</span>}
                <div className="otp-actions">
                  <button type="button" onClick={verifyPhoneOtp} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Phone'}
                  </button>
                  <button type="button" onClick={sendPhoneOtp} disabled={loading}>
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button 
                type="button" 
                onClick={nextStep} 
                disabled={!verificationStatus.emailVerified || !verificationStatus.phoneVerified}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h3>Step 3: Complete Your Profile</h3>
            
            <div className="form-group">
              <label>Username*</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name*</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                />
                {errors.firstname && <span className="error">{errors.firstname}</span>}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password*</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group">
              <label>Role*</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select your role</option>
                <option value="investor">Investor</option>
                <option value="founder">Founder</option>
                <option value="freelancer">Freelancer</option>
                <option value="worker">Worker</option>
              </select>
              {errors.role && <span className="error">{errors.role}</span>}
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Looking For (Who you want to connect with)</label>
              <input
                type="text"
                name="lookingforwho"
                value={formData.lookingforwho}
                onChange={handleChange}
              />
            </div>

            {formData.role === 'freelancer' || formData.role === 'worker' ? (
              <div className="form-group">
                <label>Skillsets (comma separated)</label>
                <input
                  type="text"
                  name="skillsets"
                  value={formData.skillsets.join(',')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(skill => skill.trim());
                    setFormData({...formData, skillsets: skills});
                  }}
                />
              </div>
            ) : null}

            <div className="form-actions">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="login-link">
        Already have an account? <a href="/login">Log in</a>
      </div>
    </div>
  );
};

export default SignupForm;