import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Container, Row, Col, Nav, Accordion } from 'react-bootstrap'
import { BsEnvelope, BsGlobe } from "react-icons/bs";
import { MdCall } from 'react-icons/md';
import {SECRET_KEY, STORAGE_KEYS } from '../config'

const Faq = () => {
    var navigate = useNavigate();

    const [logdata, setlogdata] = useState(null)
    const [token, settoken] = useState(null)
    const [activeTab, setActiveTab] = useState('General Information')

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

    useEffect(() => {
        document.title = "About Health Easy EMI - Our Mission to healthy India"
    }, [])
    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>{activeTab} - <span>FAQ</span></h2>
                </Container>
            </section>

            {/* faq section */}
            <section className='spacer-y'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col lg={12}>
                            <Nav variant="pills" className="faq-tabs flex-nowrap gap-2 mb-4 overflow-auto" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="General Information">General Information</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Patient Services">Patient Services</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Healthcare Financing & EMI">Healthcare Financing & EMI</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Ambulance & Emergency Services">Ambulance & Emergency Services</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="For Hospitals, Clinics & Partners">For Hospitals, Clinics & Partners</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Data Security & Support">Data Security & Support</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col lg={12}>
                            {activeTab === 'General Information' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>What is Health Easy EMI?</Accordion.Header>
                                        <Accordion.Body>
                                            Health Easy EMI is a one-stop healthcare platform offering affordable medical treatment, EMI-based financing, on-demand ambulance services, and hospital tie-ups — making quality healthcare accessible to everyone.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What problem does it solve?</Accordion.Header>
                                        <Accordion.Body>
                                            We bridge the gap between rising medical costs and limited affordability, providing transparent, interest-free EMI plans, verified hospitals, and real-time ambulance access for patients in need.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Where do you operate currently?</Accordion.Header>
                                        <Accordion.Body>
                                            We currently operate across major Indian cities and expanding into Tier-2 and Tier-3 regions, focusing on improving healthcare accessibility in semi-urban and rural areas.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>Who can use Health Easy EMI services?</Accordion.Header>
                                        <Accordion.Body>
                                            Any individual, family, or organization seeking healthcare financing, ambulance services, or hospital tie-ups can use our app or website.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>Is Health Easy EMI a hospital or a service provider?</Accordion.Header>
                                        <Accordion.Body>
                                            We are not a hospital. We act as a bridge between patients, hospitals, and financial partners, ensuring smooth, affordable, and transparent treatment access.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'Patient Services' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>How do I find the right hospital or doctor for my condition?</Accordion.Header>
                                        <Accordion.Body>
                                            Our platform provides a comparative list of verified hospitals and doctors, along with cost estimates, reviews, and available EMI plans.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>Can I get a second opinion before surgery?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. We connect you to certified specialists across India for professional second opinions at affordable rates.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>What types of treatments and surgeries are available?</Accordion.Header>
                                        <Accordion.Body>
                                            We cover most major and elective surgeries, including cardiology, orthopedics, neurology, oncology, gynecology, and general surgery. AYUSH and wellness options are also available.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>Are there hidden charges or commissions?</Accordion.Header>
                                        <Accordion.Body>
                                            No. Health Easy EMI maintains a 100% transparent pricing model. All charges, EMIs, and partner hospital fees are disclosed before confirmation.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>Can I track my treatment progress or documents online?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. Our cloud-based health management system allows you to track appointments, payments, reports, and discharge summaries in one secure dashboard.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'Healthcare Financing & EMI' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>How does the EMI option work?</Accordion.Header>
                                        <Accordion.Body>
                                            We collaborate with banks and fintech partners to convert your medical bills into easy monthly EMIs. The approval process is quick, paperless, and patient-friendly.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What documents are required for EMI approval?</Accordion.Header>
                                        <Accordion.Body>
                                            Typically, Aadhaar, PAN, income proof, and hospital estimate are required. Our support team assists you throughout the process.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>What is the maximum loan or EMI limit available?</Accordion.Header>
                                        <Accordion.Body>
                                            It depends on the treatment cost and financial eligibility, usually ranging from ₹10,000 to ₹10 lakhs.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>How long does EMI approval take?</Accordion.Header>
                                        <Accordion.Body>
                                            Most EMI approvals are processed within 30 minutes to 2 hours, depending on partner verification.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>Can I get EMI options for all hospitals?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes, but we recommend choosing partner hospitals for the fastest processing and best offers.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="5">
                                        <Accordion.Header>Are EMIs interest-free?</Accordion.Header>
                                        <Accordion.Body>
                                            Many of our partner plans are 0% interest. Others have minimal interest rates, depending on the financial provider.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="6">
                                        <Accordion.Header>What if I miss an EMI payment?</Accordion.Header>
                                        <Accordion.Body>
                                            You’ll receive reminders. Missed payments may attract minimal late fees as per the partner’s policy. We help in rescheduling if needed.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'Ambulance & Emergency Services' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>How can I book an ambulance instantly?</Accordion.Header>
                                        <Accordion.Body>
                                            You can book an ambulance through our app or call our 24×7 helpline. GPS-enabled ambulances ensure the nearest vehicle is dispatched to you.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What ambulance types are available?</Accordion.Header>
                                        <Accordion.Body>
                                            <ul className='ps-4' style={{ listStyleType: "disc" }}>
                                                <li>BLS (Basic Life Support)</li>
                                                <li>ALS (Advanced Life Support)</li>
                                                <li>ICU on Wheels</li>
                                                <li>Neonatal/Pediatric Ambulance</li>
                                                <li>Mortuary Ambulance</li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Can I track my ambulance in real-time?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. Our app provides real-time GPS tracking, estimated arrival time, and driver contact details.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>Do you provide intercity or hospital transfer services?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. We arrange long-distance and intercity transfers with medical staff, oxygen, and equipment as required.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>What if no ambulance is available nearby?</Accordion.Header>
                                        <Accordion.Body>
                                            Our system automatically connects to partner networks to locate the nearest available ambulance and ensures minimal wait time.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'For Hospitals, Clinics & Partners' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Can hospitals partner with Health Easy EMI?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. Hospitals can subscribe or list with us to receive patient leads, promote packages, and offer EMI-enabled services.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What are the benefits of partnering with Health Easy EMI?</Accordion.Header>
                                        <Accordion.Body>
                                            <ul className='ps-4' style={{listStyleType: 'disc'}}>
                                                <li>Increased patient inflow</li>
                                                <li>Faster payment via EMI financing</li>
                                                <li>Brand visibility across digital platforms</li>
                                                <li>24 X 7 Ambulance integration</li>
                                                <li>Data analytics & Marketing Supports </li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Do you work with insurance companies?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes, we collaborate with insurance providers for policy-linked treatments and cashless claim facilitation.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>How can corporate companies use your services?</Accordion.Header>
                                        <Accordion.Body>
                                            We offer employee healthcare tie-ups, on-site ambulance standby, and EMI-based treatment plans for workforce wellness.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>How can diagnostic labs or pharmacies collaborate?</Accordion.Header>
                                        <Accordion.Body>
                                            We partner with diagnostic centers, labs, and pharmacies for bulk pricing, referrals, and commission-based collaborations.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'Data Security & Support' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Is my personal and medical data safe?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. We follow strict data privacy protocols, encrypted cloud storage, and comply with Indian data protection guidelines.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What if I face an issue with my booking or payment?</Accordion.Header>
                                        <Accordion.Body>
                                            You can contact our support team 24×7 through chat, call, or email for instant resolution.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>How can I reach Health Easy EMI for support or partnership?</Accordion.Header>
                                        <Accordion.Body>
                                            <ul>
                                                <li><div className='d-flex align-items-center'><BsEnvelope /><span> Email: dramarskokane@gmail.com </span></div></li>
                                                <li><div className='d-flex align-items-center'><MdCall /><span> Phone: +91 80871 61522 </span></div></li>
                                                <li><div className='d-flex align-items-center'><BsGlobe /><span> Website: www.healtheasyemi.com </span></div></li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
            <FooterBar />
        </>
    )
}

export default Faq