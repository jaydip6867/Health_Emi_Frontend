import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import './css/doctor.css';
import { AiOutlinePhone, AiOutlineUser } from 'react-icons/ai';
import { FaRegEnvelope } from 'react-icons/fa';
import { CiLock, CiLocationOn } from 'react-icons/ci';
import { Link, Navigate } from 'react-router-dom';
import DoctorTestimonial from './DoctorTestimonial';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const DoctorRegister = () => {

    const [doc_reg, setdocreg] = useState(true);
    const [doc_otp, setdocotp] = useState(false);
    const [doc_reg2, setdocreg2] = useState(false);
    const [doc_next1, setdocnext1] = useState(false);

    var frmdata = {
        name: '',
        email: '',
        gender: '',
        mobile: '',
        pincode: '',
        password: '',
    }
    const [frmdoctor, setfrmdoctor] = useState(frmdata);

    function checkotpverify() {
        console.log(frmdoctor)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/signup',
            data: frmdoctor
        }).then((res) => {
            toast('doctor register successfully...',{className:'custom-toast-success'})
            setdocreg(false);
            setdocotp(true);
        }).catch(function (error) {
            // console.log(error.response.data);
            toast(error.response.data.Message,{className:'custom-toast-error'})
        });
    }

    const [otp,setotp]=useState('');

    function otpverifydone() {
        console.log(frmdoctor)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/signup/otpverification',
            data: {
                "email":frmdoctor.email,
                "otp":otp
            }
        }).then((res) => {
            toast('otp verify successfully...',{className:'custom-toast-success'})
            Navigate('/doctor')
        }).catch(function (error) {
            console.log(error);
            toast(error,{className:'custom-toast-error'})
        });
        // setdocotp(false);
        // setdocreg2(true);
    }

    function next1() {
        setdocreg2(false);
        setdocnext1(true);
    }

    const selfrmdata = (e) => {
        const { name, value } = e.target;
        setfrmdoctor(frmdoctor => ({
            ...frmdoctor,
            [name]: value
        }));
    };

    var doctor_testimonial = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
    };
    return (
        <div className='min-vh-100 d-flex align-items-center'>
            <Container className='py-3'>
                <Row>
                    <DoctorTestimonial />
                    {
                        doc_reg === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Signup</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>
                                    <Form.Group as={Col} controlId="fullname" className='position-relative mb-3'>
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" placeholder="Full Name" className='frm_input' name="name" value={frmdoctor.name} onChange={selfrmdata} />
                                        <AiOutlineUser className='icon_input' />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="email" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" placeholder="Email" className='frm_input' name="email" value={frmdoctor.email} onChange={selfrmdata} />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Mobile No.</Form.Label>
                                        <Form.Control placeholder="Mobile No." className='frm_input' name='mobile' value={frmdoctor.mobile} onChange={selfrmdata} />
                                        <AiOutlinePhone className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="gender" className='position-relative mb-3'>
                                        <Form.Label>Gender </Form.Label>
                                        <div className='d-flex gap-3'>
                                            <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' onChange={selfrmdata} /> Male</label>
                                            <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' onChange={selfrmdata} /> Female</label>
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Pincode</Form.Label>
                                        <Form.Control placeholder="Pincode" className='frm_input' name='pincode' value={frmdoctor.pincode} onChange={selfrmdata} />
                                        <CiLocationOn className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control placeholder="Password" className='frm_input' name='password' value={frmdoctor.password} onChange={selfrmdata} />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    {/* <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control placeholder="Confirm Password" />
                                        <CiLock className='icon_input' />
                                    </Form.Group> */}

                                    <Button type="button" onClick={checkotpverify} className='d-block w-100 theme_btn mt-3'>
                                        Get OTP
                                    </Button>
                                </Form>
                                <div className='form_bottom_div text-center mt-3'>
                                    <p>Already have an Account? <Link to={'/doctor'} className='form-link'>Login</Link> </p>
                                </div>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_otp === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100'>
                                <div className='text-center'>
                                    <h3>OTP Verification</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                    <Form>
                                        <Form.Group as={Col} controlId="fullname" className='position-relative my-3'>
                                            <Form.Control type="text" name='otp' value={otp} onChange={(e)=>setotp(e.target.value)} placeholder="Ex:- 1234" className='otpfield' pattern='[0-9]{4}' />
                                        </Form.Group>
                                    </Form>
                                    <div className='form_bottom_div text-end mt-3'>
                                        <p><Link className='form-link'>Resend OTP ?</Link> </p>
                                    </div>
                                </div>

                                <Button type="button" onClick={otpverifydone} className='d-block w-100 theme_btn my-3'>
                                    Verify OTP
                                </Button>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_reg2 === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Signup</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>
                                    <Form.Group as={Col} controlId="fullname" className='position-relative mb-3'>
                                        <Form.Label>Speciality</Form.Label>
                                        <Form.Control type="text" placeholder="Speciality" />
                                        <AiOutlineUser className='icon_input' />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="email" className='position-relative mb-3'>
                                        <Form.Label>Sub Speciality</Form.Label>
                                        <Form.Control type="email" placeholder="Sub Speciality" />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Degree Registration No.</Form.Label>
                                        <Form.Control placeholder="Degree Registration No." />
                                        <AiOutlinePhone className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Qualification</Form.Label>
                                        <Form.Control placeholder="Qualification" />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Experience</Form.Label>
                                        <Form.Control placeholder="Experience" />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    <Button type="button" onClick={() => { next1() }} className='d-block w-100 theme_btn my-3'>
                                        Next
                                    </Button>
                                </Form>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_next1 === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Signup</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>
                                    <Form.Group as={Col} controlId="fullname" className='position-relative mb-3'>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control type="text" placeholder="Country" />
                                        <AiOutlineUser className='icon_input' />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="email" className='position-relative mb-3'>
                                        <Form.Label>State</Form.Label>
                                        <Form.Control type="text" placeholder="State" />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control placeholder="Country" />
                                        <AiOutlinePhone className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Pincode</Form.Label>
                                        <Form.Control placeholder="Pincode" />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Upload Identify Document</Form.Label>
                                        <Form.Control type="file" placeholder="Experience" className='upload_file_doc' />
                                    </Form.Group>

                                    <Link type="button" to={'/doctor'} className='btn btn-primary d-block w-100 theme_btn my-3'>
                                        Next
                                    </Link>
                                </Form>
                            </div>
                        </Col> : ''
                    }
                </Row>
            </Container>
            <ToastContainer />
        </div>
    )
}

export default DoctorRegister
