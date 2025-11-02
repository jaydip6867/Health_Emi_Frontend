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
} from "react-bootstrap";
import Amb_Sidebar from "./Amb_Sidebar";
import Amb_Nav from "./Amb_Nav";
import axios from "axios";

const Amb_Profile = () => {
  const SECRET_KEY = "health-emi";
  const navigate = useNavigate();
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const getlocaldata = localStorage.getItem("healthambulance");
        if (!getlocaldata) {
          navigate("/ambulance");
          return;
        }

        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const data = JSON.parse(decrypted);
        console.log(data.accessToken);
        if (!data || !data.accessToken) {
          navigate("/ambulance");
          return;
        }

        const response = await axios.get(
          "https://healtheasy-o25g.onrender.com/ambulance/profile",
          {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          }
        );

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

  if (loading) {
    return <div className="text-center p-5">Loading profile data...</div>;
  }

  if (!ambulance) {
    return <div className="text-center p-5">Error loading profile data</div>;
  }

  return (
    <Container fluid className="p-0 panel">
      <Row className="g-0">
        <Amb_Sidebar />
        <Col xs={12} sm={9} lg={10} className="p-3">
          <div className="profile-page">
            <Container fluid>
              <Row>
                <Col lg={12} md={12} className="p-0">
                  <Amb_Nav ambulancename={ambulance.fullname} />

                  <Row>
                    <Col md={4} className="mb-4">
                      <Card className="shadow-sm h-100 border-0">
                        <Card.Body className="text-center p-4">
                          {/* Profile Header with Status */}

                          <div className="d-flex justify-content-center">
                            <Image
                              src={
                                ambulance.driver_pic ||
                                "https://via.placeholder.com/150"
                              }
                              roundedCircle
                              width={150}
                              height={150}
                              className="border border-3 border-primary position-relative"
                              style={{ objectFit: "cover" }}
                            />
                          </div>

                          {/* Driver Info */}
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

                          {/* Contact Details */}
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

                          {/* Vehicle Info */}
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
                                        ambulance.ambulance_fitness_expiry
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
                  </Row>
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
