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

const DoctorProfilePage = () => {
  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

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

  return (
    <>
      <NavBar logindata={patient} />
      {/* doctor profile section */}
      <section className='doctor-profile-section'>
        {doctor_profile && <Container className="my-4">
          <Row className='align-items-start'>
            {/* Left: Profile Section */}
            <Col lg={8}>
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

                {/* Tabs Section */}
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
            </Col>

            {/* Right: Appointment Section */}
            <Col lg={4}>
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
                  disabled={appointmentType !== "clinic"} // enable only for clinic for demo
                >
                  Book Appointment
                  <div className="instant-pay-text">
                    Instant Pay Available
                  </div>
                </Button>

                {/* Advertisement placeholder */}
                <Card className="advertisement-card">
                  <Image
                    src="https://cdn.docprime.com/media/ads/8a8a8bfb7aff81aa017b4d4bc4281975.webp"
                    alt="Advertisement"
                    fluid
                  />
                </Card>
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