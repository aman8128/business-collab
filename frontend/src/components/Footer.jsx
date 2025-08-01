import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>VentureLink Network</h5>
            <p>Connecting business owners, co-founders, investors, and talent.</p>
          </Col>
          <Col md={2}>
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white">Home</a></li>
              <li><a href="/browse" className="text-white">Browse</a></li>
              <li><a href="/about" className="text-white">About</a></li>
            </ul>
          </Col>
          <Col md={2}>
            <h5>Resources</h5>
            <ul className="list-unstyled">
              <li><a href="/faq" className="text-white">FAQ</a></li>
              <li><a href="/support" className="text-white">Support</a></li>
              <li><a href="/terms" className="text-white">Terms</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li>Email: contact@venturelinknetwork.com</li>
              <li>Address: 123 Business Ave, Tech District, CA</li>
            </ul>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="mb-0">© 2025 VentureLink Network. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;