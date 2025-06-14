import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Col, Container, Row, Button, Form } from 'react-bootstrap';

import { AiOutlinePhone } from 'react-icons/ai';
import './css/doctor.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CiLock } from 'react-icons/ci';
import DoctorTestimonial from './DoctorTestimonial';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const DoctorLogin = () => {
    
    var navigate = useNavigate();

    // var logindata;

    useEffect(()=>{
        var data = JSON.parse(localStorage.getItem('doctordata'));
        // console.log('logindata = ', data)
        if(!data){
            navigate('/doctor')
        }
        else{
            navigate('doctordashboard')
        }

    },[navigate])

    var frmdata = {email:'',password:''}
    const [frmdoctor,setfrmdoctor] = useState(frmdata);

    function selfrmdata(e){
        const { name, value } = e.target;
        setfrmdoctor(frmdoctor => ({
            ...frmdoctor,
            [name]: value
        }));
    }

    function logindoctor(){
        console.log(frmdoctor)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/login',
            data: frmdoctor
        }).then((res) => {
            toast('Doctor Login successfully...',{className:'custom-toast-success'})
            // console.log(res)
            localStorage.setItem('doctordata',JSON.stringify(res))
            navigate('doctordashboard')
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message,{className:'custom-toast-error'})
        });
    }
    
    return (
        <div className='min-vh-100 d-flex align-items-center'>
            <Container className='py-3'>
                <Row className='align-items-center'>
                    <DoctorTestimonial/>
                    <Col md={5}>
                        <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                            <div className='text-center'>
                                <h3>Sign In</h3>
                                <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                            </div>
                            <Form>

                                <Form.Group controlId="mobile" className='position-relative mb-3'>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control placeholder="Enter Email" name='email' value={frmdoctor.email} className='frm_input' onChange={selfrmdata} />
                                    <AiOutlinePhone className='icon_input' />
                                </Form.Group>

                                <Form.Group controlId="password" className='position-relative mb-1'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control placeholder="Enter Password" name='password' value={frmdoctor.password} className='frm_input' onChange={selfrmdata} />
                                    <CiLock className='icon_input' />
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
        </div>
    )
}

export default DoctorLogin
