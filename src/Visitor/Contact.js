import React, { useEffect } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SECRET_KEY, STORAGE_KEYS } from '../config'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa';

const Contact = () => {

    var navigate = useNavigate();

    const [token, settoken] = useState(null)
    const [logdata, setlogdata] = useState(null)

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
        document.title = "Contact Health Easy EMI - Get In Touch Doctor And Patient"
    }, [])
    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Contact Us</h2>
                </Container>
            </section>

            {/* address section */}
            <section className='py-5 text-center'>
                <Container>
                    <Row>
                        <Col xs={4}>
                            <h5>Location</h5>
                            <p>Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                        </Col>
                        <Col xs={4}>
                            <h5>Contact</h5>
                            <p className='m-0'>healtheasyemi@gmail.com</p>
                            <p>+91 8087161522</p>
                        </Col>
                        <Col xs={4}>
                            <h5>Social Media</h5>
                            <div className="social-links justify-content-center">
                                <a className="social-icon">
                                    <FaFacebookF />
                                </a>
                                <a className="social-icon" >
                                    <FaTwitter />
                                </a>
                                <a className="social-icon" href="https://www.instagram.com/healtheasyemi/?hl=en">
                                    <FaInstagram />
                                </a>
                                <a className="social-icon" href="https://www.linkedin.com/company/110338361/admin/dashboard/">
                                    <FaLinkedinIn />
                                </a>
                                <a className="social-icon" href="https://www.youtube.com/channel/UCKDchxSJb-_GVKBVXI3NOKA">
                                    <FaYoutube />
                                </a>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* contact form */}
            <section className='py-5 my-4'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col xs={12} md={6}>
                            <div className='text-center'>
                                <h3 >Get In Touch</h3>
                            <p>We collaborate with ambitious brands and patients; wed love to build something great together.</p>
                            </div>
                            <Form className='my-4 contact-form'>
                                <Row className='g-3'>
                                    <Col md={4}>
                                        <Form.Control type="text" name='name' placeholder="Full Name" />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control type="email" name='email' placeholder="Email" />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control type="tel" name='phone' placeholder="Phone No." />
                                    </Col>
                                    <Col md={12}>
                                        <Form.Control type="text" name='subject' placeholder="Subject" />
                                    </Col>
                                    <Col md={12}>
                                        <Form.Control as={'textarea'} rows={5} name='message' placeholder="Leave a comment here" />
                                    </Col>
                                    <Col md={12} className='text-center'>
                                        <Button variant="dark" type="button" className='px-4 py-2 rounded-0 contact-submit'>
                                            Send Message
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                        <Col xs={12}>
                            <div className='mt-5 pt-5'>
                                <div className='border shadow'><iframe width={'100%'} height={400} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7569.514874435449!2d73.83371569325136!3d18.44931925435448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc295ab02a30c95%3A0xd99c88780ad5cc44!2sASTON%20PLAZA%20(SKP%20CORP)!5e0!3m2!1sen!2sin!4v1767786408006!5m2!1sen!2sin" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
                            </div>
                        </Col>
                    </Row>

                </Container>
            </section>
            <FooterBar />
        </>
    )
}

export default Contact
