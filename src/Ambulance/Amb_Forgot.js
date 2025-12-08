import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import NavBar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../Loader';
import { API_BASE_URL } from '../config';

const Amb_Forgot = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false);

    const [amb_email, setamb_email] = useState(true);
    const [amb_forgt_otp, setamb_forgt_otp] = useState(false);
    const [amb_reset_ps, setamb_rest_ps] = useState(false);

    const [email, setemail] = useState('')
    const [otp, setotp] = useState('')
    const [newps, setnewps] = useState('')

    function emailotpforgot() {
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/ambulance/forgetpassword`,
            data: {
                "email": email,
            }
        }).then((res) => {
            toast('OTP sent To your email...', { className: 'custom-toast-success' })
            setamb_email(false);
            setamb_forgt_otp(true);
        }).catch(function (error) {
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });

    }

    function otpverifydone() {
        axios({
            method: 'post',
            url: `${API_BASE_URL}/ambulance/forgetpassword/verifyotp`,
            data: {
                "email": email,
                "otp": otp
            }
        }).then((res) => {
            toast('OTP Verify Successfully', { className: 'custom-toast-success' })
            setamb_forgt_otp(false);
            setamb_rest_ps(true);
        }).catch(function (error) {
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        });
    }

    function resetps() {
        axios({
            method: 'post',
            url: `${API_BASE_URL}/ambulance/forgetpassword/setpassword`,
            data: {
                "email": email,
                "password": newps
            }
        }).then((res) => {
            toast('Password Reset Successfully', { className: 'custom-toast-success' })
            navigate('/ambulance')
        }).catch(function (error) {
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        });
    }

    return (
        <>
            <NavBar />
            <div className='min-vh-100 d-flex align-items-center panel'>
                <Container className='py-3'>
                    <Row className='align-items-center justify-content-center'>
                        {
                            amb_email === true ? <Col md={5}>
                                <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                    <div className='text-center'>
                                        <h3>Forgot Password - Ambulance</h3>
                                        <p className='w-75 mx-auto'>Enter your registered email to receive a secure OTP and reset your password.</p>
                                    </div>
                                    <Form>

                                        <Form.Group controlId="Email" className='position-relative mb-3'>
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control placeholder="Email Address" name='email' value={email} onChange={(e) => setemail(e.target.value)} className='frm_input' />
                                        </Form.Group>

                                        <Button type="button" onClick={emailotpforgot} className='d-block w-100 theme_btn my-3 mt-4'>
                                            Send OTP
                                        </Button>
                                    </Form>
                                </div>
                            </Col> : ''
                        }
                        {
                            amb_forgt_otp === true ? <Col md={5}>
                                <div className='register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100'>
                                    <div className='text-center'>
                                        <h3>OTP Verification</h3>
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
                            amb_reset_ps === true ? <Col md={5}>
                                <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                    <div className='text-center'>
                                        <h3>Set New Password</h3>
                                    </div>
                                    <Form>

                                        <Form.Group controlId="password" className='position-relative mb-3'>
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control type='password' placeholder="New Password" name='newpassword' value={newps} onChange={(e) => setnewps(e.target.value)} className='frm_input' />
                                        </Form.Group>

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
                {loading ? <Loader /> : ''}
            </div>
            <FooterBar />
        </>
    )
}

export default Amb_Forgot;
