import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Card, Col, Container, Row, Badge, Button, Image, Form, Tab, Nav } from 'react-bootstrap'
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
    const handleShow = () => setShow(true);
    
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
        </Container>}
      </section>
      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default DoctorProfilePage