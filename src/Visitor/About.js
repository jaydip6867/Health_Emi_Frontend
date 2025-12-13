import React, { useEffect } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SECRET_KEY, STORAGE_KEYS } from '../config'
import HeadTitle from './Component/HeadTitle';
import FadeIn from '../components/FadeIn';
import AppDownload from './Component/AppDownload';

const About = () => {

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

    useEffect(() => {
        document.title = "About Health Easy EMI - Our Mission to healthy India"
    }, [])
    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>About Us</h2>
                </Container>
            </section>
            <section className='py-5'>
                <Container>
                    <Row className='align-items-center'>
                        <Col xs={12} md={6}>
                            <img src={require('./assets/about_sec_img.png')} alt='about section image' className='img-fluid' />
                        </Col>
                        <Col xs={12} md={6}>
                            <p>
                                <b>Health Easy EMI</b> is a next-generation healthcare platform dedicated to making <b>quality medical care affordable and accessible for everyone.</b> We bridge the gap between patients, hospitals, and financial institutions through a transparent, tech-enabled system that simplifies treatment, financing & emergency response — all in one place
                            </p>
                            <p>
                                We understand that medical emergencies & surgeries often come with financial stress & confusion.
                            </p>
                            <p>
                                Our platform serves both <b>individual patients and corporate partners</b>, helping families access timely care while enabling hospitals, clinics, and insurers to expand their reach. With growing partnerships across India’s healthcare network, we aim to serve over <b>500 million potential beneficiaries</b>, especially in Tier-2 and Tier-3 cities.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className='spacer-y'>
                <Container>
                    <h2 className='head_sec mb-5'><HeadTitle title="Why Health Easy EMI offers" /></h2>
                    <Row className="g-3 g-md-4 justify-content-center service_amb">
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">End-to-end healthcare support</div>
                                    <div className="text-muted small mt-1">from treatment selection to discharge.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Affordable surgery packages</div>
                                    <div className="text-muted small mt-1">with easy EMI options.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">On-demand ambulance booking</div>
                                    <div className="text-muted small mt-1">with real-time GPS tracking.</div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Transparent pricing & 24/7 accessibility.</div>
                                    {/* <div className="text-muted small mt-1">Pay securely online compare consultation fees before booking.</div> */}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} md={6} lg={4}>
                            <Card className="border rounded-4 shadow-sm h-100 overflow-hidden">
                                <Card.Body className="text-center py-4" style={{ backgroundColor: '#F9FAFB' }}>
                                    <div className="fw-bold">Alternative treatment & wellness options under one digital roof.</div>
                                    {/* <div className="text-muted small mt-1">Continue treatment and monitoring through chat or repeat calls.</div> */}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className='py-5' style={{backgroundColor: "#EBF6FF"}}>
                <Container>
                    <Row className='align-items-center g-4'>
                        <Col xs={12} md={6}>
                            <p>
                               Our mission is simple yet powerful: to make affordable healthcare a reality for all.
                            </p>
                            <img src={require('./assets/target.png')} alt='target image' className='img-fluid mx-auto' style={{maxHeight: '140px'}}/>
                        </Col>
                        <Col xs={12} md={6}>
                            <img src={require('./assets/about_sec_eye.png')} alt='about section image' className='img-fluid w-100 mx-auto pb-3' style={{maxWidth: '200px'}} />
                            <p>
                                Our vision is to build an integrated, cloud-based healthcare ecosystem that connects patients, doctors, hospitals, and service providers, ensuring a seamless experience from hospital admission to discharge.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className='pt-4'>
                <AppDownload />
            </section>

            <section className='mb-5'>
                <FadeIn delay={0}>
                    <Container className='pt-5 border-top'>
                        {/* CTA */}
                        <Card className="border-0 rounded-4 matter_bg">
                            <Card.Body className="p-4 text-center">
                                <h2 className='display-6 fw-bold' style={{ color: 'var(--primary-color-500)' }}>Fast, Reliable, Transparent & Affordable.</h2>
                                <div className="text-muted fs-6">
                                    Together, we’re redefining how India experiences healthcare
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                </FadeIn>
            </section>

            <FooterBar />
        </>
    )
}

export default About
