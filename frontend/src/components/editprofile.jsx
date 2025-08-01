import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Spinner, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LocationInput from './LocationInput';

const EditProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    location: '',
    about: '',
    role: '',
    company: '',
    jobtitle: '',
    companiesinvested: '',
    wantinvestment: '',
    education: '',
    lookingforwho: '',
    experience: '',
    skillsets: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      
      try {
        const parsedUser = JSON.parse(storedUser);
        const res = await axios.get(`http://localhost:5001/getUsers`);
        
        const user = res.data.find(u => u._id === parsedUser._id || u.email === parsedUser.email);
        if (user) {
          setFormData({
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            about: user.about || '',
            role: user.role || '',
            company: user.company || '',
            jobtitle: user.jobtitle || '',
            companiesinvested: user.companiesinvested || '',
            wantinvestment: user.wantinvestment || '',
            lookingforwho: user.lookingforwho || '',
            education: user.education || '',
            experience: user.experience || '',
            skillsets: Array.isArray(user.skillsets) ? user.skillsets : 
                      typeof user.skillsets === 'string' ? user.skillsets.split(',').map(s => s.trim()) : [],
          });

          if (user.imageUrl) {
            setPreview(user.imageUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Error in fetching data!");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsetsChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      skillsets: value.split(',').map(s => s.trim())
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        navigate('/login');
        return;
      }
      if(!formData.phone){
        toast.error("Phone number cannot be empty!");
        return;
      }

      const formPayload = new FormData();
      formPayload.append('_id', storedUser._id);
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          if (Array.isArray(formData[key])) {
            formPayload.append(key, formData[key].join(','));
          } else {
            formPayload.append(key, formData[key]);
          }
        }
      });

      if (profileImage) {
        formPayload.append('profileImage', profileImage);
      }

      const res = await axios.post('http://localhost:5001/updateProfile', formPayload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.message) {
        const updatedUser = { ...storedUser, ...formData };
        if (res.data.imageUrl) {
          updatedUser.imageUrl = res.data.imageUrl;
        }
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success("Profile updated successfully!");
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <h2>Edit Profile</h2>
              </Card.Title>
              
              <Form onSubmit={handleUpdateProfile}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control 
                        name="firstname" 
                        value={formData.firstname} 
                        onChange={handleChange} 
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control 
                        name="lastname" 
                        value={formData.lastname} 
                        onChange={handleChange} 
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control 
                        type="email"
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control 
                        type="tel"
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+91 8934567890"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <LocationInput
                    value={formData.location}
                    onChange={(val) => setFormData((prev) => ({ ...prev, location: val }))}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3 text-center">
                  <Form.Label>Profile Image</Form.Label>
                  <div>
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="rounded-circle mb-2" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="mb-2 text-muted">No image selected</div>
                    )}
                    <Form.Control 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileImage(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>About You</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={3}
                    name="about" 
                    value={formData.about} 
                    onChange={handleChange} 
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>

                {formData.role === 'Business Owner' && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Company</Form.Label>
                        <Form.Control 
                          name="company" 
                          value={formData.company} 
                          onChange={handleChange} 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Job Title</Form.Label>
                        <Form.Control 
                          name="jobtitle" 
                          value={formData.jobtitle} 
                          onChange={handleChange} 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {formData.role === 'Investor' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Companies Invested In</Form.Label>
                    <Form.Control 
                      as="textarea"
                      rows={2}
                      name="companiesinvested" 
                      value={formData.companiesinvested} 
                      onChange={handleChange} 
                      placeholder="List companies separated by commas"
                    />
                  </Form.Group>
                )}

                {formData.role === 'Co-Founder' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Looking For</Form.Label>
                    <Form.Control
                      name="lookingforwho" 
                      value={formData.lookingforwho} 
                      onChange={handleChange} 
                      placeholder="Describe what you're looking for"
                    />
                  </Form.Group>
                )}

                {(formData.role === 'Freelancer/Worker') && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Skillsets (comma separated)</Form.Label>
                      <Form.Control
                        value={formData.skillsets.join(', ')} 
                        onChange={handleSkillsetsChange} 
                        placeholder="e.g., JavaScript, React, Node.js"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Experience</Form.Label>
                      <Form.Control 
                        as="textarea"
                        rows={2}
                        name="experience" 
                        value={formData.experience} 
                        onChange={handleChange} 
                        placeholder="Your professional experience"
                      />
                    </Form.Group>
   
                    <Form.Group className="mb-3">
                      <Form.Label>Education</Form.Label>
                      <Form.Control 
                        name="education" 
                        value={formData.education} 
                        onChange={handleChange} 
                        placeholder="Your educational background"
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/profile')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                        <span className="ms-2">Saving...</span>
                      </>
                    ) : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover={false}
        draggable
      />
    </Container>
  );
};

export default EditProfile;
