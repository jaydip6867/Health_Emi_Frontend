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

    const [mobile, setmobile] = useState('')
    const [otp, setotp] = useState('')
    const [newps, setnewps] = useState('')
    
    const validateMobile = (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };
    
    const handleMobileChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setmobile(value);
        }
    };

    function mobileotpforgot() {
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/ambulance/forgetpassword`,
            data: {
                "mobile": mobile,
            }
        }).then((res) => {
            toast('OTP sent To your mobile...', { className: 'custom-toast-success' })
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
                "mobile": mobile,
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
                "mobile": mobile,
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
            <div className='py-5 d-flex align-items-center panel'>
                <Container className='py-3'>
                    <Row className='align-items-center justify-content-center'>
                        {
                            amb_email === true ? <Col md={5}>
                                <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                    <div className='text-center'>
                                        <h3>Forgot Password - Ambulance</h3>
                                        <p className='w-75 mx-auto'>Enter your registered mobile number to receive a secure OTP and reset your password.</p>
                                    </div>
                                    <Form>

                                        <Form.Group controlId="Mobile" className='position-relative mb-3'>
                                            <Form.Label>Mobile Number</Form.Label>
                                            <Form.Control 
                                                placeholder="Mobile Number" 
                                                name='mobile' 
                                                value={mobile} 
                                                onChange={handleMobileChange} 
                                                className='frm_input' 
                                                maxLength={10}
                                                isInvalid={mobile && !validateMobile(mobile)}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Please enter a valid 10-digit mobile number starting with 6-9
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Button type="button" onClick={mobileotpforgot} className='d-block w-100 theme_btn my-3 mt-4' disabled={!validateMobile(mobile)}>
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
                                            <p><Link className='form-link' onClick={mobileotpforgot}>Resend OTP ?</Link> </p>
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
