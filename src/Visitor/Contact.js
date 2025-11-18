import React, { useEffect } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Contact = () => {

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
    useEffect(() => {
        document.title = "Contact Health Easy EMI - Get In Touch Doctor And Patient"
    }, [])
    return (
        <>
            <NavBar logindata={patient} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Contact Us</h2>
                </Container>
            </section>
            {/* contact form */}
            <section className='py-5 my-4'>
                <Container>
                    <Row>
                        <Col xs={12} md={6}>
                            <h3>Contact Us</h3>
                            <Form className='mt-4 '>
                                <Form.Group controlId="name" className='mb-3'>
                                    <Form.Label>Name <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="name" name='name' placeholder="Enter Your Name" />
                                </Form.Group>

                                <Form.Group controlId="email" className='mb-3'>
                                    <Form.Label>Email <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="email" name='email' placeholder="Enter Your Email" />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="message">
                                    <Form.Label>Message <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control as={'textarea'} placeholder="Message" />
                                </Form.Group>

                                <Button variant="primary" type="button" className='btn-theme'>
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className='h-100 border'>
                                <div className='h-100 shadow'><iframe width="100%" height="100%" title="map" src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=varachha%20road+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.mapsdirections.info/fr/calculer-la-population-sur-une-carte">Carte démographique</a></iframe></div>
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
