import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import '../doctor/css/doctor.css'
import { Link, useNavigate } from 'react-router-dom'
import { CiLock } from 'react-icons/ci'
import { FaRegEnvelope } from 'react-icons/fa'
import Loader from '../Loader'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
import CryptoJS from "crypto-js";

const AdminLogin = () => {
    const SECRET_KEY = "health-emi";

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [email, setemail] = useState('')
    const [password, setps] = useState('')

    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthadmincredit');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/healthadmin')
        }
        else {
            navigate('admindashboard')
        }

    }, [navigate])

    const adminsign = async () => {
        setloading(true)
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/admin/login',
            data: { "email": email, "password": password }
        }).then((res) => {
            // console.log(res)
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(res.data.Data), SECRET_KEY).toString();
            localStorage.setItem('healthadmincredit', encrypted)
            navigate('admindashboard')
        }).catch(function (error) {
            console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }
    return (
        <>
            <div className='min-vh-100 d-flex align-items-center panel'>
                <Container className='py-3'>
                    <Row className='justify-content-center'>
                        <Col xs={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                                <div className='text-center'>
                                    <h3>Admin - Sign In</h3>
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

                                    <Button onClick={adminsign} type="button" className='btn btn-primary d-block w-100 theme_btn mt-4'>
                                        Sign In
                                    </Button>
                                </Form>
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

export default AdminLogin
