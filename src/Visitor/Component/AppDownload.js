import React from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import { FaGooglePlay } from 'react-icons/fa'

const AppDownload = () => {
    return (
        <>
            <section >
                <Container className='border-top border-secondary-subtle py-5'>
                    <Row className='align-items-center justify-content-center g-4'>
                        <Col xs={12} sm={6} md={5}>
                            <div className='text-center text-sm-start'>
                                <img src={require('../../assets/image/call-patient-half.png')} className="img-fluid shadow-img" />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                            <h2>Download the Health app</h2>
                            <p className='py-4'>
                                Access video consultation with India’s top doctors on the Practo app. Connect with doctors online, available 24/7, from the comfort of your home.
                            </p>
                            <div>
                                <p className='text-secondary'>Get the link to download the app</p>
                                <Form className='d-flex mb-3'>
                                    <div className="input-container">
                                        <div className="country-code">+91</div>
                                        <input type="tel" placeholder="Enter phone number" />
                                    </div>
                                    <button className="button primary send-app-link-button">Send app link</button>
                                </Form>
                                <div className='app_btn d-flex'>
                                    <a className='btn btn-dark'><FaGooglePlay /> Google Play</a>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}

export default AppDownload