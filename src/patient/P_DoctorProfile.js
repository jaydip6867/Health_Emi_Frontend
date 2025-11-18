import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../Loader";
import {
  Button,
  Card,
  CardFooter,
  Col,
  Container,
  Form,
  Image,
  ListGroup,
  Modal,
  Row,
} from "react-bootstrap";
import P_Sidebar from "./P_Sidebar";
import NavBar from "../Visitor/Component/NavBar";
import FooterBar from "../Visitor/Component/FooterBar";
import {
  FaMapMarkerAlt,
  FaEye,
  FaUserMd,
  FaAward,
  FaCalendarAlt,
  FaStethoscope,
} from "react-icons/fa";
import { FaEnvelope, FaPhone, FaStar, FaLocationDot } from "react-icons/fa6";
import CryptoJS from "crypto-js";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { TbArrowBadgeRight } from "react-icons/tb";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const P_DoctorProfile = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  // const [time, settime] = useState(['9:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'])
  // const [chtime, setchtime] = useState('');

  var { id } = useParams("id");
  const d_id = atob(decodeURIComponent(id));
  // console.log(d_id)
  var navigate = useNavigate();
  const [loading, setloading] = useState(false);

  const [patient, setpatient] = useState(null);
  const [token, settoken] = useState(null);

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate("/patient");
    } else {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  const [doctor_profile, setdocprofile] = useState(null);

  useEffect(() => {
    setloading(true);
    if (patient) {
      setTimeout(() => {
        getdoctordata();
      }, 200);
    }
  }, [patient]);

  function getdoctordata() {
    axios({
      method: "post",
      url: `${API_BASE_URL}/user/doctors/getone`,
      // headers: {
      //     Authorization: token
      // },
      data: {
        doctorid: d_id,
      },
    })
      .then((res) => {
        setdocprofile(res.data.Data);
        console.log("doctor ", res.data.Data);
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setloading(false);
      });
  }

  const [show, setShow] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleServiceModalClose = () => setShowServiceModal(false);
  const handleServiceModalShow = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  var app_obj = {
    alt_mobile: "",
    surgeryid: "",
    appointment_reason: "",
    report: "",
    visit_types: "",
  };
  const [apt_data, setaptdata] = useState(app_obj);

  function appchangedata(e) {
    const { name, value } = e.target;
    setaptdata((apt_data) => ({
      ...apt_data,
      [name]: value,
    }));
  }

  function appointmentbtn(id) {
    // Split at the space before the time
    const [datePart, timePart, meridiem] = formattedDateTime.split(" ");
    // Combine time + meridiem
    const timeWithMeridiem = `${timePart} ${meridiem}`;
    // console.log(apt_data, datePart, timeWithMeridiem )
    setloading(true);
    axios({
      method: "post",
      url: `${API_BASE_URL}/user/appointments/save`,
      headers: {
        Authorization: token,
      },
      data: {
        patientname: patient.name,
        mobile: patient.mobile,
        alt_mobile: apt_data.alt_mobile,
        date: datePart,
        time: timeWithMeridiem,
        surgeryid: apt_data.surgeryid,
        appointment_reason: apt_data.appointment_reason,
        report: apt_data.report,
        doctorid: id,
        visit_types: apt_data.visit_types,
      },
    })
      .then((res) => {
        Swal.fire({
          title: "Appointment Add Successfully...",
          icon: "success",
          confirmButtonText: "Ok.",
        }).then((result) => {
          navigate("/patient/appointment");
        });
      })
      .catch(function (error) {
        Swal.fire({
          title: "Something Went Wrong.",
          text: "Something Is Missing. Please Check Details...",
          icon: "error",
        });
      })
      .finally(() => {
        setloading(false);
      });
  }

  const formattedDateTime = selectedDate
    ? format(selectedDate, "dd-MM-yyyy hh:mm a")
    : "";
  return (
    <>
      <NavBar logindata={patient} />
      <Container fluid className="p-0 panel">
        <Row className="g-0">
          <P_Sidebar />
          <Col xs={12} sm={9} lg={10} className="p-4">
            {/* <P_nav patientname={patient && patient.name} /> */}
            <Card
              className="shadow-lg border-0"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              {doctor_profile === null ? (
                <Col>No Doctor Found</Col>
              ) : (
                <>
                  {/* Hero Section */}
                  <div className="position-relative pt-4">
                    <Row className="align-items-center">
                      <Col md={3} className="text-center">
                        <div className="position-relative d-inline-block doctor_img">
                          {doctor_profile.profile_pic === "" ? (
                            <Image
                              src={require("../assets/image/doctor_img.jpg")}
                              roundedCircle
                              className="border border-4 border-white shadow-lg"
                            />
                          ) : (
                            <Image
                              src={doctor_profile?.profile_pic}
                              roundedCircle
                              className="border border-4 border-white shadow-lg"
                              alt={doctor_profile?.name}
                              title={doctor_profile?.name}
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = require("../assets/image/doctor_img.jpg");
                              }}
                            />
                          )}
                          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-2">
                            <FaUserMd className="text-white" size={20} />
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <h2 className="fw-bold mb-2">
                          Dr. {doctor_profile.name}
                        </h2>
                        <h5 className="mb-3 opacity-90">
                          <FaStethoscope className="me-2" />
                          {doctor_profile.specialty}
                        </h5>
                        <div className="mb-2">
                          <FaLocationDot className="me-2" />
                          <span>{doctor_profile.hospital_address}</span>
                        </div>
                        <div className="mb-2">
                          <FaEnvelope className="me-2" />
                          <span>{doctor_profile.email}</span>
                        </div>
                        <div className="mb-3">
                          <FaPhone className="me-2" />
                          <span>{doctor_profile.mobile}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-warning me-3">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} size={18} />
                            ))}
                          </div>
                          <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                            <FaAward className="me-1" />
                            Verified Doctor
                          </span>
                        </div>
                      </Col>
                      <Col md={3} className="text-center">
                        <div className="bg-white bg-opacity-20 rounded-3 p-3 mb-3">
                          <h3 className="fw-bold mb-1">
                            {doctor_profile.experience}+
                          </h3>
                          <small>Years Experience</small>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-3 p-3">
                          <h3 className="fw-bold mb-1">95%</h3>
                          <small>Patient Satisfaction</small>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <div className="p-4">
                    <Row>
                      {/* Main Content */}
                      <Col md={8}>
                        {/* Bio Section */}
                        <Card
                          className="mb-4 border-0 shadow-sm"
                          style={{ borderRadius: "15px" }}
                        >
                          <Card.Header
                            className="bg-gradient text-white"
                            style={{
                              background:
                                "linear-gradient(45deg, #667eea, #764ba2)",
                              borderRadius: "15px 15px 0 0",
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FaUserMd className="me-2" />
                              About Dr. {doctor_profile.name}
                            </h6>
                          </Card.Header>
                          <Card.Body className="p-4">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <div className="d-flex align-items-start mb-3">
                                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                    <FaStar className="text-success" />
                                  </div>
                                  <div>
                                    <h6 className="fw-bold text-success mb-1">
                                      Positive Feedback
                                    </h6>
                                    <p className="small text-muted mb-0">
                                      "Dr. {doctor_profile.name} was excellent
                                      at explaining my condition and treatment
                                      options clearly."
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex align-items-start">
                                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                    <FaStethoscope className="text-info" />
                                  </div>
                                  <div>
                                    <h6 className="fw-bold text-info mb-1">
                                      Professional Care
                                    </h6>
                                    <p className="small text-muted mb-0">
                                      "Highly professional with modern treatment
                                      approaches and excellent patient care."
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>

                        {/* Services Section */}
                        <Card
                          className="border-0 shadow-sm"
                          style={{ borderRadius: "15px" }}
                        >
                          <Card.Header
                            className="bg-gradient text-white"
                            style={{
                              background:
                                "linear-gradient(45deg, #667eea, #764ba2)",
                              borderRadius: "15px 15px 0 0",
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FaStethoscope className="me-2" />
                              Services & Pricing
                            </h6>
                          </Card.Header>
                          <Card.Body className="p-0">
                            <div className="row g-3 p-4">
                              {doctor_profile &&
                                doctor_profile.surgeriesDetails.map((v, i) => {
                                  return (
                                    <div className="col-md-6" key={i}>
                                      <Card
                                        className="h-100 border-0 shadow-sm service-card"
                                        style={{
                                          borderRadius: "12px",
                                          transition: "all 0.3s ease",
                                        }}
                                      >
                                        <Card.Body className="p-3">
                                          <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="flex-grow-1">
                                              <h6 className="fw-bold text-dark mb-2">
                                                {v.name}
                                              </h6>
                                              <div className="d-flex align-items-center justify-content-between">
                                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                                                  ₹{v.price}
                                                </span>
                                                <Button
                                                  variant="outline-primary"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleServiceModalShow(v)
                                                  }
                                                  className="rounded-pill px-3"
                                                  style={{
                                                    transition: "all 0.3s ease",
                                                  }}
                                                >
                                                  <FaEye className="me-1" />
                                                  Details
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </Card.Body>
                                      </Card>
                                    </div>
                                  );
                                })}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Sidebar */}
                      <Col md={4}>
                        <Card
                          className="border-0 shadow-sm sticky-top"
                          style={{ borderRadius: "15px", top: "20px" }}
                        >
                          <Card.Header
                            className="bg-gradient text-white text-center"
                            style={{
                              background:
                                "linear-gradient(45deg, #667eea, #764ba2)",
                              borderRadius: "15px 15px 0 0",
                            }}
                          >
                            <h6 className="mb-0 fw-bold">
                              <FaCalendarAlt className="me-2" />
                              Quick Actions
                            </h6>
                          </Card.Header>
                          <Card.Body className="p-4">
                            <div className="text-center mb-4">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                                <FaUserMd className="text-primary" size={30} />
                              </div>
                              <h6 className="fw-bold">
                                Dr. {doctor_profile.name}
                              </h6>
                              <p className="text-muted small mb-0">
                                {doctor_profile.specialty}
                              </p>
                            </div>

                            <div className="row g-3 mb-4">
                              <div className="col-6">
                                <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                  <h6 className="fw-bold text-success mb-1">
                                    {doctor_profile.experience}+
                                  </h6>
                                  <small className="text-muted">
                                    Years Exp.
                                  </small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-center">
                                  <h6 className="fw-bold text-warning mb-1">
                                    95%
                                  </h6>
                                  <small className="text-muted">
                                    Recommend
                                  </small>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h6 className="fw-bold mb-3">
                                Consultation Options
                              </h6>
                              <div className="d-flex align-items-center mb-2">
                                <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                  <FaStethoscope
                                    className="text-info"
                                    size={14}
                                  />
                                </div>
                                <span className="small">
                                  In-person consultation
                                </span>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                  <FaPhone className="text-success" size={14} />
                                </div>
                                <span className="small">
                                  Online consultation
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                  <FaMapMarkerAlt
                                    className="text-primary"
                                    size={14}
                                  />
                                </div>
                                <span className="small">
                                  Home visit available
                                </span>
                              </div>
                            </div>

                            <Button
                              variant="primary"
                              onClick={handleShow}
                              className="w-100 rounded-pill py-3 fw-bold"
                            // style={{
                            //     background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            //     border: 'none',
                            //     boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                            // }}
                            >
                              {/* <FaCalendarAlt className="me-2" /> */}
                              Book Appointment
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
      {patient && doctor_profile && (
        <Modal show={show} size="lg" onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col xs={12}>
                <Form>
                  <Row className="g-4">
                    <Col xs={4}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={patient.name}
                        disabled
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        value={patient.mobile}
                        disabled
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Alt Phone Number</Form.Label>
                      <Form.Control
                        value={apt_data.alt_mobile}
                        name="alt_mobile"
                        onChange={appchangedata}
                        placeholder="Alt. Phone Number"
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Surgery</Form.Label>
                      <Form.Select name="surgeryid" onChange={appchangedata}>
                        <option value="">Select Surgery</option>
                        {doctor_profile.surgeriesDetails.map((v, i) => {
                          return (
                            <option value={v._id} key={i}>
                              {v.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Reason</Form.Label>
                      <Form.Control
                        value={apt_data.appointment_reason}
                        name="appointment_reason"
                        onChange={appchangedata}
                        placeholder="Appointment Reason"
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Reports</Form.Label>
                      {/* <Form.Control type='file' value={apt_data.report} name='report' onChange={appchangedata}></Form.Control> */}
                      <p className="text-secondary">Under Maintenance</p>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Check
                        label="Home Visit"
                        type="radio"
                        name="visit_types"
                        value={"home_visit"}
                        onChange={appchangedata}
                      />
                      <Form.Check
                        label="Clinic Visit"
                        type="radio"
                        name="visit_types"
                        value={"clinic_visit"}
                        onChange={appchangedata}
                      />
                      <Form.Check
                        label="EOPD"
                        type="radio"
                        name="visit_types"
                        value={"eopd"}
                        onChange={appchangedata}
                      />
                    </Col>
                    <Col xs={6} md={6}>
                      <Form.Label>Appointment Date</Form.Label>
                      <br />
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        showTimeSelect
                        timeFormat="hh:mm a"
                        timeIntervals={15}
                        dateFormat="dd-MM-yyyy hh:mm a"
                        placeholderText="Select date and time"
                        minDate={new Date()}
                      />
                    </Col>
                  </Row>
                </Form>
              </Col>

              {/* <Col xs={12} md={6}>
                                <ToggleButtonGroup type="radio" name="options" defaultValue={1} className='btnradio-app flex-wrap gap-2'>
                                    {
                                        time.map((v, i) => {
                                            return (
                                                <ToggleButton key={i} value={v} variant='outline-dark' id={`time-btn-${i}`} name='time' onClick={() => setchtime(v)}>{v}</ToggleButton>
                                            )
                                        })
                                    }
                                </ToggleButtonGroup>
                            </Col> */}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                appointmentbtn(doctor_profile._id);
                handleClose();
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <Modal
          show={showServiceModal}
          size="xl"
          onHide={handleServiceModalClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Service Details - {selectedService.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row className="g-4">
                {/* Service Image */}
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Service Image</h6>
                    </Card.Header>
                    <Card.Body className=" flex-column d-flex justify-content-around">
                      <div className="text-center">
                        {selectedService.surgery_photo ? (
                          <Image
                            src={selectedService.surgery_photo}
                            alt={selectedService.name}
                            fluid
                            rounded
                            className="mb-3"
                            style={{ maxHeight: "200px" }}
                          />
                        ) : (
                          <div
                            className="bg-light p-4 rounded mb-3"
                            style={{
                              height: "200px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span className="text-muted">
                              No image available
                            </span>
                          </div>
                        )}
                        <p>
                          <strong>Surgery Type:</strong>{" "}
                          {selectedService.surgery_type || "Not specified"}
                        </p>
                        <p>
                          <strong>Duration:</strong>{" "}
                          {selectedService.days || "Not specified"} days
                        </p>
                        <p>
                          <strong>Completed Surgeries:</strong>{" "}
                          {selectedService.completed_surgery || "0"}
                        </p>
                      </div>
                      <div className="d-flex justify-content-center">
                        <Button
                          variant="primary"
                          onClick={() => {
                            handleServiceModalClose();
                            handleShow();
                          }}
                        >
                          Book Appointment for this Service
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Service Details */}
                <Col md={8}>
                  <Row className="g-3">
                    {/* Basic Information */}
                    <Col xs={12}>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Basic Information</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <p>
                                <strong>Name:</strong> {selectedService.name}
                              </p>
                              <p>
                                <strong>Description:</strong>{" "}
                                {selectedService.description ||
                                  "No description available"}
                              </p>
                            </Col>
                            <Col md={6}>
                              <p>
                                <strong>Features:</strong>
                              </p>
                              <ul className="small">
                                {selectedService.features ? (
                                  Array.isArray(selectedService.features) ? (
                                    selectedService.features.map(
                                      (feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                      )
                                    )
                                  ) : (
                                    <li>{selectedService.features}</li>
                                  )
                                ) : (
                                  <li className="text-muted">
                                    No features listed
                                  </li>
                                )}
                              </ul>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Pricing Information */}
                    <Col xs={12}>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Pricing Details</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between">
                                  <span>General Price:</span>
                                  <strong>
                                    ₹
                                    {selectedService.general_price ||
                                      selectedService.price ||
                                      "N/A"}
                                  </strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                  <span>Private Price:</span>
                                  <strong>
                                    ₹{selectedService.private_price || "N/A"}
                                  </strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                  <span>Semi-Private Price:</span>
                                  <strong>
                                    ₹
                                    {selectedService.semiprivate_price || "N/A"}
                                  </strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                  <span>Deluxe Price:</span>
                                  <strong>
                                    ₹{selectedService.delux_price || "N/A"}
                                  </strong>
                                </ListGroup.Item>
                              </ListGroup>
                            </Col>
                            <Col md={6}>
                              <h6>Additional Features</h6>
                              <div className="d-flex flex-wrap gap-2">
                                {selectedService.additional_features ? (
                                  selectedService.additional_features
                                    .split(",")
                                    .map((feature, idx) => {
                                      const colors = [
                                        'bg-primary bg-opacity-10 text-primary border-primary',
                                        'bg-success bg-opacity-10 text-success border-success',
                                        'bg-info bg-opacity-10 text-info border-info',
                                        'bg-warning bg-opacity-10 text-warning border-warning',
                                        'bg-danger bg-opacity-10 text-danger border-danger',
                                        'bg-purple bg-opacity-10 text-purple border-purple',
                                        'bg-pink bg-opacity-10 text-pink border-pink'
                                      ];
                                      const colorClass = colors[idx % colors.length];
                                      return (
                                        <span
                                          key={idx}
                                          className={`badge d-flex align-items-center border rounded-pill px-3 py-2 ${colorClass} fw-medium`}
                                        >
                                          {feature.trim()}
                                        </span>
                                      );
                                    })
                                ) : (
                                  <span className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    No additional features
                                  </span>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Inclusions and Exclusions */}
                    <Col xs={12}>
                      <Row>
                        <Col md={6}>
                          <Card className="h-100">
                            <Card.Header className="bg-success text-white">
                              <h6 className="mb-0 text-white">What's Included</h6>
                            </Card.Header>
                            <Card.Body
                              style={{ maxHeight: "250px", overflowY: "auto" }}
                            >
                              {selectedService.inclusive ? (
                                selectedService.inclusive
                                  .split(",")
                                  .map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="d-flex align-items-center"
                                    >
                                      <TbArrowBadgeRight className="me-2" />
                                      <span className="text-dark">
                                        {item.trim()}
                                      </span>
                                    </div>
                                  ))
                              ) : (
                                <div className="text-muted">
                                  <i className="fas fa-info-circle me-2"></i>
                                  No inclusions specified
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100">
                            <Card.Header className="bg-danger text-white">
                              <h6 className="mb-0 text-white">What's Excluded</h6>
                            </Card.Header>
                            <Card.Body
                              style={{ maxHeight: "250px", overflowY: "auto" }}
                            >
                              {selectedService.exclusive ? (
                                selectedService.exclusive
                                  .split(",")
                                  .map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="d-flex align-items-center"
                                    >
                                      <TbArrowBadgeRight className="me-2" />
                                      <span className="text-dark">
                                        {item.trim()}
                                      </span>
                                    </div>
                                  ))
                              ) : (
                                <div className="text-muted">
                                  <i className="fas fa-info-circle me-2"></i>
                                  No exclusions specified
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          {/* <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                handleServiceModalClose();
                handleShow();
              }}
            >
              Book Appointment for this Service
            </Button>
          </Modal.Footer> */}
        </Modal>
      )}

      {loading ? <Loader /> : ""}
      <FooterBar />
    </>
  );
};

export default P_DoctorProfile;
