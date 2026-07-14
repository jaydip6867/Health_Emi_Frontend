import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import Loader from '../Loader'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
import CryptoJS from "crypto-js";
import DoctorTestimonial from '../doctor/DoctorTestimonial'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const HospitalLogin = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const [email, setemail] = useState('')
    const [password, setps] = useState('')
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }

        if (!data) {
            navigate('/hospital')
        }
        else {
            navigate('/hospitaldashboard')
        }

    }, [navigate])

    const validateForm = () => {
        let isValid = true;

        // Email Validation
        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
        ) {
            setEmailError('Please enter a valid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        // Password Validation
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    function hospitalsignin() {
        if (!validateForm()) {
            return;
        }
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/hospital/login`,
            data: { "email": email, "password": password }
        }).then((res) => {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(res.data.Data), SECRET_KEY).toString();
            localStorage.setItem(STORAGE_KEYS.HOSPITAL, encrypted)
            navigate('/hospitaldashboard')
        }).catch(function (error) {
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <NavBar />
            <div className='py-5 d-flex align-items-center panel'>
                <Container>
                    <Row className='justify-content-center align-items-center'>
                        <DoctorTestimonial />
                        <Col md={8} lg={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                                <div className='text-center'>
                                    <h3>Hospital - Sign In</h3>
                                    <p>Access your consultations, Surgeries, Ambulance Booking, Manage Your Profile with Health Easy EMI Plateform.</p>
                                </div>
                                <Form>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>

                                        <Form.Control
                                            type="email"
                                            placeholder="Enter Email"
                                            value={email}
                                            className={`frm_input ${emailError ? 'is-invalid' : ''}`}
                                            onChange={(e) => {
                                                setemail(e.target.value);
                                                setEmailError('');
                                            }}
                                        />

                                        {emailError && (
                                            <div className="text-danger mt-1">
                                                {emailError}
                                            </div>
                                        )}
                                    </Form.Group>

                                    <Form.Group controlId="password" className="position-relative mb-1">
                                        <Form.Label>Password</Form.Label>

                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter Password"
                                            value={password}
                                            maxLength={20}
                                            // className={`frm_input ${passwordError ? 'is-invalid' : ''}`}
                                            className={`frm_input`}
                                            onChange={(e) => {
                                                setps(e.target.value);
                                                setPasswordError('');
                                            }}
                                        />

                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: "absolute",
                                                right: "12px",
                                                top: "36px",
                                                cursor: "pointer",
                                                color: "#555",
                                            }}
                                        >
                                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </span>

                                        {passwordError && (
                                            <div className="text-danger mt-1">
                                                {passwordError}
                                            </div>
                                        )}
                                    </Form.Group>
                                    <div className='form_bottom_div text-end'>
                                        <p><Link to={'forgotpatient'} className='form-link'>Forgot Password ?</Link> </p>
                                    </div>

                                    <Button onClick={hospitalsignin} type="button" className='btn btn-primary d-block w-100 theme_btn mt-4'>
                                        Sign In
                                    </Button>
                                </Form>
                                <div className='form_bottom_div text-center mt-3'>
                                    <p>Don't have an Account? <Link to={'/hospitalregister'} className='form-link'>Sign Up</Link> </p>
                                </div>
                            </div>
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

export default HospitalLogin