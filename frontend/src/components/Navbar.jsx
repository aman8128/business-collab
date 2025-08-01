import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, NavDropdown, Container, Button, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../image/logo-lexora-.png";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function NavBar() {
  const [users, setUsers] = useState([]); 

  useEffect(() => {
    axios.get("http://localhost:5001/getUsers")
      .then((users) => setUsers(users.data))
      .catch(err => console.log(err));
  }, []);

  const [show, setShow] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserLoggedIn(true);
      setUserName(parsedUser.username || "User");
      setProfileImage(parsedUser.profileImage || "https://via.placeholder.com/150");
    }
  }, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserLoggedIn(false);
    setShow(false);
    navigate("/login");

    toast.success("Logout successful!", {
      onClose: () => {
        navigate("/login");
      },
      autoClose: 1700,
    });
  };

  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark" sticky="top" className="shadow-sm px-2">
        <Container fluid className="px-2">
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img src={logo} alt="Logo" style={{ height: "36px", marginRight: "8px" }} />
            <span className="fw-semibold">Lexora Hub</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto me-2 d-flex align-items-center gap-4">
              {userLoggedIn ? (
                <>
                  <Nav.Link href="/">Home</Nav.Link>
                  <Nav.Link href="/browse">Browse</Nav.Link>
                  <Nav.Link href="/about">About</Nav.Link>
                  <Nav.Link href="/contact">Contact</Nav.Link>

                  <NavDropdown title={<img
                        src={`http://localhost:5001${profileImage}`}
                        alt="Profile"
                        className="profile-image"
                      />} menuVariant="dark" align="end" className="user-dropdown">
                    <NavDropdown.Item className="dropdown-item btn" href="/profile">My Profile</NavDropdown.Item>
                    <NavDropdown.Item className="dropdown-item btn" href="/dashboard">My Dashboard</NavDropdown.Item>
                    <NavDropdown.Item className="dropdown-item btn" href="/messages">Messages</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <button className="dropdown-item btn" onClick={handleShow}>
                      Logout
                    </button>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Link href="/login">Login</Nav.Link>
                  <Nav.Link href="/signup">Sign Up</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton className="justify-content-center">
          <Modal.Title className="w-100 text-center">Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          Are you sure?<br />You want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleLogout}>Logout</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover={false}
        draggable
      />
    </>
  );
}

export default NavBar;
