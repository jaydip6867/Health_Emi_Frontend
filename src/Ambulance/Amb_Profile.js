import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import {
  Col,
  Container,
  Row,
  Card,
  Image,
  Badge,
  Tab,
  Nav,
  Tabs,
  Button,
  Form,
} from "react-bootstrap";
import Amb_Sidebar from "./Amb_Sidebar";
import Amb_Nav from "./Amb_Nav";
import axios from "axios";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";

const Amb_Profile = () => {
  const navigate = useNavigate();
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    dob: '',
    address: '',
    country: '',
    state: '',
    city: '',
    vehicleNo: '',
    rcNo: '',
    vehicleType: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
        if (!getlocaldata) {
          navigate("/ambulance");
          return;
        }

        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const data = JSON.parse(decrypted);

        if (!data || !data.accessToken) {
          navigate("/ambulance");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/ambulance/profile`, {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });

        setAmbulance(response.data.Data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        navigate("/ambulance");
      }
    };

    fetchProfile();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (ambulance) {
      setFormData({
        name: ambulance.fullname || '',
        email: ambulance.email || '',
        mobile: ambulance.mobile || '',
        dob: ambulance.dob || '',
        address: ambulance.address || '',
        country: ambulance.country || '',
        state: ambulance.state || '',
        city: ambulance.city || '',
        vehicleNo: ambulance.vehicle_no || '',
        rcNo: ambulance.rc_no || '',
        vehicleType: ambulance.ambulance_type || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    console.log('Form submitted:', formData);
    // After successful submission, exit edit mode
    setIsEditing(false);
  };

  // Initialize form data when ambulance data is loaded
  useEffect(() => {
    if (ambulance) {
      setFormData({
        name: ambulance.fullname || '',
        email: ambulance.email || '',
        mobile: ambulance.mobile || '',
        dob: ambulance.dob || '',
        address: ambulance.address || '',
        country: ambulance.country || '',
        state: ambulance.state || '',
        city: ambulance.city || '',
        vehicleNo: ambulance.vehicle_no || '',
        rcNo: ambulance.rc_no || '',
        vehicleType: ambulance.ambulance_type || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [ambulance]);

  if (loading) {
    return <div className="text-center p-5">Loading profile data...</div>;
  }

  if (!ambulance) {
    return <div className="text-center p-5">Error loading profile data</div>;
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Amb_Sidebar ambulance={ambulance} />
        <Col xs={12} sm={9} className="p-3">
          <div className="profile-page">
            <Container fluid>
              <Row>
                <Col lg={12} md={12} className="p-0">
                  {/* <Amb_Nav ambulancename={ambulance.fullname} /> */}
                  <div className='appointments-card mb-3 mt-4'>
                    <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                      <h4 className='mb-0'>Ambulance Profile</h4>
                    </div>
                  </div>
                  {/* <Form className='register_doctor'> */}
                  <div className="p-3 shadow-sm rounded-4">
                    <Tabs
                      defaultActiveKey="personal"
                      id="uncontrolled-tab-example"
                      className="mb-3 border-0 setting_tab gap-3"
                    >
                      <Tab eventKey="personal" title="Personal Information">
                        <Form>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  placeholder="Enter your name"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  placeholder="Enter your email"
                                  disabled
                                />
                                <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Mobile</Form.Label>
                                <Form.Control
                                  type="tel"
                                  name="mobile"
                                  value={formData.mobile}
                                  onChange={handleInputChange}
                                  placeholder="Enter your mobile number"
                                  disabled
                                />
                                <Form.Text className="text-muted">Mobile cannot be changed</Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Date of Birth</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="dob"
                                  value={formData.dob}
                                  onChange={handleInputChange}
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Address</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  placeholder="Enter your address"
                                  rows={3}
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Country</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="country"
                                  value={formData.country}
                                  onChange={handleInputChange}
                                  placeholder="Enter country"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">State</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="state"
                                  value={formData.state}
                                  onChange={handleInputChange}
                                  placeholder="Enter state"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">City</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="city"
                                  value={formData.city}
                                  onChange={handleInputChange}
                                  placeholder="Enter city"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="text-center mt-4">
                            {isEditing && (
                              <Button variant="primary" type="submit" onClick={handleSubmit}>
                                Save Personal Information
                              </Button>
                            )}
                          </div>
                        </Form>
                      </Tab>
                      <Tab eventKey="vehicle" title="Vehicle Information">
                        <Form>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Vehicle Number</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="vehicleNo"
                                  value={formData.vehicleNo}
                                  onChange={handleInputChange}
                                  placeholder="Enter vehicle number"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">RC Number</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="rcNo"
                                  value={formData.rcNo}
                                  onChange={handleInputChange}
                                  placeholder="Enter RC number"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Vehicle Type</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="vehicleType"
                                  value={formData.vehicleType}
                                  onChange={handleInputChange}
                                  placeholder="Enter vehicle type"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Ambulance Photos</Form.Label>
                                <Row className="g-3">
                                  <Col md={4}>
                                    <div className="text-center">
                                      <h6 className="text-muted mb-2">Front View</h6>
                                      {ambulance?.ambulance_front_pic ? (
                                        <Image
                                          src={ambulance.ambulance_front_pic}
                                          thumbnail
                                          className="w-100 mb-2"
                                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div className="bg-light p-4 rounded mb-2">
                                          <p className="text-muted mb-0">No photo uploaded</p>
                                        </div>
                                      )}
                                    </div>
                                  </Col>
                                  <Col md={4}>
                                    <div className="text-center">
                                      <h6 className="text-muted mb-2">Back View</h6>
                                      {ambulance?.ambulance_back_pic ? (
                                        <Image
                                          src={ambulance.ambulance_back_pic}
                                          thumbnail
                                          className="w-100 mb-2"
                                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div className="bg-light p-4 rounded mb-2">
                                          <p className="text-muted mb-0">No photo uploaded</p>
                                        </div>
                                      )}
                                    </div>
                                  </Col>
                                  <Col md={4}>
                                    <div className="text-center">
                                      <h6 className="text-muted mb-2">Fitness Certificate</h6>
                                      {ambulance?.ambulance_fitness_pic ? (
                                        <Image
                                          src={ambulance.ambulance_fitness_pic}
                                          thumbnail
                                          className="w-100 mb-2"
                                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div className="bg-light p-4 rounded mb-2">
                                          <p className="text-muted mb-0">No photo uploaded</p>
                                        </div>
                                      )}
                                    </div>
                                  </Col>
                                </Row>
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="text-center mt-4">
                            {isEditing && (
                              <Button variant="primary" type="submit" onClick={handleSubmit}>
                                Save Vehicle Information
                              </Button>
                            )}
                          </div>
                        </Form>
                      </Tab>
                      <Tab eventKey="document" title="Document Information">
                        <Form>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Driving License</Form.Label>
                                {ambulance?.driving_licence_pic ? (
                                  <div className="mt-2">
                                    <Image
                                      src={ambulance.driving_licence_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="mt-2">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        href={ambulance.driving_licence_pic}
                                        target="_blank"
                                      >
                                        View Full Size
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-light p-4 rounded text-center">
                                    <p className="text-muted mb-0">No document uploaded</p>
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">RC Document</Form.Label>
                                {ambulance?.rc_pic ? (
                                  <div className="mt-2">
                                    <Image
                                      src={ambulance.rc_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="mt-2">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        href={ambulance.rc_pic}
                                        target="_blank"
                                      >
                                        View Full Size
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-light p-4 rounded text-center">
                                    <p className="text-muted mb-0">No document uploaded</p>
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Insurance</Form.Label>
                                <div className="mb-2">
                                  <small className="text-muted">
                                    Expiry: {formatDate(ambulance?.insurance_expiry)}
                                  </small>
                                </div>
                                {ambulance?.insurance_pic ? (
                                  <div className="mt-2">
                                    <Image
                                      src={ambulance.insurance_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="mt-2">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        href={ambulance.insurance_pic}
                                        target="_blank"
                                      >
                                        View Full Size
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-light p-4 rounded text-center">
                                    <p className="text-muted mb-0">No document uploaded</p>
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Pollution Certificate</Form.Label>
                                <div className="mb-2">
                                  <small className="text-muted">
                                    Expiry: {formatDate(ambulance?.polution_expiry)}
                                  </small>
                                </div>
                                {ambulance?.polution_pic ? (
                                  <div className="mt-2">
                                    <Image
                                      src={ambulance.polution_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="mt-2">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        href={ambulance.polution_pic}
                                        target="_blank"
                                      >
                                        View Full Size
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-light p-4 rounded text-center">
                                    <p className="text-muted mb-0">No document uploaded</p>
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="text-center mt-4">
                            {isEditing && (
                              <Button variant="primary" type="submit" onClick={handleSubmit}>
                                Update Documents
                              </Button>
                            )}
                          </div>
                        </Form>
                      </Tab>
                      <Tab eventKey="password" title="Change Password">
                        <Form>
                          <Row className="g-3">
                            <Col md={8}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Current Password</Form.Label>
                                <Form.Control
                                  type="password"
                                  name="currentPassword"
                                  value={formData.currentPassword}
                                  onChange={handleInputChange}
                                  placeholder="Enter current password"
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={8}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">New Password</Form.Label>
                                <Form.Control
                                  type="password"
                                  name="newPassword"
                                  value={formData.newPassword}
                                  onChange={handleInputChange}
                                  placeholder="Enter new password"
                                  minLength={8}
                                  disabled={!isEditing}
                                />
                                <Form.Text className="text-muted">
                                  Password must be at least 8 characters long
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={8}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Confirm New Password</Form.Label>
                                <Form.Control
                                  type="password"
                                  placeholder="Confirm new password"
                                  minLength={8}
                                />
                                <Form.Text className="text-muted">
                                  Re-enter your new password to confirm
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="text-center mt-4">
                            {isEditing && (
                              <>
                                <Button variant="primary" type="submit" onClick={handleSubmit}>
                                  Change Password
                                </Button>
                                <Button variant="secondary" className="ms-2" type="button" onClick={handleCancelClick}>
                                  Clear
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="mt-4">
                            <h6 className="text-muted mb-2">Password Guidelines:</h6>
                            <ul className="small text-muted">
                              <li>Use at least 8 characters</li>
                              <li>Include uppercase and lowercase letters</li>
                              <li>Include numbers and special characters</li>
                              <li>Avoid using personal information</li>
                              <li>Don't reuse old passwords</li>
                            </ul>
                          </div>
                        </Form>
                      </Tab>
                    </Tabs>
                  </div>

                  {/* Edit/Submit/Cancel Buttons */}
                  <div className="text-center mt-3 mb-4">
                    {!isEditing ? (
                      <Button variant="primary" onClick={handleEditClick}>
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="success" type="submit" onClick={handleSubmit} className="me-2">
                          <i className="bi bi-check-circle me-2"></i>
                          Submit Changes
                        </Button>
                        <Button variant="secondary" onClick={handleCancelClick}>
                          <i className="bi bi-x-circle me-2"></i>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                  {/* </Form> */}
                  {/* <Row>
                    <Col md={4} className="mb-4">
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Body className="text-center p-4">
                          <div className="d-flex justify-content-center">
                            <Image
                              src={
                                ambulance.driver_pic ||
                                "https://via.placeholder.com/150"
                              }
                              roundedCircle
                              className="border border-3 border-primary position-relative"
                              style={{
                                objectFit: "cover",
                                width: "150px",
                                height: "150px",
                              }}
                            />
                          </div>

                          <div className="mb-4">
                            <h3 className="mb-1 fw-bold text-dark">
                              {ambulance.fullname}
                            </h3>
                            <p className="text-muted mb-3">
                              <i className="bi bi-envelope me-2"></i>
                              {ambulance.email}
                            </p>

                            <div className="d-flex justify-content-center gap-2 mb-3">
                              <Badge
                                bg="light"
                                className="text-dark border border-primary px-3 py-2"
                                style={{ fontSize: "0.9rem" }}
                              >
                                <i className="bi bi-ambulance me-1 text-primary"></i>
                                {ambulance.ambulance_type}
                              </Badge>
                              <Badge
                                bg="light"
                                className="text-dark border border-info px-3 py-2"
                                style={{ fontSize: "0.9rem" }}
                              >
                                <i className="bi bi-star-fill text-warning me-1"></i>
                                {ambulance.experience}
                              </Badge>
                              <Badge
                                bg="light"
                                className={
                                  ambulance.ambulance_status === "available"
                                    ? "text-success border border-success px-3 py-2"
                                    : "text-danger border border-danger px-3 py-2"
                                }
                                style={{ fontSize: "0.9rem" }}
                              >
                                <i className="bi bi-ambulance me-1 text-primary"></i>
                                {ambulance.ambulance_status
                                  .charAt(0)
                                  .toUpperCase() +
                                  ambulance.ambulance_status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-light p-3 rounded-3">
                            <div className="d-flex align-items-center mb-2">
                              <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                <i className="bi bi-telephone text-primary"></i>
                              </div>
                              <div className="text-start">
                                <small className="text-muted">Mobile</small>
                                <p className="mb-0 fw-medium">
                                  {ambulance.mobile}
                                </p>
                              </div>
                            </div>

                            <div className="d-flex align-items-center mb-2">
                              <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                                <i className="bi bi-droplet text-danger"></i>
                              </div>
                              <div className="text-start">
                                <small className="text-muted">
                                  Blood Group
                                </small>
                                <p className="mb-0 fw-medium">
                                  {ambulance.blood_group || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                                <i className="bi bi-geo-alt text-success"></i>
                              </div>
                              <div className="text-start">
                                <small className="text-muted">Location</small>
                                <p className="mb-0 fw-medium">
                                  {ambulance.city}, {ambulance.state}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h6 className="text-uppercase text-muted mb-3">
                              Vehicle Information
                            </h6>
                            <Row className="g-2">
                              <Col xs={6}>
                                <div className="p-2 bg-light rounded text-center">
                                  <small className="text-muted d-block">
                                    Vehicle No
                                  </small>
                                  <span className="fw-medium">
                                    {ambulance.vehicle_no}
                                  </span>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="p-2 bg-light rounded text-center">
                                  <small className="text-muted d-block">
                                    RC No
                                  </small>
                                  <span className="fw-medium">
                                    {ambulance.rc_no}
                                  </span>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={8}>
                      <Card className="shadow-sm h-100">
                        <Card.Body>
                          <Tab.Container
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                          >
                            <Nav variant="tabs" className="mb-4">
                              <Nav.Item>
                                <Nav.Link eventKey="personal">
                                  Personal Info
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link eventKey="documents">
                                  Documents
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link eventKey="ambulance">
                                  Ambulance Details
                                </Nav.Link>
                              </Nav.Item>
                            </Nav>

                            <Tab.Content>
                              <Tab.Pane eventKey="personal">
                                <Row>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <h6 className="text-muted">Full Name</h6>
                                      <p>{ambulance.fullname}</p>
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <h6 className="text-muted">Email</h6>
                                      <p>{ambulance.email}</p>
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <h6 className="text-muted">
                                        Date of Birth
                                      </h6>
                                      <p>{formatDate(ambulance.dob)}</p>
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <h6 className="text-muted">Gender</h6>
                                      <p>{ambulance.gender}</p>
                                    </div>
                                  </Col>
                                  <Col md={12}>
                                    <div className="mb-3">
                                      <h6 className="text-muted">Address</h6>
                                      <p>{ambulance.address}</p>
                                    </div>
                                  </Col>
                                </Row>
                              </Tab.Pane>

                              <Tab.Pane eventKey="documents">
                                <Row>
                                  <Col md={6} className="mb-4">
                                    <h6>Driving License</h6>
                                    <Image
                                      src={ambulance.driving_licence_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                    />
                                  </Col>
                                  <Col md={6} className="mb-4">
                                    <h6>RC Document</h6>
                                    <Image
                                      src={ambulance.rc_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                    />
                                  </Col>
                                  <Col md={6} className="mb-4">
                                    <h6>Insurance</h6>
                                    <p>
                                      Expiry:{" "}
                                      {formatDate(ambulance.insurance_expiry)}
                                    </p>
                                    <Image
                                      src={ambulance.insurance_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                    />
                                  </Col>
                                  <Col md={6} className="mb-4">
                                    <h6>Pollution Certificate</h6>
                                    <p>
                                      Expiry:{" "}
                                      {formatDate(ambulance.polution_expiry)}
                                    </p>
                                    <Image
                                      src={ambulance.polution_pic}
                                      fluid
                                      thumbnail
                                      className="w-100"
                                    />
                                  </Col>
                                </Row>
                              </Tab.Pane>

                              <Tab.Pane eventKey="ambulance">
                                <Row>
                                  <Col md={6} className="mb-4">
                                    <h6>Ambulance Type</h6>
                                    <p>{ambulance.ambulance_type}</p>

                                    <h6 className="mt-3">Facilities</h6>
                                    <ul>
                                      {ambulance.ambulance_facilities
                                        .split(",")
                                        .map((facility, index) => (
                                          <li key={index}>{facility.trim()}</li>
                                        ))}
                                    </ul>
                                  </Col>
                                  <Col md={6} className="mb-4">
                                    <h6>Ambulance Photos</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                      <Image
                                        src={ambulance.ambulance_front_pic}
                                        thumbnail
                                        className="w-100 mb-2"
                                      />
                                      <Image
                                        src={ambulance.ambulance_back_pic}
                                        thumbnail
                                        className="w-100 mb-2"
                                      />
                                      <Image
                                        src={ambulance.ambulance_fitness_pic}
                                        thumbnail
                                        className="w-100"
                                      />
                                    </div>
                                    <p className="mt-2">
                                      <strong>Fitness Expiry:</strong>{" "}
                                      {formatDate(
                                        ambulance.ambulance_fitness_expiry,
                                      )}
                                    </p>
                                  </Col>
                                </Row>
                              </Tab.Pane>
                            </Tab.Content>
                          </Tab.Container>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row> */}
                </Col>
              </Row>
            </Container>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Amb_Profile;
