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

const PatientLogin = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [email, setemail] = useState('')
    const [password, setps] = useState('')

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }

        if (!data) {
            navigate('/patient')
        }
        else {
            navigate('patientprofile')
        }

    }, [navigate])

    function patientsignin() {
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/user/login`,
            data: { "email": email, "password": password }
        }).then((res) => {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(res.data.Data), SECRET_KEY).toString();
            localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted)
            navigate('/')
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
                                    <h3>Patient - Sign In</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control placeholder="Enter Email" name='email' value={email} className='frm_input' onChange={(e) => setemail(e.target.value)} />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-1'>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type='password' placeholder="Enter Password" name='password' value={password} className='frm_input' onChange={(e) => setps(e.target.value)} />
                                    </Form.Group>
                                    <div className='form_bottom_div text-end'>
                                        <p><Link to={'forgotpatient'} className='form-link'>Forgotten Password ?</Link> </p>
                                    </div>

                                    <Button onClick={patientsignin} type="button" className='btn btn-primary d-block w-100 theme_btn mt-4'>
                                        Sign In
                                    </Button>
                                </Form>
                                <div className='form_bottom_div text-center mt-3'>
                                    <p>Don't have an Account? <Link to={'/patientregister'} className='form-link'>Sign Up</Link> </p>
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

export default PatientLogin