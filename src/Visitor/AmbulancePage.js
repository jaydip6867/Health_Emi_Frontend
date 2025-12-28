import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import FunctionalitySec from './Component/FunctionalitySec';
import { Container, Row, Col, Card } from "react-bootstrap";
import { SECRET_KEY, STORAGE_KEYS } from '../config'
import FadeIn from '../components/FadeIn';
import HeadTitle from './Component/HeadTitle';
const AmbulancePage = () => {
    var navigate = useNavigate();

    const [logdata, setlogdata] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (pgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
            setlogdata(data.userData);
        }
        else if (dgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
            setlogdata(data.doctorData);
        }
        if (data) {
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])
    return (
        <>
            <NavBar logindata={logdata} />

            {/* Hero Section */}
            <section className="page_banner ambulance_banner">
                <Container className='p-0'>
                    <Row className="align-items-center justify-content-between g-0">
                        <Col md={6}>
                            <div className='ps-5'>
                                <h2 className="fw-bold text-dark mb-2">Ambulance Services Booking</h2>
                                <h4 className="fw-bold text-secondary mb-3">Fast, Reliable & Affordable Ambulance Booking</h4>
                                <p className="text-muted mb-4">Emergencies can’t wait — and neither should you. Our Ambulance Booking System connects you to the nearest available ambulance in seconds.</p>
                                <button className="btn btn-primary px-4 py-2" onClick={()=>navigate('../patient/ambulancerequest')}>Book Appointment</button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="spacer-t bg-white pb-5">
                <FadeIn delay={0}>
                    <Container>
                        {/* Heading */}
                        <h2 className='head_sec mb-4'><HeadTitle title="Service We Provider" /></h2>

                        {/* Services */}
                        <Row className="g-3 g-md-4 justify-content-center service_amb mb-5">
                            <Col xs={12} md={6} lg={4}>
                                <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                    <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                        <div className="fw-bold">BLS (Basic Life Support)</div>
                                        <div className="text-muted small mt-1">for non-critical transfers</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} md={6} lg={4}>
                                <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                    <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                        <div className="fw-bold">ALS (Advanced Life Support)</div>
                                        <div className="text-muted small mt-1">with paramedics & equipment</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} md={6} lg={4}>
                                <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                    <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                        <div className="fw-bold">ICU on Wheels</div>
                                        <div className="text-muted small mt-1">for critical patient transport</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} md={6} lg={4} className="">
                                <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                    <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                        <div className="fw-bold">Neonatal & Pediatric Ambulances</div>
                                        <div className="text-muted small mt-1">for infants and children</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} md={6} lg={4}>
                                <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                    <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                        <div className="fw-bold">Mortuary Ambulances</div>
                                        <div className="text-muted small mt-1">for dignified last journeys</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </FadeIn>
            </section>
            <section>
                <FadeIn delay={0}>
                    <Container>
                        <h2 className='head_sec mb-4'><HeadTitle title="Key Features" /></h2>

                        <Row className="g-4 justify-content-center mb-5 feature_icon_sec">
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                    {/* <FaMapMarkerAlt /> */}
                                    <img src={require('./assets/icon/location.png')} alt="location image" />

                                </div>
                                <div className="fw-semibold">Real-Time GPS Tracking</div>
                                <div className="text-muted small">Track your ambulance on map</div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                    <img src={require('./assets/icon/delivery.png')} alt="delivery image" />
                                </div>
                                <div className="fw-semibold">Instant Dispatch</div>
                                <div className="text-muted small">Nearest ambulance within minutes</div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                    <img src={require('./assets/icon/pricing.png')} alt="pricing image" />
                                </div>
                                <div className="fw-semibold">Transparent Pricing</div>
                                <div className="text-muted small">No hidden or surge charges</div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                    <img src={require('./assets/icon/support.png')} alt="support image" />
                                </div>
                                <div className="fw-semibold">24x7 Call Support</div>
                                <div className="text-muted small">Emergency response assistance</div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                    <img src={require('./assets/icon/transfer.png')} alt="transfer image" />
                                </div>
                                <div className="fw-semibold">Intercity Transfers</div>
                                <div className="text-muted small">Safe long-distance transfers</div>
                            </Col>
                        </Row>
                    </Container>
                </FadeIn>
            </section>
            <section>
                <FadeIn delay={0}>
                    <Container>
                        {/* CTA */}
                        <Card className="border-0 rounded-4 matter_bg">
                            <Card.Body className="p-4 text-center">
                                <h2 className='display-5 fw-bold' style={{ color: 'var(--primary-color-500)' }}>Because every second matters</h2>
                                <div className="text-muted fs-5">
                                    Book your ambulance instantly through <span className="fw-bold ">Health Easy EMI App or Website</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </FadeIn>
            </section>

            <section className='spacer-y'>
                <FunctionalitySec />
            </section>

            <FooterBar />
        </>
    )
}

export default AmbulancePage