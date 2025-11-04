import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import Loader from '../Loader';
import FunctionalitySec from './Component/FunctionalitySec';
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaAmbulance, FaMapMarkerAlt, FaEye, FaHeadset, FaExchangeAlt } from "react-icons/fa";

const AmbulancePage = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [loading, setloading] = useState(false)
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
    return (
        <>
            <NavBar logindata={patient} />

            {/* Hero Section */}
            <section className="ambulance_banner">
                <Container fluid className='p-0'>
                    <Row className="align-items-center justify-content-between g-0">
                        <Col md={6}>
                            <div className='ps-5'>
                                <h2 className="fw-bold text-dark mb-2">Ambulance Services Booking</h2>
                                <h4 className="fw-bold text-secondary mb-3">Fast, Reliable & Affordable Ambulance Booking</h4>
                                <p className="text-muted mb-4">Emergencies can’t wait — and neither should you. Our Ambulance Booking System connects you to the nearest available ambulance in seconds.</p>
                                <button className="btn btn-primary px-4 py-2">Book Appointment</button>
                            </div>
                        </Col>
                        <Col md={4} className="text-center ambulance_gradient">
                            <img src={require('./assets/book-ambulance-banner.png')} alt="Ambulance" className="img-fluid" />
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="spacer-t bg-white">
                <Container>
                    {/* Heading */}
                    <Row className="justify-content-center mb-4">
                        <Col md="auto" className="text-center">
                            <h2 className="fw-bold mb-0">
                                Service <span className="text-sky-500">We Provider</span>
                            </h2>
                        </Col>
                    </Row>

                    {/* Services */}
                    <Row className="g-3 g-md-4 justify-content-center mb-5">
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100">
                                <Card.Body className="text-center py-4">
                                    <div className="fw-bold">BLS (Basic Life Support)</div>
                                    <div className="text-muted small mt-1">for non-critical transfers</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100">
                                <Card.Body className="text-center py-4">
                                    <div className="fw-bold">ALS (Advanced Life Support)</div>
                                    <div className="text-muted small mt-1">with paramedics & equipment</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100">
                                <Card.Body className="text-center py-4">
                                    <div className="fw-bold">ICU on Wheels</div>
                                    <div className="text-muted small mt-1">for critical patient transport</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4} xl={3} className="">
                            <Card className="border rounded-4 shadow-sm h-100">
                                <Card.Body className="text-center py-4">
                                    <div className="fw-bold">Neonatal & Pediatric Ambulances</div>
                                    <div className="text-muted small mt-1">for infants and children</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4} xl={3}>
                            <Card className="border rounded-4 shadow-sm h-100">
                                <Card.Body className="text-center py-4">
                                    <div className="fw-bold">Mortuary Ambulances</div>
                                    <div className="text-muted small mt-1">for dignified last journeys</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Key Features */}
                    <Row className="justify-content-center text-center mb-4">
                        <Col md="auto">
                            <h3 className="fw-bold mb-0">Key <span className="text-sky-500">Features</span></h3>
                        </Col>
                    </Row>

                    <Row className="g-4 justify-content-center mb-5">
                        <Col xs={6} md={4} lg={2} className="text-center">
                            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                <FaMapMarkerAlt />
                            </div>
                            <div className="fw-semibold">Real-Time GPS Tracking</div>
                            <div className="text-muted small">Track your ambulance on map</div>
                        </Col>
                        <Col xs={6} md={4} lg={2} className="text-center">
                            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                <FaAmbulance />
                            </div>
                            <div className="fw-semibold">Instant Dispatch</div>
                            <div className="text-muted small">Nearest ambulance within minutes</div>
                        </Col>
                        <Col xs={6} md={4} lg={2} className="text-center">
                            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                <FaEye />
                            </div>
                            <div className="fw-semibold">Transparent Pricing</div>
                            <div className="text-muted small">No hidden or surge charges</div>
                        </Col>
                        <Col xs={6} md={4} lg={2} className="text-center">
                            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                <FaHeadset />
                            </div>
                            <div className="fw-semibold">24x7 Call Support</div>
                            <div className="text-muted small">Emergency response assistance</div>
                        </Col>
                        <Col xs={6} md={4} lg={2} className="text-center">
                            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                <FaExchangeAlt />
                            </div>
                            <div className="fw-semibold">Intercity Transfers</div>
                            <div className="text-muted small">Safe long-distance transfers</div>
                        </Col>
                    </Row>

                    {/* CTA */}
                    <Card className="border-0 bg-primary-subtle rounded-4">
                        <Card.Body className="p-4 text-center">
                            <div className="fw-bolder fs-4 text-primary">Because every second matters</div>
                            <div className="text-muted">
                                Book your ambulance instantly through <span className="fw-bold">Health Easy EMI App</span> or Website
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </section>

            <section className='spacer-y'>
                <FunctionalitySec />
            </section>

            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default AmbulancePage