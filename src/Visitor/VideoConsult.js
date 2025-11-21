import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import FunctionalitySec from './Component/FunctionalitySec';
import { Container, Row, Col, Card } from "react-bootstrap";
import HeadTitle from './Component/HeadTitle';

const VideoConsult = () => {
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
    return (
        <>
            <NavBar logindata={patient} />

            {/* Hero Section */}
            <section className="page_banner consult_banner ">
                <Container fluid className='p-0'>
                    <Row className="align-items-center justify-content-between g-0">
                        <Col md={6}>
                            <div className='ps-5'>
                                <h2 className="fw-bold mb-2" style={{color: 'var(--grayscale-color-900)'}}>Consult Top Doctors Anytime, Anywhere</h2>
                                <p className=" mb-4" style={{color: 'var(--grayscale-color-800)'}}>Skip the travel, traffic, and waiting lines. <br /> With E-OPD, you can consult certified doctors via secure video calls — <br />from the comfort of your home.</p>

                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="spacer-t bg-white">
                <Container>
                    {/* Heading */}
                    <h2 className='head_sec mb-3'><HeadTitle title="Service We Provider" /></h2>

                    {/* Services */}
                    <Row className="g-3 g-md-4 justify-content-center service_amb">
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Instant Video Consultation</div>
                                    <div className="text-muted small mt-1">Connect with specialists across 50+ medical fields.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Flexible Scheduling</div>
                                    <div className="text-muted small mt-1">Choose time slots that suit you best.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Digital Prescriptions</div>
                                    <div className="text-muted small mt-1">Get authenticated e-prescriptions right after consultation.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4} className="">
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Affordable Pricing</div>
                                    <div className="text-muted small mt-1">Pay securely online compare consultation fees before booking.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Follow-up Made Easy</div>
                                    <div className="text-muted small mt-1">Continue treatment and monitoring through chat or repeat calls.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <section className='spacer-y'>
                        {/* Key Features */}
                        <h2 className='head_sec mb-4'><HeadTitle title="Why Choose Health Easy EMI’s E-OPD?" /></h2>

                        <Row className="g-4 justify-content-center feature_icon_sec">
                            <Col xs={6} md={4} lg className="text-center">
                                <div className='border rounded p-3 h-100'>
                                    <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                        {/* <FaMapMarkerAlt /> */}
                                        <img src={require('./assets/icon/24-7.png')} alt="" />

                                    </div>
                                    <div className="text-muted small">Trusted, verified doctors available 24×7</div>
                                </div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="border rounded p-3 h-100">
                                    <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                        <img src={require('./assets/icon/user-private.png')} alt="" />
                                    </div>
                                    <div className="text-muted small">Private, encrypted, and confidential video sessions</div>
                                </div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="border rounded p-3 h-100">
                                    <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                        <img src={require('./assets/icon/calendar.png')} alt="" />
                                    </div>
                                    <div className="text-muted small">Suitable for second opinions, chronic care, and follow-ups</div>
                                </div>
                            </Col>
                            <Col xs={6} md={4} lg className="text-center">
                                <div className="border rounded p-3 h-100">
                                    <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 72, height: 72, fontSize: 28 }}>
                                        <img src={require('./assets/icon/bed.png')} alt="" />
                                    </div>
                                    <div className="text-muted small">Option to switch to physical visit or surgery with same doctor</div>
                                </div>
                            </Col>
                        </Row>
                    </section>

                    {/* CTA */}
                    <Card className="border-0 rounded-4 matter_bg">
                        <Card.Body className="p-4 text-center">
                            <h2 className='display-5 fw-bold' style={{color: 'var(--primary-color-500)'}}>Your health, one click away.</h2>
                            <div className="text-muted fs-5">
                               Book an <span className="fw-bold ">E-OPD video consultation</span> now through <span className="fw-bold">Health Easy EMI.</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </section>

            <section className='spacer-y'>
                <FunctionalitySec />
            </section>

            <FooterBar />
        </>
    )
}

export default VideoConsult