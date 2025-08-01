import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import TopSearchBar from "./TopSearchBar";

function Home() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const user = localStorage.getItem("user");
  if (user) {
    const parsedUser = JSON.parse(user);
    
    if (!parsedUser.role || parsedUser.role.trim() === "") {
      // Role missing -> send to create-profile
      navigate("/create-profile");
      return;
    }
    
    setRole(parsedUser.role);

    // Agar provider google hai lekin role missing hai to create-profile pe redirect
    if(parsedUser.provider === "google" && (!parsedUser.role || parsedUser.role.trim() === "")) {
      navigate("/create-profile");
    }
    } 
  }, [navigate]);


  if (!role) {
    return (
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section text-center py-5">
          <Container>
            <h1 className="display-4 fw-bold mb-4">Connect.</h1>
            <h1 className="display-4 fw-bold mb-4">Collaborate.</h1>
            <h1 className="display-4 fw-bold mb-4">Create.</h1>
            <p className="lead mb-5">
              Find the perfect business partner, investor, co-founder, or talent to take your business to the next level.
            </p>
            
            <div className="search-bar mb-5">
              <div className="d-flex justify-content-center">
                <div className="input-group" style={{ maxWidth: "600px" }}>
                  <TopSearchBar />
                  
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-center gap-3 mb-5">
              <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
                Join Now
              </Button>
              <Button variant="outline-primary" size="lg" onClick={() => navigate('/browse')}>
                Browse
              </Button>
            </div>
          </Container>
        </section>

        {/* Who's on Lexora Hub */}
        <section className="py-5">
          <Container>
            <h2 className="text-center mb-5">Who's on Lexora Hub Network?</h2>
            
            <Row className="g-4 mb-5">
              <Col md={6}>
                <h3>Business Owners</h3>
                <p>Find co-founders, investors, or talent to grow your business.</p>
                <Button variant="outline-primary" onClick={() => navigate('/signup')}>
                  Join as Business Owner
                </Button>
              </Col>
              
              <Col md={6}>
                <h3>Co-founders</h3>
                <p>Connect with entrepreneurs looking for skilled partners.</p>
                <Button variant="outline-primary" onClick={() => navigate('/signup')}>
                  Join as Co-founder
                </Button>
              </Col>
            </Row>
            
            <Row className="g-4">
              <Col md={6}>
                <h3>Investors</h3>
                <p>Discover promising startups and business opportunities.</p>
                <Button variant="outline-primary" onClick={() => navigate('/signup')}>
                  Join as Investor
                </Button>
              </Col>
              
              <Col md={6}>
                <h3>Freelancers</h3>
                <p>Offer your skills to businesses that need your expertise.</p>
                <Button variant="outline-primary" onClick={() => navigate('/signup')}>
                  Join as Freelancer
                </Button>
              </Col>
            </Row>
          </Container>
        </section>

        {/* How It Works */}
        <section className="py-5 bg-light">
          <Container>
            <h2 className="text-center mb-5">How It Works</h2>
            
            <Row className="g-4">
              <Col md={4}>
                <div className="text-center p-4">
                  <div className="number-circle mb-3">1</div>
                  <h4>Create Your Profile</h4>
                  <p>Sign up and build your professional profile to showcase your skills and requirements.</p>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="text-center p-4">
                  <div className="number-circle mb-3">2</div>
                  <h4>Post Your Requirements</h4>
                  <p>Let others know what you are looking for – be it investment, partnership, or talent.</p>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="text-center p-4">
                  <div className="number-circle mb-3">3</div>
                  <h4>Connect & Collaborate</h4>
                  <p>Browse profiles, connect with matches, and start your business journey together.</p>
                </div>
              </Col>
            </Row>
            
            <div className="text-center mt-5">
              <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          </Container>
        </section>

        {/* Success Stories */}
        <section className="py-5">
          <Container>
            <h2 className="text-center mb-5">Success Stories</h2>
            
            <Row className="g-4">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>Sarah & David</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Co-Founders</Card.Subtitle>
                    <Card.Text>
                      Met through Lexora Hub and launched a successful tech startup that raised $2M in seed funding.
                    </Card.Text>
                    <Button variant="outline-primary">View Profile</Button>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>Michael</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Entrepreneur</Card.Subtitle>
                    <Card.Text>
                      Found angel investors through the platform and scaled his e-commerce business to 7 figures.
                    </Card.Text>
                    <Button variant="outline-primary">View Profile</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-5 bg-primary text-white">
          <Container className="text-center">
            <h2 className="mb-4">Ready to find your next business opportunity?</h2>
            <p className="lead mb-5">Join thousands of professionals already connecting on Lexora Hub Network</p>
            
            <div className="d-flex justify-content-center gap-3">
              <Button variant="light" size="lg" onClick={() => navigate('/signup')}>
                Sign Up Free
              </Button>
              <Button variant="outline-light" size="lg" onClick={() => navigate('/browse')}>
                Browse Opportunities
              </Button>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  // For logged-in users (dashboard based on role)
  return (
    <div className="dashboard-page">
      <Container className="py-5">
        {role === "Business Owner" && (
          <>
            <h1 className="mb-4">Business Owner Dashboard</h1>
            <Row className="g-4">
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Find Co-founders</Card.Title>
                    <Card.Text>
                      Connect with potential co-founders for your business.
                      <TopSearchBar />
                    </Card.Text>
                    <Button variant="primary">Browse Co-founders</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Find Investors</Card.Title>
                    <Card.Text>
                      Discover investors interested in your industry.
                    </Card.Text>
                    <Button variant="primary">Browse Investors</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Find Talent</Card.Title>
                    <Card.Text>
                      Hire skilled professionals for your business needs.
                    </Card.Text>
                    <Button variant="primary">Browse Talent</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {role === "Co-Founder" && (
          <>
            {/* Full-width background */}
            <div className="top hero-section text-center" style={{ backgroundColor: "#0d6efd", color: "white", padding: "3rem 0", width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
              <div className="container">
                <h1>Welcome Back to Lexora Hub</h1>
                <TopSearchBar />

                <p>Connect with entrepreneurs and startups looking for co-founders.</p>
              </div>
            </div>

            <Container className="mt-4">
              <h1 className="mb-4">Co-Founder Dashboard</h1>
              <Row className="g-4">
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Find Business Opportunities</Card.Title>
                      <Card.Text>
                        Discover businesses looking for co-founders.
                      </Card.Text>
                      <Button variant="primary" onClick={() => navigate('/browse')}>Browse Opportunities</Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Your Skills</Card.Title>
                      <Card.Text>
                        Showcase your expertise to potential partners.
                      </Card.Text>
                      <Button variant="primary" onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </>
        )}

        {role === "Investor" && (
          <>
            <h1 className="mb-4">Investor Dashboard</h1>
            <Row className="g-4">
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Browse Startups</Card.Title>
                    <Card.Text>
                      Find promising startups to invest in.
                    </Card.Text>
                    <Button variant="primary">Browse Startups</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Your Investment Criteria</Card.Title>
                    <Card.Text>
                      Update your investment preferences.
                    </Card.Text>
                    <Button variant="primary" onClick={() => navigate('/edit-profile')}>Edit Profile</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {role === "Freelancer/Worker" && (
          <>
            <h1 className="mb-4">Freelancer Dashboard</h1>
            <Row className="g-4">
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Find Projects</Card.Title>
                    <Card.Text>
                      Browse available projects matching your skills.
                    </Card.Text>
                    <Button variant="primary">Browse Projects</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Your Portfolio</Card.Title>
                    <Card.Text>
                      Showcase your work and skills to potential clients.
                    </Card.Text>
                    <Button variant="primary">Edit Profile</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Home;