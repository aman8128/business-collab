import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaLinkedin, FaHandshake, FaUsers, FaLightbulb, FaUserPlus } from 'react-icons/fa';
import teamImage from '../image/logo-lexorahub.png';
import './About.css';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user exists in localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserData(user);
    }
  }, []);

  const handleJoinClick = () => {
    if (isLoggedIn) {
      navigate('/browse'); // Redirect to browse page if logged in
    } else {
      navigate('/register'); // Redirect to signup if not logged in
    }
  };

  return (
    <Container className="about-page py-5">
      {/* Hero Section */}
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h1 className="display-4 fw-bold mb-4">Connecting Visionaries</h1>
          <p className="lead text-muted mb-4">
            {isLoggedIn ? (
              `Welcome back, ${userData?.firstname || 'valued member'}! Ready to explore new connections?`
            ) : (
              "We're building the premier platform for entrepreneurs, investors, and professionals to collaborate and grow together."
            )}
          </p>
          <div className="d-flex gap-3">
            <Button variant="primary" size="lg" onClick={handleJoinClick}>
              {isLoggedIn ? 'Explore Network' : 'Join Our Network'}
            </Button>
            <Button 
              variant={isLoggedIn ? "outline-success" : "outline-secondary"} 
              size="lg"
              onClick={() => navigate(isLoggedIn ? '/profile' : '/about')}
            >
              {isLoggedIn ? 'View Profile' : 'Learn More'}
            </Button>
          </div>
        </Col>
        <Col md={6} className="d-none d-md-block">
          <div className="about-hero-image rounded-4 shadow-lg overflow-hidden">
            <img src={teamImage} alt="Team collaborating" className="img-fluid" />
          </div>
        </Col>
      </Row>

      {/* Personalized Welcome for Logged-in Users */}
      {isLoggedIn && (
        <Alert variant="success" className="mb-5">
          <h5 className="fw-bold">✨ Your Network Status</h5>
          <p className="mb-0">
            You've made <strong>{userData?.connections?.length || 0}</strong> connections and have{' '}
            <strong>{userData?.opportunities?.length || 0}</strong> active opportunities.
          </p>
        </Alert>
      )}

      {/* Mission Section */}
      <section className="mission-section py-5 my-5 bg-light rounded-4">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Our Mission</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaHandshake className="text-primary fs-3" />
                  </div>
                  <h4>Facilitate Connections</h4>
                  <p className="text-muted">
                    {isLoggedIn ? (
                      "Browse our directory to find your next collaborator or investor."
                    ) : (
                      "Bridge the gap between talented professionals and exciting opportunities."
                    )}
                  </p>
                  {isLoggedIn && (
                    <Button variant="outline-primary" size="sm" onClick={() => navigate('/browse')}>
                      Browse Members
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaUsers className="text-success fs-3" />
                  </div>
                  <h4>Build Community</h4>
                  <p className="text-muted">
                    {isLoggedIn ? (
                      "Join specialized groups matching your interests and expertise."
                    ) : (
                      "Create a supportive ecosystem where members help each other succeed."
                    )}
                  </p>
                  {isLoggedIn && (
                    <Button variant="outline-success" size="sm" onClick={() => navigate('/communities')}>
                      Explore Groups
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaLightbulb className="text-warning fs-3" />
                  </div>
                  <h4>Spark Innovation</h4>
                  <p className="text-muted">
                    {isLoggedIn ? (
                      "Post your ideas and find collaborators for your next project."
                    ) : (
                      "Foster collaboration that leads to groundbreaking ideas and ventures."
                    )}
                  </p>
                  {isLoggedIn && (
                    <Button variant="outline-warning" size="sm" onClick={() => navigate('/post')}>
                      Post Opportunity
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Dynamic CTA Section */}
      <section className={`cta-section ${isLoggedIn ? 'bg-success' : 'bg-primary'} text-white rounded-4 p-5 my-5 text-center`}>
        <h2 className="fw-bold mb-3">
          {isLoggedIn ? 'Ready to Expand Your Network?' : 'Ready to Grow Your Network?'}
        </h2>
        <p className="mb-4 opacity-75">
          {isLoggedIn ? (
            'Discover new opportunities tailored to your profile.'
          ) : (
            'Join thousands of professionals already making valuable connections.'
          )}
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Button 
            variant="light" 
            size="lg" 
            className="px-4"
            onClick={() => navigate(isLoggedIn ? '/browse' : '/register')}
          >
            {isLoggedIn ? 'Browse Opportunities' : 'Sign Up Now'}
          </Button>
          {isLoggedIn && (
            <Button 
              variant="outline-light" 
              size="lg" 
              className="px-4"
              onClick={() => navigate('/invite')}
            >
              <FaUserPlus className="me-2" />
              Invite Colleagues
            </Button>
          )}
        </div>
      </section>
    </Container>
  );
};

export default About;