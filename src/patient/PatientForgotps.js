import React, { useState } from 'react'
import { Button, Col, Container, Form, Row, ToastContainer } from 'react-bootstrap'
import { CiLock } from 'react-icons/ci';
import { FaRegEnvelope } from 'react-icons/fa';
import Loader from '../Loader'
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';
import NavBar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';

const PatientForgotps = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient_email, setpatient_email] = useState(true);
    const [patient_forgt_otp, setpatient_forgt_otp] = useState(false);
    const [patient_reset_ps, setdoc_rest_ps] = useState(false);

    const [email, setemail] = useState('')
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

    const [otp, setotp] = useState("");
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow single digit
        if (value.length > 1) return;

        // Only allow numbers
        if (value && !/^[0-9]$/.test(value)) return;

        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);

        // Update the main otp variable
        const otpString = newOtpDigits.join("");
        setotp(otpString);

        // Auto focus to next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
                const newOtpDigits = [...otpDigits];
                newOtpDigits[index - 1] = "";
                setOtpDigits(newOtpDigits);
                setotp(newOtpDigits.join(""));
            }
        }
    };

    return (
        <>
            <NavBar />
            <div className='spacer-y d-flex align-items-center panel'>
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
                                    <div className="register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100">
                                        <div className="text-center">
                                            <h3>OTP Verification</h3>
                                            <p className="w-75 mx-auto">
                                                Lorem Ipsum is simply dummy text of the printing and
                                                typesetting industry
                                            </p>
                                            <Form>
                                                <div className="my-4">
                                                    <Form.Label className="d-block text-center mb-3 fw-bold">
                                                        Enter 6-Digit OTP
                                                    </Form.Label>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {otpDigits.map((digit, index) => (
                                                            <Form.Control
                                                                key={index}
                                                                id={`otp-${index}`}
                                                                type="text"
                                                                value={digit}
                                                                onChange={(e) =>
                                                                    handleOtpChange(index, e.target.value)
                                                                }
                                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                                className="text-center fw-bold border-2"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    fontSize: "20px",
                                                                    borderRadius: "8px",
                                                                }}
                                                                maxLength="1"
                                                            />
                                                        ))}
                                                    </div>
                                                    <small className="d-block text-center text-muted mt-2">
                                                        Enter the 6-digit code sent to your email
                                                    </small>
                                                </div>
                                            </Form>
                                            <div className="form_bottom_div text-end mt-3">
                                                <p>
                                                    <Link className="form-link">Resend OTP ?</Link>{" "}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={otpverifydone}
                                            className="d-block w-100 theme_btn my-3"
                                            disabled={otp.length !== 6}
                                        >
                                            {otp.length === 6
                                                ? "Verify OTP"
                                                : `Enter ${6 - otp.length} more digit${6 - otp.length > 1 ? "s" : ""
                                                }`}
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
                                            </Form.Group>

                                            <Button type="button" onClick={resetps} className='d-block w-100 theme_btn my-3 mt-4'>
                                                Reset Password
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
            <FooterBar />
        </>
    )
}

export default PatientForgotps