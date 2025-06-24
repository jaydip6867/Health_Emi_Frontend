import React, { useState } from 'react'
import { Button, Col, Container, Form, Row, ToastContainer } from 'react-bootstrap'
import { CiLock } from 'react-icons/ci';
import { FaRegEnvelope } from 'react-icons/fa';
import Loader from '../Loader'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';

const PatientForgotps = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient_email, setpatient_email] = useState(true);
    const [patient_forgt_otp, setpatient_forgt_otp] = useState(false);
    const [patient_reset_ps, setdoc_rest_ps] = useState(false);

    const [email, setemail] = useState('')
    const [otp, setotp] = useState('')
    const [newps, setnewps] = useState('')
    // const [cfmps, setcfmps] = useState('')

    function emailotpforgot() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/forgetpassword',
            data: {
                "email": email,
            }
        }).then((res) => {
            toast('OTP sent To your email...', { className: 'custom-toast-success' })
            // console.log(res)
            setpatient_email(false);
            setpatient_forgt_otp(true);
        }).catch(function (error) {
            console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });

    }

    function otpverifydone() {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/forgetpassword/verifyotp',
            data: {
                "email": email,
                "otp": otp
            }
        }).then((res) => {
            toast('OTP Verify Successfully...', { className: 'custom-toast-success' })
            console.log(res)
            setpatient_forgt_otp(false);
            setdoc_rest_ps(true);
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        });
    }

    function resetps() {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/forgetpassword/setpassword',
            data: {
                "email": email,
                "password": newps
            }
        }).then((res) => {
            Swal.fire({
                title: 'Password Reset successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed || result.isDismissed) {
                    navigate('/patient'); // Navigate to home page
                }
            });
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        });
    }

    return (
        <>
            <div className='min-vh-100 d-flex align-items-center'>
                <Container className='py-3'>
                    <Row className='justify-content-center'>
                        <Col xs={5}>
                            {
                                patient_email === true ?
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

                                            <div className='form_bottom_div text-center mt-3'>
                                                <p><Link to={'/patient'} className='form-link'>Sign In</Link> </p>
                                            </div>
                                        </Form>
                                    </div> : ''
                            }
                            {
                                patient_forgt_otp === true ?
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
                                                <p><Link className='form-link'>Resend OTP ?</Link> </p>
                                            </div>
                                        </div>

                                        <Button type="button" onClick={otpverifydone} className='d-block w-100 theme_btn my-3'>
                                            Verify OTP
                                        </Button>
                                    </div> : ''
                            }
                            {
                                patient_reset_ps === true ?
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
                                    </div> : ''
                            }
                        </Col>
                    </Row>
                </Container>
                <ToastContainer />
                {loading ? <Loader /> : ''}
            </div>
        </>
    )
}

export default PatientForgotps