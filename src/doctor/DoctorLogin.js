import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import Slider from 'react-slick';
import { AiOutlinePhone } from 'react-icons/ai';
import './css/doctor.css';
import { Link } from 'react-router-dom';
import { CiLock } from 'react-icons/ci';

const DoctorLogin = () => {
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
                    <Col md={5}>
                        <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                            <div className='text-center'>
                                <h3>Sign In</h3>
                                <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                            </div>
                            <Form>

                                <Form.Group controlId="mobile" className='position-relative mb-3'>
                                    <Form.Label>Mobile No.</Form.Label>
                                    <Form.Control placeholder="Mobile No." />
                                    <AiOutlinePhone className='icon_input' />
                                </Form.Group>

                                <Form.Group controlId="password" className='position-relative mb-1'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control placeholder="Password" />
                                    <CiLock className='icon_input' />
                                </Form.Group>
                                <div className='form_bottom_div text-end'>
                                    <p><Link to={'/DoctorForgot'} className='form-link'>Forgotten Password ?</Link> </p>
                                </div>

                                <Link to={'/Doctor_Dashboard'} type="button" className='btn btn-primary d-block w-100 theme_btn mt-4'>
                                    Sign In
                                </Link>
                            </Form>
                            <div className='form_bottom_div text-center mt-3'>
                                <p>Don't have an Account? <Link to={'/'} className='form-link'>Sign Up</Link> </p>
                            </div>
                        </div>
                    </Col>

                </Row>
            </Container>
        </div>
    )
}

export default DoctorLogin
