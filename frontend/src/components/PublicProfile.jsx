import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card,  Badge, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function PublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile,setProfileData] = useState(null);
  
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
    fetch(`http://localhost:5001/user-public-profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        setLoading(false);
        const currentUser = data.user;
        console.log(currentUser);
        if (currentUser) {
          setProfileData({
            ...currentUser,
            formattedJoinDate: parseSignUpDate(currentUser.signupdate)
          });
        }
      });
  }, [userId]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (!user) {
    return <Container className="text-center mt-5">User not found.</Container>;
  }

  return (
    <Container className="my-5 profile-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-center align-items-center">
            <div className="d-flex align-items-center">
              {user.profileImage && (
                <img
                  src={`http://localhost:5001${user.profileImage}`}
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
                <h1 className="mb-0">{user.firstname}'s Profile</h1>
                <Badge bg={
                  user.role === 'Business Owner' ? 'primary' :
                  user.role === 'Investor' ? 'success' :
                  user.role === 'Co-Founder' ? 'warning' :
                  'secondary'
                } className="mt-2">
                  {user.role || 'Member'}
                </Badge>
                <h3 className="mb-0 mt-2">
                  {user.firstname} {user.lastname}
                </h3>
                <div className="text-muted">@{user.username}</div>
              </div>
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
                <strong>Email:</strong> {user.email || 'Not provided'}
              </div>
              <div>
                <strong>Member Since:</strong> {profile ? profile.formattedJoinDate : 'Not available'}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Location</Card.Title>
              <hr />
              <div>
                <i className="bi bi-geo-alt-fill me-2"></i>
                {user.location || 'Location not specified'}
              </div>
              {user.fullAddress && (
                <div className="mt-2 text-muted small">
                  <i className="bi bi-info-circle me-2"></i>
                  {user.fullAddress}
                </div>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>About {user.firstname}</Card.Title>
              <hr />
              <p>{user.about || 'Add information about yourself'}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          
          {user.role === "Freelancer/Worker" && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Companies you have worked in:</Card.Title>
                <hr />
                <p>{user.companiesworked}</p>
              </Card.Body>
            </Card>
            
          )}

          { user.skillsets && user.skillsets.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Skills</Card.Title>
                <hr />
                <ul className="list-unstyled">
                  {user.skillsets.map((skill, index) => (
                    <li key={index} className="mb-2">
                      <Badge bg="secondary">{skill}</Badge>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}
          {user.company && user.company.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Company</Card.Title>
                <hr />
                <p>{user.company}</p>
              </Card.Body>
            </Card>
          )}

          {user.lookingforwho && user.lookingforwho.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Looking For</Card.Title>
                <hr />
                <p>{user.lookingforwho}</p>
              </Card.Body>
            </Card>
          )}

          {user.companiesinvested && user.companiesinvested.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>companies invested in : </Card.Title>
                <hr/>
                <p>{user.companiesinvested} </p>
              </Card.Body>
            </Card>
          )}

          {user.wantinvestment && user.wantinvestment.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Wants Investment for : </Card.Title>
                <hr />
                <p>{user.wantinvestment === "false" ? "Not specified!" : user.wantinvestment}</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
