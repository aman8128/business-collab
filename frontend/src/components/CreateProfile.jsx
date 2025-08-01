import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import LocationInput from "./LocationInput"; 
import { toast, ToastContainer } from "react-toastify";

function CreateProfile() {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: "",
    phone: "",
    lookingforwho: "",
    role: "",
    skillsets: [],
    wantinvestment: false,
    company: "",
    companiesinvested: "",
    about: "",
    profileImage: null
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.provider === "local") {
      navigate("/");
    } else {
      setUser(parsedUser);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, profileImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value.split(",").map(s => s.trim());
    setFormData({ ...formData, skillsets: skills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("_id", user._id);
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => data.append(`${key}[]`, item));
      } else {
        data.append(key, value);
      }
    });

    try {
      setSaving(true);
      const res = await axios.post("http://localhost:5001/updateProfile", data);
      const updatedUser = { ...user, ...formData, profileImage: res.data.imageUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log()
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      console.error(err);
      alert("Error creating profile");
    } finally{
      setSaving(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">Complete Your Profile</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <LocationInput
                value={formData.location}
                onChange={(val) => setFormData((prev) => ({ ...prev, location: val }))}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10,15}" // Ensures only numbers with 10-15 digits
                title="Please enter a valid phone number (10-15 digits)"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Looking For</Form.Label>
          <Form.Select name="lookingforwho" onChange={handleChange} required>
            <option value="">Select...</option>
            <option>Business Partner</option>
            <option>Investor</option>
            <option>Co-founder</option>
            <option>Talent</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select name="role" onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Investor">Investor</option>
            <option value="Co-Founder">Co-Founder</option>
            <option value="Freelancer/Worker">Freelancer/Worker</option>
          </Form.Select>
        </Form.Group>

        {/* Conditional Fields */}
        {["freelancer", "worker"].includes(formData.role.toLowerCase()) && (
          <Form.Group className="mb-3">
            <Form.Label>Skillsets (comma separated)</Form.Label>
            <Form.Control type="text" onChange={handleSkillChange} />
          </Form.Group>
        )}

        {formData.role === "Business Owner" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control name="company" type="text" value={formData.company} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Looking for Investment?"
                name="wantinvestment"
                checked={formData.wantinvestment}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}

        {formData.role === "Investor" && (
          <Form.Group className="mb-3">
            <Form.Label>Companies Invested In</Form.Label>
            <Form.Control
              name="companiesinvested"
              type="text"
              value={formData.companiesinvested}
              onChange={handleChange}
            />

            <Form.Label className="mt-2">Looking for : </Form.Label>
            <Form.Control
              name="lookingforwho"
              type="text"
              value={formData.lookingforwho}
              onChange={handleChange}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3">
          <Form.Label>About You</Form.Label>
          <Form.Control
            as="textarea"
            name="about"
            rows={3}
            value={formData.about}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Profile Image</Form.Label>
          <Form.Control type="file" name="profileImage" accept="image/*" onChange={handleChange} />
        </Form.Group>

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
      </Form>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover={false}
      />
    </Container>
  );
}

export default CreateProfile;
