import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import NavBar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';
import './css/doctor.css';
import { Link, useNavigate } from 'react-router-dom';
import DoctorTestimonial from './DoctorTestimonial';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../Loader';
import CryptoJS from "crypto-js";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const DoctorLogin = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/doctor')
        }
        else {
            navigate('doctordashboard')
        }

    }, [navigate])

    var frmdata = { email: '', password: '' }
    const [frmdoctor, setfrmdoctor] = useState(frmdata);

    function selfrmdata(e) {
        const { name, value } = e.target;
        setfrmdoctor(frmdoctor => ({
            ...frmdoctor,
            [name]: value
        }));
    }

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        // Email Validation
        if (!frmdoctor.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(frmdoctor.email)
        ) {
            newErrors.email = 'Please enter a valid email';
            isValid = false;
        }

        // Password Validation
        if (!frmdoctor.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (frmdoctor.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    function selfrmdata(e) {
        const { name, value } = e.target;

        setfrmdoctor(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    }

    const logindoctor = async () => {
        if (!validateForm()) {
            return;
        }
        setloading(true)
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/login`,
            data: frmdoctor
        }).then((res) => {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(res.data.Data), SECRET_KEY).toString();

            localStorage.setItem(STORAGE_KEYS.DOCTOR, encrypted)
            navigate('doctordashboard')
        }).catch(function (error) {
            toast(error?.response?.data?.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <NavBar />
            <div className='min-vh-100 d-flex align-items-center panel'>
                <Container className='py-3'>
                    <Row className='align-items-center justify-content-center'>
                        <DoctorTestimonial />
                        <Col md={8} lg={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3 className='w-75 mx-auto'>Doctor - Sign In</h3>
                                    <p className='mx-auto'>Access your secure dashboard to manage patient consultations, update medical records, review treatment plans, and support EMI-based healthcare with ease.</p>
                                </div>
                                <Form>

                                    <Form.Group controlId="email" className="mb-3">
                                        <Form.Label>Email</Form.Label>

                                        <Form.Control
                                            type="email"
                                            placeholder="Enter Email"
                                            name="email"
                                            value={frmdoctor.email}
                                            className={`frm_input ${errors.email ? 'is-invalid' : ''}`}
                                            onChange={selfrmdata}
                                        />

                                        {errors.email && (
                                            <div className="text-danger mt-1">
                                                {errors.email}
                                            </div>
                                        )}
                                    </Form.Group>

                                    <Form.Group controlId="password" className="position-relative mb-1">
                                        <Form.Label>Password</Form.Label>

                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter Password"
                                            name="password"
                                            value={frmdoctor.password}
                                            maxLength={20}
                                            className={`frm_input ${errors.password ? 'is-invalid' : ''}`}
                                            onChange={selfrmdata}
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
                                            {showPassword ? (
                                                <FaEyeSlash size={18} />
                                            ) : (
                                                <FaEye size={18} />
                                            )}
                                        </span>

                                        {errors.password && (
                                            <div className="text-danger mt-1">
                                                {errors.password}
                                            </div>
                                        )}
                                    </Form.Group>
                                    <div className='form_bottom_div text-end'>
                                        <p><Link to={'forgotdoctor'} className='form-link'>Forgot Password ?</Link> </p>
                                    </div>

                                    <Button onClick={logindoctor} type="button" className='btn btn-primary d-block w-100 theme_btn mt-4'>
                                        Sign In
                                    </Button>
                                </Form>
                                <div className='form_bottom_div text-center mt-3'>
                                    <p>Don't have an Account? <Link to={'doctorregister'} className='form-link'>Sign Up</Link> </p>
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

export default DoctorLogin
