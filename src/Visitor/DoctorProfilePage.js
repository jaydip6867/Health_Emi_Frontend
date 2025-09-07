import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Card, Col, Container, Row, Badge, Button, Image, Form, Tab, Nav, Modal, ListGroup } from 'react-bootstrap'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import './css/visitor.css'
import { FaAward, FaCalendarAlt, FaEnvelope, FaEye, FaMapMarkerAlt, FaPhone, FaStar, FaStethoscope, FaUserMd } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { format } from 'date-fns';
import Swal from 'sweetalert2'
import DatePicker from 'react-datepicker'

const DoctorProfilePage = () => {
  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);

  const [patient, setpatient] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem('PatientLogin');
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (data) {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [navigate])
  const [loading, setloading] = useState(false)
  var { id } = useParams()
  const d_id = atob(decodeURIComponent(id))
  // console.log('ID:', id, d_id);

  const [doctor_profile, setdocprofile] = useState(null)

  useEffect(() => {
    setloading(true)
    if (d_id) {
      getdoctordata(d_id)
    }
  }, [d_id])

  const getdoctordata = async (d) => {
    await axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/user/doctors/getone',
      data: {
        "doctorid": d
      }
    }).then((res) => {
      setdocprofile(res.data.Data)
      // console.log('doctor ', res.data.Data)
    }).catch(function (error) {
      console.log(error);
    }).finally(() => {
      setloading(false)
    });
  }

  const [appointmentType, setAppointmentType] = useState("clinic");
  const [clinicTime, setClinicTime] = useState("04:30 PM");
  const [showFullDescription, setShowFullDescription] = useState(false);


  const [show, setShow] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    if (!patient) {
      navigate('/patient')
    }
    else{
      setShow(true)
    }
  };

  const handleServiceModalClose = () => setShowServiceModal(false);
  const handleServiceModalShow = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  var app_obj = { alt_mobile: '', surgeryid: '', appointment_reason: '', report: '', visit_types: '' }
  const [apt_data, setaptdata] = useState(app_obj)

  function appchangedata(e) {
    const { name, value } = e.target;
    setaptdata(apt_data => ({
      ...apt_data,
      [name]: value
    }))
  }


  function appointmentbtn(id) {
    // Split at the space before the time
    const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
    // Combine time + meridiem
    const timeWithMeridiem = `${timePart} ${meridiem}`;
    // console.log(apt_data, datePart, timeWithMeridiem )
    setloading(true)
    axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/user/appointments/save',
      headers: {
        Authorization: token
      },
      data: {
        "patientname": patient.name,
        "mobile": patient.mobile,
        "alt_mobile": apt_data.alt_mobile,
        "date": datePart,
        "time": timeWithMeridiem,
        "surgeryid": apt_data.surgeryid,
        "appointment_reason": apt_data.appointment_reason,
        "report": apt_data.report,
        "doctorid": id,
        "visit_types": apt_data.visit_types
      }
    }).then((res) => {
      Swal.fire({
        title: "Appointment Add Successfully...",
        icon: "success",
        confirmButtonText: 'Ok.'
      }).then((result) => {
        navigate('/patient/appointment');
      });
    }).catch(function (error) {
      Swal.fire({
        title: "Something Went Wrong.",
        text: "Something Is Missing. Please Check Details...",
        icon: "error",
      });
    }).finally(() => {
      setloading(false)
    });
  }

  const formattedDateTime = selectedDate
    ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
    : '';

  return (
    <>
      <NavBar logindata={patient} />
      {/* doctor profile section */}
      <section className='doctor-profile-section'>
        {doctor_profile && <Container className="my-4">
          <Row className='align-items-start'>
            {/* Left: Profile Section */}
            {/* <Col lg={8}>
              <Card className="doctor-profile-card p-4">
                <Row>
                  <Col xs={3}>
                    <Image
                      src={doctor_profile?.profile_pic === '' ? require('../assets/image/doctor_img.jpg') : doctor_profile?.profile_pic}
                      className="doctor-avatar"
                      alt={`Dr. ${doctor_profile?.name}`}
                    />
                  </Col>
                  <Col xs={9}>
                    <h4 className="doctor-name">
                      Dr. {doctor_profile?.name}
                      <Badge className="profile-claimed-badge">
                        Profile is claimed
                      </Badge>
                    </h4>
                    <div className="doctor-specialty">
                      {doctor_profile?.specialty}, {doctor_profile?.surgeriesDetails.map((surg, i) => {
                        return (
                          <span key={i}>{surg?.name}, </span>
                        )
                      })}
                      etc...
                    </div>
                    <div className="doctor-experience">
                      <strong>{doctor_profile?.experience} Experience Overall</strong>
                    </div>

                    <div className="verification-badge">
                      <Image
                        src="https://cdn.docprime.com/media/verified_icons/medical_registration_verified.png"
                        alt="Medical Registration Verified"
                        className="verification-icon"
                      />
                      <span className="verification-text">
                        Medical Registration Verified
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <Badge className="rating-badge">
                        99% <small> (431 patients) </small>
                      </Badge>
                      <span className="rating-text">Rating</span>
                    </div>

                    <div className="doctor-description">
                      <h5>Dr. {doctor_profile?.name} - Transforming Smiles with Comfort & Expertise</h5>

                      <p>
                        With over a decade of experience in creating bright, comfort
                        smiles, Dr. Komal Prakash Kamble has built a one-stop
                        destination for advanced dental care. Known for her
                        commitment to comfortable and stress-free dentistry, she has
                        earned a reputation as a trusted name in the field.
                      </p>

                      {showFullDescription && (
                        <>
                          <p>
                            After completing her dental education in Mumbai, Dr. Komal
                            pursued an Advanced Course in Aesthetic Dentistry from the
                            University of Los Angeles (UCLA). Her expertise, combined with
                            state-of-the-art dental technology, allows her to handle
                            dental phobia with ease, ensuring every patient has a pleasant
                            and pain-free experience.
                          </p>
                          <p>
                            She specializes in:
                            <ul>
                              <li>Painless Root Canals using advanced techniques</li>
                              <li>Precision Implant Placements for seamless tooth replacement</li>
                              <li>Smile Makeovers & Invisalign for perfectly aligned teeth</li>
                            </ul>
                          </p>
                          <p>
                            From smile transformations to advanced dental procedures,
                            Dr. Komal is dedicated to making every dental visit a
                            memorable and pain-free experience!
                          </p>
                        </>
                      )}

                      <button
                        className="view-toggle-btn"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? 'View Less' : 'View More'}
                      </button>

                    </div>
                  </Col>
                </Row>

                <div className="doctor-profile-tabs">
                  <Tab.Container defaultActiveKey="info">
                    <Nav variant="tabs" className="mt-4">
                      <Nav.Item>
                        <Nav.Link eventKey="info">Info</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="stories">
                          Stories <Badge bg="secondary">431</Badge>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="consult">Consult Q&amp;A</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="healthfeed">Healthfeed</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content>
                      <Tab.Pane eventKey="info">
                        <div className="clinic-info">
                          <h5>DENTAL SOLUTIONS</h5>
                          <div className="clinic-rating">
                            <strong>★★★★★ 5.0</strong> from 431 reviews
                          </div>
                          <div className="clinic-address">
                            Baner pashan link road, Landmark: Above Jockey Showroom,
                            Pune{" "}
                            <a href="#" className="share-story-link">
                              Get Directions
                            </a>
                          </div>
                          <div className="clinic-timings">
                            <strong>Mon - Sat:</strong> 10:00 AM - 01:00 PM, 04:00 PM -
                            08:00 PM
                            <br />
                            <strong>Sun:</strong> 11:00 AM - 01:00 PM
                          </div>
                          <div className="clinic-fee">₹400 (Online Payment Available)</div>
                          <p>
                            <strong>Prime</strong> Max. 15 mins wait + Verified details
                          </p>
                        </div>
                      </Tab.Pane>
                      <Tab.Pane eventKey="stories">Patient Stories will be here...</Tab.Pane>
                      <Tab.Pane eventKey="consult">Consult Q&A content goes here...</Tab.Pane>
                      <Tab.Pane eventKey="healthfeed">Healthfeed content here...</Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              </Card>
            </Col> */}

            {/* Right: Appointment Section */}
            {/* <Col lg={4}>
              <Card className="appointment-card p-4">
                <h5>Choose the type of appointment</h5>
                <Form>
                  <div className={`appointment-type-option ${appointmentType === "clinic" ? "selected" : ""}`}>
                    <Form.Check
                      type="radio"
                      label="Clinic Visit"
                      name="appointmentType"
                      id="clinicVisit"
                      value="clinic"
                      checked={appointmentType === "clinic"}
                      onChange={(e) => setAppointmentType(e.target.value)}
                    />
                  </div>
                  <div className={`appointment-type-option ${appointmentType === "video" ? "selected" : ""}`}>
                    <Form.Check
                      type="radio"
                      label="Video Consult"
                      name="appointmentType"
                      id="videoConsult"
                      value="video"
                      checked={appointmentType === "video"}
                      onChange={(e) => setAppointmentType(e.target.value)}
                    />
                  </div>
                </Form>

                {appointmentType === "clinic" && (
                  <div className="clinic-appointment-details">
                    <h6>
                      Clinic Appointment
                      <Badge className="fee-badge">
                        ₹400 fee
                      </Badge>
                    </h6>
                    <hr />

                    <div className="clinic-details">
                      <h6>DENTAL SOLUTIONS</h6>
                      <small>
                        ₹400 fee | Max 15 min wait
                        <br />
                        Baner Pashan Link Road
                      </small>
                    </div>

                    <div className="available-dates">
                      <h6>Available Dates</h6>
                      <div className="date-slots">
                        <div className="date-slot">
                          <Badge className="date-badge">Today</Badge>
                          <small className="slots-available">2 Slots Available</small>
                        </div>
                        <div className="date-slot">
                          <Badge className="date-badge">Tomorrow</Badge>
                          <small className="slots-available">15 Slots Available</small>
                        </div>
                        <div className="date-slot">
                          <Badge className="date-badge">Wed, 20 Aug</Badge>
                          <small className="slots-available">12 Slots Available</small>
                        </div>
                      </div>
                    </div>

                    <div className="time-selection">
                      <h6>Evening (2 slots)</h6>
                      <Form.Select
                        className="time-select"
                        aria-label="Select appointment time"
                        value={clinicTime}
                        onChange={(e) => setClinicTime(e.target.value)}
                      >
                        <option>04:30 PM</option>
                        <option>05:30 PM</option>
                      </Form.Select>
                    </div>
                  </div>
                )}

                <Button
                  className="book-appointment-btn"
                  disabled={appointmentType !== "clinic"} 
                >
                  Book Appointment
                  <div className="instant-pay-text">
                    Instant Pay Available
                  </div>
                </Button>

                <Card className="advertisement-card">
                  <Image
                    src="https://cdn.docprime.com/media/ads/8a8a8bfb7aff81aa017b4d4bc4281975.webp"
                    alt="Advertisement"
                    fluid
                  />
                </Card>
              </Card>
            </Col> */}

            {/* NEW CHANGES DESIGN */}

            <Col xs={12} className='p-4'>
              {/* <P_nav patientname={patient && patient.name} /> */}
              <Card className="shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                {
                  doctor_profile === null ? <Col>No Doctor Found</Col> : <>
                    {/* Hero Section */}
                    <div className="position-relative pt-4">
                      <Row className="align-items-center">
                        <Col md={3} className="text-center">
                          <div className="position-relative d-inline-block">
                            {doctor_profile.profile_pic === '' ?
                              <Image src={require('../assets/image/doctor_img.jpg')} roundedCircle className="border border-4 border-white shadow-lg" width={150} height={150} style={{ objectFit: 'cover' }} /> :
                              <Image src={doctor_profile?.profile_pic} roundedCircle className="border border-4 border-white shadow-lg" width={150} height={150} style={{ objectFit: 'cover' }} />
                            }
                            <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-2">
                              <FaUserMd className="text-white" size={20} />
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <h2 className="fw-bold mb-2">Dr. {doctor_profile.name}</h2>
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
                            <h3 className="fw-bold mb-1">{doctor_profile.experience}+</h3>
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
                          <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <Card.Header className="bg-gradient text-white" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', borderRadius: '15px 15px 0 0' }}>
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
                                      <h6 className="fw-bold text-success mb-1">Positive Feedback</h6>
                                      <p className="small text-muted mb-0">"Dr. {doctor_profile.name} was excellent at explaining my condition and treatment options clearly."</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-start">
                                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                      <FaStethoscope className="text-info" />
                                    </div>
                                    <div>
                                      <h6 className="fw-bold text-info mb-1">Professional Care</h6>
                                      <p className="small text-muted mb-0">"Highly professional with modern treatment approaches and excellent patient care."</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>

                          {/* Services Section */}
                          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <Card.Header className="bg-gradient text-white" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', borderRadius: '15px 15px 0 0' }}>
                              <h6 className="mb-0 fw-bold">
                                <FaStethoscope className="me-2" />
                                Services & Pricing
                              </h6>
                            </Card.Header>
                            <Card.Body className="p-0">
                              <div className="row g-3 p-4">
                                {
                                  doctor_profile && doctor_profile.surgeriesDetails.map((v, i) => {
                                    return (
                                      <div className="col-md-6" key={i}>
                                        <Card className="h-100 border-0 shadow-sm service-card" style={{ borderRadius: '12px', transition: 'all 0.3s ease' }}>
                                          <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                              <div className="flex-grow-1">
                                                <h6 className="fw-bold text-dark mb-2">{v.name}</h6>
                                                <div className="d-flex align-items-center justify-content-between">
                                                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                                                    ₹{v.price}
                                                  </span>
                                                  <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleServiceModalShow(v)}
                                                    className="rounded-pill px-3"
                                                    style={{ transition: 'all 0.3s ease' }}
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
                                    )
                                  })
                                }
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col md={4}>
                          <Card className="border-0 shadow-sm sticky-top" style={{ borderRadius: '15px', top: '20px' }}>
                            <Card.Header className="bg-gradient text-white text-center" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', borderRadius: '15px 15px 0 0' }}>
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
                                <h6 className="fw-bold">Dr. {doctor_profile.name}</h6>
                                <p className="text-muted small mb-0">{doctor_profile.specialty}</p>
                              </div>

                              <div className="row g-3 mb-4">
                                <div className="col-6">
                                  <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                    <h6 className="fw-bold text-success mb-1">{doctor_profile.experience}+</h6>
                                    <small className="text-muted">Years Exp.</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-center">
                                    <h6 className="fw-bold text-warning mb-1">95%</h6>
                                    <small className="text-muted">Recommend</small>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4">
                                <h6 className="fw-bold mb-3">Consultation Options</h6>
                                <div className="d-flex align-items-center mb-2">
                                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                    <FaStethoscope className="text-info" size={14} />
                                  </div>
                                  <span className="small">In-person consultation</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                    <FaPhone className="text-success" size={14} />
                                  </div>
                                  <span className="small">Online consultation</span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                    <FaMapMarkerAlt className="text-primary" size={14} />
                                  </div>
                                  <span className="small">Home visit available</span>
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
                }
              </Card>
            </Col>
          </Row>

          {
            patient && doctor_profile && <Modal show={show} size='lg' onHide={handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title>Book Appointment</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row className='g-4'>
                  <Col xs={12}>
                    <Form>
                      <Row className='g-4'>
                        <Col xs={4}><Form.Label>Name</Form.Label><Form.Control value={patient.name} disabled></Form.Control></Col>
                        <Col xs={4}><Form.Label>Phone Number</Form.Label><Form.Control value={patient.mobile} disabled></Form.Control></Col>
                        <Col xs={4}><Form.Label>Alt Phone Number</Form.Label><Form.Control value={apt_data.alt_mobile} name='alt_mobile' onChange={appchangedata} placeholder='Alt. Phone Number'></Form.Control></Col>
                        <Col xs={4}><Form.Label>Surgery</Form.Label><Form.Select name='surgeryid' onChange={appchangedata}>
                          <option value=''>Select Surgery</option>
                          {
                            doctor_profile.surgeriesDetails.map((v, i) => {
                              return (
                                <option value={v._id} key={i}>{v.name}</option>
                              )
                            })
                          }
                        </Form.Select></Col>
                        <Col xs={4}><Form.Label>Reason</Form.Label><Form.Control value={apt_data.appointment_reason} name='appointment_reason' onChange={appchangedata} placeholder='Appointment Reason' ></Form.Control></Col>
                        <Col xs={4}><Form.Label>Reports</Form.Label>
                          {/* <Form.Control type='file' value={apt_data.report} name='report' onChange={appchangedata}></Form.Control> */}
                          <p className='text-secondary'>Under Maintenance</p>
                        </Col>
                        <Col xs={12} md={4}>
                          <Form.Check label="Home Visit" type='radio' name='visit_types' value={'home_visit'} onChange={appchangedata} />
                          <Form.Check label="Clinic Visit" type='radio' name='visit_types' value={'clinic_visit'} onChange={appchangedata} />
                          <Form.Check label="EOPD" type='radio' name='visit_types' value={'eopd'} onChange={appchangedata} />
                        </Col>
                        <Col xs={6} md={6}>
                          <Form.Label>Appointment Date</Form.Label><br />
                          <DatePicker selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            showTimeSelect
                            timeFormat="hh:mm a"
                            timeIntervals={15}
                            dateFormat="dd-MM-yyyy hh:mm a"
                            placeholderText="Select date and time"
                            minDate={new Date()} /></Col>
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
                <Button variant="primary" onClick={() => { appointmentbtn(doctor_profile._id); handleClose() }}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>
          }
          {/* Service Detail Modal */}
          {selectedService && (
            <Modal show={showServiceModal} size='xl' onHide={handleServiceModalClose} centered>
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
                        <Card.Body className="text-center">
                          {selectedService.surgery_photo ? (
                            <Image
                              src={selectedService.surgery_photo}
                              alt={selectedService.name}
                              fluid
                              rounded
                              className="mb-3"
                              style={{ maxHeight: '200px' }}
                            />
                          ) : (
                            <div className="bg-light p-4 rounded mb-3" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="text-muted">No image available</span>
                            </div>
                          )}
                          <p><strong>Surgery Type:</strong> {selectedService.surgery_type || 'Not specified'}</p>
                          <p><strong>Duration:</strong> {selectedService.days || 'Not specified'} days</p>
                          <p><strong>Completed Surgeries:</strong> {selectedService.completed_surgery || '0'}</p>
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
                                  <p><strong>Name:</strong> {selectedService.name}</p>
                                  <p><strong>Description:</strong> {selectedService.description || 'No description available'}</p>
                                </Col>
                                <Col md={6}>
                                  <p><strong>Features:</strong></p>
                                  <ul className="small">
                                    {selectedService.features ? (
                                      Array.isArray(selectedService.features) ?
                                        selectedService.features.map((feature, idx) => (
                                          <li key={idx}>{feature}</li>
                                        )) :
                                        <li>{selectedService.features}</li>
                                    ) : (
                                      <li className="text-muted">No features listed</li>
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
                                      <strong>₹{selectedService.general_price || selectedService.price || 'N/A'}</strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                      <span>Private Price:</span>
                                      <strong>₹{selectedService.private_price || 'N/A'}</strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                      <span>Semi-Private Price:</span>
                                      <strong>₹{selectedService.semiprivate_price || 'N/A'}</strong>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                      <span>Deluxe Price:</span>
                                      <strong>₹{selectedService.delux_price || 'N/A'}</strong>
                                    </ListGroup.Item>
                                  </ListGroup>
                                </Col>
                                <Col md={6}>
                                  <h6>Additional Features</h6>
                                  <ul className="small">
                                    {selectedService.additional_features ? (
                                      Array.isArray(selectedService.additional_features) ?
                                        selectedService.additional_features.map((feature, idx) => (
                                          <li key={idx}>{feature}</li>
                                        )) :
                                        <li>{selectedService.additional_features}</li>
                                    ) : (
                                      <li className="text-muted">No additional features</li>
                                    )}
                                  </ul>
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
                                  <h6 className="mb-0">What's Included</h6>
                                </Card.Header>
                                <Card.Body>
                                  <ul className="small mb-0">
                                    {selectedService.inclusive ? (
                                      Array.isArray(selectedService.inclusive) ?
                                        selectedService.inclusive.map((item, idx) => (
                                          <li key={idx} className="text-success">✓ {item}</li>
                                        )) :
                                        <li className="text-success">✓ {selectedService.inclusive}</li>
                                    ) : (
                                      <li className="text-muted">No inclusions specified</li>
                                    )}
                                  </ul>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card className="h-100">
                                <Card.Header className="bg-danger text-white">
                                  <h6 className="mb-0">What's Excluded</h6>
                                </Card.Header>
                                <Card.Body>
                                  <ul className="small mb-0">
                                    {selectedService.exclusive ? (
                                      Array.isArray(selectedService.exclusive) ?
                                        selectedService.exclusive.map((item, idx) => (
                                          <li key={idx} className="text-danger">✗ {item}</li>
                                        )) :
                                        <li className="text-danger">✗ {selectedService.exclusive}</li>
                                    ) : (
                                      <li className="text-muted">No exclusions specified</li>
                                    )}
                                  </ul>
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
              <Modal.Footer>
                {/* <Button variant="primary" onClick={() => {
                  handleServiceModalClose();
                  handleShow();
                }}>
                  Book Appointment for this Service
                </Button> */}
                <Button variant="secondary" onClick={handleServiceModalClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </Container>}
      </section>
      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default DoctorProfilePage