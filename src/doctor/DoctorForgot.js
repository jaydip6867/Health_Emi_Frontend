import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import Slider from 'react-slick';
import './css/doctor.css';
import { Link } from 'react-router-dom';
import { CiLock } from 'react-icons/ci';
import { FaRegEnvelope } from 'react-icons/fa';

const DoctorForgot = () => {

    const [doc_email, setdoc_email] = useState(true);
    const [doc_forgt_otp, setdoc_forgt_otp] = useState(false);
    const [doc_reset_ps, setdoc_rest_ps] = useState(false);

    function emailotpforgot(){
        setdoc_email(false);
        setdoc_forgt_otp(true);
    }

    function otpverifydone(){
        setdoc_forgt_otp(false);
        setdoc_rest_ps(true);
    }

    var doctor_testimonial = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
    };
    return (
        <div className='min-vh-100 d-flex align-items-center'>
            <Container className='py-3'>
                <Row className='align-items-center'>
                    <Col md={{ span: 5, offset: 1 }} className="d-none d-md-block">
                        <Slider {...doctor_testimonial} className='slider_doctor'>
                            <div className='item text-center'>
                                <img src={require('./assets/doctor_testimonial_1.png')} />
                                <div className='doctor_testi_content'>
                                    <h4>Thousands of Specialists</h4>
                                    <p>Get medical advice and treatment service from Specialists doctor from any time</p>
                                </div>
                            </div>
                            <div className='item text-center'>
                                <img src={require('./assets/doctor_testimonial_1.png')} />
                                <div className='doctor_testi_content'>
                                    <h4>Thousands of Specialists</h4>
                                    <p>Get medical advice and treatment service from Specialists doctor from any time</p>
                                </div>
                            </div>
                            <div className='item text-center'>
                                <img src={require('./assets/doctor_testimonial_1.png')} />
                                <div className='doctor_testi_content'>
                                    <h4>Thousands of Specialists</h4>
                                    <p>Get medical advice and treatment service from Specialists doctor from any time</p>
                                </div>
                            </div>

                        </Slider>
                    </Col>
                    {
                        doc_email === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Forgot Password</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>

                                    <Form.Group controlId="Email" className='position-relative mb-3'>
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control placeholder="Email Address" />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Button type="button" onClick={() => { emailotpforgot()}} className='d-block w-100 theme_btn my-3 mt-4'>
                                        Send OTP
                                    </Button>
                                </Form>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_forgt_otp === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100'>
                                <div className='text-center'>
                                    <h3>OTP Verification</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                    <Form>
                                        <Form.Group as={Col} controlId="fullname" className='position-relative my-3'>
                                            <Form.Control type="text" placeholder="Ex:- 1234" className='otpfield' />
                                        </Form.Group>
                                    </Form>
                                    <div className='form_bottom_div text-end mt-3'>
                                        <p><Link className='form-link'>Resend OTP ?</Link> </p>
                                    </div>
                                </div>

                                <Button type="button" onClick={() => { otpverifydone() }} className='d-block w-100 theme_btn my-3'>
                                    Verify OTP
                                </Button>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_reset_ps === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>New Password</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>New Password</Form.Label>
                                        <Form.Control type='password' placeholder="New Password" />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control type='password' placeholder="Confirm Password" />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    <Button type="button" className='d-block w-100 theme_btn my-3 mt-4'>
                                        Continue To Sign In
                                    </Button>
                                </Form>
                            </div>
                        </Col> : ''
                    }

                </Row>
            </Container>
        </div>
    )
}

export default DoctorForgot
