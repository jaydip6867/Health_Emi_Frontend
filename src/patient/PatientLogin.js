import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import '../doctor/css/doctor.css'
import { Link, useNavigate } from 'react-router-dom'
import { CiLock } from 'react-icons/ci'
import { FaRegEnvelope } from 'react-icons/fa'
import Loader from '../Loader'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'

const PatientLogin = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [email, setemail] = useState('')
    const [password, setps] = useState('')

    useEffect(() => {
        var data = JSON.parse(localStorage.getItem('PatientLogin'));
        if (!data) {
            navigate('/patient')
        }
        else {
            navigate('patientdahsboard')
        }

    }, [navigate])

    function patientsignin() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/login',
            data: { "email": email, "password": password }
        }).then((res) => {
            console.log(res)
            localStorage.setItem('PatientLogin', JSON.stringify(res.data.Data))
            toast(res.data.Message, { className: 'custom-toast-success' });
            navigate('patientdahsboard')
        }).catch(function (error) {
            console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <div className='min-vh-100 d-flex align-items-center'>
                <Container className='py-3'>
                    <Row className='justify-content-center'>
                        <Col xs={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                                <div className='text-center'>
                                    <h3>Patient - Sign In</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control placeholder="Enter Email" name='email' value={email} className='frm_input' onChange={(e) => setemail(e.target.value)} />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-1'>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type='password' placeholder="Enter Password" name='password' value={password} className='frm_input' onChange={(e) => setps(e.target.value)} />
                                        <CiLock className='icon_input' />
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
        </>
    )
}

export default PatientLogin