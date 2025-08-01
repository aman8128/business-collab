import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './profile.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const parseSignUpDate = (dateStr) => {
  if (!dateStr) return 'Not available';

  try {
    const [datePart] = dateStr.split(',');
    const [day, month, year] = datePart.trim().split('/');

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
  } catch (error) {
    return 'Invalid date';
  }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          navigate('/login');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const response = await axios.get(`http://localhost:5001/getUsers`);
        const currentUser = response.data.find(user => 
          user._id === parsedUser._id || 
          user.email === parsedUser.email
        );

        if (currentUser) {
          setProfileData({
            ...currentUser,
            formattedJoinDate: parseSignUpDate(currentUser.signupdate)
          });
        }     
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container className="my-5">
        <div className="alert alert-warning">No profile data available</div>
      </Container>
    );
  }

  const renderRoleSpecificContent = () => {
    switch(profileData.role) {
      case 'Business Owner':
        return (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>My Business</Card.Title>
                <hr />
                <p>{profileData.company || 'No business information added'}</p>
              </Card.Body>
            </Card>
          </>
        );
      case 'Investor':
        return (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Investment Portfolio</Card.Title>
                <hr />
                <p>{profileData.companiesinvested || 'No investments listed'}</p>
              </Card.Body>
            </Card>
          </>
        );
      case 'Co-Founder':
        return (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Looking For</Card.Title>
                <hr />
                <p>{profileData.lookingforwho || 'What are you looking for?'}</p>
              </Card.Body>
            </Card>
          </>
        );
      case 'Freelancer/Worker':
        return (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Skills & Expertise</Card.Title>
                <hr />
                <p>{profileData.skillsets?.join(', ') || 'No skills added'}</p>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Work Experience</Card.Title>
                <hr />
                <p>{profileData.companiesworked || 'No work experience added'}</p>
              </Card.Body>
            </Card>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="my-5 profile-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {profileData.profileImage && (
                <img
                  src={`http://localhost:5001${profileData.profileImage}`}
                  alt="Profile"
                  width="100"
                  height="100"
                  style={{
                    borderRadius: '50%',
                    marginRight: '20px',
                    objectFit: 'cover',   // 🔥 Makes landscape/cropped images fit without distortion
                    objectPosition: 'center' // (Optional) centers the content
                  }}
                />

              )}
              <div>
                <h1 className="mb-0">My Profile</h1>
                <Badge bg={
                  profileData.role === 'Business Owner' ? 'primary' :
                  profileData.role === 'Investor' ? 'success' :
                  profileData.role === 'Co-Founder' ? 'warning' :
                  'secondary'
                } className="mt-2">
                  {profileData.role || 'Member'}
                </Badge>
                <h3 className="mb-0 mt-2">
                  {profileData.firstname} {profileData.lastname}
                </h3>
                <div className="text-muted">@{profileData.username}</div>
              </div>
            </div>
            <div>
              <Button 
              variant={
                profileData.role === 'Business Owner' ? 'outline-primary' :
                profileData.role === 'Investor' ? 'outline-success' :
                profileData.role === 'Co-Founder' ? 'outline-warning' :
                profileData.role === 'Freelancer/Worker' ? 'outline-info' :
                'outline-secondary'
              }
              className="me-2" onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
              <Button 
              onClick={
                profileData.role === 'Business Owner' ? () => navigate('/post') :
                () => navigate('/browse')
              }

              variant={
                profileData.role === 'Business Owner' ? 'primary' :
                profileData.role === 'Investor' ? 'success' :
                profileData.role === 'Co-Founder' ? 'warning' :
                profileData.role === 'Freelancer/Worker' ? 'info' :
                'secondary'
              }>
                {profileData.role === 'Business Owner' ? 'Post Requirements' :
                 profileData.role === 'Investor' ? 'Browse Startups' :
                 profileData.role === 'Co-Founder' ? 'Find Co-Founders' :
                 profileData.role === 'Freelancer/Worker' ? 'Browse Jobs' :
                 'Browse Jobs'}
              </Button>
            </div>
          </div>
          <hr className="mt-3" />
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Contact Information</Card.Title>
              <hr />
              <div className="mb-3">
                <strong>Email:</strong> {profileData.email || 'Not provided'}
              </div>
              <div className="mb-3">
                <strong>Phone:</strong> {profileData.phone || 'Not provided'}
              </div>
              <div>
                <strong>Member Since:</strong> {profileData.formattedJoinDate}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Location</Card.Title>
              <hr />
              <div>
                <i className="bi bi-geo-alt-fill me-2"></i>
                {profileData.location || 'Location not specified'}
              </div>
              {profileData.fullAddress && (
                <div className="mt-2 text-muted small">
                  <i className="bi bi-info-circle me-2"></i>
                  {profileData.fullAddress}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>About Me</Card.Title>
              <hr />
              <p>{profileData.about || 'Add information about yourself'}</p>
            </Card.Body>
          </Card>

          {profileData.companiesworked && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Companies you have worked in:</Card.Title>
                <hr />
                <p>{profileData.companiesworked}</p>
              </Card.Body>
            </Card>
          )}

          {renderRoleSpecificContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;