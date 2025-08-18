import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Card, Col, Container, Row, Badge, Button, Image, Form, Tab, Nav } from 'react-bootstrap'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

const DoctorProfilePage = () => {
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
      console.log('doctor ', res.data.Data)
    }).catch(function (error) {
      console.log(error);
    }).finally(() => {
      setloading(false)
    });
  }

  const [appointmentType, setAppointmentType] = useState("clinic");
  const [clinicTime, setClinicTime] = useState("04:30 PM");

  return (
    <>
      <NavBar />
      {/* doctor list section */}
      <section className='py-5'>
        {doctor_profile && <Container className="my-4">
          <Row className='align-items-start'>
            {/* Left: Profile Section */}
            <Col md={8}>
              <Card className="p-3 shadow-sm">
                <Row>
                  <Col xs={3}>
                    <Image
                      src={doctor_profile.identityproof === '' ? require('../assets/image/doctor_img.jpg') : doctor_profile.identityproof}
                      roundedCircle
                      fluid
                      alt="Dr. Komal Prakash Kamble"
                      style={{ width: "100%", objectFit: "contain", borderRadius: "50%" }}
                    />
                  </Col>
                  <Col xs={9}>
                    <h4>
                      Dr. {doctor_profile.name}{" "}
                      <Badge bg="success" pill>
                        Profile is claimed
                      </Badge>
                    </h4>
                    <p className="mb-1 text-muted">
                      BDS <br />
                      {doctor_profile.specialty}, {doctor_profile.surgeriesDetails.map((surg,i)=>{
                        return(
                          <>{surg.name}, </>
                        )
                      })}
                      etc...
                      <br />
                      <small>
                        <strong>16 Years Experience Overall</strong>
                      </small>
                    </p>

                    <div className="d-flex align-items-center mb-2">
                      <Image
                        src="https://cdn.docprime.com/media/verified_icons/medical_registration_verified.png"
                        alt="Medical Registration Verified"
                        height={24}
                        className="me-2"
                      />
                      <span className="text-success fw-semibold">
                        Medical Registration Verified
                      </span>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <Badge bg="success" className="me-2">
                        99% <small> (431 patients) </small>
                      </Badge>
                      <span>Rating</span>
                    </div>

                    <p>
                      Dr. {doctor_profile.name} - Transforming Smiles with Comfort &
                      Expertise
                    </p>

                    <p style={{ fontSize: 14 }}>
                      With over a decade of experience in creating bright, comfort
                      smiles, Dr. Komal Prakash Kamble has built a one-stop
                      destination for advanced dental care. Known for her
                      commitment to comfortable and stress-free dentistry, she has
                      earned a reputation as a trusted name in the field.
                    </p>
                    <p style={{ fontSize: 14 }}>
                      After completing her dental education in Mumbai, Dr. Komal
                      pursued an Advanced Course in Aesthetic Dentistry from the
                      University of Los Angeles (UCLA). Her expertise, combined with
                      state-of-the-art dental technology, allows her to handle
                      dental phobia with ease, ensuring every patient has a pleasant
                      and pain-free experience.
                    </p>
                    <p style={{ fontSize: 14 }}>
                      She specializes in:
                      <ul>
                        <li>Painless Root Canals using advanced techniques</li>
                        <li>Precision Implant Placements for seamless tooth replacement</li>
                        <li>Smile Makeovers & Invisalign for perfectly aligned teeth</li>
                      </ul>
                    </p>
                    <p style={{ fontSize: 14 }}>
                      From smile transformations to advanced dental procedures,
                      Dr. Komal is dedicated to making every dental visit a
                      memorable and pain-free experience!{" "}
                      <a href="#" style={{ fontSize: 12 }}>
                        [shrink]
                      </a>
                    </p>

                    <a href="#" className="text-decoration-none">
                      Share your story
                    </a>
                  </Col>
                </Row>

                {/* Tabs Section */}
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
                  <Tab.Content className="p-3 border border-top-0">
                    <Tab.Pane eventKey="info">
                      <h5>DENTAL SOLUTIONS</h5>
                      <p>
                        <strong>★★★★★ 5.0</strong> from 431 reviews
                      </p>
                      <p>
                        Baner pashan link road, Landmark: Above Jockey Showroom,
                        Pune{" "}
                        <a href="#" style={{ fontWeight: "bold" }}>
                          Get Directions
                        </a>
                      </p>
                      <p>
                        <strong>Mon - Sat:</strong> 10:00 AM - 01:00 PM, 04:00 PM -
                        08:00 PM
                        <br />
                        <strong>Sun:</strong> 11:00 AM - 01:00 PM
                      </p>
                      <p>₹400 (Online Payment Available)</p>
                      <p>
                        <strong>Prime</strong> Max. 15 mins wait + Verified details
                      </p>
                    </Tab.Pane>
                    <Tab.Pane eventKey="stories">Patient Stories will be here...</Tab.Pane>
                    <Tab.Pane eventKey="consult">Consult Q&A content goes here...</Tab.Pane>
                    <Tab.Pane eventKey="healthfeed">Healthfeed content here...</Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card>
            </Col>

            {/* Right: Appointment Section */}
            <Col md={4} className='sticky-top'>
              <Card className="p-3 shadow-sm">
                <h5>Choose the type of appointment</h5>
                <Form>
                  <Form.Check
                    type="radio"
                    label="Clinic Visit"
                    name="appointmentType"
                    id="clinicVisit"
                    value="clinic"
                    checked={appointmentType === "clinic"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    label="Video Consult"
                    name="appointmentType"
                    id="videoConsult"
                    value="video"
                    checked={appointmentType === "video"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  />
                </Form>

                {appointmentType === "clinic" && (
                  <Card className="mt-3 p-3 border-primary bg-light">
                    <h6>
                      Clinic Appointment{" "}
                      <Badge bg="secondary" className="float-end">
                        ₹400 fee
                      </Badge>
                    </h6>
                    <hr />

                    <h6>DENTAL SOLUTIONS</h6>
                    <small>
                      ₹400 fee | Max 15 min wait
                      <br />
                      Baner Pashan Link Road
                    </small>

                    <div className="mt-3">
                      <h6>Available Dates</h6>
                      <Row className="text-center">
                        <Col>
                          <Badge bg="success">Today</Badge>
                          <br />
                          <small>2 Slots Available</small>
                        </Col>
                        <Col>
                          <Badge bg="success">Tomorrow</Badge>
                          <br />
                          <small>15 Slots Available</small>
                        </Col>
                        <Col>
                          <Badge bg="success">Wed, 20 Aug</Badge>
                          <br />
                          <small>12 Slots Available</small>
                        </Col>
                      </Row>
                    </div>

                    <div className="mt-4">
                      <h6>Evening (2 slots)</h6>
                      <Form.Select
                        aria-label="Select appointment time"
                        value={clinicTime}
                        onChange={(e) => setClinicTime(e.target.value)}
                      >
                        <option>04:30 PM</option>
                        <option>05:30 PM</option>
                      </Form.Select>
                    </div>
                  </Card>
                )}

                <Button
                  variant="primary"
                  className="w-100 mt-4"
                  size="lg"
                  disabled={appointmentType !== "clinic"} // enable only for clinic for demo
                >
                  Book Appointment
                  <div style={{ fontSize: "0.75rem" }}>
                    Instant Pay Available
                  </div>
                </Button>

                {/* Advertisement placeholder */}
                <Card className="mt-4 p-2">
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