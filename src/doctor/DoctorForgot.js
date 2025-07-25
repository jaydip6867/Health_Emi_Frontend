import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import Slider from 'react-slick';
import './css/doctor.css';
import { Link, useNavigate } from 'react-router-dom';
import { CiLock } from 'react-icons/ci';
import { FaRegEnvelope } from 'react-icons/fa';
import DoctorTestimonial from './DoctorTestimonial';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../Loader';

const DoctorForgot = () => {

    var navigate = useNavigate();
    const [loading,setloading] = useState(false);

    const [doc_email, setdoc_email] = useState(true);
    const [doc_forgt_otp, setdoc_forgt_otp] = useState(false);
    const [doc_reset_ps, setdoc_rest_ps] = useState(false);

    const [email, setemail] = useState('')
    const [otp, setotp] = useState('')
    const [newps, setnewps] = useState('')
    // const [cfmps, setcfmps] = useState('')

    function emailotpforgot() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/forgetpassword',
            data: {
                "email": email,
            }
        }).then((res) => {
            toast('OTP sent To your email...', { className: 'custom-toast-success' })
            // console.log(res)
            setdoc_email(false);
            setdoc_forgt_otp(true);
        }).catch(function (error) {
            console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(()=>{
            setloading(false)
        });

    }

    function otpverifydone() {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/forgetpassword/verifyotp',
            data: {
                "email": email,
                "otp": otp
            }
        }).then((res) => {
            toast('OTP Verify Successfully...', { className: 'custom-toast-success' })
            console.log(res)
            setdoc_forgt_otp(false);
            setdoc_rest_ps(true);
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        });
    }

    function resetps() {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/forgetpassword/setpassword',
            data: {
                "email": email,
                "password": newps
            }
        }).then((res) => {
            toast('Password Reset Successfully...', { className: 'custom-toast-success' })
            // console.log(res)
            navigate('/doctor')
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        });
    }

    return (
        <div className='min-vh-100 d-flex align-items-center panel'>
            <Container className='py-3'>
                <Row className='align-items-center'>
                    <DoctorTestimonial />
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
                                        <Form.Control placeholder="Email Address" name='email' value={email} onChange={(e) => setemail(e.target.value)} className='frm_input' />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Button type="button" onClick={emailotpforgot} className='d-block w-100 theme_btn my-3 mt-4'>
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
                                            <Form.Control type="text" name='otp' value={otp} onChange={(e) => setotp(e.target.value)} placeholder="Ex:- 1234" className='otpfield' />
                                        </Form.Group>
                                    </Form>
                                    <div className='form_bottom_div text-end mt-3'>
                                        <p><Link className='form-link' onClick={emailotpforgot}>Resend OTP ?</Link> </p>
                                    </div>
                                </div>

                                <Button type="button" onClick={otpverifydone} className='d-block w-100 theme_btn my-3'>
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
                                        <Form.Control type='password' placeholder="New Password" name='newpassword' value={newps} onChange={(e) => setnewps(e.target.value)} className='frm_input' />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    {/* <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control type='password' placeholder="Confirm Password" name='confirmpassword' value={cfmps} onChange={(e) => setcfmps(e.target.value)} className='frm_input' />
                                        <CiLock className='icon_input' />
                                    </Form.Group> */}

                                    <Button type="button" onClick={resetps} className='d-block w-100 theme_btn my-3 mt-4'>
                                        Continue To Sign In
                                    </Button>
                                </Form>
                            </div>
                        </Col> : ''
                    }

                </Row>
            </Container>
            <ToastContainer />
            {loading ? <Loader/> : ''}
        </div>
    )
}

export default DoctorForgot
