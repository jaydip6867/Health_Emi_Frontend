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

const DoctorLogin = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

 
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

    const logindoctor = async () => {
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
                                    <h3>Doctor - Sign In</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control placeholder="Enter Email" name='email' value={frmdoctor.email} className='frm_input' onChange={selfrmdata} />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-1'>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type='password' placeholder="Enter Password" name='password' value={frmdoctor.password} className='frm_input' onChange={selfrmdata} />
                                    </Form.Group>
                                    <div className='form_bottom_div text-end'>
                                        <p><Link to={'forgotdoctor'} className='form-link'>Forgotten Password ?</Link> </p>
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
